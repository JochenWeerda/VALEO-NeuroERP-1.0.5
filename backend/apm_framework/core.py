"""
APM Framework Core Module
------------------------
Implementiert die Kernfunktionalität des Agent Process Management Frameworks.
"""

import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProcessState(Enum):
    """Zustände eines APM-Prozesses"""
    INITIALIZED = "initialized"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ProcessContext:
    """Kontext-Informationen für einen Prozess"""
    process_id: str
    start_time: datetime
    state: ProcessState
    metadata: Dict[str, Any]
    agent_assignments: Dict[str, str]  # agent_id -> task_id
    variables: Dict[str, Any]

class ProcessTemplate:
    """Template für einen APM-Prozess"""
    def __init__(self, template_id: str, description: str):
        self.template_id = template_id
        self.description = description
        self.steps: List[Dict[str, Any]] = []
        self.validation_rules: List[Dict[str, Any]] = []
        self.error_handlers: Dict[str, callable] = {}

    def add_step(self, step_config: Dict[str, Any]) -> None:
        """Fügt einen Prozessschritt hinzu"""
        self.steps.append(step_config)

    def add_validation_rule(self, rule: Dict[str, Any]) -> None:
        """Fügt eine Validierungsregel hinzu"""
        self.validation_rules.append(rule)

    def add_error_handler(self, error_type: str, handler: callable) -> None:
        """Registriert einen Error Handler"""
        self.error_handlers[error_type] = handler

class APMCore:
    """Kernkomponente des APM Frameworks"""
    def __init__(self):
        self.process_templates: Dict[str, ProcessTemplate] = {}
        self.active_processes: Dict[str, ProcessContext] = {}
        self.agent_registry: Dict[str, Dict[str, Any]] = {}
        
    async def register_template(self, template: ProcessTemplate) -> None:
        """Registriert ein neues Prozess-Template"""
        if template.template_id in self.process_templates:
            raise ValueError(f"Template {template.template_id} bereits registriert")
        self.process_templates[template.template_id] = template
        logger.info(f"Template {template.template_id} erfolgreich registriert")

    async def register_agent(self, agent_id: str, capabilities: List[str]) -> None:
        """Registriert einen neuen Agenten"""
        self.agent_registry[agent_id] = {
            "capabilities": capabilities,
            "status": "available",
            "current_task": None,
            "last_heartbeat": datetime.now()
        }
        logger.info(f"Agent {agent_id} mit Capabilities {capabilities} registriert")

    async def create_process(self, template_id: str, process_id: str, 
                           initial_context: Dict[str, Any]) -> ProcessContext:
        """Erstellt eine neue Prozessinstanz"""
        if template_id not in self.process_templates:
            raise ValueError(f"Template {template_id} nicht gefunden")

        context = ProcessContext(
            process_id=process_id,
            start_time=datetime.now(),
            state=ProcessState.INITIALIZED,
            metadata=initial_context.get("metadata", {}),
            agent_assignments={},
            variables=initial_context.get("variables", {})
        )
        
        self.active_processes[process_id] = context
        logger.info(f"Prozess {process_id} erstellt mit Template {template_id}")
        return context

    async def execute_process(self, process_id: str) -> None:
        """Führt einen Prozess aus"""
        if process_id not in self.active_processes:
            raise ValueError(f"Prozess {process_id} nicht gefunden")

        context = self.active_processes[process_id]
        context.state = ProcessState.RUNNING
        
        try:
            template = self.process_templates[context.metadata["template_id"]]
            for step in template.steps:
                await self._execute_step(context, step)
            
            context.state = ProcessState.COMPLETED
            logger.info(f"Prozess {process_id} erfolgreich abgeschlossen")
            
        except Exception as e:
            context.state = ProcessState.FAILED
            logger.error(f"Fehler bei Prozess {process_id}: {str(e)}")
            if type(e).__name__ in template.error_handlers:
                await template.error_handlers[type(e).__name__](context, e)

    async def _execute_step(self, context: ProcessContext, step: Dict[str, Any]) -> None:
        """Führt einen einzelnen Prozessschritt aus"""
        step_id = step["id"]
        required_capabilities = step.get("required_capabilities", [])
        
        # Finde geeigneten Agenten
        agent_id = await self._find_available_agent(required_capabilities)
        if not agent_id:
            raise RuntimeError(f"Kein geeigneter Agent für Step {step_id} gefunden")
        
        # Assign task to agent
        context.agent_assignments[agent_id] = step_id
        self.agent_registry[agent_id]["status"] = "busy"
        self.agent_registry[agent_id]["current_task"] = step_id
        
        try:
            # Execute step logic
            await self._process_step_logic(context, step, agent_id)
            
        finally:
            # Cleanup
            self.agent_registry[agent_id]["status"] = "available"
            self.agent_registry[agent_id]["current_task"] = None
            context.agent_assignments.pop(agent_id, None)

    async def _find_available_agent(self, required_capabilities: List[str]) -> Optional[str]:
        """Findet einen verfügbaren Agenten mit den benötigten Fähigkeiten"""
        for agent_id, agent_info in self.agent_registry.items():
            if (agent_info["status"] == "available" and 
                all(cap in agent_info["capabilities"] for cap in required_capabilities)):
                return agent_id
        return None

    async def _process_step_logic(self, context: ProcessContext, 
                                step: Dict[str, Any], agent_id: str) -> None:
        """Verarbeitet die Logik eines Prozessschritts"""
        logger.info(f"Führe Step {step['id']} mit Agent {agent_id} aus")
        
        # Validate input
        for rule in self.process_templates[context.metadata["template_id"]].validation_rules:
            if not await self._validate_rule(context, rule):
                raise ValueError(f"Validierung fehlgeschlagen für Step {step['id']}")
        
        # Execute step-specific logic
        if "action" in step:
            await step["action"](context, agent_id)
        
        logger.info(f"Step {step['id']} erfolgreich abgeschlossen")

    async def _validate_rule(self, context: ProcessContext, 
                           rule: Dict[str, Any]) -> bool:
        """Validiert eine einzelne Regel"""
        try:
            return await rule["validation_func"](context)
        except Exception as e:
            logger.error(f"Fehler bei Regelvalidierung: {str(e)}")
            return False

    async def get_process_status(self, process_id: str) -> Dict[str, Any]:
        """Gibt den aktuellen Status eines Prozesses zurück"""
        if process_id not in self.active_processes:
            raise ValueError(f"Prozess {process_id} nicht gefunden")
        
        context = self.active_processes[process_id]
        return {
            "process_id": process_id,
            "state": context.state.value,
            "start_time": context.start_time.isoformat(),
            "active_agents": list(context.agent_assignments.keys()),
            "metadata": context.metadata
        }

    async def pause_process(self, process_id: str) -> None:
        """Pausiert einen laufenden Prozess"""
        if process_id not in self.active_processes:
            raise ValueError(f"Prozess {process_id} nicht gefunden")
        
        context = self.active_processes[process_id]
        if context.state == ProcessState.RUNNING:
            context.state = ProcessState.PAUSED
            logger.info(f"Prozess {process_id} pausiert")

    async def resume_process(self, process_id: str) -> None:
        """Setzt einen pausierten Prozess fort"""
        if process_id not in self.active_processes:
            raise ValueError(f"Prozess {process_id} nicht gefunden")
        
        context = self.active_processes[process_id]
        if context.state == ProcessState.PAUSED:
            context.state = ProcessState.RUNNING
            logger.info(f"Prozess {process_id} fortgesetzt")
            await self.execute_process(process_id) 