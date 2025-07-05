from typing import Dict, Any, List
import logging
from datetime import datetime
import uuid
from pymongo import MongoClient

class GENXAISCore:
    """
    Kernkomponenten des GENXAIS-Frameworks
    """
    def __init__(self):
        # MongoDB Verbindung
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client.valeo_neuroerp
        
        # Collections
        self.handovers = self.db.handovers
        self.agent_memory = self.db.agent_memory
        self.technical_docs = self.db.technical_docs
        
        # Logger
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Aktueller Modus
        self.current_mode = "VAN"
        
    def set_mode(self, mode: str):
        """Setzt den Betriebsmodus"""
        self.current_mode = mode
        self.logger.info(f"Modus gewechselt zu: {mode}")
        
    def get_mode(self) -> str:
        """Gibt den aktuellen Modus zurück"""
        return self.current_mode
        
    def get_current_timestamp(self) -> str:
        """Gibt den aktuellen Timestamp zurück"""
        return datetime.utcnow().isoformat()
        
    def create_handover(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt ein Handover-Dokument"""
        handover = {
            "id": str(uuid.uuid4()),
            "timestamp": self.get_current_timestamp(),
            "mode": self.current_mode,
            "data": data
        }
        self.handovers.insert_one(handover)
        return handover
        
    def store_memory(self, agent_id: str, memory: Dict[str, Any]) -> str:
        """Speichert Agenten-Gedächtnis"""
        memory_doc = {
            "agent_id": agent_id,
            "timestamp": self.get_current_timestamp(),
            "memory": memory
        }
        result = self.agent_memory.insert_one(memory_doc)
        return str(result.inserted_id)
        
    def get_memory(self, agent_id: str) -> List[Dict[str, Any]]:
        """Ruft Agenten-Gedächtnis ab"""
        return list(self.agent_memory.find({"agent_id": agent_id}))
        
    def store_technical_doc(self, doc: Dict[str, Any]) -> str:
        """Speichert technische Dokumentation"""
        doc["timestamp"] = self.get_current_timestamp()
        result = self.technical_docs.insert_one(doc)
        return str(result.inserted_id)
        
    def search_technical_docs(self, query: str) -> List[Dict[str, Any]]:
        """Durchsucht technische Dokumentation"""
        return list(self.technical_docs.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]))

class RAGSystem:
    """
    Retrieval Augmented Generation System
    """
    def __init__(self):
        self.core = GENXAISCore()
        
    def store_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Speichert Kontext im RAG System"""
        return self.core.create_handover({
            "type": "context",
            "content": context
        })
        
    def store_result(self, context_id: str, result: Dict[str, Any]):
        """Speichert Ergebnis im RAG System"""
        self.core.create_handover({
            "type": "result",
            "context_id": context_id,
            "content": result
        })
        
    def search_similar_contexts(self, query: str) -> List[Dict[str, Any]]:
        """Sucht ähnliche Kontexte"""
        return self.core.search_technical_docs(query)

class APMCycle:
    """
    Advanced Project Management Cycle
    """
    def __init__(self):
        self.core = GENXAISCore()
        
    def start_operation(self, operation_name: str):
        """Startet eine neue Operation"""
        return self.core.create_handover({
            "type": "operation_start",
            "operation": operation_name
        })
        
    def end_operation(self, operation_id: str, result: Dict[str, Any]):
        """Beendet eine Operation"""
        self.core.create_handover({
            "type": "operation_end",
            "operation_id": operation_id,
            "result": result
        })
        
    def get_current_timestamp(self) -> str:
        """Gibt aktuellen Timestamp zurück"""
        return self.core.get_current_timestamp()

class AgentSystem:
    """
    Agent System für spezialisierte Aufgaben
    """
    def __init__(self):
        self.core = GENXAISCore()
        
    def create_agent(self, agent_type: str) -> Dict[str, Any]:
        """Erstellt einen neuen Agenten"""
        agent = {
            "id": str(uuid.uuid4()),
            "type": agent_type,
            "created_at": self.core.get_current_timestamp()
        }
        self.core.store_memory(agent["id"], {
            "type": "agent_creation",
            "agent_type": agent_type
        })
        return agent
        
    def get_agent_memory(self, agent_id: str) -> List[Dict[str, Any]]:
        """Ruft Agenten-Gedächtnis ab"""
        return self.core.get_memory(agent_id)
        
    def store_agent_result(self, agent_id: str, result: Dict[str, Any]):
        """Speichert Agenten-Ergebnis"""
        self.core.store_memory(agent_id, {
            "type": "agent_result",
            "result": result
        }) 