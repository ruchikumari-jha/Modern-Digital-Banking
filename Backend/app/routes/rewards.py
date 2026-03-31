from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.reward_service import calculate_rewards
from fastapi import HTTPException

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/{user_id}")
def get_rewards(user_id: int, db: Session = Depends(get_db)):

    rewards = calculate_rewards(db, user_id)

    return rewards

@router.post("/redeem/{user_id}")
def redeem_points(user_id: int, db: Session = Depends(get_db)):

    rewards = calculate_rewards(db, user_id)

    if rewards["reward_points"] <= 0:
        raise HTTPException(status_code=400, detail="No points to redeem")

    redeemed_amount = rewards["reward_points"]

    # 👉 OPTIONAL: store redeemed points somewhere (later)

    return {
        "message": "Points redeemed successfully",
        "redeemed_amount": redeemed_amount
    }