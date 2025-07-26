import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Agent-spezifische Utilities
export function getAgentStatusColor(status: 'thinking' | 'processing' | 'ready' | 'error') {
  switch (status) {
    case 'thinking':
      return 'text-agent-600 bg-agent-100'
    case 'processing':
      return 'text-ai-600 bg-ai-100'
    case 'ready':
      return 'text-success-600 bg-success-100'
    case 'error':
      return 'text-danger-600 bg-danger-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getAgentIcon(status: 'thinking' | 'processing' | 'ready' | 'error') {
  switch (status) {
    case 'thinking':
      return 'fas fa-brain'
    case 'processing':
      return 'fas fa-cogs'
    case 'ready':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-triangle'
    default:
      return 'fas fa-robot'
  }
}

// Formatierung für Agent-Ausgaben
export function formatAgentResponse(response: string) {
  return response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// Debounce-Funktion für Agent-Requests
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Agent-Context Helper
export function createAgentContext(module: string, action: string) {
  return {
    module,
    action,
    timestamp: new Date().toISOString(),
    sessionId: Math.random().toString(36).substring(7)
  }
} 