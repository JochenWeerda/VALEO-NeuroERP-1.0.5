/**
 * Formatters-Modul fÃ¼r logging-service
 * @module logging-service/formatters
 */

// Minimale Implementierung fÃ¼r logging-service/formatters

class Formatters {
    constructor() {
        this.name = 'Formatters';
        this.module = 'logging-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Formatters();

module.exports = {
    Formatters,
    default: instance
};
