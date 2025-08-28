#!/bin/bash

# EchoOps CRM - Database Backup Script

set -e

# Configuration
BACKUP_DIR="./backups"
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"echoops_user"}
DB_PASS=${DB_PASS:-"echoops_password"}
DB_NAME=${DB_NAME:-"echoops_crm_db"}
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/echoops_backup_$TIMESTAMP.sql"

echo "🔄 Creating database backup..."

# Create backup using mysqldump
mysqldump \
  --host="$DB_HOST" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --databases "$DB_NAME" \
  --no-tablespaces \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --compress \
  > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Clean old backups
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +"$RETENTION_DAYS" -delete

echo "✅ Backup process completed!"
echo "📂 Backup location: $BACKUP_FILE"
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Optional: Upload to cloud storage
# Uncomment and configure as needed

# AWS S3 Upload
# if command -v aws &> /dev/null; then
#     echo "☁️  Uploading to S3..."
#     aws s3 cp "$BACKUP_FILE" "s3://your-bucket/backups/"
#     echo "✅ Backup uploaded to S3"
# fi

# Google Cloud Storage Upload
# if command -v gsutil &> /dev/null; then
#     echo "☁️  Uploading to GCS..."
#     gsutil cp "$BACKUP_FILE" "gs://your-bucket/backups/"
#     echo "✅ Backup uploaded to GCS"
# fi
