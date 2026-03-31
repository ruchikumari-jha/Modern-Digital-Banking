from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.bill import Bill
from app.models.alert import Alert


# -------- JOB 1: Check Bills Daily --------
def check_due_bills():
    db: Session = SessionLocal()

    today = date.today()

    bills = db.query(Bill).filter(Bill.due_date <= today).all()

    for bill in bills:
        alert = Alert(
            user_id=bill.user_id,
            message=f"Bill '{bill.name}' is due!",
            type="bill"
        )
        db.add(alert)

    db.commit()
    db.close()


# -------- JOB 2: Check Budget Frequently --------
def check_budget():
    db: Session = SessionLocal()

    # Example logic — adjust for your model
    users = db.execute("SELECT id, balance FROM users").fetchall()

    for user in users:
        if user.balance < 1000:   # threshold
            alert = Alert(
                user_id=user.id,
                message="Low balance warning!",
                type="budget"
            )
            db.add(alert)

    db.commit()
    db.close()


# -------- Scheduler Setup --------
scheduler = BackgroundScheduler()

# Run daily
scheduler.add_job(check_due_bills, "interval", days=1)

# Run every 3 hours
scheduler.add_job(check_budget, "interval", hours=3)

scheduler.start()