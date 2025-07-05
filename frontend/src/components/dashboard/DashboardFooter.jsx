import React from 'react';
import './Dashboard.css';

/**
 * Footer-Komponente für das Dashboard
 */
const DashboardFooter = () => {
  return (
    <footer>
      <div>Folkerts Landhandel ERP v1.0</div>
      <div className="server-status">
        <div>
          <span className="status-indicator status-online"></span> Backend: Online
        </div>
        <div>
          <span className="status-indicator status-online"></span> Datenbank: Online
        </div>
        <div>
          <span className="status-indicator status-online"></span> Finance-Service: Online
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter; 