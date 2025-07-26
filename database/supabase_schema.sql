-- VALEO NeuroERP Supabase Schema
-- Erstellt die Demo-Tabellen für die MCP-Integration

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE invoice_status AS ENUM ('open', 'paid', 'overdue');
CREATE TYPE customer_type AS ENUM ('individual', 'company');
CREATE TYPE product_category AS ENUM ('hardware', 'software', 'service');

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    type customer_type DEFAULT 'individual',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category product_category NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status invoice_status DEFAULT 'open',
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers are viewable by everyone" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Customers can be created by authenticated users" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers can be updated by authenticated users" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can be deleted by authenticated users" ON customers
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products can be created by authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products can be updated by authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be deleted by authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for invoices
CREATE POLICY "Invoices are viewable by authenticated users" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Invoices can be created by authenticated users" ON invoices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Invoices cannot be updated after creation (business rule)
-- CREATE POLICY "Invoices can be updated by authenticated users" ON invoices
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Invoices cannot be deleted (business rule)
-- CREATE POLICY "Invoices can be deleted by authenticated users" ON invoices
--     FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for invoice_items
CREATE POLICY "Invoice items are viewable by authenticated users" ON invoice_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Invoice items can be created by authenticated users" ON invoice_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Invoice items cannot be updated or deleted (business rule)
-- CREATE POLICY "Invoice items can be updated by authenticated users" ON invoice_items
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Invoice items can be deleted by authenticated users" ON invoice_items
--     FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for orders
CREATE POLICY "Orders are viewable by authenticated users" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Orders can be created by authenticated users" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Orders can be updated by authenticated users" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Orders can be deleted by authenticated users" ON orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for order_items
CREATE POLICY "Order items are viewable by authenticated users" ON order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Order items can be created by authenticated users" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Order items can be updated by authenticated users" ON order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Order items can be deleted by authenticated users" ON order_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamps
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for calculating invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(total_price) FROM invoice_items WHERE invoice_id = invoice_uuid),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Create function for calculating order totals
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(total_price) FROM order_items WHERE order_id = order_uuid),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Insert demo data
INSERT INTO customers (name, email, phone, type, address) VALUES
('Max Mustermann', 'max@example.com', '+49 123 456789', 'individual', 'Musterstraße 1, 12345 Musterstadt'),
('Anna Schmidt', 'anna@example.com', '+49 987 654321', 'individual', 'Beispielweg 5, 54321 Beispielort'),
('TechCorp GmbH', 'info@techcorp.de', '+49 555 123456', 'company', 'Industriestraße 10, 10115 Berlin'),
('StartupXYZ', 'hello@startupxyz.com', '+49 777 888999', 'company', 'Innovation Park 3, 20095 Hamburg');

INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 'hardware', 50),
('Office Suite', 'Complete office software package', 299.99, 'software', 1000),
('Cloud Storage', 'Secure cloud storage solution', 9.99, 'service', 9999),
('Server Hardware', 'Enterprise server equipment', 2499.99, 'hardware', 10),
('Security Software', 'Advanced security suite', 199.99, 'software', 500),
('Consulting Service', 'IT consulting and support', 150.00, 'service', 9999);

INSERT INTO invoices (customer_id, amount, status, due_date) VALUES
((SELECT id FROM customers WHERE email = 'max@example.com'), 1299.99, 'open', CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM customers WHERE email = 'anna@example.com'), 299.99, 'paid', CURRENT_DATE - INTERVAL '5 days'),
((SELECT id FROM customers WHERE email = 'info@techcorp.de'), 2499.99, 'overdue', CURRENT_DATE - INTERVAL '10 days'),
((SELECT id FROM customers WHERE email = 'hello@startupxyz.com'), 599.97, 'open', CURRENT_DATE + INTERVAL '15 days');

INSERT INTO orders (customer_id, total_amount, status) VALUES
((SELECT id FROM customers WHERE email = 'max@example.com'), 1299.99, 'completed'),
((SELECT id FROM customers WHERE email = 'anna@example.com'), 299.99, 'completed'),
((SELECT id FROM customers WHERE email = 'info@techcorp.de'), 2499.99, 'pending'),
((SELECT id FROM customers WHERE email = 'hello@startupxyz.com'), 599.97, 'processing');

-- Insert invoice items
INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM invoices WHERE customer_id = (SELECT id FROM customers WHERE email = 'max@example.com')), 
 (SELECT id FROM products WHERE name = 'Laptop Pro'), 1, 1299.99, 1299.99),
((SELECT id FROM invoices WHERE customer_id = (SELECT id FROM customers WHERE email = 'anna@example.com')), 
 (SELECT id FROM products WHERE name = 'Office Suite'), 1, 299.99, 299.99),
((SELECT id FROM invoices WHERE customer_id = (SELECT id FROM customers WHERE email = 'info@techcorp.de')), 
 (SELECT id FROM products WHERE name = 'Server Hardware'), 1, 2499.99, 2499.99),
((SELECT id FROM invoices WHERE customer_id = (SELECT id FROM customers WHERE email = 'hello@startupxyz.com')), 
 (SELECT id FROM products WHERE name = 'Cloud Storage'), 3, 9.99, 29.97);

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'max@example.com')), 
 (SELECT id FROM products WHERE name = 'Laptop Pro'), 1, 1299.99, 1299.99),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'anna@example.com')), 
 (SELECT id FROM products WHERE name = 'Office Suite'), 1, 299.99, 299.99),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'info@techcorp.de')), 
 (SELECT id FROM products WHERE name = 'Server Hardware'), 1, 2499.99, 2499.99),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'hello@startupxyz.com')), 
 (SELECT id FROM products WHERE name = 'Cloud Storage'), 3, 9.99, 29.97);

-- Create views for easier querying
CREATE VIEW invoice_summary AS
SELECT 
    i.id,
    i.customer_id,
    c.name as customer_name,
    c.email as customer_email,
    i.amount,
    i.status,
    i.due_date,
    i.created_at,
    COUNT(ii.id) as item_count
FROM invoices i
JOIN customers c ON i.customer_id = c.id
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id, i.customer_id, c.name, c.email, i.amount, i.status, i.due_date, i.created_at;

CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.customer_id,
    c.name as customer_name,
    c.email as customer_email,
    o.total_amount,
    o.status,
    o.order_date,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_id, c.name, c.email, o.total_amount, o.status, o.order_date, o.created_at;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL VIEWS IN SCHEMA public TO anon, authenticated; 