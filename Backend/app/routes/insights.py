from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from sqlalchemy import text

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("/cashflow")
def get_cashflow(user_id: int, db: Session = Depends(get_db)):

    query = """
    SELECT 
        DATE_TRUNC('month', t.txn_date) AS month,
        SUM(CASE WHEN t.txn_type = 'credit' THEN t.amount ELSE 0 END) AS income,
        SUM(CASE WHEN t.txn_type = 'debit' THEN t.amount ELSE 0 END) AS expense
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = :user_id
    GROUP BY DATE_TRUNC('month', t.txn_date)
    ORDER BY DATE_TRUNC('month', t.txn_date);
    """

    result = db.execute(text(query), {"user_id": user_id}).fetchall()

    return [
        {
            "month": row[0].strftime("%Y-%m"),
            "income": float(row[1] or 0),
            "expense": float(row[2] or 0)
        }
        for row in result
    ]

@router.get("/top-merchants")
def top_merchants(user_id: int, db: Session = Depends(get_db)):

    query = """
    SELECT t.merchant, SUM(t.amount) AS total_spent
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = :user_id AND t.txn_type = 'debit'
    GROUP BY t.merchant
    ORDER BY total_spent DESC
    LIMIT 5;
    """

    result = db.execute(text(query), {"user_id": user_id}).fetchall()

    return [{"merchant": r[0], "total": float(r[1])} for r in result]

@router.get("/category-spend")
def category_spend(user_id: int, db: Session = Depends(get_db)):

    query = """
    SELECT t.category, SUM(t.amount) AS total
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = :user_id AND t.txn_type = 'debit'
    GROUP BY t.category;
    """

    result = db.execute(text(query), {"user_id": user_id}).fetchall()

    return [{"category": r[0], "total": float(r[1])} for r in result]
    

@router.get("/burn-rate")
def burn_rate(user_id: int, db: Session = Depends(get_db)):

    query = """
    SELECT 
        category,
        limit_amount,
        spent_amount,
        CASE 
            WHEN limit_amount = 0 THEN 0
            ELSE (spent_amount / limit_amount) * 100
        END AS burn_rate
    FROM budgets
    WHERE user_id = :user_id;
    """

    result = db.execute(text(query), {"user_id": user_id}).fetchall()

    result = db.execute(text(query), {"user_id": user_id}).fetchall()

    if not result:
        return []

    response = []
    for r in result:
        limit = float(r[1] or 0)
        spent = float(r[2] or 0)
        burn = float(r[3] or 0)

        response.append({
            "category": r[0],
            "limit": limit,
            "spent": spent,
            "burn_rate": burn
        })

    return response