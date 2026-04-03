import enum

from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Index
from app.database import Base


class BillStatus(enum.Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"



class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    account_id = Column(Integer, nullable=False)

    biller_name = Column(String(100), nullable=False)

    due_date = Column(Date, nullable=False)

    amount_due = Column(Numeric(15, 2), nullable=False)

    status = Column(SQLAlchemyEnum(BillStatus), default=BillStatus.upcoming, nullable=False)

    auto_pay = Column(Boolean, default=False)

    last_reminder_sent = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())

    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


    __table_args__ = (
        Index("idx_bills_user_id", "user_id"),
        Index("idx_bills_due_date", "due_date"),
        Index("idx_bills_status", "status"),
        Index("idx_bills_user_status", "user_id", "status"),
    )