from datetime import date
from app.services.budget_service import recalculate_budget
from app.models.transaction import Transaction
from app.models.budget import Budget


def test_budget_aggregation(db):

    # create budget
    budget = Budget(
        account_id=1,
        category="Food",
        month=2,
        year=2026,
        limit_amount=1000
    )

    # create transaction
    txn = Transaction(
        account_id=1,
        category="Food",
        txn_type="debit",
        amount=200,
        txn_date=date(2026, 2, 10)
    )

    db.add(budget)
    db.add(txn)
    db.commit()

    # run aggregation
    recalculate_budget(db, 1, "Food")

    # IMPORTANT → fetch again from DB (THIS FIXES EVERYTHING)
    updated_budget = db.query(Budget).filter(
        Budget.account_id == 1,
        Budget.category == "Food"
    ).first()

    assert updated_budget is not None
    assert float(updated_budget.spent_amount) == 200

def test_month_boundary(db):

    # transaction in different month should NOT count
    txn = Transaction(
        account_id=1,
        category="Food",
        txn_type="debit",
        amount=300,
        txn_date=date(2026,3,1)
    )

    db.add(txn)
    db.commit()

    # budget for Feb should ignore March txn