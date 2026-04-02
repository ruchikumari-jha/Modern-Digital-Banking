from sqlalchemy import func, extract
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.utils.logger import logger
from sqlalchemy.orm import Session


from sqlalchemy import func, extract
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.utils.logger import logger
from sqlalchemy.orm import Session


def recalculate_budget(db: Session, account_id, category):

    budget = db.query(Budget).filter(
        Budget.account_id == account_id,
        Budget.category == category
    ).first()

    if not budget:
        return None

    month = budget.month
    year = budget.year

    total_spent = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.account_id == account_id,   # ✅ FIXED
        Transaction.category == category,
        Transaction.txn_type == "debit",
        extract("month", Transaction.txn_date) == month,
        extract("year", Transaction.txn_date) == year
    ).scalar()

    budget.spent_amount = total_spent

    db.commit()
    db.refresh(budget)

    logger.info(
        f"account_id={account_id} category={category} spent={total_spent}"
    )

    return budget

def get_budget_progress(db:Session, user_id, category):

    budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category == category
    ).first()

    if not budget:
        return 0

    if budget.limit_amount == 0:
        return 0

    progress = (budget.spent_amount / budget.limit_amount) * 100

    return round(progress, 2)
