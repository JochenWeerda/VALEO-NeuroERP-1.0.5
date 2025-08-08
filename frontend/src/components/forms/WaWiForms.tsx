import React from 'react';
import { ModernERPForm } from './ModernERPForm';
import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig } from '../../types/forms';
import { Typography } from '@mui/material';

/**
 * Warenwirtschaft (WaWi) Formulare
 * 
 * Diese Komponente implementiert alle WaWi-spezifischen Formulare:
 * - Artikelstammdaten
 * - Einlagerung
 * - Auslagerung
 * - Bestandsverwaltung
 * - Lieferantenverwaltung
 * - Bestellungen
 * - Inventur
 * - Qualitätskontrolle
 * - Logistik
 * - Versand
 */

interface WaWiFormProps {
  formId: string;
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const WaWiForm: React.FC<WaWiFormProps> = ({
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

// Spezialisierte Komponenten für spezifische WaWi-Formulare
export const ArtikelstammdatenForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-artikelstammdaten" {...props} />
);

export const EinlagerungForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-einlagerung" {...props} />
);

export const AuslagerungForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-auslagerung" {...props} />
);

export const BestandsverwaltungForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-bestandsverwaltung" {...props} />
);

export const LieferantenverwaltungForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-lieferantenverwaltung" {...props} />
);

export const BestellungenForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-bestellungen" {...props} />
);

export const InventurForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-inventur" {...props} />
);

export const QualitaetskontrolleForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-qualitaetskontrolle" {...props} />
);

export const LogistikForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-logistik" {...props} />
);

export const VersandForm: React.FC<Omit<WaWiFormProps, 'formId'>> = (props) => (
  <WaWiForm formId="wawi-versand" {...props} />
);

// Container-Komponente für WaWi-Formular-Verwaltung
export const WaWiFormContainer: React.FC<{
  selectedForm: string;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ selectedForm, mode, initialData, onSave, onCancel }) => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const wawiForms = formRegistry.getFormsByModule('warenwirtschaft');

  return (
    <div className="w-full">
      <div className="mb-6">
        <Typography variant="h4" component="h2" className="text-2xl font-bold text-gray-900 mb-2">
          Warenwirtschaft - {formRegistry.getForm(selectedForm)?.metadata.name || 'Formular'}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-4">
          {formRegistry.getForm(selectedForm)?.metadata.description || 'Verwaltung von Warenwirtschaft-Prozessen'}
        </Typography>
      </div>

      <WaWiForm
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
          Verfügbare WaWi-Formulare ({wawiForms.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {wawiForms.map((form) => (
            <div
              key={form.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedForm === form.id
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
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

export default WaWiForm; 