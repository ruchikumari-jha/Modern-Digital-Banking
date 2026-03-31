from pydantic import BaseModel
from datetime import date, datetime
from enum import Enum


class BillStatus(str, Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"


class BillBase(BaseModel):
    
    biller_name: str
    due_date: date
    amount_due: float
    status: BillStatus = BillStatus.upcoming
    auto_pay: bool = False

class BillCreate(BaseModel):
    user_id: int
    account_id:int
    biller_name: str
    due_date: date
    amount_due: float
    auto_pay: bool


class BillUpdate(BaseModel):
    biller_name: str | None = None
    due_date: date | None = None
    amount_due: float | None = None
    status: BillStatus | None = None
    auto_pay: bool | None = None


class BillResponse(BaseModel):
    id: int
    user_id: int
    biller_name: str
    due_date: date
    amount_due: float
    auto_pay: bool
    status: str

    class Config:
        from_attributes = True