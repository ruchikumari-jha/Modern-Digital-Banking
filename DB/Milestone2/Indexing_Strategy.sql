--Explain analyze for indexing
EXPLAIN ANALYZE
SELECT SUM(amount)
FROM transactions
WHERE account_id = 1
AND category = 'food';

--Index verification query

CREATE INDEX idx_transactions_covering
ON transactions(account_id, category, txn_date)
INCLUDE(amount);