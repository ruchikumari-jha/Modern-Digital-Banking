from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, TIMESTAMP
from app.database import Base
from datetime import datetime
from decimal import Decimal

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    bank_name = Column(String(100))
    account_type = Column(String(50))
    account_number = Column(String(50))
    currency = Column(String(3))
    balance = Column(Numeric(15,2), default=Decimal("0.00"))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    pin_hash = Column(String(255))
