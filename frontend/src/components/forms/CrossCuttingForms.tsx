import React from 'react';
import { ModernERPForm } from './ModernERPForm';
import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig } from '../../types/forms';

/**
 * Übergreifende Services Formulare
 * 
 * Diese Komponente implementiert alle Cross-Cutting-spezifischen Formulare:
 * - Benutzerverwaltung
 * - Rollen & Berechtigungen
 * - Systemeinstellungen
 * - Workflow-Engine
 * - Berichte & Analytics
 * - Integration
 * - Backup & Wiederherstellung
 * - Monitoring
 * - API-Management
 * - Dokumentenverwaltung
 */

interface CrossCuttingFormProps {
  formId: string;
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const CrossCuttingForm: React.FC<CrossCuttingFormProps> = ({
  formId,
  initialData,
  mode,
  onSave,
  onCancel,
  className = ''
}) => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const formConfig = formRegistry.getForm(formId);

  if (!formConfig) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Formular nicht gefunden</h3>
        <p className="text-red-600">Das Formular "{formId}" ist nicht in der Registry registriert.</p>
      </div>
    );
  }

  return (
    <ModernERPForm
      config={formConfig}
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
      mode={mode}
    />
  );
};

// Spezialisierte Komponenten für spezifische Cross-Cutting-Formulare
export const BenutzerverwaltungForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-benutzerverwaltung" {...props} />
);

export const RollenBerechtigungenForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-rollen-berechtigungen" {...props} />
);

export const SystemeinstellungenForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-systemeinstellungen" {...props} />
);

export const WorkflowEngineForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-workflow-engine" {...props} />
);

export const BerichteAnalyticsForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-berichte-analytics" {...props} />
);

export const IntegrationForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-integration" {...props} />
);

export const BackupWiederherstellungForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-backup-wiederherstellung" {...props} />
);

export const MonitoringForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-monitoring" {...props} />
);

export const ApiManagementForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-api-management" {...props} />
);

export const DokumentenverwaltungForm: React.FC<Omit<CrossCuttingFormProps, 'formId'>> = (props) => (
  <CrossCuttingForm formId="crosscutting-dokumentenverwaltung" {...props} />
);

// Container-Komponente für Cross-Cutting-Formular-Verwaltung
export const CrossCuttingFormContainer: React.FC<{
  selectedForm: string;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ selectedForm, mode, initialData, onSave, onCancel }) => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const crossCuttingForms = formRegistry.getFormsByModule('crosscutting');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Übergreifende Services - {formRegistry.getForm(selectedForm)?.metadata.name || 'Formular'}
        </h2>
        <p className="text-gray-600">
          {formRegistry.getForm(selectedForm)?.metadata.description || 'Verwaltung von übergreifenden Services'}
        </p>
      </div>

      <CrossCuttingForm
        formId={selectedForm}
        mode={mode}
        initialData={initialData}
        onSave={onSave}
        onCancel={onCancel}
        className="bg-white rounded-lg shadow-sm"
      />

      {/* Formular-Übersicht */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Verfügbare Cross-Cutting-Formulare ({crossCuttingForms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {crossCuttingForms.map((form) => (
            <div
              key={form.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedForm === form.id
                  ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm">{form.metadata.name}</div>
              <div className="text-xs text-gray-500 mt-1">{form.metadata.description}</div>
              <div className="text-xs text-gray-400 mt-1">v{form.metadata.version}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossCuttingForm; 