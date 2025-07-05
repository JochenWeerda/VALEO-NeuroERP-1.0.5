import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import QSAuditDashboard from './QSAuditDashboard';
import QSAuditAnforderungen from './QSAuditAnforderungen';
import QSAuditAnforderungDetail from './QSAuditAnforderungDetail';
import QSAuditKI from './QSAuditKI';
import type { AuditAnforderung } from '../../services/auditApi';

type ViewType = 
  | 'dashboard' 
  | 'anforderungen' 
  | 'anforderung-detail' 
  | 'ki/vollstaendigkeitspruefung'
  | 'ki/erinnerungen'
  | 'ki/empfehlungen'
  | 'zeitplan'
  | 'checkliste'
  | 'zyklen'
  | 'erinnerungen'
  | 'dokumente';

interface QSAuditManagerProps {
  initialView?: ViewType;
  initialAnforderungId?: string;
}

const QSAuditManager: React.FC<QSAuditManagerProps> = ({
  initialView = 'dashboard',
  initialAnforderungId
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [selectedAnforderungId, setSelectedAnforderungId] = useState<string | undefined>(initialAnforderungId);
  
  const handleNavigate = (view: string, id?: string) => {
    // Bestimmen der View-Typ basierend auf dem übergebenen String
    const newView = view as ViewType;
    setCurrentView(newView);
    
    if (id) {
      setSelectedAnforderungId(id);
    }
  };
  
  const handleBack = () => {
    // Zurück zur vorherigen Ansicht navigieren
    switch (currentView) {
      case 'anforderung-detail':
        setCurrentView('anforderungen');
        break;
      case 'ki/vollstaendigkeitspruefung':
      case 'ki/erinnerungen':
      case 'ki/empfehlungen':
        setCurrentView('dashboard');
        break;
      case 'anforderungen':
      case 'zeitplan':
      case 'checkliste':
      case 'zyklen':
      case 'erinnerungen':
      case 'dokumente':
        setCurrentView('dashboard');
        break;
      default:
        setCurrentView('dashboard');
    }
  };
  
  const handleSaveAnforderung = (anforderung: AuditAnforderung) => {
    // In einer realen Anwendung würden wir hier die API aufrufen
    // und dann die aktualisierten Daten laden
    
    // Für den Prototyp navigieren wir einfach zurück zur Liste
    setCurrentView('anforderungen');
  };
  
  const handleDeleteAnforderung = (id: string) => {
    // In einer realen Anwendung würden wir hier die API aufrufen
    
    // Für den Prototyp navigieren wir einfach zurück zur Liste
    setCurrentView('anforderungen');
  };
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <QSAuditDashboard onNavigateToDetail={handleNavigate} />;
      case 'anforderungen':
        return (
          <QSAuditAnforderungen 
            onBack={handleBack}
            onEdit={(id) => handleNavigate('anforderung-detail', id)}
            onAdd={() => handleNavigate('anforderung-detail', 'neu')}
          />
        );
      case 'anforderung-detail':
        return (
          <QSAuditAnforderungDetail 
            anforderungId={selectedAnforderungId}
            onBack={handleBack}
            onSave={handleSaveAnforderung}
            onDelete={handleDeleteAnforderung}
          />
        );
      case 'ki/vollstaendigkeitspruefung':
      case 'ki/erinnerungen':
      case 'ki/empfehlungen':
        return <QSAuditKI onBack={handleBack} />;
      case 'zeitplan':
      case 'checkliste':
      case 'zyklen':
      case 'erinnerungen':
      case 'dokumente':
        // Diese Ansichten sind im Prototyp noch nicht implementiert
        return (
          <Box sx={{ p: 3 }}>
            <h2>Diese Funktion ist noch in Entwicklung</h2>
            <button onClick={handleBack}>Zurück</button>
          </Box>
        );
      default:
        return <QSAuditDashboard onNavigateToDetail={handleNavigate} />;
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {renderCurrentView()}
    </Box>
  );
};

export default QSAuditManager; 