import React from 'react';

export const LagerDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lagerverwaltung</h1>
          <p className="text-gray-600">Bestands- und Lagerverwaltung</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <i className="fas fa-plus"></i>
          <span>Neuer Artikel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-boxes text-orange-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">15,247</div>
              <div className="text-sm text-gray-600">Artikel im Bestand</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-truck text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-sm text-gray-600">Lieferungen heute</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Niedrige Bestände</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-truck text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Warenannahme: Lieferung #2024-001</p>
              <p className="text-xs text-gray-500">150 Artikel - vor 30 Minuten</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-boxes text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Kommissionierung: Auftrag #2024-002</p>
              <p className="text-xs text-gray-500">25 Artikel - vor 1 Stunde</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 