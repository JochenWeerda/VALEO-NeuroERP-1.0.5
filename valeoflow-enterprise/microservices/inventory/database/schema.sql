-- ValeoFlow Inventory Database Schema
-- Kompatibel mit bestehenden L3 ERP System Tabellen

-- Warehouses (Lager)
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_code VARCHAR(20) UNIQUE NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    warehouse_type VARCHAR(50) DEFAULT 'standard',
    address TEXT,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse Locations (Lagerorte)
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    location_code VARCHAR(20) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    location_type VARCHAR(50) DEFAULT 'storage',
    aisle VARCHAR(20),
    rack VARCHAR(20),
    level VARCHAR(20),
    position VARCHAR(20),
    capacity DECIMAL(15,3),
    capacity_unit VARCHAR(10) DEFAULT 'PCS',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, location_code)
);

-- Articles (Artikel)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    article_number VARCHAR(50) UNIQUE NOT NULL,
    article_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'PCS',
    weight DECIMAL(10,3),
    weight_unit VARCHAR(10) DEFAULT 'KG',
    dimensions VARCHAR(50),
    min_stock DECIMAL(15,3) DEFAULT 0,
    max_stock DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    supplier_id VARCHAR(50),
    supplier_article_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches (Chargen)
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    production_date DATE,
    expiry_date DATE,
    lot_number VARCHAR(50),
    supplier_batch VARCHAR(50),
    quality_status VARCHAR(20) DEFAULT 'pending',
    quantity DECIMAL(15,3) DEFAULT 0,
    reserved_quantity DECIMAL(15,3) DEFAULT 0,
    available_quantity DECIMAL(15,3) DEFAULT 0,
    unit_cost DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movements (Lagerbewegungen)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    movement_number VARCHAR(50) UNIQUE NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'transfer', 'adjustment'
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES warehouse_locations(id) ON DELETE SET NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(50), -- 'purchase', 'sale', 'production', 'inventory'
    reference_id VARCHAR(50),
    reference_number VARCHAR(50),
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Counts (Inventuren)
CREATE TABLE IF NOT EXISTS inventory_counts (
    id SERIAL PRIMARY KEY,
    count_number VARCHAR(50) UNIQUE NOT NULL,
    count_name VARCHAR(255) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    count_date DATE NOT NULL,
    count_type VARCHAR(50) DEFAULT 'full', -- 'full', 'cycle', 'spot'
    status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
    description TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Count Items (Inventurpositionen)
CREATE TABLE IF NOT EXISTS inventory_count_items (
    id SERIAL PRIMARY KEY,
    inventory_count_id INTEGER REFERENCES inventory_counts(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES warehouse_locations(id) ON DELETE SET NULL,
    expected_quantity DECIMAL(15,3) NOT NULL,
    counted_quantity DECIMAL(15,3),
    difference DECIMAL(15,3),
    difference_percentage DECIMAL(5,2),
    unit_cost DECIMAL(15,2),
    difference_value DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'counted', 'verified'
    counted_by VARCHAR(50),
    counted_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations (Reservierungen)
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    reservation_number VARCHAR(50) UNIQUE NOT NULL,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES warehouse_locations(id) ON DELETE SET NULL,
    quantity DECIMAL(15,3) NOT NULL,
    reserved_quantity DECIMAL(15,3) DEFAULT 0,
    reservation_date DATE NOT NULL,
    expiry_date DATE,
    reservation_type VARCHAR(50), -- 'sales_order', 'production', 'transfer'
    reference_type VARCHAR(50),
    reference_id VARCHAR(50),
    reference_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
    notes TEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Codes (QR-Codes für Chargen)
CREATE TABLE IF NOT EXISTS qr_codes (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    qr_code_data TEXT NOT NULL,
    qr_code_image BYTEA,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(50)
);

-- Stock Alerts (Lagerwarnungen)
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'overstock', 'expiry'
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    alert_level DECIMAL(15,3),
    current_quantity DECIMAL(15,3),
    alert_message TEXT,
    is_active BOOLEAN DEFAULT true,
    acknowledged_by VARCHAR(50),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_warehouse ON warehouse_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_articles_number ON articles(article_number);
CREATE INDEX IF NOT EXISTS idx_articles_active ON articles(is_active);
CREATE INDEX IF NOT EXISTS idx_batches_number ON batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_batches_article ON batches(article_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article ON stock_movements(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_batch ON stock_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_warehouse ON inventory_counts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_status ON inventory_counts(status);
CREATE INDEX IF NOT EXISTS idx_inventory_count_items_count ON inventory_count_items(inventory_count_id);
CREATE INDEX IF NOT EXISTS idx_inventory_count_items_article ON inventory_count_items(article_id);
CREATE INDEX IF NOT EXISTS idx_reservations_article ON reservations(article_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_article ON stock_alerts(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_active ON stock_alerts(is_active);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_locations_updated_at BEFORE UPDATE ON warehouse_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_counts_updated_at BEFORE UPDATE ON inventory_counts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_count_items_updated_at BEFORE UPDATE ON inventory_count_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für Batch Quantity Updates
CREATE OR REPLACE FUNCTION update_batch_quantities()
RETURNS TRIGGER AS $$
BEGIN
    -- Update batch quantities based on stock movements
    IF NEW.movement_type = 'in' THEN
        UPDATE batches 
        SET quantity = quantity + NEW.quantity,
            available_quantity = available_quantity + NEW.quantity
        WHERE id = NEW.batch_id;
    ELSIF NEW.movement_type = 'out' THEN
        UPDATE batches 
        SET quantity = quantity - NEW.quantity,
            available_quantity = available_quantity - NEW.quantity
        WHERE id = NEW.batch_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_batch_quantities_trigger 
    AFTER INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_batch_quantities();

-- Demo-Daten
INSERT INTO warehouses (warehouse_code, warehouse_name, warehouse_type, address) VALUES
('WH001', 'Hauptlager', 'main', 'Industriestraße 1, 12345 Musterstadt'),
('WH002', 'Nebenlager', 'secondary', 'Lagerstraße 5, 12345 Musterstadt'),
('WH003', 'Kühllager', 'cold_storage', 'Kühlstraße 10, 12345 Musterstadt')
ON CONFLICT (warehouse_code) DO NOTHING;

INSERT INTO warehouse_locations (warehouse_id, location_code, location_name, location_type, aisle, rack, level) VALUES
(1, 'A-01-01', 'Regal A, Gang 1, Ebene 1', 'storage', 'A', '01', '01'),
(1, 'A-01-02', 'Regal A, Gang 1, Ebene 2', 'storage', 'A', '01', '02'),
(1, 'B-01-01', 'Regal B, Gang 1, Ebene 1', 'storage', 'B', '01', '01'),
(2, 'C-01-01', 'Regal C, Gang 1, Ebene 1', 'storage', 'C', '01', '01')
ON CONFLICT (warehouse_id, location_code) DO NOTHING;

INSERT INTO articles (article_number, article_name, description, category, unit, min_stock, max_stock, reorder_point) VALUES
('ART001', 'Produkt A', 'Standard Produkt A', 'Standard', 'PCS', 10, 100, 20),
('ART002', 'Produkt B', 'Premium Produkt B', 'Premium', 'PCS', 5, 50, 10),
('ART003', 'Rohstoff X', 'Rohstoff für Produktion', 'Rohstoff', 'KG', 100, 1000, 200)
ON CONFLICT (article_number) DO NOTHING; 