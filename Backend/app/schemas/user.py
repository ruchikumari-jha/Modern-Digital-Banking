from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.schemas.account import AccountOut


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    kyc_status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserAccountOut(BaseModel):
    user: UserOut
    account: AccountOut

    class Config:
        from_attributes = True