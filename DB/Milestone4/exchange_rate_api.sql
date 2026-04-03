--step-5

INSERT INTO exchange_rates (base_currency, target_currency, rate)
SELECT 
    base,
    target,
    (random()*100)::numeric(10,4)
FROM (
    SELECT unnest(ARRAY['USD','EUR','INR']) AS base,
           unnest(ARRAY['INR','USD','EUR']) AS target
) t;

INSERT INTO rewards (user_id, program_name, points_balance)
SELECT
    u.id,
    (ARRAY['Cashback','Travel Points','Shopping Rewards'])[floor(random()*3)+1],
    (random()*1000)::int
FROM users u
LIMIT 50;

INSERT INTO bills (user_id, amount_due, due_date, status)
SELECT 
    u.id,
    random()*1000,
    NOW() + (random()*10 || ' days')::interval,
    (ARRAY['upcoming','paid','overdue'])[floor(random()*3)+1]::billstatus
FROM users u
ORDER BY random()
LIMIT 10;

SELECT 
    t.amount,
    t.currency,
    e.rate,
    t.amount * e.rate AS converted_amount
FROM transactions t
JOIN exchange_rates e
ON t.currency = e.base_currency
AND e.target_currency = 'INR';