const { Pool } = require('pg');
const logger = require('./logger');

class InventoryDatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'valeoflow_inventory',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            logger.info('Inventory Database Service erfolgreich verbunden');
            return true;
        } catch (error) {
            logger.error('Fehler beim Verbinden zur Inventory Database', { error: error.message });
            throw error;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info('Inventory Database Service Verbindung beendet');
        }
    }

    async executeQuery(query, params = []) {
        if (!this.isConnected) {
            throw new Error('Database nicht verbunden');
        }

        try {
            const result = await this.pool.query(query, params);
            return result;
        } catch (error) {
            logger.error('Database Query Fehler', { 
                query: query.substring(0, 100), 
                error: error.message 
            });
            throw error;
        }
    }

    // Warehouses CRUD
    async getWarehouses(limit = 10, offset = 0, search = null) {
        let query = `
            SELECT * FROM warehouses 
            WHERE is_active = true
        `;
        const params = [];

        if (search) {
            query += ` AND (warehouse_name ILIKE $1 OR warehouse_code ILIKE $1)`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY warehouse_code LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async getWarehouseById(id) {
        const query = 'SELECT * FROM warehouses WHERE id = $1 AND is_active = $2';
        const result = await this.executeQuery(query, [id, true]);
        return result.rows[0] || null;
    }

    async createWarehouse(warehouseData) {
        const {
            warehouse_code, warehouse_name, warehouse_type, address,
            contact_person, contact_email, contact_phone
        } = warehouseData;
        
        const query = `
            INSERT INTO warehouses (
                warehouse_code, warehouse_name, warehouse_type, address,
                contact_person, contact_email, contact_phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const params = [
            warehouse_code, warehouse_name, warehouse_type, address,
            contact_person, contact_email, contact_phone
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Articles CRUD
    async getArticles(limit = 10, offset = 0, search = null, category = null) {
        let query = 'SELECT * FROM articles WHERE is_active = true';
        const params = [];

        if (search) {
            query += ` AND (article_name ILIKE $${params.length + 1} OR article_number ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (category) {
            query += ` AND category = $${params.length + 1}`;
            params.push(category);
        }

        query += ` ORDER BY article_number LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async getArticleById(id) {
        const query = 'SELECT * FROM articles WHERE id = $1 AND is_active = $2';
        const result = await this.executeQuery(query, [id, true]);
        return result.rows[0] || null;
    }

    async createArticle(articleData) {
        const {
            article_number, article_name, description, category, unit,
            weight, weight_unit, dimensions, min_stock, max_stock,
            reorder_point, supplier_id, supplier_article_number
        } = articleData;
        
        const query = `
            INSERT INTO articles (
                article_number, article_name, description, category, unit,
                weight, weight_unit, dimensions, min_stock, max_stock,
                reorder_point, supplier_id, supplier_article_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const params = [
            article_number, article_name, description, category, unit,
            weight, weight_unit, dimensions, min_stock, max_stock,
            reorder_point, supplier_id, supplier_article_number
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Batches CRUD
    async getBatches(limit = 10, offset = 0, article_id = null, search = null) {
        let query = `
            SELECT b.*, a.article_name, a.article_number 
            FROM batches b
            JOIN articles a ON b.article_id = a.id
            WHERE a.is_active = true
        `;
        const params = [];

        if (article_id) {
            query += ` AND b.article_id = $${params.length + 1}`;
            params.push(article_id);
        }

        if (search) {
            query += ` AND (b.batch_number ILIKE $${params.length + 1} OR b.lot_number ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async createBatch(batchData) {
        const {
            batch_number, article_id, production_date, expiry_date,
            lot_number, supplier_batch, quality_status, quantity,
            unit_cost, currency, notes
        } = batchData;
        
        const query = `
            INSERT INTO batches (
                batch_number, article_id, production_date, expiry_date,
                lot_number, supplier_batch, quality_status, quantity,
                available_quantity, unit_cost, currency, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11)
            RETURNING *
        `;

        const params = [
            batch_number, article_id, production_date, expiry_date,
            lot_number, supplier_batch, quality_status, quantity,
            unit_cost, currency, notes
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Stock Movements CRUD
    async getStockMovements(limit = 10, offset = 0, article_id = null, batch_id = null, warehouse_id = null) {
        let query = `
            SELECT sm.*, a.article_name, a.article_number, b.batch_number,
                   w.warehouse_name, wl.location_name
            FROM stock_movements sm
            JOIN articles a ON sm.article_id = a.id
            LEFT JOIN batches b ON sm.batch_id = b.id
            JOIN warehouses w ON sm.warehouse_id = w.id
            LEFT JOIN warehouse_locations wl ON sm.location_id = wl.id
            WHERE a.is_active = true
        `;
        const params = [];

        if (article_id) {
            query += ` AND sm.article_id = $${params.length + 1}`;
            params.push(article_id);
        }

        if (batch_id) {
            query += ` AND sm.batch_id = $${params.length + 1}`;
            params.push(batch_id);
        }

        if (warehouse_id) {
            query += ` AND sm.warehouse_id = $${params.length + 1}`;
            params.push(warehouse_id);
        }

        query += ` ORDER BY sm.movement_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async createStockMovement(movementData) {
        const {
            movement_type, article_id, batch_id, warehouse_id, location_id,
            quantity, unit_cost, reference_type, reference_id, reference_number,
            notes, created_by
        } = movementData;

        const movement_number = `SM${Date.now()}`;
        
        const query = `
            INSERT INTO stock_movements (
                movement_number, movement_type, article_id, batch_id, warehouse_id,
                location_id, quantity, unit_cost, reference_type, reference_id,
                reference_number, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const params = [
            movement_number, movement_type, article_id, batch_id, warehouse_id,
            location_id, quantity, unit_cost, reference_type, reference_id,
            reference_number, notes, created_by
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Inventory Counts CRUD
    async getInventoryCounts(limit = 10, offset = 0, warehouse_id = null, status = null) {
        let query = `
            SELECT ic.*, w.warehouse_name
            FROM inventory_counts ic
            JOIN warehouses w ON ic.warehouse_id = w.id
            WHERE w.is_active = true
        `;
        const params = [];

        if (warehouse_id) {
            query += ` AND ic.warehouse_id = $${params.length + 1}`;
            params.push(warehouse_id);
        }

        if (status) {
            query += ` AND ic.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY ic.count_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async createInventoryCount(countData) {
        const {
            count_name, warehouse_id, count_date, count_type, description, created_by
        } = countData;

        const count_number = `INV${Date.now()}`;
        
        const query = `
            INSERT INTO inventory_counts (
                count_number, count_name, warehouse_id, count_date, count_type,
                description, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const params = [
            count_number, count_name, warehouse_id, count_date, count_type,
            description, created_by
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Stock Statistics
    async getStockStatistics() {
        const stats = {};

        // Total articles count
        const articlesResult = await this.executeQuery(
            'SELECT COUNT(*) as total_articles FROM articles WHERE is_active = $1',
            [true]
        );
        stats.total_articles = parseInt(articlesResult.rows[0].total_articles);

        // Total batches count
        const batchesResult = await this.executeQuery(
            'SELECT COUNT(*) as total_batches FROM batches'
        );
        stats.total_batches = parseInt(batchesResult.rows[0].total_batches);

        // Total warehouses count
        const warehousesResult = await this.executeQuery(
            'SELECT COUNT(*) as total_warehouses FROM warehouses WHERE is_active = $1',
            [true]
        );
        stats.total_warehouses = parseInt(warehousesResult.rows[0].total_warehouses);

        // Total stock movements count
        const movementsResult = await this.executeQuery(
            'SELECT COUNT(*) as total_movements FROM stock_movements'
        );
        stats.total_movements = parseInt(movementsResult.rows[0].total_movements);

        // Total inventory counts count
        const countsResult = await this.executeQuery(
            'SELECT COUNT(*) as total_counts FROM inventory_counts'
        );
        stats.total_counts = parseInt(countsResult.rows[0].total_counts);

        // Total stock value
        const stockValueResult = await this.executeQuery(`
            SELECT COALESCE(SUM(b.quantity * b.unit_cost), 0) as total_stock_value
            FROM batches b
            JOIN articles a ON b.article_id = a.id
            WHERE a.is_active = true AND b.quantity > 0
        `);
        stats.total_stock_value = parseFloat(stockValueResult.rows[0].total_stock_value);

        return stats;
    }

    // Stock Alerts
    async getStockAlerts(limit = 10, offset = 0) {
        const query = `
            SELECT sa.*, a.article_name, a.article_number, b.batch_number,
                   w.warehouse_name
            FROM stock_alerts sa
            JOIN articles a ON sa.article_id = a.id
            LEFT JOIN batches b ON sa.batch_id = b.id
            JOIN warehouses w ON sa.warehouse_id = w.id
            WHERE sa.is_active = true
            ORDER BY sa.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await this.executeQuery(query, [limit, offset]);
        return result.rows;
    }

    // Health check
    async checkDatabaseHealth() {
        try {
            const result = await this.executeQuery('SELECT NOW() as current_time');
            return {
                status: 'healthy',
                timestamp: result.rows[0].current_time,
                connected: this.isConnected
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                connected: this.isConnected
            };
        }
    }
}

// Singleton instance
let dbService = null;

// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen
async function initDatabase() {
async function initDatabase() {
    if (!dbService) {
        dbService = new InventoryDatabaseService();
        await dbService.connect();
    }
    return dbService;
}

function getDatabaseService() {
    if (!dbService) {
        throw new Error('Database Service nicht initialisiert. Rufen Sie initDatabase() zuerst auf.');
    }
    return dbService;
}

module.exports = {
    InventoryDatabaseService,
    initDatabase,
    getDatabaseService
}; 