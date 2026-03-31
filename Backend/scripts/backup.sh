#!/bin/bash

# Database credentials
DB_NAME="banking_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Backup folder
BACKUP_DIR="./backups"

# Create folder if not exists
mkdir -p $BACKUP_DIR

# Backup file name with timestamp
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILE="$BACKUP_DIR/backup_$DATE.sql"

echo "Starting backup..."

pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $FILE

echo "Backup completed: $FILE"