--Enable sloq query logging

ALTER SYSTEM SET log_min_duration_statement = 500;


--Index Usage Monitoring

SELECT
relname,
idx_scan
FROM pg_stat_user_indexes;

--Deadlock Detection

SELECT deadlocks
FROM pg_stat_database
WHERE datname = current_database();

--Lock Wait Monitoring

SELECT
pid,
wait_event_type,
wait_event
FROM pg_stat_activity
WHERE wait_event IS NOT NULL;

--Index Fragmentation

SELECT
indexrelname,
idx_scan,
idx_tup_read
FROM pg_stat_user_indexes;