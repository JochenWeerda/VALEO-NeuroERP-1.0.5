-- VALEO NeuroERP Database Initialization Script
-- Version: 2.0
-- Author: AI Assistant

-- Erstelle Schemas
CREATE SCHEMA IF NOT EXISTS neuroerp;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Setze Standard-Schema
SET search_path TO neuroerp, public;

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaktionen-Tabelle
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventar-Tabelle
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    category VARCHAR(100),
    supplier VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dokumente-Tabelle
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Berichte-Tabelle
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100),
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benachrichtigungen-Tabelle
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System-Logs-Tabelle
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    message TEXT NOT NULL,
    module VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit-Logs-Tabelle
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES neuroerp.users(id) ON DELETE SET NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics-Events-Tabelle
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES neuroerp.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics.events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics.events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics.events(created_at);

-- Trigger-Funktionen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit-Trigger-Funktion
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Audit-Trigger für wichtige Tabellen
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions_trigger AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_inventory_trigger AFTER INSERT OR UPDATE OR DELETE ON inventory
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Seed-Daten einfügen
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, is_verified) VALUES
('admin', 'admin@valeo-neuroerp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'System', 'Administrator', 'admin', true, true),
('manager', 'manager@valeo-neuroerp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Max', 'Mustermann', 'manager', true, true),
('user1', 'user1@valeo-neuroerp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Anna', 'Schmidt', 'user', true, true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO inventory (name, sku, description, quantity, unit_price, category, supplier, status) VALUES
('Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'Hochwertiger Business-Laptop', 15, 1299.99, 'Electronics', 'Dell Inc.', 'in_stock'),
('Monitor Samsung 27"', 'MON-SAMS-27', '27-Zoll Full HD Monitor', 25, 299.99, 'Electronics', 'Samsung Electronics', 'in_stock'),
('Bürostuhl ergonomisch', 'CHAIR-ERG-001', 'Ergonomischer Bürostuhl', 8, 599.99, 'Furniture', 'Herman Miller', 'low_stock'),
('Drucker HP LaserJet', 'PRINT-HP-LJ', 'Schwarz-Weiß Laserdrucker', 12, 199.99, 'Electronics', 'HP Inc.', 'in_stock')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO transactions (user_id, type, amount, description, category, status, transaction_date) VALUES
((SELECT id FROM users WHERE username = 'manager'), 'income', 5000.00, 'Monatliches Gehalt', 'Salary', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'manager'), 'expense', 299.99, 'Monitor für Büro', 'Equipment', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
((SELECT id FROM users WHERE username = 'user1'), 'income', 3500.00, 'Monatliches Gehalt', 'Salary', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'user1'), 'expense', 1299.99, 'Laptop für Arbeit', 'Equipment', 'pending', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type) VALUES
((SELECT id FROM users WHERE username = 'manager'), 'Niedriger Lagerbestand', 'Bürostuhl ergonomisch ist fast ausverkauft', 'warning'),
((SELECT id FROM users WHERE username = 'admin'), 'System-Update', 'Neue Version verfügbar', 'info'),
((SELECT id FROM users WHERE username = 'user1'), 'Transaktion genehmigt', 'Ihre Transaktion wurde genehmigt', 'success')
ON CONFLICT DO NOTHING;

-- Views erstellen
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    u.username,
    COUNT(t.id) as total_transactions,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
    AVG(t.amount) as avg_amount
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.username;

CREATE OR REPLACE VIEW inventory_status AS
SELECT 
    category,
    COUNT(*) as total_items,
    SUM(quantity) as total_quantity,
    AVG(unit_price) as avg_price,
    COUNT(CASE WHEN status = 'low_stock' THEN 1 END) as low_stock_count,
    COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock_count
FROM inventory
GROUP BY category;

-- Funktionen erstellen
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    type VARCHAR(50),
    amount DECIMAL(15,2),
    description TEXT,
    status VARCHAR(50),
    transaction_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.type, t.amount, t.description, t.status, t.transaction_date
    FROM transactions t
    WHERE t.user_id = p_user_id
    ORDER BY t.transaction_date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_low_stock_items(p_threshold INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    sku VARCHAR(100),
    quantity INTEGER,
    unit_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.sku, i.quantity, i.unit_price
    FROM inventory i
    WHERE i.quantity <= p_threshold
    ORDER BY i.quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Berechtigungen setzen
GRANT USAGE ON SCHEMA neuroerp TO neuroerp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA neuroerp TO neuroerp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA neuroerp TO neuroerp;

GRANT USAGE ON SCHEMA audit TO neuroerp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO neuroerp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO neuroerp;

GRANT USAGE ON SCHEMA analytics TO neuroerp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO neuroerp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO neuroerp;

-- Statistiken aktualisieren
ANALYZE;

-- Erfolgreiche Initialisierung loggen
INSERT INTO system_logs (level, message, module) VALUES
('INFO', 'Database initialization completed successfully', 'database');

COMMIT; 