-- Zvoove Integration Testdaten für PostgreSQL
-- Diese Datei enthält alle notwendigen Tabellen und Beispieldaten für die Tests

-- ============================================================================
-- TABELLEN ERSTELLEN
-- ============================================================================

-- Zvoove Orders Tabelle
CREATE TABLE IF NOT EXISTS zvoove_orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL,
    debtor_number VARCHAR(50) NOT NULL,
    document_date DATE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    document_type VARCHAR(20) NOT NULL DEFAULT 'order',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zvoove Positions Tabelle
CREATE TABLE IF NOT EXISTS zvoove_positions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES zvoove_orders(id) ON DELETE CASCADE,
    article_number VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    net_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zvoove Contacts Tabelle
CREATE TABLE IF NOT EXISTS zvoove_contacts (
    id VARCHAR(50) PRIMARY KEY,
    contact_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    representative VARCHAR(100),
    contact_type VARCHAR(20) NOT NULL DEFAULT 'customer',
    appointment_date DATE,
    order_quantity INTEGER DEFAULT 0,
    remaining_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    email VARCHAR(100),
    last_contact DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zvoove Deliveries Tabelle
CREATE TABLE IF NOT EXISTS zvoove_deliveries (
    id VARCHAR(50) PRIMARY KEY,
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    order_id VARCHAR(50) REFERENCES zvoove_orders(id),
    delivery_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zvoove Documents Tabelle
CREATE TABLE IF NOT EXISTS zvoove_documents (
    id VARCHAR(50) PRIMARY KEY,
    document_type VARCHAR(20) NOT NULL,
    reference_id VARCHAR(50) NOT NULL,
    file_path VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TESTDATEN EINFÜGEN
-- ============================================================================

-- Test Orders
INSERT INTO zvoove_orders (id, customer_number, debtor_number, document_date, contact_person, document_type, status, net_amount, vat_amount, total_amount) VALUES
('ORD-001', 'K001', 'D001', '2024-01-15', 'Max Mustermann', 'order', 'confirmed', 200.00, 38.00, 238.00),
('ORD-002', 'K002', 'D002', '2024-01-16', 'Anna Schmidt', 'offer', 'draft', 150.00, 28.50, 178.50),
('ORD-003', 'K003', 'D003', '2024-01-17', 'Peter Müller', 'order', 'shipped', 300.00, 57.00, 357.00),
('ORD-004', 'K001', 'D001', '2024-01-18', 'Max Mustermann', 'invoice', 'paid', 180.00, 34.20, 214.20),
('ORD-005', 'K004', 'D004', '2024-01-19', 'Lisa Weber', 'order', 'draft', 250.00, 47.50, 297.50);

-- Test Positions
INSERT INTO zvoove_positions (id, order_id, article_number, description, quantity, unit, unit_price, discount, net_price) VALUES
('POS-001', 'ORD-001', 'ART-001', 'Laptop Dell XPS 13', 2.000, 'Stück', 100.00, 10.00, 180.00),
('POS-002', 'ORD-001', 'ART-002', 'USB-C Kabel', 5.000, 'Stück', 4.00, 0.00, 20.00),
('POS-003', 'ORD-002', 'ART-003', 'Monitor 24"', 1.000, 'Stück', 150.00, 0.00, 150.00),
('POS-004', 'ORD-003', 'ART-004', 'Drucker HP LaserJet', 1.000, 'Stück', 250.00, 20.00, 200.00),
('POS-005', 'ORD-003', 'ART-005', 'Druckerpapier A4', 10.000, 'Packung', 10.00, 0.00, 100.00),
('POS-006', 'ORD-004', 'ART-006', 'Tastatur mechanisch', 2.000, 'Stück', 80.00, 12.50, 140.00),
('POS-007', 'ORD-004', 'ART-007', 'Maus Wireless', 2.000, 'Stück', 20.00, 0.00, 40.00),
('POS-008', 'ORD-005', 'ART-008', 'Webcam HD', 1.000, 'Stück', 50.00, 0.00, 50.00),
('POS-009', 'ORD-005', 'ART-009', 'Headset Gaming', 2.000, 'Stück', 100.00, 0.00, 200.00);

-- Test Contacts
INSERT INTO zvoove_contacts (id, contact_number, name, representative, contact_type, appointment_date, order_quantity, remaining_quantity, status, phone, email, last_contact, notes) VALUES
('CON-001', 'K001', 'Max Mustermann GmbH', 'Vertreter A', 'customer', '2024-01-20', 100, 50, 'active', '+49 123 456789', 'max@example.com', '2024-01-15', 'Wichtiger Kunde'),
('CON-002', 'K002', 'Anna Schmidt e.K.', 'Vertreter B', 'customer', '2024-01-22', 75, 25, 'active', '+49 234 567890', 'anna@example.com', '2024-01-16', 'Neuer Kunde'),
('CON-003', 'K003', 'Peter Müller AG', 'Vertreter A', 'customer', '2024-01-25', 200, 100, 'active', '+49 345 678901', 'peter@example.com', '2024-01-17', 'Großkunde'),
('CON-004', 'K004', 'Lisa Weber GmbH', 'Vertreter C', 'customer', '2024-01-28', 150, 75, 'active', '+49 456 789012', 'lisa@example.com', '2024-01-18', 'Mittelständischer Kunde'),
('CON-005', 'K005', 'Hans Klein KG', 'Vertreter B', 'prospect', '2024-02-01', 0, 0, 'inactive', '+49 567 890123', 'hans@example.com', '2024-01-10', 'Interessent'),
('CON-006', 'K006', 'Maria Groß GmbH', 'Vertreter A', 'customer', '2024-01-30', 80, 40, 'active', '+49 678 901234', 'maria@example.com', '2024-01-19', 'Langjähriger Kunde'),
('CON-007', 'K007', 'Thomas Wolf e.K.', 'Vertreter C', 'customer', '2024-02-05', 120, 60, 'active', '+49 789 012345', 'thomas@example.com', '2024-01-20', 'Technologie-affin'),
('CON-008', 'K008', 'Sabine Bauer AG', 'Vertreter B', 'prospect', '2024-02-10', 0, 0, 'active', '+49 890 123456', 'sabine@example.com', '2024-01-12', 'Potentieller Neukunde');

-- Test Deliveries
INSERT INTO zvoove_deliveries (id, delivery_number, order_id, delivery_date, status, shipping_address, tracking_number, notes) VALUES
('DEL-001', 'L-2024-001', 'ORD-001', '2024-01-16', 'delivered', 'Musterstraße 1, 12345 Musterstadt', 'DHL123456789', 'Erfolgreich zugestellt'),
('DEL-002', 'L-2024-002', 'ORD-003', '2024-01-18', 'in_transit', 'Beispielweg 5, 54321 Beispielort', 'DHL987654321', 'Unterwegs'),
('DEL-003', 'L-2024-003', 'ORD-004', '2024-01-19', 'delivered', 'Teststraße 10, 11111 Teststadt', 'DHL456789123', 'Zugestellt'),
('DEL-004', 'L-2024-004', 'ORD-005', '2024-01-20', 'pending', 'Demoschneise 15, 22222 Demostadt', NULL, 'Noch nicht versendet');

-- Test Documents
INSERT INTO zvoove_documents (id, document_type, reference_id, file_path, file_size, mime_type, status) VALUES
('DOC-001', 'order', 'ORD-001', '/documents/orders/ORD-001.pdf', 1024000, 'application/pdf', 'final'),
('DOC-002', 'offer', 'ORD-002', '/documents/offers/ORD-002.pdf', 512000, 'application/pdf', 'draft'),
('DOC-003', 'invoice', 'ORD-004', '/documents/invoices/ORD-004.pdf', 768000, 'application/pdf', 'sent'),
('DOC-004', 'delivery', 'DEL-001', '/documents/deliveries/DEL-001.pdf', 256000, 'application/pdf', 'final'),
('DOC-005', 'order', 'ORD-003', '/documents/orders/ORD-003.pdf', 896000, 'application/pdf', 'final');

-- ============================================================================
-- INDEXE ERSTELLEN FÜR BESSERE PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_zvoove_orders_customer_number ON zvoove_orders(customer_number);
CREATE INDEX IF NOT EXISTS idx_zvoove_orders_debtor_number ON zvoove_orders(debtor_number);
CREATE INDEX IF NOT EXISTS idx_zvoove_orders_document_date ON zvoove_orders(document_date);
CREATE INDEX IF NOT EXISTS idx_zvoove_orders_status ON zvoove_orders(status);
CREATE INDEX IF NOT EXISTS idx_zvoove_orders_document_type ON zvoove_orders(document_type);

CREATE INDEX IF NOT EXISTS idx_zvoove_positions_order_id ON zvoove_positions(order_id);
CREATE INDEX IF NOT EXISTS idx_zvoove_positions_article_number ON zvoove_positions(article_number);

CREATE INDEX IF NOT EXISTS idx_zvoove_contacts_contact_number ON zvoove_contacts(contact_number);
CREATE INDEX IF NOT EXISTS idx_zvoove_contacts_name ON zvoove_contacts(name);
CREATE INDEX IF NOT EXISTS idx_zvoove_contacts_representative ON zvoove_contacts(representative);
CREATE INDEX IF NOT EXISTS idx_zvoove_contacts_status ON zvoove_contacts(status);
CREATE INDEX IF NOT EXISTS idx_zvoove_contacts_contact_type ON zvoove_contacts(contact_type);

CREATE INDEX IF NOT EXISTS idx_zvoove_deliveries_delivery_number ON zvoove_deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_zvoove_deliveries_order_id ON zvoove_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_zvoove_deliveries_status ON zvoove_deliveries(status);

CREATE INDEX IF NOT EXISTS idx_zvoove_documents_reference_id ON zvoove_documents(reference_id);
CREATE INDEX IF NOT EXISTS idx_zvoove_documents_document_type ON zvoove_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_zvoove_documents_status ON zvoove_documents(status);

-- ============================================================================
-- TRIGGER FÜR UPDATED_AT TIMESTAMP
-- ============================================================================

-- Funktion für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für zvoove_orders
CREATE TRIGGER update_zvoove_orders_updated_at 
    BEFORE UPDATE ON zvoove_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für zvoove_positions
CREATE TRIGGER update_zvoove_positions_updated_at 
    BEFORE UPDATE ON zvoove_positions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für zvoove_contacts
CREATE TRIGGER update_zvoove_contacts_updated_at 
    BEFORE UPDATE ON zvoove_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für zvoove_deliveries
CREATE TRIGGER update_zvoove_deliveries_updated_at 
    BEFORE UPDATE ON zvoove_deliveries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für zvoove_documents
CREATE TRIGGER update_zvoove_documents_updated_at 
    BEFORE UPDATE ON zvoove_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FÜR STATISTIKEN
-- ============================================================================

-- View für Order-Statistiken
CREATE OR REPLACE VIEW zvoove_order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_orders,
    COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    MIN(document_date) as first_order_date,
    MAX(document_date) as last_order_date
FROM zvoove_orders;

-- View für Contact-Statistiken
CREATE OR REPLACE VIEW zvoove_contact_statistics AS
SELECT 
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN contact_type = 'customer' THEN 1 END) as customers,
    COUNT(CASE WHEN contact_type = 'prospect' THEN 1 END) as prospects,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contacts,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_contacts,
    SUM(order_quantity) as total_order_quantity,
    SUM(remaining_quantity) as total_remaining_quantity,
    COUNT(CASE WHEN appointment_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments
FROM zvoove_contacts;

-- View für Delivery-Statistiken
CREATE OR REPLACE VIEW zvoove_delivery_statistics AS
SELECT 
    COUNT(*) as total_deliveries,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_deliveries,
    COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit_deliveries,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_deliveries,
    AVG(CASE WHEN status = 'delivered' THEN delivery_date - (SELECT document_date FROM zvoove_orders WHERE id = zvoove_deliveries.order_id) END) as average_delivery_time
FROM zvoove_deliveries;

-- ============================================================================
-- TESTDATEN-VALIDIERUNG
-- ============================================================================

-- Prüfen ob alle Testdaten korrekt eingefügt wurden
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM zvoove_orders
UNION ALL
SELECT 'Positions' as table_name, COUNT(*) as record_count FROM zvoove_positions
UNION ALL
SELECT 'Contacts' as table_name, COUNT(*) as record_count FROM zvoove_contacts
UNION ALL
SELECT 'Deliveries' as table_name, COUNT(*) as record_count FROM zvoove_deliveries
UNION ALL
SELECT 'Documents' as table_name, COUNT(*) as record_count FROM zvoove_documents; 