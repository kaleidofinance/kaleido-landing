#!/bin/bash

# Atlas connection string (old database)
ATLAS_URI="mongodb+srv://mustaphadauda282:KoeThtLwzPzRV9SP@cluster0.ji0ww.mongodb.net/Kaleido"

# New database connection string
NEW_DB_URI="mongodb://kaleidoUser:NvxXBuTE6kn29UbKAcFzPDG8C@127.0.0.1:27017/kaleido?authSource=kaleido"

# Create backup directory
BACKUP_DIR="/home/kaleidofinance/mongodb-backup"
mkdir -p $BACKUP_DIR

echo "Starting database migration..."

# Step 1: Dump data from Atlas
echo "Dumping data from MongoDB Atlas..."
mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR"

# Step 2: Restore to new database
echo "Restoring data to new database..."
mongorestore --uri="$NEW_DB_URI" --dir="$BACKUP_DIR/Kaleido"

# Step 3: Verify the migration
echo "Verifying migration..."
mongosh "$NEW_DB_URI" --eval "db.getCollectionNames().forEach(function(c) { print(c + ': ' + db[c].count() + ' documents'); })"

echo "Migration complete!"

# Cleanup
echo "Cleaning up temporary files..."
rm -rf $BACKUP_DIR

echo "All done!"
