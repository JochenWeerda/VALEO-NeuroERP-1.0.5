import React from 'react';

export const HelpDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hilfe & Support</h1>
          <p className="text-gray-600">Dokumentation, Support und Schulungen</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <i className="fas fa-plus"></i>
          <span>Support-Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-pink-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">156</div>
              <div className="text-sm text-gray-600">Dokumentationsartikel</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-question-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-sm text-gray-600">FAQ-Einträge</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-headset text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Offene Tickets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Häufig gestellte Fragen</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <i className="fas fa-question text-pink-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Wie erstelle ich einen neuen Benutzer?</p>
              <p className="text-xs text-gray-500">Schritt-für-Schritt-Anleitung verfügbar</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-question text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Wie konfiguriere ich EDI-Schnittstellen?</p>
              <p className="text-xs text-gray-500">Technische Dokumentation verfügbar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 