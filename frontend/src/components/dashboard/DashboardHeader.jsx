import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

/**
 * Header-Komponente für das Dashboard mit Zurück-Button
 */
const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ermittle den richtigen Zurück-Pfad basierend auf der aktuellen URL
  const getBackPath = () => {
    // Spezialfälle hier behandeln
    if (location.pathname.includes('/kunden/')) {
      return '/kunden';
    }
    
    if (location.pathname.includes('/cpd-konten/')) {
      return '/cpd-konten';
    }
    
    // Fallback: Zurück zur Apps-Übersicht
    return '/apps';
  };
  
  // Überprüfe, ob wir uns nicht auf der Apps-Seite befinden
  const showBackButton = location.pathname !== '/apps';
  
  // Zurück zur vorherigen Seite navigieren
  const handleBackClick = () => {
    const backPath = getBackPath();
    navigate(backPath);
  };
  
  return (
    <header>
      <div className="logo-container">
        {showBackButton && (
          <button 
            className="back-button" 
            onClick={handleBackClick} 
            title="Zurück zur Übersicht"
          >
            <span className="material-icons">arrow_back</span>
          </button>
        )}
        <img 
          src="/images/logo_top.jpg" 
          alt="Folkerts Landhandel Logo" 
          className="company-logo" 
          style={{ height: '50px' }}
        />
        <h1>ERP-System</h1>
      </div>
      <div className="header-controls">
        <div className="search-container">
          <input type="text" placeholder="Suchen..." className="search-input" />
          <button className="search-btn"><span className="material-icons">search</span></button>
        </div>
        <div className="chat-hint">
          <span className="material-icons">chat</span>
          <span>Chat links öffnen</span>
        </div>
        <div className="qs-notification" onClick={() => navigate('/qs-futtermittel')} title="QS-Futtermittel">
          <span className="material-icons">verified</span>
        </div>
        <div className="user-info">
          <span>Max Mustermann</span>
          <button className="btn">Abmelden</button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
