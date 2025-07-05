"""add_tour_mode

Revision ID: 2d262ca4226b
Revises: 9c70cf8e643c
Create Date: 2024-03-21 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.schemas.odata_schemas import TourMode

# revision identifiers, used by Alembic.
revision: str = '2d262ca4226b'
down_revision: Union[str, None] = '9c70cf8e643c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Erstelle den TourMode Enum-Typ
    tour_mode = sa.Enum(TourMode, name='tourmode')
    tour_mode.create(op.get_bind())
    
    # Füge die mode-Spalte hinzu
    op.add_column('touren', sa.Column('mode', sa.Enum(TourMode, name='tourmode'), 
                                    server_default=TourMode.STANDARD.value,
                                    nullable=False))

def downgrade() -> None:
    # Entferne die mode-Spalte
    op.drop_column('touren', 'mode')
    
    # Entferne den TourMode Enum-Typ
    tour_mode = sa.Enum(TourMode, name='tourmode')
    tour_mode.drop(op.get_bind())
