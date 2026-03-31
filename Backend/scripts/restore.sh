#!/bin/bash

DB_NAME="banking_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

FILE=$1

if [ -z "$FILE" ]
then
  echo "Please provide backup file"
  echo "Example: ./restore.sh backups/backup_2026-03-03.sql"
  exit 1
fi

echo "Restoring database..."

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $FILE

echo "Restore completed"