from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, TIMESTAMP, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)

    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    category = Column(String(50), nullable=False)

    limit_amount = Column(Numeric(12,2), nullable=False)
    spent_amount = Column(Numeric(12,2), default=0)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("account_id", "month", "year", "category", name="unique_budget"),

        Index("idx_budgets_account_id", "account_id"),
        Index("idx_budgets_month_year", "year", "month"),
        Index("idx_budgets_account_month_year", "account_id", "year", "month"),
    )