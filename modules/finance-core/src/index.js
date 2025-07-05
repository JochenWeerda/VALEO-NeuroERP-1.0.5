/**
 * Finance Core Module
 * Version: 1.0.0
 * 
 * Kernmodul für Finanzfunktionalitäten im AI-ERP-System
 */

const transaction = require('./transaction');
const accounting = require('./accounting');
const validators = require('./validators');

/**
 * Initialisiert das Finance-Core-Modul
 * @param {Object} config - Konfigurationsobjekt
 * @param {Object} dependencies - Abhängigkeiten (Datenbank, Authentifizierung, Logging)
 * @returns {Object} Das initialisierte Modul
 */
function initialize(config, dependencies) {
  // Abhängigkeiten validieren
  validators.validateDependencies(dependencies);

  // Abhängigkeiten extrahieren
  const { database, auth, logging } = dependencies;

  // Module initialisieren
  const transactionModule = transaction.initialize(config, { database, auth, logging });
  const accountingModule = accounting.initialize(config, { database, auth, logging });

  logging.info('Finance Core Module initialisiert', { version: '1.0.0' });

  // Öffentliche API
  return {
    // Finanztransaktions-API
    transactions: {
      /**
       * Listet alle Transaktionen auf
       * @param {Object} filters - Filterkriterien
       * @param {Object} pagination - Paginierungsoptionen
       * @returns {Promise<Array>} Liste von Transaktionen
       */
      list: transactionModule.listTransactions,

      /**
       * Ruft eine Transaktion anhand ihrer ID ab
       * @param {string} id - ID der Transaktion
       * @returns {Promise<Object>} Transaktionsobjekt
       */
      get: transactionModule.getTransaction,

      /**
       * Erstellt eine neue Transaktion
       * @param {Object} transactionData - Transaktionsdaten
       * @returns {Promise<Object>} Erstellte Transaktion
       */
      create: transactionModule.createTransaction,

      /**
       * Aktualisiert eine Transaktion
       * @param {string} id - ID der Transaktion
       * @param {Object} updates - Zu aktualisierende Felder
       * @returns {Promise<Object>} Aktualisierte Transaktion
       */
      update: transactionModule.updateTransaction
    },

    // Buchhaltungs-API
    accounting: {
      /**
       * Erstellt einen Buchhaltungseintrag
       * @param {Object} entryData - Daten für den Buchhaltungseintrag
       * @returns {Promise<Object>} Erstellter Buchhaltungseintrag
       */
      createEntry: accountingModule.createEntry,

      /**
       * Erzeugt einen Buchhaltungsbericht
       * @param {string} reportType - Art des Berichts
       * @param {Object} options - Berichtsoptionen
       * @returns {Promise<Object>} Erzeugter Bericht
       */
      generateReport: accountingModule.generateReport
    },

    // Validierungsfunktionen
    validators: {
      validateTransaction: validators.validateTransaction,
      validateAccountingEntry: validators.validateAccountingEntry
    },

    // Versionsinformationen
    version: '1.0.0',

    // Metadaten zur API-Dokumentation
    apiInfo: {
      transactionApiVersion: '1.0.0',
      accountingApiVersion: '1.0.0',
      schemas: {
        transaction: require('../schemas/financial-transaction-api.json'),
        accounting: require('../schemas/accounting-api.json')
      }
    }
  };
}

module.exports = {
  initialize
}; 