/**
 * Transaction-Modul für finance-core
 * @module finance-core/transaction
 */

const { logInfo, logError } = require('../../logging-service/src/index');
const { getConnection } = require('../../core-database/src/index');

class Transaction {
    constructor(data = {}) {
        this.id = data.id || null;
        this.type = data.type || 'STANDARD';
        this.amount = data.amount || 0;
        this.currency = data.currency || 'EUR';
        this.description = data.description || '';
        this.reference = data.reference || '';
        this.status = data.status || 'PENDING';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.accountId = data.accountId || null;
        this.batchId = data.batchId || null;
    }

    validate() {
        if (!this.amount || typeof this.amount !== 'number') {
            throw new Error('Ungültiger Betrag');
        }
        if (!this.accountId) {
            throw new Error('Konto-ID erforderlich');
        }
        if (!['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(this.status)) {
            throw new Error('Ungültiger Status');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            amount: this.amount,
            currency: this.currency,
            description: this.description,
            reference: this.reference,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            accountId: this.accountId,
            batchId: this.batchId
        };
    }
}

class TransactionManager {
    constructor() {
        this.batchSize = 1000;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // ms
    }

    async getById(id) {
        try {
            const db = getConnection();
            const result = await db.execute(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );
            return result.length ? new Transaction(result[0]) : null;
        } catch (error) {
            logError(`Fehler beim Laden der Transaktion ${id}: ${error.message}`);
            throw error;
        }
    }

    async save(transaction) {
        try {
            transaction.validate();
            const db = getConnection();
            transaction.updatedAt = new Date();

            if (!transaction.id) {
                transaction.createdAt = new Date();
                const result = await db.execute(
                    'INSERT INTO transactions (type, amount, currency, description, reference, status, created_at, updated_at, account_id, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        transaction.type,
                        transaction.amount,
                        transaction.currency,
                        transaction.description,
                        transaction.reference,
                        transaction.status,
                        transaction.createdAt,
                        transaction.updatedAt,
                        transaction.accountId,
                        transaction.batchId
                    ]
                );
                transaction.id = result.insertId;
            } else {
                await db.execute(
                    'UPDATE transactions SET type = ?, amount = ?, currency = ?, description = ?, reference = ?, status = ?, updated_at = ?, account_id = ?, batch_id = ? WHERE id = ?',
                    [
                        transaction.type,
                        transaction.amount,
                        transaction.currency,
                        transaction.description,
                        transaction.reference,
                        transaction.status,
                        transaction.updatedAt,
                        transaction.accountId,
                        transaction.batchId,
                        transaction.id
                    ]
                );
            }

            logInfo(`Transaktion gespeichert: ${transaction.id}`);
            return transaction;
        } catch (error) {
            logError(`Fehler beim Speichern der Transaktion: ${error.message}`);
            throw error;
        }
    }

    async processBatch(transactions) {
        const results = {
            successful: [],
            failed: []
        };

        // Gruppiere Transaktionen in Batches
        const batches = [];
        for (let i = 0; i < transactions.length; i += this.batchSize) {
            batches.push(transactions.slice(i, i + this.batchSize));
        }

        // Generiere Batch-ID
        const batchId = Date.now().toString();

        // Verarbeite jede Batch
        for (const batch of batches) {
            try {
                await this.processTransactionBatch(batch, batchId, results);
            } catch (error) {
                logError(`Fehler bei Batch-Verarbeitung: ${error.message}`);
                // Füge fehlgeschlagene Transaktionen hinzu
                batch.forEach(t => results.failed.push({
                    transaction: t,
                    error: error.message
                }));
            }
        }

        return results;
    }

    async processTransactionBatch(batch, batchId, results) {
        const db = getConnection();
        
        try {
            await db.beginTransaction();

            for (const transaction of batch) {
                transaction.batchId = batchId;
                transaction.status = 'PROCESSING';

                for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
                    try {
                        const savedTransaction = await this.save(transaction);
                        results.successful.push(savedTransaction);
                        break;
                    } catch (error) {
                        if (attempt === this.retryAttempts - 1) {
                            throw error;
                        }
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    }
                }
            }

            await db.commit();
        } catch (error) {
            await db.rollback();
            throw error;
        }
    }

    async getTransactionsByAccount(accountId, options = {}) {
        try {
            const {
                limit = 100,
                offset = 0,
                status = null,
                startDate = null,
                endDate = null
            } = options;

            let query = 'SELECT * FROM transactions WHERE account_id = ?';
            const params = [accountId];

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            if (startDate) {
                query += ' AND created_at >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND created_at <= ?';
                params.push(endDate);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const db = getConnection();
            const results = await db.execute(query, params);
            
            return results.map(row => new Transaction(row));
        } catch (error) {
            logError(`Fehler beim Laden der Transaktionen: ${error.message}`);
            throw error;
        }
    }
}

// Singleton-Instanz
const transactionManager = new TransactionManager();

module.exports = {
    Transaction,
    transactionManager
};
