import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

export const CrmDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3, spacing: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            CRM für Handel
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Kundenbeziehungsmanagement
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Neuer Kontakt
        </Button>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.100', mr: 2 }}>
                <PeopleIcon color="primary" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  1,247
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktive Kontakte
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="+12% diese Woche" 
              color="success" 
              size="small" 
              icon={<TrendingUpIcon />}
            />
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.100', mr: 2 }}>
                <PersonAddIcon color="success" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Neue Kontakte (30 Tage)
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="+5 heute" 
              color="info" 
              size="small"
            />
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.100', mr: 2 }}>
                <AssignmentIcon color="secondary" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Offene Projekte
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="23 überfällig" 
              color="warning" 
              size="small"
            />
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activities */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'semibold' }}>
            Letzte Aktivitäten
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.100' }}>
                  <PeopleIcon color="primary" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Neuer Kontakt erstellt"
                secondary="Max Mustermann - vor 5 Minuten"
              />
              <Chip label="Kontakt" size="small" color="primary" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.100' }}>
                  <AssignmentIcon color="success" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Projekt aktualisiert"
                secondary="Website-Relaunch - vor 15 Minuten"
              />
              <Chip label="Projekt" size="small" color="success" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.100' }}>
                  <EmailIcon color="info" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="E-Mail gesendet"
                secondary="Angebot an Kunde Müller - vor 30 Minuten"
              />
              <Chip label="E-Mail" size="small" color="info" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.100' }}>
                  <PhoneIcon color="warning" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Anruf protokolliert"
                secondary="Nachfrage zu Projekt XYZ - vor 1 Stunde"
              />
              <Chip label="Anruf" size="small" color="warning" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}; 