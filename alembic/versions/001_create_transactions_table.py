"""create transactions table

Revision ID: 001
Revises: 
Create Date: 2025-07-06 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('reference', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_transactions_user_id'),
        'transactions',
        ['user_id'],
        unique=False
    )
    op.create_index(
        op.f('ix_transactions_type'),
        'transactions',
        ['type'],
        unique=False
    )
    op.create_index(
        op.f('ix_transactions_reference'),
        'transactions',
        ['reference'],
        unique=True
    )
    op.create_index(
        op.f('ix_transactions_status'),
        'transactions',
        ['status'],
        unique=False
    )

def downgrade():
    op.drop_index(op.f('ix_transactions_status'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_reference'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_type'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_user_id'), table_name='transactions')
    op.drop_table('transactions') 