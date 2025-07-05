/**
 * Einheiten-Modul fÃ¼r einheiten-service
 * @module einheiten-service/einheiten
 */

// Minimale Implementierung fÃ¼r einheiten-service/einheiten

class Einheiten {
    constructor() {
        this.name = 'Einheiten';
        this.module = 'einheiten-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Einheiten();

module.exports = {
    Einheiten,
    default: instance
};
