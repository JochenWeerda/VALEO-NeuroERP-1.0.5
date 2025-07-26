-- ERP Integration Testdaten für PostgreSQL
-- Erstellt Testdaten für die ERP-Integration

-- ERP Orders Tabelle
CREATE TABLE IF NOT EXISTS erp_orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL,
    debtor_number VARCHAR(50) NOT NULL,
    document_date DATE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('offer', 'order', 'delivery', 'invoice')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'confirmed', 'delivered', 'invoiced')),
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ERP Positions Tabelle
CREATE TABLE IF NOT EXISTS erp_positions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES erp_orders(id) ON DELETE CASCADE,
    article_number VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(20) NOT NULL DEFAULT 'Stück',
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    net_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ERP Contacts Tabelle
CREATE TABLE IF NOT EXISTS erp_contacts (
    id VARCHAR(50) PRIMARY KEY,
    contact_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    representative VARCHAR(100) NOT NULL,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('sales', 'purchase')),
    appointment_date DATE,
    order_quantity INTEGER NOT NULL DEFAULT 0,
    remaining_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'planned')) DEFAULT 'active',
    phone VARCHAR(20),
    email VARCHAR(100),
    last_contact DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ERP Deliveries Tabelle
CREATE TABLE IF NOT EXISTS erp_deliveries (
    id VARCHAR(50) PRIMARY KEY,
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    order_id VARCHAR(50) REFERENCES erp_orders(id),
    delivery_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'shipped', 'delivered', 'returned')) DEFAULT 'pending',
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ERP Documents Tabelle
CREATE TABLE IF NOT EXISTS erp_documents (
    id VARCHAR(50) PRIMARY KEY,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('offer', 'order', 'delivery', 'invoice')),
    reference_id VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'final', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testdaten einfügen
INSERT INTO erp_orders (id, customer_number, debtor_number, document_date, contact_person, document_type, status, net_amount, vat_amount, total_amount) VALUES
('ORD-001', 'CUST-001', 'DEB-001', '2024-01-15', 'Max Mustermann', 'order', 'confirmed', 1000.00, 190.00, 1190.00),
('ORD-002', 'CUST-002', 'DEB-002', '2024-01-16', 'Anna Schmidt', 'offer', 'draft', 2500.00, 475.00, 2975.00),
('ORD-003', 'CUST-003', 'DEB-003', '2024-01-17', 'Peter Müller', 'invoice', 'invoiced', 750.00, 142.50, 892.50),
('ORD-004', 'CUST-001', 'DEB-001', '2024-01-18', 'Max Mustermann', 'delivery', 'delivered', 500.00, 95.00, 595.00),
('ORD-005', 'CUST-004', 'DEB-004', '2024-01-19', 'Lisa Weber', 'order', 'confirmed', 1800.00, 342.00, 2142.00);

INSERT INTO erp_positions (id, order_id, article_number, description, quantity, unit, unit_price, discount, net_price) VALUES
('POS-001', 'ORD-001', 'ART-001', 'Laptop Dell XPS 13', 2, 'Stück', 500.00, 0.00, 1000.00),
('POS-002', 'ORD-002', 'ART-002', 'Drucker HP LaserJet', 1, 'Stück', 2500.00, 0.00, 2500.00),
('POS-003', 'ORD-003', 'ART-003', 'Software-Lizenz Office 365', 5, 'Lizenz', 150.00, 0.00, 750.00),
('POS-004', 'ORD-004', 'ART-004', 'Monitor 24" Full HD', 2, 'Stück', 250.00, 0.00, 500.00),
('POS-005', 'ORD-005', 'ART-005', 'Netzwerk-Switch 24-Port', 1, 'Stück', 1800.00, 0.00, 1800.00);

INSERT INTO erp_contacts (id, contact_number, name, representative, contact_type, appointment_date, order_quantity, remaining_quantity, status, phone, email, last_contact, notes) VALUES
('CON-001', 'CNT-001', 'Musterfirma GmbH', 'Max Mustermann', 'sales', '2024-01-20', 5, 2, 'active', '+49 30 123456', 'max@musterfirma.de', '2024-01-15', 'Interessiert an ERP-System'),
('CON-002', 'CNT-002', 'Schmidt & Co. KG', 'Anna Schmidt', 'purchase', '2024-01-21', 3, 1, 'active', '+49 40 654321', 'anna@schmidt-co.de', '2024-01-16', 'Bestehender Kunde'),
('CON-003', 'CNT-003', 'Müller Consulting', 'Peter Müller', 'sales', '2024-01-22', 2, 0, 'planned', '+49 89 987654', 'peter@mueller-consulting.de', '2024-01-17', 'Neuer Kontakt'),
('CON-004', 'CNT-004', 'Weber Solutions', 'Lisa Weber', 'purchase', '2024-01-23', 4, 2, 'active', '+49 221 456789', 'lisa@weber-solutions.de', '2024-01-18', 'Großkunde'),
('CON-005', 'CNT-005', 'TechStart AG', 'Tom Bauer', 'sales', '2024-01-24', 1, 1, 'inactive', '+49 69 789123', 'tom@techstart.de', '2024-01-19', 'Startup-Unternehmen');

INSERT INTO erp_deliveries (id, delivery_number, order_id, delivery_date, status, shipping_address, tracking_number, notes) VALUES
('DEL-001', 'DLV-001', 'ORD-001', '2024-01-25', 'delivered', 'Musterstraße 1, 10115 Berlin', 'DHL123456789', 'Erfolgreich zugestellt'),
('DEL-002', 'DLV-002', 'ORD-004', '2024-01-26', 'delivered', 'Hauptstraße 15, 20095 Hamburg', 'DHL987654321', 'Unterschrift erforderlich'),
('DEL-003', 'DLV-003', 'ORD-005', '2024-01-27', 'shipped', 'Industrieweg 8, 80339 München', 'DHL456789123', 'Unterwegs'),
('DEL-004', 'DLV-004', NULL, '2024-01-28', 'pending', 'Technologiepark 12, 50667 Köln', NULL, 'Noch nicht versendet'),
('DEL-005', 'DLV-005', NULL, '2024-01-29', 'pending', 'Innovationsstraße 5, 60313 Frankfurt', NULL, 'Wird vorbereitet');

INSERT INTO erp_documents (id, document_type, reference_id, file_path, file_size, mime_type, status) VALUES
('DOC-001', 'order', 'ORD-001', '/documents/orders/ORD-001.pdf', 245760, 'application/pdf', 'final'),
('DOC-002', 'offer', 'ORD-002', '/documents/offers/ORD-002.pdf', 189440, 'application/pdf', 'draft'),
('DOC-003', 'invoice', 'ORD-003', '/documents/invoices/ORD-003.pdf', 156672, 'application/pdf', 'final'),
('DOC-004', 'delivery', 'ORD-004', '/documents/deliveries/ORD-004.pdf', 98765, 'application/pdf', 'final'),
('DOC-005', 'order', 'ORD-005', '/documents/orders/ORD-005.pdf', 203456, 'application/pdf', 'draft');

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_erp_orders_customer_number ON erp_orders(customer_number);
CREATE INDEX IF NOT EXISTS idx_erp_orders_debtor_number ON erp_orders(debtor_number);
CREATE INDEX IF NOT EXISTS idx_erp_orders_document_date ON erp_orders(document_date);
CREATE INDEX IF NOT EXISTS idx_erp_orders_status ON erp_orders(status);
CREATE INDEX IF NOT EXISTS idx_erp_orders_document_type ON erp_orders(document_type);

CREATE INDEX IF NOT EXISTS idx_erp_positions_order_id ON erp_positions(order_id);
CREATE INDEX IF NOT EXISTS idx_erp_positions_article_number ON erp_positions(article_number);

CREATE INDEX IF NOT EXISTS idx_erp_contacts_contact_number ON erp_contacts(contact_number);
CREATE INDEX IF NOT EXISTS idx_erp_contacts_name ON erp_contacts(name);
CREATE INDEX IF NOT EXISTS idx_erp_contacts_representative ON erp_contacts(representative);
CREATE INDEX IF NOT EXISTS idx_erp_contacts_status ON erp_contacts(status);
CREATE INDEX IF NOT EXISTS idx_erp_contacts_contact_type ON erp_contacts(contact_type);

CREATE INDEX IF NOT EXISTS idx_erp_deliveries_delivery_number ON erp_deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_erp_deliveries_order_id ON erp_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_erp_deliveries_status ON erp_deliveries(status);

CREATE INDEX IF NOT EXISTS idx_erp_documents_reference_id ON erp_documents(reference_id);
CREATE INDEX IF NOT EXISTS idx_erp_documents_document_type ON erp_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_erp_documents_status ON erp_documents(status);

-- Trigger für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für erp_orders
CREATE TRIGGER update_erp_orders_updated_at
    BEFORE UPDATE ON erp_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für erp_positions
CREATE TRIGGER update_erp_positions_updated_at
    BEFORE UPDATE ON erp_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für erp_contacts
CREATE TRIGGER update_erp_contacts_updated_at
    BEFORE UPDATE ON erp_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für erp_deliveries
CREATE TRIGGER update_erp_deliveries_updated_at
    BEFORE UPDATE ON erp_deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für erp_documents
CREATE TRIGGER update_erp_documents_updated_at
    BEFORE UPDATE ON erp_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views für Statistiken
CREATE OR REPLACE VIEW erp_order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN status = 'invoiced' THEN 1 END) as invoiced_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM erp_orders;

CREATE OR REPLACE VIEW erp_contact_statistics AS
SELECT 
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN contact_type = 'sales' THEN 1 END) as sales_contacts,
    COUNT(CASE WHEN contact_type = 'purchase' THEN 1 END) as purchase_contacts,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contacts,
    COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_contacts,
    SUM(order_quantity) as total_order_quantity,
    SUM(remaining_quantity) as total_remaining_quantity
FROM erp_contacts;

CREATE OR REPLACE VIEW erp_delivery_statistics AS
SELECT 
    COUNT(*) as total_deliveries,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_deliveries,
    COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_deliveries,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_deliveries,
    AVG(CASE WHEN status = 'delivered' THEN delivery_date - (SELECT document_date FROM erp_orders WHERE id = erp_deliveries.order_id) END) as average_delivery_time
FROM erp_deliveries;

-- Testdaten-Zusammenfassung
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM erp_orders
UNION ALL
SELECT 'Positions' as table_name, COUNT(*) as record_count FROM erp_positions
UNION ALL
SELECT 'Contacts' as table_name, COUNT(*) as record_count FROM erp_contacts
UNION ALL
SELECT 'Deliveries' as table_name, COUNT(*) as record_count FROM erp_deliveries
UNION ALL
SELECT 'Documents' as table_name, COUNT(*) as record_count FROM erp_documents; 