--New Partition Table
CREATE TABLE transactions_partitioned (
    id SERIAL,
    account_id INT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category VARCHAR(50),
    txn_date TIMESTAMP NOT NULL,
    txn_type VARCHAR(10),
    PRIMARY KEY (id, txn_date)
) PARTITION BY RANGE (txn_date);


--2024 partition
CREATE TABLE transactions_2024
PARTITION OF transactions_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');


-- 2025 partition
CREATE TABLE transactions_2025
PARTITION OF transactions_partitioned
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');


--Index on partitions

CREATE INDEX idx_txn_2024_category
ON transactions_2024(category);

CREATE INDEX idx_txn_2024_account
ON transactions_2024(account_id);


--Verify Partititon working
SELECT tableoid::regclass, *
FROM transactions_partitioned
LIMIT 10;