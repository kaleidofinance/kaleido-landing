# Atlas connection string (old database)
$ATLAS_URI = "mongodb+srv://mustaphadauda282:KoeThtLwzPzRV9SP@cluster0.ji0ww.mongodb.net/Kaleido"

# New database connection string
$NEW_DB_URI = "mongodb://kaleidoUser:NvxXBuTE6kn29UbKAcFzPDG8C@127.0.0.1:27017/kaleido?authSource=kaleido"

# Create backup directory
$BACKUP_DIR = ".\mongodb-backup"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Step 1: Dump data from Atlas
Write-Host "Dumping data from MongoDB Atlas..."
mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR"

# Step 2: Restore to new database
Write-Host "Restoring data to new database..."
mongorestore --uri="$NEW_DB_URI" --dir="$BACKUP_DIR\Kaleido"

# Step 3: Verify the migration
Write-Host "Verifying migration..."
mongosh "$NEW_DB_URI" --eval "db.getCollectionNames().forEach(function(c) { print(c + ': ' + db[c].count() + ' documents'); })"

Write-Host "Migration complete!"
