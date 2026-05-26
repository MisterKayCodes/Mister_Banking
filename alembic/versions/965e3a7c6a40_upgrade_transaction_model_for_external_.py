"""upgrade_transaction_model_for_external_transfers

Revision ID: 965e3a7c6a40
Revises: cd8b00e9c0e6
Create Date: [keep your original date]
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '965e3a7c6a40'
down_revision = 'cd8b00e9c0e6'
branch_labels = None
depends_on = None

def upgrade():
    # All columns already exist in the database
    # This migration is complete - nothing to do
    pass

def downgrade():
    # No downgrade needed
    pass