--CASHFLOW MONTHLY
SELECT 
    DATE_TRUNC('month', txn_date) AS month,
    SUM(amount) AS total
FROM transactions
WHERE id = 1
GROUP BY month
ORDER BY month;

--Category spend
SELECT 
    category,
    SUM(amount) AS total_spent
FROM transactions
WHERE id = 1
GROUP BY category
ORDER BY total_spent DESC;

--Top merchants

SELECT 
    merchant,
    SUM(amount) AS total_spent
FROM transactions
WHERE id = 1
GROUP BY merchant
ORDER BY total_spent DESC
LIMIT 5;

--Performnace check
EXPLAIN ANALYZE
SELECT category, SUM(amount)
FROM transactions
WHERE id = 1
GROUP BY category;