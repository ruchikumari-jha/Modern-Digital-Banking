from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.bill import Bill


def check_bill_reminders(db: Session):

    today = datetime.utcnow()
    reminder_date = today + timedelta(days=2)

    bills = db.query(Bill).filter(Bill.due_date <= reminder_date.date()).all()

    for bill in bills:

        if str(bill.status) != "BillStatus.paid":

            print(f"Reminder: Bill '{bill.biller_name}' is due on {bill.due_date}")

            bill.last_reminder_sent = datetime.utcnow()

    db.commit()