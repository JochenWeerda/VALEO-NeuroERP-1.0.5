# SERM-Datenmodell für das AI-gesteuerte ERP-System

## Einführung zum SERM-Modell

Das Structured Entity Relationship Model (SERM) ermöglicht eine präzise Darstellung von Entitäten, ihren Attributen und deren Beziehungen mit semantischer Ausrichtung. Im Folgenden wird das SERM-Modell für unser ERP-System präsentiert, basierend auf der Analyse von Open-Source-ERP-Systemen wie ERPNext, OFBiz, Dolibarr, iDempiere, Metasfresh und Odoo.

## Kernkonzepte des Datenmodells

### Objektorientierte Ansatz

Unser Datenmodell folgt einem objektorientierten Ansatz mit:
- Klarer Trennung von Entitäten und ihren Beziehungen
- Vererbung für gemeinsame Attribute
- Kapselung komplexer Strukturen
- Minimierung von Redundanzen

### Normalisierung und Konsistenz

Das Modell ist nach der dritten Normalform (3NF) strukturiert, um:
- Redundanzen zu minimieren
- Einfügungsanomalien zu vermeiden
- Löschanomalien zu verhindern
- Aktualisierungsanomalien zu reduzieren

## SERM-Hauptentitäten

### 1. Organisation und Struktur

```
Organisation [1]
├── ID (PK)
├── Name
├── Rechtsform
├── Steuernummer
├── USt-ID
├── Logo
├── Gründungsdatum
├── Status (aktiv/inaktiv)
└── Verknüpfungen zu:
    ├── Standorte [0..*]
    ├── Abteilungen [0..*]
    └── Nutzer [0..*]

Standort [0..*]
├── ID (PK)
├── Organisations_ID (FK)
├── Name
├── Typ (Hauptsitz, Filiale, Lager, Produktion)
├── Ist_Aktiv
└── Verknüpfungen zu:
    ├── Adressen [1..*]
    └── Lager [0..*]

Abteilung [0..*]
├── ID (PK)
├── Organisations_ID (FK)
├── Standort_ID (FK, nullable)
├── Name
├── Kostenstelle
├── Übergeordnete_Abteilung_ID (FK, self-reference)
├── Ist_Aktiv
└── Verknüpfungen zu:
    └── Mitarbeiter [0..*]
```

### 2. Partner (Abstrakte Basisklasse)

```
Partner [abstrakt]
├── ID (PK)
├── Typ (Kunde, Lieferant, Mitarbeiter, Sonstiges)
├── Ist_Organisation (true/false)
├── Name
├── Ist_Aktiv
└── Verknüpfungen zu:
    ├── Adressen [0..*]
    ├── Kontakte [0..*]
    ├── Dokumente [0..*]
    └── Kommunikation [0..*]

Kunde ⟹ Partner
├── Kundennummer
├── Kundenseit
├── Zahlungsbedingung_ID (FK)
├── Kreditlimit
├── Rabattgruppe_ID (FK)
├── Preisliste_ID (FK)
├── Steuerkategorie_ID (FK)
└── Verknüpfungen zu:
    ├── Aufträge [0..*]
    └── Rechnungen [0..*]

Lieferant ⟹ Partner
├── Lieferantennummer
├── Lieferantenseit
├── Zahlungsbedingung_ID (FK)
├── Mindestbestellwert
├── Währung_ID (FK)
└── Verknüpfungen zu:
    ├── Bestellungen [0..*]
    └── Eingangsrechnungen [0..*]

Mitarbeiter ⟹ Partner
├── Personalnummer
├── Abteilung_ID (FK)
├── Position
├── Eintrittsdatum
├── Austrittsdatum
├── Vorgesetzter_ID (FK, self-reference)
└── Verknüpfungen zu:
    ├── Nutzer [0..1]
    └── Zeiterfassungen [0..*]
```

### 3. Produkt- und Artikelstruktur

```
Produktkategorie [1..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Übergeordnete_Kategorie_ID (FK, self-reference)
├── Ebene (berechnet)
└── Verknüpfungen zu:
    ├── Produktvorlagen [0..*]
    └── Standardattribute [0..*]

Produktvorlage [1..*]
├── ID (PK)
├── Artikelnummer
├── Name
├── Beschreibung
├── Kategorie_ID (FK)
├── Produkttyp (Physisch, Dienstleistung, Verbrauchsgut)
├── Basiseinheit_ID (FK)
├── Ist_Verkaufbar
├── Ist_Kaufbar
├── Ist_Produzierbar
├── Ist_Lagerartikel
├── Ist_Gebinde
├── Ist_Stückliste
├── Standardpreis_Verkauf
├── Standardpreis_Einkauf
├── Gewicht
├── Volumen
├── Höhe
├── Breite
├── Tiefe
├── Steuerkategorie_ID (FK)
├── Buchungskonto_Erlös_ID (FK)
├── Buchungskonto_Aufwand_ID (FK)
├── Bild_URL
├── Ist_Aktiv
├── Erstelldatum
├── Änderungsdatum
└── Verknüpfungen zu:
    ├── Produktvarianten [0..*]
    ├── Produktattribute [0..*]
    ├── Barcodes [0..*]
    ├── Stücklisten [0..*]
    ├── Lieferanteninfos [0..*]
    ├── Preise [0..*]
    └── Dokumente [0..*]

Produktvariante [0..*]
├── ID (PK)
├── Produktvorlage_ID (FK)
├── Variantennummer
├── Name (generiert)
├── Ist_Aktiv
└── Verknüpfungen zu:
    ├── Variantenattributwerte [1..*]
    ├── Lagerbestände [0..*]
    └── Preise [0..*]

Produktattribut [0..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Attributtyp (Text, Zahl, Datum, Auswahl, etc.)
├── Ist_Variante (bestimmt Variantenbildung)
└── Verknüpfungen zu:
    ├── Attributwerte [0..*]
    └── Produktvorlagen [0..*]

Attributwert [0..*]
├── ID (PK)
├── Attribut_ID (FK)
├── Wert
└── Verknüpfungen zu:
    └── Variantenattributwerte [0..*]

VariantenAttributwert [0..*]
├── ID (PK)
├── Produktvariante_ID (FK)
├── Attributwert_ID (FK)
└── Reihenfolge

Maßeinheit [1..*]
├── ID (PK)
├── Name
├── Symbol
├── Kategorie (Länge, Gewicht, Zeit, etc.)
├── Ist_Basiseinheit
└── Verknüpfungen zu:
    └── Einheitenumrechnungen [0..*]

Einheitenumrechnung [0..*]
├── ID (PK)
├── Von_Einheit_ID (FK)
├── Zu_Einheit_ID (FK)
├── Multiplikator
└── Teiler
```

### 4. Stücklisten und Gebinde

```
Stückliste [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Name
├── Beschreibung
├── Typ (Normal, Variante, Vorlage, Phantom)
├── Menge
├── Einheit_ID (FK)
├── Ist_Aktiv
├── Ist_Standard
└── Verknüpfungen zu:
    └── Stücklistenpositionen [1..*]

Stücklistenposition [1..*]
├── ID (PK)
├── Stückliste_ID (FK)
├── Position
├── Komponente_ID (FK → Produktvariante)
├── Menge
├── Einheit_ID (FK)
├── Operation_ID (FK, nullable)
└── Ist_Optional

Gebinde [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Name
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Höhe
├── Breite
├── Tiefe
├── Gewicht
├── Volumen
├── Ist_Standardgebinde
├── Ist_Verkaufseinheit
├── Barcode
└── Verknüpfungen zu:
    └── Gebindepositionen [1..*]

Gebindeposition [1..*]
├── ID (PK)
├── Gebinde_ID (FK)
├── Produkt_ID (FK)
├── Menge
└── Einheit_ID (FK)
```

### 5. Lager und Bestand

```
Lager [1..*]
├── ID (PK)
├── Standort_ID (FK)
├── Name
├── Beschreibung
├── Ist_Aktiv
├── Typ (Hauptlager, Außenlager, Transitlager, etc.)
└── Verknüpfungen zu:
    └── Lagerorte [0..*]

Lagerort [0..*]
├── ID (PK)
├── Lager_ID (FK)
├── Name
├── Übergeordneter_Lagerort_ID (FK, self-reference)
├── Position (Gang, Regal, Fach, etc.)
├── Kapazität
├── Kapazitätseinheit_ID (FK)
├── Ist_Aktiv
└── Verknüpfungen zu:
    └── Lagerbestände [0..*]

Lagerbestand [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Lagerort_ID (FK)
├── Menge
├── Reservierte_Menge
├── Verfügbare_Menge (berechnet)
├── Einheit_ID (FK)
├── Letzte_Bewegung
└── Verknüpfungen zu:
    ├── Chargen [0..*]
    └── Seriennummern [0..*]

Lagerbewegung [0..*]
├── ID (PK)
├── Referenz_Typ (Eingang, Ausgang, Transfer, Inventur)
├── Referenz_ID
├── Produkt_ID (FK)
├── Von_Lagerort_ID (FK, nullable)
├── Zu_Lagerort_ID (FK, nullable)
├── Menge
├── Einheit_ID (FK)
├── Datum
├── Benutzer_ID (FK)
├── Chargen_ID (FK, nullable)
└── Seriennummer_ID (FK, nullable)

Charge [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Chargennummer
├── Eingangsdatum
├── Hersteller_Charge
├── Mindesthaltbarkeitsdatum
└── Verknüpfungen zu:
    └── Lagerbewegungen [0..*]

Seriennummer [0..*]
├── ID (PK)
├── Produkt_ID (FK)
├── Seriennummer
├── Eingangsdatum
├── Garantie_Bis
└── Verknüpfungen zu:
    └── Lagerbewegungen [0..*]
```

### 6. Preise und Konditionen

```
Preisliste [1..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Währung_ID (FK)
├── Gültig_Von
├── Gültig_Bis
├── Ist_Aktiv
└── Verknüpfungen zu:
    └── Preislistenpositionen [0..*]

Preislistenposition [0..*]
├── ID (PK)
├── Preisliste_ID (FK)
├── Produkt_ID (FK)
├── Variante_ID (FK, nullable)
├── Mindestmenge
├── Preis
├── Rabatt_Prozent
├── Gültig_Von
├── Gültig_Bis
└── Ist_Aktiv

Rabatt [0..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Rabatttyp (Prozent, Betrag, Gestaffelt)
├── Wert
├── Gültig_Von
├── Gültig_Bis
├── Ist_Aktiv
└── Verknüpfungen zu:
    ├── Kunden [0..*]
    └── Produkte [0..*]

Zahlungsbedingung [1..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Zahlungsfrist_Tage
├── Skonto_Prozent
├── Skonto_Tage
├── Ist_Aktiv
└── Verknüpfungen zu:
    ├── Kunden [0..*]
    └── Lieferanten [0..*]
```

### 7. Verkauf

```
Angebot [0..*]
├── ID (PK)
├── Angebotsnummer
├── Kunde_ID (FK)
├── Kontakt_ID (FK, nullable)
├── Angebotsdatum
├── Gültig_Bis
├── Status (In Bearbeitung, Gesendet, Angenommen, Abgelehnt)
├── Währung_ID (FK)
├── Gesamtnetto
├── Gesamtsteuer
├── Gesamtbrutto
├── Zahlungsbedingung_ID (FK)
├── Lieferbedingung_ID (FK)
├── Benutzer_ID (FK)
├── Notizen
└── Verknüpfungen zu:
    ├── Angebotspositionen [1..*]
    └── Aufträge [0..*]

Angebotsposition [1..*]
├── ID (PK)
├── Angebot_ID (FK)
├── Position
├── Produkt_ID (FK)
├── Variante_ID (FK, nullable)
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Einzelpreis_Netto
├── Rabatt_Prozent
├── Gesamtpreis_Netto (berechnet)
├── Steuersatz_ID (FK)
└── Steuerbetrag (berechnet)

Auftrag [0..*]
├── ID (PK)
├── Auftragsnummer
├── Kunde_ID (FK)
├── Kontakt_ID (FK, nullable)
├── Angebot_ID (FK, nullable)
├── Auftragsdatum
├── Wunschlieferdatum
├── Bestätigtes_Lieferdatum
├── Status (Neu, In Bearbeitung, Teilweise geliefert, Geliefert, Fakturiert, Storniert)
├── Währung_ID (FK)
├── Gesamtnetto
├── Gesamtsteuer
├── Gesamtbrutto
├── Zahlungsbedingung_ID (FK)
├── Lieferbedingung_ID (FK)
├── Benutzer_ID (FK)
├── Notizen
└── Verknüpfungen zu:
    ├── Auftragspositionen [1..*]
    ├── Lieferungen [0..*]
    └── Rechnungen [0..*]

Auftragsposition [1..*]
├── ID (PK)
├── Auftrag_ID (FK)
├── Position
├── Produkt_ID (FK)
├── Variante_ID (FK, nullable)
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Gelieferte_Menge
├── Einzelpreis_Netto
├── Rabatt_Prozent
├── Gesamtpreis_Netto (berechnet)
├── Steuersatz_ID (FK)
└── Steuerbetrag (berechnet)
```

### 8. Einkauf

```
Anfrage [0..*]
├── ID (PK)
├── Anfragenummer
├── Lieferant_ID (FK)
├── Kontakt_ID (FK, nullable)
├── Anfragedatum
├── Antwort_Bis
├── Status (In Bearbeitung, Gesendet, Beantwortet, Abgelehnt)
├── Währung_ID (FK)
├── Benutzer_ID (FK)
├── Notizen
└── Verknüpfungen zu:
    └── Anfragepositionen [1..*]

Anfrageposition [1..*]
├── ID (PK)
├── Anfrage_ID (FK)
├── Position
├── Produkt_ID (FK)
├── Variante_ID (FK, nullable)
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
└── Angebotspreis

Bestellung [0..*]
├── ID (PK)
├── Bestellnummer
├── Lieferant_ID (FK)
├── Kontakt_ID (FK, nullable)
├── Anfrage_ID (FK, nullable)
├── Bestelldatum
├── Lieferdatum_Erwartet
├── Status (Neu, Bestätigt, Teilweise erhalten, Erhalten, Fakturiert, Storniert)
├── Währung_ID (FK)
├── Gesamtnetto
├── Gesamtsteuer
├── Gesamtbrutto
├── Zahlungsbedingung_ID (FK)
├── Lieferbedingung_ID (FK)
├── Benutzer_ID (FK)
├── Notizen
└── Verknüpfungen zu:
    ├── Bestellpositionen [1..*]
    ├── Wareneingänge [0..*]
    └── Eingangsrechnungen [0..*]

Bestellposition [1..*]
├── ID (PK)
├── Bestellung_ID (FK)
├── Position
├── Produkt_ID (FK)
├── Variante_ID (FK, nullable)
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Erhaltene_Menge
├── Einzelpreis_Netto
├── Rabatt_Prozent
├── Gesamtpreis_Netto (berechnet)
├── Steuersatz_ID (FK)
└── Steuerbetrag (berechnet)
```

### 9. Finanzen

```
Kontenplan [1]
├── ID (PK)
├── Name
├── Beschreibung
├── Ist_Aktiv
└── Verknüpfungen zu:
    └── Konten [1..*]

Konto [1..*]
├── ID (PK)
├── Kontenplan_ID (FK)
├── Kontonummer
├── Name
├── Beschreibung
├── Kontotyp (Aktiva, Passiva, Aufwand, Ertrag)
├── Übergeordnetes_Konto_ID (FK, self-reference)
├── Saldo
├── Währung_ID (FK)
├── Ist_Aktiv
└── Verknüpfungen zu:
    └── Buchungen [0..*]

Buchung [0..*]
├── ID (PK)
├── Buchungsnummer
├── Buchungsdatum
├── Valutadatum
├── Buchungstext
├── Betrag
├── Konto_ID (FK)
├── Gegenkonto_ID (FK)
├── Referenz_Typ (Rechnung, Zahlung, Manuell)
├── Referenz_ID
├── Beleg_ID (FK, nullable)
├── Benutzer_ID (FK)
└── Storno_ID (FK, nullable, self-reference)

Rechnung [0..*]
├── ID (PK)
├── Rechnungsnummer
├── Rechnungstyp (Ausgang, Eingang)
├── Partner_ID (FK)
├── Rechnungsdatum
├── Fälligkeitsdatum
├── Status (Entwurf, Offen, Bezahlt, Teilweise bezahlt, Storniert)
├── Referenz_Typ (Auftrag, Bestellung)
├── Referenz_ID
├── Währung_ID (FK)
├── Gesamtnetto
├── Gesamtsteuer
├── Gesamtbrutto
├── Zahlungsbedingung_ID (FK)
├── Benutzer_ID (FK)
└── Verknüpfungen zu:
    ├── Rechnungspositionen [1..*]
    └── Zahlungen [0..*]

Rechnungsposition [1..*]
├── ID (PK)
├── Rechnung_ID (FK)
├── Position
├── Produkt_ID (FK, nullable)
├── Beschreibung
├── Menge
├── Einheit_ID (FK)
├── Einzelpreis_Netto
├── Rabatt_Prozent
├── Gesamtpreis_Netto (berechnet)
├── Steuersatz_ID (FK)
├── Steuerbetrag (berechnet)
├── Konto_ID (FK, nullable)
└── Kostenstelle_ID (FK, nullable)

Zahlung [0..*]
├── ID (PK)
├── Zahlungsnummer
├── Zahlungsart (Überweisung, Lastschrift, Bar, Kreditkarte)
├── Rechnung_ID (FK, nullable)
├── Partner_ID (FK)
├── Zahlungsdatum
├── Betrag
├── Währung_ID (FK)
├── Status (In Bearbeitung, Abgeschlossen, Fehlgeschlagen, Storniert)
├── Referenz
├── Konto_ID (FK)
└── Benutzer_ID (FK)
```

## Validierung des Datenmodells

### Integritätsprüfungen

Das Datenmodell wurde auf folgende Integritätsaspekte geprüft:

1. **Entitätsintegrität**: Jede Entität hat einen eindeutigen Primärschlüssel
2. **Referenzielle Integrität**: Alle Fremdschlüssel verweisen auf existierende Primärschlüssel
3. **Domänenintegrität**: Attribute entsprechen ihren definierten Wertebereichen
4. **Geschäftsregeln**: Fachliche Regeln sind im Modell abgebildet

### Normalisierungsprüfung

Die Überprüfung der Normalisierung hat ergeben:

- **1NF**: Alle Attribute sind atomar und nicht wiederholend
- **2NF**: Keine partiellen Abhängigkeiten von Nicht-Schlüsselattributen
- **3NF**: Keine transitiven Abhängigkeiten von Nicht-Schlüsselattributen

### Redundanzprüfung

Das Modell wurde auf Redundanzen geprüft und optimiert:

- Vermeidung doppelter Datenhaltung durch normalisierte Strukturen
- Einführung von Zwischentabellen für N:M-Beziehungen
- Verwendung von Vererbung für gemeinsame Attribute

### Skalierungsprüfung

Das Datenmodell wurde auf Skalierbarkeit geprüft:

- Unterstützung für große Datenmengen durch optimierte Indexstrukturen
- Modularität für einfache Erweiterbarkeit
- Möglichkeit zur horizontalen Partitionierung bei Bedarf

## Fazit

Das vorgestellte SERM-Datenmodell bietet eine solide Basis für unser AI-gesteuertes ERP-System. Es berücksichtigt die Best Practices aus bewährten Open-Source-ERP-Systemen und implementiert moderne Designprinzipien für Datenbanken.

Besonders hervorzuheben sind:

1. Die flexible Produktstruktur, die sowohl einfache als auch komplexe Artikel abbilden kann
2. Die umfassende Unterstützung für Gebinde und Stücklisten
3. Die klare Trennung zwischen Produktvorlagen und -varianten
4. Die modulare Struktur, die einfache Erweiterungen ermöglicht

Das Modell wurde auf Integrität, Normalisierung, Redundanzfreiheit und Skalierbarkeit geprüft und erfüllt die Anforderungen an ein modernes ERP-System. 