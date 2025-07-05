import React from 'react';

// Einfache Icon-Komponente mit Text statt Material Icons
const ManualIcon = ({ name, size = 48, color = '#333333', onClick }) => {
  // Icon-Text
  const getIconText = (iconName) => {
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
      home: 'HO',
    };
    
    return firstChars[iconName.toLowerCase()] || iconName.substring(0, 2).toUpperCase();
  };

  // Icon-Stil
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    cursor: onClick ? 'pointer' : 'default',
    border: '1px solid #e0e0e0',
    fontSize: `${size * 0.3}px`,
    fontWeight: 'bold',
    color: color,
  };
  
  return (
    <div 
      className={`manual-icon ${name.toLowerCase()}`}
      style={iconStyle}
      onClick={onClick}
      title={name}
    >
      {getIconText(name)}
    </div>
  );
};

export default ManualIcon; 