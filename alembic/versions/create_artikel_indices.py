"""Artikel Indizes

Revision ID: 8aacdc96b4ff
Revises: create_transaction_tables
Create Date: 2025-07-04 12:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8aacdc96b4ff'
down_revision = 'create_transaction_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Indizes für häufig verwendete Suchfelder
    op.create_index('idx_artikel_artikelnummer', 'artikel', ['artikelnummer'], unique=True)
    op.create_index('idx_artikel_bezeichnung', 'artikel', ['bezeichnung'])
    op.create_index('idx_artikel_kategorie', 'artikel', ['kategorie'])
    op.create_index('idx_artikel_lieferant', 'artikel', ['lieferant'])
    op.create_index('idx_artikel_preis', 'artikel', ['preis'])
    op.create_index('idx_artikel_lagerbestand', 'artikel', ['lagerbestand'])
    op.create_index('idx_artikel_aktiv', 'artikel', ['aktiv'])
    
    # Zusammengesetzter Index für häufige Filterung
    op.create_index('idx_artikel_kategorie_aktiv', 'artikel', ['kategorie', 'aktiv'])
    op.create_index('idx_artikel_lieferant_aktiv', 'artikel', ['lieferant', 'aktiv'])

def downgrade():
    op.drop_index('idx_artikel_lieferant_aktiv')
    op.drop_index('idx_artikel_kategorie_aktiv')
    op.drop_index('idx_artikel_aktiv')
    op.drop_index('idx_artikel_lagerbestand')
    op.drop_index('idx_artikel_preis')
    op.drop_index('idx_artikel_lieferant')
    op.drop_index('idx_artikel_kategorie')
    op.drop_index('idx_artikel_bezeichnung')
    op.drop_index('idx_artikel_artikelnummer') 