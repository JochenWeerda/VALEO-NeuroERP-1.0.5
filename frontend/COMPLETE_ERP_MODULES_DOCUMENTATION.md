# Vollständige ERP-Module Dokumentation

## 📦 Modul: Bestellvorschlag / Bestellung / Lieferantenstamm

### 🧾 Kopfbereich
- **Artikel-Gruppe** - Dropdown/Auswahlfeld
- **Niederlassung** - Textfeld/Auswahlfeld
- **Artikel-Nr.** - Textfeld (Primärschlüssel)
- **Bezeichnung 1** - Textfeld (Hauptbezeichnung)
- **Bezeichnung 2** - Textfeld (Zusatzbezeichnung)
- **Lagerfach** - Textfeld
- **Matchcode** - Textfeld (Suchcode)
- **2. Matchcode** - Textfeld (Zusatzsuchcode)
- **akt. Bestand** - Zahlenfeld (aktueller Lagerbestand)
- **Min.-Bestand** - Zahlenfeld (Mindestbestand)
- **Max.-Bestand** - Zahlenfeld (Maximalbestand)
- **Verkauf** - Zahlenfeld (Verkaufsmenge)
- **Vorschlag** - Zahlenfeld (Bestellmenge)

### 📊 Tabelle (Bestellvorschlagsliste)
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| Lager | Text | Lagerbezeichnung |
| Artikel-Nr. | Text | Artikelnummer |
| Bezeichnung | Text | Artikelbezeichnung (z.B. ÄPFEL MANGOLD, KERNOBST) |
| Bestand | Zahl | Aktueller Bestand |
| Min.-Best. | Zahl | Mindestbestand |
| Max.-Best. | Zahl | Maximalbestand |
| Verkauf | Zahl | Verkaufsmenge |
| Vorschlag | Zahl | Bestellvorschlag |
| Einkauf | Zahl | Einkaufsmenge |
| Matchcode | Text | Suchcode |

---

## 🛒 Modul: Bestellung erstellen

### 🧾 Kopfbereich
- **Kreditor-Konto-Nr.** - Textfeld (Lieferantenkonto)
- **Niederlassung** - Auswahlfeld
- **Kostenträger** - Textfeld
- **Kommission** - Textfeld
- **Lieferant** - Textfeld/Auswahlfeld
- **spät. Liefer-Datum** - Datumsfeld
- **Lade-Termin bis** - Datumsfeld
- **Lade-Datum** - Datumsfeld
- **Bestell-Nr.** - Textfeld (automatisch generiert)
- **Bestell-Datum** - Datumsfeld
- **Bediener** - Textfeld (Benutzer)
- **Erledigt** - Checkbox

### 📌 Registerkarten
1. **Positionen** - Bestellpositionen
2. **Anfrage / Angebot / Auftrag** - Referenzdokumente
3. **Zahlungsbedingungen** - Zahlungsmodalitäten
4. **Zusätzliche Angaben** - Ergänzende Informationen

### 📊 Tabellenfelder (Positionen)
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| Pos | Zahl | Positionsnummer |
| Artikel-Nr. | Text | Artikelnummer |
| Lieferant | Text | Lieferantenbezeichnung |
| Bezeichnung | Text | Artikelbezeichnung |
| Menge | Zahl | Bestellmenge |
| Geb.-Menge | Zahl | Gebindemenge |
| Geb.-Einheit | Text | Gebindeeinheit |
| Bestand | Zahl | Aktueller Bestand |
| Menge | Zahl | Bestellmenge |
| Preis | Zahl | Einzelpreis |
| Kontrakt | Text | Kontraktnummer |

---

## 📬 Modul: Lieferanten-Angebot

### 🧾 Kopfbereich
- **Kreditor-Konto-Nr.** - Textfeld
- **Lieferant** - Textfeld/Auswahlfeld
- **Lieferanten-Stamm** - Textfeld
- **spät. Liefer-Datum** - Datumsfeld
- **Lade-Termin bis** - Datumsfeld
- **Lade-Datum** - Datumsfeld
- **Anfrage-Nr.** - Textfeld
- **Anfrage-Datum** - Datumsfeld
- **Bediener** - Textfeld
- **Erledigt** - Checkbox

### 📌 Eingabefelder
- **Ansprech-Partner: Name** - Textfeld
- **Ansprech-Partner: Brief-Anrede** - Textfeld
- **Angebots-Nr. Lieferant** - Textfeld
- **Auftrags-Nr. Lieferant** - Textfeld
- **Angebots-Datum** - Datumsfeld
- **Auftrags-Datum** - Datumsfeld
- **Text 1: Kommissions-Name** - Textfeld
- **Text 2: Bsp. Liefertermin** - Textfeld

---

## 📦 Modul: Anfrage

### 🧾 Kopfbereich (identisch zu Lieferanten-Angebot)
- **Kreditor-Nr.** - Textfeld
- **Niederlassung** - Auswahlfeld
- **Lieferanten-Stamm** - Textfeld
- **Liefer-Datum** - Datumsfeld
- **Lade-Termin** - Datumsfeld
- **Lade-Datum** - Datumsfeld
- **Anfrage-Nr.** - Textfeld
- **Anfrage-Datum** - Datumsfeld
- **Bediener** - Textfeld
- **Erledigt** - Checkbox

### 📊 Positionsbereich
Identische Struktur wie Lieferanten-Angebot

---

## 📦 Modul: Lieferschein-Erfassung

### 🧾 Kopfbereich
- **Lieferschein-Nr.** - Textfeld
- **Datum** - Datumsfeld
- **Uhrzeit** - Zeitfeld
- **Kunden-Nr.** - Textfeld
- **Lieferanschrift** - Textfeld
- **Rechnungsanschrift** - Textfeld
- **Debitor-Nr.** - Textfeld
- **fakturierte Rechnung-Nr.** - Textfeld
- **Re.-Nr. (Bezug)** - Textfeld
- **Selbstabholung** - Checkbox
- **Fremdfirma** - Checkbox
- **Rücklieferung** - Checkbox
- **Frei-Haus** - Checkbox
- **Info** - Checkbox
- **Gedruckt** - Checkbox
- **Fakturiert** - Checkbox

### 📊 Positionsliste
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| Pos | Zahl | Positionsnummer |
| Artikel-Nr. | Text | Artikelnummer |
| Bezeichnung | Text | Artikelbezeichnung |
| Menge | Zahl | Liefermenge |
| Einheit | Text | Mengeneinheit |
| Rabatt | Zahl | Rabattbetrag |
| Rabatt in % | Zahl | Rabattprozentsatz |
| Netto-Preis | Zahl | Nettoeinzelpreis |
| Netto-Betrag | Zahl | Nettogesamtbetrag |
| Serien-Nr. | Text | Seriennummer |
| Lagerhalle | Text | Lagerhallenbezeichnung |
| Lagerfach | Text | Lagerfachbezeichnung |

---

## 📩 Modul: Auftragsbestätigung

### 🧾 Kopfbereich
- **Auftrags-Nr.** - Textfeld
- **Datum** - Datumsfeld
- **Kunden-Nr.** - Textfeld
- **Debitor-Nr.** - Textfeld
- **Status** - Auswahlfeld
- **Telefonkontakt** - Textfeld
- **Kreditlimit** - Zahlenfeld
- **Niederlassung** - Auswahlfeld
- **erledigt** - Checkbox

### 📂 Seitenregister & Navigationsbaum

#### Allgemein
- Grundlegende Kundendaten
- Kontaktinformationen
- Adressdaten

#### Angebot / Auftrag
- Angebotsdaten
- Auftragsdaten
- Konditionen

#### Rechnung / Zahlungsbedingung
- Rechnungsdaten
- Zahlungsbedingungen
- Zahlungsziele

#### Technik
- Technische Spezifikationen
- Produktdetails
- Qualitätsanforderungen

#### Lieferung / Verpackung / Paletten
- Lieferbedingungen
- Verpackungsanforderungen
- Palettierungsdaten

#### Belegdaten
- Dokumentenverwaltung
- Belegnummern
- Referenzen

#### Ansprechpartner 1-3
- **Ansprechpartner 1:**
  - Name
  - Telefon
  - E-Mail
  - Funktion
- **Ansprechpartner 2:**
  - Name
  - Telefon
  - E-Mail
  - Funktion
- **Ansprechpartner 3:**
  - Name
  - Telefon
  - E-Mail
  - Funktion

#### Vertreter 1-2
- **Vertreter 1:**
  - Name
  - Telefon
  - E-Mail
  - Gebiet
- **Vertreter 2:**
  - Name
  - Telefon
  - E-Mail
  - Gebiet

#### Kunden-Stamm-Zuordnung
- Kundengruppen
- Branchenzuordnung
- Vertriebsgebiete

---

## 📩 Modul: Angebot

### 🧾 Kopfbereich
- **Angebots-Nr.** - Textfeld
- **Datum** - Datumsfeld
- **Kunden-Nr.** - Textfeld
- **Debitor-Nr.** - Textfeld
- **Status** - Auswahlfeld
- **Telefonkontakt** - Textfeld
- **Kreditlimit** - Zahlenfeld
- **Niederlassung** - Auswahlfeld
- **erledigt** - Checkbox

### 📂 Navigationsbaum und Felder
Identische Struktur wie Auftragsbestätigung

---

## ⚙️ Buttons und Funktionen (sichtbar in allen Modulen)

### 🖨️ Druckfunktionen
- **Drucken** - Dokument drucken
- **Unterlagen** - Zusatzunterlagen drucken
- **Dateien** - Dateien verwalten

### 🗑️ Löschfunktionen
- **Position löschen** - Einzelne Position entfernen
- **Bestellung löschen** - Komplette Bestellung löschen

### 📋 Erstellungsfunktionen
- **Anfrage erstellen** - Neue Anfrage anlegen
- **Angebot erfassen** - Neues Angebot erstellen
- **Lieferschein** - Lieferschein generieren
- **Frachtauftrag** - Frachtauftrag erstellen

### 🔄 Aktionsfunktionen
- **Zurücksetzen** - Änderungen verwerfen
- **Erledigt** - Status auf erledigt setzen
- **OK** - Bestätigen
- **Abbrechen** - Abbrechen
- **Übernehmen** - Änderungen übernehmen

### 📊 Summenfunktionen
- **Summe anzeigen** - Gesamtsummen berechnen
- **Summe Gewicht (kg)** - Gesamtgewicht anzeigen
- **EUR-Felder** - Währungsbeträge (Netto, Brutto, etc.)

---

## 🎯 Modulübergreifende Funktionen

### 🔍 Suchfunktionen
- **Matchcode-Suche** - Artikel über Suchcode finden
- **Artikel-Nr.-Suche** - Direkte Artikelsuche
- **Lieferanten-Suche** - Lieferanten finden
- **Kunden-Suche** - Kundendaten suchen

### 📋 Listenfunktionen
- **Bestellvorschlagsliste** - Automatische Bestellvorschläge
- **Positionslisten** - Artikelpositionen verwalten
- **Kontaktlisten** - Ansprechpartner verwalten

### 🔐 Berechtigungen
- **Bediener** - Benutzerzuordnung
- **Niederlassung** - Standortzuordnung
- **Status** - Dokumentenstatus

### 📅 Zeitfunktionen
- **Datum** - Dokumentendatum
- **Uhrzeit** - Zeitstempel
- **Liefer-Datum** - Liefertermin
- **Lade-Termin** - Ladezeitpunkt

### 💰 Finanzfunktionen
- **Preise** - Einzelpreise
- **Rabatte** - Preisnachlässe
- **Summen** - Gesamtbeträge
- **Währung** - EUR-Beträge 