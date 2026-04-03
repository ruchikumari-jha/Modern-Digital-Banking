--all transactions datewise
SELECT 
    txn_date,
    category,
    amount,
    txn_type,
    merchant
FROM transactions
WHERE id = 1
ORDER BY txn_date DESC;

--budget summary

SELECT 
    category,
    limit_amount,
    spent_amount,
    (limit_amount - spent_amount) AS remaining
FROM budgets
WHERE id = 1
ORDER BY category;

--insight summary

SELECT 
    category,
    SUM(amount) AS total_spent
FROM transactions
WHERE id = 1
GROUP BY category
ORDER BY total_spent DESC;