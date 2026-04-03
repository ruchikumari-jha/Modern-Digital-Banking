--Performance test
EXPLAIN ANALYZE
SELECT *
FROM bills
WHERE due_date <= CURRENT_DATE + INTERVAL '2 days'
AND status = 'upcoming';