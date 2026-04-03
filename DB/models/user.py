from sqlalchemy import Column, Integer, String, TIMESTAMP
from app.database import Base
from datetime import datetime

# -------------UserTavle------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    kyc_status = Column(String(20), default="unverified")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)