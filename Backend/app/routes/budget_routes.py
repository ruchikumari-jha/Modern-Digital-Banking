from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post("/")
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):

    budget = Budget(
        account_id=data.account_id,
        month=data.month,
        year=data.year,
        category=data.category,
        limit_amount=data.limit_amount
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return {
        "id": budget.id,
        "category": budget.category,
        "limit": float(budget.limit_amount),
        "spent": float(budget.spent_amount or 0)
    }


@router.patch("/{budget_id}")
def update_budget(budget_id: int, limit_amount: float, db: Session = Depends(get_db)):

    budget = db.query(Budget).filter(Budget.id == budget_id).first()

    if not budget:
        return {"error": "Budget not found"}

    budget.limit_amount = limit_amount
    db.commit()

    return {"success": True}


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):

    budget = db.query(Budget).filter(Budget.id == budget_id).first()

    if not budget:
        return {"error": "Not found"}

    db.delete(budget)
    db.commit()

    return {"success": True}


@router.get("/")
def get_budgets(account_id: int, month: int, year: int, db: Session = Depends(get_db)):

    budgets = db.query(Budget).filter(
        Budget.account_id == account_id,
        Budget.month == month,
        Budget.year == year
    ).all()

    return [
        {
            "id": b.id,
            "category": b.category,
            "limit": float(b.limit_amount),
            "spent": float(b.spent_amount or 0)
        }
        for b in budgets
    ]