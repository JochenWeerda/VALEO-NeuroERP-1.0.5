import React from 'react';
import { ModernERPForm } from './ModernERPForm';
import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig } from '../../types/forms';

/**
 * Finanzbuchhaltung (FiBu) Formulare
 * 
 * Diese Komponente implementiert alle FiBu-spezifischen Formulare:
 * - Buchungen
 * - Rechnungen
 * - Zahlungen
 * - Kontenverwaltung
 * - Kostenstellen
 * - Budgets
 * - Jahresabschluss
 * - Steuern
 * - Debitoren
 * - Kreditoren
 */

interface FiBuFormProps {
  formId: string;
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const FiBuForm: React.FC<FiBuFormProps> = ({
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

// Spezialisierte Komponenten für spezifische FiBu-Formulare
export const BuchungenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-buchungen" {...props} />
);

export const RechnungenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-rechnungen" {...props} />
);

export const ZahlungenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-zahlungen" {...props} />
);

export const KontenverwaltungForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-kontenverwaltung" {...props} />
);

export const KostenstellenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-kostenstellen" {...props} />
);

export const BudgetsForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-budgets" {...props} />
);

export const JahresabschlussForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-jahresabschluss" {...props} />
);

export const SteuernForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-steuern" {...props} />
);

export const DebitorenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-debitoren" {...props} />
);

export const KreditorenForm: React.FC<Omit<FiBuFormProps, 'formId'>> = (props) => (
  <FiBuForm formId="fibu-kreditoren" {...props} />
);

// Container-Komponente für FiBu-Formular-Verwaltung
export const FiBuFormContainer: React.FC<{
  selectedForm: string;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ selectedForm, mode, initialData, onSave, onCancel }) => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const fibuForms = formRegistry.getFormsByModule('finanzbuchhaltung');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Finanzbuchhaltung - {formRegistry.getForm(selectedForm)?.metadata.name || 'Formular'}
        </h2>
        <p className="text-gray-600">
          {formRegistry.getForm(selectedForm)?.metadata.description || 'Verwaltung von Finanzbuchhaltungs-Prozessen'}
        </p>
      </div>

      <FiBuForm
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
          Verfügbare FiBu-Formulare ({fibuForms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fibuForms.map((form) => (
            <div
              key={form.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedForm === form.id
                  ? 'bg-green-50 border-green-200 text-green-800'
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

export default FiBuForm; 