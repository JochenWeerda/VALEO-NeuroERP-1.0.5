"""Merge multiple heads for unified history

Revision ID: 0d757c15291b
Revises: 001, 8aacdc96b4ff
Create Date: 2025-09-18 12:09:50.097201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d757c15291b'
down_revision: Union[str, None] = ('001', '8aacdc96b4ff')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
