# Archiv: CPD-Konten-Stammdaten-Modul

## Überblick

Das CPD-Konten-Stammdaten-Modul erweitert das ERP-System um die Verwaltung von Kreditor-Stammdaten im CPD-Format. Es bietet eine umfassende Oberfläche zur Erfassung, Bearbeitung und Verwaltung von Kundendaten mit besonderem Fokus auf Zahlungsbedingungen und Konteninformationen.

## XML-Definition

Das Modul basiert auf der folgenden XML-Definition für das CPD_Kreditor-Schema:

```xml
<StammdatenModul name="CPD_Kreditor" version="1.0">
  <Bereich name="Allgemein">
    <Feld name="Kunden-Nr" typ="string"/>
    <Feld name="Debitoren-Konto" typ="string"/>
    <Feld name="Suchbegriff" typ="string"/>
    <Feld name="Erstanlage" typ="datum"/>
  </Bereich>
  <Bereich name="Rechnungsadresse">
    <Feld name="Kunden-Name" typ="string"/>
    <Feld name="Name2" typ="string"/>
    <Feld name="Branche" typ="string"/>
    <Feld name="Straße" typ="string"/>
    <Feld name="Land" typ="string"/>
    <Feld name="PLZ" typ="string"/>
    <Feld name="Ort" typ="string"/>
    <Feld name="Postfach" typ="string"/>
    <Feld name="Telefon1" typ="string"/>
    <Feld name="Telefon2" typ="string"/>
    <Feld name="Telefax" typ="string"/>
    <Feld name="Anrede" typ="string"/>
    <Feld name="Brief-Anrede" typ="string"/>
    <Feld name="E-Mail" typ="string"/>
    <Feld name="Internet-Homepage" typ="string"/>
  </Bereich>
  <Bereich name="Organisation">
    <Feld name="Geschäftsstelle" typ="string"/>
    <Feld name="Kostenstelle" typ="string"/>
    <Feld name="Rechnungsart" typ="string"/>
    <Feld name="Sammelrechnung" typ="string"/>
    <Feld name="Rechnungsformular" typ="string"/>
    <Feld name="VB" typ="string"/>
    <Feld name="Gebiet" typ="string"/>
  </Bereich>
  <Bereich name="Zahlungsbedingungen">
    <Feld name="Zahlungsziel1_Tage" typ="integer"/>
    <Feld name="Skonto1_Prozent" typ="float"/>
    <Feld name="Zahlungsziel2_Tage" typ="integer"/>
    <Feld name="Skonto2_Prozent" typ="float"/>
    <Feld name="Netto_Tage" typ="integer"/>
  </Bereich>
</StammdatenModul>
```

## Implementierte Features

Das CPD-Konten-Modul bietet folgende Funktionen:

1. **Listenansicht der CPD-Konten**
   - Tabellarische Darstellung aller CPD-Konten
   - Suchfunktion über mehrere Felder
   - Sortier- und Filtermöglichkeiten
   - Schnellzugriff auf Bearbeitung und Detailansicht

2. **Erstellen und Bearbeiten von CPD-Konten**
   - Tab-basiertes Formular für übersichtliche Dateneingabe
   - Validierung der Eingaben
   - Unterstützung für alle Felder des XML-Schemas

3. **Import und Export**
   - CSV-Import-Funktion für Massendatenimport
   - CSV-Export-Funktion für Datenextrahierung und Reporting

4. **Integration in das Gesamtsystem**
   - Nahtlose Einbindung in die Navigation
   - Konsistentes Design im Einklang mit anderen Modulen
   - Verknüpfung mit dem Kundenstammdaten-Modul

## Frontend-Komponenten

1. **CPDAccountsList** - Komponente für die Listenansicht der CPD-Konten
2. **CPDAccountForm** - Formular-Komponente zum Erstellen und Bearbeiten von CPD-Konten
3. **CPDAccountsListPage** - Container-Seite für die Liste
4. **CPDAccountForm** - Container-Seite für das Formular

## Zukünftige Erweiterungen

- Integration mit der Finanzbuchhaltung
- Erweitertes Reporting und Statistiken
- Automatische Synchronisierung mit externen Systemen
- Verbessertes Berechtigungskonzept für den Zugriff

## Technische Dokumentation

### Datenbankschema

Die CPD-Konten werden in der Datenbank in folgenden Tabellen gespeichert:

- `cpd_accounts` - Haupttabelle für die Kontendaten
- `cpd_account_payment_terms` - Zahlungsbedingungen pro Konto
- `cpd_account_history` - Änderungshistorie

### API-Endpunkte

Für die Kommunikation mit dem Backend werden folgende API-Endpunkte verwendet:

- `GET /api/v1/cpd-konten` - Liste aller CPD-Konten abrufen
- `GET /api/v1/cpd-konten/{id}` - Details eines bestimmten CPD-Kontos abrufen
- `POST /api/v1/cpd-konten` - Neues CPD-Konto erstellen
- `PUT /api/v1/cpd-konten/{id}` - Bestehendes CPD-Konto aktualisieren
- `DELETE /api/v1/cpd-konten/{id}` - CPD-Konto löschen
- `POST /api/v1/cpd-konten/import-csv` - CSV-Daten importieren
- `GET /api/v1/cpd-konten/export-csv` - Daten als CSV exportieren

## Schulungsmaterial

- Grundlegende Handhabung des CPD-Konten-Moduls
- Erklärung der Felder und deren Bedeutung
- Best Practices für die Datenverwaltung
- Beispiele für CSV-Import/Export 