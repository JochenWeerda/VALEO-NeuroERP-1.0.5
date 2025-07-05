/**
 * Authentication-Modul fÃ¼r auth-service
 * @module auth-service/authentication
 */

// Minimale Implementierung fÃ¼r auth-service/authentication

class Authentication {
    constructor() {
        this.name = 'Authentication';
        this.module = 'auth-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Authentication();

module.exports = {
    Authentication,
    default: instance
};
