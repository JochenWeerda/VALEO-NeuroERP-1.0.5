import api from './api';
import { Position } from '../components/BelegeFormular/PositionenTabelle';
import { Angebot, Auftrag, Lieferschein, Rechnung, Bestellung, Eingangslieferschein } from './belegeApi';

// Typen für die verschiedenen KI-Analyseergebnisse

export interface PreisVorschlag {
  artikelId: string;
  artikelBezeichnung: string;
  originalPreis: number;
  vorgeschlagenerPreis: number;
  rabatt?: number;
  begruendung: string;
  konfidenz: number;
}

export interface LieferterminPrognose {
  geschaetztesDatum: string;
  minimaleDauer: number;
  maximaleDauer: number;
  einflussbereich: 'produktion' | 'logistik' | 'lieferant' | 'saisonal';
  begruendung: string;
  konfidenz: number;
  alternativen?: Array<{
    datum: string;
    beschreibung: string;
  }>;
}

export interface RoutenOptimierung {
  optimierteReihenfolge: Array<{
    lieferadresse: string;
    kundenId: string;
    kundenName?: string;
    entfernung?: number;
    geschaetzteZeit?: number;
  }>;
  gesamtEntfernung: number;
  gesamtZeit: number;
  einsparpotential: number;
  begruendung: string;
}

export interface ZahlungsPrognose {
  wahrscheinlichesDatum: string;
  zahlungswahrscheinlichkeit: number;
  ausfallrisiko: number;
  empfehlung?: string;
  begruendung: string;
}

export interface BedarfsErmittlung {
  artikel: Array<{
    artikelId: string;
    artikelBezeichnung: string;
    benoetigteMenge: number;
    verfuegbareMenge: number;
    fehlmenge: number;
    optimaleBestellmenge: number;
    lieferzeit: number;
    bestelldringlichkeit: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  }>;
  gesamtkosten: number;
  lieferanten: Array<{
    lieferantenId: string;
    lieferantenName: string;
    bewertung: number;
    artikelAnzahl: number;
  }>;
}

export interface QualitaetsAnalyse {
  artikel: Array<{
    artikelId: string;
    artikelBezeichnung: string;
    qualitaetsscore: number;
    abweichungen: Array<{
      parameter: string;
      sollwert: string | number;
      istwert: string | number;
      bewertung: 'akzeptabel' | 'kritisch' | 'inakzeptabel';
    }>;
    empfehlung: string;
  }>;
  lieferantenbewertung: number;
  einflussAufFolgeprozesse: string;
}

// KI-Assistent Service
const belegAssistentService = {
  // Preisvorschläge für Angebote
  getPreisvorschlaege: async (angebot: Angebot): Promise<PreisVorschlag[]> => {
    try {
      // In einer realen Implementierung würde dies eine API-Anfrage sein
      // Stattdessen simulieren wir hier eine API-Antwort mit einer Verzögerung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulierte Antwort basierend auf den Positionen im Angebot
      return angebot.positionen.map(position => ({
        artikelId: position.artikelId,
        artikelBezeichnung: position.artikelBezeichnung,
        originalPreis: position.einzelpreis,
        vorgeschlagenerPreis: Math.round(position.einzelpreis * (0.9 + Math.random() * 0.2) * 100) / 100,
        rabatt: Math.round(Math.random() * 10) / 2, // 0 bis 5% Rabatt in 0.5% Schritten
        begruendung: getZufaelligeBegruendung('preis'),
        konfidenz: Math.round(Math.random() * 40 + 60) // 60-100% Konfidenz
      }));
    } catch (error) {
      console.error('Fehler beim Abrufen der Preisvorschläge:', error);
      throw error;
    }
  },

  // Lieferterminprognose für Aufträge
  getLieferterminPrognose: async (auftrag: Auftrag): Promise<LieferterminPrognose> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const heute = new Date();
      const zufaelligeTage = Math.round(Math.random() * 10 + 5); // 5-15 Tage
      const prognoseDatum = new Date(heute);
      prognoseDatum.setDate(prognoseDatum.getDate() + zufaelligeTage);
      
      return {
        geschaetztesDatum: prognoseDatum.toISOString(),
        minimaleDauer: zufaelligeTage - Math.round(Math.random() * 3), // Min 2-5 Tage weniger
        maximaleDauer: zufaelligeTage + Math.round(Math.random() * 5), // Max 0-5 Tage mehr
        einflussbereich: ['produktion', 'logistik', 'lieferant', 'saisonal'][Math.floor(Math.random() * 4)] as 'produktion' | 'logistik' | 'lieferant' | 'saisonal',
        begruendung: getZufaelligeBegruendung('liefertermin'),
        konfidenz: Math.round(Math.random() * 30 + 70), // 70-100% Konfidenz
        alternativen: [
          {
            datum: new Date(heute.getTime() + (zufaelligeTage + 7) * 24 * 60 * 60 * 1000).toISOString(),
            beschreibung: 'Expressoption mit zusätzlichen Kosten'
          },
          {
            datum: new Date(heute.getTime() + (zufaelligeTage - 3) * 24 * 60 * 60 * 1000).toISOString(),
            beschreibung: 'Bei Reduzierung der Bestellmenge möglich'
          }
        ]
      };
    } catch (error) {
      console.error('Fehler bei der Lieferterminprognose:', error);
      throw error;
    }
  },

  // Routenoptimierung für Lieferscheine
  getRoutenoptimierung: async (lieferschein: Lieferschein): Promise<RoutenOptimierung> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulierte Adressen für die Demonstration
      const adressen = [
        { lieferadresse: 'Hauptstraße 1, 12345 Berlin', kundenId: '1', kundenName: 'Mustermann GmbH' },
        { lieferadresse: 'Nebenweg 2, 23456 Hamburg', kundenId: '2', kundenName: 'Beispiel AG' },
        { lieferadresse: 'Beispielstraße 3, 34567 München', kundenId: '3', kundenName: 'Test KG' },
        { lieferadresse: 'Testgasse 4, 45678 Köln', kundenId: '4', kundenName: 'Demo GmbH' }
      ];
      
      // Zufällige Auswahl von 2-4 Adressen
      const anzahlAdressen = Math.min(Math.floor(Math.random() * 3) + 2, adressen.length);
      const ausgewaehlteAdressen = adressen
        .sort(() => Math.random() - 0.5)
        .slice(0, anzahlAdressen);
      
      // Simulierte Routenoptimierung
      return {
        optimierteReihenfolge: ausgewaehlteAdressen.map(adresse => ({
          ...adresse,
          entfernung: Math.round(Math.random() * 50 + 10), // 10-60 km
          geschaetzteZeit: Math.round(Math.random() * 45 + 15) // 15-60 Minuten
        })),
        gesamtEntfernung: Math.round(Math.random() * 150 + 50), // 50-200 km
        gesamtZeit: Math.round(Math.random() * 180 + 60), // 60-240 Minuten
        einsparpotential: Math.round(Math.random() * 30 + 10), // 10-40%
        begruendung: getZufaelligeBegruendung('route')
      };
    } catch (error) {
      console.error('Fehler bei der Routenoptimierung:', error);
      throw error;
    }
  },

  // Zahlungsprognose für Rechnungen
  getZahlungsprognose: async (rechnung: Rechnung): Promise<ZahlungsPrognose> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const faelligkeitsdatum = new Date(rechnung.faelligkeitsdatum);
      const prognoseAbweichung = Math.round((Math.random() * 2 - 1) * 10); // -10 bis +10 Tage
      const prognoseDatum = new Date(faelligkeitsdatum);
      prognoseDatum.setDate(prognoseDatum.getDate() + prognoseAbweichung);
      
      const zahlungswahrscheinlichkeit = Math.round(Math.random() * 50 + 50); // 50-100%
      const ausfallrisiko = Math.round((100 - zahlungswahrscheinlichkeit) / 2); // 0-25%
      
      return {
        wahrscheinlichesDatum: prognoseDatum.toISOString(),
        zahlungswahrscheinlichkeit,
        ausfallrisiko,
        empfehlung: prognoseAbweichung > 5 ? 'Zahlungserinnerung empfohlen' : 
                   ausfallrisiko > 15 ? 'Vorzeitige Kontaktaufnahme empfohlen' : undefined,
        begruendung: getZufaelligeBegruendung('zahlung')
      };
    } catch (error) {
      console.error('Fehler bei der Zahlungsprognose:', error);
      throw error;
    }
  },

  // Bedarfsermittlung für Bestellungen
  getBedarfsermittlung: async (artikelIds: string[]): Promise<BedarfsErmittlung> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulierte Artikeldaten für die Demonstration
      const artikelBezeichnungen: {[key: string]: string} = {
        '1': 'Produkt A',
        '2': 'Produkt B',
        '3': 'Produkt C',
        '4': 'Produkt D'
      };
      
      // Simulierte Lieferantendaten
      const lieferanten = [
        { lieferantenId: '1', lieferantenName: 'Lieferant X', bewertung: 85 },
        { lieferantenId: '2', lieferantenName: 'Lieferant Y', bewertung: 92 },
        { lieferantenId: '3', lieferantenName: 'Lieferant Z', bewertung: 78 }
      ];
      
      const dringlichkeiten: Array<'niedrig' | 'mittel' | 'hoch' | 'kritisch'> = ['niedrig', 'mittel', 'hoch', 'kritisch'];
      
      const artikel = artikelIds.map(id => {
        const benoetigteMenge = Math.round(Math.random() * 100 + 50); // 50-150
        const verfuegbareMenge = Math.round(Math.random() * benoetigteMenge * 0.8); // 0-80% der benötigten Menge
        const fehlmenge = benoetigteMenge - verfuegbareMenge;
        
        return {
          artikelId: id,
          artikelBezeichnung: artikelBezeichnungen[id] || `Unbekanntes Produkt (${id})`,
          benoetigteMenge,
          verfuegbareMenge,
          fehlmenge,
          optimaleBestellmenge: Math.round(fehlmenge * (1 + Math.random() * 0.3)), // Fehlmenge + 0-30% Puffer
          lieferzeit: Math.round(Math.random() * 14 + 3), // 3-17 Tage
          bestelldringlichkeit: dringlichkeiten[Math.floor(Math.random() * dringlichkeiten.length)]
        };
      });
      
      // Zuordnung von Artikeln zu Lieferanten
      const lieferantenMitArtikeln = lieferanten.map(lieferant => ({
        ...lieferant,
        artikelAnzahl: Math.floor(Math.random() * artikel.length) + 1 // Mindestens 1 Artikel pro Lieferant
      }));
      
      return {
        artikel,
        gesamtkosten: Math.round(artikel.reduce((sum, art) => sum + art.optimaleBestellmenge * (Math.random() * 100 + 50), 0)), // Zufälliger Preis pro Artikel
        lieferanten: lieferantenMitArtikeln
      };
    } catch (error) {
      console.error('Fehler bei der Bedarfsermittlung:', error);
      throw error;
    }
  },

  // Qualitätsanalyse für Eingangslieferscheine
  getQualitaetsanalyse: async (eingangslieferschein: Eingangslieferschein): Promise<QualitaetsAnalyse> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const parameterTypen = ['Gewicht', 'Länge', 'Breite', 'Höhe', 'Farbe', 'Dichte', 'pH-Wert', 'Konzentration'];
      const bewertungen: Array<'akzeptabel' | 'kritisch' | 'inakzeptabel'> = ['akzeptabel', 'kritisch', 'inakzeptabel'];
      
      const artikel = eingangslieferschein.positionen.map(position => {
        const qualitaetsscore = Math.round(Math.random() * 40 + 60); // 60-100
        const anzahlAbweichungen = Math.floor(Math.random() * 3) + 1; // 1-3 Abweichungen
        
        const abweichungen = Array(anzahlAbweichungen).fill(0).map(() => {
          const parameter = parameterTypen[Math.floor(Math.random() * parameterTypen.length)];
          const isNumerisch = parameter !== 'Farbe';
          const sollwert = isNumerisch ? Math.round(Math.random() * 100) : ['Rot', 'Grün', 'Blau', 'Gelb'][Math.floor(Math.random() * 4)];
          const abweichung = isNumerisch ? (Math.random() * 0.2 - 0.1) : 0; // -10% bis +10% Abweichung
          const istwert = isNumerisch ? Math.round((sollwert as number) * (1 + abweichung)) : ['Dunkelrot', 'Hellgrün', 'Dunkelblau', 'Hellgelb'][Math.floor(Math.random() * 4)];
          
          return {
            parameter,
            sollwert,
            istwert,
            bewertung: bewertungen[Math.floor(Math.random() * bewertungen.length)]
          };
        });
        
        return {
          artikelId: position.artikelId,
          artikelBezeichnung: position.artikelBezeichnung,
          qualitaetsscore,
          abweichungen,
          empfehlung: getQualitaetsempfehlung(qualitaetsscore)
        };
      });
      
      const lieferantenbewertung = Math.round(artikel.reduce((sum, art) => sum + art.qualitaetsscore, 0) / artikel.length);
      
      return {
        artikel,
        lieferantenbewertung,
        einflussAufFolgeprozesse: getEinflussAufFolgeprozesse(lieferantenbewertung)
      };
    } catch (error) {
      console.error('Fehler bei der Qualitätsanalyse:', error);
      throw error;
    }
  }
};

// Hilfsfunktionen für die Generierung von zufälligen Begründungen und Empfehlungen

function getZufaelligeBegruendung(typ: string): string {
  const begruendungen: {[key: string]: string[]} = {
    preis: [
      'Basierend auf historischen Verkaufsdaten und aktuellen Marktpreisen',
      'Unter Berücksichtigung der aktuellen Nachfragesituation und Wettbewerbspreise',
      'Aufgrund saisonaler Schwankungen und Kundenpräferenzen',
      'Basierend auf der Kundenhistorie und Preissensitivität'
    ],
    liefertermin: [
      'Basierend auf aktueller Auslastung und historischen Lieferzeiten',
      'Unter Berücksichtigung der Verfügbarkeit von Materialien und Ressourcen',
      'Aufgrund saisonaler Schwankungen und logistischer Faktoren',
      'Basierend auf der Komplexität des Auftrags und benötigter Produktionszeit'
    ],
    route: [
      'Optimiert nach Entfernung und geschätzter Fahrzeit unter Berücksichtigung von Verkehrsprognosen',
      'Basierend auf aktuellen Verkehrsbedingungen und optimaler Reihenfolge der Lieferadressen',
      'Unter Berücksichtigung von Zeitfenstern und Kundenprioritäten',
      'Optimiert für minimale Gesamtfahrzeit unter Berücksichtigung von Fahrzeugkapazitäten'
    ],
    zahlung: [
      'Basierend auf historischem Zahlungsverhalten des Kunden',
      'Unter Berücksichtigung von Saison- und Branchenfaktoren',
      'Abgeleitet aus statistischen Modellen und aktueller Liquiditätssituation des Kunden',
      'Aufgrund von Zahlungshistorie und aktuellen Wirtschaftsindikatoren'
    ]
  };
  
  const verfuegbareBegruendungen = begruendungen[typ] || begruendungen.preis;
  return verfuegbareBegruendungen[Math.floor(Math.random() * verfuegbareBegruendungen.length)];
}

function getQualitaetsempfehlung(score: number): string {
  if (score >= 90) {
    return 'Ohne Einschränkungen freigeben';
  } else if (score >= 80) {
    return 'Mit Hinweis auf geringfügige Abweichungen freigeben';
  } else if (score >= 70) {
    return 'Nach Rücksprache mit Fachabteilung freigeben';
  } else if (score >= 60) {
    return 'Qualitätsprüfung erforderlich vor Freigabe';
  } else {
    return 'Zurückweisen und Reklamation einleiten';
  }
}

function getEinflussAufFolgeprozesse(score: number): string {
  if (score >= 90) {
    return 'Keine negativen Auswirkungen auf Folgeprozesse zu erwarten';
  } else if (score >= 80) {
    return 'Geringfügige Anpassungen in Folgeprozessen empfohlen';
  } else if (score >= 70) {
    return 'Verstärkte Kontrollen in Folgeprozessen notwendig';
  } else if (score >= 60) {
    return 'Erhebliche Anpassungen in Folgeprozessen erforderlich';
  } else {
    return 'Folgeprozesse stark beeinträchtigt, alternative Materialien prüfen';
  }
}

export default belegAssistentService; 