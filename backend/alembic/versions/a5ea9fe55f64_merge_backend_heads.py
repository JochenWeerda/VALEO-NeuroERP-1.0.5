"""Merge backend heads

Revision ID: a5ea9fe55f64
Revises: 000b7ee48002, 1e6d2f80f5a1
Create Date: 2025-09-18 12:11:47.849189

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5ea9fe55f64'
down_revision: Union[str, None] = ('000b7ee48002', '1e6d2f80f5a1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
