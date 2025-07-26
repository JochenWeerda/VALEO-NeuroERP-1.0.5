import React from 'react';
import { TrustIndicator } from './TrustIndicator';
import type { ModuleCard as ModuleCardType, ModuleFeature } from '../lib/schemas';

export interface ModuleCardProps {
  module: ModuleCardType;
  onClick?: () => void;
}

export interface ModuleGridProps {
  modules: ModuleCardType[];
}

export interface ModuleFeatureComponentProps {
  feature: ModuleFeature;
}

export const ModuleFeatureComponent: React.FC<ModuleFeatureComponentProps> = ({ feature }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
        <p className="text-xs text-gray-600">{feature.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          feature.available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {feature.available ? 'Verfügbar' : 'Nicht verfügbar'}
        </span>
        <TrustIndicator level={feature.trustLevel} />
      </div>
    </div>
  );
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.color}`}>
            <i className={`${module.icon} text-white text-xl`}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
            <p className="text-sm text-gray-600">{module.description}</p>
          </div>
        </div>
        <TrustIndicator level={module.trustLevel} />
      </div>
      
      <div className="space-y-2">
        {module.features?.slice(0, 3).map((feature) => (
          <ModuleFeatureComponent key={feature.id} feature={feature} />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs rounded-full ${
          module.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {module.status === 'active' ? 'Aktiv' : 'Wartung'}
        </span>
        <span className="text-xs text-gray-500 capitalize">{module.category}</span>
      </div>
    </div>
  );
};

export const ModuleGrid: React.FC<ModuleGridProps> = ({ modules }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}; 