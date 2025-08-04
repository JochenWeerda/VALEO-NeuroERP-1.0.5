"""
Initial database schema migration

Revision ID: 001
Revises: 
Create Date: 2024-01-04 09:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Create initial database schema"""
    
    # Enable extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Customers table
    op.create_table('customers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_number', sa.String(20), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('address', sa.String(500), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('postal_code', sa.String(10), nullable=False),
        sa.Column('country', sa.String(2), server_default='DE', nullable=True),
        sa.Column('email', sa.String(200), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('fax', sa.String(50), nullable=True),
        sa.Column('website', sa.String(200), nullable=True),
        sa.Column('tax_number', sa.String(50), nullable=True),
        sa.Column('vat_id', sa.String(50), nullable=True),
        sa.Column('credit_limit', sa.Numeric(12, 2), server_default='0', nullable=True),
        sa.Column('payment_terms', sa.Integer(), server_default='14', nullable=True),
        sa.Column('discount_percentage', sa.Numeric(5, 2), server_default='0', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('customer_number')
    )
    
    # Indexes for customers
    op.create_index('idx_customers_number', 'customers', ['customer_number'])
    op.create_index('idx_customers_name', 'customers', ['name'])
    op.create_index('idx_customers_city', 'customers', ['city'])
    op.create_index('idx_customers_active', 'customers', ['active'], postgresql_where=sa.text('active = true'))
    
    # Articles table
    op.create_table('articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('article_number', sa.String(50), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('description_long', sa.Text(), nullable=True),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('price', sa.Numeric(12, 2), nullable=False),
        sa.Column('purchase_price', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(3), server_default='EUR', nullable=True),
        sa.Column('tax_rate', sa.Numeric(5, 2), server_default='19.00', nullable=True),
        sa.Column('weight', sa.Numeric(10, 3), nullable=True),
        sa.Column('volume', sa.Numeric(10, 3), nullable=True),
        sa.Column('stock', sa.Numeric(12, 3), server_default='0', nullable=True),
        sa.Column('min_stock', sa.Numeric(12, 3), server_default='0', nullable=True),
        sa.Column('max_stock', sa.Numeric(12, 3), nullable=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('subcategory', sa.String(100), nullable=True),
        sa.Column('manufacturer', sa.String(200), nullable=True),
        sa.Column('manufacturer_number', sa.String(100), nullable=True),
        sa.Column('ean', sa.String(13), nullable=True),
        sa.Column('custom_tariff_number', sa.String(20), nullable=True),
        sa.Column('country_of_origin', sa.String(2), nullable=True),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('article_number')
    )
    
    # Indexes for articles
    op.create_index('idx_articles_number', 'articles', ['article_number'])
    op.create_index('idx_articles_description', 'articles', ['description'])
    op.create_index('idx_articles_category', 'articles', ['category'])
    op.create_index('idx_articles_stock', 'articles', ['stock'])
    op.create_index('idx_articles_ean', 'articles', ['ean'], postgresql_where=sa.text('ean IS NOT NULL'))
    
    # Suppliers table
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_number', sa.String(20), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('address', sa.String(500), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('postal_code', sa.String(10), nullable=False),
        sa.Column('country', sa.String(2), server_default='DE', nullable=True),
        sa.Column('email', sa.String(200), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('fax', sa.String(50), nullable=True),
        sa.Column('website', sa.String(200), nullable=True),
        sa.Column('tax_number', sa.String(50), nullable=True),
        sa.Column('vat_id', sa.String(50), nullable=True),
        sa.Column('payment_terms', sa.Integer(), server_default='30', nullable=True),
        sa.Column('discount_percentage', sa.Numeric(5, 2), server_default='0', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('supplier_number')
    )
    
    # Bank accounts table
    op.create_table('bank_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(20), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('account_holder', sa.String(200), nullable=False),
        sa.Column('iban', sa.String(34), nullable=False),
        sa.Column('bic', sa.String(11), nullable=True),
        sa.Column('bank_name', sa.String(200), nullable=True),
        sa.Column('is_default', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('idx_bank_accounts_entity', 'bank_accounts', ['entity_type', 'entity_id'])
    
    # Invoices table
    op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('invoice_number', sa.String(50), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('invoice_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('delivery_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(20), server_default='draft', nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=True),
        sa.Column('payment_reference', sa.String(200), nullable=True),
        sa.Column('net_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('tax_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('paid_amount', sa.Numeric(12, 2), server_default='0', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('internal_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('paid_at', sa.DateTime(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_number')
    )
    
    # Indexes for invoices
    op.create_index('idx_invoices_number', 'invoices', ['invoice_number'])
    op.create_index('idx_invoices_customer', 'invoices', ['customer_id'])
    op.create_index('idx_invoices_date', 'invoices', ['invoice_date'])
    op.create_index('idx_invoices_status', 'invoices', ['status'])
    op.create_index('idx_invoices_due', 'invoices', ['due_date'], 
                     postgresql_where=sa.text("status IN ('sent', 'overdue')"))
    
    # Invoice positions table
    op.create_table('invoice_positions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('position_number', sa.Integer(), nullable=False),
        sa.Column('article_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('quantity', sa.Numeric(12, 3), nullable=False),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('price', sa.Numeric(12, 4), nullable=False),
        sa.Column('discount', sa.Numeric(5, 2), server_default='0', nullable=True),
        sa.Column('tax_rate', sa.Numeric(5, 2), nullable=False),
        sa.Column('net_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['article_id'], ['articles.id'], ),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('idx_invoice_positions_invoice', 'invoice_positions', ['invoice_id'])
    op.create_index('idx_invoice_positions_article', 'invoice_positions', ['article_id'])
    
    # Orders table
    op.create_table('orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_number', sa.String(50), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('order_date', sa.Date(), nullable=False),
        sa.Column('delivery_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(20), server_default='pending', nullable=False),
        sa.Column('shipping_address', sa.String(500), nullable=True),
        sa.Column('shipping_method', sa.String(100), nullable=True),
        sa.Column('tracking_number', sa.String(100), nullable=True),
        sa.Column('net_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('tax_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('shipping_cost', sa.Numeric(12, 2), server_default='0', nullable=True),
        sa.Column('total_amount', sa.Numeric(12, 2), server_default='0', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('internal_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('shipped_at', sa.DateTime(), nullable=True),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_number')
    )
    
    # Indexes for orders
    op.create_index('idx_orders_number', 'orders', ['order_number'])
    op.create_index('idx_orders_customer', 'orders', ['customer_id'])
    op.create_index('idx_orders_date', 'orders', ['order_date'])
    op.create_index('idx_orders_status', 'orders', ['status'])
    
    # Create update timestamp function
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    # Add triggers for updated_at
    for table in ['customers', 'articles', 'suppliers', 'bank_accounts', 'invoices', 'orders']:
        op.execute(f"""
            CREATE TRIGGER update_{table}_updated_at 
            BEFORE UPDATE ON {table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """)

def downgrade() -> None:
    """Drop all tables and functions"""
    
    # Drop triggers and function
    for table in ['customers', 'articles', 'suppliers', 'bank_accounts', 'invoices', 'orders']:
        op.execute(f'DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table}')
    
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')
    
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('invoice_positions')
    op.drop_table('invoices')
    op.drop_table('orders')
    op.drop_table('bank_accounts')
    op.drop_table('suppliers')
    op.drop_table('articles')
    op.drop_table('customers')