import { useState, useCallback } from 'react';

interface AgentSuggestion {
  id: string;
  text: string;
  confidence: number;
  category: string;
}

interface UseAgentApiReturn {
  getAgentSuggestions: (query: string) => Promise<AgentSuggestion[]>;
  isProcessing: boolean;
  error: string | null;
}

export const useAgentApi = (): UseAgentApiReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAgentSuggestions = useCallback(async (query: string): Promise<AgentSuggestion[]> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Mock API call - in production this would call the actual backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const suggestions: AgentSuggestion[] = [
        {
          id: '1',
          text: 'Vorschlag basierend auf: ' + query,
          confidence: 0.85,
          category: 'general'
        }
      ];
      
      return suggestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    getAgentSuggestions,
    isProcessing,
    error
  };
}; 