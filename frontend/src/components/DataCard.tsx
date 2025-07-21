import React from 'react';
import { TrustIndicator } from './TrustIndicator';
import type { TrustLevel } from './TrustIndicator';

export interface DataCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  icon: string;
  trustLevel: TrustLevel;
  confidence: number;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  trend,
  change,
  icon,
  trustLevel,
  confidence
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'fas fa-arrow-up';
      case 'down':
        return 'fas fa-arrow-down';
      default:
        return 'fas fa-minus';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <i className={`${icon} text-gray-400`}></i>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <i className={`${getTrendIcon()} text-xs`}></i>
              <span className="text-sm font-medium">{change}</span>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <TrustIndicator level={trustLevel} confidence={confidence} />
        </div>
      </div>
    </div>
  );
}; 