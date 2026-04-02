from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import csv
from app.database import get_db
from app.schemas.transaction import TransactionCreate, RecategorizeRequest
from app.services.transaction_service import (
    create_transaction_service,
    recategorize_transaction_service
)
from app.models.transaction import Transaction
from app.dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# ✅ GET TRANSACTIONS (with pagination + filters)
@router.get("/")
def get_transactions(
    account_id: int,
    page: int = 1,
    limit: int = 1000,  # ✅ show more data
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  # ✅ secure
):
    skip = (page - 1) * limit

    # ✅ Ensure user owns this account
    query = db.query(Transaction).filter(
        Transaction.account_id == account_id,
        Transaction.user_id == current_user.id  # 🔥 IMPORTANT
    )

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    if category:
        query = query.filter(Transaction.category == category)

    total = query.count()

    transactions = query.order_by(Transaction.txn_date.desc()).offset(skip).limit(limit).all()

    return {
        "transactions": transactions,
        "currentPage": page,
        "limit": limit,
        "totalTransactions": total,
        "totalPages": (total + limit - 1) // limit
    }


# ✅ CREATE TRANSACTIONS (CSV IMPORT)
@router.post("/")
def create_transactions_from_csv(
    db: Session = Depends(get_db),
):
    with open("app/transactions_user15_account16.csv", "r") as file:
        reader = csv.DictReader(file)

        for data in reader:
            txn = TransactionCreate(
                user_id=int(data["user_id"]),
                account_id=int(data["account_id"]),
                description=data["description"],
                category=data.get("category"),
                amount=float(data["amount"]),
                currency=data["currency"],
                txn_type=data["txn_type"],
                merchant=data.get("merchant"),
                txn_date=data["txn_date"],
                posted_date=data["posted_date"],
            )

            create_transaction_service(txn, db)

    return {"message": "Transactions imported successfully"}


# ✅ RE-CATEGORIZE TRANSACTION (PATCH + PUT supported)
@router.patch("/{txn_id}/category")
@router.put("/{txn_id}/category")
def recategorize_transaction(
    txn_id: int,
    payload: RecategorizeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return recategorize_transaction_service(
        txn_id,
        payload,
        current_user,
        db
    )