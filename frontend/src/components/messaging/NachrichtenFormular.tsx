import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Box, 
  Chip, 
  Alert,
  CircularProgress,
  Divider
} from '../../utils/muiImports';
import { messagingService } from '../../services/MessagingService';
import type { 
  NachrichtEntwurf, 
  EmpfaengerGruppe, 
  KINachrichtenVorschlag,
  NachrichtenFormData,
  NachrichtenFormErrors
} from '../../types/messaging';

interface NachrichtenFormularProps {
  onMessageSent?: (message: any) => void;
  initialData?: Partial<NachrichtEntwurf>;
  showKIVorschlaege?: boolean;
}

export const NachrichtenFormular: React.FC<NachrichtenFormularProps> = ({
  onMessageSent,
  initialData,
  showKIVorschlaege = true
}) => {
  const [formData, setFormData] = useState<NachrichtenFormData>({
    empfaengerGruppe: initialData?.empfaengerGruppe || 'allgemein',
    betreff: initialData?.betreff || '',
    inhalt: initialData?.inhalt || '',
    leseBestaetigungErforderlich: initialData?.leseBestaetigungErforderlich || false,
    archivierungErzwingen: initialData?.archivierungErzwingen || false,
    autoProtokollAnhaengen: initialData?.autoProtokollAnhaengen || false,
    prioritaet: 'normal',
    kategorie: 'allgemein',
    tags: []
  });

  const [errors, setErrors] = useState<NachrichtenFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [kiVorschlaege, setKiVorschlaege] = useState<KINachrichtenVorschlag[]>([]);
  const [showVorschlaege, setShowVorschlaege] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Empfängergruppen-Optionen
  const empfaengerGruppen: Array<{ value: EmpfaengerGruppe; label: string; description: string }> = [
    { value: 'allgemein', label: 'Allgemein', description: 'Alle Mitarbeiter' },
    { value: 'ao', label: 'AO', description: 'Auftragsorganisation' },
    { value: 'cmk', label: 'CMK', description: 'Controlling & Management' },
    { value: 'cim', label: 'CIM', description: 'Computer Integrated Manufacturing' },
    { value: 'neuroflow', label: 'NeuroFlow', description: 'KI-gestützte Prozesse' },
    { value: 'streckengeschaeft', label: 'Streckengeschäft', description: 'Lieferanten & Bestellungen' },
    { value: 'pos', label: 'POS', description: 'Point of Sale System' },
    { value: 'e-invoicing', label: 'E-Invoicing', description: 'Elektronische Rechnungen' },
    { value: 'crm', label: 'CRM', description: 'Kundenbeziehungsmanagement' },
    { value: 'admin', label: 'Administration', description: 'Systemadministratoren' },
    { value: 'ki-agenten', label: 'KI-Agenten', description: 'Automatisierte Systeme' }
  ];

  // Prioritäts-Optionen
  const prioritaeten = [
    { value: 'niedrig', label: 'Niedrig', color: 'success' },
    { value: 'normal', label: 'Normal', color: 'primary' },
    { value: 'hoch', label: 'Hoch', color: 'warning' },
    { value: 'kritisch', label: 'Kritisch', color: 'error' }
  ];

  // Kategorie-Optionen
  const kategorien = [
    { value: 'allgemein', label: 'Allgemein' },
    { value: 'bestellung', label: 'Bestellung' },
    { value: 'lieferung', label: 'Lieferung' },
    { value: 'rechnung', label: 'Rechnung' },
    { value: 'warnung', label: 'Warnung' },
    { value: 'protokoll', label: 'Protokoll' },
    { value: 'ki-nachricht', label: 'KI-Nachricht' },
    { value: 'system', label: 'System' }
  ];

  useEffect(() => {
    if (showKIVorschlaege) {
      loadKIVorschlaege();
    }
  }, [showKIVorschlaege]);

  const loadKIVorschlaege = async () => {
    try {
      const vorschlaege = await messagingService.generateKINachrichtenVorschlaege();
      setKiVorschlaege(vorschlaege);
    } catch (error) {
      console.error('Fehler beim Laden der KI-Vorschläge:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: NachrichtenFormErrors = {};

    if (!formData.betreff.trim()) {
      newErrors.betreff = 'Betreff ist erforderlich';
    }

    if (!formData.inhalt.trim()) {
      newErrors.inhalt = 'Nachrichteninhalt ist erforderlich';
    }

    if (formData.inhalt.length < 10) {
      newErrors.inhalt = 'Nachricht muss mindestens 10 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const nachricht: NachrichtEntwurf = {
        empfaengerGruppe: formData.empfaengerGruppe,
        betreff: formData.betreff,
        inhalt: formData.inhalt,
        leseBestaetigungErforderlich: formData.leseBestaetigungErforderlich,
        archivierungErzwingen: formData.archivierungErzwingen,
        autoProtokollAnhaengen: formData.autoProtokollAnhaengen,
        kiGeneriert: false,
        status: 'entwurf'
      };

      const gesendeteNachricht = await messagingService.createMessage(nachricht);
      
      setSuccessMessage('Nachricht erfolgreich gesendet!');
      
      // Formular zurücksetzen
      setFormData({
        empfaengerGruppe: 'allgemein',
        betreff: '',
        inhalt: '',
        leseBestaetigungErforderlich: false,
        archivierungErzwingen: false,
        autoProtokollAnhaengen: false,
        prioritaet: 'normal',
        kategorie: 'allgemein',
        tags: []
      });

      if (onMessageSent) {
        onMessageSent(gesendeteNachricht);
      }

    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      setErrors({ betreff: 'Fehler beim Senden der Nachricht' });
    } finally {
      setLoading(false);
    }
  };

  const handleKIVorschlag = (vorschlag: KINachrichtenVorschlag) => {
    setFormData(prev => ({
      ...prev,
      betreff: vorschlag.betreff,
      inhalt: vorschlag.inhalt,
      empfaengerGruppe: vorschlag.empfaengerGruppe,
      prioritaet: vorschlag.prioritaet
    }));
    setShowVorschlaege(false);
  };

  const handleTagesprotokollEinfuegen = async () => {
    try {
      setLoading(true);
      const protokoll = await messagingService.generateTagesprotokoll();
      setFormData(prev => ({
        ...prev,
        inhalt: prev.inhalt + `\n\n--- Tagesprotokoll ---\n${protokoll.zusammenfassung}\n\nBestellungen: ${protokoll.bestellungen}\nLieferungen: ${protokoll.lieferungen}\nRechnungen: ${protokoll.rechnungen}`
      }));
    } catch (error) {
      console.error('Fehler beim Einfügen des Tagesprotokolls:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Typography variant="h5" gutterBottom className="text-gray-800 mb-6">
          ✉️ Nachricht versenden
        </Typography>

        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Empfängergruppe */}
          <FormControl fullWidth error={!!errors.empfaengerGruppe}>
            <InputLabel>Empfängergruppe</InputLabel>
            <Select
              value={formData.empfaengerGruppe}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                empfaengerGruppe: e.target.value as EmpfaengerGruppe 
              }))}
              label="Empfängergruppe"
            >
              {empfaengerGruppen.map(gruppe => (
                <MenuItem key={gruppe.value} value={gruppe.value}>
                  <Box>
                    <Typography variant="body1">{gruppe.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {gruppe.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Betreff */}
          <TextField
            fullWidth
            label="Betreff"
            value={formData.betreff}
            onChange={(e) => setFormData(prev => ({ ...prev, betreff: e.target.value }))}
            error={!!errors.betreff}
            helperText={errors.betreff}
            placeholder="z.B. Tagesprotokoll vom 25.07.2025"
          />

          {/* Nachrichteninhalt */}
          <TextField
            fullWidth
            label="Nachricht"
            value={formData.inhalt}
            onChange={(e) => setFormData(prev => ({ ...prev, inhalt: e.target.value }))}
            error={!!errors.inhalt}
            helperText={errors.inhalt}
            multiline
            rows={6}
            placeholder="Geben Sie hier Ihre Nachricht ein..."
          />

          {/* Priorität und Kategorie */}
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Priorität</InputLabel>
              <Select
                value={formData.prioritaet}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  prioritaet: e.target.value as any 
                }))}
                label="Priorität"
              >
                {prioritaeten.map(prioritaet => (
                  <MenuItem key={prioritaet.value} value={prioritaet.value}>
                    <Chip 
                      label={prioritaet.label} 
                      color={prioritaet.color as any} 
                      size="small" 
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={formData.kategorie}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  kategorie: e.target.value as any 
                }))}
                label="Kategorie"
              >
                {kategorien.map(kategorie => (
                  <MenuItem key={kategorie.value} value={kategorie.value}>
                    {kategorie.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Checkbox-Optionen */}
          <Box className="space-y-2">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.leseBestaetigungErforderlich}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    leseBestaetigungErforderlich: e.target.checked 
                  }))}
                />
              }
              label="Empfänger sollen Lesen bestätigen"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.archivierungErzwingen}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    archivierungErzwingen: e.target.checked 
                  }))}
                />
              }
              label="Nachricht wird nicht gelöscht (Archivierung)"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.autoProtokollAnhaengen}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    autoProtokollAnhaengen: e.target.checked 
                  }))}
                />
              }
              label="Tagesprotokoll automatisch anhängen"
            />
          </Box>

          {/* KI-Vorschläge */}
          {showKIVorschlaege && kiVorschlaege.length > 0 && (
            <Box>
              <Button
                variant="outlined"
                onClick={() => setShowVorschlaege(!showVorschlaege)}
                className="mb-2"
              >
                🤖 KI-Vorschläge anzeigen ({kiVorschlaege.length})
              </Button>

              {showVorschlaege && (
                <Card variant="outlined" className="mt-2">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      KI-Vorschläge
                    </Typography>
                    <Box className="space-y-2">
                      {kiVorschlaege.map((vorschlag, index) => (
                        <Box key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleKIVorschlag(vorschlag)}>
                          <Typography variant="subtitle2" className="font-semibold">
                            {vorschlag.betreff}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" className="mt-1">
                            {vorschlag.inhalt.substring(0, 100)}...
                          </Typography>
                          <Box display="flex" gap={1} className="mt-2">
                            <Chip label={vorschlag.empfaengerGruppe} size="small" />
                            <Chip label={`${(vorschlag.konfidenz * 100).toFixed(0)}%`} size="small" color="primary" />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          <Divider />

          {/* Aktions-Buttons */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleTagesprotokollEinfuegen}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              📋 Tagesprotokoll einfügen
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Sende...' : '✉️ Senden'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default NachrichtenFormular; 