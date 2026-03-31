from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True, index=True)

    base_currency = Column(String(10), nullable=False)

    target_currency = Column(String(10), nullable=False)

    rate = Column(Numeric(10, 4), nullable=False)

    fetched_at = Column(TIMESTAMP, server_default=func.now())