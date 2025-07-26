import React from 'react';
import type { AgentSuggestion as AgentSuggestionType } from '../lib/schemas';
import { cn } from '../lib/utils';

export interface AgentSuggestionProps {
  suggestion: AgentSuggestionType;
  onAccept: (suggestion: AgentSuggestionType) => void;
  onReject: (suggestion: AgentSuggestionType) => void;
  className?: string;
}

export const AgentSuggestion: React.FC<AgentSuggestionProps> = ({
  suggestion,
  onAccept,
  onReject,
  className
}) => {
  const handleAccept = () => {
    onAccept(suggestion);
  };

  const handleReject = () => {
    onReject(suggestion);
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-agent-500 rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
            <p className="text-xs text-gray-500">KI-Vorschlag</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400">Konfidenz: {suggestion.confidence}%</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4">{suggestion.description}</p>

      {suggestion.parameters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h5 className="text-xs font-medium text-gray-600 mb-2">Details:</h5>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(suggestion.parameters, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-check mr-2"></i>
          Akzeptieren
        </button>
        <button
          onClick={handleReject}
          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
        >
          <i className="fas fa-times mr-2"></i>
          Ablehnen
        </button>
      </div>
    </div>
  );
}; 