/**
 * Authorization-Modul fÃ¼r auth-service
 * @module auth-service/authorization
 */

// Minimale Implementierung fÃ¼r auth-service/authorization

class Authorization {
    constructor() {
        this.name = 'Authorization';
        this.module = 'auth-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Authorization();

module.exports = {
    Authorization,
    default: instance
};
