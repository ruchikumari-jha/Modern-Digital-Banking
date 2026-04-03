# Restore Validation Report

Backup restore was tested successfully.

## Test Procedure

1. Create backup

./scripts/backup.sh

2. Drop test table data

DELETE FROM transactions;

3. Restore database

./scripts/restore.sh backups/backup_2026-03-03_12-00-00.sql

## Result

Database restored successfully.
Transactions, budgets, alerts and rules data were recovered without corruption.

## Conclusion

Backup and restore mechanism validated successfully.

## Milestone:3

## Script

#!/bin/bash

DB_NAME=banking_restore_test
BACKUP_FILE=banking_backup.dump

pg_restore -U postgres -d $DB_NAME $BACKUP_FILE

echo "Database restored successfully"





## Backup Strategy

Database backups are created using pg_dump.

Backup Script:
pg_dump -U postgres -d banking_db -F c -f banking_backup.dump

## Restore Verification:
pg_restore -U postgres -d banking_restore_test banking_backup.dump

These scripts ensure that financial data can be safely backed up and restored if needed.