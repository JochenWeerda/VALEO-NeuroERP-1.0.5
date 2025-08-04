# VALERO-Module Dokumentation

## Übersicht
Diese Dokumentation beschreibt alle UI-Felder und sichtbaren Funktionen der VALERO-Module für die Integration in VALEO NeuroERP.

## Modul: Lieferschein

### Felder oben
- **Lieferschein-Nr.** - Eindeutige Identifikation des Lieferscheins
- **Lieferschein-Datum** - Datum der Lieferscheinerstellung
- **Niederlassung** - Auswahl der Niederlassung
- **Lieferant** - Auswahl des Lieferanten
- **Zahlungsbedingung** - Zahlungsbedingungen für die Lieferung
- **Texte** - Freitext-Felder für zusätzliche Informationen
- **Zwischenhändler** - Option für Zwischenhändler
- **wie vom LS (F11)** - Funktionstaste für Lieferschein-Vorlage
- **Lieferanten-Stamm** - Zugriff auf Lieferanten-Stammdaten
- **Liefer-Termin** - Geplanter Liefertermin
- **Lieferdatum** - Tatsächliches Lieferdatum
- **Liefer-Nr.** - Liefernummer des Lieferanten
- **Bediener** - Verantwortlicher Benutzer
- **Erledigt** - Status der Bearbeitung

### Positionsbereich
- **Pos-Nr.** - Positionsnummer
- **Artikel-Nr.** - Artikelnummer
- **Lieferant-Artikel-Nr.** - Artikelnummer des Lieferanten
- **Bezeichnung** - Artikelbezeichnung
- **Gebinde-Nr.** - Gebindenummer
- **Gebinde** - Gebindeart
- **Menge** - Liefermenge
- **Einheit** - Mengeneinheit
- **Einzelpreis** - Preis pro Einheit
- **Nettobetrag** - Nettobetrag der Position
- **Lagerhalle** - Ziel-Lagerhalle
- **Lagerfach** - Ziel-Lagerfach
- **Chargen** - Chargeninformationen
- **Serien-Nr.** - Seriennummern
- **Kontakt** - Kontaktinformationen
- **Prozent** - Prozentuale Angaben
- **Master-Nr.** - Master-Artikelnummer

### Fußbereich
- **Verfügbarer Bestand** - Aktueller Lagerbestand
- **Summe Gewicht** - Gesamtgewicht der Lieferung
- **Positionsdetails** - Detaillierte Positionsinformationen
- **MWSt** - Mehrwertsteuer
- **Einzelpreis (brutto/netto)** - Preisangaben
- **Positionsbetrag** - Betrag der Position
- **Lagerhalle** - Lagerhallen-Zuordnung
- **Lagerfach** - Lagerfach-Zuordnung
- **Ch.-/Serien-Nr.** - Chargen- und Seriennummern
- **Zielgebinde** - Zielgebinde-Informationen
- **Kontrolle** - Kontrollfunktionen
- **Identifiziert** - Identifikationsstatus
- **Doppelpfeil** - Funktion für Duplikation

### Buttons
- **Aktualisieren** - Daten aktualisieren
- **Daten** - Datenfunktionen
- **Lieferungen löschen** - Lieferungen entfernen
- **Lieferungen drucken** - Druckfunktion
- **Schließen** - Modul schließen

## Modul: Frachtausgang

### Felder
- **Frachtauftrag erzeugt** - Status des Frachtauftrags
- **Niederlassung** - Auswahl der Niederlassung
- **Liefertermin** - Geplanter Liefertermin
- **Spediteur-Nr.** - Spediteurnummer
- **E-Mail, Telefon** - Kontaktdaten
- **Spediteur-Name** - Name des Spediteurs
- **Belegnummer** - Eindeutige Belegnummer
- **Lade-Datum** - Ladedatum
- **Kundenauswahl** - Auswahl des Kunden

## Modul: Bestellung

### Felder
- **Niederlassung** - Auswahl der Niederlassung
- **Artikelgruppe** - Artikelgruppen-Zuordnung
- **Artikelnummer** - Eindeutige Artikelnummer
- **Lagerhalle** - Lagerhallen-Zuordnung
- **Lagerfach** - Lagerfach-Zuordnung
- **Bezeichnung** - Artikelbezeichnung
- **Bestand** - Aktueller Lagerbestand
- **Mindestbestand** - Mindestbestand
- **Vorschlag** - Bestellvorschlag
- **Matchcode** - Suchcode
- **Lieferant** - Auswahl des Lieferanten
- **Restmenge** - Verbleibende Menge
- **Einheitspreis** - Preis pro Einheit
- **Nettobetrag** - Nettobetrag
- **Datum** - Bestelldatum
- **Bestellwert** - Gesamtwert der Bestellung

### Vorschläge
- **Neue Lieferung erzeugen** - Lieferung erstellen
- **Kontakt anzeigen** - Kontaktdaten anzeigen
- **Kontakt Umsatz** - Umsatzdaten des Kontakts
- **Vorschlag übernehmen** - Vorschlag akzeptieren
- **Position löschen** - Position entfernen

## Modul: Kommissionsauftrag drucken

### Felder
- **Rechnungsnummer** - Eindeutige Rechnungsnummer
- **Rechnungsdatum** - Datum der Rechnung
- **Lieferscheinnummer** - Lieferschein-Referenz
- **Lieferdatum** - Lieferdatum
- **Debitor** - Debitor-Informationen
- **Kundenname** - Name des Kunden
- **Artikelnummer** - Artikelnummer
- **Bezeichnung** - Artikelbezeichnung
- **Gebindeinhalt** - Inhalt des Gebindes
- **Einheit** - Mengeneinheit
- **Einzelpreis** - Preis pro Einheit

### Summen
- **Artikelnummer** - Gruppierung nach Artikel
- **Anzahl** - Stückzahl
- **Gebindeinhalt** - Gesamtinhalt
- **Bezeichnung** - Artikelbezeichnung
- **Tonnen** - Gewicht in Tonnen

### Buttons
- **Drucker einrichten** - Drucker konfigurieren
- **Wiederholungsdruck** - Erneuter Druck
- **OK, drucken** - Druck bestätigen
- **Ausgabe in Datei** - PDF-Export
- **Abbrechen** - Vorgang abbrechen

## Modul: Betriebsauftrag drucken

### Felder
- **Auftrags-Nr. von/bis** - Auftragsnummern-Bereich
- **Nur Aufträge mit gepl. Lieferdatum** - Filteroption
- **Auftragsliste** - Liste mit Kundenname, Lieferdatum, Liefer-KW, Druckauswahl

### Buttons
- **Drucker einrichten** - Drucker konfigurieren
- **Vorschau** - Druckvorschau
- **Drucken** - Druck starten
- **Schließen** - Modul schließen

## Modul: Versandavis

### Felder
- **Kundennummer** - Eindeutige Kundennummer
- **Kundenname** - Name des Kunden
- **letzte Avis-Datum** - Datum des letzten Avis
- **Intervall** - Versandintervall
- **Auftrags-Nr.** - Auftragsnummer
- **Lieferschein-Nr.** - Lieferschein-Referenz
- **Lade-Datum** - Ladedatum
- **Drucken** - Druckstatus

### Information
- **Kein Versandavis zu drucken** - Statusmeldung

### Buttons
- **Drucker einrichten** - Drucker konfigurieren
- **Drucken** - Druck starten
- **Vorschau** - Druckvorschau
- **alle angezeigten JA/NEIN** - Massenauswahl

## Modul: Paketetiketten drucken

### Felder
- **Lieferschein-Nr.** - Lieferschein-Referenz
- **Formular** - Etikettenformular
- **Anzahl Packstücke** - Anzahl der Packstücke
- **Kundenanschrift** - Lieferanschrift

### Versandarten
- **WARNSENDUNG** - Warnsendung
- **DPD** - DPD Versand
- **JET** - Express-Versand

### Buttons
- **Drucker einrichten** - Drucker konfigurieren
- **Drucken** - Druck starten
- **Stamm Etiketten** - Etiketten-Stammdaten
- **Schließen** - Modul schließen

## Modul: Frachtpapier drucken

### Felder
- **Lieferschein-Nr.** - Lieferschein-Referenz
- **Kundenname** - Name des Kunden
- **Dokument** - Dokumenttyp
- **Formular** - Druckformular
- **Druckdatum** - Datum des Drucks
- **Druckanzahl** - Anzahl der Drucke

### Buttons
- **Drucker einrichten** - Drucker konfigurieren
- **Drucken** - Druck starten
- **Vorschau** - Druckvorschau

## Modul: Produktionsdokumente drucken

### Felder
- **Auftragsnummer** - Eindeutige Auftragsnummer
- **Kundenname** - Name des Kunden
- **Lieferscheinnummer** - Lieferschein-Referenz
- **Dokumentart** - Art des Dokuments
- **Formular** - Druckformular
- **Druckdatum** - Datum des Drucks
- **Anzahl Drucke** - Anzahl der Drucke
- **Kopietext ab** - Kopietext-Option

### Dokumentarten
- **Produktionsauftrag** - Produktionsauftrag
- **Verladeauftrag** - Verladeauftrag
- **Versandavis** - Versandavis
- **Pro-Forma-Lieferschein** - Pro-Forma-Lieferschein
- **Pro-Forma-Rechnung** - Pro-Forma-Rechnung
- **Zollrechnung** - Zollrechnung

### Checkboxen
- **Druck Allgemeine Angaben** - Allgemeine Informationen drucken
- **Druck Wegbeschreibung** - Wegbeschreibung drucken
- **Druck Lade-Information** - Ladeinformationen drucken

### Buttons
- **Drucken** - Druck starten
- **Vorschau** - Druckvorschau
- **Schließen** - Modul schließen

## Integration in VALEO NeuroERP

### Technische Umsetzung
- **Frontend:** React/TypeScript mit Material-UI
- **Backend:** FastAPI mit Python
- **Datenbank:** PostgreSQL
- **Druck:** PDF-Generierung mit ReportLab
- **API:** RESTful APIs für alle Module

### Sicherheit
- **Authentifizierung:** JWT-Token
- **Autorisierung:** Rollenbasierte Zugriffe
- **Audit-Log:** Vollständige Protokollierung
- **Datenverschlüsselung:** AES-256

### Performance
- **Caching:** Redis für häufig abgerufene Daten
- **Lazy Loading:** On-Demand Datenladung
- **Pagination:** Seitweise Datenanzeige
- **Optimistic Updates:** Sofortige UI-Updates 