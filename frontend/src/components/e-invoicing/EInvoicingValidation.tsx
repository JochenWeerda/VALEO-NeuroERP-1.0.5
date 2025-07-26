import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Box,
  Chip,
  Button,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  ExpandLess,
  Refresh
} from '@mui/icons-material';
import { EInvoicingValidationResult } from '../../types/invoices';

interface EInvoicingValidationProps {
  validationResult: EInvoicingValidationResult;
  onRevalidate?: () => void;
  isLoading?: boolean;
}

/**
 * E-Invoicing Validierung Komponente
 * Zeigt Validierungsergebnisse für elektronische Rechnungen an
 */
export const EInvoicingValidation: React.FC<EInvoicingValidationProps> = ({
  validationResult,
  onRevalidate,
  isLoading = false
}) => {
  const [expanded, setExpanded] = React.useState(true);

  const getValidationIcon = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getValidationColor = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'success';
    }
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleRevalidate = () => {
    if (onRevalidate) {
      onRevalidate();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Typography variant="h6" className="text-gray-800">
              Rechnungsvalidierung
            </Typography>
            <Chip
              label={validationResult.isValid ? 'Gültig' : 'Ungültig'}
              color={validationResult.isValid ? 'success' : 'error'}
              size="small"
            />
          </div>
          <div className="flex items-center space-x-2">
            {onRevalidate && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleRevalidate}
                disabled={isLoading}
                startIcon={<Refresh />}
              >
                Neu validieren
              </Button>
            )}
            <Button
              size="small"
              variant="text"
              onClick={handleToggleExpanded}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            >
              {expanded ? 'Einklappen' : 'Ausklappen'}
            </Button>
          </div>
        </div>

        {/* Gesamtstatus */}
        {validationResult.isValid ? (
          <Alert severity="success" className="mb-4">
            <Typography variant="body2">
              Die Rechnung ist gültig und entspricht allen Anforderungen.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" className="mb-4">
            <Typography variant="body2">
              Die Rechnung enthält Fehler und muss korrigiert werden.
            </Typography>
          </Alert>
        )}

        <Collapse in={expanded}>
          {/* Fehler */}
          {validationResult.errors.length > 0 && (
            <Box className="mb-4">
              <Typography variant="subtitle1" className="mb-2 text-red-600 font-semibold">
                Fehler ({validationResult.errors.length})
              </Typography>
              <List dense className="bg-red-50 rounded-lg">
                {validationResult.errors.map((error, index) => (
                  <ListItem key={index} className="py-1">
                    <ListItemIcon className="min-w-0 mr-2">
                      {getValidationIcon('error')}
                    </ListItemIcon>
                    <ListItemText
                      primary={error}
                      primaryTypographyProps={{
                        variant: 'body2',
                        className: 'text-red-700'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Warnungen */}
          {validationResult.warnings.length > 0 && (
            <Box className="mb-4">
              <Typography variant="subtitle1" className="mb-2 text-orange-600 font-semibold">
                Warnungen ({validationResult.warnings.length})
              </Typography>
              <List dense className="bg-orange-50 rounded-lg">
                {validationResult.warnings.map((warning, index) => (
                  <ListItem key={index} className="py-1">
                    <ListItemIcon className="min-w-0 mr-2">
                      {getValidationIcon('warning')}
                    </ListItemIcon>
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{
                        variant: 'body2',
                        className: 'text-orange-700'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Erfolgreiche Validierungen */}
          {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
            <Box>
              <Typography variant="subtitle1" className="mb-2 text-green-600 font-semibold">
                Alle Prüfungen erfolgreich
              </Typography>
              <List dense className="bg-green-50 rounded-lg">
                <ListItem className="py-1">
                  <ListItemIcon className="min-w-0 mr-2">
                    {getValidationIcon('success')}
                  </ListItemIcon>
                  <ListItemText
                    primary="Rechnungsformat ist korrekt"
                    primaryTypographyProps={{
                      variant: 'body2',
                      className: 'text-green-700'
                    }}
                  />
                </ListItem>
                <ListItem className="py-1">
                  <ListItemIcon className="min-w-0 mr-2">
                    {getValidationIcon('success')}
                  </ListItemIcon>
                  <ListItemText
                    primary="Alle Pflichtfelder sind ausgefüllt"
                    primaryTypographyProps={{
                      variant: 'body2',
                      className: 'text-green-700'
                    }}
                  />
                </ListItem>
                <ListItem className="py-1">
                  <ListItemIcon className="min-w-0 mr-2">
                    {getValidationIcon('success')}
                  </ListItemIcon>
                  <ListItemText
                    primary="Steuerberechnungen sind korrekt"
                    primaryTypographyProps={{
                      variant: 'body2',
                      className: 'text-green-700'
                    }}
                  />
                </ListItem>
                <ListItem className="py-1">
                  <ListItemIcon className="min-w-0 mr-2">
                    {getValidationIcon('success')}
                  </ListItemIcon>
                  <ListItemText
                    primary="Kundeninformationen sind vollständig"
                    primaryTypographyProps={{
                      variant: 'body2',
                      className: 'text-green-700'
                    }}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </Collapse>

        {/* Zusammenfassung */}
        <Box className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Error color="error" fontSize="small" />
                <Typography variant="body2" className="text-gray-600">
                  {validationResult.errors.length} Fehler
                </Typography>
              </div>
              <div className="flex items-center space-x-1">
                <Warning color="warning" fontSize="small" />
                <Typography variant="body2" className="text-gray-600">
                  {validationResult.warnings.length} Warnungen
                </Typography>
              </div>
            </div>
            <Chip
              label={validationResult.isValid ? 'Bereit zum Versenden' : 'Korrektur erforderlich'}
              color={validationResult.isValid ? 'success' : 'error'}
              variant="outlined"
            />
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EInvoicingValidation; 