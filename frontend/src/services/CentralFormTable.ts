/**
 * Zentrale Formular-Tabelle für VALEO NeuroERP 2.0
 * 
 * Diese Datei implementiert eine vollständig indexierte Tabelle aller Formulare
 * und Eingabemasken mit Versionsnummern und Berechtigungen.
 */

import { ExtendedFormRegistryService } from './ExtendedFormRegistry';
import { StandardizedFormConfig } from '../types/forms';

/**
 * Berechtigungs-Level für Formulare
 */
export enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

/**
 * Formular-Status
 */
export enum FormStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

/**
 * Formular-Eintrag in der zentralen Tabelle
 */
export interface FormTableEntry {
  // Basis-Informationen
  id: string;
  index: number;
  title: string;
  description: string;
  module: string;
  category: string;
  
  // Versionierung
  version: string;
  versionHistory: string[];
  lastModified: Date;
  createdBy: string;
  modifiedBy: string;
  
  // Status und Berechtigungen
  status: FormStatus;
  permissions: {
    read: PermissionLevel[];
    write: PermissionLevel[];
    change: PermissionLevel[];
    admin: PermissionLevel[];
  };
  
  // Technische Details
  componentPath: string;
  validationSchema: string;
  dependencies: string[];
  
  // Metadaten
  tags: string[];
  priority: number;
  complexity: 'low' | 'medium' | 'high';
  
  // Workflow-Integration
  workflowSteps: string[];
  belegfolge: string[];
  
  // UI/UX Details
  uiComponents: string[];
  responsiveBreakpoints: string[];
  accessibilityLevel: 'A' | 'AA' | 'AAA';
}

/**
 * Modul-Kategorien
 */
export const MODULE_CATEGORIES = {
  WARENWIRTSCHAFT: 'warenwirtschaft',
  FINANZBUCHHALTUNG: 'finanzbuchhaltung',
  CRM: 'crm',
  CROSS_CUTTING: 'crosscutting'
} as const;

/**
 * Formular-Kategorien pro Modul
 */
export const FORM_CATEGORIES = {
  [MODULE_CATEGORIES.WARENWIRTSCHAFT]: [
    'artikelstammdaten',
    'artikel-management',
    'lager-management',
    'bestell-management',
    'lieferanten-management',
    'qualitaets-management',
    'logistik-management',
    'einlagerung',
    'auslagerung',
    'bestandsverwaltung',
    'lieferantenverwaltung',
    'bestellungen',
    'inventur',
    'qualitaetskontrolle',
    'logistik',
    'versand'
  ],
  [MODULE_CATEGORIES.FINANZBUCHHALTUNG]: [
    'buchung',
    'rechnung',
    'konten-management',
    'buchungs-management',
    'rechnungs-management',
    'zahlungs-management',
    'kostenstellen',
    'budget-management',
    'zahlungen',
    'kontenverwaltung',
    'kostenstellen',
    'budgets',
    'jahresabschluss',
    'steuern',
    'debitoren',
    'kreditoren'
  ],
  [MODULE_CATEGORIES.CRM]: [
    'kunde',
    'kunden-management',
    'kontakte',
    'angebote',
    'auftraege',
    'kontaktverwaltung',
    'angebote',
    'auftraege',
    'verkaufschancen',
    'marketing',
    'kundenservice',
    'berichte',
    'automatisierung',
    'integration'
  ],
  [MODULE_CATEGORIES.CROSS_CUTTING]: [
    'benutzerverwaltung',
    'rollen-berechtigungen',
    'systemeinstellungen',
    'workflow-engine',
    'berichte-analytics',
    'benutzerverwaltung',
    'rollenberechtigungen',
    'systemeinstellungen',
    'workflowengine',
    'berichteanalytics',
    'integration',
    'backupwiederherstellung',
    'monitoring',
    'apimanagement',
    'dokumentenverwaltung'
  ]
} as const;

/**
 * Standard-Berechtigungen pro Modul
 */
export const MODULE_PERMISSIONS = {
  [MODULE_CATEGORIES.WARENWIRTSCHAFT]: {
    read: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
    write: [PermissionLevel.WRITE, PermissionLevel.ADMIN],
    change: [PermissionLevel.ADMIN],
    admin: [PermissionLevel.ADMIN]
  },
  [MODULE_CATEGORIES.FINANZBUCHHALTUNG]: {
    read: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
    write: [PermissionLevel.WRITE, PermissionLevel.ADMIN],
    change: [PermissionLevel.ADMIN],
    admin: [PermissionLevel.ADMIN]
  },
  [MODULE_CATEGORIES.CRM]: {
    read: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
    write: [PermissionLevel.WRITE, PermissionLevel.ADMIN],
    change: [PermissionLevel.ADMIN],
    admin: [PermissionLevel.ADMIN]
  },
  [MODULE_CATEGORIES.CROSS_CUTTING]: {
    read: [PermissionLevel.ADMIN],
    write: [PermissionLevel.ADMIN],
    change: [PermissionLevel.ADMIN],
    admin: [PermissionLevel.ADMIN]
  }
} as const;

/**
 * Zentrale Formular-Tabelle Service
 * 
 * Verwaltet alle Formulare und Eingabemasken mit vollständiger Indexierung,
 * Versionsnummern und Berechtigungen.
 */
export class CentralFormTableService {
  private static instance: CentralFormTableService;
  private formTable: Map<string, FormTableEntry> = new Map();
  private indexCounter: number = 1;

  private constructor() {
    this.initializeFormTable();
  }

  public static getInstance(): CentralFormTableService {
    if (!CentralFormTableService.instance) {
      CentralFormTableService.instance = new CentralFormTableService();
    }
    return CentralFormTableService.instance;
  }

  /**
   * Initialisiert die Formular-Tabelle mit allen Formularen
   */
  private initializeFormTable(): void {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    const allForms = formRegistry.getAllForms();

    allForms.forEach(formConfig => {
      const tableEntry = this.createFormTableEntry(formConfig);
      this.formTable.set(formConfig.id, tableEntry);
    });
  }

  /**
   * Erstellt einen Formular-Tabellen-Eintrag aus einer Formular-Konfiguration
   */
  private createFormTableEntry(formConfig: StandardizedFormConfig): FormTableEntry {
    const category = this.determineCategory(formConfig);
    const complexity = this.calculateComplexity(formConfig);
    const priority = this.calculatePriority(formConfig);
    const dependencies = this.extractDependencies(formConfig);
    const tags = this.generateTags(formConfig);
    const uiComponents = this.extractUIComponents(formConfig);

    return {
      // Basis-Informationen
      id: formConfig.id,
      index: this.indexCounter++,
      title: formConfig.metadata.name,
      description: formConfig.metadata.description,
      module: formConfig.module,
      category: category,
      
      // Versionierung
      version: formConfig.metadata.version,
      versionHistory: [formConfig.metadata.version],
      lastModified: new Date(),
      createdBy: 'system',
      modifiedBy: 'system',
      
      // Status und Berechtigungen
      status: FormStatus.ACTIVE,
      permissions: {
        read: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
        write: [PermissionLevel.WRITE, PermissionLevel.ADMIN],
        change: [PermissionLevel.WRITE, PermissionLevel.ADMIN],
        admin: [PermissionLevel.ADMIN]
      },
      
      // Technische Details
      componentPath: this.getComponentPath(formConfig.module),
      validationSchema: formConfig.validationSchema ? 'Zod Schema' : 'Kein Schema',
      dependencies: dependencies,
      
      // Metadaten
      tags: tags,
      priority: priority,
      complexity: complexity,
      
      // Workflow-Integration
      workflowSteps: formConfig.workflow?.steps?.map(step => step.name) || [],
      belegfolge: formConfig.workflow?.steps?.map(step => step.name) || [],
      
      // UI/UX Details
      uiComponents: uiComponents,
      responsiveBreakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
      accessibilityLevel: 'AA'
    };
  }

  /**
   * Ermittelt die Kategorie für ein Formular
   */
  private determineCategory(formConfig: StandardizedFormConfig): string {
    const moduleCategories = FORM_CATEGORIES[formConfig.module as keyof typeof FORM_CATEGORIES];
    
    // Versuche Kategorie aus ID zu extrahieren
    const idParts = formConfig.id.split('-');
    if (idParts.length >= 2) {
      const potentialCategory = idParts[1];
      if (Array.isArray(moduleCategories) && moduleCategories.includes(potentialCategory)) {
        return potentialCategory;
      }
    }
    
    // Fallback auf erste verfügbare Kategorie
    return Array.isArray(moduleCategories) ? moduleCategories[0] : 'allgemein';
  }

  /**
   * Berechnet die Komplexität eines Formulars
   */
  private calculateComplexity(formConfig: StandardizedFormConfig): 'low' | 'medium' | 'high' {
    const fieldCount = this.countFields(formConfig);
    const validationCount = this.countValidationRules(formConfig);
    
    const complexityScore = fieldCount + (validationCount * 0.5);
    
    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 15) return 'medium';
    return 'high';
  }

  /**
   * Zählt die Felder in einem Formular
   */
  private countFields(formConfig: StandardizedFormConfig): number {
    let count = 0;
    formConfig.layout.tabs?.forEach(tab => {
      count += tab.fields?.length || 0;
    });
    return count;
  }

  /**
   * Zählt die Validierungsregeln in einem Formular
   */
  private countValidationRules(formConfig: StandardizedFormConfig): number {
    if (!formConfig.validationSchema) return 0;
    
    // Einfache Schätzung basierend auf Schema-Komplexität
    const schemaString = formConfig.validationSchema.toString();
    const requiredFields = (schemaString.match(/required/g) || []).length;
    const minValidations = (schemaString.match(/min/g) || []).length;
    const maxValidations = (schemaString.match(/max/g) || []).length;
    
    return requiredFields + minValidations + maxValidations;
  }

  /**
   * Berechnet die Priorität eines Formulars
   */
  private calculatePriority(formConfig: StandardizedFormConfig): number {
    let priority = 50; // Basis-Priorität
    
    // Modul-spezifische Prioritäten
    switch (formConfig.module) {
      case 'warenwirtschaft':
        priority += 10;
        break;
      case 'finanzbuchhaltung':
        priority += 15;
        break;
      case 'crm':
        priority += 5;
        break;
      case 'crosscutting':
        priority += 20;
        break;
    }
    
    // Kategorie-spezifische Prioritäten
    const category = this.determineCategory(formConfig);
    if (category.includes('management')) priority += 5;
    if (category.includes('verwaltung')) priority += 5;
    if (category.includes('berichte')) priority += 3;
    if (category.includes('archiv')) priority -= 5;
    
    return Math.max(1, Math.min(100, priority));
  }

  /**
   * Extrahiert Abhängigkeiten aus einem Formular
   */
  private extractDependencies(formConfig: StandardizedFormConfig): string[] {
    const dependencies: string[] = [];
    
    // Abhängigkeiten basierend auf Modul
    switch (formConfig.module) {
      case 'warenwirtschaft':
        dependencies.push('artikelstammdaten', 'lagerverwaltung');
        break;
      case 'finanzbuchhaltung':
        dependencies.push('kontenrahmen', 'buchungsvorlagen');
        break;
      case 'crm':
        dependencies.push('kundenverwaltung', 'kontaktverwaltung');
        break;
      case 'crosscutting':
        dependencies.push('benutzerverwaltung', 'rollenverwaltung');
        break;
    }
    
    return dependencies;
  }

  /**
   * Generiert Tags für ein Formular
   */
  private generateTags(formConfig: StandardizedFormConfig): string[] {
    const tags: string[] = [];
    
    // Modul-Tags
    tags.push(formConfig.module);
    
    // Kategorie-Tags
    const category = this.determineCategory(formConfig);
    tags.push(category);
    
    // Funktions-Tags
    if (formConfig.id.includes('verwaltung')) tags.push('verwaltung');
    if (formConfig.id.includes('berichte')) tags.push('berichte');
    if (formConfig.id.includes('archiv')) tags.push('archiv');
    if (formConfig.id.includes('import')) tags.push('import');
    if (formConfig.id.includes('export')) tags.push('export');
    if (formConfig.id.includes('optimierung')) tags.push('optimierung');
    if (formConfig.id.includes('historie')) tags.push('historie');
    
    // Komplexitäts-Tags
    const complexity = this.calculateComplexity(formConfig);
    tags.push(complexity);
    
    return tags;
  }

  /**
   * Extrahiert UI-Komponenten aus einem Formular
   */
  private extractUIComponents(formConfig: StandardizedFormConfig): string[] {
    const components: string[] = [];
    
    // Basis-Komponenten
    components.push('FormContainer');
    components.push('FormHeader');
    components.push('FormFooter');
    
    // Layout-spezifische Komponenten
    if (formConfig.layout.type === 'tabs') {
      components.push('TabNavigation');
      components.push('TabContent');
    }
    
    // Feld-spezifische Komponenten (vereinfacht, da field jetzt String ist)
    formConfig.layout.tabs?.forEach(tab => {
      if (tab.fields && tab.fields.length > 0) {
        components.push('TextField'); // Standard für alle Felder
        components.push('FormField');
      }
    });
    
    return [...new Set(components)]; // Entferne Duplikate
  }

  /**
   * Ermittelt den Komponenten-Pfad für ein Modul
   */
  private getComponentPath(module: string): string {
    switch (module) {
      case 'warenwirtschaft':
        return 'components/forms/WaWiForms';
      case 'finanzbuchhaltung':
        return 'components/forms/FiBuForms';
      case 'crm':
        return 'components/forms/CRMForms';
      case 'crosscutting':
        return 'components/forms/CrossCuttingForms';
      default:
        return 'components/forms/ModernERPForm';
    }
  }

  /**
   * Ermittelt Berechtigungen für ein Modul
   */
  private getModulePermissions(module: string) {
    return MODULE_PERMISSIONS[module as keyof typeof MODULE_PERMISSIONS] || MODULE_PERMISSIONS[MODULE_CATEGORIES.CROSS_CUTTING];
  }

  // ============================================================================
  // ÖFFENTLICHE API-METHODEN
  // ============================================================================

  /**
   * Gibt alle Formular-Einträge zurück
   */
  public getAllFormEntries(): FormTableEntry[] {
    return Array.from(this.formTable.values());
  }

  /**
   * Gibt einen spezifischen Formular-Eintrag zurück
   */
  public getFormEntry(formId: string): FormTableEntry | undefined {
    return this.formTable.get(formId);
  }

  /**
   * Gibt alle Formulare eines Moduls zurück
   */
  public getFormsByModule(module: string): FormTableEntry[] {
    return Array.from(this.formTable.values()).filter(entry => entry.module === module);
  }

  /**
   * Gibt alle Formulare einer Kategorie zurück
   */
  public getFormsByCategory(category: string): FormTableEntry[] {
    return Array.from(this.formTable.values()).filter(entry => entry.category === category);
  }

  /**
   * Gibt alle Formulare mit einem bestimmten Status zurück
   */
  public getFormsByStatus(status: FormStatus): FormTableEntry[] {
    return Array.from(this.formTable.values()).filter(entry => entry.status === status);
  }

  /**
   * Gibt alle Formulare mit einer bestimmten Komplexität zurück
   */
  public getFormsByComplexity(complexity: 'low' | 'medium' | 'high'): FormTableEntry[] {
    return Array.from(this.formTable.values()).filter(entry => entry.complexity === complexity);
  }

  /**
   * Sucht Formulare nach einem Suchbegriff
   */
  public searchForms(searchTerm: string): FormTableEntry[] {
    const term = searchTerm.toLowerCase();
    return Array.from(this.formTable.values()).filter(entry => 
      entry.title.toLowerCase().includes(term) ||
      entry.description.toLowerCase().includes(term) ||
      entry.id.toLowerCase().includes(term) ||
      entry.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  /**
   * Gibt Statistiken der Formular-Tabelle zurück
   */
  public getTableStatistics(): {
    total: number;
    byModule: Record<string, number>;
    byStatus: Record<string, number>;
    byComplexity: Record<string, number>;
    byCategory: Record<string, number>;
    averagePriority: number;
    versionDistribution: Record<string, number>;
  } {
    const entries = Array.from(this.formTable.values());
    
    return {
      total: entries.length,
      byModule: this.groupBy(entries, 'module'),
      byStatus: this.groupBy(entries, 'status'),
      byComplexity: this.groupBy(entries, 'complexity'),
      byCategory: this.groupBy(entries, 'category'),
      averagePriority: this.calculateAveragePriority(entries),
      versionDistribution: this.getVersionDistribution(entries)
    };
  }

  /**
   * Gruppiert Einträge nach einem Feld
   */
  private groupBy(entries: FormTableEntry[], field: keyof FormTableEntry): Record<string, number> {
    const groups: Record<string, number> = {};
    entries.forEach(entry => {
      const value = String(entry[field]);
      groups[value] = (groups[value] || 0) + 1;
    });
    return groups;
  }

  /**
   * Berechnet die durchschnittliche Priorität
   */
  private calculateAveragePriority(entries: FormTableEntry[]): number {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.priority, 0);
    return Math.round(sum / entries.length);
  }

  /**
   * Gibt die Versionsverteilung zurück
   */
  private getVersionDistribution(entries: FormTableEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    entries.forEach(entry => {
      distribution[entry.version] = (distribution[entry.version] || 0) + 1;
    });
    return distribution;
  }

  // ============================================================================
  // VERWALTUNGS-METHODEN
  // ============================================================================

  /**
   * Aktualisiert Berechtigungen für ein Formular
   */
  public updateFormPermissions(formId: string, permissions: Partial<FormTableEntry['permissions']>): boolean {
    const entry = this.formTable.get(formId);
    if (!entry) return false;
    
    entry.permissions = { ...entry.permissions, ...permissions };
    entry.lastModified = new Date();
    entry.modifiedBy = 'admin';
    
    return true;
  }

  /**
   * Aktualisiert den Status eines Formulars
   */
  public updateFormStatus(formId: string, status: FormStatus): boolean {
    const entry = this.formTable.get(formId);
    if (!entry) return false;
    
    entry.status = status;
    entry.lastModified = new Date();
    entry.modifiedBy = 'admin';
    
    return true;
  }

  /**
   * Fügt eine neue Version zu einem Formular hinzu
   */
  public addFormVersion(formId: string, newVersion: string): boolean {
    const entry = this.formTable.get(formId);
    if (!entry) return false;
    
    entry.versionHistory.push(newVersion);
    entry.version = newVersion;
    entry.lastModified = new Date();
    entry.modifiedBy = 'admin';
    
    return true;
  }

  /**
   * Exportiert die Formular-Tabelle als JSON
   */
  public exportTable(): string {
    const data = {
      exportDate: new Date().toISOString(),
      totalForms: this.formTable.size,
      forms: Array.from(this.formTable.values())
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importiert eine Formular-Tabelle aus JSON
   */
  public importTable(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.forms && Array.isArray(data.forms)) {
        this.formTable.clear();
        data.forms.forEach((form: FormTableEntry) => {
          this.formTable.set(form.id, form);
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Importieren der Formular-Tabelle:', error);
      return false;
    }
  }
}

export default CentralFormTableService; 