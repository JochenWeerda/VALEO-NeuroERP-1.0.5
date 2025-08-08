import React from 'react';
import { ModernERPForm } from './ModernERPForm';
import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig } from '../../types/forms';

/**
 * CRM (Kundenbeziehungsmanagement) Formulare
 * 
 * Diese Komponente implementiert alle CRM-spezifischen Formulare:
 * - Kundenverwaltung
 * - Kontakte
 * - Angebote
 * - Aufträge
 * - Verkaufschancen
 * - Marketing
 * - Kundenservice
 * - Berichte
 * - Automatisierung
 * - Integration
 */

interface CRMFormProps {
  formId: string;
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const CRMForm: React.FC<CRMFormProps> = ({
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

// Spezialisierte Komponenten für spezifische CRM-Formulare
export const KundenverwaltungForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-kundenverwaltung" {...props} />
);

export const KontakteForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-kontakte" {...props} />
);

export const AngeboteForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-angebote" {...props} />
);

export const AuftraegeForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-auftraege" {...props} />
);

export const VerkaufschancenForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-verkaufschancen" {...props} />
);

export const MarketingForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-marketing" {...props} />
);

export const KundenserviceForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-kundenservice" {...props} />
);

export const BerichteForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-berichte" {...props} />
);

export const AutomatisierungForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-automatisierung" {...props} />
);

export const IntegrationForm: React.FC<Omit<CRMFormProps, 'formId'>> = (props) => (
  <CRMForm formId="crm-integration" {...props} />
);

// Container-Komponente für CRM-Formular-Verwaltung
export const CRMFormContainer: React.FC<{
  selectedForm: string;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ selectedForm, mode, initialData, onSave, onCancel }) => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const crmForms = formRegistry.getFormsByModule('crm');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CRM - {formRegistry.getForm(selectedForm)?.metadata.name || 'Formular'}
        </h2>
        <p className="text-gray-600">
          {formRegistry.getForm(selectedForm)?.metadata.description || 'Verwaltung von Kundenbeziehungen'}
        </p>
      </div>

      <CRMForm
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
          Verfügbare CRM-Formulare ({crmForms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {crmForms.map((form) => (
            <div
              key={form.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedForm === form.id
                  ? 'bg-purple-50 border-purple-200 text-purple-800'
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

export default CRMForm; 