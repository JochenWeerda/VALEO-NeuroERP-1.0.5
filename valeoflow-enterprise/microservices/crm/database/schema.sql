-- =====================================================
-- ValeoFlow CRM Database Schema
-- =====================================================
-- Migriert von VALEO-NeuroERP-2.0 backend/models/customer.py
-- Erstellt: 2025-07-24
-- Status: Production Ready

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_number VARCHAR(20) UNIQUE NOT NULL,
    debitor_account VARCHAR(20),
    search_term VARCHAR(100),
    creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Rechnungsadresse
    name VARCHAR(100) NOT NULL,
    name2 VARCHAR(100),
    industry VARCHAR(50),
    street VARCHAR(100),
    country VARCHAR(2),
    postal_code VARCHAR(10),
    city VARCHAR(50),
    post_box VARCHAR(20),
    phone1 VARCHAR(30),
    phone2 VARCHAR(30),
    fax VARCHAR(30),
    salutation VARCHAR(20),
    letter_salutation VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    
    -- Organisation
    branch_office VARCHAR(50),
    cost_center VARCHAR(20),
    invoice_type VARCHAR(20),
    collective_invoice VARCHAR(20),
    invoice_form VARCHAR(30),
    
    -- Vertriebsberater
    sales_rep_id INTEGER,
    sales_rep_code VARCHAR(10),
    region VARCHAR(30),
    
    -- Zahlungsbedingungen
    payment_term1_days INTEGER,
    discount1_percent DECIMAL(5,2),
    payment_term2_days INTEGER,
    discount2_percent DECIMAL(5,2),
    net_days INTEGER,
    
    -- ValeoFlow spezifische Felder
    is_active BOOLEAN NOT NULL DEFAULT true,
    has_online_access BOOLEAN NOT NULL DEFAULT false,
    customer_since DATE,
    last_order_date DATE,
    credit_limit DECIMAL(15,2),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_customers_customer_number UNIQUE (customer_number),
    CONSTRAINT idx_customers_email UNIQUE (email),
    CONSTRAINT idx_customers_search_term ON (search_term),
    CONSTRAINT idx_customers_is_active ON (is_active),
    CONSTRAINT idx_customers_region ON (region),
    CONSTRAINT idx_customers_industry ON (industry)
);

-- =====================================================
-- CUSTOMER ADDRESSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- 'delivery', 'billing', 'headquarters', etc.
    name VARCHAR(100) NOT NULL,
    street VARCHAR(100),
    country VARCHAR(2),
    postal_code VARCHAR(10),
    city VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_customer_addresses_customer_id ON (customer_id),
    CONSTRAINT idx_customer_addresses_type ON (address_type)
);

-- =====================================================
-- CUSTOMER CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    department VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_customer_contacts_customer_id ON (customer_id),
    CONSTRAINT idx_customer_contacts_email ON (email),
    CONSTRAINT idx_customer_contacts_is_primary ON (is_primary)
);

-- =====================================================
-- USERS TABLE (für Vertriebsberater)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'manager', 'user'
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_users_username UNIQUE (username),
    CONSTRAINT idx_users_email UNIQUE (email),
    CONSTRAINT idx_users_role ON (role)
);

-- =====================================================
-- CUSTOMER ACTIVITIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_activities (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'visit'
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'planned', -- 'planned', 'completed', 'cancelled'
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_customer_activities_customer_id ON (customer_id),
    CONSTRAINT idx_customer_activities_user_id ON (user_id),
    CONSTRAINT idx_customer_activities_type ON (activity_type),
    CONSTRAINT idx_customer_activities_date ON (activity_date),
    CONSTRAINT idx_customer_activities_status ON (status)
);

-- =====================================================
-- CUSTOMER ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'confirmed', 'shipped', 'delivered', 'cancelled'
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT idx_customer_orders_customer_id ON (customer_id),
    CONSTRAINT idx_customer_orders_number UNIQUE (order_number),
    CONSTRAINT idx_customer_orders_date ON (order_date),
    CONSTRAINT idx_customer_orders_status ON (status)
);

-- =====================================================
-- TRIGGERS für UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_contacts_updated_at BEFORE UPDATE ON customer_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_activities_updated_at BEFORE UPDATE ON customer_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_orders_updated_at BEFORE UPDATE ON customer_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEMO DATA
-- =====================================================

-- Insert demo users
INSERT INTO users (username, email, first_name, last_name, role) VALUES
('admin', 'admin@valeoflow.com', 'Admin', 'User', 'admin'),
('manager1', 'manager1@valeoflow.com', 'Max', 'Mustermann', 'manager'),
('sales1', 'sales1@valeoflow.com', 'Anna', 'Schmidt', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert demo customers
INSERT INTO customers (customer_number, name, email, phone1, street, city, postal_code, country, industry, sales_rep_code, region, credit_limit, customer_since) VALUES
('CUST001', 'Musterfirma GmbH', 'kontakt@musterfirma.de', '+49 30 12345678', 'Musterstraße 1', 'Berlin', '10115', 'DE', 'Manufacturing', 'SR001', 'Berlin', 50000.00, '2020-01-15'),
('CUST002', 'TechCorp AG', 'info@techcorp.de', '+49 40 87654321', 'Hafenstraße 42', 'Hamburg', '20457', 'DE', 'Technology', 'SR002', 'Hamburg', 75000.00, '2019-06-20'),
('CUST003', 'BauMax KG', 'office@baumax.de', '+49 89 11223344', 'Bauernhofweg 15', 'München', '80331', 'DE', 'Construction', 'SR001', 'Bayern', 100000.00, '2018-11-10')
ON CONFLICT (customer_number) DO NOTHING;

-- Insert demo customer contacts
INSERT INTO customer_contacts (customer_id, first_name, last_name, position, email, phone, is_primary) VALUES
(1, 'Hans', 'Müller', 'Geschäftsführer', 'h.mueller@musterfirma.de', '+49 30 12345679', true),
(1, 'Maria', 'Weber', 'Einkauf', 'm.weber@musterfirma.de', '+49 30 12345680', false),
(2, 'Peter', 'Schulz', 'CTO', 'p.schulz@techcorp.de', '+49 40 87654322', true),
(3, 'Lisa', 'Fischer', 'Projektleiterin', 'l.fischer@baumax.de', '+49 89 11223345', true)
ON CONFLICT DO NOTHING;

-- Insert demo customer addresses
INSERT INTO customer_addresses (customer_id, address_type, name, street, city, postal_code, country, is_default) VALUES
(1, 'billing', 'Musterfirma GmbH - Rechnung', 'Musterstraße 1', 'Berlin', '10115', 'DE', true),
(1, 'delivery', 'Musterfirma GmbH - Lieferung', 'Lagerstraße 5', 'Berlin', '10115', 'DE', false),
(2, 'billing', 'TechCorp AG - Rechnung', 'Hafenstraße 42', 'Hamburg', '20457', 'DE', true),
(3, 'billing', 'BauMax KG - Rechnung', 'Bauernhofweg 15', 'München', '80331', 'DE', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS für bessere Performance
-- =====================================================

-- Customer Overview View
CREATE OR REPLACE VIEW customer_overview AS
SELECT 
    c.id,
    c.customer_number,
    c.name,
    c.email,
    c.phone1,
    c.city,
    c.industry,
    c.is_active,
    c.customer_since,
    c.credit_limit,
    c.sales_rep_code,
    c.region,
    COUNT(cc.id) as contact_count,
    COUNT(ca.id) as activity_count,
    COUNT(co.id) as order_count,
    COALESCE(SUM(co.total_amount), 0) as total_order_value
FROM customers c
LEFT JOIN customer_contacts cc ON c.id = cc.customer_id
LEFT JOIN customer_activities ca ON c.id = ca.customer_id
LEFT JOIN customer_orders co ON c.id = co.customer_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.customer_number, c.name, c.email, c.phone1, c.city, c.industry, c.is_active, c.customer_since, c.credit_limit, c.sales_rep_code, c.region;

-- =====================================================
-- INDEXES für bessere Performance
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customers_active_region ON customers(is_active, region);
CREATE INDEX IF NOT EXISTS idx_customers_active_industry ON customers(is_active, industry);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers(sales_rep_code, is_active);
CREATE INDEX IF NOT EXISTS idx_customer_activities_customer_date ON customer_activities(customer_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer_date ON customer_orders(customer_id, order_date);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('german', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(customer_number, '')));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE customers IS 'Haupttabelle für Kundenstammdaten';
COMMENT ON TABLE customer_addresses IS 'Zusätzliche Adressen für Kunden';
COMMENT ON TABLE customer_contacts IS 'Ansprechpartner bei Kunden';
COMMENT ON TABLE customer_activities IS 'Aktivitäten und Interaktionen mit Kunden';
COMMENT ON TABLE customer_orders IS 'Bestellungen der Kunden';
COMMENT ON TABLE users IS 'Benutzer und Vertriebsberater';

COMMENT ON COLUMN customers.customer_number IS 'Eindeutige Kundennummer';
COMMENT ON COLUMN customers.credit_limit IS 'Kreditlimit in Euro';
COMMENT ON COLUMN customers.is_active IS 'Aktiver Kunde (Soft Delete)';
COMMENT ON COLUMN customer_activities.activity_type IS 'Art der Aktivität: call, email, meeting, visit';
COMMENT ON COLUMN customer_orders.status IS 'Status der Bestellung: draft, confirmed, shipped, delivered, cancelled'; 