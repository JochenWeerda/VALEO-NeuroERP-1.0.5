import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

/**
 * Mitarbeiterdetailansicht
 */
const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // API-Aufruf zum Laden der Mitarbeiterdaten
    fetch(`/api/v1/users/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Mitarbeiter nicht gefunden');
        }
        return response.json();
      })
      .then(data => {
        setEmployee(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fehler beim Laden der Mitarbeiterdaten:', err);
        setError(err.message);
        setLoading(false);
        
        // Mock-Daten für Entwicklung
        if (process.env.NODE_ENV === 'development') {
          setEmployee({
            id: parseInt(id),
            username: 'jweerda',
            email: 'j.weerda@example.com',
            full_name: 'Jochen Weerda',
            phone: '0123-456789',
            department: 'Vertrieb',
            position: 'Vertriebsleiter',
            is_active: true,
            is_superuser: false,
            is_sales_rep: true,
            sales_rep_code: 'JW',
            created_at: '2023-01-10T08:00:00Z',
            updated_at: '2023-06-15T10:30:00Z',
            roles: [
              { id: 1, name: 'Vertrieb', description: 'Vertriebsmitarbeiter mit Zugriff auf Kundeninformationen' }
            ]
          });
          setLoading(false);
          setError(null);
        }
      });
  }, [id]);
  
  // Formatieren des Datums
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handler für die Bearbeitung des Mitarbeiters
  const handleEdit = () => {
    navigate(`/mitarbeiter/${id}/bearbeiten`);
  };
  
  // Handler für die Rückkehr zur Mitarbeiterliste
  const handleBack = () => {
    navigate('/mitarbeiter');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !employee) {
    return (
      <Box sx={{ mt: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Zurück zur Mitarbeiterliste
        </Button>
      </Box>
    );
  }
  
  return (
    <div>
      <Helmet>
        <title>{employee?.full_name || 'Mitarbeiter'} | Folkerts ERP</title>
      </Helmet>
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Zurück
            </Button>
            <Typography variant="h5" component="h1">
              Mitarbeiterdetails
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Bearbeiten
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Hauptinformationen */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{employee.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{employee.username}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={employee.is_active ? "Aktiv" : "Inaktiv"} 
                    color={employee.is_active ? "success" : "default"}
                    size="small"
                  />
                  
                  {employee.is_superuser && (
                    <Chip 
                      icon={<AdminPanelSettingsIcon />}
                      label="Administrator" 
                      color="warning"
                      size="small"
                    />
                  )}
                  
                  {employee.is_sales_rep && (
                    <Chip 
                      label={`Vertriebsberater (${employee.sales_rep_code})`} 
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Erstellt am:</strong> {formatDate(employee.created_at)}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Zuletzt aktualisiert:</strong> {formatDate(employee.updated_at)}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Rollen */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Zugewiesene Rollen
                </Typography>
                
                {employee.roles && employee.roles.length > 0 ? (
                  <List dense>
                    {employee.roles.map(role => (
                      <ListItem key={role.id}>
                        <ListItemText 
                          primary={role.name} 
                          secondary={role.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Keine speziellen Rollen zugewiesen
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kontaktinformationen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        E-Mail
                      </Typography>
                      <Typography variant="body1">
                        {employee.email}
                        <Tooltip title="E-Mail senden">
                          <IconButton 
                            size="small" 
                            href={`mailto:${employee.email}`}
                            sx={{ ml: 1 }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Telefon
                      </Typography>
                      <Typography variant="body1">
                        {employee.phone || 'Nicht angegeben'}
                        {employee.phone && (
                          <Tooltip title="Anrufen">
                            <IconButton 
                              size="small" 
                              href={`tel:${employee.phone}`}
                              sx={{ ml: 1 }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Beschäftigungsinformationen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Abteilung
                      </Typography>
                      <Typography variant="body1">
                        {employee.department || 'Nicht zugewiesen'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Position
                    </Typography>
                    <Typography variant="body1">
                      {employee.position || 'Nicht angegeben'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {employee.is_sales_rep && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Vertriebsberater-Informationen
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Kürzel
                        </Typography>
                        <Typography variant="body1">
                          <Chip 
                            label={employee.sales_rep_code} 
                            color="primary"
                            size="small"
                          />
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Hier könnte später eine Anzeige der zugewiesenen Kunden stehen */}
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default EmployeeDetail; 