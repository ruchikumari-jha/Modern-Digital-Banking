from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category_rules import CategoryRule
from app.services.rule_engine import assign_category, create_rule_safe
from app.services.budget_service import recalculate_budget, get_budget_progress
from app.services.alert_service import check_and_create_budget_alert
from app.utils.logger import logger
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.transaction import RecategorizeRequest


# ✅ CREATE TRANSACTION

def create_transaction_service(transaction, db: Session):

    if transaction.amount < 0:
        raise ValueError("Negative amount not allowed")

    rules = db.query(CategoryRule).filter(
        CategoryRule.is_active == True
    ).order_by(CategoryRule.priority).all()

    if not transaction.category or transaction.category == "Uncategorized":
        category = assign_category(transaction, rules)
    else:
        category = transaction.category

    new_txn = Transaction(
    user_id=transaction.user_id,   
    account_id=transaction.account_id,
    description=transaction.description,
    category=category,
    amount=transaction.amount,
    currency=transaction.currency,
    txn_type=transaction.txn_type,
    merchant=transaction.merchant,
    txn_date=transaction.txn_date,
    posted_date=transaction.posted_date,
)

    db.add(new_txn)

    # ✅ SAFE BLOCK (NO CRASH)
    try:
        recalculate_budget(db, transaction.account_id, category)
        check_and_create_budget_alert(db, transaction.account_id, category)
    except Exception as e:
        print("⚠️ Budget/Alert error:", e)

    db.commit()
    db.refresh(new_txn)

    return new_txn
 


# ✅ RE-CATEGORIZE
def recategorize_transaction_service(
    txn_id: int,
    payload: RecategorizeRequest,
    current_user,
    db: Session,
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    account = db.query(Account).filter(Account.id == txn.account_id).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if not payload.category or payload.category.strip() == "":
        raise HTTPException(status_code=400, detail="Invalid category")

    old_category = txn.category
    new_category = payload.category.strip()

    txn.category = new_category

    logger.info(
        f"user_id={current_user.id} "
        f"action=recategorization "
        f"transaction_id={txn.id}"
    )

    if payload.create_rule:
        try:
            create_rule_safe(db, txn, current_user)
        except Exception:
            pass

    recalculate_budget(db, txn.account_id, old_category)
    recalculate_budget(db, txn.account_id, new_category)

    alert_triggered = check_and_create_budget_alert(
        db,
        txn.account_id,
        new_category
    )

    db.commit()
    db.refresh(txn)

    return {
        "message": "Category updated successfully",
        "progress_percentage": get_budget_progress(
            db, txn.account_id, new_category
        ),
        "alert_triggered": alert_triggered
    }