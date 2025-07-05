"""add_notification_system

Revision ID: 2023_08_10_notifications
Revises: add_escalation_management
Create Date: 2023-08-10 14:30:15.123456

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '2023_08_10_notifications'
down_revision = 'add_escalation_management'
branch_labels = None
depends_on = None


def upgrade():
    # Erstelle Enum-Typen für die Benachrichtigungstypen
    notification_type = postgresql.ENUM(
        'EMAIL', 'SMS', 'PUSH', 'IN_APP', 
        name='notificationtype'
    )
    notification_type.create(op.get_bind())
    
    # Erstelle Enum-Typen für die Benachrichtigungsprioritäten
    notification_priority = postgresql.ENUM(
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 
        name='notificationpriority'
    )
    notification_priority.create(op.get_bind())
    
    # Erstelle Tabelle für Benachrichtigungseinstellungen
    op.create_table(
        'notification_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('notification_type', sa.Enum('EMAIL', 'SMS', 'PUSH', 'IN_APP', name='notificationtype'), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=True, default=True),
        sa.Column('for_emergency_creation', sa.Boolean(), nullable=True, default=True),
        sa.Column('for_emergency_update', sa.Boolean(), nullable=True, default=True),
        sa.Column('for_emergency_escalation', sa.Boolean(), nullable=True, default=True),
        sa.Column('for_emergency_resolution', sa.Boolean(), nullable=True, default=True),
        sa.Column('minimum_severity', sa.String(20), nullable=True, default="MEDIUM"),
        sa.Column('minimum_escalation_level', sa.String(20), nullable=True, default="LEVEL1"),
        sa.Column('contact_information', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Erstelle Index für user_id in notification_settings
    op.create_index(
        op.f('ix_notification_settings_user_id'),
        'notification_settings',
        ['user_id'],
        unique=False
    )
    
    # Erstelle Tabelle für Benachrichtigungslogs
    op.create_table(
        'notification_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('notification_type', sa.Enum('EMAIL', 'SMS', 'PUSH', 'IN_APP', name='notificationtype'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='notificationpriority'), nullable=True),
        sa.Column('related_entity_type', sa.String(50), nullable=True),
        sa.Column('related_entity_id', sa.Integer(), nullable=True),
        sa.Column('is_sent', sa.Boolean(), nullable=True, default=False),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Erstelle Indizes für notification_logs
    op.create_index(
        op.f('ix_notification_logs_user_id'),
        'notification_logs',
        ['user_id'],
        unique=False
    )
    
    op.create_index(
        op.f('ix_notification_logs_notification_type'),
        'notification_logs',
        ['notification_type'],
        unique=False
    )
    
    op.create_index(
        op.f('ix_notification_logs_related_entity_type'),
        'notification_logs',
        ['related_entity_type', 'related_entity_id'],
        unique=False
    )
    
    # Erstelle Standardeinstellungen für Systembenutzer (falls vorhanden)
    op.execute("""
    INSERT INTO notification_settings 
    (user_id, notification_type, is_enabled, for_emergency_creation, for_emergency_update, 
     for_emergency_escalation, for_emergency_resolution, minimum_severity, 
     minimum_escalation_level, contact_information, created_at, updated_at)
    SELECT 
        id, 
        'EMAIL'::notificationtype, 
        TRUE, 
        TRUE, 
        TRUE, 
        TRUE, 
        TRUE, 
        'MEDIUM', 
        'LEVEL1', 
        email, 
        NOW(), 
        NOW()
    FROM users
    WHERE is_active = TRUE AND email IS NOT NULL;
    """)


def downgrade():
    # Lösche die Tabellen
    op.drop_index(op.f('ix_notification_logs_related_entity_type'), table_name='notification_logs')
    op.drop_index(op.f('ix_notification_logs_notification_type'), table_name='notification_logs')
    op.drop_index(op.f('ix_notification_logs_user_id'), table_name='notification_logs')
    op.drop_table('notification_logs')
    
    op.drop_index(op.f('ix_notification_settings_user_id'), table_name='notification_settings')
    op.drop_table('notification_settings')
    
    # Lösche die Enum-Typen
    op.execute('DROP TYPE IF EXISTS notificationpriority;')
    op.execute('DROP TYPE IF EXISTS notificationtype;') 