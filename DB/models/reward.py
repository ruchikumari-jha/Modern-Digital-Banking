from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.database import Base


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    program_name = Column(String(100), nullable=False)

    points_balance = Column(Integer, default=0)

    last_updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "program_name", name="unique_user_program"),
        Index("idx_rewards_user_id", "user_id"),
    )