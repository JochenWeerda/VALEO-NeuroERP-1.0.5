import React from 'react';
import { Box } from '@mui/material';

/**
 * IconSet - Eine Komponente zur Darstellung von Material Icons im Odoo-Stil
 * 
 * Diese Komponente bietet eine einheitliche Möglichkeit, Material Icons mit konsistenter
 * Darstellung im gesamten System zu verwenden. Sie folgt den Odoo-Designrichtlinien
 * für Icons und unterstützt verschiedene Größen und Farben.
 * 
 * @param {Object} props
 * @param {string} props.icon - Der Name des Material Icons
 * @param {string} props.color - Die Farbe des Icons (optional, erbt vom Theme)
 * @param {string} props.size - Die Größe des Icons (small, medium, large) (optional)
 * @param {string} props.status - Der Status für farbliche Markierung (success, warning, error) (optional)
 * @param {Object} props.sx - Zusätzliche Styling-Eigenschaften (optional)
 * @returns {JSX.Element} Die gerenderte Icon-Komponente
 */
const IconSet = ({ 
  icon, 
  color = 'inherit', 
  size = 'medium', 
  status = null,
  sx = {}, 
  ...props 
}) => {
  // Größen-Mapping nach Odoo-Standards
  const sizeMap = {
    small: '18px',
    medium: '24px',
    large: '36px',
    xlarge: '48px'
  };

  // Status-Farben-Mapping
  const statusColorMap = {
    success: 'success.main',
    warning: 'warning.main',
    error: 'error.main',
    info: 'info.main',
    default: 'inherit'
  };

  // Bestimme die richtige Farbe basierend auf Status oder übergebener Farbe
  const iconColor = status ? statusColorMap[status] || statusColorMap.default : color;
  const fontSize = sizeMap[size] || sizeMap.medium;

  return (
    <Box
      component="span"
      className="material-icons"
      sx={{
        fontSize,
        color: iconColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        lineHeight: 1,
        userSelect: 'none',
        transition: 'color 0.2s ease-in-out',
        ...sx,
      }}
      {...props}
    >
      {icon}
    </Box>
  );
};

export default IconSet; 