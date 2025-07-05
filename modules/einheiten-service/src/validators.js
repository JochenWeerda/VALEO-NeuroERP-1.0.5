/**
 * Validators-Modul fÃ¼r einheiten-service
 * @module einheiten-service/validators
 */

// Minimale Implementierung fÃ¼r einheiten-service/validators

class Validators {
    constructor() {
        this.name = 'Validators';
        this.module = 'einheiten-service';
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
