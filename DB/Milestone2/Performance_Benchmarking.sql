--Aggregation Latency Test

EXPLAIN ANALYZE
SELECT
    category,
    SUM(amount)
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE a.user_id = 10
AND txn_date BETWEEN '2026-01-01' AND '2026-12-31'
GROUP BY category;


--Insert Latency

EXPLAIN ANALYZE
INSERT INTO alerts (user_id,type,message)
VALUES (3109,'low_balance','test alert');


--Update Latency

EXPLAIN ANALYZE
UPDATE budgets
SET spent_amount = spent_amount + 500
WHERE user_id = 3110
AND category='food'
AND month=3
AND year=2026;

--Lock Contention

SELECT * FROM pg_locks;

SELECT * FROM pg_stat_activity;

--Index Hit Ratio


SELECT
    sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read),0) AS index_hit_ratio
FROM pg_statio_user_indexes;