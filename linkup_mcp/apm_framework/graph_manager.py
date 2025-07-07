"""
Graph Manager für APM Workflow
"""
from typing import Dict, Any, List, Callable, Optional
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger("apm-workflow")

class Node:
    """Repräsentiert einen Knoten im Workflow-Graph"""
    def __init__(self, name: str, executor: Callable):
        self.name = name
        self.executor = executor
        self.edges: List['Edge'] = []
        
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Führt die Node-Logik aus"""
        try:
            return await self.executor(state)
        except Exception as e:
            logger.error(f"Fehler bei der Ausführung von Node {self.name}: {str(e)}")
            raise
        
class Edge:
    """Repräsentiert eine Kante im Workflow-Graph"""
    def __init__(self, from_node: Node, to_node: Node):
        self.from_node = from_node
        self.to_node = to_node
        
class WorkflowGraph:
    """Graph für APM Workflow Management"""
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.current_node: Optional[Node] = None
        
    def add_node(self, name: str, executor: Callable) -> Node:
        """Fügt einen neuen Knoten hinzu"""
        node = Node(name, executor)
        self.nodes[name] = node
        return node
        
    def add_edge(self, from_name: str, to_name: str) -> None:
        """Fügt eine neue Kante zwischen Knoten hinzu"""
        if from_name not in self.nodes or to_name not in self.nodes:
            raise ValueError(f"Knoten {from_name} oder {to_name} nicht gefunden")
            
        from_node = self.nodes[from_name]
        to_node = self.nodes[to_name]
        edge = Edge(from_node, to_node)
        from_node.edges.append(edge)
        
    async def execute(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Führt den Workflow aus"""
        if not self.nodes:
            raise ValueError("Graph hat keine Knoten")
            
        try:
            # Mit erstem Knoten starten
            self.current_node = next(iter(self.nodes.values()))
            current_state = initial_state
            
            # Workflow durchlaufen
            while self.current_node:
                try:
                    # Knoten ausführen
                    current_state = await self.current_node.execute(current_state)
                    
                    # Status aktualisieren
                    current_state.update({
                        "current_node": self.current_node.name,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                    # Nächsten Knoten finden
                    if self.current_node.edges:
                        self.current_node = self.current_node.edges[0].to_node
                    else:
                        # Workflow beendet
                        logger.info("Workflow erfolgreich beendet")
                        break
                        
                except Exception as e:
                    logger.error(f"Fehler im Workflow bei Node {self.current_node.name}: {str(e)}")
                    return {
                        "status": "error",
                        "error": str(e),
                        "node": self.current_node.name,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
            return {
                "status": "completed",
                "final_node": self.current_node.name,
                "timestamp": datetime.utcnow().isoformat(),
                **current_state
            }
            
        except Exception as e:
            logger.error(f"Kritischer Fehler im Workflow: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            } 