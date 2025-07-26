import { MCPSchema } from './mcpSchemaInjector';

/**
 * Cursor-Prompt-Templates für automatische Komponenten-Generierung
 */

export interface CursorPromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
}

/**
 * Basis-Prompt für alle Komponenten-Generierungen
 */
export const BASE_PROMPT_TEMPLATE = `
# 🎯 VALEO NeuroERP - React Komponenten Generator

Du bist ein erfahrener Frontend-Entwickler für VALEO NeuroERP. Erstelle React-Komponenten basierend auf dem bereitgestellten Supabase-Schema.

## 🧠 Regeln für die Komponentenerstellung

1. **Verwende ausschließlich Felder, Typen und Relationen aus dem bereitgestellten Schema**
2. **Fremdschlüsselbeziehungen müssen korrekt gehandhabt werden** – dropdowns oder Lookups
3. **Formularvalidierung erfolgt auf Basis der im Schema enthaltenen Einschränkungen** (z. B. \`NOT NULL\`, \`CHECK\`, \`ENUM\`)
4. **RLS-Richtlinien sind zu respektieren** (z. B. keine Anzeige schreibgeschützter Felder)
5. **Verwende \`zod\` für Typensicherheit**
6. **Generiere exakte TypeScript-Typen direkt aus dem Schema**
7. **Die Komponente muss eigenständig nutzbar und in sich geschlossen sein**
8. **Berücksichtige UI/UX: Nutze sinnvolle Labels, Gruppen und Reihenfolgen**

## 🎨 UI-Framework Regeln

### Material-UI (MUI) Komponenten
- Verwende MUI v5 Komponenten für komplexe UI-Elemente
- Nutze \`@mui/material\` für Buttons, Cards, Dialogs, etc.
- Verwende \`@mui/icons-material\` für Icons
- Implementiere Theme-Provider für konsistente Farben

### Ant Design Komponenten
- Verwende Ant Design für Tabellen, Formulare, Navigation
- Nutze \`antd\` für DataGrid, Form, Menu, etc.
- Implementiere deutsche Lokalisierung

### Tailwind CSS Utility-Klassen
- Verwende Tailwind für Layout, Spacing, Responsive Design
- Kombiniere mit MUI/Ant Design für beste Ergebnisse
- Nutze deutsche Klassennamen-Konventionen

## 🔧 TypeScript Regeln

### Typen-Definitionen
- Erstelle immer TypeScript Interfaces für Props
- Verwende Union Types für Status/Enums
- Nutze Generic Types für wiederverwendbare Komponenten

### Custom Hooks
- Erstelle TypeScript-Hooks für wiederverwendbare Logik
- Verwende Generic Types für flexible Hooks

## 📊 Schema-Kontext

{{SCHEMA_CONTEXT}}

## 🎯 Aufgabe

{{TASK_DESCRIPTION}}

## 📝 Ausgabe-Format

Erstelle die folgenden Dateien:

1. **TypeScript-Typen** (\`types/{{TABLE_NAME}}.ts\`)
2. **React-Komponente** (\`components/{{COMPONENT_TYPE}}/{{COMPONENT_NAME}}.tsx\`)
3. **Tests** (\`components/__tests__/{{COMPONENT_NAME}}.test.tsx\`) - optional
4. **Dokumentation** (\`components/{{COMPONENT_TYPE}}/README.md\`) - optional

## 🔒 Sicherheits-Hinweise

- **JWT-Autorisierung** beim MCP-Request sicherstellen
- **Kein offenes Schema-Leak** über das API
- **RLS-Verstöße früh abfangen** via Assertion-Layer vor dem Komponenten-Render
- **Sensitive Daten** (Passwörter, Tokens) niemals im Frontend speichern
- **Input-Validierung** auf Client- und Server-Seite implementieren

---

**HINWEIS:** Verwende ausschließlich die oben definierten Felder, Typen und Beziehungen. Erfinde KEINE zusätzlichen Felder oder Typen.
`;

/**
 * Formular-Komponenten-Prompt
 */
export const FORM_PROMPT_TEMPLATE = `
${BASE_PROMPT_TEMPLATE}

## 🎯 Aufgabe: Formular-Komponente erstellen

Erstelle eine vollständige React-Formular-Komponente für die Tabelle \`{{TABLE_NAME}}\` mit folgenden Features:

### ✅ Anforderungen:
- **React Hook Form** Integration mit Zod-Validierung
- **Material-UI** Komponenten für UI-Elemente
- **TailwindCSS** für zusätzliches Styling
- **Responsive Design** für mobile und desktop Geräte
- **Real-time Validierung** mit Fehlermeldungen
- **Loading States** und Error Handling
- **RLS-Compliance** mit entsprechenden UI-Hinweisen
- **Foreign Key Handling** mit Dropdowns/Lookups
- **Enum-Werte** für Status-Felder
- **Accessibility** Features (ARIA-Labels, Keyboard Navigation)

### 📋 Komponenten-Struktur:
1. **Props Interface** mit TypeScript
2. **Form Hook** mit React Hook Form
3. **Validierung** basierend auf Schema
4. **UI-Komponenten** mit Material-UI
5. **Error Handling** und Loading States
6. **Submit/Cancel** Funktionalität

### 🎨 UI-Features:
- **Card-Layout** mit Header und Content
- **Formular-Felder** mit Labels und Icons
- **Validierungs-Fehlermeldungen** unter den Feldern
- **Action Buttons** (Speichern, Abbrechen)
- **Loading Indicators** während Submissions
- **Success/Error** Feedback

### 🔒 RLS-Integration:
- **Update-Beschränkungen** in UI anzeigen
- **Delete-Beschränkungen** berücksichtigen
- **Insert-Berechtigungen** prüfen
- **Benutzer-Hinweise** für RLS-Richtlinien

### 📱 Responsive Design:
- **Mobile-first** Ansatz
- **Touch-friendly** Buttons und Inputs
- **Flexible Layouts** für verschiedene Bildschirmgrößen
- **Optimierte** Formular-Navigation

## 📝 Ausgabe:

Erstelle eine vollständige, produktionsbereite React-Komponente mit allen notwendigen Imports, Types und Features.
`;

/**
 * Tabellen-Komponenten-Prompt
 */
export const TABLE_PROMPT_TEMPLATE = `
${BASE_PROMPT_TEMPLATE}

## 🎯 Aufgabe: Tabellen-Komponente erstellen

Erstelle eine vollständige React-Tabellen-Komponente für die Tabelle \`{{TABLE_NAME}}\` mit folgenden Features:

### ✅ Anforderungen:
- **Material-UI Table** mit Sortierung und Paginierung
- **Volltext-Suche** über alle relevanten Felder
- **Filterung** nach Status/Enums
- **Responsive Design** für mobile und desktop Geräte
- **RLS-Compliance** mit entsprechenden Aktionen
- **Loading States** und Error Handling
- **Foreign Key Resolution** mit Lookup-Daten
- **Accessibility** Features (ARIA-Labels, Keyboard Navigation)

### 📋 Komponenten-Struktur:
1. **Props Interface** mit TypeScript
2. **State Management** für Sortierung, Filterung, Paginierung
3. **Data Processing** mit useMemo für Performance
4. **UI-Komponenten** mit Material-UI Table
5. **Search/Filter** Funktionalität
6. **Action Handlers** (View, Edit, Delete)

### 🎨 UI-Features:
- **Table Header** mit Sortier-Indikatoren
- **Search Bar** mit Icon und Placeholder
- **Filter Dropdowns** für Enum-Felder
- **Status Chips** mit Farbkodierung
- **Action Buttons** (View, Edit, Delete)
- **Pagination** mit konfigurierbaren Seitengrößen
- **Empty State** für keine Daten
- **Loading Spinner** während Datenabfrage

### 🔒 RLS-Integration:
- **Edit-Aktionen** nur für erlaubte Datensätze
- **Delete-Aktionen** nur wenn RLS erlaubt
- **View-Aktionen** für alle Datensätze
- **UI-Hinweise** für RLS-Beschränkungen

### 📱 Responsive Design:
- **Mobile-optimierte** Tabellen-Ansicht
- **Touch-friendly** Buttons und Aktionen
- **Scrollable** Tabellen für kleine Bildschirme
- **Stacked Layout** für mobile Geräte

## 📝 Ausgabe:

Erstelle eine vollständige, produktionsbereite React-Tabellen-Komponente mit allen notwendigen Imports, Types und Features.
`;

/**
 * Vollständige CRUD-Komponenten-Prompt
 */
export const CRUD_PROMPT_TEMPLATE = `
${BASE_PROMPT_TEMPLATE}

## 🎯 Aufgabe: Vollständige CRUD-Komponenten erstellen

Erstelle eine vollständige CRUD-Anwendung für die Tabelle \`{{TABLE_NAME}}\` mit folgenden Komponenten:

### ✅ Anforderungen:
- **Formular-Komponente** für Create/Update
- **Tabellen-Komponente** für Read/List
- **Detail-Ansicht** für einzelne Datensätze
- **Modal-Dialoge** für Formulare
- **Navigation** zwischen verschiedenen Ansichten
- **State Management** für CRUD-Operationen
- **Error Handling** und Loading States
- **RLS-Compliance** für alle Operationen

### 📋 Komponenten-Struktur:
1. **Types** (\`types/{{TABLE_NAME}}.ts\`)
2. **Form Component** (\`components/forms/{{TABLE_NAME}}Form.tsx\`)
3. **Table Component** (\`components/tables/{{TABLE_NAME}}Table.tsx\`)
4. **Page Component** (\`pages/{{TABLE_NAME}}Page.tsx\`)
5. **Tests** für alle Komponenten
6. **Documentation** mit Verwendungsbeispielen

### 🎨 UI-Features:
- **Dashboard-Layout** mit Statistiken
- **Action Buttons** für CRUD-Operationen
- **Modal-Dialoge** für Formulare
- **Snackbar-Benachrichtigungen** für Feedback
- **Loading States** für alle Operationen
- **Error Boundaries** für Fehlerbehandlung

### 🔒 RLS-Integration:
- **Create** nur wenn INSERT erlaubt
- **Read** nur wenn SELECT erlaubt
- **Update** nur wenn UPDATE erlaubt
- **Delete** nur wenn DELETE erlaubt
- **UI-Feedback** für RLS-Beschränkungen

### 📱 Responsive Design:
- **Mobile-first** Ansatz
- **Touch-friendly** Interface
- **Responsive** Tabellen und Formulare
- **Optimierte** Navigation für mobile Geräte

## 📝 Ausgabe:

Erstelle eine vollständige, produktionsbereite CRUD-Anwendung mit allen notwendigen Komponenten, Types und Features.
`;

/**
 * Prompt-Templates generieren
 */
export class CursorPromptGenerator {
  /**
   * Generiert einen vollständigen Cursor-Prompt basierend auf Schema und Template
   */
  static generatePrompt(
    schema: MCPSchema,
    template: 'form' | 'table' | 'crud',
    options: {
      language?: 'de' | 'en';
      includeTests?: boolean;
      includeDocumentation?: boolean;
    } = {}
  ): string {
    const schemaContext = this.generateSchemaContext(schema);
    
    let promptTemplate: string;
    switch (template) {
      case 'form':
        promptTemplate = FORM_PROMPT_TEMPLATE;
        break;
      case 'table':
        promptTemplate = TABLE_PROMPT_TEMPLATE;
        break;
      case 'crud':
        promptTemplate = CRUD_PROMPT_TEMPLATE;
        break;
      default:
        throw new Error(`Unbekanntes Template: ${template}`);
    }

    // Template-Variablen ersetzen
    let prompt = promptTemplate
      .replace('{{SCHEMA_CONTEXT}}', schemaContext)
      .replace(/{{TABLE_NAME}}/g, schema.table)
      .replace(/{{COMPONENT_TYPE}}/g, template === 'form' ? 'forms' : template === 'table' ? 'tables' : 'pages')
      .replace(/{{COMPONENT_NAME}}/g, this.getComponentName(schema.table, template));

    // Optionale Features hinzufügen
    if (options.includeTests) {
      prompt += '\n\n## 🧪 Tests\nErstelle umfassende Tests für alle Komponenten mit React Testing Library.';
    }

    if (options.includeDocumentation) {
      prompt += '\n\n## 📚 Dokumentation\nErstelle eine umfassende README-Dokumentation mit Verwendungsbeispielen.';
    }

    if (options.language === 'en') {
      prompt = this.translateToEnglish(prompt);
    }

    return prompt;
  }

  /**
   * Generiert Schema-Kontext für Cursor-Prompt
   */
  private static generateSchemaContext(schema: MCPSchema): string {
    return `
### Aktuelle Tabelle: \`${schema.table}\`

### Schema-Details:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

### RLS-Richtlinien:
- **SELECT**: ${schema.rls.select ? '✅ Erlaubt' : '❌ Verboten'}
- **INSERT**: ${schema.rls.insert ? '✅ Erlaubt' : '❌ Verboten'}
- **UPDATE**: ${schema.rls.update ? '✅ Erlaubt' : '❌ Verboten'}
- **DELETE**: ${schema.rls.delete ? '✅ Erlaubt' : '❌ Verboten'}

### Foreign Key Beziehungen:
${schema.columns
  .filter(col => col.foreign_key)
  .map(col => `- \`${col.name}\` → \`${col.foreign_key}\``)
  .join('\n') || '- Keine Foreign Keys definiert'}

### Validierungsregeln:
${schema.columns
  .filter(col => col.not_null || col.check || col.enum_values)
  .map(col => {
    const rules = [];
    if (col.not_null) rules.push('NOT NULL');
    if (col.check) rules.push(`CHECK: ${col.check}`);
    if (col.enum_values) rules.push(`ENUM: [${col.enum_values.join(', ')}]`);
    return `- \`${col.name}\`: ${rules.join(', ')}`;
  })
  .join('\n') || '- Keine speziellen Validierungsregeln'}

### Schema-Timestamp: ${new Date().toISOString()}
`;
  }

  /**
   * Generiert Komponenten-Namen
   */
  private static getComponentName(tableName: string, template: string): string {
    const className = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    
    switch (template) {
      case 'form':
        return `${className}Form`;
      case 'table':
        return `${className}Table`;
      case 'crud':
        return `${className}Page`;
      default:
        return className;
    }
  }

  /**
   * Übersetzt Prompt ins Englische
   */
  private static translateToEnglish(prompt: string): string {
    const translations: Record<string, string> = {
      'Erstelle eine vollständige React-Formular-Komponente': 'Create a complete React form component',
      'Erstelle eine vollständige React-Tabellen-Komponente': 'Create a complete React table component',
      'Erstelle eine vollständige CRUD-Anwendung': 'Create a complete CRUD application',
      'Anforderungen': 'Requirements',
      'Komponenten-Struktur': 'Component Structure',
      'UI-Features': 'UI Features',
      'RLS-Integration': 'RLS Integration',
      'Responsive Design': 'Responsive Design',
      'Ausgabe': 'Output',
      'Erlaubt': 'Allowed',
      'Verboten': 'Forbidden',
      'Keine Foreign Keys definiert': 'No Foreign Keys defined',
      'Keine speziellen Validierungsregeln': 'No special validation rules',
      'HINWEIS': 'NOTE',
      'Verwende ausschließlich die oben definierten Felder': 'Use only the fields defined above',
      'Erfinde KEINE zusätzlichen Felder oder Typen': 'Do NOT invent additional fields or types'
    };

    let translatedPrompt = prompt;
    Object.entries(translations).forEach(([german, english]) => {
      translatedPrompt = translatedPrompt.replace(new RegExp(german, 'g'), english);
    });

    return translatedPrompt;
  }

  /**
   * Generiert einen kurzen Prompt für schnelle Komponenten-Generierung
   */
  static generateQuickPrompt(schema: MCPSchema, componentType: string): string {
    return `
# Quick Component Generator

Generate a React component for table \`${schema.table}\` with type \`${componentType}\`.

## Schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

## Requirements:
- Use only fields from schema
- Respect RLS policies: ${JSON.stringify(schema.rls)}
- Include TypeScript types
- Use Material-UI + TailwindCSS
- German labels and messages
- Responsive design

Generate the component now.
`;
  }

  /**
   * Generiert einen Debug-Prompt für Schema-Analyse
   */
  static generateDebugPrompt(schema: MCPSchema): string {
    return `
# Schema Debug Analysis

Analyze this Supabase schema and provide insights:

## Schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

## Analysis Questions:
1. What are the primary business entities?
2. What are the foreign key relationships?
3. What RLS policies are in place?
4. What validation rules exist?
5. What UI components would be needed?
6. Any potential issues or improvements?

Provide a detailed analysis.
`;
  }
}

/**
 * Prompt-Templates für verschiedene Anwendungsfälle
 */
export const PROMPT_TEMPLATES: Record<string, CursorPromptTemplate> = {
  form: {
    name: 'Formular-Komponente',
    description: 'Erstellt eine React-Formular-Komponente basierend auf Supabase-Schema',
    template: FORM_PROMPT_TEMPLATE,
    variables: ['{{TABLE_NAME}}', '{{SCHEMA_CONTEXT}}', '{{COMPONENT_NAME}}']
  },
  table: {
    name: 'Tabellen-Komponente',
    description: 'Erstellt eine React-Tabellen-Komponente basierend auf Supabase-Schema',
    template: TABLE_PROMPT_TEMPLATE,
    variables: ['{{TABLE_NAME}}', '{{SCHEMA_CONTEXT}}', '{{COMPONENT_NAME}}']
  },
  crud: {
    name: 'CRUD-Anwendung',
    description: 'Erstellt eine vollständige CRUD-Anwendung basierend auf Supabase-Schema',
    template: CRUD_PROMPT_TEMPLATE,
    variables: ['{{TABLE_NAME}}', '{{SCHEMA_CONTEXT}}', '{{COMPONENT_NAME}}']
  }
};

export default CursorPromptGenerator; 