/**
 * Modul für die Verwaltung von Artikelgruppen
 * @module artikel-stammdaten/artikelgruppen
 */

// Abhängigkeiten importieren
const { logInfo, logError } = require('../../logging-service/src/index');
const { getConnection } = require('../../core-database/src/index');

/**
 * Artikelgruppe-Klasse zur Repräsentation einer Artikelgruppe im System
 */
class Artikelgruppe {
  /**
   * Erstellt eine neue Artikelgruppe-Instanz
   * @param {Object} data - Artikelgruppendaten
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.beschreibung = data.beschreibung || '';
    this.elternId = data.elternId || null;
    this.sortierung = data.sortierung || 0;
    this.aktiv = data.aktiv !== undefined ? data.aktiv : true;
    this.erstelltAm = data.erstelltAm || new Date();
    this.geaendertAm = data.geaendertAm || new Date();
  }

  /**
   * Validiert die Artikelgruppendaten
   * @returns {boolean} Validierungsergebnis
   */
  validate() {
    if (!this.name || this.name.trim() === '') {
      return false;
    }
    return true;
  }
}

/**
 * ArtikelgruppenManager-Klasse zur Verwaltung von Artikelgruppen
 */
class ArtikelgruppenManager {
  /**
   * Lädt eine Artikelgruppe anhand ihrer ID
   * @param {string} id - Artikelgruppen-ID
   * @returns {Promise<Artikelgruppe>} Geladene Artikelgruppe
   */
  async getById(id) {
    try {
      logInfo('Lade Artikelgruppe mit ID: ' + id);
      const db = getConnection();
      const result = await db.execute('SELECT * FROM artikelgruppen WHERE id = ?', [id]);
      if (result.length === 0) {
        return null;
      }
      return new Artikelgruppe(result[0]);
    } catch (error) {
      logError('Fehler beim Laden der Artikelgruppe: ' + error.message);
      throw error;
    }
  }

  /**
   * Lädt alle Artikelgruppen
   * @param {boolean} nurAktive - Nur aktive Artikelgruppen laden
   * @returns {Promise<Artikelgruppe[]>} Liste von Artikelgruppen
   */
  async getAll(nurAktive = true) {
    try {
      logInfo('Lade alle Artikelgruppen');
      const db = getConnection();
      
      let query = 'SELECT * FROM artikelgruppen';
      if (nurAktive) {
        query += ' WHERE aktiv = 1';
      }
      query += ' ORDER BY sortierung ASC';
      
      const result = await db.execute(query);
      return result.map(data => new Artikelgruppe(data));
    } catch (error) {
      logError('Fehler beim Laden der Artikelgruppen: ' + error.message);
      throw error;
    }
  }

  /**
   * Speichert eine Artikelgruppe
   * @param {Artikelgruppe} artikelgruppe - Zu speichernde Artikelgruppe
   * @returns {Promise<Artikelgruppe>} Gespeicherte Artikelgruppe
   */
  async save(artikelgruppe) {
    try {
      if (!artikelgruppe.validate()) {
        throw new Error('Artikelgruppe ist ungültig');
      }

      const db = getConnection();
      artikelgruppe.geaendertAm = new Date();

      if (!artikelgruppe.id) {
        artikelgruppe.erstelltAm = new Date();
        const result = await db.execute(
          'INSERT INTO artikelgruppen (name, beschreibung, eltern_id, sortierung, aktiv, erstellt_am, geaendert_am) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            artikelgruppe.name,
            artikelgruppe.beschreibung,
            artikelgruppe.elternId,
            artikelgruppe.sortierung,
            artikelgruppe.aktiv,
            artikelgruppe.erstelltAm,
            artikelgruppe.geaendertAm
          ]
        );
        artikelgruppe.id = result.insertId;
      } else {
        await db.execute(
          'UPDATE artikelgruppen SET name = ?, beschreibung = ?, eltern_id = ?, sortierung = ?, aktiv = ?, geaendert_am = ? WHERE id = ?',
          [
            artikelgruppe.name,
            artikelgruppe.beschreibung,
            artikelgruppe.elternId,
            artikelgruppe.sortierung,
            artikelgruppe.aktiv,
            artikelgruppe.geaendertAm,
            artikelgruppe.id
          ]
        );
      }

      logInfo('Artikelgruppe gespeichert: ' + artikelgruppe.id);
      return artikelgruppe;
    } catch (error) {
      logError('Fehler beim Speichern der Artikelgruppe: ' + error.message);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
const artikelgruppenManager = new ArtikelgruppenManager();

module.exports = {
  Artikelgruppe,
  artikelgruppenManager
}; 