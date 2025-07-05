import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Badge, 
  alpha, 
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IconSet from './IconSet';

/**
 * AppTile-Komponente für das Dashboard
 * 
 * Stellt eine einzelne App-Kachel mit Icon, Titel und Beschreibung dar.
 * Unterstützt optionale Badges für Benachrichtigungen.
 * Unterstützt Navigation, wenn ein Pfad angegeben ist.
 */
const AppTile = ({ app }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { icon, title, description, color, badge, path } = app;

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Paper
      elevation={2}
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        height: '100%',
        transition: 'all 0.3s ease',
        cursor: path ? 'pointer' : 'default',
        '&:hover': {
          transform: path ? 'translateY(-4px)' : 'none',
          boxShadow: path ? 5 : 2
        }
      }}
    >
      <Badge
        badgeContent={badge}
        color={typeof badge === 'string' ? 'primary' : 'error'}
        invisible={!badge}
        sx={{ 
          '& .MuiBadge-badge': {
            right: -3,
            top: 3
          }
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            bgcolor: alpha(color, 0.15),
            color: color
          }}
        >
          <IconSet icon={icon} size="large" color={color} />
        </Box>
      </Badge>
      <Typography variant="subtitle1" align="center" fontWeight="500" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

export default AppTile; 