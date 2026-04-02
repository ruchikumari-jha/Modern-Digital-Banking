from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.report_service import get_spending_by_category
from app.utils.jwt_handler import verify_token 

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/spending-by-category")
def get_spending_by_category_report(
    month: int,
    year: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    user_id: int = Depends(verify_token),   # 🔐 get token payload
):

    #  Extract user_id from token
      # or token_data["sub"]

    # ---------- Validation ----------
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")

    if year < 2000 or year > 2100:
        raise HTTPException(status_code=400, detail="Invalid year")

    # ---------- Fetch report ----------
    data = get_spending_by_category(
        db,
        user_id,
        month,
        year,
        skip,
        limit,
    )

    response = [
        {
            "category": row.category,
            "total_spent": float(row.total_spent)
        }
        for row in data
    ]

    return {
        "month": month,
        "year": year,
        "results": response
    }

