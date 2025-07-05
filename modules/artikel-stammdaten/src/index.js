/**
 * Artikelstammdaten-Modul
 * Version: 1.0.0
 * 
 * Kernmodul für die Verwaltung von Artikelstammdaten im AI-ERP-System
 */

const artikel = require('./artikel');
const artikelgruppen = require('./artikelgruppen');
const preise = require('./preise');
const einheiten = require('./einheiten');
const validators = require('./validators');

/**
 * Initialisiert das Artikelstammdaten-Modul
 * @param {Object} config - Konfigurationsobjekt
 * @param {Object} dependencies - Abhängigkeiten (Datenbank, Authentifizierung, Logging, Finance-Core)
 * @returns {Object} Das initialisierte Modul
 */
function initialize(config, dependencies) {
  // Abhängigkeiten validieren
  validators.validateDependencies(dependencies);

  // Abhängigkeiten extrahieren
  const { database, auth, logging, financeCore, einheitenService } = dependencies;

  // Einheiten-Service überprüfen
  if (!einheitenService) {
    throw new Error('Einheiten-Service wird benötigt, fehlt aber in den Dependencies');
  }

  // Finance-Core überprüfen
  if (!financeCore) {
    throw new Error('Finance-Core wird benötigt, fehlt aber in den Dependencies');
  }

  // Module initialisieren
  const artikelModule = artikel.initialize(config, { 
    database, 
    auth, 
    logging,
    preisService: financeCore.accounting
  });
  
  const artikelgruppenModule = artikelgruppen.initialize(config, { database, auth, logging });
  
  const preiseModule = preise.initialize(config, { 
    database, 
    auth, 
    logging,
    financeCore
  });
  
  const einheitenModule = einheiten.initialize(config, { 
    database, 
    auth, 
    logging,
    einheitenService
  });

  logging.info('Artikelstammdaten-Modul initialisiert', { version: '1.0.0' });

  // Öffentliche API
  return {
    // Artikel-API
    artikel: {
      /**
       * Listet alle Artikel auf
       * @param {Object} filter - Filterkriterien
       * @param {Object} pagination - Paginierungsoptionen
       * @returns {Promise<Array>} Liste von Artikeln
       */
      list: artikelModule.listArtikel,

      /**
       * Ruft einen Artikel anhand seiner Artikelnummer ab
       * @param {string} artikelNr - Artikelnummer
       * @returns {Promise<Object>} Artikelobjekt
       */
      get: artikelModule.getArtikel,

      /**
       * Erstellt einen neuen Artikel
       * @param {Object} artikelData - Artikeldaten
       * @returns {Promise<Object>} Erstellter Artikel
       */
      create: artikelModule.createArtikel,

      /**
       * Aktualisiert einen Artikel
       * @param {string} artikelNr - Artikelnummer
       * @param {Object} updates - Zu aktualisierende Felder
       * @returns {Promise<Object>} Aktualisierter Artikel
       */
      update: artikelModule.updateArtikel,

      /**
       * Löscht einen Artikel (setzt Status auf 'gelöscht')
       * @param {string} artikelNr - Artikelnummer
       * @returns {Promise<Object>} Ergebnis der Operation
       */
      delete: artikelModule.deleteArtikel
    },

    // Artikelgruppen-API
    artikelgruppen: {
      /**
       * Listet alle Artikelgruppen auf
       * @returns {Promise<Array>} Liste von Artikelgruppen
       */
      list: artikelgruppenModule.listArtikelGruppen,

      /**
       * Ruft eine Artikelgruppe anhand ihrer ID ab
       * @param {string} id - ID der Artikelgruppe
       * @returns {Promise<Object>} Artikelgruppenobjekt
       */
      get: artikelgruppenModule.getArtikelGruppe,

      /**
       * Erstellt eine neue Artikelgruppe
       * @param {Object} gruppenData - Artikelgruppendaten
       * @returns {Promise<Object>} Erstellte Artikelgruppe
       */
      create: artikelgruppenModule.createArtikelGruppe,

      /**
       * Aktualisiert eine Artikelgruppe
       * @param {string} id - ID der Artikelgruppe
       * @param {Object} updates - Zu aktualisierende Felder
       * @returns {Promise<Object>} Aktualisierte Artikelgruppe
       */
      update: artikelgruppenModule.updateArtikelGruppe,

      /**
       * Löscht eine Artikelgruppe
       * @param {string} id - ID der Artikelgruppe
       * @returns {Promise<Object>} Ergebnis der Operation
       */
      delete: artikelgruppenModule.deleteArtikelGruppe
    },

    // Preise-API
    preise: {
      /**
       * Berechnet Preise für einen Artikel
       * @param {string} artikelNr - Artikelnummer
       * @param {Object} options - Optionen für die Preisberechnung
       * @returns {Promise<Object>} Berechnete Preise
       */
      calculatePreise: preiseModule.calculatePreise,

      /**
       * Aktualisiert den Verkaufspreis eines Artikels
       * @param {string} artikelNr - Artikelnummer
       * @param {number} preis - Neuer Verkaufspreis
       * @returns {Promise<Object>} Aktualisierter Artikel
       */
      updateVerkaufspreis: preiseModule.updateVerkaufspreis,

      /**
       * Fügt den Artikel zu einer Preisliste hinzu
       * @param {string} artikelNr - Artikelnummer
       * @param {string} preisListenId - ID der Preisliste
       * @param {number} preis - Preis in der Preisliste
       * @returns {Promise<Object>} Aktualisierter Artikel
       */
      addToPreisliste: preiseModule.addToPreisliste
    },

    // Einheiten-API
    einheiten: {
      /**
       * Konvertiert einen Wert zwischen Einheiten
       * @param {number} wert - Zu konvertierender Wert
       * @param {string} vonEinheit - Ausgangseinheit
       * @param {string} zuEinheit - Zieleinheit
       * @returns {number} Konvertierter Wert
       */
      konvertiereEinheit: einheitenModule.konvertiereEinheit,

      /**
       * Fügt eine zusätzliche Einheit zu einem Artikel hinzu
       * @param {string} artikelNr - Artikelnummer
       * @param {string} einheit - Zusätzliche Einheit
       * @param {number} umrechnungsFaktor - Umrechnungsfaktor zur Basiseinheit
       * @returns {Promise<Object>} Aktualisierter Artikel
       */
      addZusatzEinheit: einheitenModule.addZusatzEinheit
    },

    // Such-API
    suche: {
      /**
       * Durchsucht die Artikelstammdaten nach bestimmten Kriterien
       * @param {Object} filter - Filterkriterien
       * @param {Object} options - Suchoptionen (Paginierung, Sortierung)
       * @returns {Promise<Object>} Suchergebnisse
       */
      suche: artikelModule.suche,

      /**
       * Liefert Suchvorschläge basierend auf einem Teilbegriff
       * @param {string} suchbegriff - Teilbegriff für die Suchvorschläge
       * @param {Object} options - Optionen für die Vorschläge
       * @returns {Promise<Object>} Suchvorschläge
       */
      vorschlaege: artikelModule.suchVorschlaege,

      /**
       * Erweiterte Suche mit komplexen Filterkriterien und Aggregationen
       * @param {Object} filter - Filterkriterien
       * @param {Object} options - Erweiterte Suchoptionen
       * @returns {Promise<Object>} Erweiterte Suchergebnisse mit Aggregationen
       */
      erweiterteSuche: artikelModule.erweiterteSuche
    },

    // Validierungsfunktionen
    validators: {
      validateArtikel: validators.validateArtikel,
      validateArtikelGruppe: validators.validateArtikelGruppe,
      validatePreise: validators.validatePreise
    },

    // Versionsinformationen
    version: '1.0.0',

    // Metadaten zur API-Dokumentation
    apiInfo: {
      artikelStammdatenApiVersion: '1.0.0',
      artikelSucheApiVersion: '1.0.0',
      schemas: {
        artikelStammdaten: require('../schemas/artikel-stammdaten-api.json'),
        artikelSuche: require('../schemas/artikel-suche-api.json')
      }
    }
  };
}

module.exports = {
  initialize
}; 