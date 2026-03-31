# Modern Digital Banking Dashboard - Backend

## Project Overview
The Backend is a FastAPI application that powers the Modern Digital Banking Dashboard. It handles authentication, multi-account management, transaction processing, budgeting, bill reminders, rewards tracking, and financial insights through RESTful APIs.

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (access + refresh tokens)
- **Task Queue**: Celery (for async emails/SMS)
- **Webhooks/Polling**: APScheduler
- **External APIs**: Plaid, ExchangeRate API, Open Bank Project
- **Testing**: Pytest
- **API Documentation**: Swagger/OpenAPI
- **Server**: Uvicorn

## Project Structure
```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app initialization
│   ├── config.py                # Configuration & environment variables
│   ├── database.py              # Database connection & session
│   ├── dependencies.py          # Dependency injection (get_db, get_current_user)
│   │
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── transaction.py
│   │   ├── budget.py
│   │   ├── bill.py
│   │   ├── reward.py
│   │   ├── alert.py
│   │   └── admin_log.py
│   │
│   ├── schemas/                 # Pydantic schemas for validation
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── transaction.py
│   │   ├── budget.py
│   │   ├── bill.py
│   │   ├── reward.py
│   │   ├── alert.py
│   │   └── auth.py
│   │
│   ├── routes/                  # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py              # Module A: Auth endpoints
│   │   ├── accounts.py          # Module B: Account CRUD
│   │   ├── transactions.py      # Module B: Transaction management
│   │   ├── budgets.py           # Module C: Budget operations
│   │   ├── categories.py        # Module C: Category rules
│   │   ├── bills.py             # Module D: Bill management
│   │   ├── rewards.py           # Module D: Rewards tracking
│   │   ├── insights.py          # Module E: Analytics
│   │   ├── alerts.py            # Module E: Alerts
│   │   ├── currency.py          # Currency conversion
│   │   ├── export.py            # Export (CSV/PDF)
│   │   └── admin.py             # Module E: Admin operations
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── account_service.py
│   │   ├── transaction_service.py
│   │   ├── budget_service.py
│   │   ├── bill_service.py
│   │   ├── reward_service.py
│   │   ├── insight_service.py
│   │   ├── alert_service.py
│   │   ├── export_service.py
│   │   └── external_api_service.py  # Plaid, ExchangeRate API
│   │
│   ├── tasks/                   # Celery async tasks
│   │   ├── __init__.py
│   │   ├── email_tasks.py
│   │   ├── sms_tasks.py
│   │   ├── webhook_tasks.py
│   │   └── scheduled_tasks.py
│   │
│   ├── utils/                   # Helper functions
│   │   ├── __init__.py
│   │   ├── security.py          # JWT, password hashing
│   │   ├── validators.py
│   │   ├── formatters.py        # Data formatting
│   │   └── constants.py
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── logging.py
│   │
│   └── migrations/              # Alembic database migrations
│       └── versions/
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures
│   ├── test_auth.py
│   ├── test_accounts.py
│   ├── test_transactions.py
│   ├── test_budgets.py
│   ├── test_bills.py
│   ├── test_rewards.py
│   ├── test_insights.py
│   └── test_alerts.py
│
├── .env.example                 # Environment variables template
├── requirements.txt             # Python dependencies
├── alembic.ini                  # Alembic config
├── celery_config.py             # Celery configuration
├── docker-compose.yml           # Docker setup
├── Dockerfile
├── pytest.ini                   # Pytest config
└── README.md
```

## 8-Week Milestone Plan

### **Milestone 1: Weeks 1–2 – Foundations & Accounts**

#### Week 1: Authentication & Base Schema
**Deliverables:**
- [ ] User model & authentication endpoints
- [ ] JWT token generation (access + refresh)
- [ ] Password hashing (bcrypt)
- [ ] Database schema setup
- [ ] Migrations with Alembic

**Endpoints:**
```
POST   /api/auth/signup       – User registration
POST   /api/auth/login        – User login (returns tokens)
POST   /api/auth/refresh      – Refresh access token
POST   /api/auth/logout       – Logout
GET    /api/users/me          – Current user profile
PUT    /api/users/me          – Update profile
```

**Models to Create:**
- `User` – id, name, email, password_hash, phone, kyc_status, created_at

**Tasks:**
- [ ] Set up FastAPI app with CORS
- [ ] Configure PostgreSQL connection
- [ ] Implement JWT utilities (encode/decode)
- [ ] Create User model in SQLAlchemy
- [ ] Create Alembic migration for users table
- [ ] Test auth endpoints

---

#### Week 2: Accounts CRUD & Transaction Ingestion
**Deliverables:**
- [ ] Account management CRUD
- [ ] CSV transaction import
- [ ] Transaction list with filters
- [ ] Account-transaction relationships

**Endpoints:**
```
POST   /api/accounts           – Create account
GET    /api/accounts           – List user accounts
GET    /api/accounts/{id}      – Get account details
PUT    /api/accounts/{id}      – Update account
DELETE /api/accounts/{id}      – Delete account

POST   /api/transactions/import – Import CSV
GET    /api/transactions       – List transactions (filters: date, amount, merchant)
GET    /api/transactions/{id}  – Get transaction details
```

**Models to Create:**
- `Account` – id, user_id, bank_name, account_type, masked_account, currency, balance
- `Transaction` – id, account_id, description, category, amount, currency, txn_type, merchant, txn_date, posted_date

**Tasks:**
- [ ] Create Account & Transaction models
- [ ] Implement account CRUD service
- [ ] Parse CSV files (pandas/csv module)
- [ ] Validate transaction data
- [ ] Create transactions in bulk
- [ ] Implement transaction filtering (date range, amount, merchant)

---

### **Milestone 2: Weeks 3–4 – Categorization & Budgets**

#### Week 3: Category Rules & Auto-Categorization
**Deliverables:**
- [ ] Category rules engine (merchant/keyword-based)
- [ ] Manual category assignment
- [ ] Bulk categorization

**Endpoints:**
```
GET    /api/categories         – List predefined categories
POST   /api/categories/rules   – Create categorization rule
GET    /api/categories/rules   – List rules
PUT    /api/categories/rules/{id} – Update rule
DELETE /api/categories/rules/{id} – Delete rule

PUT    /api/transactions/{id}/category – Update transaction category
POST   /api/transactions/bulk-categorize – Bulk category assignment
```

**Models to Create:**
- `CategoryRule` – id, user_id, category, keyword_pattern, merchant_pattern

**Tasks:**
- [ ] Create CategoryRule model
- [ ] Implement rule matching logic (regex on merchant/description)
- [ ] Auto-apply rules on transaction import
- [ ] Update transaction category endpoint
- [ ] Track category assignment history

---

#### Week 4: Budgets & Progress Tracking
**Deliverables:**
- [ ] Budget CRUD operations
- [ ] Monthly budget tracking
- [ ] Budget vs. spent calculations
- [ ] Budget exceeded alerts

**Endpoints:**
```
POST   /api/budgets            – Create budget
GET    /api/budgets            – List budgets (current month)
GET    /api/budgets/{id}       – Get budget details
PUT    /api/budgets/{id}       – Update budget
DELETE /api/budgets/{id}       – Delete budget

GET    /api/budgets/{id}/progress – Budget spent amount
GET    /api/budgets/month/{year}/{month} – Monthly budgets
```

**Models to Create:**
- `Budget` – id, user_id, month, year, category, limit_amount, spent_amount

**Tasks:**
- [ ] Create Budget model
- [ ] Implement budget creation (validate month/year)
- [ ] Calculate spent_amount from transactions
- [ ] Implement budget progress calculation
- [ ] Create alert when spent >= 80% of limit
- [ ] Track spending trends

---

### **Milestone 3: Weeks 5–6 – Bills & Rewards**

#### Week 5: Bills Management & Reminders
**Deliverables:**
- [ ] Bill CRUD operations
- [ ] Bill status tracking (upcoming, paid, overdue)
- [ ] Email/SMS reminders via Celery
- [ ] Auto-pay toggle support

**Endpoints:**
```
POST   /api/bills              – Create bill
GET    /api/bills              – List bills
GET    /api/bills/{id}         – Get bill details
PUT    /api/bills/{id}         – Update bill
DELETE /api/bills/{id}         – Delete bill

PUT    /api/bills/{id}/pay     – Mark as paid
POST   /api/bills/{id}/send-reminder – Trigger reminder
POST   /api/bills/send-due-reminders – Scheduled job (daily)
```

**Models to Create:**
- `Bill` – id, user_id, biller_name, due_date, amount_due, status, auto_pay

**Tasks:**
- [ ] Create Bill model
- [ ] Implement bill CRUD service
- [ ] Set up Celery for async tasks
- [ ] Create email task (Celery)
- [ ] Create SMS task (Celery via Twilio)
- [ ] Schedule daily job to send reminders for due bills
- [ ] Update bill status to 'overdue' if past due_date

---

#### Week 6: Rewards & Currency Conversion
**Deliverables:**
- [ ] Rewards program tracking
- [ ] Points balance updates
- [ ] Currency conversion summaries
- [ ] ExchangeRate API integration

**Endpoints:**
```
GET    /api/rewards            – List rewards programs
GET    /api/rewards/{id}       – Get reward details
PUT    /api/rewards/{id}       – Update points balance

GET    /api/currency/rates     – Get exchange rates (cached)
GET    /api/currency/summary   – Account balances in base currency
POST   /api/currency/convert   – Convert between currencies
```

**Models to Create:**
- `Reward` – id, user_id, program_name, points_balance, last_updated

**Tasks:**
- [ ] Create Reward model
- [ ] Implement rewards CRUD
- [ ] Integrate ExchangeRate API (cache with TTL)
- [ ] Calculate total balance across currencies
- [ ] Convert all account balances to base currency
- [ ] Cache exchange rates (Redis/in-memory)

---

### **Milestone 4: Weeks 7–8 – Insights & Alerts**

#### Week 7: Analytics & Alert System
**Deliverables:**
- [ ] Cash flow analytics
- [ ] Top merchants breakdown
- [ ] Burn rate trends
- [ ] Alert system (rule-based)
- [ ] Alert notifications

**Endpoints:**
```
GET    /api/insights/cash-flow – Monthly income vs. expenses
GET    /api/insights/merchants – Top merchants by spending
GET    /api/insights/burn-rate – Spending trends over time
GET    /api/insights/categories – Category breakdown

GET    /api/alerts             – List alerts
PUT    /api/alerts/{id}/dismiss – Dismiss alert
DELETE /api/alerts/{id}        – Delete alert
POST   /api/alerts/subscribe   – Subscribe to alert types
```

**Models to Create:**
- `Alert` – id, user_id, type, message, created_at, is_read

**Tasks:**
- [ ] Implement cash flow calculation (income/expense by month)
- [ ] Implement top merchants query
- [ ] Calculate burn rate trends
- [ ] Create Alert model
- [ ] Implement alert triggers:
  - Low balance (< 20% of average)
  - Bill due (within 3 days)
  - Budget exceeded (spent > limit)
- [ ] Create alert notification service
- [ ] Add dismiss/read functionality

---

#### Week 8: Exports, QA & Deployment
**Deliverables:**
- [ ] CSV export endpoint
- [ ] PDF statement generation
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Production deployment

**Endpoints:**
```
POST   /api/export/csv         – Export transactions to CSV
POST   /api/export/pdf         – Generate PDF statement
```

**Tasks:**
- [ ] Implement CSV export (pandas)
- [ ] Implement PDF generation (reportlab/WeasyPrint)
- [ ] Write unit tests for all services (target 80%+ coverage)
- [ ] Integration tests for API endpoints
- [ ] Load testing & performance optimization
- [ ] API documentation (Swagger)
- [ ] Prepare Docker & production configs

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 12+
- Redis (for caching/Celery)
- Celery + RabbitMQ/Redis

### Installation
```bash
# Clone repository
git clone <repo_url>
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Configure database & API keys in .env
```

### Environment Variables
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/banking_db

# JWT
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
EXCHANGERATE_API_KEY=your-api-key

# Email/SMS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
```

### Database Setup
```bash
# Run Alembic migrations
alembic upgrade head

# Create initial data (optional)
python -c "from app.database import init_db; init_db()"
```

### Running the Application

**Development:**
```bash
# Start FastAPI server
uvicorn app.main:app --reload

# In another terminal, start Celery worker
celery -A app.tasks worker --loglevel=info

# Optional: Start Celery beat (scheduler)
celery -A app.tasks beat --loglevel=info
```

**Production:**
```bash
# Build Docker image
docker build -t banking-api .

# Run with Docker Compose
docker-compose up -d
```

### Testing
```bash
# Run all tests
pytest

# With coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v
```

## API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Database Schema Summary

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| Users | id, email, password_hash, kyc_status | User authentication & profile |
| Accounts | id, user_id, bank_name, account_type, balance | Multi-account management |
| Transactions | id, account_id, description, category, amount, merchant | Transaction tracking |
| Budgets | id, user_id, month, year, category, limit_amount, spent_amount | Budget management |
| Bills | id, user_id, biller_name, due_date, amount_due, status | Bill tracking |
| Rewards | id, user_id, program_name, points_balance | Rewards tracking |
| Alerts | id, user_id, type, message | User alerts & notifications |
| AdminLogs | id, admin_id, action, target_type, target_id | Audit trail |

## Key Design Patterns

### Dependency Injection
```python
from fastapi import Depends
from app.dependencies import get_db, get_current_user

@app.get("/accounts")
def get_accounts(current_user: User = Depends(get_current_user), 
                 db: Session = Depends(get_db)):
    return AccountService.get_user_accounts(db, current_user.id)
```

### Service Layer Pattern
```python
# app/services/account_service.py
class AccountService:
    @staticmethod
    def get_user_accounts(db: Session, user_id: int):
        return db.query(Account).filter(Account.user_id == user_id).all()
    
    @staticmethod
    def create_account(db: Session, user_id: int, account_data: AccountCreate):
        account = Account(**account_data.dict(), user_id=user_id)
        db.add(account)
        db.commit()
        return account
```

### Async Tasks with Celery
```python
# app/tasks/email_tasks.py
from celery import shared_task

@shared_task
def send_bill_reminder(bill_id: int):
    bill = BillService.get_bill(bill_id)
    # Send email logic
    pass
```

## Performance Optimization
- Database query optimization (indexes on user_id, txn_date)
- Caching with Redis (exchange rates, category rules)
- Pagination for large datasets
- Async task processing (Celery)
- Connection pooling for database

## Security Best Practices
- JWT token validation on all protected endpoints
- Password hashing with bcrypt
- CORS configured for frontend origin only
- Rate limiting on auth endpoints
- Input validation with Pydantic
- SQL injection prevention via ORM
- Sensitive data logging redaction

## Monitoring & Logging
- Structured logging (JSON format)
- Request/response logging middleware
- Error tracking (Sentry integration optional)
- Celery task monitoring
- Database connection monitoring

## Contributing Guidelines
- Follow PEP 8 style guide
- Write tests for all new features
- Create feature branches: `feature/module-name`
- Document API changes
- Test locally before pushing

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run migrations: `alembic upgrade head`

### Celery Task Issues
- Verify Redis is running
- Check CELERY_BROKER_URL
- Monitor with: `celery -A app.tasks events`

### JWT Token Errors
- Ensure SECRET_KEY is consistent
- Check token expiry times
- Verify token format in Authorization header

## Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org)
- [Pydantic Validation](https://docs.pydantic.dev)
- [Celery Task Queue](https://docs.celeryproject.io)
- [Alembic Migrations](https://alembic.sqlalchemy.org)
