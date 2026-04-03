--Isolation Check
SHOW transaction_isolation;

--Race condition check

INSERT INTO transactions(account_id, amount, category, txn_date)
VALUES (1, 500, 'food', NOW());
INSERT INTO transactions(account_id, amount, category, txn_date)
VALUES (1, 700, 'food', NOW());

--Budget Duplicate check

INSERT INTO budgets(user_id, month, year, category, limit_amount)
VALUES (1,2,2026,'food',5000);

--Concurrent Budget update
BEGIN;

UPDATE budgets
SET spent_amount = spent_amount + 500
WHERE user_id=1 AND category='food';

COMMIT;