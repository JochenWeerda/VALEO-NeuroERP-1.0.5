/**
 * Logger-Modul fÃ¼r logging-service
 * @module logging-service/logger
 */

// Minimale Implementierung fÃ¼r logging-service/logger

class Logger {
    constructor() {
        this.name = 'Logger';
        this.module = 'logging-service';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Logger();

module.exports = {
    Logger,
    default: instance
};
