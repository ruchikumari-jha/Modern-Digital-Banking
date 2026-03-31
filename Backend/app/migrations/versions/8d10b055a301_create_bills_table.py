"""create bills table

Revision ID: 8d10b055a301
Revises:
Create Date: 2026-03-11 22:15:33.327707
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers

revision: str = "8d10b055a301"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""


    op.create_table(
        "bills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("biller_name", sa.String(length=100), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("amount_due", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column(
            "status",
            sa.Enum("upcoming", "paid", "overdue", name="billstatus"),
            nullable=True,
        ),
        sa.Column("auto_pay", sa.Boolean(), nullable=True),
        sa.Column("last_reminder_sent", sa.TIMESTAMP(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_bills_due_date", "bills", ["due_date"], unique=False)
    op.create_index("idx_bills_status", "bills", ["status"], unique=False)
    op.create_index("idx_bills_user_id", "bills", ["user_id"], unique=False)
    op.create_index(
        "idx_bills_user_status",
        "bills",
        ["user_id", "status"],
        unique=False,
    )
    

def downgrade() -> None:
    """Downgrade schema."""

    
    op.drop_index("idx_bills_user_status", table_name="bills")
    op.drop_index("idx_bills_user_id", table_name="bills")
    op.drop_index("idx_bills_status", table_name="bills")
    op.drop_index("idx_bills_due_date", table_name="bills")
    op.drop_table("bills")
    
