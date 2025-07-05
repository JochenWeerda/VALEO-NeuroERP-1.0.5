/**
 * Validators-Modul fÃ¼r artikel-stammdaten
 * @module artikel-stammdaten/validators
 */

// Minimale Implementierung fÃ¼r artikel-stammdaten/validators

class Validators {
    constructor() {
        this.name = 'Validators';
        this.module = 'artikel-stammdaten';
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
