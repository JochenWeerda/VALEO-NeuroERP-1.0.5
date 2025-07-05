"""add_escalation_management

Revision ID: a3f8c5b24de1
Revises: e75a9b1c8a3f
Create Date: 2023-08-05 14:25:32.451827

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a3f8c5b24de1'
down_revision = 'e75a9b1c8a3f'
branch_labels = None
depends_on = None


def upgrade():
    # Erstellen der Eskalationsstufen-Enum
    escalation_level_enum = postgresql.ENUM(
        'LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5',
        name='escalationlevel'
    )
    escalation_level_enum.create(op.get_bind())
    
    # Erstellen der emergency_escalations-Tabelle
    op.create_table(
        'emergency_escalations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('emergency_id', sa.Integer(), nullable=False),
        sa.Column('escalation_level', sa.Enum('LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5', name='escalationlevel'), nullable=False),
        sa.Column('escalated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('escalated_by_id', sa.Integer(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('escalation_recipients', sa.Text(), nullable=True),
        sa.Column('acknowledgement_required', sa.Boolean(), nullable=True, server_default=sa.text('true')),
        sa.Column('acknowledgement_time', sa.DateTime(), nullable=True),
        sa.Column('acknowledged_by_id', sa.Integer(), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['acknowledged_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['emergency_id'], ['emergency_cases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['escalated_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Erstellen eines Index auf emergency_id für schnellere Abfragen
    op.create_index(op.f('ix_emergency_escalations_emergency_id'), 'emergency_escalations', ['emergency_id'], unique=False)
    
    # Erstellen eines Index auf escalation_level für schnellere Filterung
    op.create_index(op.f('ix_emergency_escalations_escalation_level'), 'emergency_escalations', ['escalation_level'], unique=False)


def downgrade():
    # Löschen der Indizes
    op.drop_index(op.f('ix_emergency_escalations_escalation_level'), table_name='emergency_escalations')
    op.drop_index(op.f('ix_emergency_escalations_emergency_id'), table_name='emergency_escalations')
    
    # Löschen der Tabelle
    op.drop_table('emergency_escalations')
    
    # Löschen der Enum
    postgresql.ENUM(name='escalationlevel').drop(op.get_bind()) 