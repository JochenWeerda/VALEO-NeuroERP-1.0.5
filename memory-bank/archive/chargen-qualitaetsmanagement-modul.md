# Chargen-Qualitätsmanagement-Modul

## Überblick

Das Chargen-Qualitätsmanagement-Modul erweitert das ERP-System um umfassende Funktionen zur Qualitätskontrolle und -dokumentation für Chargen, mit besonderem Fokus auf landwirtschaftliche Anforderungen wie Raps-Anlieferungen und die entsprechenden Qualitätsnachweise. Es wurde speziell auf die Bedürfnisse von landwirtschaftlichen Betrieben zugeschnitten und umfasst sowohl allgemeine Qualitätsprüfungen als auch spezifische Nachhaltigkeits- und Dokumentationsanforderungen.

## Hauptfunktionen

### 1. Qualitätsprüfungen für Chargen

- Erstellung, Bearbeitung und Verwaltung von Qualitätsprüfungen
- Flexible Prüfvorlagen mit konfigurierbaren Parametern
- Statusverwaltung (offen, in Bearbeitung, abgeschlossen, freigegeben, gesperrt)
- Automatische Konformitätsprüfung basierend auf definierten Grenzwerten
- Export- und Druckfunktionen für Prüfberichte

### 2. Raps-Anlieferungen Management

- Übersicht aller Raps-Anlieferungen mit Nachhaltigkeitsstatus
- Filterung nach Lieferanten, PLZ und Prüfungsstatus
- Detailansichten zu Lieferanten und deren Anlieferungen
- Dokumenten-Upload-Funktion für Nachweise
- CSV-Export der Anlieferungsdaten

### 3. Dokumentenmanagement

- **Qualitätsvereinbarungen**: Erstellung und Verwaltung von Qualitätsvereinbarungen für Lieferanten
- **Nachhaltigkeitserklärungen**: Verwaltung von REDcert-Nachhaltigkeitserklärungen
- **Sortenschutzerklärungen**: Dokumentation sortenschutzrechtlicher Erklärungen

### 4. Landwirtschaftsspezifische Attribute

- VLOG/GVO-Status-Verwaltung
- QS-Milch-Relevanzprüfung
- EUDR-Konformitätsprüfung (Entwaldungsfreiheit)
- Nachhaltigkeitszertifizierung für Raps
- Landnutzungskonformität (Stichtag 2008)

### 5. Integration mit ERP-System

- Nahtlose Integration in die Navigation des ERP-Systems
- Verknüpfung mit Chargen-Übersichtsseiten
- Zugriff über Breadcrumb-Navigation
- Responsive Design für Desktop- und Mobilgeräte

## Datenmodell

Das Modul erweitert das bestehende Datenmodell um folgende Hauptkomponenten:

### QualitaetsParameter
Parameter für Qualitätsprüfungen mit Kategorien, Einheiten und Grenzwerten.

### QualitaetsVorlage
Vorlagen für Qualitätsprüfungen mit zugeordneten Parametern.

### QualitaetsPruefung
Konkrete Qualitätsprüfungen für Chargen mit Prüfergebnissen.

### ChargeErweitert
Erweiterte Chargeninformationen mit zusätzlichen Qualitätsattributen:
- GVO_Status
- QS_Milch_relevant
- EUDR_Konform
- Nachhaltig_Raps_relevant
- Landnutzungs_Konformitaet

### LieferantStammdaten
Lieferanteninformationen inklusive Qualitäts- und Nachhaltigkeitsdokumenten.

### RapsAnlieferung
Spezifische Informationen zu Raps-Anlieferungen mit Nachhaltigkeitsstatus.

## Komponenten

1. **ChargenQualitaetsmanagement.tsx**: Hauptkomponente mit Tabs für alle Funktionalitäten
2. **RapsAnlieferungenUebersicht.tsx**: Anzeige und Verwaltung der Raps-Anlieferungen
3. **QualitaetsVereinbarungManager.tsx**: Formular und Dokumentenverwaltung für Qualitätsvereinbarungen
4. **NachhaltigkeitsErklaerungManager.tsx**: Formular und Dokumentenverwaltung für Nachhaltigkeitserklärungen
5. **ChargenQualitaetPage.tsx**: Container-Seite zur Integration in das ERP-System

## API-Services

Die Komponenten verwenden den `qualitaetsApi.ts` Service für alle CRUD-Operationen:

```typescript
// Beispiel API-Aufrufe
getAllPruefungen()
getPruefungById(id)
createPruefung(pruefung)
updatePruefung(id, pruefung)
changePruefungStatus(id, status)
deletePruefung(id)
exportPruefungenToCsv(filter)

getAllVorlagen()
getVorlageById(id)
createVorlage(vorlage)
updateVorlage(id, vorlage)
toggleVorlageStatus(id)

getAllParameter()
getParameterById(id)
createParameter(parameter)
updateParameter(id, parameter)

// Neue API-Funktionen für landwirtschaftliche Anforderungen
getRapsAnlieferungen(erntejahr)
getRapsAnlieferungByLieferant(lieferantId, erntejahr)
updateRapsAnlieferung(id, anlieferung)
exportRapsAnlieferungenAlsCSV(erntejahr)

getLieferantStammdaten(id)
updateLieferantStammdaten(id, lieferant)

uploadDokument(chargenId, file, dokumentTyp)
getDokumente(chargenId)
deleteDokument(dokumentId)
```

## Erweiterungsmöglichkeiten

Das Modul wurde mit Blick auf Erweiterbarkeit entwickelt und kann zukünftig um folgende Funktionen ergänzt werden:

1. **Automatische Chargen-ID-Generierung**: Flexible Konfiguration der Chargen-ID-Generierung basierend auf benutzerdefinierten Regeln

2. **Erweiterte QS-Attribute**:
   - Spezifische QS-Milch-Anforderungen
   - VLOG-Zertifizierungsnachweise
   - Zusätzliche Nachhaltigkeitsattribute

3. **Workflow-Integration**:
   - Automatische Benachrichtigungen bei Qualitätsproblemen
   - Eskalation bei fehlenden Dokumenten
   - Genehmigungsworkflows für Chargenfreigaben

4. **Erweiterte Berichtsfunktionen**:
   - Qualitätstrend-Analysen
   - Lieferantenvergleiche
   - Nachhaltigkeitsberichte
   - Konformitätsstatistiken

5. **Mobile App-Integration**:
   - Barcode/QR-Code-Scanning für Chargen
   - Mobiles Dokumenten-Upload
   - Offline-Prüfungen

## Installation und Konfiguration

1. Stelle sicher, dass alle Komponenten im entsprechenden Verzeichnis vorhanden sind:
   - `frontend/src/components/Qualitaet/`
   - `frontend/src/pages/chargen/`
   - `frontend/src/services/`

2. Aktualisiere die Routing-Konfiguration, um die neue Seite einzubinden:
   ```typescript
   <Route path="/chargen/qualitaet" element={<ChargenQualitaetPage />} />
   <Route path="/chargen/qualitaet/:tab" element={<ChargenQualitaetPage />} />
   <Route path="/chargen/qualitaet/:tab/:lieferantId" element={<ChargenQualitaetPage />} />
   ```

3. Füge einen Navigations-Link zur Hauptnavigation hinzu

4. Konfiguriere die API-Endpunkte in der `api.ts` oder `.env`-Datei

## Fazit

Das Chargen-Qualitätsmanagement-Modul bietet eine umfassende Lösung für die Qualitätssicherung und Dokumentation im Bereich der landwirtschaftlichen Produktion. Es unterstützt Unternehmen dabei, gesetzliche Anforderungen zu erfüllen, Qualitätsstandards sicherzustellen und Nachhaltigkeitsnachweise effizient zu verwalten. 