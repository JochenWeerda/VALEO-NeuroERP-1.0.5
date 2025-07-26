import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import {
  ObjectPageHeader,
  ObjectListItem,
  ActionBar,
  QuickViewCard,
  StatusIndicator,
  DataTableToolbar,
  SectionHeader,
  MessageStrip
} from '../components/ui/NeuroFlowComponents';

const NeuroFlowDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [showMessage, setShowMessage] = useState(true);

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
  };

  const mockCustomers = [
    {
      id: '1',
      name: 'Max Mustermann',
      company: 'Muster GmbH',
      email: 'max@example.com',
      status: 'Aktiv',
      value: '25.000€'
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      company: 'Schmidt AG',
      email: 'anna@schmidt.de',
      status: 'Prospekt',
      value: '15.000€'
    },
    {
      id: '3',
      name: 'Peter Weber',
      company: 'Weber & Co',
      email: 'peter@weber.com',
      status: 'Aktiv',
      value: '35.000€'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      {/* Object Page Header */}
      <ObjectPageHeader
        title="VALEO NeuroERP Demo"
        subtitle="NeuroFlow Design System"
        avatar="/valeo-logo.png"
        status="Aktiv"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />}>
              Bearbeiten
            </Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              Neu erstellen
            </Button>
          </Box>
        }
      />

      {/* Message Strip */}
      {showMessage && (
        <Box sx={{ px: 3 }}>
          <MessageStrip
            type="info"
            title="Willkommen"
            onClose={() => setShowMessage(false)}
          >
            Dies ist eine Demo des neuen NeuroFlow Design-Systems für VALEO NeuroERP.
          </MessageStrip>
        </Box>
      )}

      {/* Action Bar */}
      <ActionBar
        title="Kundenverwaltung"
        actions={[
          {
            label: 'Neuer Kunde',
            icon: <AddIcon />,
            onClick: () => handleAction('Neuer Kunde'),
            variant: 'contained'
          },
          {
            label: 'Exportieren',
            icon: <DownloadIcon />,
            onClick: () => handleAction('Exportieren'),
            variant: 'outlined'
          },
          {
            label: 'Aktualisieren',
            icon: <RefreshIcon />,
            onClick: () => handleAction('Aktualisieren'),
            variant: 'text'
          }
        ]}
      />

      <Box sx={{ p: 3 }}>
        {/* Data Table Toolbar */}
        <DataTableToolbar
          title="Kundenliste"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">
                Filter
              </Button>
              <Button size="small" variant="outlined">
                Sortieren
              </Button>
            </Box>
          }
        />

        {/* Object List Items */}
        <Box sx={{ mb: 4 }}>
          {mockCustomers.map((customer) => (
            <ObjectListItem
              key={customer.id}
              title={customer.name}
              subtitle={customer.company}
              description={customer.email}
              status={customer.status}
              avatar={`https://ui-avatars.com/api/?name=${customer.name}&background=0A6ED1&color=fff`}
              actions={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              onClick={() => handleAction(`Kunde öffnen: ${customer.name}`)}
            />
          ))}
        </Box>

        {/* Quick View Cards */}
        <SectionHeader
          title="Übersicht"
          subtitle="Wichtige Kennzahlen und Status"
        />
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 3, 
          mb: 4 
        }}>
          <QuickViewCard
            title="Kunden"
            icon={<PeopleIcon />}
            actions={
              <IconButton size="small">
                <ViewIcon />
              </IconButton>
            }
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#0A6ED1', mb: 1 }}>
                1,247
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Aktive Kunden
              </Typography>
              <StatusIndicator
                status="success"
                label="+12% vs. Vormonat"
                size="small"
              />
            </Box>
          </QuickViewCard>

          <QuickViewCard
            title="Umsatz"
            icon={<AccountBalanceIcon />}
            actions={
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            }
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#107C41', mb: 1 }}>
                2.4M€
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Umsatz Q4 2024
              </Typography>
              <StatusIndicator
                status="success"
                label="+8.5% vs. Q3"
                size="small"
              />
            </Box>
          </QuickViewCard>

          <QuickViewCard
            title="Bestand"
            icon={<InventoryIcon />}
            actions={
              <IconButton size="small">
                <ViewIcon />
              </IconButton>
            }
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#E9730C', mb: 1 }}>
                456
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Artikel im Bestand
              </Typography>
              <StatusIndicator
                status="warning"
                label="3 Artikel niedrig"
                size="small"
              />
            </Box>
          </QuickViewCard>
        </Box>

        {/* Status Indicators Demo */}
        <SectionHeader
          title="Status-Übersicht"
          subtitle="Verschiedene Status-Indikatoren"
        />
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2, 
          mb: 4 
        }}>
          <StatusIndicator status="success" label="Erfolgreich abgeschlossen" />
          <StatusIndicator status="warning" label="Wartung erforderlich" />
          <StatusIndicator status="error" label="Kritischer Fehler" />
          <StatusIndicator status="info" label="Information verfügbar" />
          <StatusIndicator status="neutral" label="Neutraler Status" />
        </Box>

        {/* Message Strips Demo */}
        <SectionHeader
          title="Nachrichten"
          subtitle="Verschiedene Nachrichtentypen"
        />
        
        <Box sx={{ space: 2 }}>
          <MessageStrip type="success" title="Erfolg">
            Die Operation wurde erfolgreich abgeschlossen.
          </MessageStrip>
          
          <MessageStrip type="warning" title="Warnung">
            Bitte überprüfen Sie die Eingabedaten vor dem Speichern.
          </MessageStrip>
          
          <MessageStrip type="error" title="Fehler">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </MessageStrip>
          
          <MessageStrip type="info" title="Information">
            Neue Funktionen sind verfügbar. Klicken Sie hier für Details.
          </MessageStrip>
        </Box>
      </Box>
    </Box>
  );
};

export default NeuroFlowDemo; 