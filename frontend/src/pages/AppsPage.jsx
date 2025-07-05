import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import ColumnLayout from '../components/dashboard/ColumnLayout';
import AppSection from '../components/dashboard/AppSection';
import ChatPanel from '../components/dashboard/ChatPanel';
import '../components/dashboard/Dashboard.css';

/**
 * AppsPage-Komponente im exakt gleichen Layout wie das ERP-Dashboard
 * mit standardmäßig geöffnetem Chat-Bereich, der ein- und ausgeklappt werden kann
 */
const AppsPage = () => {
  const navigate = useNavigate();
  // Chat-Panel ist zu Beginn immer geöffnet
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // Toggle-Funktion zum Ein- und Ausklappen des Chats
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Setze die Sidebar beim Laden der Komponente auf geöffnet
  useEffect(() => {
    setIsChatOpen(true);
  }, []);
  
  // Handler für Klicks auf das Overlay im mobilen Modus
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('with-chat-panel') && window.innerWidth <= 992) {
      setIsChatOpen(false);
    }
  };
  
  // Event-Listener für Klicks auf den Hintergrund
  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener('click', handleBackdropClick);
    }
    
    return () => {
      document.removeEventListener('click', handleBackdropClick);
    };
  }, [isChatOpen]);
  
  // Daten für die App-Anzeige im ERP-Dashboard-Stil organisieren
  const appsData = {
    columns: [
      {
        title: 'Standardanwendungen',
        sections: [
          {
            title: 'Dashboard & Navigation',
            apps: [
              { icon: 'health_and_safety', title: 'Health und Konnektoren', onClick: () => navigate('/health-connectors') },
              { icon: 'settings', title: 'Einstellungen', onClick: () => navigate('/settings') }
            ]
          },
          {
            title: 'Stammdaten',
            apps: [
              { icon: 'people', title: 'Kunden', hasStammdatenBadge: true, onClick: () => navigate('/kunden') },
              { icon: 'account_balance', title: 'CPD-Konten', hasStammdatenBadge: true, onClick: () => navigate('/cpd-konten') },
              { icon: 'inventory_2', title: 'Artikel', hasStammdatenBadge: true, onClick: () => navigate('/artikel') },
              { icon: 'local_shipping', title: 'Lieferanten', hasStammdatenBadge: true, onClick: () => navigate('/lieferanten') }
            ]
          }
        ]
      },
      {
        title: 'Geschäftsprozesse',
        sections: [
          {
            title: 'Vertrieb',
            apps: [
              { icon: 'point_of_sale', title: 'Verkauf', onClick: () => navigate('/verkauf') },
              { icon: 'description', title: 'Angebote', onClick: () => navigate('/angebote') },
              { icon: 'shopping_bag', title: 'Aufträge', onClick: () => navigate('/auftraege') },
              { icon: 'receipt', title: 'Rechnungen', onClick: () => navigate('/rechnungen') }
            ]
          },
          {
            title: 'Einkauf',
            apps: [
              { icon: 'shopping_cart', title: 'Bestellungen', onClick: () => navigate('/bestellungen') },
              { icon: 'input', title: 'Wareneingang', onClick: () => navigate('/wareneingang') },
              { icon: 'receipt_long', title: 'Lieferantenrechnungen', onClick: () => navigate('/lieferantenrechnungen') },
              { icon: 'payment', title: 'Zahlungen', onClick: () => navigate('/zahlungen') }
            ]
          },
          {
            title: 'Logistik',
            apps: [
              { icon: 'warehouse', title: 'Lagerbestand', onClick: () => navigate('/lagerbestand') },
              { icon: 'inventory', title: 'Lagerorte', onClick: () => navigate('/lagerorte') },
              { icon: 'qr_code_2', title: 'Chargenverwaltung', onClick: () => navigate('/chargen') },
              { icon: 'list_alt', title: 'Ladelisten', onClick: () => navigate('/ladelisten') },
              { icon: 'route', title: 'Tourenplanung', onClick: () => navigate('/touren') }
            ]
          }
        ]
      },
      {
        title: 'Fachbereiche',
        sections: [
          {
            title: 'Landwirtschaft',
            apps: [
              { icon: 'scale', title: 'Waage', onClick: () => navigate('/waage') },
              { icon: 'agriculture', title: 'Getreideannahme', onClick: () => navigate('/getreideannahme') },
              { icon: 'eco', title: 'Pflanzenschutz', onClick: () => navigate('/pflanzenschutz') },
              { icon: 'co2', title: 'THG-Erfassung', onClick: () => navigate('/thg-erfassung') }
            ]
          },
          {
            title: 'Qualitätssicherung',
            apps: [
              { icon: 'verified', title: 'QS-Futtermittel', onClick: () => navigate('/qs-futtermittel') }
            ]
          },
          {
            title: 'Finanzen',
            apps: [
              { icon: 'account_balance_wallet', title: 'Kontenplan', onClick: () => navigate('/kontenplan') },
              { icon: 'euro_symbol', title: 'Buchungen', onClick: () => navigate('/buchungen') },
              { icon: 'trending_up', title: 'BWA', onClick: () => navigate('/bwa') },
              { icon: 'upload_file', title: 'DATEV-Export', onClick: () => navigate('/datev-export') }
            ]
          },
          {
            title: 'Reporting',
            apps: [
              { icon: 'insights', title: 'Dashboards', onClick: () => navigate('/dashboards') },
              { icon: 'bar_chart', title: 'Berichte', onClick: () => navigate('/berichte') },
              { icon: 'analytics', title: 'Analysen', onClick: () => navigate('/analysen') },
              { icon: 'history', title: 'Auswertungen', onClick: () => navigate('/auswertungen') }
            ]
          }
        ]
      }
    ]
  };
  
  return (
    <div className={isChatOpen ? 'with-chat-panel' : ''}>
      <ChatPanel isOpen={isChatOpen} onToggle={toggleChat} />
      
      <div className="dashboard-content">
        <DashboardHeader />
        
        <div className="container">
          <div className="dashboard-grid">
            {appsData.columns.map((column, columnIndex) => (
              <ColumnLayout key={`column-${columnIndex}`} title={column.title}>
                {column.sections.map((section, sectionIndex) => (
                  <AppSection 
                    key={`section-${columnIndex}-${sectionIndex}`}
                    title={section.title}
                    apps={section.apps}
                  />
                ))}
              </ColumnLayout>
            ))}
          </div>
        </div>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default AppsPage; 