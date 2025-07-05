import React, { useState } from 'react';
import SimpleIcon from './SimpleIconComponent';
import ManualIcon from './ManualIcon';
import '../assets/css/Dashboard.css';

// Einfache Dashboard-Komponente ohne TypeScript
const SimpleDashboard = ({ username = 'Benutzer' }) => {
  const [activeModule, setActiveModule] = useState(null);
  const [useFallbackIcons, setUseFallbackIcons] = useState(false);

  // Prüfe, ob Material Icons verfügbar sind
  React.useEffect(() => {
    // Einfacher Test, ob Material Icons geladen wurden
    const testEl = document.createElement('span');
    testEl.className = 'material-icons';
    testEl.textContent = 'check';
    document.body.appendChild(testEl);
    
    // Fallback aktivieren, wenn die Schriftart nicht korrekt geladen wurde
    setTimeout(() => {
      const style = window.getComputedStyle(testEl);
      const fontFamily = style.getPropertyValue('font-family');
      if (!fontFamily.includes('Material Icons')) {
        setUseFallbackIcons(true);
      }
      document.body.removeChild(testEl);
    }, 500);
  }, []);

  // Menüelemente
  const menuItems = [
    { id: 'landwirtschaft', name: 'Landwirtschaft', icon: 'landwirtschaft' },
    { id: 'pflanze', name: 'Pflanzendatenbank', icon: 'pflanze' },
    { id: 'finanzen', name: 'Finanzen', icon: 'finanzen' },
    { id: 'lager', name: 'Lager', icon: 'lager' },
    { id: 'einkauf', name: 'Einkauf', icon: 'einkauf' },
    { id: 'verkauf', name: 'Verkauf', icon: 'verkauf' },
    { id: 'personal', name: 'Personal', icon: 'personal' },
    { id: 'fertigung', name: 'Fertigung', icon: 'fertigung' },
    { id: 'partner', name: 'Partner', icon: 'partner' },
    { id: 'artikel', name: 'Artikel', icon: 'artikel' },
    { id: 'analytics', name: 'Analysen', icon: 'analytics' },
    { id: 'kalender', name: 'Kalender', icon: 'kalender' },
    { id: 'dokumente', name: 'Dokumente', icon: 'dokumente' },
    { id: 'einstellungen', name: 'Einstellungen', icon: 'einstellungen' },
  ];

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  // Modul-Name des aktiven Moduls finden
  const getActiveModuleName = () => {
    const activeItem = menuItems.find(item => item.id === activeModule);
    return activeItem ? activeItem.name : '';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <span className="orb">ORB</span>
          <span className="fms">-FMS</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            Willkommen, {username}
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="module-grid">
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`module-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => handleModuleClick(item.id)}
            >
              {useFallbackIcons ? 
                <ManualIcon name={item.icon} size={64} /> : 
                <SimpleIcon name={item.icon} size={64} />
              }
              <div className="module-name">{item.name}</div>
            </div>
          ))}
        </div>

        {activeModule && (
          <div className="module-content">
            <h2>{getActiveModuleName()}</h2>
            <p>
              Dieses Modul ist noch in Entwicklung. Bitte haben Sie Geduld, während wir daran arbeiten.
            </p>
            <div className="placeholder-content">
              <div className="placeholder-table">
                <div className="placeholder-header">
                  <div className="placeholder-cell">ID</div>
                  <div className="placeholder-cell">Name</div>
                  <div className="placeholder-cell">Beschreibung</div>
                  <div className="placeholder-cell">Status</div>
                  <div className="placeholder-cell">Aktionen</div>
                </div>
                <div className="placeholder-row">
                  <div className="placeholder-cell">1</div>
                  <div className="placeholder-cell">Beispiel 1</div>
                  <div className="placeholder-cell">Beschreibung des ersten Eintrags</div>
                  <div className="placeholder-cell">Aktiv</div>
                  <div className="placeholder-cell">
                    <button className="action-button">Bearbeiten</button>
                    <button className="action-button">Löschen</button>
                  </div>
                </div>
                <div className="placeholder-row">
                  <div className="placeholder-cell">2</div>
                  <div className="placeholder-cell">Beispiel 2</div>
                  <div className="placeholder-cell">Beschreibung des zweiten Eintrags</div>
                  <div className="placeholder-cell">Inaktiv</div>
                  <div className="placeholder-cell">
                    <button className="action-button">Bearbeiten</button>
                    <button className="action-button">Löschen</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <div>© {new Date().getFullYear()} AI-gestütztes ERP-System | ORB-FMS</div>
      </footer>
    </div>
  );
};

export default SimpleDashboard; 