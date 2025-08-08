/**
 * Agent API für VALEO NeuroERP 2.0
 * Integration mit verschiedenen AI-Agenten und MCP-Services
 */

interface AgentRequest {
  method: string;
  params: Record<string, unknown>;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
  [key: string]: unknown;
}

interface MCPRequest {
  method: string;
  params: Record<string, unknown>;
  source?: string;
  [key: string]: unknown;
}

interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
  [key: string]: unknown;
}

class AgentAPI {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as T;
  }

  // Agent-spezifische Methoden
  async sendAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/agent/request', request);
  }

  async getAgentStatus(agentId: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/agent/status', { agentId });
  }

  async listAgents(): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/agent/list', {});
  }

  // MCP-spezifische Methoden
  async sendMCPRequest(request: MCPRequest): Promise<MCPResponse> {
    return this.makeRequest<MCPResponse>('/mcp/request', request);
  }

  async getMCPSchema(tableName: string): Promise<MCPResponse> {
    return this.makeRequest<MCPResponse>('/mcp/schema', { tableName });
  }

  async executeMCPQuery(query: string, params: Record<string, unknown> = {}): Promise<MCPResponse> {
    return this.makeRequest<MCPResponse>('/mcp/query', { query, params });
  }

  // AI-Integration
  async sendAIMessage(message: string, context?: Record<string, unknown>): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/ai/chat', { message, context });
  }

  async generateAIResponse(prompt: string, options?: Record<string, unknown>): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/ai/generate', { prompt, options });
  }

  async analyzeData(data: unknown, analysisType: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/ai/analyze', { data, analysisType });
  }

  // Workflow-Integration
  async startWorkflow(workflowId: string, input: Record<string, unknown>): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/workflow/start', { workflowId, input });
  }

  async getWorkflowStatus(workflowId: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/workflow/status', { workflowId });
  }

  async pauseWorkflow(workflowId: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/workflow/pause', { workflowId });
  }

  async resumeWorkflow(workflowId: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/workflow/resume', { workflowId });
  }

  async cancelWorkflow(workflowId: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/workflow/cancel', { workflowId });
  }

  // Daten-Integration
  async syncData(source: string, target: string, options?: Record<string, unknown>): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/data/sync', { source, target, options });
  }

  async validateData(data: unknown, schema: unknown): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/data/validate', { data, schema });
  }

  async transformData(data: unknown, transformation: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/data/transform', { data, transformation });
  }

  // Monitoring und Logging
  async getSystemHealth(): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/system/health', {});
  }

  async getMetrics(timeRange?: string): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/system/metrics', { timeRange });
  }

  async getLogs(level?: string, limit?: number): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/system/logs', { level, limit });
  }

  // Konfiguration
  async getConfig(): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/config/get', {});
  }

  async updateConfig(config: Record<string, unknown>): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/config/update', config);
  }

  async resetConfig(): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('/config/reset', {});
  }
}

// Singleton-Instanz
export const agentAPI = new AgentAPI();
export default agentAPI; 