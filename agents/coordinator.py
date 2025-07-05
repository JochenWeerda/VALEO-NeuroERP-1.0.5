# -*- coding: utf-8 -*-
"""
🚀 GENXAIS Framework - Agent Coordinator
"Build the Future from the Beginning"

Coordinator for orchestrating multiple agents in collaborative tasks.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Set
from datetime import datetime
from collections import defaultdict

from .base import BaseAgent, AgentMessage, AgentStatus

logger = logging.getLogger("GENXAIS.Coordinator")

class AgentCoordinator:
    """
    Coordinates multiple agents for collaborative task execution.
    
    Manages:
    - Agent registration and capabilities
    - Task distribution and load balancing
    - Inter-agent communication routing
    - Collective intelligence orchestration
    """
    
    def __init__(self, coordinator_id: str = "genxais_coordinator"):
        """
        Initialize agent coordinator.
        
        Args:
            coordinator_id: Unique identifier for the coordinator
        """
        self.coordinator_id = coordinator_id
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_capabilities: Dict[str, Set[str]] = {}
        self.task_queue: List[Dict[str, Any]] = []
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
        self.message_routing: Dict[str, List[AgentMessage]] = defaultdict(list)
        self.collaboration_network: Dict[str, Set[str]] = defaultdict(set)
        
        logger.info(f"🎯 Agent Coordinator {coordinator_id} initialized")
    
    def register_agent(self, agent: BaseAgent) -> bool:
        """
        Register an agent with the coordinator.
        
        Args:
            agent: Agent instance to register
            
        Returns:
            Registration success status
        """
        try:
            agent_id = agent.agent_id
            
            # Register agent
            self.agents[agent_id] = agent
            self.agent_capabilities[agent_id] = set(agent.get_capabilities())
            
            # Set coordinator reference
            agent.set_coordinator(self)
            
            logger.info(f"✅ Agent {agent_id} registered with capabilities: {agent.get_capabilities()}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Agent registration failed: {e}")
            return False
    
    def unregister_agent(self, agent_id: str) -> bool:
        """
        Unregister an agent from the coordinator.
        
        Args:
            agent_id: ID of agent to unregister
            
        Returns:
            Unregistration success status
        """
        try:
            if agent_id in self.agents:
                del self.agents[agent_id]
                del self.agent_capabilities[agent_id]
                
                # Clean up any pending messages
                if agent_id in self.message_routing:
                    del self.message_routing[agent_id]
                
                logger.info(f"✅ Agent {agent_id} unregistered")
                return True
            else:
                logger.warning(f"⚠️ Agent {agent_id} not found for unregistration")
                return False
                
        except Exception as e:
            logger.error(f"❌ Agent unregistration failed: {e}")
            return False
    
    def find_capable_agents(self, required_capabilities: List[str]) -> List[str]:
        """
        Find agents with specific capabilities.
        
        Args:
            required_capabilities: List of required capabilities
            
        Returns:
            List of agent IDs that have the required capabilities
        """
        capable_agents = []
        
        for agent_id, capabilities in self.agent_capabilities.items():
            if all(cap in capabilities for cap in required_capabilities):
                capable_agents.append(agent_id)
        
        logger.debug(f"🔍 Found {len(capable_agents)} agents for capabilities: {required_capabilities}")
        return capable_agents
    
    async def assign_task(self, task: Dict[str, Any], preferred_agent: Optional[str] = None) -> str:
        """
        Assign a task to the most suitable agent.
        
        Args:
            task: Task specification
            preferred_agent: Specific agent to assign task to (optional)
            
        Returns:
            Task ID for tracking
        """
        try:
            task_id = task.get('id', f"task_{len(self.active_tasks)}")
            task['id'] = task_id
            task['assigned_at'] = datetime.now().isoformat()
            
            # Find suitable agent
            if preferred_agent and preferred_agent in self.agents:
                assigned_agent = preferred_agent
            else:
                required_caps = task.get('required_capabilities', [])
                capable_agents = self.find_capable_agents(required_caps)
                
                if not capable_agents:
                    raise ValueError(f"No agents found with capabilities: {required_caps}")
                
                # Simple load balancing - choose agent with fewest active tasks
                assigned_agent = min(capable_agents, 
                                   key=lambda aid: len([t for t in self.active_tasks.values() 
                                                      if t.get('assigned_agent') == aid]))
            
            # Assign task
            task['assigned_agent'] = assigned_agent
            self.active_tasks[task_id] = task
            
            # Execute task
            agent = self.agents[assigned_agent]
            result = await agent.execute_task(task)
            
            # Update task status
            task['result'] = result
            task['completed_at'] = datetime.now().isoformat()
            
            logger.info(f"✅ Task {task_id} assigned to {assigned_agent}")
            return task_id
            
        except Exception as e:
            logger.error(f"❌ Task assignment failed: {e}")
            raise
    
    async def coordinate_collaboration(self, task: Dict[str, Any], 
                                     participating_agents: List[str]) -> Dict[str, Any]:
        """
        Coordinate collaborative task execution between multiple agents.
        
        Args:
            task: Collaborative task specification
            participating_agents: List of agent IDs to participate
            
        Returns:
            Collaboration result
        """
        try:
            collaboration_id = f"collab_{len(self.collaboration_network)}"
            task['collaboration_id'] = collaboration_id
            
            # Validate all agents exist
            for agent_id in participating_agents:
                if agent_id not in self.agents:
                    raise ValueError(f"Agent {agent_id} not registered")
            
            # Create collaboration network
            for agent_id in participating_agents:
                self.collaboration_network[agent_id].update(
                    set(participating_agents) - {agent_id}
                )
            
            logger.info(f"🤝 Starting collaboration {collaboration_id} with {len(participating_agents)} agents")
            
            # Execute collaborative task
            results = {}
            for agent_id in participating_agents:
                agent = self.agents[agent_id]
                agent_task = {**task, 'collaborators': participating_agents}
                results[agent_id] = await agent.execute_task(agent_task)
            
            # Aggregate results
            collaboration_result = {
                'collaboration_id': collaboration_id,
                'participating_agents': participating_agents,
                'individual_results': results,
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"✅ Collaboration {collaboration_id} completed successfully")
            return collaboration_result
            
        except Exception as e:
            logger.error(f"❌ Collaboration coordination failed: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def receive_message(self, message: AgentMessage) -> Optional[Dict[str, Any]]:
        """
        Receive and route messages from agents.
        
        Args:
            message: Message from an agent
            
        Returns:
            Response if required
        """
        try:
            logger.debug(f"📥 Coordinator received {message.message_type} from {message.sender}")
            
            # Route message based on type
            if message.message_type == 'task_request':
                task_id = await self.assign_task(message.content)
                return {'status': 'accepted', 'task_id': task_id}
            
            elif message.message_type == 'collaboration_request':
                # Find suitable collaborators
                required_caps = message.content.get('required_capabilities', [])
                capable_agents = self.find_capable_agents(required_caps)
                
                if len(capable_agents) > 1:
                    result = await self.coordinate_collaboration(
                        message.content, capable_agents[:3]  # Limit to 3 agents
                    )
                    return {'status': 'collaboration_started', 'result': result}
                else:
                    return {'status': 'insufficient_agents'}
            
            elif message.message_type == 'status_update':
                # Handle agent status updates
                agent_id = message.sender
                if agent_id in self.agents:
                    agent = self.agents[agent_id]
                    return {'status': 'acknowledged', 'agent_status': agent.get_status()}
            
            # Route to specific recipient if specified
            if message.recipient != 'coordinator' and message.recipient in self.agents:
                target_agent = self.agents[message.recipient]
                return await target_agent.receive_message(message)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Message routing failed: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get comprehensive system status.
        
        Returns:
            System status information
        """
        agent_statuses = {}
        for agent_id, agent in self.agents.items():
            agent_statuses[agent_id] = agent.get_status()
        
        return {
            'coordinator_id': self.coordinator_id,
            'registered_agents': len(self.agents),
            'active_tasks': len(self.active_tasks),
            'collaboration_networks': len(self.collaboration_network),
            'agent_statuses': agent_statuses,
            'system_capabilities': list(set().union(*self.agent_capabilities.values())),
            'timestamp': datetime.now().isoformat()
        }
    
    async def shutdown(self):
        """Gracefully shutdown the coordinator and all agents."""
        try:
            logger.info("🛑 Shutting down coordinator...")
            
            # Complete active tasks
            for task_id, task in list(self.active_tasks.items()):
                if task.get('status') != 'completed':
                    logger.info(f"⏳ Waiting for task {task_id} to complete...")
                    await asyncio.sleep(0.1)
            
            # Unregister all agents
            for agent_id in list(self.agents.keys()):
                self.unregister_agent(agent_id)
            
            logger.info("✅ Coordinator shutdown complete")
            
        except Exception as e:
            logger.error(f"❌ Coordinator shutdown failed: {e}")
    
    def __repr__(self) -> str:
        """String representation of the coordinator."""
        return f"<AgentCoordinator(id={self.coordinator_id}, agents={len(self.agents)})>" 