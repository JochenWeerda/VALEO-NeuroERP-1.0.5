# VALEO NeuroERP Frontend

Modernes Frontend für das VALEO NeuroERP System mit Vite, React, TypeScript und Tailwind CSS.

## 🚀 Tech-Stack

- **Vite** - Schneller Build-Tool und Dev-Server
- **React 18** - Moderne React-Features
- **TypeScript** - Type Safety
- **Tailwind CSS** - Utility-First CSS Framework
- **React Router** - Client-side Routing
- **Zustand** - State Management
- **React Query** - Server State Management
- **React Hook Form** - Formulare mit Validierung

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build für Produktion
npm run build

# Build Preview
npm run preview
```

## 🎨 Design System

### Farben
- **Primary**: Blau (#3b82f6) - Hauptfarbe für Buttons und Links
- **Secondary**: Pink (#ec4899) - Sekundäre Aktionen
- **Success**: Grün (#22c55e) - Erfolgsmeldungen
- **Warning**: Orange (#f59e0b) - Warnungen
- **Danger**: Rot (#ef4444) - Fehler und kritische Aktionen

### Komponenten-Klassen
- `.valeo-card` - Basis-Karten-Design
- `.btn-primary` - Primäre Buttons
- `.btn-secondary` - Sekundäre Buttons
- `.valeo-input` - Eingabefelder
- `.valeo-nav-link` - Navigation-Links

## 📁 Projektstruktur

```
src/
├── components/          # Wiederverwendbare Komponenten
│   ├── ErrorBoundary.tsx
│   ├── Layout.tsx
│   ├── DataCard.tsx
│   └── StatusCard.tsx
├── pages/              # Seiten-Komponenten
│   └── Dashboard.tsx
├── hooks/              # Custom React Hooks
├── services/           # API-Services
├── store/              # Zustand Store
├── types/              # TypeScript Typen
├── utils/              # Utility-Funktionen
├── styles/             # CSS/SCSS Dateien
├── App.tsx             # Haupt-App-Komponente
├── main.tsx            # App-Entry-Point
└── index.css           # Globale Styles
```

## 🎯 Features

### ✅ Implementiert
- [x] Moderne Vite + React + TypeScript Setup
- [x] Tailwind CSS mit VALEO Design System
- [x] Responsive Layout mit Sidebar
- [x] Dashboard mit Statistik-Karten
- [x] System-Status-Anzeige
- [x] Error Boundary für Fehlerbehandlung
- [x] React Router für Navigation
- [x] TypeScript für Type Safety

### 🚧 Geplant
- [ ] Benutzer-Management
- [ ] Artikel-Verwaltung
- [ ] Finanz-Modul
- [ ] Lager-Management
- [ ] Kunden-CRM
- [ ] Berichte und Analysen
- [ ] KI-Assistent Integration
- [ ] Dark Mode
- [ ] Internationalisierung

## 🔧 Entwicklung

### Neue Komponente erstellen
```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div className="valeo-card">
      <div className="valeo-card-header">
        <h3 className="valeo-card-title">{title}</h3>
      </div>
      <div className="valeo-card-content">
        {children}
      </div>
    </div>
  );
};
```

### Tailwind CSS verwenden
```tsx
// Utility-Klassen
<div className="bg-white rounded-xl shadow-sm p-6">

// Responsive Design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// VALEO-Komponenten-Klassen
<button className="btn-primary">Aktion</button>
```

## 🧪 Testing

```bash
# Tests ausführen
npm test

# Tests im Watch-Modus
npm run test:watch
```

## 📦 Build & Deployment

```bash
# Produktions-Build
npm run build

# Build Preview
npm run preview

# Linting
npm run lint

# Type Checking
npm run type-check
```

## 🔒 Sicherheit

- TypeScript für Type Safety
- Input-Validierung mit Yup/Zod
- Error Boundaries für Fehlerbehandlung
- XSS-Schutz durch React

## 🚀 Performance

- Vite für schnelle Builds
- Code-Splitting mit React.lazy
- Memoization mit React.memo
- Optimierte Bundle-Größe

## 📱 Responsive Design

- Mobile-First Ansatz
- Tailwind CSS Breakpoints
- Flexible Grid-Systeme
- Touch-optimierte Interaktionen

## 🎨 Accessibility

- Semantisches HTML
- ARIA-Labels
- Keyboard Navigation
- Screen Reader Support

## 📄 Lizenz

VALEO NeuroERP - Proprietäre Software

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an das VALEO-Team.
