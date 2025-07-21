# VALEO NeuroERP 2.0
## Trust-basiertes, KI-gesteuertes ERP-System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC.svg)](https://tailwindcss.com/)

### 🎯 Projektübersicht

VALEO NeuroERP 2.0 ist ein revolutionäres ERP-System, das **Vertrauenswürdigkeit** und **Transparenz** in den Mittelpunkt stellt. Das System kombiniert moderne Web-Technologien mit KI-gesteuerten Agenten und einem einzigartigen Trust-System, das Benutzer bei jeder Entscheidung unterstützt.

#### 🌟 Kernfeatures

- **🤖 KI-gesteuerte Agenten**: LangGraph-basierte Agenten für intelligente Prozesssteuerung
- **🔒 Trust-System**: 5-stufiges Vertrauenswürdigkeits-System mit visuellen Indikatoren
- **📊 Modulare Architektur**: CRM, Finanzbuchhaltung, BI, Lagerverwaltung, DMS
- **📱 Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- **⚡ Performance**: Optimiert für hohe Benutzerzahlen
- **🔍 Transparenz**: Vollständige Nachverfolgung aller Datenquellen und Entscheidungen

### 🏗️ Systemarchitektur

```
VALEO NeuroERP 2.0
├── Frontend (React + TypeScript)
│   ├── Trust-basierte UI-Komponenten
│   ├── Modulare Feature-Architektur
│   ├── Responsive Design
│   └── Performance-Optimierung
├── Backend (Python + FastAPI)
│   ├── API-Gateway
│   ├── Trust-Validierung
│   ├── Audit-System
│   └── KI-Agenten-Integration
└── Middleware
    ├── LangGraph-Integration
    ├── Datenbank-Services
    └── Real-time Updates
```

### 🚀 Schnellstart

#### Voraussetzungen

- **Node.js** 18+ 
- **npm** 9+
- **Git**
- **Code-Editor** (VS Code empfohlen)

#### Installation

```bash
# Repository klonen
git clone https://github.com/JochenWeerda/VALEO-NeuroERP-2.0.git
cd VALEO-NeuroERP-2.0

# Dependencies installieren
npm install

# Frontend-Dependencies installieren
cd frontend
npm install

# Entwicklungsserver starten
npm run dev
```

#### Entwicklungsserver

- **URL:** http://localhost:5173/
- **Hot Reload:** ✅ Aktiviert
- **TypeScript:** ✅ Konfiguriert
- **Tailwind CSS:** ✅ Konfiguriert

### 📁 Projektstruktur

```
VALEO-NeuroERP-2.0/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # UI-Komponenten
│   │   │   ├── TrustIndicator.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── UserDropdown.tsx
│   │   │   ├── TrustAwareLayout.tsx
│   │   │   ├── ModuleCard.tsx
│   │   │   ├── ChatSidebar.tsx
│   │   │   └── index.ts
│   │   ├── pages/               # Seiten-Komponenten
│   │   │   └── TrustAwareDashboard.tsx
│   │   ├── features/            # Feature-Module
│   │   │   ├── crm/
│   │   │   ├── fibu/
│   │   │   ├── lager/
│   │   │   └── bi/
│   │   ├── lib/                 # Utility-Funktionen
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                     # Python Backend
├── docs/                        # Dokumentation
├── docker/                      # Docker-Konfiguration
├── kubernetes/                  # K8s-Manifests
└── README.md
```

### 🎨 Trust-System

#### Vertrauenswürdigkeits-Level

| Level | Farbe | Icon | Beschreibung |
|-------|-------|------|--------------|
| **Fact** | 🟢 Grün | ✅ | Validierte, faktenbasierte Daten |
| **Assumption** | 🟡 Gelb | ❓ | Begründete Annahmen |
| **Uncertain** | 🟠 Orange | ⚠️ | Unsichere Informationen |
| **Error** | 🔴 Rot | 🚫 | Fehlerhafte oder ungültige Daten |
| **Processing** | 🔵 Blau | 🔄 | Wird gerade verarbeitet |

#### Trust-Indikatoren

```typescript
// Trust-Indikator verwenden
<TrustIndicator
  level="fact"
  confidence={95}
  source="Datenbank: Kundenstamm"
  lastValidated={new Date()}
/>
```

### 📊 ERP-Module

#### 1. Dashboard
- **Zweck:** Systemübersicht und Hauptfunktionen
- **Trust-Level:** Fact (95%)
- **Features:** Modul-Status, Performance-Metriken, KI-Empfehlungen

#### 2. Kundenverwaltung (CRM)
- **Zweck:** Kundenbeziehungsmanagement
- **Trust-Level:** Fact (90%)
- **Features:** Kundenstamm, Verkaufspipeline, Kontaktverwaltung

#### 3. Finanzbuchhaltung (FIBu)
- **Zweck:** Finanzielle Prozesse und Buchhaltung
- **Trust-Level:** Fact (98%)
- **Features:** Buchungen, Rechnungen, Finanzberichte

#### 4. Lagerverwaltung
- **Zweck:** Bestands- und Lagerverwaltung
- **Trust-Level:** Fact (92%)
- **Features:** Artikelstamm, Bestandsverwaltung, Lieferanten

#### 5. Business Intelligence (BI)
- **Zweck:** Datenanalyse und Reporting
- **Trust-Level:** Assumption (85%)
- **Features:** Dashboards, Berichte, Trendanalysen

#### 6. Dokumentenmanagement (DMS)
- **Zweck:** Dokumentenverwaltung und Archivierung
- **Trust-Level:** Fact (88%)
- **Features:** Dokumentenverwaltung, Versionierung, Suche

#### 7. Einstellungen
- **Zweck:** Systemkonfiguration und Benutzerverwaltung
- **Trust-Level:** Fact (100%)
- **Features:** Benutzerverwaltung, Berechtigungen, Systemeinstellungen

### 🤖 KI-Agenten

#### LangGraph-Integration

Das System verwendet LangGraph für intelligente Agenten:

- **Prozess-Agent:** Optimiert Geschäftsprozesse
- **Daten-Agent:** Validiert und bereinigt Daten
- **Anomalie-Agent:** Erkennt Abweichungen
- **Empfehlungs-Agent:** Gibt intelligente Empfehlungen

#### Agent-Status

```typescript
// Agent-Status anzeigen
<AgentStatus
  agentId="process-agent"
  status="active"
  trustLevel="fact"
  confidence={92}
  lastActivity={new Date()}
/>
```

### 🎯 UI-Komponenten

#### Trust-basierte Komponenten

- **TrustIndicator:** Zentrale Vertrauenswürdigkeits-Anzeige
- **TrustAwareLayout:** Haupt-Layout mit Trust-Integration
- **ModuleCard:** ERP-Modul-Karten mit Trust-Indikatoren
- **NotificationDropdown:** Benachrichtigungen mit Trust-Levels
- **UserDropdown:** Benutzer-Profil mit Trust-Informationen

#### Navigation

- **Sidebar:** Vertikale Navigation mit Trust-Indikatoren
- **ChatSidebar:** KI-Chat-System mit Sprachsteuerung
- **FloatingVoiceControl:** Sprachsteuerung für alle Module

### 🔧 Entwicklung

#### Tech-Stack

**Frontend:**
- React 18.2.0
- TypeScript 5.0.0
- Tailwind CSS 3.3.0
- Vite 7.0.5
- Chart.js 4.4.0
- React Hook Form 7.48.0

**Backend:**
- Python 3.11+
- FastAPI
- SQLAlchemy
- LangGraph
- Redis

#### Code-Standards

```typescript
// TypeScript mit strikter Typisierung
interface UserData {
  id: string;
  name: string;
  email: string;
  trustLevel: TrustLevel;
  confidence: number;
}

// Trust-First Development
const TrustAwareComponent: React.FC<Props> = ({ data, trustLevel }) => {
  return (
    <TrustAwareWrapper trustLevel={trustLevel}>
      {/* Komponenten-Inhalt */}
    </TrustAwareWrapper>
  );
};
```

### 🧪 Testing

#### Test-Strategie

```bash
# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e
```

#### Test-Beispiele

```typescript
// Trust-Indikator Test
describe('TrustIndicator', () => {
  it('renders correct trust level', () => {
    render(<TrustIndicator level="fact" confidence={95} />);
    expect(screen.getByText('Fakten-basiert')).toBeInTheDocument();
  });
});
```

### 📱 Responsive Design

#### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

#### Mobile-First Ansatz

```typescript
// Responsive Komponenten
<div className="
  w-full                    /* Mobile */
  md:w-1/2                  /* Tablet */
  lg:w-1/3                  /* Desktop */
">
  {/* Content */}
</div>
```

### 🔒 Sicherheit

#### Trust-Validierung

- **Datenvalidierung:** Alle Eingaben werden validiert
- **XSS-Schutz:** Sichere Text-Rendering
- **CSRF-Schutz:** Token-basierte Authentifizierung
- **Audit-Trail:** Vollständige Nachverfolgung

#### Halluzinations-Prävention

1. **Strikte Validierung:** Keine unbestätigten Daten
2. **Klare Kennzeichnung:** Vermutungen deutlich markieren
3. **Benutzer-Kontrolle:** Mensch entscheidet bei Unsicherheiten
4. **Transparenz:** Daten-Quelle immer sichtbar

### 🚀 Deployment

#### Docker

```bash
# Docker Image bauen
docker build -t valeo-neuroerp .

# Container starten
docker run -p 3000:3000 valeo-neuroerp
```

#### Kubernetes

```bash
# K8s Deployment
kubectl apply -f kubernetes/

# Service starten
kubectl get services
```

### 📊 Monitoring

#### Performance-Metriken

- **Trust-Level-Verteilung**
- **Benutzer-Entscheidungen**
- **System-Performance**
- **KI-Agenten-Status**

#### Logging

```typescript
// Trust-Metriken tracken
analytics.track('trust_metric', {
  component: 'TrustIndicator',
  trustLevel: 'fact',
  confidence: 95,
  responseTime: 150
});
```

### 📚 Dokumentation

#### Verfügbare Dokumentation

- [Entwicklungsleitfaden](docs/development-guide.md)
- [Technische Architektur](docs/technical-architecture.md)
- [Trust-basierte UI-Komponenten](docs/trust-aware-ui-components.md)
- [Workflow-UML-Übersicht](docs/valeo-neuroerp-workflow-uml-overview.md)
- [Implementierungsstatus](docs/implementation-status.md)

#### API-Dokumentation

- **Frontend API:** [API Reference](docs/api_reference.md)
- **Backend API:** [Backend API](docs/api/)
- **Trust API:** [Trust System API](docs/trust-api.md)

### 🤝 Beitragen

#### Entwicklungsworkflow

1. **Fork** das Repository
2. **Feature-Branch** erstellen: `git checkout -b feature/amazing-feature`
3. **Änderungen** committen: `git commit -m 'feat: add amazing feature'`
4. **Branch** pushen: `git push origin feature/amazing-feature`
5. **Pull Request** erstellen

#### Code-Standards

- **TypeScript:** Strikte Typisierung
- **ESLint:** Code-Qualität
- **Prettier:** Code-Formatierung
- **Tests:** Mindestens 80% Coverage

### 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

### 🆘 Support

#### Hilfe bekommen

- **Dokumentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/JochenWeerda/VALEO-NeuroERP-2.0/issues)
- **Discussions:** [GitHub Discussions](https://github.com/JochenWeerda/VALEO-NeuroERP-2.0/discussions)
- **Email:** support@valeo-neuroerp.com

#### Häufige Probleme

**Q: Der Entwicklungsserver startet nicht**
A: Prüfen Sie Node.js Version (18+) und installieren Sie Dependencies neu

**Q: Trust-Indikatoren werden nicht angezeigt**
A: Prüfen Sie TypeScript-Kompilierung und Browser-Konsole

**Q: Mobile Ansicht funktioniert nicht**
A: Prüfen Sie Tailwind CSS Konfiguration und Responsive Klassen

### 🎉 Danksagungen

- **React Team** für das großartige Framework
- **Tailwind CSS** für das CSS-Framework
- **LangGraph** für die KI-Agenten-Integration
- **Open Source Community** für die Unterstützung

### 📈 Roadmap

#### Version 1.1.0 (Q1 2025)
- [ ] Backend-Integration
- [ ] Real-time Updates
- [ ] Mobile App (React Native)
- [ ] Erweiterte KI-Agenten

#### Version 1.2.0 (Q2 2025)
- [ ] Offline-Modus
- [ ] Erweiterte Analytics
- [ ] Multi-Tenant Support
- [ ] API-Gateway

#### Version 2.0.0 (Q3 2025)
- [ ] Microservices-Architektur
- [ ] Kubernetes-Native
- [ ] Machine Learning Integration
- [ ] Blockchain-Integration

---

**Entwickelt mit ❤️ für transparente und vertrauenswürdige ERP-Systeme**

**Letzte Aktualisierung:** Dezember 2024  
**Version:** 1.0.0  
**Status:** ✅ Vollständig implementiert und einsatzbereit
