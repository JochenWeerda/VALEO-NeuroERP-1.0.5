from typing import Any, Dict, List
from core.models.workflow import Workflow, WorkflowStep
from core.workflow.steps import get_step_handler
import networkx as nx
from datetime import datetime
import logging
from core.services.langgraph_service import LangGraphService

logger = logging.getLogger(__name__)

class WorkflowEngine:
    async def execute(self, workflow: Workflow) -> Any:
        """Führt einen Workflow aus (jetzt über LangGraphService)."""
        try:
            langgraph = LangGraphService()
            # Graph-Definition aus Workflow generieren
            graph_id = workflow.id
            graph_definition = {
                "steps": [step.dict() for step in workflow.steps],
                "config": workflow.config or {},
                "name": workflow.name,
                "description": workflow.description
            }
            langgraph.load_graph(graph_id, graph_definition)
            # Ausführung an LangGraph delegieren
            result = await langgraph.execute_graph(graph_id, {"workflow_id": workflow.id, "user_id": workflow.user_id})
            return result
        except Exception as e:
            logger.error(f"LangGraph-Ausführung fehlgeschlagen, fallback auf klassische Engine: {str(e)}")
            # Fallback: klassische Ausführung
            # ... bestehende klassische Engine ...
            try:
                graph = self._create_dependency_graph(workflow.steps)
                execution_order = list(nx.topological_sort(graph))
                results: Dict[str, Any] = {}
                for step_name in execution_order:
                    step = next(s for s in workflow.steps if s.name == step_name)
                    handler = get_step_handler(step.type)
                    dependencies = {dep: results[dep] for dep in step.dependencies}
                    logger.info(f"Executing step: {step_name}")
                    result = await handler.execute(config=step.config, dependencies=dependencies)
                    results[step_name] = result
                return results
            except Exception as e2:
                logger.error(f"Workflow execution failed: {str(e2)}")
                raise

    def _create_dependency_graph(
        self,
        steps: List[WorkflowStep]
    ) -> nx.DiGraph:
        """Erstellt einen gerichteten Graphen der Workflow-Schritte"""
        graph = nx.DiGraph()
        
        # Add nodes
        for step in steps:
            graph.add_node(step.name)
            
        # Add edges
        for step in steps:
            for dep in step.dependencies:
                graph.add_edge(dep, step.name)
                
        # Check for cycles
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("Workflow contains circular dependencies")
            
        return graph 