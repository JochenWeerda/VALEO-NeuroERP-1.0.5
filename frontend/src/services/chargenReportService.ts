import { ChargeDetails, ChargeVorwaerts, ChargeRueckwaerts } from './chargenService';
import { getChargeVorwaerts, getChargeRueckwaerts, getChargeById } from './inventoryApi';

export interface ChargenFilter {
  artikelId?: string;
  lieferantId?: string;
  status?: string;
  vonDatum?: string;
  bisDatum?: string;
  mindesthaltbarkeit?: string;
  batchGroesse?: 'alle' | 'klein' | 'mittel' | 'gross';
  qualitaetsstatus?: string;
}

export interface ChargenReportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeVorwaertsVerfolgung: boolean;
  includeRueckwaertsVerfolgung: boolean;
  includeQualitaetsdaten: boolean;
  includeDokumente: boolean;
  includeRueckrufInfo: boolean;
  includeGrafiken: boolean;
  titel?: string;
  unternehmen?: string;
  logo?: string;
}

export interface ChargenReport {
  id: string;
  titel: string;
  erstelltAm: string;
  filter: ChargenFilter;
  options: ChargenReportOptions;
  chargen: ChargeDetails[];
  vorwaertsVerfolgung?: Record<string, ChargeVorwaerts>;
  rueckwaertsVerfolgung?: Record<string, ChargeRueckwaerts>;
  qualitaetsdaten?: any[];
  dokumente?: any[];
  rueckrufInfo?: any;
}

// Funktion zum Generieren eines Chargenberichts
export const generateChargenReport = async (
  filter: ChargenFilter,
  options: ChargenReportOptions
): Promise<ChargenReport> => {
  try {
    // Lade die passenden Chargen basierend auf dem Filter
    // In einer echten Implementierung würde hier eine API-Anfrage stattfinden
    const chargen = await fetchFilteredChargen(filter);
    
    // Erstelle den Bericht
    const report: ChargenReport = {
      id: `report-${Date.now()}`,
      titel: options.titel || 'Chargenbericht',
      erstelltAm: new Date().toISOString(),
      filter,
      options,
      chargen
    };
    
    // Vorwärts-Verfolgung laden, wenn aktiviert
    if (options.includeVorwaertsVerfolgung) {
      report.vorwaertsVerfolgung = await fetchVorwaertsVerfolgung(chargen);
    }
    
    // Rückwärts-Verfolgung laden, wenn aktiviert
    if (options.includeRueckwaertsVerfolgung) {
      report.rueckwaertsVerfolgung = await fetchRueckwaertsVerfolgung(chargen);
    }
    
    // Qualitätsdaten laden, wenn aktiviert
    if (options.includeQualitaetsdaten) {
      report.qualitaetsdaten = await fetchQualitaetsdaten(chargen);
    }
    
    // Dokumente laden, wenn aktiviert
    if (options.includeDokumente) {
      report.dokumente = await fetchDokumente(chargen);
    }
    
    // Rückrufinfo laden, wenn aktiviert
    if (options.includeRueckrufInfo) {
      report.rueckrufInfo = generateRueckrufInfo(chargen);
    }
    
    return report;
  } catch (error) {
    console.error('Fehler beim Generieren des Chargenberichts:', error);
    throw error;
  }
};

// Funktion zum Exportieren eines Chargenberichts
export const exportChargenReport = async (
  report: ChargenReport,
  format: 'pdf' | 'csv' | 'excel'
): Promise<Blob> => {
  try {
    // In einer echten Implementierung würde hier eine API-Anfrage stattfinden,
    // die den Bericht in das gewünschte Format umwandelt
    
    // Simuliere einen API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Erstelle einen Dummy-Blob, der das gewünschte Format repräsentiert
    let content: string;
    let contentType: string;
    
    switch (format) {
      case 'pdf':
        content = `PDF-Report: ${report.titel}\n\nChargen: ${report.chargen.length}`;
        contentType = 'application/pdf';
        break;
      case 'csv':
        content = `"ID";"Chargennummer";"Artikel";"Menge";"MHD"\n`;
        report.chargen.forEach(charge => {
          content += `"${charge.id}";"${charge.chargennummer}";"${charge.artikel_name}";"${charge.menge}";"${charge.mindesthaltbarkeitsdatum}"\n`;
        });
        contentType = 'text/csv';
        break;
      case 'excel':
        // Excel ist eigentlich ein binäres Format, hier nur für Demo-Zwecke
        content = `Excel-Report: ${report.titel}\n\nChargen: ${report.chargen.length}`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        throw new Error(`Unbekanntes Format: ${format}`);
    }
    
    return new Blob([content], { type: contentType });
  } catch (error) {
    console.error('Fehler beim Exportieren des Chargenberichts:', error);
    throw error;
  }
};

// Hilfsfunktionen

// Lädt Chargen basierend auf dem Filter
const fetchFilteredChargen = async (filter: ChargenFilter): Promise<ChargeDetails[]> => {
  // In einer echten Implementierung würde hier eine API-Anfrage stattfinden
  // Für Demo-Zwecke geben wir Testdaten zurück
  
  // Simuliere einen API-Aufruf
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Testdaten
  const testChargen: ChargeDetails[] = [
    {
      id: '1',
      artikel_id: '101',
      artikel_name: 'Weizenschrot Premium',
      chargennummer: 'WS-2025-001',
      menge: 5000,
      einheit: 'kg',
      mindesthaltbarkeitsdatum: '2025-10-15',
      herstelldatum: '2025-04-15',
      lagerort_id: '1',
      lagerort_name: 'Hauptlager',
      qualitaetsstatus: 'freigegeben',
      lagerplatz: 'Halle 1 / Regal A / Fach 01',
      lieferant_name: 'Mühle Müller GmbH',
      eingang_datum: '2025-04-18'
    },
    {
      id: '2',
      artikel_id: '102',
      artikel_name: 'Maismehl',
      chargennummer: 'MM-2025-002',
      menge: 3000,
      einheit: 'kg',
      mindesthaltbarkeitsdatum: '2025-10-10',
      herstelldatum: '2025-04-10',
      lagerort_id: '1',
      lagerort_name: 'Hauptlager',
      qualitaetsstatus: 'freigegeben',
      lagerplatz: 'Halle 1 / Regal B / Fach 03',
      lieferant_name: 'Agrar Handel Schmidt',
      eingang_datum: '2025-04-12'
    },
    {
      id: '3',
      artikel_id: '103',
      artikel_name: 'Schweinefutter Premium',
      chargennummer: 'SF-2025-001',
      menge: 2500,
      einheit: 'kg',
      mindesthaltbarkeitsdatum: '2025-07-20',
      herstelldatum: '2025-04-20',
      lagerort_id: '2',
      lagerort_name: 'Fertigwarenlager',
      qualitaetsstatus: 'freigegeben',
      lagerplatz: 'Halle 2 / Regal C / Fach 05',
      lieferant_name: 'Eigenproduktion',
      eingang_datum: '2025-04-20'
    },
    {
      id: '4',
      artikel_id: '104',
      artikel_name: 'Mineralfutter Rind',
      chargennummer: 'MR-2025-001',
      menge: 1000,
      einheit: 'kg',
      mindesthaltbarkeitsdatum: '2026-04-05',
      herstelldatum: '2025-04-05',
      lagerort_id: '1',
      lagerort_name: 'Hauptlager',
      qualitaetsstatus: 'gesperrt',
      lagerplatz: 'Halle 1 / Regal D / Fach 02',
      lieferant_name: 'Mineral Plus GmbH',
      eingang_datum: '2025-04-08'
    }
  ];
  
  // Einfache Filterung für Demo-Zwecke
  return testChargen.filter(charge => {
    if (filter.artikelId && charge.artikel_id !== filter.artikelId) return false;
    if (filter.status && charge.qualitaetsstatus !== filter.status) return false;
    if (filter.vonDatum && charge.eingang_datum < filter.vonDatum) return false;
    if (filter.bisDatum && charge.eingang_datum > filter.bisDatum) return false;
    return true;
  });
};

// Lädt die Vorwärts-Verfolgung für alle übergebenen Chargen
const fetchVorwaertsVerfolgung = async (chargen: ChargeDetails[]): Promise<Record<string, ChargeVorwaerts>> => {
  const result: Record<string, ChargeVorwaerts> = {};
  
  // Sequentielle Anfragen, um die API nicht zu überlasten
  for (const charge of chargen) {
    try {
      const verfolgung = await getChargeVorwaerts(Number(charge.id));
      result[charge.id] = verfolgung;
      
      // Kleine Pause zwischen den Anfragen
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Fehler beim Laden der Vorwärts-Verfolgung für Charge ${charge.id}:`, error);
    }
  }
  
  return result;
};

// Lädt die Rückwärts-Verfolgung für alle übergebenen Chargen
const fetchRueckwaertsVerfolgung = async (chargen: ChargeDetails[]): Promise<Record<string, ChargeRueckwaerts>> => {
  const result: Record<string, ChargeRueckwaerts> = {};
  
  // Sequentielle Anfragen, um die API nicht zu überlasten
  for (const charge of chargen) {
    try {
      const verfolgung = await getChargeRueckwaerts(Number(charge.id));
      result[charge.id] = verfolgung;
      
      // Kleine Pause zwischen den Anfragen
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Fehler beim Laden der Rückwärts-Verfolgung für Charge ${charge.id}:`, error);
    }
  }
  
  return result;
};

// Lädt Qualitätsdaten für alle übergebenen Chargen
const fetchQualitaetsdaten = async (chargen: ChargeDetails[]): Promise<any[]> => {
  // In einer echten Implementierung würde hier eine API-Anfrage stattfinden
  // Für Demo-Zwecke geben wir Testdaten zurück
  
  // Simuliere einen API-Aufruf
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Testdaten
  return chargen.map(charge => ({
    charge_id: charge.id,
    chargennummer: charge.chargennummer,
    pruefungen: [
      {
        id: `test-${charge.id}-1`,
        datum: charge.eingang_datum,
        parameter: 'Feuchtigkeitsgehalt',
        wert: Math.round(Math.random() * 10) + 10,
        einheit: '%',
        grenzwert_min: 10,
        grenzwert_max: 18,
        ergebnis: 'bestanden'
      },
      {
        id: `test-${charge.id}-2`,
        datum: charge.eingang_datum,
        parameter: 'Proteingehalt',
        wert: Math.round(Math.random() * 10) + 20,
        einheit: '%',
        grenzwert_min: 18,
        grenzwert_max: 35,
        ergebnis: 'bestanden'
      }
    ]
  }));
};

// Lädt Dokumente für alle übergebenen Chargen
const fetchDokumente = async (chargen: ChargeDetails[]): Promise<any[]> => {
  // In einer echten Implementierung würde hier eine API-Anfrage stattfinden
  // Für Demo-Zwecke geben wir Testdaten zurück
  
  // Simuliere einen API-Aufruf
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Testdaten
  const alleDokumente: any[] = [];
  
  chargen.forEach(charge => {
    if (charge.lieferant_name) {
      alleDokumente.push({
        charge_id: charge.id,
        chargennummer: charge.chargennummer,
        typ: 'Lieferschein',
        dateiname: `Lieferschein_${charge.chargennummer}.pdf`,
        datum: charge.eingang_datum
      });
    }
    
    alleDokumente.push({
      charge_id: charge.id,
      chargennummer: charge.chargennummer,
      typ: 'Qualitätszertifikat',
      dateiname: `Zertifikat_${charge.chargennummer}.pdf`,
      datum: charge.eingang_datum
    });
    
    if (charge.qualitaetsstatus === 'freigegeben') {
      alleDokumente.push({
        charge_id: charge.id,
        chargennummer: charge.chargennummer,
        typ: 'Freigabeprotokoll',
        dateiname: `Freigabe_${charge.chargennummer}.pdf`,
        datum: charge.eingang_datum
      });
    }
  });
  
  return alleDokumente;
};

// Generiert Rückrufinformationen für alle übergebenen Chargen
const generateRueckrufInfo = (chargen: ChargeDetails[]): any => {
  // In einer echten Implementierung würden hier Informationen für einen potenziellen Rückruf generiert
  
  const kundenChargenZuordnung: Record<string, string[]> = {
    'Landwirt Meyer': ['1', '3'],
    'Landwirt Schulze': ['2'],
    'Agrar GmbH & Co. KG': ['3', '4'],
    'Milchviehbetrieb Müller': ['4']
  };
  
  const betroffeneChargen = chargen.filter(charge => 
    Object.values(kundenChargenZuordnung).some(chargenIds => 
      chargenIds.includes(charge.id)
    )
  );
  
  const betroffeneKunden = Object.entries(kundenChargenZuordnung)
    .filter(([kunde, chargenIds]) => 
      chargenIds.some(id => chargen.some(charge => charge.id === id))
    )
    .map(([kunde, chargenIds]) => ({
      name: kunde,
      chargen: chargenIds
        .filter(id => chargen.some(charge => charge.id === id))
        .map(id => {
          const charge = chargen.find(c => c.id === id);
          return {
            id,
            chargennummer: charge?.chargennummer,
            artikel_name: charge?.artikel_name
          };
        })
    }));
  
  return {
    anzahlBetroffeneChargen: betroffeneChargen.length,
    anzahlBetroffeneKunden: betroffeneKunden.length,
    betroffeneChargen,
    betroffeneKunden,
    kontaktdaten: {
      ansprechpartner: 'Max Mustermann',
      telefon: '+49 123 456789',
      email: 'rueckruf@beispiel.de'
    },
    standardtext: 'Sehr geehrte Damen und Herren,\n\nhiermit informieren wir Sie über einen Rückruf der folgenden Chargen...'
  };
};

export default {
  generateChargenReport,
  exportChargenReport
}; 