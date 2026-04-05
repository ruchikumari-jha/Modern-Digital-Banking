from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import export

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware


# Database & Models
from app.database import Base, engine, SessionLocal
from app import models  # Register models with SQLAlchemy Base

if engine:
    try:
        print("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"DATABASE INITIALIZATION ERROR: {e}")
else:
    print("WARNING: Skipping database table initialization because engine is None.")

# Routers
from app.routes import (
    accounts,
    transactions,
    auth,
    reports,
    bills,
    budget_routes,
    rewards,
    currency,
    insights,
    alerts,
)

# Services
from app.services.reminder_service import check_bill_reminders
# 👉 If you have budget service, import it here
# from app.services.budget_service import check_budget_alerts


app = FastAPI()


# -------------------------------
# CORS
# -------------------------------

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # ✅ Environment variable for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Routers
# -------------------------------
app.include_router(auth.router)
app.include_router(accounts.router, prefix="/accounts", tags=["Accounts"])
app.include_router(transactions.router)
app.include_router(budget_routes.router)
app.include_router(reports.router)
app.include_router(bills.router)
app.include_router(rewards.router)
app.include_router(currency.router)
app.include_router(insights.router)
app.include_router(alerts.router)
app.include_router(export.router)


@app.get("/")
def root():
    return {"status": "Banking backend running"}


# -------------------------------
# Global Error Handler
# -------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )


# -------------------------------
# Manual Reminder Test Endpoint
# -------------------------------
@app.get("/test-reminder")
def test_reminder():
    db = SessionLocal()
    check_bill_reminders(db)
    db.close()
    return {"message": "Reminder check executed"}


# =========================================================
# 🔥 BACKGROUND SCHEDULER (AUTOMATION)
# =========================================================

scheduler = BackgroundScheduler(daemon=True)


# ---------- JOB 1: Daily Bill Reminders ----------
def run_reminder_job():
    db = SessionLocal()
    try:
        print("Running daily bill reminder job...")
        check_bill_reminders(db)
    finally:
        db.close()


# ---------- JOB 2: Budget / Balance Check ----------
def run_budget_job():
    db = SessionLocal()
    try:
        print("Running budget check job...")
        
        # 👉 Replace with your real logic
        # check_budget_alerts(db)

    finally:
        db.close()


# ---------- START SCHEDULER ----------
@app.on_event("startup")
def start_scheduler():

    # Run once every 24 hours
    scheduler.add_job(run_reminder_job, "interval", hours=24)

    # Run every 3 hours
    scheduler.add_job(run_budget_job, "interval", hours=3)

    scheduler.start()


# ---------- STOP SCHEDULER ----------
@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()