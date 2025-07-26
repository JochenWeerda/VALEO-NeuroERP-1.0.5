const { Pool } = require('pg');
const logger = require('./logger');

class FinanceDatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'valeoflow_finance',
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
            logger.info('Finance Database Service erfolgreich verbunden');
            return true;
        } catch (error) {
            logger.error('Fehler beim Verbinden zur Finance Database', { error: error.message });
            throw error;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info('Finance Database Service Verbindung beendet');
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

    // Finance Entries CRUD
    async getFinanceEntries(limit = 10, offset = 0, search = null) {
        let query = `
            SELECT * FROM finance_entries 
            WHERE status = 'active'
        `;
        const params = [];

        if (search) {
            query += ` AND (name ILIKE $1 OR entry_number ILIKE $1 OR account_code ILIKE $1)`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY entry_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async getFinanceEntryById(id) {
        const query = 'SELECT * FROM finance_entries WHERE id = $1 AND status = $2';
        const result = await this.executeQuery(query, [id, 'active']);
        return result.rows[0] || null;
    }

    async createFinanceEntry(entryData) {
        const {
            name, amount, entry_date, account_code, account_name,
            partner_id, partner_name, transaction_type, notes, created_by
        } = entryData;

        const entry_number = `FE${Date.now()}`;
        
        const query = `
            INSERT INTO finance_entries (
                entry_number, name, amount, entry_date, account_code, account_name,
                partner_id, partner_name, transaction_type, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const params = [
            entry_number, name, amount, entry_date, account_code, account_name,
            partner_id, partner_name, transaction_type, notes, created_by
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    async updateFinanceEntry(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length ====== 0) {
            throw new Error('Keine Felder zum Aktualisieren angegeben');
        }

        values.push(id);
        const query = `
            UPDATE finance_entries 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.executeQuery(query, values);
        return result.rows[0] || null;
    }

    async deleteFinanceEntry(id) {
        const query = `
            UPDATE finance_entries 
            SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await this.executeQuery(query, [id]);
        return result.rows[0] || null;
    }

    // Invoices CRUD
    async getInvoices(limit = 10, offset = 0, search = null, status = null) {
        let query = 'SELECT * FROM invoices WHERE 1=1';
        const params = [];

        if (search) {
            query += ` AND (invoice_number ILIKE $${params.length + 1} OR customer_name ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (status) {
            query += ` AND status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY invoice_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async getInvoiceById(id) {
        const query = 'SELECT * FROM invoices WHERE id = $1';
        const result = await this.executeQuery(query, [id]);
        return result.rows[0] || null;
    }

    async createInvoice(invoiceData) {
        const {
            customer_id, customer_name, invoice_date, due_date,
            total_amount, tax_amount, net_amount, currency, payment_terms, notes
        } = invoiceData;

        const invoice_number = `INV${Date.now()}`;
        
        const query = `
            INSERT INTO invoices (
                invoice_number, customer_id, customer_name, invoice_date, due_date,
                total_amount, tax_amount, net_amount, currency, payment_terms, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const params = [
            invoice_number, customer_id, customer_name, invoice_date, due_date,
            total_amount, tax_amount, net_amount, currency, payment_terms, notes
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    async updateInvoice(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length ====== 0) {
            throw new Error('Keine Felder zum Aktualisieren angegeben');
        }

        values.push(id);
        const query = `
            UPDATE invoices 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.executeQuery(query, values);
        return result.rows[0] || null;
    }

    // Payments CRUD
    async getPayments(limit = 10, offset = 0, invoice_id = null) {
        let query = 'SELECT * FROM payments WHERE 1=1';
        const params = [];

        if (invoice_id) {
            query += ` AND invoice_id = $${params.length + 1}`;
            params.push(invoice_id);
        }

        query += ` ORDER BY payment_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    async createPayment(paymentData) {
        const {
            invoice_id, customer_id, payment_date, amount,
            payment_method, reference, notes
        } = paymentData;

        const payment_number = `PAY${Date.now()}`;
        
        const query = `
            INSERT INTO payments (
                payment_number, invoice_id, customer_id, payment_date,
                amount, payment_method, reference, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const params = [
            payment_number, invoice_id, customer_id, payment_date,
            amount, payment_method, reference, notes
        ];

        const result = await this.executeQuery(query, params);
        return result.rows[0];
    }

    // Chart of Accounts
    async getChartOfAccounts(account_type = null) {
        let query = 'SELECT * FROM chart_of_accounts WHERE is_active = true';
        const params = [];

        if (account_type) {
            query += ` AND account_type = $${params.length + 1}`;
            params.push(account_type);
        }

        query += ' ORDER BY account_code';

        const result = await this.executeQuery(query, params);
        return result.rows;
    }

    // Financial Statistics
    async getFinancialStatistics() {
        const stats = {};

        // Total entries count
        const entriesResult = await this.executeQuery(
            'SELECT COUNT(*) as total_entries FROM finance_entries WHERE status = $1',
            ['active']
        );
        stats.total_entries = parseInt(entriesResult.rows[0].total_entries);

        // Total invoices count
        const invoicesResult = await this.executeQuery(
            'SELECT COUNT(*) as total_invoices FROM invoices'
        );
        stats.total_invoices = parseInt(invoicesResult.rows[0].total_invoices);

        // Open invoices count
        const openInvoicesResult = await this.executeQuery(
            'SELECT COUNT(*) as open_invoices FROM invoices WHERE status = $1',
            ['open']
        );
        stats.open_invoices = parseInt(openInvoicesResult.rows[0].open_invoices);

        // Total payments count
        const paymentsResult = await this.executeQuery(
            'SELECT COUNT(*) as total_payments FROM payments'
        );
        stats.total_payments = parseInt(paymentsResult.rows[0].total_payments);

        // Total amount of entries
        const totalAmountResult = await this.executeQuery(
            'SELECT COALESCE(SUM(amount), 0) as total_amount FROM finance_entries WHERE status = $1',
            ['active']
        );
        stats.total_amount = parseFloat(totalAmountResult.rows[0].total_amount);

        return stats;
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
        dbService = new FinanceDatabaseService();
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
    FinanceDatabaseService,
    initDatabase,
    getDatabaseService
}; 