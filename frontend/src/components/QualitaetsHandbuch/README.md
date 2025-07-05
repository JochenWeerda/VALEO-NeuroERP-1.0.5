# QS-Funktionen für Handel, Transport, Lagerung und mobile Mahl- und Mischanlagen

## Überblick

Dieses Modul enthält die QS-Funktionen für das integrierte Qualitätsmanagement des ERP-Systems. Es unterstützt die Anforderungen gemäß QS-Leitfaden Futtermittelwirtschaft für die Bereiche Handel, Transport, Lagerung und mobile Mahl- und Mischanlagen.

## Komponenten

### QualitaetsHandbuch.tsx
Zentrales QS-Handbuch mit QS-Maßnahmen, Dokumenten und Grundlagen zum Qualitätsmanagement.

### QualitaetsMerkblatt.tsx
Anzeige und Druck der QS-Merkblätter, z.B. "Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen".

### QSChecklisten.tsx
Interaktive Checklisten für die verschiedenen QS-Bereiche:
- Handel
- Transport
- Lagerung
- Mobile Mahl- und Mischanlagen

### QSInspektionen.tsx
Verwaltung regelmäßiger QS-Inspektionen mit Terminplanung und Benachrichtigungsfunktion.

## Nutzung

### QS-Checklisten verwenden

1. **Zugriff auf Checklisten:**
   - Über das Dashboard: "QS-Funktionen" > "QS-Checklisten"
   - Über das QS-Handbuch: "QS-Handbuch" > "QS-Checklisten"
   - Über die bereichsspezifischen Kacheln (Handel, Transport, etc.)

2. **Checkliste ausfüllen:**
   - Bereich über die Tabs auswählen (Handel, Transport, Lagerung, Mahl- und Mischanlagen)
   - Datum und zuständigen Mitarbeiter auswählen
   - Prüfpunkte mit "OK", "Nicht OK" oder "Nicht zutreffend" bewerten
   - Bei "Nicht OK" Kommentar zur Begründung hinzufügen
   - Bei Bedarf allgemeine Bemerkungen am Ende eintragen

3. **Checkliste verarbeiten:**
   - **Drucken:** Mit "Drucken" kann die Checkliste ausgedruckt werden
   - **Speichern:** Mit "Speichern" wird die Checkliste im System gespeichert
   - **Senden:** Mit "An Mitarbeiter senden" kann die Checkliste an einen Mitarbeiter gesendet werden

### QS-Inspektionen verwalten

1. **Zugriff auf Inspektionen:**
   - Über das Dashboard: "QS-Funktionen" > "QS-Inspektionen und Terminplanung"
   - Über das QS-Handbuch: "QS-Handbuch" > "QS-Inspektionen und Terminplanung"

2. **Neue Inspektion anlegen:**
   - "Neue Inspektion" klicken
   - Titel und Beschreibung eingeben
   - Bereich auswählen (Handel, Transport, Lagerung, Mahl- und Mischanlagen)
   - Intervall festlegen (täglich, wöchentlich, monatlich, etc.)
   - Nächstes Datum auswählen
   - Verantwortlichen Mitarbeiter zuweisen
   - Checklisten-Typ auswählen
   - Status setzen und speichern

3. **Inspektionen verwalten:**
   - Übersicht zeigt alle anstehenden Inspektionen
   - Status farblich gekennzeichnet (ausstehend, fällig, erledigt, überfällig)
   - Bearbeiten, Löschen oder Status ändern über Aktionsbuttons
   - "Checkliste senden" sendet die entsprechende Checkliste an den verantwortlichen Mitarbeiter

### Mobile Nutzung

1. **Checklisten auf mobilen Geräten:**
   - Mitarbeiter erhalten Benachrichtigungen auf ihrem mobilen Gerät
   - Checklisten können auf dem Handy/Tablet ausgefüllt werden
   - Unterschrift direkt auf dem Touchscreen möglich
   - Ergebnisse werden nach Abschluss automatisch ins System übertragen

## Tipps

- **Kritische Prüfpunkte:** Mit (K) gekennzeichnete Punkte sind kritisch und erfordern besondere Aufmerksamkeit
- **Pflichtfelder:** Mit * gekennzeichnete Felder müssen ausgefüllt werden
- **Regelmäßige Inspektionen:** Prüfen Sie regelmäßig das Dashboard auf fällige oder überfällige Inspektionen
- **Kommentare:** Dokumentieren Sie bei Abweichungen immer die getroffenen Korrekturmaßnahmen

## Fehlerbehebung

- **Checkliste kann nicht gesendet werden:** Prüfen Sie, ob ein Mitarbeiter ausgewählt wurde
- **Inspektion erscheint nicht:** Prüfen Sie die Filtereinstellungen in der Inspektionsübersicht
- **Druckprobleme:** Stellen Sie sicher, dass ein Drucker konfiguriert ist oder speichern Sie als PDF 