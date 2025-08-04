-- VALEO NeuroERP 2.0 Datenbank-Schema
-- PostgreSQL Schema für Produktionsumgebung

-- Aktiviere UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- Basis-Tabellen
-- =====================

-- Kunden
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'DE',
    email VARCHAR(200),
    phone VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(200),
    tax_number VARCHAR(50),
    vat_id VARCHAR(50),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 14, -- Tage
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_active ON customers(active) WHERE active = TRUE;

-- Artikel
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    article_number VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    description_long TEXT,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    purchase_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    tax_rate DECIMAL(5,2) DEFAULT 19.00,
    weight DECIMAL(10,3),
    volume DECIMAL(10,3),
    stock DECIMAL(12,3) DEFAULT 0,
    min_stock DECIMAL(12,3) DEFAULT 0,
    max_stock DECIMAL(12,3),
    location VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    manufacturer VARCHAR(200),
    manufacturer_number VARCHAR(100),
    ean VARCHAR(13),
    custom_tariff_number VARCHAR(20),
    country_of_origin VARCHAR(2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_articles_number ON articles(article_number);
CREATE INDEX idx_articles_description ON articles(description);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_stock ON articles(stock);
CREATE INDEX idx_articles_ean ON articles(ean) WHERE ean IS NOT NULL;

-- Lieferanten
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'DE',
    email VARCHAR(200),
    phone VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(200),
    tax_number VARCHAR(50),
    vat_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bankverbindungen
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL, -- 'customer', 'supplier', 'company'
    entity_id INTEGER NOT NULL,
    account_holder VARCHAR(200) NOT NULL,
    iban VARCHAR(34) NOT NULL,
    bic VARCHAR(11),
    bank_name VARCHAR(200),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_entity ON bank_accounts(entity_type, entity_id);

-- =====================
-- Bewegungsdaten
-- =====================

-- Rechnungen
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    delivery_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('sent', 'overdue');

-- Rechnungspositionen
CREATE TABLE IF NOT EXISTS invoice_positions (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    position_number INTEGER NOT NULL,
    article_id INTEGER REFERENCES articles(id),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_positions_invoice ON invoice_positions(invoice_id);
CREATE INDEX idx_invoice_positions_article ON invoice_positions(article_id);

-- Bestellungen
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    order_date DATE NOT NULL,
    delivery_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    shipping_address VARCHAR(500),
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- Bestellpositionen
CREATE TABLE IF NOT EXISTS order_positions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    position_number INTEGER NOT NULL,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    quantity DECIMAL(12,3) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- Lagerverwaltung
-- =====================

-- Lagerbewegungen
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    movement_type VARCHAR(20) NOT NULL, -- purchase, sale, adjustment, return, production
    reference_type VARCHAR(20), -- invoice, order, purchase_order, manual
    reference_id INTEGER,
    quantity DECIMAL(12,3) NOT NULL, -- positiv = Zugang, negativ = Abgang
    stock_before DECIMAL(12,3) NOT NULL,
    stock_after DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(12,4),
    location VARCHAR(100),
    reason VARCHAR(500),
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_article ON stock_movements(article_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- =====================
-- Finanzen
-- =====================

-- Zahlungseingänge
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(200),
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zahlung-Rechnung Zuordnung
CREATE TABLE IF NOT EXISTS payment_allocations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON payment_allocations(invoice_id);

-- =====================
-- Erweiterte Features
-- =====================

-- Artikel-Stammdaten Erweiterungen
CREATE TABLE IF NOT EXISTS article_extended (
    id SERIAL PRIMARY KEY,
    article_id INTEGER UNIQUE NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    material_type VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    technical_specs JSONB,
    certifications JSONB,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Preislisten
CREATE TABLE IF NOT EXISTS price_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    valid_from DATE,
    valid_to DATE,
    currency VARCHAR(3) DEFAULT 'EUR',
    is_default BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Preislisten-Positionen
CREATE TABLE IF NOT EXISTS price_list_items (
    id SERIAL PRIMARY KEY,
    price_list_id INTEGER NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    price DECIMAL(12,4) NOT NULL,
    min_quantity DECIMAL(12,3) DEFAULT 1,
    discount DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(price_list_id, article_id, min_quantity)
);

-- Dokumentenverwaltung
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL, -- invoice, order, delivery_note, etc.
    reference_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000),
    file_size INTEGER,
    mime_type VARCHAR(100),
    checksum VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
);

CREATE INDEX idx_documents_reference ON documents(reference_type, reference_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- =====================
-- Audit & History
-- =====================

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- insert, update, delete
    user_id INTEGER,
    user_name VARCHAR(200),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);

-- =====================
-- Views
-- =====================

-- Kunden-Übersicht
CREATE OR REPLACE VIEW v_customer_overview AS
SELECT 
    c.*,
    COUNT(DISTINCT i.id) AS invoice_count,
    COUNT(DISTINCT o.id) AS order_count,
    COALESCE(SUM(i.total_amount), 0) AS total_revenue,
    COALESCE(SUM(i.total_amount) - SUM(i.paid_amount), 0) AS open_amount,
    MAX(i.invoice_date) AS last_invoice_date,
    MAX(o.order_date) AS last_order_date
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id AND i.status != 'cancelled'
LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
WHERE c.deleted_at IS NULL
GROUP BY c.id;

-- Artikel-Bestandsübersicht
CREATE OR REPLACE VIEW v_article_stock_overview AS
SELECT 
    a.*,
    CASE 
        WHEN a.stock <= 0 THEN 'out_of_stock'
        WHEN a.stock <= a.min_stock THEN 'low_stock'
        WHEN a.stock >= COALESCE(a.max_stock, a.stock + 1) THEN 'overstock'
        ELSE 'normal'
    END AS stock_status,
    COALESCE(sm.last_purchase_date, a.created_at) AS last_purchase_date,
    COALESCE(sm.last_sale_date, a.created_at) AS last_sale_date,
    COALESCE(sm.monthly_sales_avg, 0) AS monthly_sales_avg
FROM articles a
LEFT JOIN LATERAL (
    SELECT 
        MAX(CASE WHEN quantity > 0 THEN created_at END) AS last_purchase_date,
        MAX(CASE WHEN quantity < 0 THEN created_at END) AS last_sale_date,
        AVG(CASE WHEN quantity < 0 AND created_at >= CURRENT_DATE - INTERVAL '30 days' 
            THEN ABS(quantity) END) AS monthly_sales_avg
    FROM stock_movements 
    WHERE article_id = a.id
) sm ON true
WHERE a.deleted_at IS NULL;

-- =====================
-- Funktionen & Trigger
-- =====================

-- Funktion für automatische Update-Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für alle Tabellen mit updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funktion für Lagerbewegungen
CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Aktualisiere Artikelbestand
    UPDATE articles 
    SET stock = stock + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.article_id;
    
    -- Hole aktuellen Bestand für stock_after
    SELECT stock INTO NEW.stock_after
    FROM articles 
    WHERE id = NEW.article_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER process_stock_movement_trigger 
    BEFORE INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION process_stock_movement();

-- Funktion für Rechnungssummen
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_net_amount DECIMAL(12,2);
    v_tax_amount DECIMAL(12,2);
    v_total_amount DECIMAL(12,2);
BEGIN
    -- Berechne Summen aus Positionen
    SELECT 
        COALESCE(SUM(net_amount), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(total_amount), 0)
    INTO v_net_amount, v_tax_amount, v_total_amount
    FROM invoice_positions
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Aktualisiere Rechnung
    UPDATE invoices
    SET net_amount = v_net_amount,
        tax_amount = v_tax_amount,
        total_amount = v_total_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoice_totals_on_insert
    AFTER INSERT ON invoice_positions
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER update_invoice_totals_on_update
    AFTER UPDATE ON invoice_positions
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER update_invoice_totals_on_delete
    AFTER DELETE ON invoice_positions
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- =====================
-- Indizes für Performance
-- =====================

-- Volltext-Suche
CREATE INDEX idx_customers_search ON customers 
    USING gin(to_tsvector('german', name || ' ' || COALESCE(email, '') || ' ' || city));

CREATE INDEX idx_articles_search ON articles 
    USING gin(to_tsvector('german', article_number || ' ' || description || ' ' || COALESCE(description_long, '')));

-- Performance-Indizes
CREATE INDEX idx_invoices_unpaid ON invoices(customer_id, due_date) 
    WHERE status IN ('sent', 'overdue') AND paid_amount < total_amount;

CREATE INDEX idx_stock_movements_recent ON stock_movements(article_id, created_at DESC);

-- =====================
-- Initialdaten
-- =====================

-- Standard-Preisliste
INSERT INTO price_lists (name, description, is_default, active)
VALUES ('Standardpreisliste', 'Standard-Verkaufspreise', true, true)
ON CONFLICT DO NOTHING;