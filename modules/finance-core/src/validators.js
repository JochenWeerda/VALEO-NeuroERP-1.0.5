/**
 * Validators-Modul fÃ¼r finance-core
 * @module finance-core/validators
 */

// Minimale Implementierung fÃ¼r finance-core/validators

class Validators {
    constructor() {
        this.name = 'Validators';
        this.module = 'finance-core';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Validators();

module.exports = {
    Validators,
    default: instance
};
