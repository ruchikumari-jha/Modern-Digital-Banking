from pydantic import BaseModel
from datetime import datetime
from typing import Literal
from  decimal import Decimal
from typing import Optional

class AccountCreate(BaseModel):
    
    bank_name: str
    account_type: Literal["savings", "checking", "credit_card", "loan", "investment"]
    account_number:str
    currency: str
    # balance: Decimal
    pin_hash:str
    


class AccountOut(BaseModel):
    id: int
    user_id: int
    bank_name: str
    account_type: str
    account_number: str
    currency: str
    balance: Optional[float] = None
    created_at: Optional[datetime] = None

class AccountIdOut(BaseModel):
    id:int

    class Config:
        from_attributes = True
