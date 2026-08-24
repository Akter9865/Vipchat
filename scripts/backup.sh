#!/usr/bin/env bash
# Automated Backup Script for PostgreSQL and Storage
# Usage: Run via cron daily (e.g. 0 3 * * * /app/scripts/backup.sh)

set -e

BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/media"

echo "📦 [$(date)] Starting VIPChat Live CRM Automated Backup..."

# 1. PostgreSQL Database Dump
if command -v pg_dump &> /dev/null; then
  echo "🗄️ Dumping PostgreSQL Database..."
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db/vipchat_db_$TIMESTAMP.sql"
  gzip "$BACKUP_DIR/db/vipchat_db_$TIMESTAMP.sql"
  echo "✅ Database backup created: $BACKUP_DIR/db/vipchat_db_$TIMESTAMP.sql.gz"
fi

# 2. Media Storage Archive
if [ -d "/app/storage/uploads" ]; then
  echo "📁 Archiving Media Files..."
  tar -czf "$BACKUP_DIR/media/media_$TIMESTAMP.tar.gz" -C /app/storage/uploads .
  echo "✅ Media storage archive created: $BACKUP_DIR/media/media_$TIMESTAMP.tar.gz"
fi

# 3. Clean up backups older than RETENTION_DAYS
echo "🧹 Applying retention policy (${RETENTION_DAYS} days)..."
find "$BACKUP_DIR/db" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete || true
find "$BACKUP_DIR/media" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete || true

echo "🎉 [$(date)] Backup completed successfully!"
