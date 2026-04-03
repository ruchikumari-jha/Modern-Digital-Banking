--Data consistency and backup

ALTER TABLE bills
ADD CONSTRAINT check_amount_positive
CHECK (amount_due > 0);

ALTER TABLE rewards
ALTER COLUMN points_balance TYPE INTEGER;