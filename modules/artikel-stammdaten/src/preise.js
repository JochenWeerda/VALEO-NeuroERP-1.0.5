/**
 * Preise-Modul fÃ¼r artikel-stammdaten
 * @module artikel-stammdaten/preise
 */

// Minimale Implementierung fÃ¼r artikel-stammdaten/preise

class Preise {
    constructor() {
        this.name = 'Preise';
        this.module = 'artikel-stammdaten';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Preise();

module.exports = {
    Preise,
    default: instance
};
