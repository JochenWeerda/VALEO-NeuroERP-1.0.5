import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Tabs, Tab, Box, Chip, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { WaWiFormContainer } from './WaWiForms';
import { FiBuFormContainer } from './FiBuForms';
import { CRMFormContainer } from './CRMForms';
import { CrossCuttingFormContainer } from './CrossCuttingForms';
import { ExtendedFormRegistryService } from '../../services/ExtendedFormRegistry';
import { StandardizedFormConfig } from '../../types/forms';

/**
 * Zentrale Formular-Verwaltung für VALEO NeuroERP
 * 
 * Diese Komponente bietet eine einheitliche Oberfläche für:
 * - Verwaltung aller Formulare aus allen Modulen
 * - Modul-spezifische Formular-Container
 * - Formular-Statistiken und Übersichten
 * - Formular-Suche und -Filterung
 */

interface FormManagerProps {
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const FormManager: React.FC<FormManagerProps> = ({ className = '' }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const [formStats, setFormStats] = useState({
    total: 0,
    byModule: {} as Record<string, number>,
    byStatus: {} as Record<string, number>
  });

  useEffect(() => {
    // Statistiken aktualisieren
    const allForms = formRegistry.getAllForms();
    const moduleCounts = formRegistry.getModuleCounts();
    
    setFormStats({
      total: allForms.length,
      byModule: moduleCounts,
      byStatus: {
        active: allForms.filter(f => f.permissions?.canView).length,
        draft: allForms.filter(f => f.metadata.version.includes('0.')).length,
        deprecated: allForms.filter(f => f.metadata.version.includes('deprecated')).length
      }
    });

    // Standard-Formular auswählen
    if (allForms.length > 0 && !selectedForm) {
      setSelectedForm(allForms[0].id);
    }
  }, [formRegistry, selectedForm]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Erste Formular des Moduls auswählen
    const modules = ['warenwirtschaft', 'finanzbuchhaltung', 'crm', 'crosscutting'];
    const moduleForms = formRegistry.getFormsByModule(modules[newValue]);
    if (moduleForms.length > 0) {
      setSelectedForm(moduleForms[0].id);
    }
  };

  const handleFormSave = async (data: any) => {
    try {
      console.log('Formular gespeichert:', data);
      setShowFormDialog(false);
      // Hier würde die tatsächliche Speicherlogik implementiert
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleFormCancel = () => {
    setShowFormDialog(false);
    setFormData(null);
  };

  const openForm = (formId: string, mode: 'create' | 'edit' | 'view', data?: any) => {
    setSelectedForm(formId);
    setFormMode(mode);
    setFormData(data);
    setShowFormDialog(true);
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'warenwirtschaft': return <WarehouseIcon />;
      case 'finanzbuchhaltung': return <AccountBalanceIcon />;
      case 'crm': return <PeopleIcon />;
      case 'crosscutting': return <SettingsIcon />;
      default: return <SettingsIcon />;
    }
  };

  const getModuleColor = (module: string): 'primary' | 'success' | 'secondary' | 'warning' | 'default' => {
    switch (module) {
      case 'warenwirtschaft': return 'primary';
      case 'finanzbuchhaltung': return 'success';
      case 'crm': return 'secondary';
      case 'crosscutting': return 'warning';
      default: return 'default';
    }
  };

  const renderFormContainer = () => {
    const formConfig = formRegistry.getForm(selectedForm);
    if (!formConfig) return null;

    const props = {
      selectedForm,
      mode: formMode,
      initialData: formData,
      onSave: handleFormSave,
      onCancel: handleFormCancel
    };

    switch (formConfig.module) {
      case 'warenwirtschaft':
        return <WaWiFormContainer {...props} />;
      case 'finanzbuchhaltung':
        return <FiBuFormContainer {...props} />;
      case 'crm':
        return <CRMFormContainer {...props} />;
      case 'crosscutting':
        return <CrossCuttingFormContainer {...props} />;
      default:
        return <div>Unbekanntes Modul: {formConfig.module}</div>;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header mit Statistiken */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Formular-Verwaltung
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Zentrale Verwaltung aller {formStats.total} Formulare in VALEO NeuroERP
          </Typography>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <Chip 
              label={`Gesamt: ${formStats.total}`} 
              color="primary" 
              variant="outlined" 
            />
            {Object.entries(formStats.byModule).map(([module, count]) => (
              <Chip
                key={module}
                icon={getModuleIcon(module)}
                label={`${module}: ${count}`}
                color={getModuleColor(module) as any}
                variant="outlined"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modul-Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Formular-Module">
            <Tab 
              label="Warenwirtschaft" 
              icon={<WarehouseIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Finanzbuchhaltung" 
              icon={<AccountBalanceIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="CRM" 
              icon={<PeopleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Übergreifende Services" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <WaWiFormContainer
            selectedForm={selectedForm}
            mode={formMode}
            initialData={formData}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FiBuFormContainer
            selectedForm={selectedForm}
            mode={formMode}
            initialData={formData}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CRMFormContainer
            selectedForm={selectedForm}
            mode={formMode}
            initialData={formData}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <CrossCuttingFormContainer
            selectedForm={selectedForm}
            mode={formMode}
            initialData={formData}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </TabPanel>
      </Card>

      {/* Formular-Dialog */}
      <Dialog 
        open={showFormDialog} 
        onClose={handleFormCancel}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          {formRegistry.getForm(selectedForm)?.metadata.name || 'Formular'}
          <Chip 
            label={formMode} 
            color={formMode === 'create' ? 'success' : formMode === 'edit' ? 'primary' : 'default'}
            size="small"
            className="ml-2"
          />
        </DialogTitle>
        <DialogContent>
          {renderFormContainer()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormCancel}>Abbrechen</Button>
          <Button 
            onClick={() => handleFormSave(formData)} 
            variant="contained"
            disabled={formMode === 'view'}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormManager; 