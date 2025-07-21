import React from 'react';
import { TrustIndicator } from './TrustIndicator';
import type { TrustLevel } from './TrustIndicator';

export interface StatusCardProps {
  title: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  trustLevel: TrustLevel;
  confidence: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  trustLevel,
  confidence
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return 'fas fa-check-circle';
      case 'offline':
        return 'fas fa-times-circle';
      case 'maintenance':
        return 'fas fa-tools';
      case 'error':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-question-circle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            <i className={`${getStatusIcon()} mr-1`}></i>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        <div className="ml-4">
          <TrustIndicator level={trustLevel} confidence={confidence} />
        </div>
      </div>
    </div>
  );
};