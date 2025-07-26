# CRM-Modul für VALEO NeuroERP

## Übersicht

Das CRM-Modul wurde basierend auf zvoove-Handelssoftware erweitert und bietet eine umfassende Kundenverwaltung mit moderner UI und erweiterten Funktionen.

## Features

### 🏢 Kundenstammdaten
- Vollständige Kundenstammdaten mit erweiterten Feldern
- Adressverwaltung (Haupt- und Rechnungsadresse)
- Kontaktdaten und Geschäftsinformationen
- Kreditdaten und Zahlungsbedingungen
- Kundenklassifizierung und Risikobewertung

### 👥 Kontaktverwaltung
- Ansprechpartner-Verwaltung mit Rollen
- Kontaktzeiten und Verfügbarkeiten
- Kontakthistorie und Kommunikationsverlauf
- Kontaktplanung und Terminverwaltung

### 📈 Vertriebsmanagement
- Deal-Pipeline und Verkaufsprozesse
- Angebotsverwaltung mit Status-Tracking
- Auftragsverwaltung und -verfolgung
- Vertriebsanalysen und KPIs
- Sales-Aktivitäten und Follow-ups

### 📋 Auftragsverwaltung
- Vollständige Auftragsverwaltung
- Lieferantenverwaltung und -verfolgung
- Bestellungen und Einkaufsangebote
- Lagerverwaltung und Verfügbarkeitsprüfung

### 💰 Rechnungsverwaltung
- Rechnungserstellung und -verwaltung
- Mahnwesen und Zahlungserinnerungen
- Zahlungsverfolgung und -status
- Offene Posten und Kreditmanagement

### 📄 Dokumentenmanagement
- Dokumentenverwaltung mit Kategorien
- Zugriffsrechte und Berechtigungen
- Dokumentenversionierung
- Archivierung und Suchfunktionen

### 📊 Analysen und Berichte
- Umsatzanalysen und Trends
- Kreditanalysen und Risikobewertung
- Aktivitätsanalysen und KPIs
- Berichtserstellung und Export

### 🔄 Streckengeschäfte
- Direktgeschäfte und Kommissionen
- Fremdbestände und Lagerverwaltung
- Bestandsbewegungen und -verfolgung
- Externe Lager und Standorte

### 💬 Kommunikation
- E-Mail-Historie und -verwaltung
- Telefonhistorie und -protokollierung
- **WhatsApp-Historie und -verwaltung**
- Meeting-Notizen und -protokolle
- Kommunikationsverfolgung

### 🚚 Lieferantenverwaltung
- Lieferantenstammdaten
- Anfragen und Angebote
- Bestellungen und Lieferungen
- Lieferantenanalysen und -bewertungen

## Technische Architektur

### Komponenten-Struktur

```
crm/
├── CRMMainView.tsx          # Hauptkomponente mit Tab-Navigation
├── CRMRibbon.tsx            # Funktionsleiste mit Aktionen
├── CRMContextMenu.tsx       # Kontext-Menü für Aktionen
├── index.ts                 # Export-Index
├── README.md               # Diese Dokumentation
└── tabs/                   # Tab-Komponenten
    ├── CustomerGeneralTab.tsx      # Allgemein-Tab
    ├── CustomerContactsTab.tsx     # Kontakte-Tab
    ├── CustomerSalesTab.tsx        # Vertrieb-Tab
    ├── CustomerOrdersTab.tsx       # Aufträge-Tab
    ├── CustomerInvoicesTab.tsx     # Rechnungen-Tab
    ├── CustomerDocumentsTab.tsx    # Dokumente-Tab
    ├── CustomerAnalysisTab.tsx     # Analyse-Tab
    ├── CustomerDirectBusinessTab.tsx # Streckengeschäfte-Tab
    ├── CustomerExternalStocksTab.tsx # Fremdbestände-Tab
    ├── CustomerCommunicationsTab.tsx # Kommunikation-Tab
    ├── CustomerWhatsAppHistoryTab.tsx # WhatsApp-Historie-Tab
    └── SupplierManagementTab.tsx   # Lieferanten-Tab
```

### TypeScript-Typen

Alle CRM-spezifischen Typen sind in `frontend/src/types/crm.ts` definiert:

- **Enums**: Tab-Typen, Status, Rollen, etc.
- **Interfaces**: Kunden, Kontakte, Angebote, Aufträge, etc.
- **Form-Typen**: Formulardaten für alle Entitäten
- **Filter-Typen**: Such- und Filteroptionen
- **UI-Konfiguration**: Tab- und Widget-Konfigurationen

### UI-Framework

- **Material-UI (MUI)**: Komponenten und Icons
- **Tailwind CSS**: Utility-Klassen für Layout und Styling
- **Responsive Design**: Mobile-first Ansatz
- **Accessibility**: Barrierefreie Implementierung

## Verwendung

### Grundlegende Integration

```tsx
import { CRMMainView } from '../components/crm';

const MyPage = () => {
  return (
    <CRMMainView
      customerId="customer-123"
      initialTab={CRMMainTab.GENERAL}
      initialSubTab={CRMSubTab.BASIC_INFO}
      onCustomerChange={(customer) => console.log('Customer updated:', customer)}
      onTabChange={(mainTab, subTab) => console.log('Tab changed:', mainTab, subTab)}
    />
  );
};
```

### CRM-Seite Integration

```tsx
import CRMPage from '../pages/CRMPage';

// In der Router-Konfiguration
<Route path="/crm" element={<CRMPage />} />
```

## Erweiterte Features

### Ribbon-Menü
- Kontextabhängige Aktionen
- Tab-spezifische Funktionen
- Benachrichtigungen und Badges
- Deutsche Lokalisierung

### Kontext-Menü
- Rechtsklick-Aktionen
- Kontextabhängige Menüpunkte
- Schnellzugriff auf häufige Aktionen
- **WhatsApp-Integration** für direkte Kommunikation

### Tab-Navigation
- Haupttabs für verschiedene Bereiche
- Untertabs für detaillierte Ansichten
- Dynamische Tab-Konfiguration
- Badge-Unterstützung für Benachrichtigungen

## Entwicklung

### Neue Tab-Komponente erstellen

1. Komponente in `tabs/` erstellen
2. Interface für Props definieren
3. In `CRMMainView.tsx` importieren und registrieren
4. In `index.ts` exportieren

### Neue CRM-Typen hinzufügen

1. Typen in `frontend/src/types/crm.ts` definieren
2. Deutsche Lokalisierung für Enums
3. Form- und Filter-Typen erstellen
4. UI-Konfiguration erweitern

### API-Integration

```tsx
// TODO: API-Service implementieren
const crmService = {
  getCustomer: async (id: string) => { /* API-Aufruf */ },
  updateCustomer: async (customer: Customer) => { /* API-Aufruf */ },
  // ... weitere Methoden
};
```

## Nächste Schritte

### Geplante Erweiterungen

1. **Vollständige Tab-Implementierung**: Alle Tab-Komponenten mit voller Funktionalität
2. **API-Integration**: Backend-Anbindung für alle CRM-Funktionen
3. **Dashboard-Widgets**: CRM-spezifische Dashboard-Komponenten
4. **Berichte und Export**: Erweiterte Berichtsfunktionen
5. **Workflow-Integration**: LangGraph-Integration für automatisierte Prozesse
6. **KI-Features**: Intelligente Vorschläge und Automatisierung

### Performance-Optimierung

- Lazy Loading für Tab-Komponenten
- Virtualisierung für große Datenmengen
- Caching-Strategien für API-Aufrufe
- Optimistic Updates für bessere UX

## Support

Bei Fragen oder Problemen mit dem CRM-Modul:

1. Dokumentation prüfen
2. TypeScript-Typen überprüfen
3. Console-Logs für Debugging verwenden
4. Issue im Repository erstellen

---

**Entwickelt für VALEO NeuroERP - Intelligentes ERP-System mit KI-Integration** 