/**
 * Database-Modul fÃ¼r core-database
 * @module core-database/database
 */

// Minimale Implementierung fÃ¼r core-database/database

class Database {
    constructor() {
        this.name = 'Database';
        this.module = 'core-database';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Database();

module.exports = {
    Database,
    default: instance
};
