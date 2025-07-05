import React from 'react';

interface IconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

// Basierend auf den Icons von ORB-FMS auf https://www.o-r-b.eu/open-core
const IconSet: React.FC<IconProps> = ({ 
  name, 
  color = '#333333', 
  size = 48, 
  className = '', 
  onClick 
}) => {
  // Erstelle den Stil für das Icon-Container
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

  // Bestimme die Icon-Farbe basierend auf dem Namen
  const getIconColor = (iconName: string) => {
    const colors: Record<string, string> = {
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
    
    // Standardfarbe, wenn keine spezifische Farbe gefunden wird
    return colors[iconName.toLowerCase()] || color;
  };

  // Vereinfachtes Icon-Mapping
  const getIconName = (iconName: string): string => {
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

  // Dynamische Icon-Farbe, wenn nicht explizit gesetzt
  const iconColor = color === '#333333' ? getIconColor(name) : color;
  
  return (
    <div 
      className={`orb-icon ${className}`} 
      style={{ ...iconStyle, color: iconColor }}
      onClick={onClick}
    >
      <span className="material-icons">{getIconName(name)}</span>
    </div>
  );
};

export default IconSet; 