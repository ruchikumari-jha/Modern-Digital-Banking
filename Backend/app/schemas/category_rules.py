from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryRuleCreate(BaseModel):
    
    category: str
    keyword_pattern: Optional[str] = None
    merchant_pattern: Optional[str] = None
    priority: int = 0
    is_active: bool = True


class CategoryRuleOut(BaseModel):
    id: int
    user_id: int
    category: str
    keyword_pattern: Optional[str]
    merchant_pattern: Optional[str]
    priority: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True