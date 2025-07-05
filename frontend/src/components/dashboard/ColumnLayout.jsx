import React from 'react';
import PropTypes from 'prop-types';
import './Dashboard.css';

/**
 * Spalten-Layout für das Dashboard mit Titel und Inhalt
 */
const ColumnLayout = ({ title, children }) => {
  return (
    <div className="dashboard-column">
      <h2 className="column-header">{title}</h2>
      {children}
    </div>
  );
};

ColumnLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default ColumnLayout; 