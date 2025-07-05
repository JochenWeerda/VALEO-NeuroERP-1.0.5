import React from 'react';
import PropTypes from 'prop-types';
import AppItem from './AppItem';
import './Dashboard.css';

/**
 * Dashboard-Sektion mit Titel und App-Kacheln
 */
const AppSection = ({ title, apps }) => {
  return (
    <div className="section">
      <h3 className="section-header">{title}</h3>
      <div className="apps-grid">
        {apps.map((app, index) => (
          <AppItem
            key={`${title}-${index}`}
            icon={app.icon}
            title={app.title}
            hasStammdatenBadge={app.hasStammdatenBadge}
            onClick={app.onClick}
          />
        ))}
      </div>
    </div>
  );
};

AppSection.propTypes = {
  title: PropTypes.string.isRequired,
  apps: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      hasStammdatenBadge: PropTypes.bool,
      onClick: PropTypes.func
    })
  ).isRequired
};

export default AppSection; 