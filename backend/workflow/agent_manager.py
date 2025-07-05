"""
Agent Manager für VALEO-NeuroERP mit APM Framework Integration
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.core.simple_logging import logger
from backend.apm_framework.models import Task, APMWorkflowResult

class AgentRole(BaseModel):
    """Modell für Agentenrollen"""
    role_id: str
    name: str
    responsibilities: List[str]
    tools: List[str]
    active_tasks: List[str] = []
    status: str = "idle"

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, AgentRole] = {}
        self.task_assignments: Dict[str, str] = {}  # task_id -> agent_id
        
    def initialize_agents(self):
        """Initialisiert die verschiedenen Agentenrollen"""
        self.agents = {
            "architect": AgentRole(
                role_id="architect",
                name="System Architect",
                responsibilities=[
                    "system_design",
                    "performance_optimization",
                    "security_review"
                ],
                tools=[
                    "design_patterns",
                    "performance_metrics",
                    "security_analysis"
                ]
            ),
            "developer": AgentRole(
                role_id="developer",
                name="Developer",
                responsibilities=[
                    "implementation",
                    "testing",
                    "documentation"
                ],
                tools=[
                    "code_generation",
                    "test_framework",
                    "doc_tools"
                ]
            ),
            "devops": AgentRole(
                role_id="devops",
                name="DevOps Engineer",
                responsibilities=[
                    "deployment",
                    "monitoring",
                    "scaling"
                ],
                tools=[
                    "infrastructure_as_code",
                    "monitoring_tools",
                    "auto_scaling"
                ]
            ),
            "security": AgentRole(
                role_id="security",
                name="Security Engineer",
                responsibilities=[
                    "security_implementation",
                    "compliance",
                    "auditing"
                ],
                tools=[
                    "security_scanning",
                    "compliance_checking",
                    "audit_tools"
                ]
            )
        }
        
    async def assign_task(self, task_id: str, agent_role: str):
        """Weist einen Task einem Agenten zu"""
        if agent_role not in self.agents:
            raise ValueError(f"Unknown agent role: {agent_role}")
            
        agent = self.agents[agent_role]
        agent.active_tasks.append(task_id)
        agent.status = "busy"
        self.task_assignments[task_id] = agent_role
        
        logger.info(f"Assigned task {task_id} to agent {agent_role}")
        
    async def complete_task(self, task_id: str):
        """Markiert einen Task als abgeschlossen"""
        if task_id not in self.task_assignments:
            raise ValueError(f"Unknown task: {task_id}")
            
        agent_role = self.task_assignments[task_id]
        agent = self.agents[agent_role]
        agent.active_tasks.remove(task_id)
        
        if not agent.active_tasks:
            agent.status = "idle"
            
        del self.task_assignments[task_id]
        logger.info(f"Completed task {task_id} by agent {agent_role}")
        
    def get_agent_status(self) -> Dict[str, Any]:
        """Gibt den Status aller Agenten zurück"""
        return {
            agent_id: {
                "name": agent.name,
                "status": agent.status,
                "active_tasks": agent.active_tasks
            } for agent_id, agent in self.agents.items()
        }
        
    def get_available_agent(self, role: str) -> Optional[str]:
        """Findet einen verfügbaren Agenten für eine bestimmte Rolle"""
        if role not in self.agents:
            return None
            
        agent = self.agents[role]
        if agent.status == "idle":
            return role
            
        return None 