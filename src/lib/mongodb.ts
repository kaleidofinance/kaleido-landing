import { Db, MongoClient, MongoClientOptions, Collection, Document, IndexDescription } from 'mongodb';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ Warning: MONGODB_URI is missing from environment variables');
}

const MONGODB_URI = process.env.MONGODB_URI;
const instanceId = parseInt(process.env.INSTANCE_ID || '0', 10);

// Configure for high concurrency
const options: MongoClientOptions = {
  maxPoolSize: 1000,           // Large pool for high concurrency
  minPoolSize: 50,            // Keep substantial base connections
  maxConnecting: 100,         // Allow more parallel connection attempts
  serverSelectionTimeoutMS: 30000,  // Longer timeout for connection selection
  socketTimeoutMS: 60000,     // Longer socket timeout
  waitQueueTimeoutMS: 10000,  // Wait longer for available connections
  authSource: 'kaleido',
  retryWrites: true,
  writeConcern: {
    w: 'majority',            // Ensure write durability
    wtimeout: 5000           // Reasonable timeout for write concern
  },
  readPreference: 'secondaryPreferred',  // Read from secondaries when possible
  readConcern: { level: 'local' },      // Faster reads with acceptable consistency
  directConnection: false,    // Allow replica set connections
  maxIdleTimeMS: 300000,     // Keep connections alive longer
  compressors: ['zlib'],      // Enable compression
  connectTimeoutMS: 30000,    // Longer connect timeout
  heartbeatFrequencyMS: 10000 // More frequent server checks
};

interface CachedConnection {
  conn: Promise<{
    client: MongoClient;
    db: Db;
  }> | null;
}

// Declare global MongoDB cache
declare global {
  var _mongoCache: { [key: string]: CachedConnection } | undefined;
}

// Initialize cache if it doesn't exist
if (!global._mongoCache) {
  global._mongoCache = {};
}

const cacheKey = `mongo_${instanceId}`;

async function connectToDatabase() {
  // Ensure cache exists
  if (!global._mongoCache) {
    global._mongoCache = {};
  }

  if (!global._mongoCache[cacheKey] || !global._mongoCache[cacheKey].conn) {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    global._mongoCache[cacheKey] = {
      conn: MongoClient.connect(MONGODB_URI, options).then((client) => {
        const db = client.db('kaleido');
        
        // Monitor connection health
        client.on('error', (error) => {
          console.error(`MongoDB connection error in instance ${instanceId}:`, error);
          if (global._mongoCache) {
            global._mongoCache[cacheKey].conn = null;
          }
        });

        client.on('timeout', () => {
          console.warn(`MongoDB connection timeout in instance ${instanceId}`);
          if (global._mongoCache) {
            global._mongoCache[cacheKey].conn = null;
          }
        });

        client.on('close', () => {
          if (global._mongoCache) {
            global._mongoCache[cacheKey].conn = null;
          }
        });

        // Monitor server topology
        client.on('serverDescriptionChanged', (event) => {
          if (event.newDescription.type === 'Unknown') {
            console.warn(`MongoDB server state changed in instance ${instanceId}:`, event);
          }
        });

        // Ensure indexes
        const collection = db.collection('kaleido');
        ensureIndexes(collection).catch(err => {
          console.warn(`Warning: Error ensuring indexes in instance ${instanceId}:`, err);
        });

        return { client, db };
      })
    };
  }

  try {
    if (!global._mongoCache?.[cacheKey]?.conn) {
      throw new Error('Connection not initialized');
    }
    return await global._mongoCache[cacheKey].conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB in instance ${instanceId}:`, error);
    if (global._mongoCache) {
      global._mongoCache[cacheKey].conn = null;
    }
    throw error;
  }
}

interface IndexKey {
  [key: string]: 1 | -1;
}

interface IndexConfig {
  key: IndexKey;
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
  // Allow partial indexes for targeted queries
  partialFilterExpression?: Document;
}

async function ensureIndexes(collection: Collection<Document>) {
  try {
    const existingIndexes = await collection.listIndexes().toArray();
    const indexesToCreate: IndexConfig[] = [
      { 
        key: { walletAddress: 1 }, 
        unique: true,
        sparse: true,
        background: true 
      },
      { 
        key: { referralCode: 1 },
        background: true 
      },
      { 
        key: { lastUpdated: -1 },
        background: true 
      },
      { 
        key: { 'transactions.timestamp': -1 },
        background: true 
      },
      { 
        key: { 'transactions.status': 1, 'transactions.timestamp': -1 },
        background: true 
      },
      {
        // Support leaderboard: users with a profile username, sorted by numeric balance
        key: { balance: -1 },
        background: true,
        partialFilterExpression: { 'xProfile.username': { $exists: true, $type: 'string' }, balance: { $type: 'number' } }
      }
      ,
      {
        // Also support leaderboard entries where xProfile is missing but xUsername is present
        key: { balance: -1 },
        background: true,
        partialFilterExpression: { xUsername: { $exists: true, $type: 'string' }, balance: { $type: 'number' } }
      }
    ];

    for (const index of indexesToCreate) {
      const indexExists = existingIndexes.some((existing: Document) => {
        const existingKey = existing.key as IndexKey;
        return Object.entries(index.key).every(([field, value]) => 
          existingKey[field] === value
        );
      });

      if (!indexExists) {
        const indexOptions: Record<string, any> = { background: true };
        if (index.unique) indexOptions.unique = index.unique;
        if (index.sparse) indexOptions.sparse = index.sparse;
        if (index.partialFilterExpression) {
          indexOptions.partialFilterExpression = index.partialFilterExpression;
        }
        await collection.createIndex(index.key, indexOptions);
      }
    }
  } catch (error) {
    console.warn(`Warning: Error ensuring indexes in instance ${instanceId}:`, error);
  }
}

// Create a separate client promise for routes that need it directly
const clientPromise = MONGODB_URI 
  ? new MongoClient(MONGODB_URI, options).connect()
  : Promise.reject(new Error('MONGODB_URI is not defined'));

export { clientPromise, connectToDatabase };
