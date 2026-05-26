"""add_bridge_columns_to_transactions

Revision ID: 2c5e1279c2f6
Revises: 01a7f6ae4419
Create Date: 2026-05-26 23:01:20.522177

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c5e1279c2f6'
down_revision: Union[str, Sequence[str], None] = '01a7f6ae4419'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add bridge columns to transactions table."""
    # Add confirmations column (tracks 0/6 to 6/6)
    try:
        op.add_column('transactions', sa.Column('confirmations', sa.Integer(), server_default='0'))
    except Exception:
        pass  # Column already exists
    
    # Add bridge_transfer_id column (stores Fchain's transaction ID)
    try:
        op.add_column('transactions', sa.Column('bridge_transfer_id', sa.String(255), nullable=True))
    except Exception:
        pass  # Column already exists
    
    # Add is_bridge column (marks if this came from Fchain)
    try:
        op.add_column('transactions', sa.Column('is_bridge', sa.Boolean(), server_default='0'))
    except Exception:
        pass  # Column already exists


def downgrade() -> None:
    """Remove bridge columns from transactions table."""
    # Remove confirmations column
    try:
        op.drop_column('transactions', 'confirmations')
    except Exception:
        pass  # Column doesn't exist
    
    # Remove bridge_transfer_id column
    try:
        op.drop_column('transactions', 'bridge_transfer_id')
    except Exception:
        pass  # Column doesn't exist
    
    # Remove is_bridge column
    try:
        op.drop_column('transactions', 'is_bridge')
    except Exception:
        pass  # Column doesn't exist