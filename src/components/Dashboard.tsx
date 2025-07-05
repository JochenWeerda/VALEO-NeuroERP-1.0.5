import React, { useState } from 'react';
import IconSet from '../icons/IconSet';
import '../assets/css/Dashboard.css';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

interface DashboardProps {
  username?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username = 'Benutzer' }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Menüelemente, basierend auf dem ORB-FMS-Screenshot auf https://www.o-r-b.eu/open-core
  const menuItems: MenuItem[] = [
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

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
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
              <IconSet name={item.icon} size={64} color={item.color} />
              <div className="module-name">{item.name}</div>
            </div>
          ))}
        </div>

        {activeModule && (
          <div className="module-content">
            <h2>{menuItems.find(item => item.id === activeModule)?.name}</h2>
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

export default Dashboard; 