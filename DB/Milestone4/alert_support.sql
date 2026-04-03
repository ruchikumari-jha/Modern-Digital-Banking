
--unread alerts
SELECT * FROM alerts
WHERE id = 1 AND is_read = false
ORDER BY created_at DESC;


--mark as read
UPDATE alerts
SET is_read = true
WHERE id = 1;

--Recent alerts
SELECT * FROM alerts
WHERE id = 1
ORDER BY created_at DESC
LIMIT 10;