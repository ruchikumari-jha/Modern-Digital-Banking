from pydantic import BaseModel
from datetime import datetime


class BudgetCreate(BaseModel):
  
    account_id:int
    month: int
    year: int
    category: str
    limit_amount: float


class BudgetOut(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    category: str
    limit_amount: float
    spent_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True