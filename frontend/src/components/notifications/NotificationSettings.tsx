import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import SettingsIcon from '@mui/icons-material/Settings';
import notificationApi, { NotificationSetting } from '../../services/notificationApi';
import { useAuth } from '../../contexts/AuthContext';

const NotificationSettings: React.FC = () => {
  // ... existing state and functions ...

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Benachrichtigungseinstellungen
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/notifications/email-config"
            startIcon={<EmailIcon />}
            sx={{ mr: 1 }}
          >
            E-Mail-Konfiguration
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/notifications/sms-config"
            startIcon={<SmsIcon />}
          >
            SMS-Konfiguration
          </Button>
        </Box>
      </Box>

      {/* Einführungstext */}
      <Typography paragraph>
        Hier können Sie Ihre Benachrichtigungseinstellungen verwalten. Legen Sie fest, wie Sie über wichtige Ereignisse im System informiert werden möchten.
      </Typography>

      {/* Karte für allgemeine Einstellungen */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Allgemeine Einstellungen
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.enableAllNotifications}
                    onChange={(e) => handleGlobalSettingChange('enableAllNotifications', e.target.checked)}
                  />
                }
                label="Alle Benachrichtigungen aktivieren"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalSettings.enableSoundAlerts}
                    onChange={(e) => handleGlobalSettingChange('enableSoundAlerts', e.target.checked)}
                  />
                }
                label="Akustische Signale aktivieren"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Benachrichtigungstypen */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Benachrichtigungskanäle
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Neuer Kanal
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : notificationSettings.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ my: 4 }}>
            Keine Benachrichtigungskanäle konfiguriert. Klicken Sie auf "Neuer Kanal", um einen hinzuzufügen.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {notificationSettings.map((setting) => (
              <Grid item xs={12} sm={6} md={4} key={setting.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {getNotificationTypeIcon(setting.notification_type)}
                        {getNotificationTypeName(setting.notification_type)}
                      </Typography>
                      <Switch
                        checked={setting.is_enabled}
                        onChange={() => handleToggleSetting(setting)}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Kontakt:</strong> {setting.contact_information || 'Nicht angegeben'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Min. Schweregrad:</strong> {setting.minimum_severity || 'Alle'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Min. Eskalationsstufe:</strong> {setting.minimum_escalation_level || 'Alle'}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditDialog(setting)}
                        sx={{ mr: 1 }}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(setting)}
                      >
                        Löschen
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Dialog zum Hinzufügen/Bearbeiten von Benachrichtigungseinstellungen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Benachrichtigungskanal bearbeiten' : 'Neuen Benachrichtigungskanal hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Benachrichtigungstyp</InputLabel>
            <Select
              value={currentSetting.notification_type}
              onChange={(e) => handleSettingChange('notification_type', e.target.value)}
              label="Benachrichtigungstyp"
            >
              <MenuItem value="Email">E-Mail</MenuItem>
              <MenuItem value="SMS">SMS</MenuItem>
              <MenuItem value="Push-Benachrichtigung">Push-Benachrichtigung</MenuItem>
              <MenuItem value="In-App-Benachrichtigung">In-App-Benachrichtigung</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Kontaktinformation"
            value={currentSetting.contact_information || ''}
            onChange={(e) => handleSettingChange('contact_information', e.target.value)}
            margin="normal"
            helperText={getContactInfoHelperText(currentSetting.notification_type)}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Minimaler Schweregrad</InputLabel>
            <Select
              value={currentSetting.minimum_severity || 'Niedrig'}
              onChange={(e) => handleSettingChange('minimum_severity', e.target.value)}
              label="Minimaler Schweregrad"
            >
              <MenuItem value="Niedrig">Niedrig</MenuItem>
              <MenuItem value="Mittel">Mittel</MenuItem>
              <MenuItem value="Hoch">Hoch</MenuItem>
              <MenuItem value="Kritisch">Kritisch</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Minimale Eskalationsstufe</InputLabel>
            <Select
              value={currentSetting.minimum_escalation_level || '1'}
              onChange={(e) => handleSettingChange('minimum_escalation_level', e.target.value)}
              label="Minimale Eskalationsstufe"
            >
              <MenuItem value="1">Stufe 1</MenuItem>
              <MenuItem value="2">Stufe 2</MenuItem>
              <MenuItem value="3">Stufe 3</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Ereignisse</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSetting.for_emergency_creation}
                    onChange={(e) => handleSettingChange('for_emergency_creation', e.target.checked)}
                  />
                }
                label="Notfall erstellt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSetting.for_emergency_update}
                    onChange={(e) => handleSettingChange('for_emergency_update', e.target.checked)}
                  />
                }
                label="Notfall aktualisiert"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSetting.for_emergency_escalation}
                    onChange={(e) => handleSettingChange('for_emergency_escalation', e.target.checked)}
                  />
                }
                label="Notfall eskaliert"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSetting.for_emergency_resolution}
                    onChange={(e) => handleSettingChange('for_emergency_resolution', e.target.checked)}
                  />
                }
                label="Notfall gelöst"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            onClick={handleSaveSetting} 
            variant="contained" 
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog zum Löschen von Benachrichtigungseinstellungen */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Benachrichtigungskanal löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie diesen Benachrichtigungskanal löschen möchten?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Abbrechen</Button>
          <Button 
            onClick={handleDeleteSetting} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Löschen'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings; 