import logging
from typing import Any, Dict
import asyncio
from langgraph.graph import StateGraph, END
import time
from core.db.mongodb import get_database
import datetime

logger = logging.getLogger(__name__)

class LangGraphService:
    def __init__(self):
        # Hier könnten Graph-Definitionen geladen oder initialisiert werden
        self.graphs = {}
        logger.info("LangGraphService initialisiert.")

    async def execute_graph(self, graph_id: str, input_data: Dict[str, Any]) -> Any:
        """Führt einen echten LangGraph-Workflow aus, gibt den Ausführungspfad zurück und speichert das Ergebnis in MongoDB."""
        logger.info(f"Starte Ausführung für Graph {graph_id} mit Input: {input_data}")
        graph_def = self.graphs.get(graph_id)
        if not graph_def:
            return {"error": f"Graph {graph_id} nicht gefunden"}
        steps = graph_def.get("steps", [])
        sg = StateGraph()
        node_map = {}
        execution_path = []
        for step in steps:
            name = step["name"]
            typ = step.get("type", "operation")
            async def handler(ctx, step=step, typ=typ):
                start_time = time.time()
                logger.info(f"{typ.upper()}: {step['name']} (started)")
                execution_path.append({
                    "step": step['name'],
                    "type": typ,
                    "status": "started",
                    "timestamp": start_time
                })
                try:
                    await asyncio.sleep(0.01)
                    end_time = time.time()
                    execution_path.append({
                        "step": step['name'],
                        "type": typ,
                        "status": "completed",
                        "timestamp": end_time
                    })
                    return ctx
                except Exception as e:
                    error_time = time.time()
                    execution_path.append({
                        "step": step['name'],
                        "type": typ,
                        "status": "error",
                        "timestamp": error_time,
                        "error": str(e)
                    })
                    raise
            node_map[name] = handler
            sg.add_node(name, handler)
        for step in steps:
            name = step["name"]
            for dep in step.get("dependencies", []):
                sg.add_edge(dep, name)
        start_nodes = [s["name"] for s in steps if not s.get("dependencies")]
        end_nodes = [s["name"] for s in steps if not any(s["name"] in t.get("dependencies", []) for t in steps)]
        for end in end_nodes:
            sg.add_edge(end, END)
        ctx = input_data.copy()
        run_doc = {
            "graph_id": graph_id,
            "input": input_data,
            "timestamp": datetime.datetime.utcnow(),
            "status": None,
            "execution_path": None,
            "error": None
        }
        try:
            await sg.run(start_nodes, ctx)
            run_doc["status"] = "completed"
            run_doc["execution_path"] = execution_path
            db = await get_database()
            await db.workflow_runs.insert_one(run_doc)
            return {"graph_id": graph_id, "input": input_data, "status": "completed", "execution_path": execution_path}
        except Exception as e:
            logger.error(f"Fehler bei der Ausführung: {e}")
            run_doc["status"] = "error"
            run_doc["execution_path"] = execution_path
            run_doc["error"] = str(e)
            db = await get_database()
            await db.workflow_runs.insert_one(run_doc)
            return {"graph_id": graph_id, "input": input_data, "status": "error", "error": str(e), "execution_path": execution_path}

    def load_graph(self, graph_id: str, graph_definition: Dict[str, Any]):
        """Lädt oder aktualisiert eine Graph-Definition."""
        self.graphs[graph_id] = graph_definition
        logger.info(f"Graph {graph_id} geladen/aktualisiert.")

# Beispiel/Testfunktion für Unittest
def get_test_graph():
    return {
        "steps": [
            {"name": "start", "type": "noop", "config": {}, "dependencies": []},
            {"name": "step1", "type": "noop", "config": {}, "dependencies": ["start"]},
            {"name": "step2", "type": "noop", "config": {}, "dependencies": ["step1"]}
        ],
        "config": {},
        "name": "Testgraph",
        "description": "Ein einfacher Testgraph für LangGraphService"
    }

async def test_execute_graph():
    service = LangGraphService()
    graph_id = "testgraph"
    service.load_graph(graph_id, get_test_graph())
    result = await service.execute_graph(graph_id, {"workflow_id": "testgraph", "user_id": "testuser"})
    print("Testausgabe LangGraphService:", result)

if __name__ == "__main__":
    asyncio.run(test_execute_graph()) 