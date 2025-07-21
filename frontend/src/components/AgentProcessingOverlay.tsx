import React from 'react';
import { cn } from '../lib/utils';

type AgentStatus = 'thinking' | 'processing' | 'ready' | 'error';

interface AgentProcessingOverlayProps {
  isVisible: boolean;
  status: AgentStatus;
  message: string;
  subMessage?: string;
  onCancel?: () => void;
}

export const AgentProcessingOverlay: React.FC<AgentProcessingOverlayProps> = ({
  isVisible,
  status,
  message,
  subMessage,
  onCancel
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'thinking':
        return 'fas fa-brain animate-agent-thinking';
      case 'processing':
        return 'fas fa-cogs animate-ai-processing';
      case 'ready':
        return 'fas fa-check-circle text-success-500';
      case 'error':
        return 'fas fa-exclamation-triangle text-danger-500';
      default:
        return 'fas fa-robot';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'thinking':
        return 'text-agent-600';
      case 'processing':
        return 'text-ai-600';
      case 'ready':
        return 'text-success-600';
      case 'error':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="agent-overlay">
      <div className="agent-processing">
        <div className="agent-processing-icon">
          <i className={getStatusIcon()}></i>
        </div>
        
        <h3 className={cn('agent-processing-text', getStatusColor())}>
          {message}
        </h3>
        
        {subMessage && (
          <p className="agent-processing-subtext">
            {subMessage}
          </p>
        )}

        {status === 'thinking' || status === 'processing' ? (
          <div className="mt-4">
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-agent-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-agent-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-agent-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : null}

        {onCancel && (status === 'thinking' || status === 'processing') && (
          <button
            onClick={onCancel}
            className="mt-4 btn-secondary text-sm"
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}; 