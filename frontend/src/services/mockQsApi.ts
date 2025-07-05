import {
  QSFuttermittelCharge,
  QSFuttermittelChargeFilter,
  QSStatus,
  PaginatedResponse,
  KontaminationsRisiko,
  QSRohstoffTyp,
  MonitoringStatus,
  EreignisTyp,
  EreignisPrioritaet
} from './qsApi';

// Aktuelle Datum und ein Tag in der Vergangenheit und Zukunft für zufällige Daten
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Helper-Funktion zur Erstellung eines ISO-Datums
const toISODate = (date: Date): string => date.toISOString().split('T')[0];

// Mock-Daten für Rohstoffe
const mockRohstoffe = [
  {
    id: 1,
    charge_id: 1001,
    rohstoff_charge_id: 5001,
    rohstoff_typ: QSRohstoffTyp.GETREIDE,
    menge: 1000,
    einheit_id: 1,
    anteil: 60,
    lieferant_id: 101,
    lieferant_chargen_nr: "L-5001-21",
    kontaminationsrisiko: KontaminationsRisiko.NIEDRIG,
    qs_zertifiziert: true,
    zertifikat_nr: "QS-101-2023",
    mischposition: 1,
    erstellt_am: toISODate(lastWeek)
  },
  {
    id: 2,
    charge_id: 1001,
    rohstoff_charge_id: 5002,
    rohstoff_typ: QSRohstoffTyp.MINERALSTOFF,
    menge: 200,
    einheit_id: 1,
    anteil: 12,
    lieferant_id: 102,
    lieferant_chargen_nr: "L-5002-21",
    kontaminationsrisiko: KontaminationsRisiko.NIEDRIG,
    qs_zertifiziert: true,
    zertifikat_nr: "QS-102-2023",
    mischposition: 2,
    erstellt_am: toISODate(lastWeek)
  },
  {
    id: 3,
    charge_id: 1001,
    rohstoff_charge_id: 5003,
    rohstoff_typ: QSRohstoffTyp.ZUSATZSTOFF,
    menge: 50,
    einheit_id: 1,
    anteil: 3,
    lieferant_id: 103,
    lieferant_chargen_nr: "L-5003-21",
    kontaminationsrisiko: KontaminationsRisiko.NIEDRIG,
    qs_zertifiziert: true,
    zertifikat_nr: "QS-103-2023",
    mischposition: 3,
    erstellt_am: toISODate(lastWeek)
  },
  {
    id: 4,
    charge_id: 1002,
    rohstoff_charge_id: 5004,
    rohstoff_typ: QSRohstoffTyp.GETREIDE,
    menge: 800,
    einheit_id: 1,
    anteil: 50,
    lieferant_id: 101,
    lieferant_chargen_nr: "L-5004-21",
    kontaminationsrisiko: KontaminationsRisiko.MITTEL,
    qs_zertifiziert: true,
    zertifikat_nr: "QS-101-2023",
    mischposition: 1,
    erstellt_am: toISODate(yesterday)
  },
  {
    id: 5,
    charge_id: 1002,
    rohstoff_charge_id: 5005,
    rohstoff_typ: QSRohstoffTyp.PROTEIN,
    menge: 400,
    einheit_id: 1,
    anteil: 25,
    lieferant_id: 104,
    lieferant_chargen_nr: "L-5005-21",
    kontaminationsrisiko: KontaminationsRisiko.MITTEL,
    qs_zertifiziert: false,
    mischposition: 2,
    erstellt_am: toISODate(yesterday)
  }
];

// Mock-Daten für Monitoring
const mockMonitoring = [
  {
    id: 1,
    charge_id: 1001,
    proben_id: "P-1001-1",
    status: MonitoringStatus.ABGESCHLOSSEN,
    probentyp: "Mykotoxine",
    entnahme_datum: toISODate(lastWeek),
    entnommen_durch_id: 201,
    labor_id: 301,
    labor_eingang_datum: toISODate(lastWeek),
    ergebnis_datum: toISODate(yesterday),
    ergebnis_werte: {
      "DON": 0.5,
      "ZEA": 0.05,
      "Aflatoxin B1": 0.001
    },
    grenzwert_eingehalten: true,
    bemerkung: "Alle Werte im Normbereich",
    erstellt_am: toISODate(lastWeek),
    geaendert_am: toISODate(yesterday)
  },
  {
    id: 2,
    charge_id: 1002,
    proben_id: "P-1002-1",
    status: MonitoringStatus.IN_ANALYSE,
    probentyp: "Mikrobiologie",
    entnahme_datum: toISODate(yesterday),
    entnommen_durch_id: 202,
    labor_id: 302,
    labor_eingang_datum: toISODate(today),
    bemerkung: "Express-Analyse angefordert",
    erstellt_am: toISODate(yesterday),
    geaendert_am: toISODate(today)
  },
  {
    id: 3,
    charge_id: 1003,
    proben_id: "P-1003-1",
    status: MonitoringStatus.GEPLANT,
    probentyp: "Mykotoxine",
    bemerkung: "Standard-Analyse nach QS-Vorgaben",
    erstellt_am: toISODate(today)
  }
];

// Mock-Daten für Ereignisse
const mockEreignisse = [
  {
    id: 1,
    charge_id: 1001,
    ereignis_typ: EreignisTyp.QUALITAET,
    titel: "Abweichende Feuchtigkeit",
    beschreibung: "Feuchtigkeit liegt leicht über dem Sollwert",
    prioritaet: EreignisPrioritaet.NIEDRIG,
    ereignis_datum: toISODate(lastWeek),
    faellig_bis: toISODate(yesterday),
    ist_abgeschlossen: true,
    ist_bearbeitet: true,
    erstellt_von_id: 201,
    zugewiesen_an_id: 202,
    massnahmen: "Trocknung verlängert",
    nachfolgemassnahmen: "Feuchtigkeit erneut prüfen",
    abgeschlossen_am: toISODate(yesterday),
    abgeschlossen_von_id: 202,
    erstellt_am: toISODate(lastWeek),
    geaendert_am: toISODate(yesterday)
  },
  {
    id: 2,
    charge_id: 1002,
    ereignis_typ: EreignisTyp.PROZESS,
    titel: "Mischzeit erhöht",
    beschreibung: "Mischzeit wurde aufgrund der Rohstoffeigenschaften erhöht",
    prioritaet: EreignisPrioritaet.NIEDRIG,
    ereignis_datum: toISODate(yesterday),
    ist_abgeschlossen: false,
    ist_bearbeitet: true,
    erstellt_von_id: 201,
    zugewiesen_an_id: 203,
    massnahmen: "Mischzeit um 20% erhöht",
    erstellt_am: toISODate(yesterday),
    geaendert_am: toISODate(yesterday)
  },
  {
    id: 3,
    charge_id: 1003,
    ereignis_typ: EreignisTyp.HACCP,
    titel: "CCP Siebung Abweichung",
    beschreibung: "Bei der Siebung wurden Verunreinigungen festgestellt",
    prioritaet: EreignisPrioritaet.HOCH,
    ereignis_datum: toISODate(today),
    faellig_bis: toISODate(tomorrow),
    ist_abgeschlossen: false,
    ist_bearbeitet: false,
    erstellt_von_id: 204,
    zugewiesen_an_id: 205,
    erstellt_am: toISODate(today)
  }
];

// Mock-Daten für Futtermittelchargen
export const mockQSFuttermittelChargen: QSFuttermittelCharge[] = [
  {
    id: 1001,
    charge_id: 100101,
    produktbezeichnung: "Legehennenfutter Premium",
    herstellungsdatum: toISODate(lastWeek),
    mindesthaltbarkeitsdatum: toISODate(nextWeek),
    qs_status: QSStatus.FREIGEGEBEN,
    mischzeit: 240,
    mahlzeit: 180,
    mischtemperatur: 22.5,
    feuchtigkeit: 12.8,
    bediener_id: 201,
    qualitaetsverantwortlicher_id: 301,
    kunde_id: 401,
    ist_spuelcharge: false,
    nach_kritischem_material: false,
    qs_freigabe_datum: toISODate(yesterday),
    qs_freigabe_durch_id: 301,
    qs_kennzeichnung_vollstaendig: true,
    qs_dokumentation_vollstaendig: true,
    monitoringpflicht: true,
    monitoringintervall_tage: 90,
    haccp_ccp_temperatur: true,
    haccp_ccp_magnetabscheider: true,
    haccp_ccp_siebung: true,
    ccp_messwerte: {
      "temperatur": 22.5,
      "siebung": "bestanden",
      "magnetabscheider": "bestanden"
    },
    vorgaenger_chargen: [10010],
    rohstoffe: mockRohstoffe.filter(r => r.charge_id === 1001),
    monitoring: mockMonitoring.filter(m => m.charge_id === 1001),
    ereignisse: mockEreignisse.filter(e => e.charge_id === 1001),
    erstellt_am: toISODate(lastWeek),
    geaendert_am: toISODate(yesterday)
  },
  {
    id: 1002,
    charge_id: 100102,
    produktbezeichnung: "Mastfutter Standard",
    herstellungsdatum: toISODate(yesterday),
    mindesthaltbarkeitsdatum: toISODate(nextWeek),
    qs_status: QSStatus.IN_PRUEFUNG,
    mischzeit: 210,
    mahlzeit: 150,
    mischtemperatur: 21.8,
    feuchtigkeit: 13.2,
    bediener_id: 202,
    qualitaetsverantwortlicher_id: 301,
    kunde_id: 402,
    ist_spuelcharge: false,
    nach_kritischem_material: true,
    qs_kennzeichnung_vollstaendig: true,
    qs_dokumentation_vollstaendig: false,
    monitoringpflicht: true,
    monitoringintervall_tage: 90,
    haccp_ccp_temperatur: true,
    haccp_ccp_magnetabscheider: true,
    haccp_ccp_siebung: true,
    ccp_messwerte: {
      "temperatur": 21.8,
      "siebung": "bestanden",
      "magnetabscheider": "bestanden"
    },
    vorgaenger_chargen: [10011],
    rohstoffe: mockRohstoffe.filter(r => r.charge_id === 1002),
    monitoring: mockMonitoring.filter(m => m.charge_id === 1002),
    ereignisse: mockEreignisse.filter(e => e.charge_id === 1002),
    erstellt_am: toISODate(yesterday),
    geaendert_am: toISODate(yesterday)
  },
  {
    id: 1003,
    charge_id: 100103,
    produktbezeichnung: "Spülcharge nach Medikamentenfutter",
    herstellungsdatum: toISODate(today),
    mindesthaltbarkeitsdatum: toISODate(nextWeek),
    qs_status: QSStatus.NEU,
    mischzeit: 180,
    mahlzeit: 120,
    mischtemperatur: 22.0,
    feuchtigkeit: 12.5,
    bediener_id: 203,
    qualitaetsverantwortlicher_id: 302,
    ist_spuelcharge: true,
    nach_kritischem_material: true,
    qs_kennzeichnung_vollstaendig: false,
    qs_dokumentation_vollstaendig: false,
    monitoringpflicht: true,
    monitoringintervall_tage: 30,
    haccp_ccp_temperatur: true,
    haccp_ccp_magnetabscheider: true,
    haccp_ccp_siebung: true,
    ccp_messwerte: {
      "temperatur": 22.0,
      "siebung": "bestanden",
      "magnetabscheider": "bestanden"
    },
    vorgaenger_chargen: [10012],
    rohstoffe: [],
    monitoring: mockMonitoring.filter(m => m.charge_id === 1003),
    ereignisse: mockEreignisse.filter(e => e.charge_id === 1003),
    erstellt_am: toISODate(today),
    geaendert_am: toISODate(today)
  },
  {
    id: 1004,
    charge_id: 100104,
    produktbezeichnung: "Bio-Legehennenfutter Premium",
    herstellungsdatum: toISODate(yesterday),
    mindesthaltbarkeitsdatum: toISODate(nextWeek),
    qs_status: QSStatus.FREIGEGEBEN,
    mischzeit: 250,
    mahlzeit: 190,
    mischtemperatur: 22.3,
    feuchtigkeit: 12.6,
    bediener_id: 201,
    qualitaetsverantwortlicher_id: 301,
    kunde_id: 403,
    ist_spuelcharge: false,
    nach_kritischem_material: false,
    qs_freigabe_datum: toISODate(today),
    qs_freigabe_durch_id: 301,
    qs_kennzeichnung_vollstaendig: true,
    qs_dokumentation_vollstaendig: true,
    monitoringpflicht: true,
    monitoringintervall_tage: 60,
    haccp_ccp_temperatur: true,
    haccp_ccp_magnetabscheider: true,
    haccp_ccp_siebung: true,
    ccp_messwerte: {
      "temperatur": 22.3,
      "siebung": "bestanden",
      "magnetabscheider": "bestanden"
    },
    vorgaenger_chargen: [10013],
    rohstoffe: [],
    monitoring: [],
    ereignisse: [],
    erstellt_am: toISODate(yesterday),
    geaendert_am: toISODate(today)
  },
  {
    id: 1005,
    charge_id: 100105,
    produktbezeichnung: "Kälberfutter Basic",
    herstellungsdatum: toISODate(lastWeek),
    mindesthaltbarkeitsdatum: toISODate(nextWeek),
    qs_status: QSStatus.GESPERRT,
    mischzeit: 220,
    mahlzeit: 160,
    mischtemperatur: 21.9,
    feuchtigkeit: 13.0,
    bediener_id: 202,
    qualitaetsverantwortlicher_id: 302,
    kunde_id: 404,
    ist_spuelcharge: false,
    nach_kritischem_material: false,
    qs_kennzeichnung_vollstaendig: true,
    qs_dokumentation_vollstaendig: true,
    monitoringpflicht: true,
    monitoringintervall_tage: 90,
    haccp_ccp_temperatur: true,
    haccp_ccp_magnetabscheider: true,
    haccp_ccp_siebung: true,
    ccp_messwerte: {
      "temperatur": 21.9,
      "siebung": "auffällig",
      "magnetabscheider": "bestanden"
    },
    vorgaenger_chargen: [10014],
    rohstoffe: [],
    monitoring: [],
    ereignisse: [],
    erstellt_am: toISODate(lastWeek),
    geaendert_am: toISODate(lastWeek)
  }
];

// Mock für die paginierten Daten mit Filterung
export const getMockQSFuttermittelChargen = (
  page: number = 1,
  page_size: number = 20,
  filter?: QSFuttermittelChargeFilter
): PaginatedResponse<QSFuttermittelCharge> => {
  let filteredChargen = [...mockQSFuttermittelChargen];

  // Filterung anwenden, wenn vorhanden
  if (filter) {
    if (filter.qs_status) {
      filteredChargen = filteredChargen.filter(charge => charge.qs_status === filter.qs_status);
    }
    if (filter.ist_spuelcharge !== undefined) {
      filteredChargen = filteredChargen.filter(charge => charge.ist_spuelcharge === filter.ist_spuelcharge);
    }
    if (filter.monitoringpflicht !== undefined) {
      filteredChargen = filteredChargen.filter(charge => charge.monitoringpflicht === filter.monitoringpflicht);
    }
    if (filter.kunde_id) {
      filteredChargen = filteredChargen.filter(charge => charge.kunde_id === filter.kunde_id);
    }
    if (filter.produktbezeichnung) {
      filteredChargen = filteredChargen.filter(charge => 
        charge.produktbezeichnung.toLowerCase().includes(filter.produktbezeichnung!.toLowerCase())
      );
    }
    if (filter.herstellungsdatum_von) {
      filteredChargen = filteredChargen.filter(charge => 
        charge.herstellungsdatum >= filter.herstellungsdatum_von!
      );
    }
    if (filter.herstellungsdatum_bis) {
      filteredChargen = filteredChargen.filter(charge => 
        charge.herstellungsdatum <= filter.herstellungsdatum_bis!
      );
    }
  }

  // Paginierung berechnen
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + page_size;
  const paginatedChargen = filteredChargen.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredChargen.length / page_size);

  return {
    items: paginatedChargen,
    total: filteredChargen.length,
    page,
    page_size,
    total_pages: totalPages
  };
};

// Mock für die Abfrage einer einzelnen Charge
export const getMockQSFuttermittelChargeById = (id: number): QSFuttermittelCharge | undefined => {
  return mockQSFuttermittelChargen.find(charge => charge.id === id);
};

// Mock für das Generieren des PDF-Protokolls
export const generateMockPDFProtokoll = async (chargeId: number): Promise<Blob> => {
  // Hier würde in einer echten Implementierung ein PDF generiert werden
  // Für das Mock geben wir einfach einen leeren Blob zurück
  return new Blob(['Mocked PDF-Protokoll für Charge ' + chargeId], { type: 'application/pdf' });
};

// Mock für den CSV-Export
export const exportMockCSV = async (filter?: QSFuttermittelChargeFilter): Promise<Blob> => {
  // Hier würde in einer echten Implementierung eine CSV-Datei generiert werden
  // Für das Mock geben wir einfach einen leeren Blob zurück
  return new Blob(['Mocked CSV-Export'], { type: 'text/csv' });
}; 