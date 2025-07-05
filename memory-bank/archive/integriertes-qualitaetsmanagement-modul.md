# Integriertes Qualitätsmanagement-Modul

## Überblick

Das Integrierte Qualitätsmanagement-Modul erweitert das ERP-System um umfassende Funktionen zur Qualitätskontrolle, -dokumentation und -verbesserung. Es verbindet das Chargen-Qualitätsmanagement mit einem lebenden QS-Handbuch und erfüllt damit sowohl operative als auch strategische Anforderungen an ein modernes Qualitätsmanagement. Das Modul wurde speziell auf die Bedürfnisse landwirtschaftlicher Betriebe zugeschnitten und umfasst neben allgemeinen Qualitätsprüfungen auch spezifische Nachhaltigkeits- und Dokumentationsanforderungen.

## Hauptfunktionen

### 1. Operatives Chargen-Qualitätsmanagement

- **Qualitätsprüfungen**: Erstellung, Bearbeitung und Verwaltung von Qualitätsprüfungen für Chargen
- **Prüfvorlagen**: Flexible Vorlagen mit konfigurierbaren Parametern
- **Raps-Anlieferungen Management**: Übersicht, Filterung und Dokumenten-Upload für Raps-Anlieferungen
- **Dokumentenmanagement**: Verwaltung von Qualitätsvereinbarungen und Nachhaltigkeitserklärungen
- **Landwirtschaftsspezifische Attribute**: VLOG/GVO-Status, QS-Milch, EUDR-Konformität, Nachhaltigkeitszertifizierung

### 2. Strategisches QS-Handbuch

- **QS-Maßnahmen**: Dokumentation und Nachverfolgung aller qualitätssichernden Maßnahmen und Prozesse
- **Prozessverbesserung**: Kontinuierliche Dokumentation und Anpassung der betrieblichen Prozesse
- **Prüfhistorie**: Lückenlose Dokumentation aller durchgeführten Qualitätsprüfungen
- **Richtlinien-Dokumentation**: Integration von Qualitätsrichtlinien wie dem Merkblatt "Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen"
- **Reflexion**: Systematische Analyse und Verbesserung der Qualitätsprozesse

### 3. Integration mit ERP-System

- Nahtlose Einbindung in die Navigation des ERP-Systems
- Verknüpfung mit Chargen- und Lieferantenstammdaten
- Responsive Design für Desktop- und Mobilgeräte

## Komponenten

### Frontend-Komponenten

1. **IntegriertesQualitaetsmodul.tsx**: Hauptkomponente, die alle Funktionalitäten integriert
2. **QualitaetsHandbuch.tsx**: Komponente für das QS-Handbuch mit Maßnahmen, Dokumenten und Historien
3. **QualitaetsMerkblatt.tsx**: Anzeige- und Druckkomponente für das QS-Merkblatt
4. **RapsAnlieferungenUebersicht.tsx**: Anzeige und Verwaltung der Raps-Anlieferungen
5. **QualitaetsVereinbarungManager.tsx**: Formular und Dokumentenverwaltung für Qualitätsvereinbarungen
6. **NachhaltigkeitsErklaerungManager.tsx**: Formular und Dokumentenverwaltung für Nachhaltigkeitserklärungen
7. **ChargenQualitaetPage.tsx**: Container-Seite zur Integration in das ERP-System

### Datenmodell

Das Modul erweitert das bestehende Datenmodell um folgende Hauptkomponenten:

#### Chargen-Qualitätsmanagement
- **QualitaetsParameter**: Parameter für Qualitätsprüfungen mit Kategorien, Einheiten und Grenzwerten
- **QualitaetsVorlage**: Vorlagen für Qualitätsprüfungen mit zugeordneten Parametern
- **QualitaetsPruefung**: Konkrete Qualitätsprüfungen für Chargen mit Prüfergebnissen
- **ChargeErweitert**: Erweiterte Chargeninformationen mit zusätzlichen Qualitätsattributen
- **LieferantStammdaten**: Lieferanteninformationen inklusive Qualitäts- und Nachhaltigkeitsdokumenten
- **RapsAnlieferung**: Spezifische Informationen zu Raps-Anlieferungen mit Nachhaltigkeitsstatus
- **Dokument**: Dokumenteninformationen für hochgeladene Dateien

#### QS-Handbuch
- **QSMassnahme**: Maßnahmen zur Qualitätssicherung mit Status, Verantwortlichkeiten und Prüfintervallen
- **QSDokument**: Verwaltung von QS-relevanten Dokumenten mit Versionshistorie
- **QSPruefhistorie**: Historische Aufzeichnungen aller durchgeführten Qualitätsprüfungen

## Funktionsweise

### 1. Dashboard

Das zentrale Dashboard bietet einen Überblick über alle wichtigen Qualitätsaspekte:
- Aktuelle Qualitätsprüfungen
- Raps-Anlieferungen des aktuellen Erntejahres
- Zugang zum QS-Handbuch
- Schnellzugriff auf wichtige Dokumente

### 2. QS-Handbuch

Das QS-Handbuch dient als lebendiges Dokument zur kontinuierlichen Qualitätsverbesserung:
- Dokumentation aller QS-Maßnahmen mit Status und Verantwortlichkeiten
- Verwaltung aller qualitätsrelevanten Dokumente
- Nachverfolgung der Prüfhistorie
- Integration der Qualitätsrichtlinien wie "Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen"

### 3. Qualitätsprüfungen und -dokumentation

Alle Aspekte der Qualitätsprüfung werden integriert verwaltet:
- Erstellung und Durchführung von Qualitätsprüfungen basierend auf definierten Vorlagen
- Verwaltung der Raps-Anlieferungen mit Nachhaltigkeitsstatus
- Erstellung und Verwaltung von Qualitätsvereinbarungen und Nachhaltigkeitserklärungen

## Qualitätsverbesserungsprozess

Das Modul unterstützt einen kontinuierlichen Qualitätsverbesserungsprozess:

1. **Planung**: Definition von QS-Maßnahmen und Prüfvorlagen
2. **Durchführung**: Operative Qualitätsprüfung von Chargen und Dokumentation
3. **Kontrolle**: Auswertung der Prüfhistorie und Identifikation von Verbesserungspotentialen
4. **Optimierung**: Anpassung der QS-Maßnahmen und Prozesse basierend auf den Erkenntnissen

Dieser PDCA-Zyklus (Plan-Do-Check-Act) wird durch die Integration von operativem Chargen-Qualitätsmanagement und strategischem QS-Handbuch optimal unterstützt.

## Qualitätsrichtlinien

Das Modul integriert wichtige Qualitätsrichtlinien für den landwirtschaftlichen Bereich, darunter:

- **Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen**:
  - Anbau: Minimierung unerwünschter Stoffe, Mykotoxinprävention
  - Ernte: Vermeidung von Fremdbesatz und Verunreinigungen
  - Transport: Sauberkeit der Transportmittel, Vermeidung von Kontamination
  - Lagerung: Baulicher Zustand, Feuchtigkeitsschutz, Temperaturüberwachung

- **Nachhaltigkeitsanforderungen**:
  - GVO-Status und VLOG-Konformität
  - EUDR-Konformität (Entwaldungsfreiheit)
  - REDcert-Nachhaltigkeitszertifizierung
  - Landnutzungskonformität (Stichtag 2008)

## Erweiterungsmöglichkeiten

Das Modul wurde mit Blick auf Erweiterbarkeit entwickelt und kann zukünftig um folgende Funktionen ergänzt werden:

1. **Automatisierte Qualitätsberichte**:
   - Regelmäßige Auswertung der Qualitätsdaten
   - Trendanalysen und Vorhersagemodelle
   - Automatische Benachrichtigungen bei Abweichungen

2. **Integration von IoT-Daten**:
   - Anbindung von Sensoren zur kontinuierlichen Qualitätsmessung
   - Echtzeit-Überwachung der Lagerungsbedingungen
   - Automatische Protokollierung der Messwerte

3. **Erweiterte Nachhaltigkeitsmodule**:
   - CO2-Bilanzierung
   - Wasserfußabdruck
   - Biodiversitätsbewertung

4. **KI-gestützte Qualitätsprognosen**:
   - Vorhersage von Qualitätsrisiken
   - Optimierung von Lagerungs- und Transportbedingungen
   - Automatische Erkennung von Anomalien

## Installation und Konfiguration

1. Stelle sicher, dass alle Komponenten in den entsprechenden Verzeichnissen vorhanden sind:
   - `frontend/src/components/Qualitaet/`
   - `frontend/src/components/QualitaetsHandbuch/`
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

Das Integrierte Qualitätsmanagement-Modul bietet eine umfassende Lösung, die sowohl das operative Chargen-Qualitätsmanagement als auch die strategische Qualitätsverbesserung durch ein lebendes QS-Handbuch unterstützt. Es ermöglicht landwirtschaftlichen Betrieben, alle Qualitätsaspekte zentral zu verwalten, gesetzliche Anforderungen zu erfüllen und kontinuierlich an der Verbesserung ihrer Prozesse zu arbeiten. Durch die Integration beider Ansätze wird ein geschlossener Qualitätskreislauf geschaffen, der sowohl die tägliche Qualitätssicherung als auch die langfristige Prozessoptimierung unterstützt. 