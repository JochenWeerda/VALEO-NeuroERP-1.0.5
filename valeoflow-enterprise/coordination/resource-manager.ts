// =============================================================================
// VALEO-Die NeuroERP - Resource Manager
// =============================================================================

import { EventEmitter } from 'events';
import { 
  ResourceAvailability, 
  Task, 
  DevelopmentAgent, 
  AgentStatus,
  Priority,
  PerformanceMetrics,
  SystemHealth
} from '../types/swarm-types';

export class ResourceManager extends EventEmitter {
  private resources: Map<string, ResourceAvailability> = new Map();
  private agentResources: Map<string, string[]> = new Map();
  private taskAllocations: Map<string, string> = new Map();
  private resourceHistory: ResourceAvailability[] = [];

  constructor() {
    super();
    this.initializeDefaultResources();
  }

  /**
   * Initialisiert Standard-Ressourcen
   */
  private initializeDefaultResources(): void {
    const defaultResources: ResourceAvailability[] = [
      {
        id: 'cpu-high',
        type: 'cpu',
        capacity: 100,
        available: 80,
        priority: 'high',
        cost: 10,
        performance: 0.9
      },
      {
        id: 'cpu-medium',
        type: 'cpu',
        capacity: 100,
        available: 60,
        priority: 'medium',
        cost: 5,
        performance: 0.7
      },
      {
        id: 'memory-high',
        type: 'memory',
        capacity: 16,
        available: 12,
        priority: 'high',
        cost: 8,
        performance: 0.85
      },
      {
        id: 'memory-medium',
        type: 'memory',
        capacity: 8,
        available: 6,
        priority: 'medium',
        cost: 4,
        performance: 0.7
      },
      {
        id: 'storage-fast',
        type: 'storage',
        capacity: 1000,
        available: 800,
        priority: 'high',
        cost: 15,
        performance: 0.95
      },
      {
        id: 'network-high',
        type: 'network',
        capacity: 1000,
        available: 800,
        priority: 'high',
        cost: 12,
        performance: 0.9
      }
    ];

    defaultResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
  }

  /**
   * Registriert einen Agenten mit seinen Ressourcen
   */
  async registerAgent(agentId: string, requiredResources: string[]): Promise<void> {
    // TODO: Remove console.log
    
    this.agentResources.set(agentId, requiredResources);
    
    // Ressourcen für Agenten reservieren
    for (const resourceId of requiredResources) {
      const resource = this.resources.get(resourceId);
      if (resource) {
        resource.available = Math.max(0, resource.available - 10); // 10% pro Agent
        this.resources.set(resourceId, resource);
      }
    }

    this.emit('agent-registered', { agentId, resources: requiredResources });
  }

  /**
   * Alloziert Ressourcen für eine Aufgabe
   */
  async allocateResources(task: Task, priority: Priority): Promise<ResourceAvailability[]> {
    // TODO: Remove console.log`);

    const requiredResources = this.getRequiredResources(task);
    const allocatedResources: ResourceAvailability[] = [];

    for (const resourceType of requiredResources) {
      const bestResource = await this.findBestResource(resourceType, priority);
      
      if (bestResource) {
        // Ressource allozieren
        const allocation = this.calculateAllocation(task, bestResource, priority);
        bestResource.available = Math.max(0, bestResource.available - allocation);
        
        this.resources.set(bestResource.id, bestResource);
        allocatedResources.push(bestResource);
        
        // Task-Zuordnung speichern
        this.taskAllocations.set(task.id, bestResource.id);
        
        // TODO: Remove console.log`);
      } else {
        console.warn(`⚠️ Keine verfügbare Ressource für Typ ${resourceType} gefunden`);
      }
    }

    this.emit('resources-allocated', { taskId: task.id, resources: allocatedResources });
    return allocatedResources;
  }

  /**
   * Gibt Ressourcen frei
   */
  async releaseResources(taskId: string): Promise<void> {
    // TODO: Remove console.log

    const resourceId = this.taskAllocations.get(taskId);
    if (resourceId) {
      const resource = this.resources.get(resourceId);
      if (resource) {
        // Ressource freigeben (20% zurück)
        resource.available = Math.min(resource.capacity, resource.available + 20);
        this.resources.set(resourceId, resource);
        
        // TODO: Remove console.log
      }
      
      this.taskAllocations.delete(taskId);
    }

    this.emit('resources-released', { taskId });
  }

  /**
   * Optimiert Ressourcenallokation
   */
  async optimizeAllocation(): Promise<void> {
    // TODO: Remove console.log

    const optimizations = [];

    // Überlastete Ressourcen identifizieren
    for (const [resourceId, resource] of this.resources) {
      const utilization = (resource.capacity - resource.available) / resource.capacity;
      
      if (utilization > 0.9) {
        optimizations.push({
          type: 'overload',
          resourceId,
          utilization,
          action: 'scale-up'
        });
      } else if (utilization < 0.3) {
        optimizations.push({
          type: 'underutilization',
          resourceId,
          utilization,
          action: 'consolidate'
        });
      }
    }

    // Optimierungen durchführen
    for (const optimization of optimizations) {
      await this.performOptimization(optimization);
    }

    // Ressourcen-Historie aktualisieren
    this.updateResourceHistory();

    // TODO: Remove console.log
    this.emit('allocation-optimized', { optimizations });
  }

  /**
   * Führt eine spezifische Optimierung durch
   */
  private async performOptimization(optimization: any): Promise<void> {
    switch (optimization.action) {
      case 'scale-up':
        await this.scaleUpResource(optimization.resourceId);
        break;
      case 'consolidate':
        await this.consolidateResources(optimization.resourceId);
        break;
      case 'rebalance':
        await this.rebalanceLoad(optimization.resourceId);
        break;
    }
  }

  /**
   * Skaliert eine Ressource hoch
   */
  private async scaleUpResource(resourceId: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (resource) {
      resource.capacity = Math.floor(resource.capacity * 1.5);
      resource.available = Math.floor(resource.available * 1.5);
      this.resources.set(resourceId, resource);
      
      // TODO: Remove console.log
    }
  }

  /**
   * Konsolidiert unterausgelastete Ressourcen
   */
  private async consolidateResources(resourceId: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (resource) {
      // Tasks von unterausgelasteter Ressource umverteilen
      const tasksToMove = Array.from(this.taskAllocations.entries())
        .filter(([_, rid]) => rid === resourceId)
        .slice(0, 2); // Maximal 2 Tasks umverteilen

      for (const [taskId, _] of tasksToMove) {
        await this.reallocateTask(taskId);
      }
      
      // TODO: Remove console.log
    }
  }

  /**
   * Verteilt Last neu
   */
  private async rebalanceLoad(resourceId: string): Promise<void> {
    const tasks = Array.from(this.taskAllocations.entries())
      .filter(([_, rid]) => rid === resourceId)
      .map(([taskId, _]) => taskId);

    // Tasks gleichmäßig verteilen
    const availableResources = Array.from(this.resources.values())
      .filter(r => r.available > 20 && r.id !== resourceId);

    for (let i = 0; i < tasks.length; i++) {
      const targetResource = availableResources[i % availableResources.length];
      if (targetResource) {
        this.taskAllocations.set(tasks[i], targetResource.id);
      }
    }

    // TODO: Remove console.log
  }

  /**
   * Alloziert einen Task neu
   */
  private async reallocateTask(taskId: string): Promise<void> {
    const currentResourceId = this.taskAllocations.get(taskId);
    if (currentResourceId) {
      const currentResource = this.resources.get(currentResourceId);
      if (currentResource) {
        // Bessere Ressource finden
        const betterResource = Array.from(this.resources.values())
          .filter(r => r.id !== currentResourceId && r.available > currentResource.available)
          .sort((a, b) => b.available - a.available)[0];

        if (betterResource) {
          this.taskAllocations.set(taskId, betterResource.id);
          // TODO: Remove console.log
        }
      }
    }
  }

  /**
   * Bestimmt benötigte Ressourcen für eine Aufgabe
   */
  private getRequiredResources(task: Task): string[] {
    const requirements: string[] = ['cpu-medium', 'memory-medium'];

    switch (task.type) {
      case 'frontend':
        requirements.push('network-high');
        break;
      case 'backend':
        requirements.push('cpu-high', 'memory-high');
        break;
      case 'ai':
        requirements.push('cpu-high', 'memory-high', 'storage-fast');
        break;
      case 'testing':
        requirements.push('cpu-medium', 'network-high');
        break;
      case 'deployment':
        requirements.push('network-high', 'storage-fast');
        break;
    }

    return requirements;
  }

  /**
   * Findet die beste verfügbare Ressource
   */
  private async findBestResource(resourceType: string, priority: Priority): Promise<ResourceAvailability | null> {
    const availableResources = Array.from(this.resources.values())
      .filter(r => r.available > 0 && r.type === resourceType.split('-')[0]);

    if (availableResources.length === 0) return null;

    // Nach Priorität und Performance sortieren
    return availableResources.sort((a, b) => {
      const priorityScore = this.getPriorityScore(a.priority, priority);
      const performanceScore = b.performance - a.performance;
      return priorityScore + performanceScore;
    })[0];
  }

  /**
   * Berechnet Prioritäts-Score
   */
  private getPriorityScore(resourcePriority: string, taskPriority: Priority): number {
    const priorityMap = { low: 1, medium: 2, high: 3, critical: 4 };
    const taskScore = priorityMap[taskPriority] || 2;
    const resourceScore = priorityMap[resourcePriority as keyof typeof priorityMap] || 2;
    
    return taskScore === resourceScore ? 1 : 0;
  }

  /**
   * Berechnet Ressourcenallokation
   */
  private calculateAllocation(task: Task, resource: ResourceAvailability, priority: Priority): number {
    const baseAllocation = 20; // 20% Basis-Allokation
    const priorityMultiplier = priority === 'critical' ? 2 : priority === 'high' ? 1.5 : 1;
    const taskComplexityMultiplier = task.complexity || 1;
    
    return Math.min(resource.available, baseAllocation * priorityMultiplier * taskComplexityMultiplier);
  }

  /**
   * Aktualisiert Ressourcen-Historie
   */
  private updateResourceHistory(): void {
    const currentState: ResourceAvailability[] = Array.from(this.resources.values());
    this.resourceHistory.push(...currentState);

    // Historie auf 100 Einträge begrenzen
    if (this.resourceHistory.length > 100) {
      this.resourceHistory = this.resourceHistory.slice(-100);
    }
  }

  /**
   * Gibt aktuellen Ressourcenstatus zurück
   */
  getResourceStatus(): Map<string, ResourceAvailability> {
    return new Map(this.resources);
  }

  /**
   * Gibt Agenten-Ressourcen zurück
   */
  getAgentResources(): Map<string, string[]> {
    return new Map(this.agentResources);
  }

  /**
   * Gibt Task-Allokationen zurück
   */
  getTaskAllocations(): Map<string, string> {
    return new Map(this.taskAllocations);
  }

  /**
   * Gibt Ressourcen-Historie zurück
   */
  getResourceHistory(): ResourceAvailability[] {
    return [...this.resourceHistory];
  }

  /**
   * Berechnet Gesamtauslastung
   */
  getOverallUtilization(): number {
    let totalCapacity = 0;
    let totalUsed = 0;

    for (const resource of this.resources.values()) {
      totalCapacity += resource.capacity;
      totalUsed += (resource.capacity - resource.available);
    }

    return totalCapacity > 0 ? totalUsed / totalCapacity : 0;
  }

  /**
   * Identifiziert Engpässe
   */
  identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];

    for (const [resourceId, resource] of this.resources) {
      const utilization = (resource.capacity - resource.available) / resource.capacity;
      if (utilization > 0.8) {
        bottlenecks.push(`${resourceId} (${Math.round(utilization * 100)}%)`);
      }
    }

    return bottlenecks;
  }
}

export default ResourceManager; 