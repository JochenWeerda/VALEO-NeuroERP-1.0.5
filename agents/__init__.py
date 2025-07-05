# -*- coding: utf-8 -*-
"""
🚀 GENXAIS Framework - Agents Package
"Build the Future from the Beginning"

Complete agent system with registry pattern and coordinator.
"""

import logging
from typing import Dict, List, Optional, Type, Any

from .base import BaseAgent, AgentStatus, AgentMetrics, AgentMessage
from .coordinator import AgentCoordinator

logger = logging.getLogger("GENXAIS.Agents")

class AgentRegistry:
    """
    Registry for managing different types of agents.
    
    Provides centralized agent management and factory pattern
    for creating specialized agents.
    """
    
    def __init__(self):
        """Initialize agent registry."""
        self._agent_types: Dict[str, Type[BaseAgent]] = {}
        self._agents: Dict[str, BaseAgent] = {}
        self.coordinator: Optional[AgentCoordinator] = None
        
        logger.info("🎯 Agent Registry initialized")
    
    def register_agent_type(self, agent_type_name: str, agent_class: Type[BaseAgent]):
        """
        Register an agent type in the registry.
        
        Args:
            agent_type_name: Name for the agent type
            agent_class: Agent class to register
        """
        self._agent_types[agent_type_name] = agent_class
        logger.info(f"📝 Registered agent type: {agent_type_name}")
    
    def create_agent(self, agent_type: str, agent_id: str, **kwargs) -> Optional[BaseAgent]:
        """
        Create an agent instance of specified type.
        
        Args:
            agent_type: Type of agent to create
            agent_id: Unique identifier for the agent
            **kwargs: Additional arguments for agent creation
            
        Returns:
            Created agent instance or None if type not found
        """
        try:
            if agent_type not in self._agent_types:
                logger.error(f"❌ Unknown agent type: {agent_type}")
                return None
            
            agent_class = self._agent_types[agent_type]
            agent = agent_class(agent_id, **kwargs)
            
            # Register with coordinator if available
            if self.coordinator:
                self.coordinator.register_agent(agent)
            
            self._agents[agent_id] = agent
            logger.info(f"✅ Created {agent_type} agent: {agent_id}")
            
            return agent
            
        except Exception as e:
            logger.error(f"❌ Agent creation failed: {e}")
            return None
    
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """
        Get agent by ID.
        
        Args:
            agent_id: Agent identifier
            
        Returns:
            Agent instance or None if not found
        """
        return self._agents.get(agent_id)
    
    def list_agents(self) -> List[str]:
        """
        List all registered agent IDs.
        
        Returns:
            List of agent IDs
        """
        return list(self._agents.keys())
    
    def list_agent_types(self) -> List[str]:
        """
        List all available agent types.
        
        Returns:
            List of agent type names
        """
        return list(self._agent_types.keys())
    
    def set_coordinator(self, coordinator: AgentCoordinator):
        """
        Set coordinator for the registry.
        
        Args:
            coordinator: Coordinator instance
        """
        self.coordinator = coordinator
        
        # Register existing agents with coordinator
        for agent in self._agents.values():
            coordinator.register_agent(agent)
        
        logger.info("🎯 Coordinator set for registry")
    
    def get_registry_status(self) -> Dict[str, Any]:
        """
        Get registry status information.
        
        Returns:
            Registry status
        """
        return {
            'registered_agent_types': len(self._agent_types),
            'active_agents': len(self._agents),
            'agent_types': list(self._agent_types.keys()),
            'agent_ids': list(self._agents.keys()),
            'coordinator_active': self.coordinator is not None
        }

# Default registry instance
agent_registry = AgentRegistry()

# Example specialized agents
class DeveloperAgent(BaseAgent):
    """Agent specialized in development tasks."""
    
    def __init__(self, agent_id: str, programming_languages: List[str] = None):
        capabilities = [
            'code_generation', 'code_review', 'debugging', 
            'testing', 'documentation'
        ]
        if programming_languages:
            capabilities.extend([f"programming_{lang}" for lang in programming_languages])
        
        super().__init__(agent_id, capabilities)
        self.programming_languages = programming_languages or ['python']
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute development task."""
        task_type = task.get('type', 'unknown')
        
        if task_type == 'code_generation':
            return await self._generate_code(task)
        elif task_type == 'code_review':
            return await self._review_code(task)
        elif task_type == 'debugging':
            return await self._debug_code(task)
        else:
            return {
                'status': 'error',
                'error': f'Unsupported task type: {task_type}'
            }
    
    async def _generate_code(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code based on requirements."""
        # Simulate code generation
        requirements = task.get('requirements', '')
        language = task.get('language', 'python')
        
        return {
            'status': 'completed',
            'result': f'# Generated {language} code for: {requirements}\n# TODO: Implement logic',
            'language': language,
            'lines_of_code': 10
        }
    
    async def _review_code(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Review code for quality and issues."""
        # Simulate code review
        code = task.get('code', '')
        
        return {
            'status': 'completed',
            'result': 'Code review completed',
            'suggestions': ['Add error handling', 'Improve variable names'],
            'quality_score': 0.85
        }
    
    async def _debug_code(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Debug code and identify issues."""
        # Simulate debugging
        code = task.get('code', '')
        error = task.get('error', '')
        
        return {
            'status': 'completed',
            'result': 'Debugging completed',
            'issues_found': 1,
            'fixes_suggested': ['Check variable initialization']
        }
    
    def get_capabilities(self) -> List[str]:
        """Return developer agent capabilities."""
        return self.capabilities

class AnalystAgent(BaseAgent):
    """Agent specialized in analysis and planning tasks."""
    
    def __init__(self, agent_id: str, analysis_domains: List[str] = None):
        capabilities = [
            'requirements_analysis', 'system_design', 'architecture_planning',
            'risk_assessment', 'feasibility_analysis'
        ]
        if analysis_domains:
            capabilities.extend([f"analysis_{domain}" for domain in analysis_domains])
        
        super().__init__(agent_id, capabilities)
        self.analysis_domains = analysis_domains or ['general']
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute analysis task."""
        task_type = task.get('type', 'unknown')
        
        if task_type == 'requirements_analysis':
            return await self._analyze_requirements(task)
        elif task_type == 'system_design':
            return await self._design_system(task)
        elif task_type == 'architecture_planning':
            return await self._plan_architecture(task)
        else:
            return {
                'status': 'error',
                'error': f'Unsupported task type: {task_type}'
            }
    
    async def _analyze_requirements(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project requirements."""
        requirements = task.get('requirements', [])
        
        return {
            'status': 'completed',
            'result': 'Requirements analysis completed',
            'functional_requirements': len([r for r in requirements if r.get('type') == 'functional']),
            'non_functional_requirements': len([r for r in requirements if r.get('type') == 'non_functional']),
            'complexity_score': 0.7
        }
    
    async def _design_system(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Design system architecture."""
        requirements = task.get('requirements', {})
        
        return {
            'status': 'completed',
            'result': 'System design completed',
            'components': ['frontend', 'backend', 'database'],
            'design_patterns': ['MVC', 'Repository'],
            'estimated_complexity': 'medium'
        }
    
    async def _plan_architecture(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Plan system architecture."""
        system_design = task.get('system_design', {})
        
        return {
            'status': 'completed',
            'result': 'Architecture planning completed',
            'layers': ['presentation', 'business', 'data'],
            'technologies': ['Python', 'FastAPI', 'PostgreSQL'],
            'scalability_score': 0.8
        }
    
    def get_capabilities(self) -> List[str]:
        """Return analyst agent capabilities."""
        return self.capabilities

# Register default agent types
agent_registry.register_agent_type('developer', DeveloperAgent)
agent_registry.register_agent_type('analyst', AnalystAgent)

# Export main classes and registry
__all__ = [
    'BaseAgent', 'AgentStatus', 'AgentMetrics', 'AgentMessage',
    'AgentCoordinator', 'AgentRegistry', 'DeveloperAgent', 'AnalystAgent',
    'agent_registry'
] 