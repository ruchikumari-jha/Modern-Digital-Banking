# Backup Policy

To ensure durability of financial data, automated database backups are supported.

## Backup Strategy
- Full PostgreSQL dump using pg_dump
- Timestamped backups
- Backup stored in /backups directory

## Backup Frequency
Recommended:
- Daily backup for development environments

## Backup Command
./scripts/backup.sh

Example output:
backups/backup_2026-03-03_12-00-00.sql

## Storage
Backups are stored locally in:
backups/

For production deployments, cloud storage should be used.

## Milestone:3

## Script

#!/bin/bash

DB_NAME=banking_db
BACKUP_FILE=banking_backup.dump

pg_dump -U postgres -d $DB_NAME -F c -f $BACKUP_FILE

echo "Backup completed successfully"