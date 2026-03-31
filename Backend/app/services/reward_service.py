from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.reward import Reward


def calculate_rewards(db: Session, user_id: int):
    
    total_spent = (
        db.query(func.sum(Transaction.amount))
        .join(Account, Account.id == Transaction.account_id)
        .filter(
            Account.user_id == user_id,
            Transaction.txn_type == "debit"
        )
        .scalar()
    )

    if total_spent is None:
        total_spent = 0

    reward_points = int(total_spent // 100)

    return {
        "user_id": user_id,
        "total_spent": float(total_spent),
        "reward_points": reward_points
    }

def get_rewards_by_user(db: Session, user_id: int):
    return db.query(Reward).filter(Reward.user_id == user_id).first()