# VALEO-NeuroERP Frontend

Dies ist das Frontend für das VALEO-NeuroERP System. Es bietet eine moderne und benutzerfreundliche Oberfläche für die Verwaltung und Überwachung von Compliance-Anforderungen.

## Features

- **Chargenvalidierung**: Validierung von Chargen gegen QS-, GMP- und EU-Standards
- **Echtzeit-Monitoring**: Überwachung von Qualitätsparametern in Echtzeit
- **Alert-Management**: Konfigurierbare Alerts und Benachrichtigungen
- **Compliance-Statistiken**: Visualisierung und Analyse von Compliance-Daten

## Technologie-Stack

- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- React Hook Form
- Recharts
- Axios

## Installation

1. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```

2. Starten Sie die Entwicklungsumgebung:
   ```bash
   npm start
   ```

3. Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

## Entwicklung

### Verfügbare Skripte

- `npm start`: Startet den Entwicklungsserver
- `npm test`: Führt Tests aus
- `npm run build`: Erstellt eine Produktionsversion
- `npm run lint`: Führt ESLint-Prüfungen durch
- `npm run lint:fix`: Behebt automatisch behebbare ESLint-Probleme
- `npm run format`: Formatiert den Code mit Prettier
- `npm run type-check`: Führt TypeScript-Typprüfungen durch

### Code-Struktur

```
src/
├── components/         # React-Komponenten
│   └── compliance/    # Compliance-spezifische Komponenten
├── layouts/           # Layout-Komponenten
├── routes/           # Routing-Konfiguration
├── services/         # API-Services
├── types/            # TypeScript-Typdefinitionen
└── theme.ts          # MUI Theme-Konfiguration
```

### Compliance-Module

#### ComplianceValidation
- Formular für die Validierung von Chargen
- Unterstützung für QS-, GMP- und EU-Standards
- Digitale Signatur und Audit-Trail

#### BatchMonitoring
- Echtzeit-Überwachung von Qualitätsparametern
- Konfigurierbare Grenzwerte
- Automatische Alerts bei Abweichungen

#### AlertManagement
- Verwaltung von Alert-Einstellungen
- Benachrichtigungssystem
- Alert-Historie und -Auflösung

#### ComplianceStatistics
- Visualisierung von Compliance-Daten
- Trendanalysen
- Exportfunktionen

## Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## Lizenz

Proprietär - Alle Rechte vorbehalten
