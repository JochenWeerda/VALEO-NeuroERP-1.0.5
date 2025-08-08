/**
 * Zentrale Export-Datei für alle Formular-Komponenten
 *
 * Diese Datei exportiert alle Formular-Komponenten und Services
 * für eine einfache Integration in andere Teile der Anwendung.
 */

import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig, FormTab, FormTimeline, TimelineStep, Belegfolge, WorkflowStep, FormLayout, FormTemplate } from '../../types/forms';

// Bestehende Formular-Komponenten (für Kompatibilität)
export { default as SimpleForm } from './SimpleForm';
export { default as InvoiceForm } from './InvoiceForm';
export { default as OptimizedSimpleForm } from './OptimizedSimpleForm';
export { default as ExampleOptimizedForm } from './ExampleOptimizedForm';

// Moderne ERP-Formulare
export { ModernERPForm } from './ModernERPForm';
export { FormManager } from './FormManager';

// WaWi-Formulare
export {
  WaWiForm,
  WaWiFormContainer,
  ArtikelstammdatenForm,
  EinlagerungForm,
  AuslagerungForm,
  BestandsverwaltungForm,
  LieferantenverwaltungForm,
  BestellungenForm,
  InventurForm,
  QualitaetskontrolleForm,
  LogistikForm,
  VersandForm
} from './WaWiForms';

// FiBu-Formulare
export {
  FiBuForm,
  FiBuFormContainer,
  BuchungenForm,
  RechnungenForm,
  ZahlungenForm,
  KontenverwaltungForm,
  KostenstellenForm,
  BudgetsForm,
  JahresabschlussForm,
  SteuernForm,
  DebitorenForm,
  KreditorenForm
} from './FiBuForms';

// CRM-Formulare
export {
  CRMForm,
  CRMFormContainer,
  KundenverwaltungForm,
  KontakteForm,
  AngeboteForm,
  AuftraegeForm,
  VerkaufschancenForm,
  MarketingForm,
  KundenserviceForm,
  BerichteForm,
  AutomatisierungForm,
  IntegrationForm
} from './CRMForms';

// Cross-Cutting-Formulare
export {
  CrossCuttingForm,
  CrossCuttingFormContainer,
  BenutzerverwaltungForm,
  RollenBerechtigungenForm,
  SystemeinstellungenForm,
  WorkflowEngineForm,
  BerichteAnalyticsForm,
  IntegrationForm as CrossCuttingIntegrationForm,
  BackupWiederherstellungForm,
  MonitoringForm,
  ApiManagementForm,
  DokumentenverwaltungForm
} from './CrossCuttingForms';

// Services
export { default as ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';

// Typen
export type {
  StandardizedFormConfig,
  FormTab,
  FormTimeline,
  TimelineStep,
  Belegfolge,
  WorkflowStep,
  FormLayout,
  FormTemplate
} from '../../types/forms';

/**
 * Formular-Factory für dynamische Formular-Erstellung
 */
export class FormFactory {
  /**
   * Erstellt eine Formular-Komponente basierend auf der Formular-ID
   */
  static createForm(formId: string, props: any): any {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    const formConfig = formRegistry.getForm(formId);

    if (!formConfig) {
      throw new Error(`Formular mit ID "${formId}" nicht gefunden`);
    }

    // Modul-spezifische Formular-Komponente erstellen
    switch (formConfig.module) {
      case 'warenwirtschaft':
        return { component: 'WaWiForm', formId, props };
      case 'finanzbuchhaltung':
        return { component: 'FiBuForm', formId, props };
      case 'crm':
        return { component: 'CRMForm', formId, props };
      case 'crosscutting':
        return { component: 'CrossCuttingForm', formId, props };
      default:
        return { component: 'ModernERPForm', config: formConfig, props };
    }
  }

  /**
   * Erstellt eine Container-Komponente für ein Modul
   */
  static createContainer(module: string, props: any): any {
    switch (module) {
      case 'warenwirtschaft':
        return { component: 'WaWiFormContainer', props };
      case 'finanzbuchhaltung':
        return { component: 'FiBuFormContainer', props };
      case 'crm':
        return { component: 'CRMFormContainer', props };
      case 'crosscutting':
        return { component: 'CrossCuttingFormContainer', props };
      default:
        throw new Error(`Unbekanntes Modul: ${module}`);
    }
  }
}

/**
 * Utility-Funktionen für Formular-Verwaltung
 */
export const FormUtils = {
  /**
   * Prüft, ob ein Formular existiert
   */
  formExists(formId: string): boolean {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    return formRegistry.getForm(formId) !== undefined;
  },

  /**
   * Gibt alle Formulare eines Moduls zurück
   */
  getFormsByModule(module: string) {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    return formRegistry.getFormsByModule(module);
  },

  /**
   * Gibt Statistiken über alle Formulare zurück
   */
  getFormStatistics() {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    return {
      total: formRegistry.getFormCount(),
      byModule: formRegistry.getModuleCounts()
    };
  },

  /**
   * Validiert Formular-Daten gegen das Schema
   */
  validateFormData(formId: string, data: any) {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    const formConfig = formRegistry.getForm(formId);

    if (!formConfig?.validationSchema) {
      return { valid: true, errors: null };
    }

    try {
      formConfig.validationSchema.parse(data);
      return { valid: true, errors: null };
    } catch (error: any) {
      return { valid: false, errors: error.errors };
    }
  }
};

export default {
  FormFactory,
  FormUtils
};
