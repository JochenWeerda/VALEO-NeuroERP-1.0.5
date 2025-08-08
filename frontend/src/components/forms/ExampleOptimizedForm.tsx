/**
 * VALEO NeuroERP 2.0 - Beispiel für optimiertes Formular
 * Demonstration der Horizon Beta optimierten Features
 * Serena Quality: Complete example with all ERP features
 */

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Person as PersonIcon, Business as BusinessIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import OptimizedSimpleForm from './OptimizedSimpleForm';

// Beispiel-Zod-Schema für Validierung
import * as z from 'zod';

const CustomerFormSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Firmenname ist erforderlich'),
  address: z.string().min(10, 'Adresse muss mindestens 10 Zeichen lang sein'),
  postalCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  city: z.string().min(2, 'Stadt muss mindestens 2 Zeichen lang sein'),
  country: z.string().min(2, 'Land ist erforderlich'),
  customerType: z.enum(['private', 'business', 'wholesale']),
  notes: z.string().optional(),
  newsletter: z.boolean().optional(),
  barcode: z.string().optional(),
});

type CustomerFormData = z.infer<typeof CustomerFormSchema>;

export const ExampleOptimizedForm: React.FC = () => {
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveData, setAutoSaveData] = useState<CustomerFormData | null>(null);

  // Beispiel-Felder für Kundenformular
  const customerFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Vor- und Nachname eingeben',
      icon: <PersonIcon color="action" />,
      group: 'persönlich',
      helpText: 'Geben Sie den vollständigen Namen ein',
      validation: {
        required: true,
        min: 2,
        pattern: /^[a-zA-ZäöüßÄÖÜ\s]+$/
      }
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email' as const,
      required: true,
      placeholder: 'email@beispiel.de',
      icon: <EmailIcon color="action" />,
      group: 'persönlich',
      helpText: 'Wird für Rechnungen und Benachrichtigungen verwendet',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'text' as const,
      placeholder: '+49 123 456789',
      icon: <PhoneIcon color="action" />,
      group: 'persönlich',
      helpText: 'Optional für Rückfragen',
      validation: {
        pattern: /^[\+]?[0-9\s\-\(\)]+$/
      }
    },
    {
      name: 'company',
      label: 'Firma',
      type: 'text' as const,
      required: true,
      placeholder: 'Firmenname eingeben',
      icon: <BusinessIcon color="action" />,
      group: 'geschäftlich',
      helpText: 'Name der Firma oder Organisation',
      validation: {
        required: true,
        min: 1
      }
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Straße, Hausnummer, Zusatz',
      group: 'geschäftlich',
      helpText: 'Vollständige Adresse für Lieferungen',
      validation: {
        required: true,
        min: 10
      }
    },
    {
      name: 'postalCode',
      label: 'PLZ',
      type: 'text' as const,
      required: true,
      placeholder: '12345',
      group: 'geschäftlich',
      helpText: '5-stellige Postleitzahl',
      validation: {
        required: true,
        pattern: /^\d{5}$/
      }
    },
    {
      name: 'city',
      label: 'Stadt',
      type: 'text' as const,
      required: true,
      placeholder: 'Musterstadt',
      group: 'geschäftlich',
      helpText: 'Stadt oder Gemeinde',
      validation: {
        required: true,
        min: 2
      }
    },
    {
      name: 'country',
      label: 'Land',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'DE', label: 'Deutschland' },
        { value: 'AT', label: 'Österreich' },
        { value: 'CH', label: 'Schweiz' },
        { value: 'NL', label: 'Niederlande' },
        { value: 'BE', label: 'Belgien' }
      ],
      group: 'geschäftlich',
      helpText: 'Land für internationale Lieferungen'
    },
    {
      name: 'customerType',
      label: 'Kundentyp',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'private', label: 'Privatkunde' },
        { value: 'business', label: 'Geschäftskunde' },
        { value: 'wholesale', label: 'Großhändler' }
      ],
      group: 'geschäftlich',
      helpText: 'Bestimmt Preise und Konditionen'
    },
    {
      name: 'notes',
      label: 'Notizen',
      type: 'textarea' as const,
      placeholder: 'Zusätzliche Informationen...',
      group: 'zusätzlich',
      helpText: 'Optionale Notizen zum Kunden'
    },
    {
      name: 'newsletter',
      label: 'Newsletter abonnieren',
      type: 'checkbox' as const,
      group: 'zusätzlich',
      helpText: 'Erhalten Sie aktuelle Angebote und News'
    },
    {
      name: 'barcode',
      label: 'Barcode',
      type: 'barcode' as const,
      placeholder: 'Barcode scannen oder eingeben',
      group: 'zusätzlich',
      helpText: 'Barcode für schnelle Identifikation',
      barcodeScanner: true
    }
  ];

  const handleSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulierte API-Anfrage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validierung
      const validatedData = CustomerFormSchema.parse(data);
      
      setFormData(validatedData);
      console.log('Kunde erfolgreich gespeichert:', validatedData);
      
      // Erfolgsmeldung
      alert('Kunde erfolgreich gespeichert!');
      
    } catch (err) {
      console.error('Submit error:', err);
      setError('Fehler beim Speichern des Kunden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = (data: CustomerFormData) => {
    setAutoSaveData(data);
    console.log('Auto-Save:', data);
  };

  const handleBarcodeScan = (barcode: string) => {
    console.log('Barcode gescannt:', barcode);
    // Hier würde die Barcode-Verarbeitung implementiert
  };

  const handleKeyboardShortcut = (shortcut: string) => {
    console.log('Keyboard shortcut:', shortcut);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    console.log('Field changed:', fieldName, value);
  };

  return (
    <Box className="max-w-4xl mx-auto p-6">
      <Typography variant="h4" component="h1" className="mb-6 text-center">
        VALEO NeuroERP - Optimiertes Kundenformular
      </Typography>
      
      <Typography variant="body1" className="mb-6 text-center text-gray-600">
        Horizon Beta optimiert mit Auto-Save, Keyboard-Shortcuts, Barcode-Scanner und Accessibility
      </Typography>

      {/* Feature-Übersicht */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            🚀 Optimierte Features
          </Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box>
              <Typography variant="subtitle2" className="font-semibold mb-2">
                UX/UI Verbesserungen:
              </Typography>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-Save alle 30 Sekunden</li>
                <li>• Keyboard Shortcuts (Strg+S, Esc)</li>
                <li>• Progress-Bar für Formular-Fortschritt</li>
                <li>• Gruppierte Felder für bessere Organisation</li>
                <li>• Real-time Validierung</li>
              </ul>
            </Box>
            <Box>
              <Typography variant="subtitle2" className="font-semibold mb-2">
                ERP-spezifische Features:
              </Typography>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Barcode-Scanner Integration</li>
                <li>• Conditional Fields</li>
                <li>• Accessibility (WCAG 2.1 AA)</li>
                <li>• Mobile-optimiertes Design</li>
                <li>• Performance-Optimierung</li>
              </ul>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Auto-Save Status */}
      {autoSaveData && (
        <Alert severity="info" className="mb-4">
          <strong>Auto-Save aktiv:</strong> Letzte automatische Speicherung um {new Date().toLocaleTimeString()}
        </Alert>
      )}

      {/* Optimiertes Formular */}
      <OptimizedSimpleForm
        fields={customerFields}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitText="Kunde speichern"
        cancelText="Abbrechen"
        onCancel={() => {
          console.log('Formular abgebrochen');
          setFormData(null);
        }}
        autoSave={true}
        autoSaveInterval={30000}
        showProgress={true}
        keyboardShortcuts={true}
        barcodeScanner={true}
        size="medium"
        layout="grid"
        validationSchema={CustomerFormSchema}
        onFieldChange={handleFieldChange}
        onAutoSave={handleAutoSave}
        onBarcodeScan={handleBarcodeScan}
        onKeyboardShortcut={handleKeyboardShortcut}
        className="shadow-lg"
      />

      {/* Ergebnis-Anzeige */}
      {formData && (
        <Card className="mt-6">
          <CardContent>
            <Typography variant="h6" className="mb-3">
              ✅ Erfolgreich gespeichert
            </Typography>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Verwendungshinweise */}
      <Card className="mt-6">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            📋 Verwendungshinweise
          </Typography>
          <Box className="space-y-2 text-sm">
            <Typography>
              <strong>Tastenkürzel:</strong> Strg+S (Speichern), Esc (Abbrechen), Tab (Navigation)
            </Typography>
            <Typography>
              <strong>Auto-Save:</strong> Änderungen werden automatisch alle 30 Sekunden gespeichert
            </Typography>
            <Typography>
              <strong>Barcode-Scanner:</strong> Klicken Sie auf das Barcode-Icon oder scannen Sie direkt
            </Typography>
            <Typography>
              <strong>Validierung:</strong> Real-time Validierung mit deutschen Fehlermeldungen
            </Typography>
            <Typography>
              <strong>Accessibility:</strong> Vollständig WCAG 2.1 AA konform
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExampleOptimizedForm; 