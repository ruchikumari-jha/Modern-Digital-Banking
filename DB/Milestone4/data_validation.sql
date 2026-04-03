SELECT category, SUM(amount)
FROM transactions
GROUP BY category;

SELECT * FROM bills WHERE status='overdue';

SELECT t.id, a.user_id
FROM transactions t
JOIN accounts a ON t.account_id = a.id;

SELECT COUNT(*) FROM transactions;

UPDATE budgets
SET spent_amount = limit_amount + 1000
WHERE id = 1;

SELECT * FROM budgets WHERE spent_amount > limit_amount;

UPDATE bills
SET status = 'overdue'
WHERE id = 1;

SELECT * FROM bills WHERE status='overdue';

SELECT id FROM accounts LIMIT 10;