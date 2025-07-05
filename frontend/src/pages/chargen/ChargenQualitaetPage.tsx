import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Paper, 
  Tab, 
  Tabs,
  Button,
  Container
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import IntegriertesQualitaetsmodul from '../../components/Qualitaet/IntegriertesQualitaetsmodul';
import { getLieferantStammdaten } from '../../services/qualitaetsApi';

interface ChargenQualitaetPageParams {
  tab?: string;
  lieferantId?: string;
}

const ChargenQualitaetPage: React.FC = () => {
  const { tab, lieferantId } = useParams<ChargenQualitaetPageParams>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [lieferantName, setLieferantName] = useState<string>('');
  
  useEffect(() => {
    // Tab aus URL-Parameter setzen, falls vorhanden
    if (tab) {
      switch (tab) {
        case 'dashboard':
          setSelectedTab(0);
          break;
        case 'pruefungen':
          setSelectedTab(1);
          break;
        case 'vorlagen':
          setSelectedTab(2);
          break;
        case 'parameter':
          setSelectedTab(3);
          break;
        case 'raps':
          setSelectedTab(4);
          break;
        case 'qualitaetsvereinbarungen':
          setSelectedTab(5);
          break;
        case 'nachhaltigkeitserklaerungen':
          setSelectedTab(6);
          break;
        case 'handbuch':
          setSelectedTab(7);
          break;
        case 'einstellungen':
          setSelectedTab(8);
          break;
        default:
          setSelectedTab(0);
      }
    }
    
    // Lieferantendaten laden, falls eine ID übergeben wurde
    const loadLieferant = async () => {
      if (lieferantId) {
        try {
          const lieferant = await getLieferantStammdaten(lieferantId);
          setLieferantName(`${lieferant.name}${lieferant.vorname ? ', ' + lieferant.vorname : ''}`);
        } catch (error) {
          console.error('Fehler beim Laden der Lieferantendaten:', error);
        }
      }
    };
    
    loadLieferant();
  }, [tab, lieferantId]);
  
  // URL beim Tab-Wechsel aktualisieren
  const handleTabChange = (newTab: number) => {
    setSelectedTab(newTab);
    
    let tabPath: string;
    switch (newTab) {
      case 0:
        tabPath = 'dashboard';
        break;
      case 1:
        tabPath = 'pruefungen';
        break;
      case 2:
        tabPath = 'vorlagen';
        break;
      case 3:
        tabPath = 'parameter';
        break;
      case 4:
        tabPath = 'raps';
        break;
      case 5:
        tabPath = 'qualitaetsvereinbarungen';
        break;
      case 6:
        tabPath = 'nachhaltigkeitserklaerungen';
        break;
      case 7:
        tabPath = 'handbuch';
        break;
      case 8:
        tabPath = 'einstellungen';
        break;
      default:
        tabPath = 'dashboard';
    }
    
    if (lieferantId) {
      navigate(`/chargen/qualitaet/${tabPath}/${lieferantId}`);
    } else {
      navigate(`/chargen/qualitaet/${tabPath}`);
    }
  };
  
  // Zurück zur vorherigen Seite
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Zurück
        </Button>
        
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            href="/chargen" 
            onClick={(e) => { e.preventDefault(); navigate('/chargen'); }}
          >
            Chargen
          </Link>
          <Typography color="text.primary">Qualitätsmanagement</Typography>
          {lieferantName && (
            <Typography color="text.primary">{lieferantName}</Typography>
          )}
        </Breadcrumbs>
        
        <Typography variant="h4" gutterBottom>
          Integriertes Qualitätsmanagement
          {lieferantName && ` - ${lieferantName}`}
        </Typography>
        
        <IntegriertesQualitaetsmodul 
          initialTab={selectedTab} 
          lieferantId={lieferantId}
        />
      </Box>
    </Container>
  );
};

export default ChargenQualitaetPage; 