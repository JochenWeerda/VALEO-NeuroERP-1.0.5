import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Divider, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  TextField,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export interface BelegFormBaseProps {
  title: string;
  belegData: any;
  onSave: (data: any) => Promise<void>;
  onBack: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
  children: React.ReactNode;
  steps?: string[];
  activeStep?: number;
  setActiveStep?: (step: number) => void;
  loading?: boolean;
  error?: string;
  readOnly?: boolean;
}

const BelegFormBase: React.FC<BelegFormBaseProps> = ({
  title,
  belegData,
  onSave,
  onBack,
  onPrint,
  onEmail,
  children,
  steps,
  activeStep = 0,
  setActiveStep,
  loading = false,
  error,
  readOnly = false
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (readOnly) return;
    
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(belegData);
    } catch (err: any) {
      setSaveError(err.message || 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (setActiveStep && steps && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (setActiveStep && activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Box>
        <Box>
          {onEmail && (
            <IconButton onClick={onEmail} disabled={loading || isSaving} sx={{ mr: 1 }}>
              <EmailIcon />
            </IconButton>
          )}
          {onPrint && (
            <IconButton onClick={onPrint} disabled={loading || isSaving} sx={{ mr: 1 }}>
              <PrintIcon />
            </IconButton>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading || isSaving || readOnly}
          >
            Speichern
          </Button>
        </Box>
      </Paper>

      {(error || saveError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || saveError}
        </Alert>
      )}

      {steps && steps.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {children}
              
              {steps && steps.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Zurück
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <Button onClick={handleSave} disabled={isSaving || readOnly}>
                      Fertigstellen
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>Weiter</Button>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BelegFormBase; 