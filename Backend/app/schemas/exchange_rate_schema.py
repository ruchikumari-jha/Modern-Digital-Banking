from pydantic import BaseModel
from datetime import datetime


class ExchangeRateBase(BaseModel):
    base_currency: str
    target_currency: str
    rate: float


class ExchangeRateCreate(ExchangeRateBase):
    pass


class ExchangeRateResponse(ExchangeRateBase):
    id: int
    fetched_at: datetime

    class Config:
        orm_mode = True