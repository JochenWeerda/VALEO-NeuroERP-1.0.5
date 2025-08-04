"""Add permissions and roles tables

Revision ID: 002_add_permissions_roles
Revises: 001_initial_schema
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_permissions_roles'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add tables for role-based access control (RBAC)
    Serena Quality: Comprehensive permission system with proper constraints
    """
    
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_system', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create permissions table
    op.create_table('permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('resource', sa.String(50), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create role_permissions junction table
    op.create_table('role_permissions',
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('role_id', 'permission_id')
    )
    
    # Create user_roles junction table
    op.create_table('user_roles',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('assigned_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'role_id')
    )
    
    # Create user_permissions table (for direct permission assignment)
    op.create_table('user_permissions',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('granted_by', sa.Integer(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['granted_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'permission_id')
    )
    
    # Create permission_dependencies table (for hierarchical permissions)
    op.create_table('permission_dependencies',
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.Column('depends_on_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['depends_on_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('permission_id', 'depends_on_id')
    )
    
    # Create indexes for better performance
    op.create_index('idx_roles_name', 'roles', ['name'])
    op.create_index('idx_permissions_name', 'permissions', ['name'])
    op.create_index('idx_permissions_resource_action', 'permissions', ['resource', 'action'])
    op.create_index('idx_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('idx_user_roles_role_id', 'user_roles', ['role_id'])
    op.create_index('idx_user_permissions_user_id', 'user_permissions', ['user_id'])
    op.create_index('idx_user_permissions_expires_at', 'user_permissions', ['expires_at'])
    
    # Add trigger for updated_at on roles table
    op.execute("""
        CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # Insert default roles
    op.execute("""
        INSERT INTO roles (name, display_name, description, is_system) VALUES
        ('super_admin', 'Super Administrator', 'Full system access with all permissions', true),
        ('admin', 'Administrator', 'Administrative access with most permissions', true),
        ('manager', 'Manager', 'Management access for business operations', true),
        ('accountant', 'Accountant', 'Financial and accounting access', true),
        ('warehouse', 'Warehouse Staff', 'Warehouse and inventory management', true),
        ('sales', 'Sales Staff', 'Sales and customer management', true),
        ('viewer', 'Viewer', 'Read-only access to most resources', true);
    """)
    
    # Insert default permissions
    op.execute("""
        INSERT INTO permissions (name, resource, action, description) VALUES
        -- Article permissions
        ('article.view', 'article', 'view', 'View articles'),
        ('article.create', 'article', 'create', 'Create new articles'),
        ('article.update', 'article', 'update', 'Update existing articles'),
        ('article.delete', 'article', 'delete', 'Delete articles'),
        ('article.export', 'article', 'export', 'Export article data'),
        ('article.import', 'article', 'import', 'Import article data'),
        
        -- Customer permissions
        ('customer.view', 'customer', 'view', 'View customers'),
        ('customer.create', 'customer', 'create', 'Create new customers'),
        ('customer.update', 'customer', 'update', 'Update existing customers'),
        ('customer.delete', 'customer', 'delete', 'Delete customers'),
        ('customer.export', 'customer', 'export', 'Export customer data'),
        
        -- Invoice permissions
        ('invoice.view', 'invoice', 'view', 'View invoices'),
        ('invoice.create', 'invoice', 'create', 'Create new invoices'),
        ('invoice.update', 'invoice', 'update', 'Update existing invoices'),
        ('invoice.delete', 'invoice', 'delete', 'Delete invoices'),
        ('invoice.approve', 'invoice', 'approve', 'Approve invoices'),
        ('invoice.cancel', 'invoice', 'cancel', 'Cancel invoices'),
        
        -- Order permissions
        ('order.view', 'order', 'view', 'View orders'),
        ('order.create', 'order', 'create', 'Create new orders'),
        ('order.update', 'order', 'update', 'Update existing orders'),
        ('order.delete', 'order', 'delete', 'Delete orders'),
        ('order.approve', 'order', 'approve', 'Approve orders'),
        
        -- Stock permissions
        ('stock.view', 'stock', 'view', 'View stock levels'),
        ('stock.update', 'stock', 'update', 'Update stock levels'),
        ('stock.inventory', 'stock', 'inventory', 'Perform inventory counts'),
        ('stock.movement', 'stock', 'movement', 'Create stock movements'),
        
        -- Report permissions
        ('report.view', 'report', 'view', 'View reports'),
        ('report.export', 'report', 'export', 'Export reports'),
        ('report.financial', 'report', 'financial', 'View financial reports'),
        
        -- System permissions
        ('system.settings', 'system', 'settings', 'Manage system settings'),
        ('user.manage', 'user', 'manage', 'Manage users and roles'),
        ('role.manage', 'role', 'manage', 'Manage roles and permissions'),
        ('backup.manage', 'backup', 'manage', 'Manage system backups'),
        
        -- Monitoring permissions
        ('monitoring.view', 'monitoring', 'view', 'View system monitoring'),
        ('log.view', 'log', 'view', 'View system logs');
    """)
    
    # Assign permissions to roles
    op.execute("""
        -- Super Admin gets all permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin';
        
        -- Admin gets all except system permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'admin' AND p.resource NOT IN ('system', 'backup', 'role');
        
        -- Manager permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'manager' AND p.name IN (
            'article.view', 'article.create', 'article.update',
            'customer.view', 'customer.create', 'customer.update',
            'invoice.view', 'invoice.create', 'invoice.update', 'invoice.approve',
            'order.view', 'order.create', 'order.update', 'order.approve',
            'stock.view', 'report.view', 'report.export'
        );
        
        -- Accountant permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'accountant' AND p.name IN (
            'customer.view', 'invoice.view', 'invoice.create', 'invoice.update',
            'report.view', 'report.export', 'report.financial'
        );
        
        -- Warehouse permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'warehouse' AND p.name IN (
            'article.view', 'article.update',
            'stock.view', 'stock.update', 'stock.inventory', 'stock.movement'
        );
        
        -- Sales permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'sales' AND p.name IN (
            'customer.view', 'customer.create', 'customer.update',
            'invoice.view', 'invoice.create',
            'order.view', 'order.create'
        );
        
        -- Viewer permissions
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'viewer' AND p.action = 'view';
    """)
    
    # Create function to check permissions
    op.execute("""
        CREATE OR REPLACE FUNCTION user_has_permission(
            p_user_id INTEGER,
            p_permission_name VARCHAR
        ) RETURNS BOOLEAN AS $$
        BEGIN
            -- Check direct user permissions
            IF EXISTS (
                SELECT 1 FROM user_permissions up
                JOIN permissions p ON up.permission_id = p.id
                WHERE up.user_id = p_user_id 
                AND p.name = p_permission_name
                AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
            ) THEN
                RETURN TRUE;
            END IF;
            
            -- Check role permissions
            IF EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN role_permissions rp ON ur.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE ur.user_id = p_user_id 
                AND p.name = p_permission_name
            ) THEN
                RETURN TRUE;
            END IF;
            
            RETURN FALSE;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Create view for user permissions
    op.execute("""
        CREATE VIEW user_permissions_view AS
        SELECT DISTINCT
            u.id as user_id,
            u.username,
            u.email,
            p.id as permission_id,
            p.name as permission_name,
            p.resource,
            p.action,
            CASE 
                WHEN up.user_id IS NOT NULL THEN 'direct'
                WHEN ur.user_id IS NOT NULL THEN 'role'
            END as source,
            COALESCE(r.name, 'direct_grant') as source_name
        FROM users u
        LEFT JOIN user_permissions up ON u.id = up.user_id
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON p.id = up.permission_id OR p.id = rp.permission_id
        WHERE p.id IS NOT NULL
        AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP);
    """)


def downgrade() -> None:
    """Remove RBAC tables and related objects"""
    
    # Drop views and functions
    op.execute("DROP VIEW IF EXISTS user_permissions_view")
    op.execute("DROP FUNCTION IF EXISTS user_has_permission")
    
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_roles_updated_at ON roles")
    
    # Drop indexes
    op.drop_index('idx_user_permissions_expires_at', table_name='user_permissions')
    op.drop_index('idx_user_permissions_user_id', table_name='user_permissions')
    op.drop_index('idx_user_roles_role_id', table_name='user_roles')
    op.drop_index('idx_user_roles_user_id', table_name='user_roles')
    op.drop_index('idx_permissions_resource_action', table_name='permissions')
    op.drop_index('idx_permissions_name', table_name='permissions')
    op.drop_index('idx_roles_name', table_name='roles')
    
    # Drop tables
    op.drop_table('permission_dependencies')
    op.drop_table('user_permissions')
    op.drop_table('user_roles')
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    op.drop_table('roles')