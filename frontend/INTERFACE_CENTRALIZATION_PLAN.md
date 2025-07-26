# Interface-Zentralisierung & Mikroprozess-Plan
## VALEO NeuroERP Frontend - TypeScript Interface Restrukturierung

### 📋 Übersicht der Änderungen

**Datum:** $(date)
**Ziel:** Zentrale Interface-Verwaltung und Granulierung komplexer Komponenten
**Status:** In Bearbeitung

---

## 🎯 Hauptziele

1. **Interface-Zentralisierung** in `@types` Ordnern
2. **Komplexitätsreduktion** durch Komponenten-Granulierung
3. **Eindeutige Typdefinitionen** ohne Konflikte
4. **Wartbare Mikroprozesse** für bessere Übersichtlichkeit

---

## 🔧 Identifizierte Konfliktpunkte

### 1. **Doppelte/Uneinheitliche Typdefinitionen**
- `ContactPerson` mit unterschiedlichen Properties (`phone` vs `phone1`, `isPrimary` vs `isMainContact`)
- Mehrere Definitionen für `ContactWeekdays` (Enum, Interface, Array, Objekt)
- Inkonsistente Property-Namen zwischen API, View und Form

### 2. **Komplexe Verschachtelte Typen**
- `contactWeekdays` als Enum, Interface, Array oder Objekt verwendet
- Iteration über Wochentage nicht möglich mit Interface-Struktur
- Unklare Initialwerte und `Partial<T>` Verwendung

### 3. **Zu Große Komponenten**
- `CustomerContactsTab.tsx` übernimmt zu viele Verantwortlichkeiten
- Formular, Liste, Dialog, API-Calls in einer Komponente
- Schwierige Wartung und Testbarkeit

---

## 🏗️ Neue Mikroprozess-Struktur

### **A. Interface-Zentralisierung**

#### 1. **Zentrale Typdefinitionen** (`src/types/crm.ts`)
```typescript
// Eindeutige Basis-Interfaces
export interface ContactPerson {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  position: string;
  phone1: string;           // Konsistent: immer phone1
  email?: string;
  isMainContact: boolean;   // Konsistent: immer isMainContact
  contactWeekdays: ContactWeekdaysInterface;
  // ... weitere Felder
}

// Explizite Formulartypen
export interface ContactPersonFormData {
  firstName: string;
  lastName: string;
  position: string;
  phone1: string;
  email?: string;
  isMainContact: boolean;
  contactWeekdays: ContactWeekdaysInterface;
  // Nur Felder, die im Formular benötigt werden
}

// Wochentags-Struktur vereinfacht
export interface ContactWeekdaysInterface {
  monday: ContactWeekday;
  tuesday: ContactWeekday;
  wednesday: ContactWeekday;
  thursday: ContactWeekday;
  friday: ContactWeekday;
  saturday: ContactWeekday;
  sunday: ContactWeekday;
}

export interface ContactWeekday {
  available: boolean;
  preferredTimeSlots: ContactTimeSlot[];
  notes?: string;
}
```

#### 2. **Utility-Funktionen** (`src/utils/contactUtils.ts`)
```typescript
// Mapping zwischen API und Form
export const mapApiContactToFormData = (apiContact: ContactPerson): ContactPersonFormData => ({
  firstName: apiContact.firstName,
  lastName: apiContact.lastName,
  position: apiContact.position,
  phone1: apiContact.phone1,
  email: apiContact.email,
  isMainContact: apiContact.isMainContact,
  contactWeekdays: apiContact.contactWeekdays,
});

export const mapFormDataToApiContact = (formData: ContactPersonFormData, customerId: string): Omit<ContactPerson, 'id'> => ({
  customerId,
  firstName: formData.firstName,
  lastName: formData.lastName,
  position: formData.position,
  phone1: formData.phone1,
  email: formData.email,
  isMainContact: formData.isMainContact,
  contactWeekdays: formData.contactWeekdays,
});

// Wochentags-Utilities
export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export const getWeekdayLabel = (weekday: string): string => {
  const labels = {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag'
  };
  return labels[weekday as keyof typeof labels] || weekday;
};
```

### **B. Komponenten-Granulierung**

#### 1. **ContactList** (`src/components/crm/contacts/ContactList.tsx`)
```typescript
interface ContactListProps {
  contacts: ContactPerson[];
  onEdit: (contact: ContactPerson) => void;
  onDelete: (contactId: string) => void;
}

// Verantwortlichkeit: Nur Anzeige der Kontaktliste
```

#### 2. **ContactForm** (`src/components/crm/contacts/ContactForm.tsx`)
```typescript
interface ContactFormProps {
  contact?: ContactPerson | null;
  onSubmit: (formData: ContactPersonFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Verantwortlichkeit: Nur Formular-Handling
```

#### 3. **ContactWeekdaysEditor** (`src/components/crm/contacts/ContactWeekdaysEditor.tsx`)
```typescript
interface ContactWeekdaysEditorProps {
  weekdays: ContactWeekdaysInterface;
  onChange: (weekdays: ContactWeekdaysInterface) => void;
}

// Verantwortlichkeit: Nur Wochentags-Bearbeitung
```

#### 4. **Vereinfachte CustomerContactsTab** (`src/components/crm/tabs/CustomerContactsTab.tsx`)
```typescript
// Hauptkomponente wird zum Orchestrator
const CustomerContactsTab: React.FC<CustomerContactsTabProps> = ({ customer }) => {
  // State Management
  // API Calls
  // Event Handlers
  
  return (
    <Box>
      <ContactList 
        contacts={contacts} 
        onEdit={handleEditContact} 
        onDelete={handleDeleteContact} 
      />
      <ContactForm 
        contact={editingContact}
        onSubmit={handleSaveContact}
        onCancel={() => setIsDialogOpen(false)}
        isLoading={isLoading}
      />
    </Box>
  );
};
```

---

## 📁 Neue Dateistruktur

```
src/
├── types/
│   ├── crm.ts                    # Zentrale CRM-Typen
│   ├── forms.ts                  # Formular-spezifische Typen
│   └── api.ts                    # API-spezifische Typen
├── utils/
│   ├── contactUtils.ts           # Kontakt-Utilities
│   ├── formUtils.ts              # Formular-Utilities
│   └── typeUtils.ts              # Typ-Utilities
├── components/
│   └── crm/
│       ├── contacts/             # Granulierte Kontakt-Komponenten
│       │   ├── ContactList.tsx
│       │   ├── ContactForm.tsx
│       │   ├── ContactWeekdaysEditor.tsx
│       │   └── index.ts
│       └── tabs/
│           └── CustomerContactsTab.tsx  # Vereinfachte Hauptkomponente
```

---

## 🔄 Migrationsplan

### **Phase 1: Interface-Zentralisierung**
1. ✅ Zentrale Typdefinitionen in `types/crm.ts` erstellen
2. ✅ Utility-Funktionen für Mapping erstellen
3. ✅ Konsistente Property-Namen festlegen

### **Phase 2: Komponenten-Granulierung**
1. 🔄 `ContactList` Komponente erstellen
2. 🔄 `ContactForm` Komponente erstellen
3. 🔄 `ContactWeekdaysEditor` Komponente erstellen
4. 🔄 `CustomerContactsTab` vereinfachen

### **Phase 3: Integration & Testing**
1. ⏳ Alle Komponenten integrieren
2. ⏳ TypeScript-Fehler beheben
3. ⏳ Build-Tests durchführen
4. ⏳ Funktionalität testen

---

## 🎯 Erwartete Vorteile

### **Wartbarkeit**
- Klare Trennung von Verantwortlichkeiten
- Einfacheres Debugging und Testing
- Wiederverwendbare Komponenten

### **TypeScript-Sicherheit**
- Eindeutige Typdefinitionen
- Keine Property-Konflikte
- Bessere IntelliSense-Unterstützung

### **Performance**
- Kleinere Bundle-Größe durch Code-Splitting
- Bessere Tree-Shaking-Möglichkeiten
- Optimierte Re-Renders

### **Entwickler-Erfahrung**
- Übersichtlichere Codebase
- Einfachere Onboarding für neue Entwickler
- Klare Dokumentation durch Typen

---

## 📝 Commit-Dokumentation

### **Was geändert wurde:**
- Interface-Zentralisierung in `@types` Ordnern
- Granulierung komplexer Komponenten in Mikroprozesse
- Eindeutige Typdefinitionen ohne Konflikte
- Utility-Funktionen für Mapping und Transformation

### **Warum geändert wurde:**
- **Komplexitätsreduktion:** Zu große Komponenten waren schwer wartbar
- **TypeScript-Konflikte:** Doppelte/uneinheitliche Typdefinitionen führten zu Build-Fehlern
- **Wartbarkeit:** Klare Trennung von Verantwortlichkeiten für bessere Übersicht
- **Wiederverwendbarkeit:** Granulierte Komponenten können in anderen Kontexten verwendet werden

### **Nächste Schritte:**
1. Implementierung der granulieren Komponenten
2. Integration in bestehende CRM-Struktur
3. Testing und Validierung
4. Dokumentation der neuen Struktur

---

## 🔍 Fallback-Strategie

Falls Probleme auftreten:
1. **Rollback** zu vorheriger funktionierender Version
2. **Schrittweise Migration** statt Big-Bang-Ansatz
3. **Feature-Flags** für neue Komponenten
4. **Umfassende Tests** vor jedem Commit

---

*Dieses Dokument dient als zentrale Übersicht und Fallback-Referenz für die Interface-Zentralisierung und Mikroprozess-Implementierung.* 