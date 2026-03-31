from sqlalchemy.orm import Session
from datetime import date
from fastapi import HTTPException

from app.models.bill import Bill, BillStatus


# CREATE BILL
def create_bill(db: Session, bill_data):
    try:
        new_bill = Bill(
            user_id=bill_data.user_id,
            account_id=bill_data.account_id,
            biller_name=bill_data.biller_name,
            due_date=bill_data.due_date,
            amount_due=bill_data.amount_due,
            auto_pay = bill_data.auto_pay if bill_data.auto_pay is not None else False,
            status=BillStatus.upcoming
        )

        db.add(new_bill)
        db.commit()
        db.refresh(new_bill)

        return new_bill

    except Exception as e:
        db.rollback()
        print("CREATE BILL ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


def get_bills_for_user(db: Session, user_id: int):
    bills = db.query(Bill).filter(Bill.user_id == user_id).all()

    for bill in bills:
        if bill.auto_pay is None:
            bill.auto_pay = False   # ✅ FIX

    return bills


def mark_bill_paid(db: Session, bill_id: int):

    bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if not bill:
        return None

    bill.status = BillStatus.paid

    db.commit()
    db.refresh(bill)

    return bill


def delete_bill(db: Session, bill_id: int):

    bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if not bill:
        return None

    db.delete(bill)
    db.commit()

    return True


# UPDATE BILL
def update_bill(db: Session, bill_id: int, bill_data):

    bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if not bill:
        return None

    try:
        if bill_data.biller_name is not None:
            bill.biller_name = bill_data.biller_name

        if bill_data.due_date is not None:
            bill.due_date = bill_data.due_date

        if bill_data.amount_due is not None:
            bill.amount_due = bill_data.amount_due

        if bill_data.status is not None:
            bill.status = bill_data.status

        if bill_data.auto_pay is not None:
            bill.auto_pay = bill_data.auto_pay

        db.commit()
        db.refresh(bill)

        return bill

    except Exception as e:
        db.rollback()
        print("UPDATE BILL ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e)) 