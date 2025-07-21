import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { requirePermission } from '../../middleware/auth';
import config from '../../config/database';
import axios from 'axios';

const router = express.Router();

// =====================================================
// DATEV INTEGRATION
// =====================================================

// DATEV API Konfiguration
const DATEV_CONFIG = {
  baseURL: process.env.DATEV_API_URL || 'https://api.datev.de',
  clientId: process.env.DATEV_CLIENT_ID,
  clientSecret: process.env.DATEV_CLIENT_SECRET,
  mandantId: process.env.DATEV_MANDANT_ID,
  accessToken: null as string | null,
  tokenExpiry: null as Date | null
};

// DATEV Token Management
const getDatevToken = async () => {
  if (DATEV_CONFIG.accessToken && DATEV_CONFIG.tokenExpiry && new Date() < DATEV_CONFIG.tokenExpiry) {
    return DATEV_CONFIG.accessToken;
  }

  try {
    const response = await axios.post(`${DATEV_CONFIG.baseURL}/oauth/token`, {
      grant_type: 'client_credentials',
      client_id: DATEV_CONFIG.clientId,
      client_secret: DATEV_CONFIG.clientSecret
    });

    DATEV_CONFIG.accessToken = response.data.access_token;
    DATEV_CONFIG.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

    return DATEV_CONFIG.accessToken;
  } catch (error) {
    console.error('DATEV Token Error:', error);
    throw new Error('DATEV Authentifizierung fehlgeschlagen');
  }
};

// DATEV Buchungen exportieren
router.post('/datev/export-buchungen', requirePermission(['DATEV_EXPORT']), asyncHandler(async (req, res) => {
  const { startDate, endDate, buchungstyp } = req.body;

  try {
    const token = await getDatevToken();
    
    // Hole Buchungen aus der lokalen Datenbank
    const client = await config.connect();
    const buchungen = await client.query(`
      SELECT 
        b.id,
        b.buchungsdatum,
        b.betrag,
        b.buchungstext,
        b.soll_konto,
        b.haben_konto,
        k.kontonummer,
        k.kontenbezeichnung
      FROM finance.buchungen b
      JOIN finance.konten k ON b.soll_konto = k.id
      WHERE b.buchungsdatum BETWEEN $1 AND $2
      AND b.buchungstyp = $3
      ORDER BY b.buchungsdatum
    `, [startDate, endDate, buchungstyp]);

    // Konvertiere zu DATEV-Format
    const datevBuchungen = buchungen.rows.map(buchung => ({
      datum: buchung.buchungsdatum,
      betrag: buchung.betrag,
      text: buchung.buchungstext,
      sollKonto: buchung.kontonummer,
      habenKonto: buchung.haben_konto,
      belegNr: buchung.id
    }));

    // Sende an DATEV API
    const datevResponse = await axios.post(
      `${DATEV_CONFIG.baseURL}/api/v1/mandanten/${DATEV_CONFIG.mandantId}/buchungen`,
      { buchungen: datevBuchungen },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    client.release();

    res.json({
      success: true,
      data: {
        exportedCount: datevBuchungen.length,
        datevResponse: datevResponse.data
      }
    });
  } catch (error) {
    console.error('DATEV Export Error:', error);
    res.status(500).json({
      success: false,
      error: 'DATEV Export fehlgeschlagen'
    });
  }
}));

// DATEV Konten synchronisieren
router.get('/datev/sync-konten', requirePermission(['DATEV_SYNC']), asyncHandler(async (req, res) => {
  try {
    const token = await getDatevToken();
    
    // Hole Konten von DATEV
    const datevResponse = await axios.get(
      `${DATEV_CONFIG.baseURL}/api/v1/mandanten/${DATEV_CONFIG.mandantId}/konten`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const client = await config.connect();
    
    // Synchronisiere mit lokaler Datenbank
    for (const datevKonto of datevResponse.data.konten) {
      await client.query(`
        INSERT INTO finance.konten (kontonummer, kontenbezeichnung, kontotyp, datev_sync)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (kontonummer) 
        DO UPDATE SET 
          kontenbezeichnung = EXCLUDED.kontenbezeichnung,
          datev_sync = true,
          geaendert_am = CURRENT_TIMESTAMP
      `, [datevKonto.kontonummer, datevKonto.bezeichnung, datevKonto.typ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        syncedCount: datevResponse.data.konten.length,
        message: 'Konten erfolgreich synchronisiert'
      }
    });
  } catch (error) {
    console.error('DATEV Sync Error:', error);
    res.status(500).json({
      success: false,
      error: 'DATEV Synchronisation fehlgeschlagen'
    });
  }
}));

// =====================================================
// BANK API INTEGRATION
// =====================================================

// Deutsche Bank API Integration
router.get('/bank/deutsche-bank/transactions', requirePermission(['BANK_READ']), asyncHandler(async (req, res) => {
  const { accountId, startDate, endDate } = req.query;

  try {
    const dbResponse = await axios.get(
      `https://api.deutsche-bank.de/v1/accounts/${accountId}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEUTSCHE_BANK_TOKEN}`,
          'X-Request-ID': req.headers['x-request-id'] || 'valeo-neuroerp'
        },
        params: {
          fromDate: startDate,
          toDate: endDate
        }
      }
    );

    // Speichere Transaktionen in lokaler Datenbank
    const client = await config.connect();
    
    for (const transaction of dbResponse.data.transactions) {
      await client.query(`
        INSERT INTO finance.bank_transaktionen (
          bank_name, konto_id, transaktions_id, buchungsdatum, 
          valuta_datum, betrag, waehrung, buchungstext, 
          verwendungszweck, empfaenger_name, empfaenger_iban
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (bank_name, transaktions_id) DO NOTHING
      `, [
        'DEUTSCHE_BANK', accountId, transaction.id, transaction.bookingDate,
        transaction.valueDate, transaction.amount, transaction.currency,
        transaction.bookingText, transaction.purpose, transaction.counterpartyName,
        transaction.counterpartyIBAN
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        transactions: dbResponse.data.transactions,
        importedCount: dbResponse.data.transactions.length
      }
    });
  } catch (error) {
    console.error('Deutsche Bank API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Bank-API-Abfrage fehlgeschlagen'
    });
  }
}));

// Commerzbank API Integration
router.get('/bank/commerzbank/transactions', requirePermission(['BANK_READ']), asyncHandler(async (req, res) => {
  const { accountId, startDate, endDate } = req.query;

  try {
    const cbResponse = await axios.get(
      `https://api.commerzbank.de/v1/accounts/${accountId}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.COMMERZBANK_TOKEN}`,
          'X-Request-ID': req.headers['x-request-id'] || 'valeo-neuroerp'
        },
        params: {
          fromDate: startDate,
          toDate: endDate
        }
      }
    );

    // Speichere Transaktionen in lokaler Datenbank
    const client = await config.connect();
    
    for (const transaction of cbResponse.data.transactions) {
      await client.query(`
        INSERT INTO finance.bank_transaktionen (
          bank_name, konto_id, transaktions_id, buchungsdatum, 
          valuta_datum, betrag, waehrung, buchungstext, 
          verwendungszweck, empfaenger_name, empfaenger_iban
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (bank_name, transaktions_id) DO NOTHING
      `, [
        'COMMERZBANK', accountId, transaction.id, transaction.bookingDate,
        transaction.valueDate, transaction.amount, transaction.currency,
        transaction.bookingText, transaction.purpose, transaction.counterpartyName,
        transaction.counterpartyIBAN
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        transactions: cbResponse.data.transactions,
        importedCount: cbResponse.data.transactions.length
      }
    });
  } catch (error) {
    console.error('Commerzbank API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Bank-API-Abfrage fehlgeschlagen'
    });
  }
}));

// =====================================================
// LANDHANDEL-SPEZIFISCHE INTEGRATIONEN
// =====================================================

// John Deere API Integration (Maschinendaten)
router.get('/john-deere/machines', requirePermission(['MACHINE_READ']), asyncHandler(async (req, res) => {
  try {
    const jdResponse = await axios.get(
      'https://api.deere.com/platform/machines',
      {
        headers: {
          'Authorization': `Bearer ${process.env.JOHN_DEERE_TOKEN}`,
          'Accept': 'application/vnd.deere.axiom.v3+json'
        }
      }
    );

    // Speichere Maschinendaten
    const client = await config.connect();
    
    for (const machine of jdResponse.data.machines) {
      await client.query(`
        INSERT INTO assets.maschinen (
          hersteller, modell, seriennummer, baujahr, 
          leistung_kw, betriebsstunden, standort, 
          externe_id, externe_quelle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (externe_id, externe_quelle) 
        DO UPDATE SET 
          betriebsstunden = EXCLUDED.betriebsstunden,
          standort = EXCLUDED.standort,
          geaendert_am = CURRENT_TIMESTAMP
      `, [
        'John Deere', machine.model, machine.serialNumber, machine.year,
        machine.enginePower, machine.totalHours, machine.location,
        machine.id, 'JOHN_DEERE'
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        machines: jdResponse.data.machines,
        syncedCount: jdResponse.data.machines.length
      }
    });
  } catch (error) {
    console.error('John Deere API Error:', error);
    res.status(500).json({
      success: false,
      error: 'John Deere API-Abfrage fehlgeschlagen'
    });
  }
}));

// Claas API Integration (Erntedaten)
router.get('/claas/harvest-data', requirePermission(['HARVEST_READ']), asyncHandler(async (req, res) => {
  const { machineId, startDate, endDate } = req.query;

  try {
    const claasResponse = await axios.get(
      `https://api.claas.com/v1/machines/${machineId}/harvest-data`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLAAS_TOKEN}`,
          'Accept': 'application/json'
        },
        params: {
          fromDate: startDate,
          toDate: endDate
        }
      }
    );

    // Speichere Erntedaten
    const client = await config.connect();
    
    for (const harvest of claasResponse.data.harvestData) {
      await client.query(`
        INSERT INTO produktion.erntedaten (
          maschinen_id, erntedatum, flaeche_ha, ertrag_t_ha,
          feuchtigkeit_prozent, schlag_id, externe_id, externe_quelle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (externe_id, externe_quelle) DO NOTHING
      `, [
        machineId, harvest.date, harvest.area, harvest.yield,
        harvest.moisture, harvest.fieldId, harvest.id, 'CLAAS'
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        harvestData: claasResponse.data.harvestData,
        importedCount: claasResponse.data.harvestData.length
      }
    });
  } catch (error) {
    console.error('Claas API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Claas API-Abfrage fehlgeschlagen'
    });
  }
}));

// =====================================================
// WETTER-API INTEGRATION
// =====================================================

// DWD (Deutscher Wetterdienst) API
router.get('/weather/dwd/forecast', requirePermission(['WEATHER_READ']), asyncHandler(async (req, res) => {
  const { lat, lon, days = 7 } = req.query;

  try {
    const dwdResponse = await axios.get(
      `https://opendata.dwd.de/weather/local_forecasts/mos/MOSMIX_L/single_stations/${lat},${lon}/forecasts/latest.xml`
    );

    // Parse XML und konvertiere zu JSON
    const weatherData = parseDwdXml(dwdResponse.data);

    // Speichere Wetterdaten
    const client = await config.connect();
    
    for (const forecast of weatherData.forecasts) {
      await client.query(`
        INSERT INTO produktion.wetterdaten (
          datum, temperatur_min, temperatur_max, niederschlag_mm,
          luftfeuchtigkeit_prozent, windgeschwindigkeit_kmh,
          latitude, longitude, quelle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (datum, latitude, longitude) 
        DO UPDATE SET 
          temperatur_min = EXCLUDED.temperatur_min,
          temperatur_max = EXCLUDED.temperatur_max,
          niederschlag_mm = EXCLUDED.niederschlag_mm,
          luftfeuchtigkeit_prozent = EXCLUDED.luftfeuchtigkeit_prozent,
          windgeschwindigkeit_kmh = EXCLUDED.windgeschwindigkeit_kmh,
          geaendert_am = CURRENT_TIMESTAMP
      `, [
        forecast.date, forecast.tempMin, forecast.tempMax, forecast.precipitation,
        forecast.humidity, forecast.windSpeed, lat, lon, 'DWD'
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        forecasts: weatherData.forecasts,
        location: { lat, lon },
        source: 'DWD'
      }
    });
  } catch (error) {
    console.error('DWD API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Wetter-API-Abfrage fehlgeschlagen'
    });
  }
}));

// =====================================================
// LIEFERANTEN-API INTEGRATION
// =====================================================

// BayWa API Integration
router.get('/suppliers/baywa/products', requirePermission(['SUPPLIER_READ']), asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  try {
    const baywaResponse = await axios.get(
      'https://api.baywa.com/v1/products',
      {
        headers: {
          'Authorization': `Bearer ${process.env.BAYWA_TOKEN}`,
          'Accept': 'application/json'
        },
        params: {
          category,
          search,
          limit: 100
        }
      }
    );

    // Speichere Produktdaten
    const client = await config.connect();
    
    for (const product of baywaResponse.data.products) {
      await client.query(`
        INSERT INTO einkauf.lieferantenartikel (
          lieferanten_id, artikelnummer, artikelname, beschreibung,
          einheit, preis, waehrung, verfuegbar, externe_id, externe_quelle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (lieferanten_id, externe_id, externe_quelle) 
        DO UPDATE SET 
          artikelname = EXCLUDED.artikelname,
          beschreibung = EXCLUDED.beschreibung,
          preis = EXCLUDED.preis,
          verfuegbar = EXCLUDED.verfuegbar,
          geaendert_am = CURRENT_TIMESTAMP
      `, [
        'BAYWA_LIEFERANT_ID', product.sku, product.name, product.description,
        product.unit, product.price, product.currency, product.available,
        product.id, 'BAYWA'
      ]);
    }

    client.release();

    res.json({
      success: true,
      data: {
        products: baywaResponse.data.products,
        totalCount: baywaResponse.data.totalCount
      }
    });
  } catch (error) {
    console.error('BayWa API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Lieferanten-API-Abfrage fehlgeschlagen'
    });
  }
}));

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// DWD XML Parser (vereinfacht)
function parseDwdXml(xmlData: string) {
  // Vereinfachte XML-Parsing-Logik
  // In der Praxis würde hier ein XML-Parser verwendet
  return {
    forecasts: [
      {
        date: new Date().toISOString().split('T')[0],
        tempMin: 5,
        tempMax: 15,
        precipitation: 2.5,
        humidity: 75,
        windSpeed: 12
      }
    ]
  };
}

export default router; 