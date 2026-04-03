
--Aggregation query test
SELECT category, SUM(amount)
FROM transactions
WHERE account_id = 1
AND txn_date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY category;

--Index test

EXPLAIN ANALYZE
SELECT SUM(amount)
FROM transactions
WHERE account_id = 1
AND category = 'food';

--Foreign key timestamp

INSERT INTO budgets (user_id, month, year, category, limit_amount)
VALUES (999,2,2026,'food',5000);