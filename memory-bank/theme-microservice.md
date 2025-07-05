# Theme-Microservice: Implementierungsplan

## 1. Übersicht

Der Theme-Microservice wird als erster Schritt der Microservice-Architektur implementiert. Er ist verantwortlich für die Verwaltung des Erscheinungsbildes der Anwendung und bietet eine REST-API für die Interaktion mit dem Frontend.

## 2. Architektur

### 2.1 Komponenten

#### Backend (Port 5001)
- Eigenständiger Express.js-Server
- REST-API für Theme-Verwaltung
- Datenbank-Anbindung für Theme-Persistenz
- Zustandslose Implementierung für horizontale Skalierung

#### Frontend-Integration
- Theme Context Provider als unabhängige Komponente
- Kommunikation mit dem Theme-Service über HTTP-Client
- Caching von Theme-Einstellungen im lokalen Speicher

### 2.2 API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|-------------|
| `/themes` | GET | Liste aller verfügbaren Themes |
| `/themes/current` | GET | Aktuelles Theme des Benutzers abrufen |
| `/themes/current` | PUT | Aktuelles Theme des Benutzers aktualisieren |
| `/themes/{themeId}` | GET | Details eines spezifischen Themes |
| `/themes/variants` | GET | Liste verfügbarer Theme-Varianten |
| `/themes/modes` | GET | Liste verfügbarer Theme-Modi |

### 2.3 Datenmodell

```typescript
interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  variant: ThemeVariant;
  parameters: ThemeParameters;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ThemeMode = 'light' | 'dark' | 'high-contrast';

type ThemeVariant = 'odoo' | 'default' | 'modern' | 'classic';

interface ThemeParameters {
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

interface UserThemePreference {
  userId: string;
  themeId: string;
  overrides: Partial<ThemeParameters>;
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. Implementierungsschritte

### 3.1 Extraktion des Theme-Services

1. **Erstellen der Basis-Projektstruktur**
   ```bash
   mkdir -p services/theme-service/{src,tests,config}
   cd services/theme-service
   npm init -y
   npm install express cors mongodb mongoose dotenv winston
   npm install --save-dev typescript ts-node nodemon jest @types/express @types/jest
   ```

2. **TypeScript-Konfiguration**
   - tsconfig.json erstellen
   - Typdefinitionen für Theme-Service erstellen

3. **Express-Server implementieren**
   - Server-Grundgerüst
   - Middleware-Integration (CORS, Logging, Error Handling)
   - Routing für Theme-API

4. **MongoDB-Integration**
   - Mongoose-Schemas für Themes und Benutzer-Präferenzen
   - Repository-Klassen für Datenzugriff

5. **Theme-Service-Logik**
   - Theme-Generator für Standard-Varianten
   - Theme-Validator
   - Benutzer-spezifische Theme-Überschreibungen

### 3.2 Frontend-Integration

1. **Theme-Provider-Komponente anpassen**
   - API-Client für Theme-Service integrieren
   - Local Storage für Caching nutzen
   - Verbindung zum Theme-Service herstellen

2. **Bestehende Komponenten anpassen**
   - Header-Theme-Dialog aktualisieren
   - Theme-Demo modifizieren für Service-Nutzung
   - Kommunikation über Event-Bus

### 3.3 Deployment-Konfiguration

1. **Docker-Setup**
   - Dockerfile für Theme-Service
   - Docker-Compose für Entwicklungsumgebung

2. **CI/CD-Pipeline**
   - GitHub Actions Workflow für Tests
   - Automatisierte Builds

## 4. Testplan

### 4.1 Unit-Tests
- Theme-Generierung
- Validierungslogik
- Repository-Funktionen

### 4.2 Integrationstests
- API-Endpunkte
- Datenbank-Interaktionen

### 4.3 Frontend-Tests
- Theme-Provider-Funktionalität
- Komponenten mit Theme-Integration

## 5. Fallback-Strategie

- Offline-Modus mit gespeichertem Theme
- Degradation zu Standard-Theme bei Service-Ausfall
- Circuit-Breaker-Muster für robuste Integration

## 6. Zeitplan

| Phase | Aufgabe | Zeit |
|-------|---------|------|
| Vorbereitung | Projektstruktur & Setup | 1 Tag |
| Backend | Core-Service-Implementierung | 3 Tage |
| Backend | API-Endpunkte & Tests | 2 Tage |
| Frontend | Theme-Provider-Integration | 2 Tage |
| Frontend | Komponenten-Anpassung | 1 Tag |
| Deployment | Docker & CI/CD | 1 Tag |
| Tests & Bugfixing | End-to-End-Tests | 2 Tage |

**Gesamtdauer: 12 Arbeitstage** 