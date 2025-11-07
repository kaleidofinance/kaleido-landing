// scripts/autoApproveAll.js
// Scheduled job for PM2: Auto-approve eligible content submissions for all users

const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaleido';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kaleidofinance.xyz';

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('kaleido');
  const users = db.collection('kaleido');

  // Find all users with pending, unclaimed content submissions older than 3 hours
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const cursor = users.find({
    contentSubmissions: {
      $elemMatch: {
        status: 'pending',
        rewardClaimed: false,
        submittedAt: { $lte: threeHoursAgo }
      }
    }
  });

  // Collect all users into an array for batching
  const usersToProcess = [];
  for await (const user of cursor) {
    usersToProcess.push(user);
  }
  const BATCH_SIZE = 3;
  const REQUEST_DELAY_MS = 3000; // 3 seconds between requests
  const BATCH_DELAY_MS = 10000;  // 10 seconds between batches
  const RETRY_LIMIT = 3;
  const RETRY_DELAY_MS = 30000; // 30 seconds between retries

  async function processWalletWithRetry(walletAddress) {
    let attempts = 0;
    while (attempts < RETRY_LIMIT) {
      try {
        const res = await fetch(`${API_BASE}/api/content/auto-approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: walletAddress })
        });
        const data = await res.json();
        if (res.ok) {
          console.log(`Auto-approved for wallet ${walletAddress}:`, data);
          return;
        } else if (data && data.error === 'Too many requests') {
          attempts++;
          if (attempts < RETRY_LIMIT) {
            console.warn(`Rate limited for wallet ${walletAddress}, retrying in 30s (attempt ${attempts + 1}/${RETRY_LIMIT})...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          } else {
            console.error(`Failed for wallet ${walletAddress} after ${RETRY_LIMIT} retries:`, data);
            return;
          }
        } else {
          console.error(`Failed for wallet ${walletAddress}:`, data);
          return;
        }
      } catch (err) {
        console.error(`Error auto-approving for wallet ${walletAddress}:`, err);
        return;
      }
    }
  }

  for (let i = 0; i < usersToProcess.length; i += BATCH_SIZE) {
    const batch = usersToProcess.slice(i, i + BATCH_SIZE);
    for (const user of batch) {
      await processWalletWithRetry(user.walletAddress);
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
    }
    // Delay between batches
    if (i + BATCH_SIZE < usersToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  await client.close();
}

main().catch(console.error);
