from pydantic import BaseModel
from datetime import datetime


class AlertCreate(BaseModel):
    user_id: int
    type: str
    message: str


class AlertOut(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True