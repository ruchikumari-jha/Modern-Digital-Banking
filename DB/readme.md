# Modern Digital Banking Dashboard - Database

## Project Overview
The Database layer is built on PostgreSQL and serves as the central data repository for the Modern Digital Banking Dashboard. It stores user accounts, transactions, budgets, bills, rewards, alerts, and audit logs with optimized schemas for performance and scalability.

## Tech Stack
- **DBMS**: PostgreSQL 12+
- **ORM**: SQLAlchemy (via FastAPI backend)
- **Migrations**: Alembic
- **Backup**: pg_dump / PostgreSQL WAL archiving
- **Replication**: PostgreSQL native replication (optional for HA)
- **Monitoring**: pgAdmin, pg_stat_statements

## Database Architecture

### Overview
```
Modern Digital Banking Database Structure
│
├── Authentication & Users
│   └── Users (KYC status, credentials)
│
├── Core Financial Data
│   ├── Accounts (multi-account support)
│   ├── Transactions (account transactions)
│   ├── Currency (exchange rates, conversions)
│   └── CategoryRules (auto-categorization)
│
├── Financial Management
│   ├── Budgets (monthly limits by category)
│   ├── Bills (bill tracking & reminders)
│   └── Rewards (loyalty program points)
│
├── Insights & Notifications
│   ├── Alerts (rule-based notifications)
│   └── AdminLogs (audit trail)
│
└── Support Tables
    └── CategoryMaster (predefined categories)
```

## Complete Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    phone VARCHAR(20),
    kyc_status ENUM('unverified', 'verified') DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Purpose**: Store user profiles and authentication credentials  
**Key Constraints**: Email must be unique for login uniqueness  
**Indexes**: Email (fast login lookup)

---

### 2. Accounts Table
```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_type ENUM('savings', 'checking', 'credit_card', 'loan', 'investment'),
    masked_account VARCHAR(50) NOT NULL,  -- e.g., "****1234"
    currency CHAR(3) NOT NULL,  -- ISO 4217 code (USD, EUR, etc.)
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);
```

**Purpose**: Store user's linked bank accounts  
**Key Constraints**: Foreign key to users (cascade delete)  
**Indexes**: user_id (fast account lookup per user), created_at (sorting)

---

### 3. Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50),  -- e.g., 'Groceries', 'Utilities', 'Entertainment'
    amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    txn_type ENUM('debit', 'credit') NOT NULL,
    merchant VARCHAR(100),
    txn_date TIMESTAMP NOT NULL,
    posted_date TIMESTAMP,
    is_categorized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_txn_date ON transactions(txn_date);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_account_txn_date ON transactions(account_id, txn_date);
```

**Purpose**: Store individual transactions for all accounts  
**Key Constraints**: Foreign key to accounts (cascade delete)  
**Indexes**: account_id (transaction list per account), txn_date (date filters), merchant (top merchants), composite (common query pattern)

---

### 4. CategoryRules Table
```sql
CREATE TABLE category_rules (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    keyword_pattern VARCHAR(255),  -- regex pattern for description matching
    merchant_pattern VARCHAR(255),  -- regex pattern for merchant matching
    priority INT DEFAULT 0,  -- higher priority rules applied first
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_rules_user_id ON category_rules(user_id);
CREATE INDEX idx_category_rules_active ON category_rules(is_active);
```

**Purpose**: Store custom category matching rules per user  
**Key Constraints**: Foreign key to users  
**Indexes**: user_id (rule lookup per user), is_active (filter active rules)

---

### 5. Budgets Table
```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    limit_amount NUMERIC(15,2) NOT NULL,
    spent_amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year, category)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month_year ON budgets(year, month);
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, year, month);
```

**Purpose**: Store monthly budget limits per category  
**Key Constraints**: Unique constraint (one budget per user/month/category), FK to users  
**Indexes**: user_id (budget lookup), month/year (monthly budget queries)

---

### 6. Bills Table
```sql
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    biller_name VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    amount_due NUMERIC(15,2) NOT NULL,
    status ENUM('upcoming', 'paid', 'overdue') DEFAULT 'upcoming',
    auto_pay BOOLEAN DEFAULT FALSE,
    last_reminder_sent TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_user_status ON bills(user_id, status);
```

**Purpose**: Store bill information and reminders  
**Key Constraints**: Foreign key to users  
**Indexes**: user_id (bill lookup), due_date (upcoming bills), status (quick filtering)

---

### 7. Rewards Table
```sql
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_name VARCHAR(100) NOT NULL,
    points_balance INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_name)
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
```

**Purpose**: Track loyalty program points per user  
**Key Constraints**: Unique constraint (one reward program per user), FK to users  
**Indexes**: user_id (rewards lookup)

---

### 8. Alerts Table
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type ENUM('low_balance', 'bill_due', 'budget_exceeded') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read);
```

**Purpose**: Store rule-based alerts for users  
**Key Constraints**: Foreign key to users  
**Indexes**: user_id (alert lookup), type (filter by alert type), created_at (sorting), user_unread (unread alerts)

---

### 9. AdminLogs Table
```sql
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,  -- e.g., "verified_user", "disabled_account"
    target_type VARCHAR(50),  -- e.g., 'User', 'Account', 'Transaction'
    target_id INT,  -- ID of affected record
    details JSONB,  -- Additional context (optional)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
```

**Purpose**: Audit trail for admin actions  
**Key Constraints**: Foreign key to users (admin)  
**Indexes**: admin_id (actions by admin), timestamp (chronological lookup), action (filter by action type)

---

### 10. CategoryMaster Table (Lookup)
```sql
CREATE TABLE category_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),  -- icon name for UI
    color VARCHAR(7)   -- hex color for UI
);

CREATE INDEX idx_category_master_name ON category_master(name);

-- Sample data
INSERT INTO category_master (name, description, icon, color) VALUES
('Groceries', 'Food & grocery purchases', 'shopping_cart', '#FF6B6B'),
('Utilities', 'Electric, water, gas bills', 'lightning', '#4ECDC4'),
('Entertainment', 'Movies, games, dining', 'film', '#45B7D1'),
('Transportation', 'Gas, transit, parking', 'car', '#F7DC6F'),
('Healthcare', 'Medical, pharmacy', 'health', '#BB8FCE'),
('Shopping', 'Retail, online purchases', 'bag', '#85C1E2'),
('Subscriptions', 'SaaS, streaming, memberships', 'layers', '#F8B88B'),
('Salary', 'Income', 'trending_up', '#52C41A'),
('Transfer', 'Inter-account transfers', 'swap', '#1890FF'),
('Other', 'Uncategorized', 'more_horiz', '#BFBFBF');
```

**Purpose**: Predefined transaction categories for the app  
**Key Constraints**: Unique category name  
**Indexes**: name (fast lookup)

---

## 8-Week Schema Evolution Plan

### Week 1-2 Deliverables
- [x] Users table
- [x] Accounts table
- [x] Transactions table
- [ ] Initial migration file (V001_initial_schema.sql)

### Week 3-4 Deliverables
- [x] Budgets table
- [x] CategoryRules table
- [ ] Migration file (V002_budgets_and_rules.sql)

### Week 5-6 Deliverables
- [x] Bills table
- [x] Rewards table
- [ ] Migration file (V003_bills_and_rewards.sql)

### Week 7-8 Deliverables
- [x] Alerts table
- [x] AdminLogs table
- [ ] Migration file (V004_alerts_and_audit.sql)
- [ ] Performance optimization (indexing, partitioning)

---

## Database Setup Instructions

### Prerequisites
- PostgreSQL 12+ installed
- psql command-line tool
- Superuser or database creation privileges

### Installation

**1. Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE banking_db ENCODING 'UTF8';
CREATE USER banking_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE banking_db TO banking_user;

# Exit psql
\q
```

**2. Run Migration Scripts**
```bash
# Using Alembic (from Backend directory)
cd Backend
alembic upgrade head

# OR manually run SQL scripts
psql -U banking_user -d banking_db -f schema.sql
```

**3. Insert Lookup Data**
```sql
-- CategoryMaster insert (run manually or via backend)
psql -U banking_user -d banking_db -f seed_data.sql
```

### Alembic Migration Workflow

**Generate Migration**
```bash
# From Backend directory
alembic revision --autogenerate -m "Add alerts table"
```

**Apply Migration**
```bash
# Upgrade to latest
alembic upgrade head

# Downgrade one revision
alembic downgrade -1
```

---

## Indexing Strategy

### Index Purposes

| Table | Index | Reason |
|-------|-------|--------|
| Users | email | Fast login/lookup |
| Accounts | user_id | Query accounts per user |
| Transactions | account_id | Get transactions per account |
| Transactions | txn_date | Filter by date range |
| Transactions | merchant | Top merchants query |
| Transactions | account_id, txn_date | Common filter combo |
| Budgets | user_id, year, month | Monthly budget queries |
| Bills | user_id, status | Upcoming/overdue bills |
| Bills | due_date | Scheduled reminder queries |
| Alerts | user_id, is_read | Unread alerts per user |
| AdminLogs | timestamp | Chronological audit trail |

### Performance Tuning
```sql
-- Enable query plan analysis
EXPLAIN ANALYZE SELECT * FROM transactions 
WHERE account_id = 1 AND txn_date > '2024-01-01';

-- Monitor slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

---

## Backup & Recovery Strategy

### Automated Backups
```bash
# Full database backup
pg_dump -U banking_user -d banking_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U banking_user -d banking_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Custom format (faster restore)
pg_dump -U banking_user -d banking_db -Fc > backup_$(date +%Y%m%d).dump
```

### Recovery
```bash
# From SQL dump
psql -U banking_user -d banking_db < backup.sql

# From custom format
pg_restore -U banking_user -d banking_db backup.dump
```

### Backup Schedule (Recommended)
- **Daily**: Full backup at 02:00 UTC
- **Hourly**: Transaction log archiving
- **Weekly**: Compressed archive to S3
- **Monthly**: Long-term retention backup

---

## Data Growth Projections

### Estimated Table Sizes (1 Million Users)

| Table | Rows | Size | Growth Rate |
|-------|------|------|-------------|
| Users | 1M | ~150 MB | +100K/month |
| Accounts | 3M | ~300 MB | +300K/month |
| Transactions | 100M | ~10 GB | +10M/month |
| Budgets | 12M | ~600 MB | +1M/month |
| Bills | 5M | ~400 MB | +500K/month |
| Rewards | 2M | ~100 MB | +200K/month |
| Alerts | 50M | ~3 GB | +5M/month |

### Partitioning Strategy (Optional)
```sql
-- Partition transactions by month for better performance
CREATE TABLE transactions_2024_01 PARTITION OF transactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## Query Optimization Examples

### Common Queries

**1. Get User's Account Balance Summary**
```sql
SELECT 
    a.id, a.bank_name, a.account_type, 
    a.balance, a.currency
FROM accounts a
WHERE a.user_id = $1
ORDER BY a.created_at DESC;
```

**2. Get Monthly Spending by Category**
```sql
SELECT 
    category, 
    SUM(CASE WHEN txn_type = 'debit' THEN amount ELSE 0 END) as spent
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE a.user_id = $1 
  AND EXTRACT(MONTH FROM t.txn_date) = $2
  AND EXTRACT(YEAR FROM t.txn_date) = $3
GROUP BY category
ORDER BY spent DESC;
```

**3. Get Budget Status**
```sql
SELECT 
    b.id, b.category, b.limit_amount, b.spent_amount,
    ROUND((b.spent_amount::numeric / b.limit_amount) * 100, 2) as percent_spent
FROM budgets b
WHERE b.user_id = $1 
  AND b.month = $2 
  AND b.year = $3
ORDER BY percent_spent DESC;
```

**4. Get Overdue Bills**
```sql
SELECT id, biller_name, due_date, amount_due
FROM bills
WHERE user_id = $1 
  AND status = 'overdue'
ORDER BY due_date ASC;
```

---

## Monitoring & Maintenance

### Regular Maintenance Tasks
```sql
-- Analyze table statistics (run weekly)
ANALYZE accounts;
ANALYZE transactions;
ANALYZE budgets;

-- Vacuum tables (run nightly)
VACUUM ANALYZE;

-- Monitor table sizes
SELECT 
    tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Connection Pooling (Optional)
```bash
# Use PgBouncer for connection pooling
# /etc/pgbouncer/pgbouncer.ini
[databases]
banking_db = host=localhost port=5432 dbname=banking_db

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

---

## Disaster Recovery Plan

### RTO & RPO Goals
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 15 minutes

### Recovery Steps
1. Restore from latest backup
2. Apply transaction logs up to point of failure
3. Verify data integrity
4. Failover to replica (if HA setup)

### Testing
- Monthly disaster recovery drills
- Restore backups to test environment
- Document recovery procedures

---

## Security Best Practices

### Access Control
```sql
-- Grant privileges
GRANT CONNECT ON DATABASE banking_db TO banking_user;
GRANT USAGE ON SCHEMA public TO banking_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO banking_user;

-- Restrict admin access
CREATE ROLE admin_user WITH SUPERUSER;
```

### Data Protection
- Enable SSL/TLS for connections
- Use row-level security (RLS) for data isolation
- Hash sensitive data (passwords)
- Encrypt backups

### Audit Logging
- Enable PostgreSQL audit logging
- Track admin_logs table changes
- Monitor slow queries

---

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql -U banking_user -h localhost -d banking_db -c "SELECT 1;"

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log
```

### Performance Issues
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;

-- Check table bloat
SELECT schemaname, tablename, round(100 * (CASE 
    WHEN otta > 0 THEN sml.relpages - otta 
    ELSE 0 END) / sml.relpages::numeric, 2) AS ratio
FROM pg_class sml
WHERE sml.relname = 'transactions';
```

### Data Integrity
```sql
-- Check for orphaned records
SELECT * FROM transactions WHERE account_id NOT IN (SELECT id FROM accounts);

-- Verify constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name IN ('users', 'accounts', 'transactions');
```

---

## Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org)
- [Alembic Migrations](https://alembic.sqlalchemy.org)
- [pgAdmin](https://www.pgadmin.org)
- [PostgreSQL Performance Wiki](https://wiki.postgresql.org/wiki/Performance_Optimization)
