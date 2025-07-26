# ✉️ Nachrichtensystem - VALEO NeuroERP

## 🎯 Übersicht

Das Nachrichtensystem von VALEO NeuroERP basiert auf der bewährten zvoove Handel Struktur und wurde um moderne KI-Funktionen erweitert. Es ermöglicht die effiziente Kommunikation zwischen verschiedenen Abteilungen und Systemmodulen.

## 🏗️ Systemarchitektur

### **Kernkomponenten:**

1. **MessagingService** - Zentrale Service-Klasse für alle Nachrichtenoperationen
2. **NachrichtenFormular** - Benutzerfreundliches Formular für Nachrichtenerstellung
3. **MessagingPage** - Hauptseite mit Nachrichtenliste und Statistiken
4. **TypeScript-Interfaces** - Vollständig typisierte Datenstrukturen

### **Datenbank-Schema (Supabase):**

```sql
-- Nachrichten-Tabelle
CREATE TABLE nachrichten (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empfaenger_gruppe TEXT NOT NULL,
  betreff TEXT NOT NULL,
  inhalt TEXT NOT NULL,
  empfaenger JSONB NOT NULL,
  gelesen_von TEXT[] DEFAULT '{}',
  bestaetigt_von TEXT[] DEFAULT '{}',
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  erstellt_von TEXT NOT NULL,
  gesendet_am TIMESTAMP WITH TIME ZONE,
  archiviert_am TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'entwurf',
  prioritaet TEXT DEFAULT 'normal',
  kategorie TEXT DEFAULT 'allgemein',
  tags TEXT[] DEFAULT '{}',
  ki_generiert BOOLEAN DEFAULT FALSE,
  lese_bestaetigung_erforderlich BOOLEAN DEFAULT FALSE,
  archivierung_erzwingen BOOLEAN DEFAULT FALSE,
  auto_protokoll_anhaengen BOOLEAN DEFAULT FALSE,
  kontext JSONB
);

-- Benutzer-Tabelle (für Empfänger)
CREATE TABLE benutzer (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  gruppe TEXT NOT NULL,
  rolle TEXT NOT NULL,
  aktiv BOOLEAN DEFAULT TRUE
);
```

## 🚀 Features

### **1. Nachrichtenerstellung**
- **Empfängergruppen**: AO, CMK, CIM, NeuroFlow, Streckengeschäft, POS, E-Invoicing, CRM, Admin, KI-Agenten
- **Prioritäten**: Niedrig, Normal, Hoch, Kritisch
- **Kategorien**: Allgemein, Bestellung, Lieferung, Rechnung, Warnung, Protokoll, KI-Nachricht, System
- **Optionen**: Lesebestätigung, Archivierung, Tagesprotokoll-Anhang

### **2. KI-Integration**
- **Intelligente Vorschläge**: Automatische Nachrichten-Vorschläge basierend auf Kontext
- **Tagesprotokoll-Generierung**: Automatische Erstellung von Tagesprotokollen
- **Kontextbasierte Empfehlungen**: KI schlägt Empfänger und Inhalte vor
- **Sprachverarbeitung**: Automatische Textanalyse und -optimierung

### **3. Nachrichtenverwaltung**
- **Status-Tracking**: Gesendet → Gelesen → Bestätigt → Archiviert
- **Empfänger-Verwaltung**: Automatische Empfänger-Zuordnung nach Gruppen
- **Lesebestätigungen**: Tracking von Lesebestätigungen
- **Archivierung**: Automatische und manuelle Archivierung

### **4. Performance-Monitoring**
- **Ladezeit-Messung**: Automatische Performance-Tracking
- **Statistiken**: Detaillierte Nachrichten-Statistiken
- **Optimierung**: Kontinuierliche Performance-Verbesserung

## 📋 Verwendung

### **Nachricht erstellen:**

```typescript
import { messagingService } from '../services/MessagingService';

const nachricht = {
  empfaengerGruppe: 'neuroflow',
  betreff: 'System-Update verfügbar',
  inhalt: 'Das NeuroFlow-System wurde erfolgreich aktualisiert.',
  leseBestaetigungErforderlich: true,
  archivierungErzwingen: false,
  autoProtokollAnhaengen: false
};

const gesendeteNachricht = await messagingService.createMessage(nachricht);
```

### **Nachrichten abrufen:**

```typescript
// Alle gesendeten Nachrichten
const nachrichten = await messagingService.getMessages({ 
  status: 'gesendet' 
});

// Nachrichten einer bestimmten Gruppe
const neuroflowNachrichten = await messagingService.getMessages({ 
  empfaengerGruppe: 'neuroflow' 
});
```

### **Tagesprotokoll generieren:**

```typescript
const protokoll = await messagingService.generateTagesprotokoll();
console.log(`Bestellungen: ${protokoll.bestellungen}`);
console.log(`Lieferungen: ${protokoll.lieferungen}`);
console.log(`Rechnungen: ${protokoll.rechnungen}`);
```

### **KI-Vorschläge abrufen:**

```typescript
const vorschlaege = await messagingService.generateKINachrichtenVorschlaege({
  modul: 'neuroflow',
  prozess: 'bestellung'
});
```

## 🎨 UI-Komponenten

### **NachrichtenFormular**
- Vollständig validiertes Formular
- KI-Vorschläge-Integration
- Tagesprotokoll-Einfügung
- Responsive Design

### **MessagingPage**
- Tab-basierte Navigation
- Echtzeit-Statistiken
- Nachrichtenliste mit Aktionen
- Floating Action Button

### **NachrichtenList**
- Status-basierte Filterung
- Aktionen: Lesen, Bestätigen, Archivieren, Löschen
- Avatar-Anzeige (KI vs. Benutzer)
- Responsive Layout

## 🔧 Konfiguration

### **Empfängergruppen konfigurieren:**

```typescript
// src/types/messaging.ts
export type EmpfaengerGruppe = 
  | 'allgemein'
  | 'ao'
  | 'cmk'
  | 'cim'
  | 'neuroflow'
  | 'streckengeschaeft'
  | 'pos'
  | 'e-invoicing'
  | 'crm'
  | 'admin'
  | 'ki-agenten';
```

### **KI-Integration erweitern:**

```typescript
// In MessagingService.ts
async generateKINachrichtenVorschlaege(kontext?: {
  modul?: string;
  prozess?: string;
  referenzId?: string;
}): Promise<KINachrichtenVorschlag[]> {
  // Hier KI-Logik implementieren
  // OpenAI, Claude, oder andere KI-Services
}
```

## 📊 Statistiken und Monitoring

### **Verfügbare Metriken:**
- Gesendete Nachrichten
- Gelesene Nachrichten
- Bestätigte Nachrichten
- Archivierte Nachrichten
- KI-generierte Nachrichten
- Durchschnittliche Lesezeit
- Beliebte Empfängergruppen

### **Performance-Monitoring:**
- Durchschnittliche Antwortzeit
- Langsamste Operationen
- Gesamtanzahl Operationen

## 🔒 Sicherheit

### **Authentifizierung:**
- Supabase Auth Integration
- Benutzer-spezifische Nachrichten
- Rollenbasierte Zugriffskontrolle

### **Validierung:**
- Server-seitige Validierung
- Client-seitige Validierung
- XSS-Schutz
- SQL-Injection-Schutz

## 🚀 Deployment

### **Voraussetzungen:**
- Supabase-Projekt konfiguriert
- Datenbank-Schema erstellt
- Umgebungsvariablen gesetzt

### **Umgebungsvariablen:**
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **Build und Deployment:**
```bash
# Development
npm run dev

# Production Build
npm run build:prod

# Bundle-Analyse
npm run build:analysis
```

## 🔄 Integration mit anderen Modulen

### **NeuroFlow-Integration:**
```typescript
// Automatische Benachrichtigungen bei NeuroFlow-Events
if (neuroflowEvent.type === 'system_update') {
  await messagingService.createMessage({
    empfaengerGruppe: 'neuroflow',
    betreff: 'NeuroFlow System-Update',
    inhalt: 'System wurde erfolgreich aktualisiert.',
    kiGeneriert: true
  });
}
```

### **Streckengeschäft-Integration:**
```typescript
// Bestellbestätigungen automatisch senden
if (bestellung.status === 'bestätigt') {
  await messagingService.createMessage({
    empfaengerGruppe: 'streckengeschaeft',
    betreff: `Bestellbestätigung ${bestellung.nummer}`,
    inhalt: `Bestellung ${bestellung.nummer} wurde bestätigt.`,
    leseBestaetigungErforderlich: true
  });
}
```

## 🧪 Testing

### **Unit Tests:**
```typescript
// MessagingService.test.ts
describe('MessagingService', () => {
  it('should create a message successfully', async () => {
    const nachricht = { /* test data */ };
    const result = await messagingService.createMessage(nachricht);
    expect(result).toBeDefined();
    expect(result.status).toBe('gesendet');
  });
});
```

### **Integration Tests:**
```typescript
// E2E Tests mit Playwright
test('should send message and show in list', async ({ page }) => {
  await page.goto('/messaging');
  await page.click('[data-testid="new-message-btn"]');
  await page.fill('[data-testid="betreff-input"]', 'Test Nachricht');
  await page.click('[data-testid="send-btn"]');
  await expect(page.locator('[data-testid="message-list"]')).toContainText('Test Nachricht');
});
```

## 📈 Roadmap

### **Phase 1 (Aktuell):**
- ✅ Grundfunktionalität implementiert
- ✅ KI-Vorschläge integriert
- ✅ Performance-Monitoring
- ✅ Responsive UI

### **Phase 2 (Geplant):**
- 🔄 Echtzeit-Benachrichtigungen (WebSocket)
- 🔄 Erweiterte KI-Integration (OpenAI/Claude)
- 🔄 Spracherkennung für Protokolltexte
- 🔄 Automatische Übersetzung

### **Phase 3 (Zukunft):**
- 📋 Chat-Funktionalität
- 📋 Datei-Anhänge
- 📋 Erweiterte Analytics
- 📋 Mobile App

## 🆘 Troubleshooting

### **Häufige Probleme:**

1. **Nachrichten werden nicht gesendet:**
   - Supabase-Verbindung prüfen
   - Benutzer-Authentifizierung überprüfen
   - Datenbank-Schema validieren

2. **KI-Vorschläge funktionieren nicht:**
   - KI-Service-Konfiguration prüfen
   - API-Schlüssel validieren
   - Netzwerk-Verbindung testen

3. **Performance-Probleme:**
   - Bundle-Analyse durchführen
   - Datenbank-Indizes prüfen
   - Caching-Strategien optimieren

### **Debug-Modus aktivieren:**
```typescript
// In MessagingService.ts
private debugMode = process.env.NODE_ENV === 'development';

private log(message: string, data?: any) {
  if (this.debugMode) {
    console.log(`[MessagingService] ${message}`, data);
  }
}
```

---

## 📞 Support

Bei Fragen oder Problemen:
- **Dokumentation**: Siehe `BUNDLE_OPTIMIZATION_REPORT.md`
- **Code-Repository**: GitHub Repository
- **Issues**: GitHub Issues erstellen
- **Entwicklung**: Cursor.ai für Code-Generierung

**Letzte Aktualisierung**: 2024-12-19  
**Version**: 2.0.0  
**Status**: ✅ Produktionsbereit 