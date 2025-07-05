import React from 'react';

const Test = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      backgroundColor: '#ff6b6b',
      margin: '2rem',
      borderRadius: '8px',
      border: '4px solid #cc5151',
      color: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ color: 'white', fontSize: '2rem' }}>TEST-KOMPONENTE</h1>
      <p style={{ fontSize: '1.2rem' }}>Diese Komponente dient zum Testen der Anwendung.</p>
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Wenn du diese Nachricht siehst, funktioniert das Rendering korrekt.</p>
      <button 
        onClick={() => alert('Button funktioniert! Die Anwendung läuft korrekt.')} 
        style={{ 
          background: 'white', 
          color: '#ff6b6b', 
          border: 'none', 
          padding: '1rem 2rem', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}
      >
        HIER KLICKEN
      </button>
    </div>
  );
};

export default Test; 