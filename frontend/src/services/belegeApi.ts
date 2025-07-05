import api from './api';

// Angebot Typen
export interface Angebot {
  id?: string;
  nummer?: string;
  kundenId: string;
  kundenAnsprechpartner?: string;
  betreff: string;
  erstellDatum: string;
  gueltigBis: string;
  waehrung?: string;
  gesamtbetrag?: number;
  mwstBetrag?: number;
  rabatt?: number;
  status: string;
  zahlungsbedingungen?: string;
  lieferbedingungen?: string;
  positionen: Position[];
  kundenAffinitaet?: number;
  optimiertePreise?: boolean;
  preisOptimierungsBasis?: string;
  vorgeschlageneAlternativen?: string[];
  saisonaleAnpassung?: boolean;
  marktpreisVergleich?: number;
}

// Auftrag Typen
export interface Auftrag {
  id?: string;
  nummer?: string;
  angebotId?: string;
  kundenId: string;
  kundenBestellnummer?: string;
  erstellDatum: string;
  lieferdatum: string;
  status: string;
  prioritaet: string;
  gesamtbetrag?: number;
  mwstBetrag?: number;
  rabatt?: number;
  zahlungsbedingungen?: string;
  lieferbedingungen?: string;
  lieferadresse?: string;
  rechnungsadresse?: string;
  positionen: Position[];
  lieferterminPrognose?: number;
  lagerbestandsOptimierung?: string;
  produktionsplanungId?: string;
  ressourcenKonflikte?: string[];
  automatischePrioritaetssetzung?: string;
  umsatzPrognose?: number;
}

// Lieferschein Typen
export interface Lieferschein {
  id?: string;
  nummer?: string;
  auftragId: string;
  kundenId: string;
  erstellDatum: string;
  lieferdatum: string;
  status: string;
  versandart?: string;
  trackingNummer?: string;
  spediteur?: string;
  lieferadresse?: string;
  gewicht?: number;
  volumen?: number;
  anzahlPackstuecke?: number;
  positionen: LieferscheinPosition[];
  optimierteVerpackung?: string;
  routenOptimierung?: string;
  zeitfensterPrognose?: string;
  kommissionierungsReihenfolge?: string[];
  automatischeDokumentenErstellung?: boolean;
  qualitaetssicherungsHinweise?: string;
}

export interface LieferscheinPosition {
  id?: string;
  auftragsPositionsId: string;
  artikelId: string;
  artikelBezeichnung: string;
  menge: number;
  einheit: string;
  chargenNummer?: string;
  serienNummer?: string;
  lagerortId: string;
  bemerkung?: string;
}

// Rechnung Typen
export interface Rechnung {
  id?: string;
  nummer?: string;
  auftragId: string;
  lieferscheinId?: string;
  kundenId: string;
  erstellDatum: string;
  faelligkeitsdatum: string;
  status: string;
  zahlungsbedingungen?: string;
  zahlungsart?: string;
  waehrung?: string;
  gesamtbetrag?: number;
  mwstBetrag?: number;
  rabatt?: number;
  bereitsGezahlt?: number;
  rechnungsadresse?: string;
  iban?: string;
  bic?: string;
  verwendungszweck?: string;
  positionen: RechnungsPosition[];
  zahlungsprognoseDatum?: string;
  zahlungsausfallRisiko?: number;
  empfohleneZahlungserinnerung?: string;
  umsatzsteuerKategorisierung?: string;
  buchhaltungskontoVorschlag?: string;
  cashflowPrognoseImpact?: number;
}

export interface RechnungsPosition {
  id?: string;
  lieferscheinPositionsId?: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  mwstSatz: number;
  rabatt?: number;
  gesamtpreis?: number;
  kostenstelle?: string;
}

// Bestellung Typen
export interface Bestellung {
  id?: string;
  nummer?: string;
  lieferantenId: string;
  lieferantenAnsprechpartner?: string;
  erstellDatum: string;
  lieferdatum: string;
  status: string;
  waehrung?: string;
  gesamtbetrag?: number;
  mwstBetrag?: number;
  rabatt?: number;
  zahlungsbedingungen?: string;
  lieferbedingungen?: string;
  lieferadresse?: string;
  bestellerId?: string;
  freigegeben?: boolean;
  freigegebenVon?: string;
  freigabeDatum?: string;
  positionen: BestellPosition[];
  bedarfsermittlungBasis?: string;
  preisvergleichsAnalyse?: string;
  alternativeLieferanten?: string[];
  bestellzeitpunktOptimierung?: string;
  mengenOptimierungsFaktor?: number;
  lieferantenBewertungScore?: number;
  nachhaltigkeitsScore?: number;
}

export interface BestellPosition {
  id?: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  mwstSatz: number;
  rabatt?: number;
  gesamtpreis?: number;
  artikelNummer?: string;
  liefertermin?: string;
  bereitsGelieferteMenge?: number;
  kostenstelle?: string;
}

// Eingangslieferschein Typen
export interface Eingangslieferschein {
  id?: string;
  nummer?: string;
  bestellungId: string;
  lieferantenId: string;
  lieferantenLieferscheinNummer?: string;
  eingangsdatum: string;
  status: string;
  annahmeort?: string;
  angenommenVon?: string;
  frachtkosten?: number;
  bemerkungen?: string;
  positionen: EingangslieferscheinPosition[];
  automatischeQualitaetsbewertung?: number;
  lieferantenPerformanceScore?: number;
  optimaleEinlagerungsVorschlaege?: string[];
  abweichungsanalyseErgebnis?: string;
  reklamationsWahrscheinlichkeit?: number;
  automatischeBuchungsvorschlaege?: string;
}

export interface EingangslieferscheinPosition {
  id?: string;
  bestellPositionsId: string;
  artikelId: string;
  artikelBezeichnung: string;
  bestellteMenge: number;
  gelieferteMenge: number;
  einheit: string;
  chargenNummer?: string;
  serienNummer?: string;
  mhd?: string;
  lagerortId: string;
  qualitaetsStatus?: string;
  abweichungsgrund?: string;
}

// Allgemeine Position Typen
export interface Position {
  id?: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  mwstSatz: number;
  rabatt?: number;
  gesamtpreis?: number;
  [key: string]: any;
}

// Belege API Service
const belegeApi = {
  // Angebote
  getAngebote: async (params?: any) => {
    const response = await api.get('/angebote', { params });
    return response.data;
  },

  getAngebot: async (id: string) => {
    const response = await api.get(`/angebote/${id}`);
    return response.data;
  },

  createAngebot: async (angebot: Angebot) => {
    const response = await api.post('/angebote', angebot);
    return response.data;
  },

  updateAngebot: async (id: string, angebot: Angebot) => {
    const response = await api.put(`/angebote/${id}`, angebot);
    return response.data;
  },

  deleteAngebot: async (id: string) => {
    const response = await api.delete(`/angebote/${id}`);
    return response.data;
  },

  // Aufträge
  getAuftraege: async (params?: any) => {
    const response = await api.get('/auftraege', { params });
    return response.data;
  },

  getAuftrag: async (id: string) => {
    const response = await api.get(`/auftraege/${id}`);
    return response.data;
  },

  createAuftrag: async (auftrag: Auftrag) => {
    const response = await api.post('/auftraege', auftrag);
    return response.data;
  },

  updateAuftrag: async (id: string, auftrag: Auftrag) => {
    const response = await api.put(`/auftraege/${id}`, auftrag);
    return response.data;
  },

  createAuftragFromAngebot: async (angebotId: string) => {
    const response = await api.post(`/auftraege/from-angebot/${angebotId}`);
    return response.data;
  },

  // Lieferscheine
  getLieferscheine: async (params?: any) => {
    const response = await api.get('/lieferscheine', { params });
    return response.data;
  },

  getLieferschein: async (id: string) => {
    const response = await api.get(`/lieferscheine/${id}`);
    return response.data;
  },

  createLieferschein: async (lieferschein: Lieferschein) => {
    const response = await api.post('/lieferscheine', lieferschein);
    return response.data;
  },

  updateLieferschein: async (id: string, lieferschein: Lieferschein) => {
    const response = await api.put(`/lieferscheine/${id}`, lieferschein);
    return response.data;
  },

  createLieferscheinFromAuftrag: async (auftragId: string) => {
    const response = await api.post(`/lieferscheine/from-auftrag/${auftragId}`);
    return response.data;
  },

  // Rechnungen
  getRechnungen: async (params?: any) => {
    const response = await api.get('/rechnungen', { params });
    return response.data;
  },

  getRechnung: async (id: string) => {
    const response = await api.get(`/rechnungen/${id}`);
    return response.data;
  },

  createRechnung: async (rechnung: Rechnung) => {
    const response = await api.post('/rechnungen', rechnung);
    return response.data;
  },

  updateRechnung: async (id: string, rechnung: Rechnung) => {
    const response = await api.put(`/rechnungen/${id}`, rechnung);
    return response.data;
  },

  createRechnungFromLieferschein: async (lieferscheinId: string) => {
    const response = await api.post(`/rechnungen/from-lieferschein/${lieferscheinId}`);
    return response.data;
  },

  // Bestellungen
  getBestellungen: async (params?: any) => {
    const response = await api.get('/bestellungen', { params });
    return response.data;
  },

  getBestellung: async (id: string) => {
    const response = await api.get(`/bestellungen/${id}`);
    return response.data;
  },

  createBestellung: async (bestellung: Bestellung) => {
    const response = await api.post('/bestellungen', bestellung);
    return response.data;
  },

  updateBestellung: async (id: string, bestellung: Bestellung) => {
    const response = await api.put(`/bestellungen/${id}`, bestellung);
    return response.data;
  },

  // Eingangslieferscheine
  getEingangslieferscheine: async (params?: any) => {
    const response = await api.get('/eingangslieferscheine', { params });
    return response.data;
  },

  getEingangslieferschein: async (id: string) => {
    const response = await api.get(`/eingangslieferscheine/${id}`);
    return response.data;
  },

  createEingangslieferschein: async (eingangslieferschein: Eingangslieferschein) => {
    const response = await api.post('/eingangslieferscheine', eingangslieferschein);
    return response.data;
  },

  updateEingangslieferschein: async (id: string, eingangslieferschein: Eingangslieferschein) => {
    const response = await api.put(`/eingangslieferscheine/${id}`, eingangslieferschein);
    return response.data;
  },

  createEingangslieferscheinFromBestellung: async (bestellungId: string) => {
    const response = await api.post(`/eingangslieferscheine/from-bestellung/${bestellungId}`);
    return response.data;
  },

  // Belegkette
  getBelegkette: async (belegId: string, belegTyp: string) => {
    const response = await api.get(`/belege/kette/${belegId}`, { params: { belegTyp } });
    return response.data;
  },

  // KI-Funktionen
  getPreisvorschlaege: async (angebotId: string) => {
    const response = await api.get(`/belege/ki/preisvorschlaege/${angebotId}`);
    return response.data;
  },

  getLieferterminPrognose: async (auftragId: string) => {
    const response = await api.get(`/belege/ki/lieferterminprognose/${auftragId}`);
    return response.data;
  },

  getRoutenoptimierung: async (lieferscheinId: string) => {
    const response = await api.get(`/belege/ki/routenoptimierung/${lieferscheinId}`);
    return response.data;
  },

  getZahlungsprognose: async (rechnungId: string) => {
    const response = await api.get(`/belege/ki/zahlungsprognose/${rechnungId}`);
    return response.data;
  },

  getBedarfsermittlung: async (artikelIds: string[]) => {
    const response = await api.post('/belege/ki/bedarfsermittlung', { artikelIds });
    return response.data;
  },

  getQualitaetsanalyse: async (eingangslieferscheinId: string) => {
    const response = await api.get(`/belege/ki/qualitaetsanalyse/${eingangslieferscheinId}`);
    return response.data;
  }
};

export default belegeApi; 