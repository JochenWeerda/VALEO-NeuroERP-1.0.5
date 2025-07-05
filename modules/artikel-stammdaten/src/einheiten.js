/**
 * Einheiten-Modul fÃ¼r artikel-stammdaten
 * @module artikel-stammdaten/einheiten
 */

// Minimale Implementierung fÃ¼r artikel-stammdaten/einheiten

class Einheiten {
    constructor() {
        this.name = 'Einheiten';
        this.module = 'artikel-stammdaten';
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
