/**
 * Modul für die Verwaltung von Artikeldaten
 * @module artikel-stammdaten/artikel
 */

// Abhängigkeiten importieren
const { logInfo, logError } = require('../../logging-service/src/index');
const { getConnection } = require('../../core-database/src/index');
const { convertUnit } = require('../../einheiten-service/src/index');
const Redis = require('redis');
const { promisify } = require('util');

// Redis Client initialisieren
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Redis Promisify
const redisGet = promisify(redisClient.get).bind(redisClient);
const redisSet = promisify(redisClient.set).bind(redisClient);
const redisDel = promisify(redisClient.del).bind(redisClient);

/**
 * Artikel-Klasse zur Repräsentation eines Artikels im System
 */
class Artikel {
  /**
   * Erstellt eine neue Artikel-Instanz
   * @param {Object} data - Artikeldaten
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.artikelnummer = data.artikelnummer || '';
    this.bezeichnung = data.bezeichnung || '';
    this.beschreibung = data.beschreibung || '';
    this.einheit = data.einheit || '';
    this.preis = data.preis || 0;
    this.waehrung = data.waehrung || 'EUR';
    this.kategorie = data.kategorie || '';
    this.lagerbestand = data.lagerbestand || 0;
    this.lieferant = data.lieferant || '';
    this.aktiv = data.aktiv !== undefined ? data.aktiv : true;
    this.erstelltAm = data.erstelltAm || new Date();
    this.geaendertAm = data.geaendertAm || new Date();
    this.minBestand = data.minBestand || 0;
    this.maxBestand = data.maxBestand || 0;
    this.gewicht = data.gewicht || 0;
    this.dimension = data.dimension || {};
    this.tags = data.tags || [];
  }

  /**
   * Validiert die Artikeldaten
   * @returns {boolean} Validierungsergebnis
   */
  validate() {
    if (!this.artikelnummer || this.artikelnummer.trim() === '') {
      throw new Error('Artikelnummer ist erforderlich');
    }
    if (!this.bezeichnung || this.bezeichnung.trim() === '') {
      throw new Error('Bezeichnung ist erforderlich');
    }
    if (this.preis < 0) {
      throw new Error('Preis darf nicht negativ sein');
    }
    if (this.lagerbestand < 0) {
      throw new Error('Lagerbestand darf nicht negativ sein');
    }
    if (this.minBestand > this.maxBestand) {
      throw new Error('Minimaler Bestand darf nicht größer als maximaler Bestand sein');
    }
    return true;
  }

  /**
   * Wandelt den Artikel in ein JSON-Objekt um
   * @returns {Object} JSON-Darstellung
   */
  toJSON() {
    return {
      id: this.id,
      artikelnummer: this.artikelnummer,
      bezeichnung: this.bezeichnung,
      beschreibung: this.beschreibung,
      einheit: this.einheit,
      preis: this.preis,
      waehrung: this.waehrung,
      kategorie: this.kategorie,
      lagerbestand: this.lagerbestand,
      lieferant: this.lieferant,
      aktiv: this.aktiv,
      erstelltAm: this.erstelltAm,
      geaendertAm: this.geaendertAm,
      minBestand: this.minBestand,
      maxBestand: this.maxBestand,
      gewicht: this.gewicht,
      dimension: this.dimension,
      tags: this.tags
    };
  }
}

/**
 * ArtikelManager-Klasse zur Verwaltung von Artikeln
 */
class ArtikelManager {
  constructor() {
    this.cacheTimeout = 3600; // 1 Stunde
    this.batchSize = 1000;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // ms
  }

  /**
   * Generiert einen Cache-Schlüssel
   * @param {string} prefix - Präfix für den Schlüssel
   * @param {string} id - Identifikator
   * @returns {string} Cache-Schlüssel
   */
  getCacheKey(prefix, id) {
    return `artikel:${prefix}:${id}`;
  }

  /**
   * Lädt einen Artikel aus dem Cache oder der Datenbank
   * @param {string} id - Artikel-ID
   * @returns {Promise<Artikel>} Geladener Artikel
   */
  async getById(id) {
    try {
      // Versuche zuerst aus dem Cache zu laden
      const cacheKey = this.getCacheKey('id', id);
      const cachedData = await redisGet(cacheKey);
      
      if (cachedData) {
        return new Artikel(JSON.parse(cachedData));
      }

      // Wenn nicht im Cache, lade aus der Datenbank
      logInfo('Lade Artikel mit ID: ' + id);
      const db = getConnection();
      const result = await db.execute(
        'SELECT * FROM artikel WHERE id = ?',
        [id]
      );

      if (result.length === 0) {
        return null;
      }

      const artikel = new Artikel(result[0]);
      
      // Speichere im Cache
      await redisSet(cacheKey, JSON.stringify(artikel.toJSON()), 'EX', this.cacheTimeout);
      
      return artikel;
    } catch (error) {
      logError('Fehler beim Laden des Artikels: ' + error.message);
      throw error;
    }
  }

  /**
   * Speichert einen Artikel
   * @param {Artikel} artikel - Zu speichernder Artikel
   * @returns {Promise<Artikel>} Gespeicherter Artikel
   */
  async save(artikel) {
    try {
      artikel.validate();
      const db = getConnection();
      artikel.geaendertAm = new Date();

      if (!artikel.id) {
        artikel.erstelltAm = new Date();
        const result = await db.execute(
          'INSERT INTO artikel (artikelnummer, bezeichnung, beschreibung, einheit, preis, waehrung, kategorie, lagerbestand, lieferant, aktiv, erstellt_am, geaendert_am, min_bestand, max_bestand, gewicht, dimension, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            artikel.artikelnummer,
            artikel.bezeichnung,
            artikel.beschreibung,
            artikel.einheit,
            artikel.preis,
            artikel.waehrung,
            artikel.kategorie,
            artikel.lagerbestand,
            artikel.lieferant,
            artikel.aktiv,
            artikel.erstelltAm,
            artikel.geaendertAm,
            artikel.minBestand,
            artikel.maxBestand,
            artikel.gewicht,
            JSON.stringify(artikel.dimension),
            JSON.stringify(artikel.tags)
          ]
        );
        artikel.id = result.insertId;
      } else {
        await db.execute(
          'UPDATE artikel SET artikelnummer = ?, bezeichnung = ?, beschreibung = ?, einheit = ?, preis = ?, waehrung = ?, kategorie = ?, lagerbestand = ?, lieferant = ?, aktiv = ?, geaendert_am = ?, min_bestand = ?, max_bestand = ?, gewicht = ?, dimension = ?, tags = ? WHERE id = ?',
          [
            artikel.artikelnummer,
            artikel.bezeichnung,
            artikel.beschreibung,
            artikel.einheit,
            artikel.preis,
            artikel.waehrung,
            artikel.kategorie,
            artikel.lagerbestand,
            artikel.lieferant,
            artikel.aktiv,
            artikel.geaendertAm,
            artikel.minBestand,
            artikel.maxBestand,
            artikel.gewicht,
            JSON.stringify(artikel.dimension),
            JSON.stringify(artikel.tags),
            artikel.id
          ]
        );
      }

      // Cache invalidieren
      await redisDel(this.getCacheKey('id', artikel.id));
      await redisDel(this.getCacheKey('nummer', artikel.artikelnummer));

      logInfo('Artikel gespeichert: ' + artikel.id);
      return artikel;
    } catch (error) {
      logError('Fehler beim Speichern des Artikels: ' + error.message);
      throw error;
    }
  }

  /**
   * Verarbeitet mehrere Artikel in einem Batch
   * @param {Artikel[]} artikel - Liste von Artikeln
   * @returns {Promise<Object>} Ergebnis der Batch-Verarbeitung
   */
  async processBatch(artikel) {
    const results = {
      successful: [],
      failed: []
    };

    // Gruppiere Artikel in Batches
    const batches = [];
    for (let i = 0; i < artikel.length; i += this.batchSize) {
      batches.push(artikel.slice(i, i + this.batchSize));
    }

    // Verarbeite jede Batch
    for (const batch of batches) {
      try {
        await this.processArticleBatch(batch, results);
      } catch (error) {
        logError(`Fehler bei Batch-Verarbeitung: ${error.message}`);
        batch.forEach(a => results.failed.push({
          artikel: a,
          error: error.message
        }));
      }
    }

    return results;
  }

  /**
   * Verarbeitet einen einzelnen Artikel-Batch
   * @param {Artikel[]} batch - Artikel-Batch
   * @param {Object} results - Ergebnis-Objekt
   */
  async processArticleBatch(batch, results) {
    const db = getConnection();
    
    try {
      await db.beginTransaction();

      for (const artikel of batch) {
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
          try {
            const savedArtikel = await this.save(artikel);
            results.successful.push(savedArtikel);
            break;
          } catch (error) {
            if (attempt === this.retryAttempts - 1) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          }
        }
      }

      await db.commit();
    } catch (error) {
      await db.rollback();
      throw error;
    }
  }

  /**
   * Sucht Artikel anhand verschiedener Kriterien
   * @param {Object} criteria - Suchkriterien
   * @returns {Promise<Artikel[]>} Gefundene Artikel
   */
  async search(criteria = {}) {
    try {
      const {
        bezeichnung,
        kategorie,
        lieferant,
        preisMin,
        preisMax,
        nurAktive = true,
        limit = 100,
        offset = 0
      } = criteria;

      let query = 'SELECT * FROM artikel WHERE 1=1';
      const params = [];

      if (bezeichnung) {
        query += ' AND bezeichnung LIKE ?';
        params.push(`%${bezeichnung}%`);
      }

      if (kategorie) {
        query += ' AND kategorie = ?';
        params.push(kategorie);
      }

      if (lieferant) {
        query += ' AND lieferant = ?';
        params.push(lieferant);
      }

      if (preisMin !== undefined) {
        query += ' AND preis >= ?';
        params.push(preisMin);
      }

      if (preisMax !== undefined) {
        query += ' AND preis <= ?';
        params.push(preisMax);
      }

      if (nurAktive) {
        query += ' AND aktiv = 1';
      }

      // Optimiere die Sortierung
      query += ' ORDER BY bezeichnung ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const db = getConnection();
      const results = await db.execute(query, params);
      
      return results.map(row => new Artikel(row));
    } catch (error) {
      logError(`Fehler bei der Artikelsuche: ${error.message}`);
      throw error;
    }
  }

  /**
   * Aktualisiert den Lagerbestand eines Artikels
   * @param {string} id - Artikel-ID
   * @param {number} menge - Änderung der Menge
   * @returns {Promise<Artikel>} Aktualisierter Artikel
   */
  async updateLagerbestand(id, menge) {
    const db = getConnection();
    
    try {
      await db.beginTransaction();

      // Lade aktuellen Artikel mit Sperre
      const [artikel] = await db.execute(
        'SELECT * FROM artikel WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!artikel) {
        throw new Error('Artikel nicht gefunden');
      }

      const neuerBestand = artikel.lagerbestand + menge;
      if (neuerBestand < 0) {
        throw new Error('Lagerbestand kann nicht negativ werden');
      }

      // Aktualisiere Bestand
      await db.execute(
        'UPDATE artikel SET lagerbestand = ?, geaendert_am = ? WHERE id = ?',
        [neuerBestand, new Date(), id]
      );

      await db.commit();

      // Cache invalidieren
      await redisDel(this.getCacheKey('id', id));

      // Lade aktualisierten Artikel
      return await this.getById(id);
    } catch (error) {
      await db.rollback();
      logError(`Fehler bei Lagerbestandsaktualisierung: ${error.message}`);
      throw error;
    }
  }
}

// Singleton-Instanz
const artikelManager = new ArtikelManager();

module.exports = {
  Artikel,
  artikelManager
}; 