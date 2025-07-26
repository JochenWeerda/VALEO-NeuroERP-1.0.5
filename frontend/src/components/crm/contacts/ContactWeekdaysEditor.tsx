import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { ContactTime, getWeekdayLabels, getWeekdayArray } from '../../../types/crm';

interface ContactWeekdaysEditorProps {
  contactSchedule: {
    monday: ContactTime;
    tuesday: ContactTime;
    wednesday: ContactTime;
    thursday: ContactTime;
    friday: ContactTime;
    saturday: ContactTime;
    sunday: ContactTime;
  };
  onChange: (weekday: string, contactTime: ContactTime) => void;
}

export const ContactWeekdaysEditor: React.FC<ContactWeekdaysEditorProps> = ({
  contactSchedule,
  onChange
}) => {
  const weekdayLabels = getWeekdayLabels();
  const weekdays = getWeekdayArray();

  const handleAvailabilityChange = (weekday: string, available: boolean) => {
    onChange(weekday, {
      ...contactSchedule[weekday as keyof typeof contactSchedule],
      available
    });
  };

  const handleTimeChange = (weekday: string, field: 'startTime' | 'endTime', value: string) => {
    onChange(weekday, {
      ...contactSchedule[weekday as keyof typeof contactSchedule],
      [field]: value
    });
  };

  const handleNotesChange = (weekday: string, notes: string) => {
    onChange(weekday, {
      ...contactSchedule[weekday as keyof typeof contactSchedule],
      notes
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Kontaktzeiten
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {weekdays.map((weekday) => {
          const contactTime = contactSchedule[weekday];
          const label = weekdayLabels[weekday];
          
          return (
            <Grid item xs={12} key={weekday}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: contactTime.available ? 'action.hover' : 'background.paper'
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="subtitle2" minWidth={80}>
                    {label}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={contactTime.available}
                        onChange={(e) => handleAvailabilityChange(weekday, e.target.checked)}
                        size="small"
                      />
                    }
                    label={contactTime.available ? 'Verfügbar' : 'Nicht verfügbar'}
                  />
                </Box>
                
                {contactTime.available && (
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      label="Von"
                      type="time"
                      value={contactTime.startTime || ''}
                      onChange={(e) => handleTimeChange(weekday, 'startTime', e.target.value)}
                      size="small"
                      sx={{ width: 120 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Typography variant="body2">bis</Typography>
                    <TextField
                      label="Bis"
                      type="time"
                      value={contactTime.endTime || ''}
                      onChange={(e) => handleTimeChange(weekday, 'endTime', e.target.value)}
                      size="small"
                      sx={{ width: 120 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Notizen"
                      value={contactTime.notes || ''}
                      onChange={(e) => handleNotesChange(weekday, e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                      placeholder="z.B. Mittagspause 12:00-13:00"
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}; 