import React from 'react';
import PropTypes from 'prop-types';
import './Dashboard.css';

/**
 * Einzelne App-Kachel für das Dashboard
 */
const AppItem = ({ 
  icon, 
  title, 
  hasStammdatenBadge = false, 
  onClick = null 
}) => {
  // Handler für Klicks auf die App-Kachel
  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div 
          className="app" 
          onClick={handleClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          <span className="material-icons app-icon">{icon}</span>
          {hasStammdatenBadge && <span className="stammdaten-badge">S</span>}
        </div>
      </div>
      <span className="app-title">{title}</span>
    </div>
  );
};

AppItem.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  hasStammdatenBadge: PropTypes.bool,
  onClick: PropTypes.func
};

export default AppItem; 