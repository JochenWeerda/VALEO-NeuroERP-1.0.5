import React from 'react';

// Einfache Icon-Komponente ohne TypeScript
const SimpleIcon = ({ name, size = 48, color = '#333333', onClick }) => {
  // Icon-Stil
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    color: color,
    cursor: onClick ? 'pointer' : 'default',
    border: '1px solid #e0e0e0',
    fontSize: `${size * 0.5}px`,
  };

  // Icon-Farben
  const getIconColor = (iconName) => {
    const colors = {
      landwirtschaft: '#7CB342',
      pflanze: '#8BC34A',
      finanzen: '#F44336',
      lager: '#FF9800',
      einkauf: '#3F51B5',
      verkauf: '#2196F3',
      personal: '#9C27B0',
      fertigung: '#795548',
      verwaltung: '#607D8B',
      kalender: '#FF5722',
      dokumente: '#009688',
      einstellungen: '#9E9E9E',
      partner: '#E91E63',
      artikel: '#CDDC39',
      analytics: '#FFC107',
    };
    
    return colors[iconName.toLowerCase()] || color;
  };

  // Icon-Namen
  const getIconName = (iconName) => {
    switch (iconName.toLowerCase()) {
      case 'landwirtschaft': return 'agriculture';
      case 'pflanze': return 'eco';
      case 'finanzen': return 'euro';
      case 'lager': return 'inventory';
      case 'einkauf': return 'shopping_cart';
      case 'verkauf': return 'store';
      case 'personal': return 'people';
      case 'fertigung': return 'precision_manufacturing';
      case 'verwaltung': return 'admin_panel_settings';
      case 'kalender': return 'calendar_month';
      case 'dokumente': return 'description';
      case 'einstellungen': return 'settings';
      case 'partner': return 'handshake';
      case 'artikel': return 'inventory_2';
      case 'analytics': return 'analytics';
      case 'home': return 'home';
      default: return 'apps';
    }
  };

  // Ersatztext für Icons falls keine Material Icons geladen werden können
  const getFallbackText = (iconName) => {
    const firstChars = {
      landwirtschaft: 'LW',
      pflanze: 'PF',
      finanzen: 'FI',
      lager: 'LA',
      einkauf: 'EK',
      verkauf: 'VK',
      personal: 'PE',
      fertigung: 'FE',
      verwaltung: 'VW',
      kalender: 'KA',
      dokumente: 'DO',
      einstellungen: 'ES',
      partner: 'PA',
      artikel: 'AR',
      analytics: 'AN',
    };
    return firstChars[iconName.toLowerCase()] || iconName.substring(0, 2).toUpperCase();
  };

  // Berechne Farbe
  const iconColor = color === '#333333' ? getIconColor(name) : color;
  
  return (
    <div 
      className="orb-icon" 
      style={{ ...iconStyle, color: iconColor }}
      onClick={onClick}
      title={name}
    >
      <span className="material-icons" style={{ fontFamily: "'Material Icons', sans-serif" }}>
        {getIconName(name)}
      </span>
      <span className="icon-fallback" style={{ display: 'none', fontWeight: 'bold' }}>
        {getFallbackText(name)}
      </span>
    </div>
  );
};

export default SimpleIcon; 