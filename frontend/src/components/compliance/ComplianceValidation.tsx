import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Paper,
  Snackbar
  Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { ComplianceType, ValidationResult } from '../../types/compliance';
import { complianceService } from '../../services/complianceService';

interface FormData {
  batchId: string;
  responsiblePerson: string;
  digitalSignature: string;
  selectedTypes: ComplianceType[];
  batchData: {
    supplier_id: string;
    transport_conditions: {
      temperature: number;
      humidity: number;
    };
    supplier_batch_refs: string[];
    quality_checks: {
      moisture: number;
      temperature: number;
      contamination: number;
    };
    hygiene_protocol: {
      cleaning_date: string;
      responsible: string;
      measures: string[];
    };
    haccp_documentation: {
      version: string;
      last_update: string;
      critical_points: string[];
    };
    hazard_analysis: {
      biological: string[];
      chemical: string[];
      physical: string[];
    };
    control_measures: {
      id: string;
      type: string;
      description: string;
    }[];
    process_monitoring: {
      measurements: {
        parameter: string;
        value: number;
      }[];
    };
    eu_documentation: {
      declaration: string;
      certificates: string[];
    };
    emergency_procedures: {
      contact: string;
      procedures: string[];
    };
    information_chain: {
      supplier_info: string;
      transport_info: string;
      customer_info: string;
    };
  };
}

const ComplianceValidation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      selectedTypes: [ComplianceType.QS, ComplianceType.GMP, ComplianceType.EU_REG],
      batchData: {
        supplier_id: '',
        transport_conditions: {
          temperature: 20,
          humidity: 50
        },
        supplier_batch_refs: [],
        quality_checks: {
          moisture: 10,
          temperature: 20,
          contamination: 0.05
        },
        hygiene_protocol: {
          cleaning_date: new Date().toISOString().split('T')[0],
          responsible: '',
          measures: []
        },
        haccp_documentation: {
          version: '1.0',
          last_update: new Date().toISOString().split('T')[0],
          critical_points: []
        },
        hazard_analysis: {
          biological: [],
          chemical: [],
          physical: []
        },
        control_measures: [],
        process_monitoring: {
          measurements: []
        },
        eu_documentation: {
          declaration: '',
          certificates: []
        },
        emergency_procedures: {
          contact: '',
          procedures: []
        },
        information_chain: {
          supplier_info: '',
          transport_info: '',
          customer_info: ''
        }
      }
    }
  });
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const results = await complianceService.validateBatch(
        data.batchId,
        data.batchData,
        data.selectedTypes,
        data.responsiblePerson,
        data.digitalSignature
      );
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  const selectedTypes = watch('selectedTypes');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Compliance-Validierung
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Grunddaten
                </Typography>
                
                <Controller
                  name="batchId"
                  control={control}
                  rules={{ required: 'Chargen-ID ist erforderlich' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chargen-ID"
                      fullWidth
                      margin="normal"
                      error={!!errors.batchId}
                      helperText={errors.batchId?.message}
                    />
                  )}
                />
                
                <Controller
                  name="responsiblePerson"
                  control={control}
                  rules={{ required: 'Verantwortliche Person ist erforderlich' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Verantwortliche Person"
                      fullWidth
                      margin="normal"
                      error={!!errors.responsiblePerson}
                      helperText={errors.responsiblePerson?.message}
                    />
                  )}
                />
                
                <Controller
                  name="digitalSignature"
                  control={control}
                  rules={{ required: 'Digitale Signatur ist erforderlich' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Digitale Signatur"
                      fullWidth
                      margin="normal"
                      error={!!errors.digitalSignature}
                      helperText={errors.digitalSignature?.message}
                    />
                  )}
                />
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Compliance-Standards
                </Typography>
                
                <FormControl component="fieldset">
                  <FormGroup>
                    <Controller
                      name="selectedTypes"
                      control={control}
                      render={({ field }) => (
                        <>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value.includes(ComplianceType.QS)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, ComplianceType.QS]
                                    : field.value.filter(t => t !== ComplianceType.QS);
                                  field.onChange(newValue);
                                }}
                              />
                            }
                            label="QS-System"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value.includes(ComplianceType.GMP)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, ComplianceType.GMP]
                                    : field.value.filter(t => t !== ComplianceType.GMP);
                                  field.onChange(newValue);
                                }}
                              />
                            }
                            label="GMP+"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value.includes(ComplianceType.EU_REG)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, ComplianceType.EU_REG]
                                    : field.value.filter(t => t !== ComplianceType.EU_REG);
                                  field.onChange(newValue);
                                }}
                              />
                            }
                            label="EU-Verordnung"
                          />
                        </>
                      )}
                    />
                  </FormGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chargendaten
                </Typography>
                
                <Controller
                  name="batchData.supplier_id"
                  control={control}
                  rules={{ required: 'Lieferanten-ID ist erforderlich' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferanten-ID"
                      fullWidth
                      margin="normal"
                      error={!!errors.batchData?.supplier_id}
                      helperText={errors.batchData?.supplier_id?.message}
                    />
                  )}
                />
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Transportbedingungen
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="batchData.transport_conditions.temperature"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Temperatur (°C)"
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="batchData.transport_conditions.humidity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Luftfeuchtigkeit (%)"
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Qualitätsprüfungen
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Controller
                      name="batchData.quality_checks.moisture"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Feuchtigkeit (%)"
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name="batchData.quality_checks.temperature"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Temperatur (°C)"
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name="batchData.quality_checks.contamination"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Kontamination"
                          fullWidth
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Validierung durchführen'}
          </Button>
        </Box>
      </form>
      
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      
      {results.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Validierungsergebnisse
          </Typography>
          
          {results.map((result, index) => (
            <Card key={index} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {result.compliance_type}
                </Typography>
                
                <Alert
                  severity={
                    result.validation_result.status === 'COMPLIANT'
                      ? 'success'
                      : result.validation_result.status === 'PARTIALLY_COMPLIANT'
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ mb: 2 }}
                >
                  Status: {result.validation_result.status}
                </Alert>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Einzelprüfungen:
                </Typography>
                
                {result.validation_result.checks.map((check, checkIndex) => (
                  <Box key={checkIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {check.name}
                    </Typography>
                    <Alert
                      severity={
                        check.status === 'COMPLIANT'
                          ? 'success'
                          : check.status === 'PARTIALLY_COMPLIANT'
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ mt: 1 }}
                    >
                      {check.message}
                    </Alert>
                    {check.details && (
                      <Box sx={{ mt: 1, pl: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Details: {JSON.stringify(check.details, null, 2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary">
                  Zeitstempel: {new Date(result.validation_result.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Verantwortlich: {result.validation_result.responsible_person}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ComplianceValidation; 