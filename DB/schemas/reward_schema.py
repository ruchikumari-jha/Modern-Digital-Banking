from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RewardBase(BaseModel):
    program_name: str
    points_balance: int = 0


class RewardCreate(RewardBase):
    user_id: int


class RewardUpdate(BaseModel):
    program_name: Optional[str] = None
    points_balance: Optional[int] = None


class RewardResponse(RewardBase):
    id: int
    user_id: int
    last_updated: datetime
    created_at: datetime

    class Config:
        orm_mode = True