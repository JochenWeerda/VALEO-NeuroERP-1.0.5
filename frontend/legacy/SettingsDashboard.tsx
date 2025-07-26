import React from 'react';

export const SettingsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600">Systemkonfiguration und Benutzerverwaltung</p>
        </div>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <i className="fas fa-save"></i>
          <span>Speichern</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-gray-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Aktive Benutzer</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Sicherheits-Score</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-server text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Online</div>
              <div className="text-sm text-gray-600">System-Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System-Informationen</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-info-circle text-gray-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">VALEO NeuroERP v2.0</p>
              <p className="text-xs text-gray-500">Aktuelle Version - Build 2024.12.20</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Alle Module aktiv</p>
              <p className="text-xs text-gray-500">8 von 8 Modulen sind online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 