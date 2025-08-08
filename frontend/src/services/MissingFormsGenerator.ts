/**
 * Generator für fehlende Formulare - VALEO NeuroERP 2.0
 * 
 * Dieser Service generiert automatisch alle fehlenden Formulare
 * basierend auf der Analyse in FEHLENDE_FORMULARE_ANALYSE.md
 */

import { z } from 'zod';
import { StandardizedFormConfig, FormTab, FormLayout, FORM_TEMPLATES, STANDARD_BELEGFOLGE } from '../types/forms';

/**
 * Template-basierte Formular-Generierung
 */
export class MissingFormsGenerator {
  
  /**
   * Generiert alle fehlenden WaWi-Formulare
   */
  static generateMissingWaWiForms(): StandardizedFormConfig[] {
    const missingForms: StandardizedFormConfig[] = [];

    // Artikel-Management (8 fehlend)
    const artikelManagementForms = [
      {
        id: 'wawi-artikelgruppen',
        title: 'Artikelgruppen verwalten',
        description: 'Artikelgruppen und -kategorien verwalten',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelattribute',
        title: 'Artikelattribute definieren',
        description: 'Artikelattribute und Eigenschaften definieren',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelbilder',
        title: 'Artikelbilder verwalten',
        description: 'Artikelbilder und Medien verwalten',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikeldokumente',
        title: 'Artikeldokumente verwalten',
        description: 'Artikeldokumente und Dateien verwalten',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelbewertung',
        title: 'Artikelbewertungen',
        description: 'Artikelbewertungen und Reviews verwalten',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelhistorie',
        title: 'Artikeländerungshistorie',
        description: 'Historie der Artikeländerungen anzeigen',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelverknuepfungen',
        title: 'Artikelverknüpfungen',
        description: 'Verknüpfungen zwischen Artikeln verwalten',
        category: 'artikel-management'
      },
      {
        id: 'wawi-artikelimport',
        title: 'Artikel-Import/Export',
        description: 'Artikel-Daten importieren und exportieren',
        category: 'artikel-management'
      }
    ];

    // Lager-Management (10 fehlend)
    const lagerManagementForms = [
      {
        id: 'wawi-lagerzonen',
        title: 'Lagerzonen verwalten',
        description: 'Lagerzonen und Bereiche verwalten',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerplätze',
        title: 'Lagerplätze verwalten',
        description: 'Lagerplätze und Positionen verwalten',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerkapazitäten',
        title: 'Lagerkapazitäten planen',
        description: 'Lagerkapazitäten und -planung verwalten',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerkosten',
        title: 'Lagerkosten verwalten',
        description: 'Lagerkosten und -kalkulation verwalten',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerbelegung',
        title: 'Lagerbelegung anzeigen',
        description: 'Aktuelle Lagerbelegung visualisieren',
        category: 'lager-management'
      },
      {
        id: 'wawi-lageroptimierung',
        title: 'Lageroptimierung',
        description: 'Lageroptimierung und -planung',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerkontrolle',
        title: 'Lagerkontrolle',
        description: 'Lagerkontrolle und -überwachung',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerberichte',
        title: 'Lagerberichte',
        description: 'Lagerberichte und -analysen',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerhistorie',
        title: 'Lagerhistorie',
        description: 'Lagerhistorie und -protokoll',
        category: 'lager-management'
      },
      {
        id: 'wawi-lagerarchiv',
        title: 'Lagerarchiv',
        description: 'Lagerarchiv und -dokumentation',
        category: 'lager-management'
      }
    ];

    // Bestell-Management (6 fehlend)
    const bestellManagementForms = [
      {
        id: 'wawi-bestellvorschläge',
        title: 'Bestellvorschläge',
        description: 'Automatische Bestellvorschläge generieren',
        category: 'bestell-management'
      },
      {
        id: 'wawi-bestellhistorie',
        title: 'Bestellhistorie',
        description: 'Historie aller Bestellungen anzeigen',
        category: 'bestell-management'
      },
      {
        id: 'wawi-bestellstatus',
        title: 'Bestellstatus-Tracking',
        description: 'Bestellstatus und -verfolgung',
        category: 'bestell-management'
      },
      {
        id: 'wawi-bestellplanung',
        title: 'Bestellplanung',
        description: 'Bestellplanung und -optimierung',
        category: 'bestell-management'
      },
      {
        id: 'wawi-bestelloptimierung',
        title: 'Bestelloptimierung',
        description: 'Bestelloptimierung und -analyse',
        category: 'bestell-management'
      },
      {
        id: 'wawi-bestellberichte',
        title: 'Bestellberichte',
        description: 'Bestellberichte und -statistiken',
        category: 'bestell-management'
      }
    ];

    // Lieferanten-Management (8 fehlend)
    const lieferantenManagementForms = [
      {
        id: 'wawi-lieferantenkategorien',
        title: 'Lieferantenkategorien',
        description: 'Lieferantenkategorien und -gruppen verwalten',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenbewertung',
        title: 'Lieferantenbewertung',
        description: 'Lieferantenbewertung und -analyse',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenverträge',
        title: 'Lieferantenverträge',
        description: 'Lieferantenverträge und -vereinbarungen',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenhistorie',
        title: 'Lieferantenhistorie',
        description: 'Lieferantenhistorie und -protokoll',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenkontakte',
        title: 'Lieferantenkontakte',
        description: 'Lieferantenkontakte und -kommunikation',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenberichte',
        title: 'Lieferantenberichte',
        description: 'Lieferantenberichte und -analysen',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenimport',
        title: 'Lieferanten-Import',
        description: 'Lieferanten-Daten importieren',
        category: 'lieferanten-management'
      },
      {
        id: 'wawi-lieferantenarchiv',
        title: 'Lieferantenarchiv',
        description: 'Lieferantenarchiv und -dokumentation',
        category: 'lieferanten-management'
      }
    ];

    // Qualitäts-Management (6 fehlend)
    const qualitaetsManagementForms = [
      {
        id: 'wawi-qualitätsrichtlinien',
        title: 'Qualitätsrichtlinien',
        description: 'Qualitätsrichtlinien und -standards verwalten',
        category: 'qualitaets-management'
      },
      {
        id: 'wawi-prüfanweisungen',
        title: 'Prüfanweisungen',
        description: 'Prüfanweisungen und -verfahren verwalten',
        category: 'qualitaets-management'
      },
      {
        id: 'wawi-qualitätszertifikate',
        title: 'Qualitätszertifikate',
        description: 'Qualitätszertifikate und -nachweise',
        category: 'qualitaets-management'
      },
      {
        id: 'wawi-qualitätsberichte',
        title: 'Qualitätsberichte',
        description: 'Qualitätsberichte und -analysen',
        category: 'qualitaets-management'
      },
      {
        id: 'wawi-qualitätshistorie',
        title: 'Qualitätshistorie',
        description: 'Qualitätshistorie und -protokoll',
        category: 'qualitaets-management'
      },
      {
        id: 'wawi-qualitätsarchiv',
        title: 'Qualitätsarchiv',
        description: 'Qualitätsarchiv und -dokumentation',
        category: 'qualitaets-management'
      }
    ];

    // Logistik-Management (7 fehlend)
    const logistikManagementForms = [
      {
        id: 'wawi-transportrouten',
        title: 'Transportrouten',
        description: 'Transportrouten und -wege verwalten',
        category: 'logistik-management'
      },
      {
        id: 'wawi-fahrzeugverwaltung',
        title: 'Fahrzeugverwaltung',
        description: 'Fahrzeugverwaltung und -flotte',
        category: 'logistik-management'
      },
      {
        id: 'wawi-tourenplanung',
        title: 'Tourenplanung',
        description: 'Tourenplanung und -optimierung',
        category: 'logistik-management'
      },
      {
        id: 'wawi-logistikberichte',
        title: 'Logistikberichte',
        description: 'Logistikberichte und -analysen',
        category: 'logistik-management'
      },
      {
        id: 'wawi-logistikhistorie',
        title: 'Logistikhistorie',
        description: 'Logistikhistorie und -protokoll',
        category: 'logistik-management'
      },
      {
        id: 'wawi-logistikarchiv',
        title: 'Logistikarchiv',
        description: 'Logistikarchiv und -dokumentation',
        category: 'logistik-management'
      },
      {
        id: 'wawi-logistikoptimierung',
        title: 'Logistikoptimierung',
        description: 'Logistikoptimierung und -analyse',
        category: 'logistik-management'
      }
    ];

    // Alle WaWi-Formulare zusammenfassen
    const allWaWiForms = [
      ...artikelManagementForms,
      ...lagerManagementForms,
      ...bestellManagementForms,
      ...lieferantenManagementForms,
      ...qualitaetsManagementForms,
      ...logistikManagementForms
    ];

    // Formulare generieren
    allWaWiForms.forEach(form => {
      missingForms.push(this.generateFormConfig(form, 'warenwirtschaft'));
    });

    return missingForms;
  }

  /**
   * Generiert alle fehlenden FiBu-Formulare
   */
  static generateMissingFiBuForms(): StandardizedFormConfig[] {
    const missingForms: StandardizedFormConfig[] = [];

    // Konten-Management (6 fehlend)
    const kontenManagementForms = [
      {
        id: 'fibu-kontenrahmen',
        title: 'Kontenrahmen verwalten',
        description: 'Kontenrahmen und -struktur verwalten',
        category: 'konten-management'
      },
      {
        id: 'fibu-kontengruppen',
        title: 'Kontengruppen verwalten',
        description: 'Kontengruppen und -klassifikation verwalten',
        category: 'konten-management'
      },
      {
        id: 'fibu-kontenklassen',
        title: 'Kontenklassen verwalten',
        description: 'Kontenklassen und -kategorien verwalten',
        category: 'konten-management'
      },
      {
        id: 'fibu-kontenhistorie',
        title: 'Kontenhistorie',
        description: 'Kontenhistorie und -änderungen',
        category: 'konten-management'
      },
      {
        id: 'fibu-kontenberichte',
        title: 'Kontenberichte',
        description: 'Kontenberichte und -analysen',
        category: 'konten-management'
      },
      {
        id: 'fibu-kontenarchiv',
        title: 'Kontenarchiv',
        description: 'Kontenarchiv und -dokumentation',
        category: 'konten-management'
      }
    ];

    // Buchungs-Management (8 fehlend)
    const buchungsManagementForms = [
      {
        id: 'fibu-buchungsvorlagen',
        title: 'Buchungsvorlagen',
        description: 'Buchungsvorlagen und -templates verwalten',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsjournal',
        title: 'Buchungsjournal',
        description: 'Buchungsjournal und -protokoll',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungshistorie',
        title: 'Buchungshistorie',
        description: 'Buchungshistorie und -änderungen',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsberichte',
        title: 'Buchungsberichte',
        description: 'Buchungsberichte und -analysen',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsarchiv',
        title: 'Buchungsarchiv',
        description: 'Buchungsarchiv und -dokumentation',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsoptimierung',
        title: 'Buchungsoptimierung',
        description: 'Buchungsoptimierung und -analyse',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsvalidierung',
        title: 'Buchungsvalidierung',
        description: 'Buchungsvalidierung und -prüfung',
        category: 'buchungs-management'
      },
      {
        id: 'fibu-buchungsimport',
        title: 'Buchungs-Import',
        description: 'Buchungs-Daten importieren',
        category: 'buchungs-management'
      }
    ];

    // Rechnungs-Management (8 fehlend)
    const rechnungsManagementForms = [
      {
        id: 'fibu-rechnungsvorlagen',
        title: 'Rechnungsvorlagen',
        description: 'Rechnungsvorlagen und -templates verwalten',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungspositionen',
        title: 'Rechnungspositionen',
        description: 'Rechnungspositionen und -details verwalten',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungshistorie',
        title: 'Rechnungshistorie',
        description: 'Rechnungshistorie und -änderungen',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungsberichte',
        title: 'Rechnungsberichte',
        description: 'Rechnungsberichte und -analysen',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungsarchiv',
        title: 'Rechnungsarchiv',
        description: 'Rechnungsarchiv und -dokumentation',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungsoptimierung',
        title: 'Rechnungsoptimierung',
        description: 'Rechnungsoptimierung und -analyse',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungsvalidierung',
        title: 'Rechnungsvalidierung',
        description: 'Rechnungsvalidierung und -prüfung',
        category: 'rechnungs-management'
      },
      {
        id: 'fibu-rechnungsimport',
        title: 'Rechnungs-Import',
        description: 'Rechnungs-Daten importieren',
        category: 'rechnungs-management'
      }
    ];

    // Zahlungs-Management (6 fehlend)
    const zahlungsManagementForms = [
      {
        id: 'fibu-zahlungsarten',
        title: 'Zahlungsarten verwalten',
        description: 'Zahlungsarten und -methoden verwalten',
        category: 'zahlungs-management'
      },
      {
        id: 'fibu-zahlungsplanung',
        title: 'Zahlungsplanung',
        description: 'Zahlungsplanung und -termine',
        category: 'zahlungs-management'
      },
      {
        id: 'fibu-zahlungshistorie',
        title: 'Zahlungshistorie',
        description: 'Zahlungshistorie und -protokoll',
        category: 'zahlungs-management'
      },
      {
        id: 'fibu-zahlungsberichte',
        title: 'Zahlungsberichte',
        description: 'Zahlungsberichte und -analysen',
        category: 'zahlungs-management'
      },
      {
        id: 'fibu-zahlungsarchiv',
        title: 'Zahlungsarchiv',
        description: 'Zahlungsarchiv und -dokumentation',
        category: 'zahlungs-management'
      },
      {
        id: 'fibu-zahlungsoptimierung',
        title: 'Zahlungsoptimierung',
        description: 'Zahlungsoptimierung und -analyse',
        category: 'zahlungs-management'
      }
    ];

    // Kostenstellen (5 fehlend)
    const kostenstellenForms = [
      {
        id: 'fibu-kostenstellenplan',
        title: 'Kostenstellenplan',
        description: 'Kostenstellenplan und -struktur verwalten',
        category: 'kostenstellen'
      },
      {
        id: 'fibu-kostenverteilung',
        title: 'Kostenverteilung',
        description: 'Kostenverteilung und -allokation',
        category: 'kostenstellen'
      },
      {
        id: 'fibu-kostenanalyse',
        title: 'Kostenanalyse',
        description: 'Kostenanalyse und -auswertung',
        category: 'kostenstellen'
      },
      {
        id: 'fibu-kostenberichte',
        title: 'Kostenberichte',
        description: 'Kostenberichte und -statistiken',
        category: 'kostenstellen'
      },
      {
        id: 'fibu-kostenarchiv',
        title: 'Kostenarchiv',
        description: 'Kostenarchiv und -dokumentation',
        category: 'kostenstellen'
      }
    ];

    // Budget-Management (4 fehlend)
    const budgetManagementForms = [
      {
        id: 'fibu-budgetplanung',
        title: 'Budgetplanung',
        description: 'Budgetplanung und -erstellung',
        category: 'budget-management'
      },
      {
        id: 'fibu-budgetüberwachung',
        title: 'Budgetüberwachung',
        description: 'Budgetüberwachung und -kontrolle',
        category: 'budget-management'
      },
      {
        id: 'fibu-budgetabschluss',
        title: 'Budgetabschluss',
        description: 'Budgetabschluss und -auswertung',
        category: 'budget-management'
      },
      {
        id: 'fibu-budgetberichte',
        title: 'Budgetberichte',
        description: 'Budgetberichte und -analysen',
        category: 'budget-management'
      }
    ];

    // Alle FiBu-Formulare zusammenfassen
    const allFiBuForms = [
      ...kontenManagementForms,
      ...buchungsManagementForms,
      ...rechnungsManagementForms,
      ...zahlungsManagementForms,
      ...kostenstellenForms,
      ...budgetManagementForms
    ];

    // Formulare generieren
    allFiBuForms.forEach(form => {
      missingForms.push(this.generateFormConfig(form, 'finanzbuchhaltung'));
    });

    return missingForms;
  }

  /**
   * Generiert alle fehlenden CRM-Formulare
   */
  static generateMissingCRMForms(): StandardizedFormConfig[] {
    const missingForms: StandardizedFormConfig[] = [];

    // Kunden-Management (8 fehlend)
    const kundenManagementForms = [
      {
        id: 'crm-kundenkategorien',
        title: 'Kundenkategorien',
        description: 'Kundenkategorien und -gruppen verwalten',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenhistorie',
        title: 'Kundenhistorie',
        description: 'Kundenhistorie und -änderungen',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenbewertung',
        title: 'Kundenbewertung',
        description: 'Kundenbewertung und -analyse',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenberichte',
        title: 'Kundenberichte',
        description: 'Kundenberichte und -statistiken',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenarchiv',
        title: 'Kundenarchiv',
        description: 'Kundenarchiv und -dokumentation',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenimport',
        title: 'Kunden-Import',
        description: 'Kunden-Daten importieren',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenexport',
        title: 'Kunden-Export',
        description: 'Kunden-Daten exportieren',
        category: 'kunden-management'
      },
      {
        id: 'crm-kundenoptimierung',
        title: 'Kundenoptimierung',
        description: 'Kundenoptimierung und -analyse',
        category: 'kunden-management'
      }
    ];

    // Kontakte (6 fehlend)
    const kontakteForms = [
      {
        id: 'crm-kontaktverwaltung',
        title: 'Kontaktverwaltung',
        description: 'Kontaktverwaltung und -organisation',
        category: 'kontakte'
      },
      {
        id: 'crm-kontakthistorie',
        title: 'Kontakthistorie',
        description: 'Kontakthistorie und -protokoll',
        category: 'kontakte'
      },
      {
        id: 'crm-kontaktnotizen',
        title: 'Kontaktnotizen',
        description: 'Kontaktnotizen und -kommentare',
        category: 'kontakte'
      },
      {
        id: 'crm-kontaktberichte',
        title: 'Kontaktberichte',
        description: 'Kontaktberichte und -analysen',
        category: 'kontakte'
      },
      {
        id: 'crm-kontaktarchiv',
        title: 'Kontaktarchiv',
        description: 'Kontaktarchiv und -dokumentation',
        category: 'kontakte'
      },
      {
        id: 'crm-kontaktimport',
        title: 'Kontakt-Import',
        description: 'Kontakt-Daten importieren',
        category: 'kontakte'
      }
    ];

    // Angebote (6 fehlend)
    const angeboteForms = [
      {
        id: 'crm-angebotsvorlagen',
        title: 'Angebotsvorlagen',
        description: 'Angebotsvorlagen und -templates verwalten',
        category: 'angebote'
      },
      {
        id: 'crm-angebotspositionen',
        title: 'Angebotspositionen',
        description: 'Angebotspositionen und -details verwalten',
        category: 'angebote'
      },
      {
        id: 'crm-angebotshistorie',
        title: 'Angebotshistorie',
        description: 'Angebotshistorie und -änderungen',
        category: 'angebote'
      },
      {
        id: 'crm-angebotsberichte',
        title: 'Angebotsberichte',
        description: 'Angebotsberichte und -analysen',
        category: 'angebote'
      },
      {
        id: 'crm-angebotsarchiv',
        title: 'Angebotsarchiv',
        description: 'Angebotsarchiv und -dokumentation',
        category: 'angebote'
      },
      {
        id: 'crm-angebotsoptimierung',
        title: 'Angebotsoptimierung',
        description: 'Angebotsoptimierung und -analyse',
        category: 'angebote'
      }
    ];

    // Aufträge (8 fehlend)
    const auftraegeForms = [
      {
        id: 'crm-auftragsverwaltung',
        title: 'Auftragsverwaltung',
        description: 'Auftragsverwaltung und -organisation',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragspositionen',
        title: 'Auftragspositionen',
        description: 'Auftragspositionen und -details verwalten',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragshistorie',
        title: 'Auftragshistorie',
        description: 'Auftragshistorie und -änderungen',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragsberichte',
        title: 'Auftragsberichte',
        description: 'Auftragsberichte und -analysen',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragsarchiv',
        title: 'Auftragsarchiv',
        description: 'Auftragsarchiv und -dokumentation',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragsoptimierung',
        title: 'Auftragsoptimierung',
        description: 'Auftragsoptimierung und -analyse',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragsimport',
        title: 'Auftrags-Import',
        description: 'Auftrags-Daten importieren',
        category: 'auftraege'
      },
      {
        id: 'crm-auftragsexport',
        title: 'Auftrags-Export',
        description: 'Auftrags-Daten exportieren',
        category: 'auftraege'
      }
    ];

    // Alle CRM-Formulare zusammenfassen
    const allCRMForms = [
      ...kundenManagementForms,
      ...kontakteForms,
      ...angeboteForms,
      ...auftraegeForms
    ];

    // Formulare generieren
    allCRMForms.forEach(form => {
      missingForms.push(this.generateFormConfig(form, 'crm'));
    });

    return missingForms;
  }

  /**
   * Generiert alle fehlenden Cross-Cutting-Formulare
   */
  static generateMissingCrossCuttingForms(): StandardizedFormConfig[] {
    const missingForms: StandardizedFormConfig[] = [];

    // Benutzerverwaltung (8 fehlend)
    const benutzerverwaltungForms = [
      {
        id: 'crosscutting-benutzerprofile',
        title: 'Benutzerprofile',
        description: 'Benutzerprofile und -einstellungen verwalten',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzergruppen',
        title: 'Benutzergruppen',
        description: 'Benutzergruppen und -organisation verwalten',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzerhistorie',
        title: 'Benutzerhistorie',
        description: 'Benutzerhistorie und -aktivitäten',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzerberichte',
        title: 'Benutzerberichte',
        description: 'Benutzerberichte und -analysen',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzerarchiv',
        title: 'Benutzerarchiv',
        description: 'Benutzerarchiv und -dokumentation',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzerimport',
        title: 'Benutzer-Import',
        description: 'Benutzer-Daten importieren',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzerexport',
        title: 'Benutzer-Export',
        description: 'Benutzer-Daten exportieren',
        category: 'benutzerverwaltung'
      },
      {
        id: 'crosscutting-benutzeroptimierung',
        title: 'Benutzeroptimierung',
        description: 'Benutzeroptimierung und -analyse',
        category: 'benutzerverwaltung'
      }
    ];

    // Rollen & Berechtigungen (8 fehlend)
    const rollenBerechtigungenForms = [
      {
        id: 'crosscutting-rollenverwaltung',
        title: 'Rollenverwaltung',
        description: 'Rollenverwaltung und -organisation',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-berechtigungsmatrix',
        title: 'Berechtigungsmatrix',
        description: 'Berechtigungsmatrix und -zuordnung',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-zugriffskontrolle',
        title: 'Zugriffskontrolle',
        description: 'Zugriffskontrolle und -überwachung',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-rollenberichte',
        title: 'Rollenberichte',
        description: 'Rollenberichte und -analysen',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-rollenarchiv',
        title: 'Rollenarchiv',
        description: 'Rollenarchiv und -dokumentation',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-rollenimport',
        title: 'Rollen-Import',
        description: 'Rollen-Daten importieren',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-rollenexport',
        title: 'Rollen-Export',
        description: 'Rollen-Daten exportieren',
        category: 'rollen-berechtigungen'
      },
      {
        id: 'crosscutting-rollenoptimierung',
        title: 'Rollenoptimierung',
        description: 'Rollenoptimierung und -analyse',
        category: 'rollen-berechtigungen'
      }
    ];

    // Systemeinstellungen (6 fehlend)
    const systemeinstellungenForms = [
      {
        id: 'crosscutting-konfiguration',
        title: 'Konfiguration',
        description: 'Systemkonfiguration und -einstellungen',
        category: 'systemeinstellungen'
      },
      {
        id: 'crosscutting-parameter',
        title: 'Parameter',
        description: 'Systemparameter und -variablen',
        category: 'systemeinstellungen'
      },
      {
        id: 'crosscutting-systemlogs',
        title: 'Systemlogs',
        description: 'Systemlogs und -protokolle',
        category: 'systemeinstellungen'
      },
      {
        id: 'crosscutting-systemberichte',
        title: 'Systemberichte',
        description: 'Systemberichte und -analysen',
        category: 'systemeinstellungen'
      },
      {
        id: 'crosscutting-systemarchiv',
        title: 'Systemarchiv',
        description: 'Systemarchiv und -dokumentation',
        category: 'systemeinstellungen'
      },
      {
        id: 'crosscutting-systemoptimierung',
        title: 'Systemoptimierung',
        description: 'Systemoptimierung und -analyse',
        category: 'systemeinstellungen'
      }
    ];

    // Workflow-Engine (8 fehlend)
    const workflowEngineForms = [
      {
        id: 'crosscutting-workflow-designer',
        title: 'Workflow-Designer',
        description: 'Workflow-Designer und -editor',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-instances',
        title: 'Workflow-Instanzen',
        description: 'Workflow-Instanzen und -ausführung',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-historie',
        title: 'Workflow-Historie',
        description: 'Workflow-Historie und -protokoll',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-berichte',
        title: 'Workflow-Berichte',
        description: 'Workflow-Berichte und -analysen',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-archiv',
        title: 'Workflow-Archiv',
        description: 'Workflow-Archiv und -dokumentation',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-import',
        title: 'Workflow-Import',
        description: 'Workflow-Daten importieren',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-export',
        title: 'Workflow-Export',
        description: 'Workflow-Daten exportieren',
        category: 'workflow-engine'
      },
      {
        id: 'crosscutting-workflow-optimierung',
        title: 'Workflow-Optimierung',
        description: 'Workflow-Optimierung und -analyse',
        category: 'workflow-engine'
      }
    ];

    // Berichte & Analytics (8 fehlend)
    const berichteAnalyticsForms = [
      {
        id: 'crosscutting-berichtsgenerator',
        title: 'Berichtsgenerator',
        description: 'Berichtsgenerator und -erstellung',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-dashboard-designer',
        title: 'Dashboard-Designer',
        description: 'Dashboard-Designer und -layout',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-analytics-tools',
        title: 'Analytics-Tools',
        description: 'Analytics-Tools und -werkzeuge',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-berichtsarchiv',
        title: 'Berichtsarchiv',
        description: 'Berichtsarchiv und -dokumentation',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-berichtsimport',
        title: 'Berichts-Import',
        description: 'Berichts-Daten importieren',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-berichtsexport',
        title: 'Berichts-Export',
        description: 'Berichts-Daten exportieren',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-berichtsoptimierung',
        title: 'Berichtsoptimierung',
        description: 'Berichtsoptimierung und -analyse',
        category: 'berichte-analytics'
      },
      {
        id: 'crosscutting-analytics-optimierung',
        title: 'Analytics-Optimierung',
        description: 'Analytics-Optimierung und -analyse',
        category: 'berichte-analytics'
      }
    ];

    // Alle Cross-Cutting-Formulare zusammenfassen
    const allCrossCuttingForms = [
      ...benutzerverwaltungForms,
      ...rollenBerechtigungenForms,
      ...systemeinstellungenForms,
      ...workflowEngineForms,
      ...berichteAnalyticsForms
    ];

    // Formulare generieren
    allCrossCuttingForms.forEach(form => {
      missingForms.push(this.generateFormConfig(form, 'crosscutting'));
    });

    return missingForms;
  }

  /**
   * Generiert alle fehlenden Formulare
   */
  static generateAllMissingForms(): StandardizedFormConfig[] {
    return [
      ...this.generateMissingWaWiForms(),
      ...this.generateMissingFiBuForms(),
      ...this.generateMissingCRMForms(),
      ...this.generateMissingCrossCuttingForms()
    ];
  }

  /**
   * Generiert eine Formular-Konfiguration basierend auf Template
   */
  private static generateFormConfig(
    formData: { id: string; title: string; description: string; category: string },
    module: string
  ): StandardizedFormConfig {
    return {
      id: formData.id,
      metadata: {
        id: formData.id,
        name: formData.title,
        module: module,
        version: '1.0.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: formData.description || '',
        tags: [],
        dependencies: [],
        permissions: {
          super_admin: ['read', 'write', 'admin', 'delete'],
          admin: ['read', 'write', 'admin'],
          manager: ['read', 'write'],
          accountant: ['read'],
          warehouse: ['read'],
          sales: ['read', 'write'],
          viewer: ['read']
        }
      },
      fields: [],
      defaultValues: {},
      size: 'medium',
      features: {
        autoSave: true,
        autoSaveInterval: 30000,
        keyboardShortcuts: true,
        barcodeScanner: false,
        progressBar: true,
        conditionalFields: true,
        groupedFields: true,
        realTimeValidation: true,
        accessibility: true,
        mobileOptimized: true,
        offlineSupport: false,
        bulkOperations: true,
        printSupport: true,
        exportSupport: true
      },
      module: module,
      layout: this.getLayoutForCategory(formData.category, module),
      workflow: {
        steps: STANDARD_BELEGFOLGE.workflow,
        currentStep: 0,
        canEdit: true,
        canApprove: true,
        canReject: true
      },
      permissions: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canReject: true,
        canView: true
      },
      validationSchema: this.getValidationSchemaForCategory(formData.category)
    };
  }

  /**
   * Ermittelt das Layout für eine Kategorie
   */
  private static getLayoutForCategory(category: string, module: string): FormLayout {
    // Standard-Layout basierend auf Modul
    const templateKey = `${module}-${category.split('-')[0]}`;
    
    if (FORM_TEMPLATES[templateKey]) {
      return FORM_TEMPLATES[templateKey].layout;
    }

    // Fallback auf Standard-Template
    return FORM_TEMPLATES['wawi-artikel'].layout;
  }

  /**
   * Ermittelt Standard-Berechtigungen für ein Modul
   */
  private static getDefaultPermissions(module: string) {
    const basePermissions = {
      create: ['admin'],
      read: ['admin', 'warehouse', 'sales', 'accounting'],
      update: ['admin'],
      delete: ['admin']
    };

    // Modul-spezifische Anpassungen
    switch (module) {
      case 'warenwirtschaft':
        return {
          ...basePermissions,
          read: ['admin', 'warehouse', 'sales', 'accounting', 'logistics']
        };
      case 'finanzbuchhaltung':
        return {
          ...basePermissions,
          read: ['admin', 'accounting', 'management'],
          update: ['admin', 'accounting']
        };
      case 'crm':
        return {
          ...basePermissions,
          read: ['admin', 'sales', 'marketing', 'service'],
          update: ['admin', 'sales', 'marketing']
        };
      case 'crosscutting':
        return {
          ...basePermissions,
          read: ['admin'],
          update: ['admin']
        };
      default:
        return basePermissions;
    }
  }

  /**
   * Ermittelt Validierungsschema für eine Kategorie
   */
  private static getValidationSchemaForCategory(category: string) {
    // Standard-Validierungsschema
    return z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Name ist erforderlich'),
      description: z.string().optional(),
      status: z.string().optional(),
      created_at: z.date().optional(),
      updated_at: z.date().optional()
    });
  }
}

export default MissingFormsGenerator; 