const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

class UsersDatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'valeoflow_users',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            logger.info('Users Database Service erfolgreich verbunden');
            return true;
        } catch (error) {
            logger.error('Fehler beim Verbinden zur Users Database', { error: error.message });
            throw error;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info('Users Database Service Verbindung beendet');
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

    // Authentication Methods
    async authenticateUser(username, password) {
        const query = `
            SELECT u.*, array_agg(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.username = $1 AND u.is_active = $2
            GROUP BY u.id
        `;

        const result = await this.executeQuery(query, [username, true]);
        const user = result.rows[0];

        if (!user) {
            return null;
        }

        // Check if account is locked
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            logger.logSecurityEvent('account_locked', { username, lockedUntil: user.locked_until });
            return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            // Increment failed login attempts
            await this.incrementFailedLoginAttempts(user.id);
            logger.logSecurityEvent('failed_login', { username, userId: user.id });
            return null;
        }

        // Reset failed login attempts on successful login
        await this.resetFailedLoginAttempts(user.id);
        await this.updateLastLogin(user.id);

        // Remove password hash from response
        delete user.password_hash;
        return user;
    }

    async incrementFailedLoginAttempts(userId) {
        const query = `
            UPDATE users 
            SET failed_login_attempts = failed_login_attempts + 1,
                locked_until = CASE 
                    WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
                    ELSE locked_until 
                END
            WHERE id = $1
        `;
        await this.executeQuery(query, [userId]);
    }

    async resetFailedLoginAttempts(userId) {
        const query = `
            UPDATE users 
            SET failed_login_attempts = 0, locked_until = NULL
            WHERE id = $1
        `;
        await this.executeQuery(query, [userId]);
    }

    async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
        await this.executeQuery(query, [userId]);
    }

    // User Management
    async getUsers(limit = 10, offset = 0, search = null, isActive = null, isSalesRep = null) {
        let query = `
            SELECT u.*, array_agg(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
        `;
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push(`(u.username ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1} OR u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (isActive !== null) {
            conditions.push(`u.is_active = $${params.length + 1}`);
            params.push(isActive);
        }

        if (isSalesRep !== null) {
            conditions.push(`u.is_sales_rep = $${params.length + 1}`);
            params.push(isSalesRep);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await this.executeQuery(query, params);
        return result.rows.map(user => {
            delete user.password_hash;
            return user;
        });
    }

    async getUserById(id) {
        const query = `
            SELECT u.*, array_agg(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = $1
            GROUP BY u.id
        `;

        const result = await this.executeQuery(query, [id]);
        const user = result.rows[0];

        if (user) {
            delete user.password_hash;
        }

        return user;
    }

    async createUser(userData) {
        const {
            username, email, password, first_name, last_name, sales_rep_code,
            phone, department, position, is_sales_rep
        } = userData;

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const query = `
            INSERT INTO users (
                username, email, password_hash, first_name, last_name,
                sales_rep_code, phone, department, position, is_sales_rep
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const params = [
            username, email, passwordHash, first_name, last_name,
            sales_rep_code, phone, department, position, is_sales_rep || false
        ];

        const result = await this.executeQuery(query, params);
        const user = result.rows[0];
        delete user.password_hash;
        return user;
    }

    async updateUser(id, updateData) {
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'department',
            'position', 'is_active', 'is_sales_rep', 'sales_rep_code'
        ];

        const updates = [];
        const params = [];
        let paramCount = 1;

        for (const [field, value] of Object.entries(updateData)) {
            if (allowedFields.includes(field) && value !== undefined) {
                updates.push(`${field} = $${paramCount}`);
                params.push(value);
                paramCount++;
            }
        }

        if (updates.length ====== 0) {
            return null;
        }

        params.push(id);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await this.executeQuery(query, params);
        const user = result.rows[0];

        if (user) {
            delete user.password_hash;
        }

        return user;
    }

    async deleteUser(id) {
        const query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *';
        const result = await this.executeQuery(query, [id]);
        return result.rows[0];
    }

    // Role Management
    async getRoles() {
        const query = 'SELECT * FROM roles WHERE is_active = true ORDER BY name';
        const result = await this.executeQuery(query);
        return result.rows;
    }

    async assignRoleToUser(userId, roleId, assignedBy) {
        const query = `
            INSERT INTO user_roles (user_id, role_id, assigned_by)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, role_id) DO NOTHING
            RETURNING *
        `;

        const result = await this.executeQuery(query, [userId, roleId, assignedBy]);
        return result.rows[0];
    }

    async removeRoleFromUser(userId, roleId) {
        const query = 'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 RETURNING *';
        const result = await this.executeQuery(query, [userId, roleId]);
        return result.rows[0];
    }

    // Session Management
    async createSession(userId, ipAddress, userAgent) {
        const sessionToken = uuidv4();
        const refreshToken = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const query = `
            INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await this.executeQuery(query, [
            userId, sessionToken, refreshToken, ipAddress, userAgent, expiresAt
        ]);

        return result.rows[0];
    }

    async validateSession(sessionToken) {
        const query = `
            SELECT us.*, u.username, u.email, u.first_name, u.last_name, array_agg(r.name) as roles
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE us.session_token = $1 AND us.expires_at > NOW() AND u.is_active = true
            GROUP BY us.id, u.id
        `;

        const result = await this.executeQuery(query, [sessionToken]);
        return result.rows[0];
    }

    async deleteSession(sessionToken) {
        const query = 'DELETE FROM user_sessions WHERE session_token = $1 RETURNING *';
        const result = await this.executeQuery(query, [sessionToken]);
        return result.rows[0];
    }

    // Password Reset
    async createPasswordResetToken(userId) {
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const query = `
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await this.executeQuery(query, [userId, token, expiresAt]);
        return result.rows[0];
    }

    async validatePasswordResetToken(token) {
        const query = `
            SELECT prt.*, u.email, u.username
            FROM password_reset_tokens prt
            JOIN users u ON prt.user_id = u.id
            WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.used_at IS NULL
        `;

        const result = await this.executeQuery(query, [token]);
        return result.rows[0];
    }

    async resetPassword(token, newPassword) {
        const resetToken = await this.validatePasswordResetToken(token);
        if (!resetToken) {
            return null;
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update password and mark token as used
        const query = `
            UPDATE users 
            SET password_hash = $1, updated_at = NOW()
            WHERE id = $2
        `;

        await this.executeQuery(query, [passwordHash, resetToken.user_id]);

        // Mark token as used
        const updateTokenQuery = `
            UPDATE password_reset_tokens 
            SET used_at = NOW() 
            WHERE token = $1
        `;

        await this.executeQuery(updateTokenQuery, [token]);

        return { success: true };
    }

    // Activity Logging
    async logActivity(userId, action, resourceType, resourceId, details, ipAddress, userAgent) {
        const query = `
            INSERT INTO user_activity_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await this.executeQuery(query, [
            userId, action, resourceType, resourceId, details, ipAddress, userAgent
        ]);

        return result.rows[0];
    }

    // Statistics
    async getUserStatistics() {
        const stats = {};

        // Total users count
        const usersResult = await this.executeQuery(
            'SELECT COUNT(*) as total_users FROM users WHERE is_active = $1',
            [true]
        );
        stats.total_users = parseInt(usersResult.rows[0].total_users);

        // Active sessions count
        const sessionsResult = await this.executeQuery(
            'SELECT COUNT(*) as active_sessions FROM user_sessions WHERE expires_at > NOW()'
        );
        stats.active_sessions = parseInt(sessionsResult.rows[0].active_sessions);

        // Sales representatives count
        const salesRepsResult = await this.executeQuery(
            'SELECT COUNT(*) as sales_reps FROM users WHERE is_sales_rep = $1 AND is_active = $2',
            [true, true]
        );
        stats.sales_reps = parseInt(salesRepsResult.rows[0].sales_reps);

        // Recent logins (last 24 hours)
        const recentLoginsResult = await this.executeQuery(
            'SELECT COUNT(*) as recent_logins FROM users WHERE last_login > NOW() - INTERVAL \'24 hours\''
        );
        stats.recent_logins = parseInt(recentLoginsResult.rows[0].recent_logins);

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
        dbService = new UsersDatabaseService();
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
    UsersDatabaseService,
    initDatabase,
    getDatabaseService
}; 