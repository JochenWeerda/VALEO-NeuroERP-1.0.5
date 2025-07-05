"""
Erstellt die Tabellen für die Transaktionsverarbeitung.

Revision ID: create_transaction_tables
Revises: 9a3b7c8d6e5f
Create Date: 2025-07-04 12:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'create_transaction_tables'
down_revision = '9a3b7c8d6e5f'
branch_labels = None
depends_on = None


def upgrade():
    # Erstelle die Accounts-Tabelle zuerst
    op.create_table(
        'accounts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('balance', sa.Numeric(15, 2), nullable=False),
        sa.Column('active', sa.Boolean, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False)
    )

    # Erstelle die Transactions-Tabelle mit Fremdschlüssel
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('reference', sa.String(100)),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('account_id', sa.Integer, nullable=False),
        sa.Column('batch_id', sa.String(50)),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'])
    )

    # Erstelle die Artikel-Tabelle
    op.create_table(
        'artikel',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('artikelnummer', sa.String(50), unique=True, nullable=False),
        sa.Column('bezeichnung', sa.String(255), nullable=False),
        sa.Column('beschreibung', sa.Text),
        sa.Column('einheit', sa.String(20)),
        sa.Column('preis', sa.Numeric(10, 2), nullable=False),
        sa.Column('waehrung', sa.String(3), nullable=False),
        sa.Column('kategorie', sa.String(100)),
        sa.Column('lagerbestand', sa.Integer, nullable=False),
        sa.Column('lieferant', sa.String(100)),
        sa.Column('aktiv', sa.Boolean, nullable=False),
        sa.Column('erstellt_am', sa.DateTime, nullable=False),
        sa.Column('geaendert_am', sa.DateTime, nullable=False),
        sa.Column('min_bestand', sa.Integer),
        sa.Column('max_bestand', sa.Integer),
        sa.Column('gewicht', sa.Numeric(10, 3)),
        sa.Column('dimension', sa.JSON),
        sa.Column('tags', sa.JSON)
    )


def downgrade():
    op.drop_table('transactions')
    op.drop_table('artikel')
    op.drop_table('accounts') 