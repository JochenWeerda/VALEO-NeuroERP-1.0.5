/**
 * Connection-Modul fÃ¼r core-database
 * @module core-database/connection
 */

// Minimale Implementierung fÃ¼r core-database/connection

class Connection {
    constructor() {
        this.name = 'Connection';
        this.module = 'core-database';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Connection();

module.exports = {
    Connection,
    default: instance
};
