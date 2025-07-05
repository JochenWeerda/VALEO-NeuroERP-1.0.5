/**
 * Umrechnung-Modul fÃ¼r einheiten-service
 * @module einheiten-service/umrechnung
 */

// Minimale Implementierung fÃ¼r einheiten-service/umrechnung

class Umrechnung {
    constructor() {
        this.name = 'Umrechnung';
        this.module = 'einheiten-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Umrechnung();

module.exports = {
    Umrechnung,
    default: instance
};
