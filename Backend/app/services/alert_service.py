from app.models.alert import Alert
from app.models.account import Account
from app.models.bill import Bill
from datetime import date, timedelta
from  sqlalchemy.orm import Session


# LOW BALANCE
def check_low_balance(db:Session, user_id):
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    created = []

    for acc in accounts:
        if acc.balance is not None and acc.balance < 1000:

            existing = db.query(Alert).filter(
                Alert.user_id == user_id,
                Alert.type == "low_balance"
            ).first()

            if existing:
                continue

            alert = Alert(
                user_id=user_id,
                type="low_balance",
                message="Your account balance is low"
            )

            db.add(alert)
            created.append(alert)

    db.commit()
    return created


# BILL DUE
def check_bill_due(db, user_id):
    bills = db.query(Bill).filter(Bill.user_id == user_id).all()
    created = []

    for bill in bills:
        if not bill.due_date:
            continue

        if bill.due_date <= date.today() + timedelta(days=3):

            existing = db.query(Alert).filter(
                Alert.user_id == user_id,
                Alert.type == "bill_due"
            ).first()

            if existing:
                continue

            alert = Alert(
                user_id=user_id,
                type="bill_due",
                message="Your bill is due soon"
            )

            db.add(alert)
            created.append(alert)

    db.commit()
    return created

# BUDGET ALERT
def check_and_create_budget_alert(db: Session, user_id: int, category: str):

    from app.models.budget import Budget   # local import avoids circular issues

    budget = db.query(Budget).filter(
        Budget.account_id == account_id,
        Budget.category == category
    ).first()

    if not budget:
        return False

    if budget.limit_amount == 0:
        return False

    percentage = (budget.spent_amount / budget.limit_amount) * 100

    # 🔔 Alert when 80% used
    if percentage >= 80:

        existing = db.query(Alert).filter(
            Alert.user_id == user_id,
            Alert.type == "budget_warning",
            Alert.message.contains(category)
        ).first()

        if existing:
            return False

        alert = Alert(
            user_id=budget.user_id,
            type="budget_warning",
            message=f"Budget for {category} exceeded 80%"
        )

        db.add(alert)
        db.commit()

        return True

    return False