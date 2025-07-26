import React from 'react';

export const FibuDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzbuchhaltung</h1>
          <p className="text-gray-600">Finanzielle Prozesse und Buchhaltung</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <i className="fas fa-plus"></i>
          <span>Neue Buchung</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-euro-sign text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">€ 2.4M</div>
              <div className="text-sm text-gray-600">Umsatz (30 Tage)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">€ 847K</div>
              <div className="text-sm text-gray-600">Gewinn (30 Tage)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-calculator text-purple-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1,247</div>
              <div className="text-sm text-gray-600">Buchungen (30 Tage)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Buchungen</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-euro-sign text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Einnahme: Rechnung #2024-001</p>
              <p className="text-xs text-gray-500">€ 15,000 - vor 2 Stunden</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-euro-sign text-red-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Ausgabe: Lieferantenrechnung</p>
              <p className="text-xs text-gray-500">€ 3,200 - vor 4 Stunden</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 