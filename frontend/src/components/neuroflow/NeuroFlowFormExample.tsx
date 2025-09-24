import React, { useState } from 'react';
import { Card, Typography, Grid, Box, Alert } from '@mui/material';
import { 
  NeuroFlowFormField, 
  NeuroFlowFormSection, 
  NeuroFlowFormActions 
} from './NeuroFlowFormField';
import { neuroFlowColors, neuroFlowTypography } from '../../design-system/NeuroFlowTheme';

// NeuroFlow Border Radius Standards
const neuroFlowBorderRadius = {
  small: '4px',
  medium: '6px', 
  large: '8px',
  xlarge: '12px'
};

interface ExampleFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  department: string;
  role: string;
  notes: string;
  newsletter: boolean;
  terms: boolean;
}

export const NeuroFlowFormExample: React.FC = () => {
  const [formData, setFormData] = useState<ExampleFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    role: '',
    notes: '',
    newsletter: false,
    terms: false
  });

  const [errors, setErrors] = useState<Partial<ExampleFormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFieldChange = (field: keyof ExampleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ExampleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Firma ist erforderlich';
    }

    if (!formData.terms) {
      newErrors.terms = 'Sie müssen den Bedingungen zustimmen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        department: '',
        role: '',
        notes: '',
        newsletter: false,
        terms: false
      });
      setSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      department: '',
      role: '',
      notes: '',
      newsletter: false,
      terms: false
    });
    setErrors({});
    setSuccess(false);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      department: '',
      role: '',
      notes: '',
      newsletter: false,
      terms: false
    });
    setErrors({});
  };

  const departmentOptions = [
    { value: 'it', label: 'IT' },
    { value: 'hr', label: 'Personalwesen' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Vertrieb' },
    { value: 'operations', label: 'Betrieb' }
  ];

  const roleOptions = [
    { value: 'employee', label: 'Mitarbeiter' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Direktor' },
    { value: 'executive', label: 'Geschäftsführer' }
  ];

  return (
    <Card
      sx={{
        maxWidth: '800px',
        margin: '24px auto',
        padding: '32px',
        borderRadius: neuroFlowBorderRadius.xlarge,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: `1px solid ${neuroFlowColors.neutral[200]}`
      }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: '8px',
          fontFamily: neuroFlowTypography.fontFamily,
          fontSize: neuroFlowTypography.h4.fontSize,
          fontWeight: neuroFlowTypography.h4.fontWeight,
          color: neuroFlowColors.neutral[800],
          textAlign: 'center'
        }}
      >
        NeuroFlow Form Beispiel
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          marginBottom: '32px',
          fontFamily: neuroFlowTypography.fontFamily,
          fontSize: neuroFlowTypography.body1.fontSize,
          color: neuroFlowColors.neutral[600],
          textAlign: 'center'
        }}
      >
        Demonstrationsformular mit NeuroFlow Design-System
      </Typography>

      {success && (
        <Alert
          severity="success"
          sx={{
            marginBottom: '24px',
            borderRadius: neuroFlowBorderRadius.medium,
            fontFamily: neuroFlowTypography.fontFamily
          }}
        >
          Formular erfolgreich gespeichert!
        </Alert>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Persönliche Informationen */}
        <NeuroFlowFormSection
          title="Persönliche Informationen"
          subtitle="Grundlegende Kontaktdaten"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="name"
                label="Vollständiger Name"
                type="text"
                value={formData.name}
                onChange={(value) => handleFieldChange('name', value)}
                required
                error={errors.name}
                placeholder="Max Mustermann"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="email"
                label="E-Mail-Adresse"
                type="email"
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
                required
                error={errors.email}
                placeholder="max.mustermann@example.com"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="phone"
                label="Telefonnummer"
                type="text"
                value={formData.phone}
                onChange={(value) => handleFieldChange('phone', value)}
                placeholder="+49 123 456789"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="company"
                label="Firma"
                type="text"
                value={formData.company}
                onChange={(value) => handleFieldChange('company', value)}
                required
                error={errors.company}
                placeholder="Musterfirma GmbH"
              />
            </Grid>
          </Grid>
        </NeuroFlowFormSection>

        {/* Berufliche Informationen */}
        <NeuroFlowFormSection
          title="Berufliche Informationen"
          subtitle="Abteilung und Position"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="department"
                label="Abteilung"
                type="select"
                value={formData.department}
                onChange={(value) => handleFieldChange('department', value)}
                options={departmentOptions}
                placeholder="Abteilung auswählen"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <NeuroFlowFormField
                name="role"
                label="Position"
                type="select"
                value={formData.role}
                onChange={(value) => handleFieldChange('role', value)}
                options={roleOptions}
                placeholder="Position auswählen"
              />
            </Grid>
            
            <Grid item xs={12}>
              <NeuroFlowFormField
                name="notes"
                label="Zusätzliche Notizen"
                type="textarea"
                value={formData.notes}
                onChange={(value) => handleFieldChange('notes', value)}
                placeholder="Weitere Informationen oder Anmerkungen..."
                rows={4}
              />
            </Grid>
          </Grid>
        </NeuroFlowFormSection>

        {/* Einstellungen */}
        <NeuroFlowFormSection
          title="Einstellungen"
          subtitle="Präferenzen und Zustimmungen"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <NeuroFlowFormField
                name="newsletter"
                label="Newsletter abonnieren"
                type="checkbox"
                value={formData.newsletter}
                onChange={(value) => handleFieldChange('newsletter', value)}
                helperText="Erhalten Sie regelmäßige Updates und Neuigkeiten"
              />
            </Grid>
            
            <Grid item xs={12}>
              <NeuroFlowFormField
                name="terms"
                label="Ich stimme den Nutzungsbedingungen und der Datenschutzerklärung zu"
                type="checkbox"
                value={formData.terms}
                onChange={(value) => handleFieldChange('terms', value)}
                required
                error={errors.terms}
              />
            </Grid>
          </Grid>
        </NeuroFlowFormSection>

        {/* Formular-Aktionen */}
        <NeuroFlowFormActions
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onReset={handleReset}
          loading={loading}
          disabled={loading}
          submitText="Formular speichern"
          cancelText="Abbrechen"
          resetText="Zurücksetzen"
        />
      </form>
    </Card>
  );
};