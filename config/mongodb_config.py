from typing import Dict, Any
from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
import logging

class MongoDBConfig:
    """
    MongoDB-Konfiguration für VALEO-NeuroERP RAG-System
    """
    def __init__(self):
        # MongoDB Verbindung
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client.valeo_neuroerp
        
        # Collections
        self.handovers = self.db.handovers
        self.technical_docs = self.db.technical_docs
        self.code_snippets = self.db.code_snippets
        self.agent_memory = self.db.agent_memory
        
        # Logger konfigurieren
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Indizes erstellen
        self._create_indices()
        
    def _create_indices(self):
        """
        Erstellt notwendige Indizes für optimale Performance
        """
        try:
            # Handovers Collection
            self.handovers.create_index([("pipeline_id", 1)])
            self.handovers.create_index([("phase", 1)])
            self.handovers.create_index([("timestamp", -1)])
            
            # Technical Docs Collection
            self.technical_docs.create_index([("title", "text")])
            self.technical_docs.create_index([("content", "text")])
            
            # Code Snippets Collection
            self.code_snippets.create_index([("language", 1)])
            self.code_snippets.create_index([("tags", 1)])
            
            # Agent Memory Collection
            self.agent_memory.create_index([("agent_id", 1)])
            self.agent_memory.create_index([("context", "text")])
            
            self.logger.info("MongoDB Indizes erfolgreich erstellt")
            
        except Exception as e:
            self.logger.error(f"Fehler beim Erstellen der Indizes: {str(e)}")
            raise
            
    def store_handover(self, handover: Dict[str, Any]) -> str:
        """
        Speichert ein Handover-Dokument
        """
        try:
            handover["timestamp"] = datetime.utcnow()
            result = self.handovers.insert_one(handover)
            return str(result.inserted_id)
            
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern des Handovers: {str(e)}")
            raise
            
    def get_handover(self, handover_id: str) -> Dict[str, Any]:
        """
        Ruft ein Handover-Dokument ab
        """
        try:
            return self.handovers.find_one({"_id": handover_id})
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen des Handovers: {str(e)}")
            raise
            
    def store_technical_doc(self, doc: Dict[str, Any]) -> str:
        """
        Speichert ein technisches Dokument
        """
        try:
            doc["timestamp"] = datetime.utcnow()
            result = self.technical_docs.insert_one(doc)
            return str(result.inserted_id)
            
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern des Dokuments: {str(e)}")
            raise
            
    def store_code_snippet(self, snippet: Dict[str, Any]) -> str:
        """
        Speichert ein Code-Snippet
        """
        try:
            snippet["timestamp"] = datetime.utcnow()
            result = self.code_snippets.insert_one(snippet)
            return str(result.inserted_id)
            
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern des Code-Snippets: {str(e)}")
            raise
            
    def store_agent_memory(self, memory: Dict[str, Any]) -> str:
        """
        Speichert einen Agenten-Gedächtniseintrag
        """
        try:
            memory["timestamp"] = datetime.utcnow()
            result = self.agent_memory.insert_one(memory)
            return str(result.inserted_id)
            
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern des Agenten-Gedächtnisses: {str(e)}")
            raise
            
    def search_technical_docs(self, query: str) -> list:
        """
        Durchsucht technische Dokumente
        """
        try:
            return list(self.technical_docs.find(
                {"$text": {"$search": query}},
                {"score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]))
            
        except Exception as e:
            self.logger.error(f"Fehler bei der Dokumentensuche: {str(e)}")
            raise
            
    def search_code_snippets(self, query: Dict[str, Any]) -> list:
        """
        Durchsucht Code-Snippets
        """
        try:
            return list(self.code_snippets.find(query))
            
        except Exception as e:
            self.logger.error(f"Fehler bei der Code-Snippet-Suche: {str(e)}")
            raise
            
    def get_agent_memory(self, agent_id: str) -> list:
        """
        Ruft das Gedächtnis eines Agenten ab
        """
        try:
            return list(self.agent_memory.find({"agent_id": agent_id}))
            
        except Exception as e:
            self.logger.error(f"Fehler beim Abrufen des Agenten-Gedächtnisses: {str(e)}")
            raise
            
    def create_backup(self) -> Dict[str, Any]:
        """
        Erstellt ein Backup aller Collections
        """
        try:
            backup = {
                "handovers": list(self.handovers.find()),
                "technical_docs": list(self.technical_docs.find()),
                "code_snippets": list(self.code_snippets.find()),
                "agent_memory": list(self.agent_memory.find()),
                "timestamp": datetime.utcnow()
            }
            return backup
            
        except Exception as e:
            self.logger.error(f"Fehler beim Erstellen des Backups: {str(e)}")
            raise
            
    def restore_backup(self, backup: Dict[str, Any]):
        """
        Stellt ein Backup wieder her
        """
        try:
            # Collections leeren
            self.handovers.delete_many({})
            self.technical_docs.delete_many({})
            self.code_snippets.delete_many({})
            self.agent_memory.delete_many({})
            
            # Daten wiederherstellen
            if backup.get("handovers"):
                self.handovers.insert_many(backup["handovers"])
            if backup.get("technical_docs"):
                self.technical_docs.insert_many(backup["technical_docs"])
            if backup.get("code_snippets"):
                self.code_snippets.insert_many(backup["code_snippets"])
            if backup.get("agent_memory"):
                self.agent_memory.insert_many(backup["agent_memory"])
                
            self.logger.info("Backup erfolgreich wiederhergestellt")
            
        except Exception as e:
            self.logger.error(f"Fehler bei der Backup-Wiederherstellung: {str(e)}")
            raise 