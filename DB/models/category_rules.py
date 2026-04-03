from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP, Index
from sqlalchemy.sql import func
from app.database import Base


class CategoryRule(Base):
    __tablename__ = "category_rules"

    id = Column(Integer, primary_key=True, index=True)

   

    category = Column(String(50), nullable=False)

    keyword_pattern = Column(String(255), nullable=True)
    merchant_pattern = Column(String(255), nullable=True)

    priority = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
       
        Index("idx_category_rules_active", "is_active"),
    )