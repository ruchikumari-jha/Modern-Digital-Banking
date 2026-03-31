from sqlalchemy import Column, Integer, Boolean, ForeignKey, Text, Enum, TIMESTAMP, func
from app.database import Base
import enum
from sqlalchemy import Index


class AlertType(str, enum.Enum):
    low_balance = "low_balance"
    bill_due = "bill_due"
    budget_exceeded = "budget_exceeded"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    type = Column(Enum(AlertType), nullable=False)

    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_alerts_user_id", "user_id"),
        Index("idx_alerts_type", "type"),
        Index("idx_alerts_created_at", "created_at"),
        Index("idx_alerts_user_unread", "user_id", "is_read"),
    )