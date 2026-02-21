"""added_crypto_wallets_and_kyc_status

Revision ID: ab7c75bc0d69
Revises: 5fda235291f9
Create Date: 2026-02-20 21:05:30.930930

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ab7c75bc0d69'
down_revision: Union[str, Sequence[str], None] = '5fda235291f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create the Wallets Table
    op.create_table(
        'wallets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('btc_address', sa.String(), nullable=True),
        sa.Column('usdt_address', sa.String(), nullable=True),
        sa.Column('btc_balance', sa.Numeric(precision=18, scale=8), nullable=True),
        sa.Column('usdt_balance', sa.Numeric(precision=18, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_wallets_btc_address'), 'wallets', ['btc_address'], unique=True)
    op.create_index(op.f('ix_wallets_id'), 'wallets', ['id'], unique=False)
    op.create_index(op.f('ix_wallets_usdt_address'), 'wallets', ['usdt_address'], unique=True)

    # 2. Add kyc_status to Users Table
    # Using batch_alter_table for SQLite compatibility
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('kyc_status', sa.String(), server_default='unverified', nullable=True))

def downgrade() -> None:
    # Remove the column from users
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('kyc_status')

    # Drop the wallets table
    op.drop_index(op.f('ix_wallets_usdt_address'), table_name='wallets')
    op.drop_index(op.f('ix_wallets_id'), table_name='wallets')
    op.drop_index(op.f('ix_wallets_btc_address'), table_name='wallets')
    op.drop_table('wallets')