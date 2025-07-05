import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleDashboard from './components/SimpleDashboard';
import './assets/css/Dashboard.css';
import './assets/css/manual-icons.css';

// Material Icons und Google Fonts dynamisch laden
const loadFonts = () => {
  // Material Icons
  const materialIcons = document.createElement('link');
  materialIcons.rel = 'stylesheet';
  materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(materialIcons);
  
  // Google Fonts (Roboto)
  const googleFonts = document.createElement('link');
  googleFonts.rel = 'stylesheet';
  googleFonts.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
  document.head.appendChild(googleFonts);
  
  // Base CSS für body und Material Icons
  const style = document.createElement('style');
  style.textContent = `
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
    }
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  `;
  document.head.appendChild(style);
};

// Fonts laden
loadFonts();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimpleDashboard username="Admin" />
  </React.StrictMode>
); 