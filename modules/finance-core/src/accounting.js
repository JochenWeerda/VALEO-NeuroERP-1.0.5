/**
 * Accounting-Modul fÃ¼r finance-core
 * @module finance-core/accounting
 */

// Minimale Implementierung fÃ¼r finance-core/accounting

class Accounting {
    constructor() {
        this.name = 'Accounting';
        this.module = 'finance-core';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Accounting();

module.exports = {
    Accounting,
    default: instance
};
