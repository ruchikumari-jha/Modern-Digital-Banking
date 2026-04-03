--Aggregation query optimization
EXPLAIN ANALYZE
SELECT category, SUM(amount)
FROM transactions
WHERE account_id = 1
AND txn_date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY category;

--Run explain analyze

EXPLAIN ANALYZE
SELECT category, SUM(amount)
FROM transactions
WHERE account_id = 1
AND txn_date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY category;

--testing multiple categories

EXPLAIN ANALYZE
SELECT category, SUM(amount)
FROM transactions
WHERE account_id = 1
GROUP BY category;

--Covering index
CREATE INDEX idx_transactions_covering
ON transactions(account_id, category, txn_date)
INCLUDE(amount);