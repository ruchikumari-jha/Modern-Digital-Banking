from sqlalchemy import func, extract
from app.models.transaction import Transaction
from app.models.account import Account
from sqlalchemy.orm import Session


def get_spending_by_category(
    db:Session,
    user_id,
    month=None,
    year=None,
    skip=0,
    limit=20
):

    SPENDING_TYPES = ["debit", "withdrawal", "dr"]

    query = (
        db.query(
            Transaction.category,
            func.sum(func.abs(Transaction.amount)).label("total_spent")
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(
            Account.user_id == user_id,

            # ✅ Match ANY spending type (case-insensitive)
            func.lower(Transaction.txn_type).in_(SPENDING_TYPES),

            Transaction.category.isnot(None),
        )
    )

    if month:
        query = query.filter(
            extract("month", Transaction.txn_date) == int(month)
        )

    if year:
        query = query.filter(
            extract("year", Transaction.txn_date) == int(year)
        )

    result = (
        query
        .group_by(Transaction.category)
        .order_by(func.sum(func.abs(Transaction.amount)).desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return result