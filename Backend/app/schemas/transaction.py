from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class TransactionCreate(BaseModel):
    user_id:int
    account_id: int
    description: str
    category: Optional[str] = None
    amount: float
    currency: str
    txn_type: Literal["debit", "credit"]
    merchant: Optional[str] = None
    txn_date: datetime
    posted_date: Optional[datetime] = None

class RecategorizeRequest(BaseModel):
    category: str
    create_rule: Optional[bool] = False


class TransactionOut(BaseModel):
    id: int
    account_id: int
    description: str
    category: Optional[str] = None
    amount: float
    currency: str
    txn_type: str
    merchant: Optional[str] = None
    txn_date: datetime
    posted_date: Optional[datetime] = None
    is_categorized: bool
    created_at: datetime


