import React from 'react';

const WarenwirtschaftDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Warenwirtschaft Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wareneingang</h3>
          <p className="text-gray-600">Verwaltung von Wareneingängen und Lieferanten</p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kommissionierung</h3>
          <p className="text-gray-600">Mobile Kommissionierung und Pick-by-Voice</p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Auslieferung</h3>
          <p className="text-gray-600">Versand und Logistik-Integration</p>
        </div>
      </div>
    </div>
  );
};

export default WarenwirtschaftDashboard; 