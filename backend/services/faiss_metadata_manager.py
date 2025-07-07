"""
FAISS Metadata Manager für VALEO-NeuroERP
Kombiniert FAISS Vektorsuche mit MongoDB Metadaten-Verwaltung
"""

import faiss
import numpy as np
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from pymongo import MongoClient
import logging
from pathlib import Path
import pickle
import os

class FaissWithMetadataManager:
    """
    Kombiniert FAISS-Vektorsuche mit Metadaten aus MongoDB.
    - add_document(doc_id, embedding): Dokument/Embedding hinzufügen
    - build_index(): Index nach dem Hinzufügen aufbauen
    - search(query_vector, k): Ähnliche Dokumente inkl. Metadaten finden
    """
    def __init__(
        self, 
        dim: int, 
        mongo_uri: str = "mongodb://localhost:27017",
        db_name: str = "valeo_neuroerp",
        collection: str = "documents",
        index_path: str = "./data/faiss_db",
        metadata_path: str = "./data/faiss_metadata"
    ):
        """
        Initialisiert den FAISS Metadata Manager.
        
        Args:
            dim: Dimensionalität der Embeddings
            mongo_uri: MongoDB Verbindungs-URL
            db_name: Name der Datenbank
            collection: Name der Collection
            index_path: Pfad zum FAISS Index
            metadata_path: Pfad zu den Metadaten
        """
        # FAISS Setup
        self.dim = dim
        self.index = faiss.IndexFlatL2(dim)
        self.embeddings: List[np.ndarray] = []
        self.doc_ids: List[str] = []
        
        # Pfade Setup
        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.metadata_path.parent.mkdir(parents=True, exist_ok=True)
        
        # MongoDB Setup
        try:
            self.client = MongoClient(mongo_uri)
            self.collection = self.client[db_name][collection]
            # Erstelle Indizes für bessere Performance
            self.collection.create_index([("timestamp", -1)])
            self.collection.create_index([("doc_type", 1)])
            self.collection.create_index([("title", "text"), ("content", "text")])
        except Exception as e:
            logging.error(f"MongoDB Verbindungsfehler: {str(e)}")
            raise
        
        # Logger Setup
        self.logger = logging.getLogger(__name__)
        
        # Lade existierenden Index falls vorhanden
        self._load_if_exists()

    def add_document(
        self, 
        doc_id: str, 
        embedding: Union[List[float], np.ndarray],
        metadata: Dict[str, Any]
    ) -> bool:
        """
        Fügt ein Dokument mit Embedding und Metadaten hinzu.
        
        Args:
            doc_id: Eindeutige Dokument-ID
            embedding: Embedding Vektor
            metadata: Zusätzliche Metadaten
            
        Returns:
            bool: True wenn erfolgreich
        """
        try:
            # Embedding verarbeiten
            embedding_array = np.array(embedding).astype('float32')
            if embedding_array.shape[0] != self.dim:
                raise ValueError(f"Embedding muss {self.dim} Dimensionen haben")
            
            # Metadaten aufbereiten
            metadata.update({
                "_id": doc_id,
                "timestamp": datetime.utcnow(),
                "embedding_dim": self.dim
            })
            
            # In MongoDB speichern
            self.collection.update_one(
                {"_id": doc_id},
                {"$set": metadata},
                upsert=True
            )
            
            # Zum FAISS Index hinzufügen
            self.embeddings.append(embedding_array)
            self.doc_ids.append(doc_id)
            
            self.logger.info(f"Dokument {doc_id} erfolgreich hinzugefügt")
            return True
            
        except Exception as e:
            self.logger.error(f"Fehler beim Hinzufügen von Dokument {doc_id}: {str(e)}")
            return False

    def build_index(self) -> bool:
        """
        Baut den FAISS Index neu auf.
        
        Returns:
            bool: True wenn erfolgreich
        """
        try:
            if not self.embeddings:
                self.logger.warning("Keine Embeddings zum Indexieren vorhanden")
                return False
                
            vectors = np.vstack(self.embeddings)
            self.index.add(vectors)
            
            # Index und Metadaten speichern
            self._save_state()
            
            self.logger.info(f"Index mit {len(self.embeddings)} Vektoren erfolgreich erstellt")
            return True
            
        except Exception as e:
            self.logger.error(f"Fehler beim Erstellen des Index: {str(e)}")
            return False

    def search(
        self, 
        query_vector: Union[List[float], np.ndarray],
        k: int = 5,
        filter_criteria: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Sucht ähnliche Dokumente.
        
        Args:
            query_vector: Suchanfrage als Embedding
            k: Anzahl der Ergebnisse
            filter_criteria: MongoDB Filter für Metadaten
            
        Returns:
            List[Dict]: Liste der gefundenen Dokumente mit Metadaten
        """
        try:
            query = np.array(query_vector).astype('float32').reshape(1, -1)
            distances, indices = self.index.search(query, k)
            
            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if idx < len(self.doc_ids):
                    doc_id = self.doc_ids[idx]
                    
                    # MongoDB Abfrage mit optionalem Filter
                    mongo_query = {"_id": doc_id}
                    if filter_criteria:
                        mongo_query.update(filter_criteria)
                        
                    doc = self.collection.find_one(mongo_query)
                    if doc:
                        doc["similarity_score"] = float(1 / (1 + distance))
                        results.append(doc)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Fehler bei der Suche: {str(e)}")
            return []

    def _save_state(self):
        """Speichert den aktuellen Zustand des Index und der Metadaten."""
        try:
            # FAISS Index speichern
            faiss.write_index(self.index, str(self.index_path))
            
            # Metadata speichern
            metadata = {
                "doc_ids": self.doc_ids,
                "dim": self.dim,
                "timestamp": datetime.utcnow()
            }
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(metadata, f)
                
            self.logger.info("Index und Metadaten erfolgreich gespeichert")
            
        except Exception as e:
            self.logger.error(f"Fehler beim Speichern des Zustands: {str(e)}")

    def _load_if_exists(self):
        """Lädt existierenden Index und Metadaten falls vorhanden."""
        try:
            if self.index_path.exists() and self.metadata_path.exists():
                # FAISS Index laden
                self.index = faiss.read_index(str(self.index_path))
                
                # Metadata laden
                with open(self.metadata_path, 'rb') as f:
                    metadata = pickle.load(f)
                    
                self.doc_ids = metadata["doc_ids"]
                if metadata["dim"] != self.dim:
                    raise ValueError("Dimensionalität stimmt nicht überein")
                    
                self.logger.info("Existierender Index und Metadaten geladen")
                
        except Exception as e:
            self.logger.error(f"Fehler beim Laden des existierenden Zustands: {str(e)}")
            # Bei Fehler neuen Index erstellen
            self.index = faiss.IndexFlatL2(self.dim)
            self.doc_ids = []

    def rebuild_from_mongodb(self) -> bool:
        """
        Baut den Index neu aus allen MongoDB-Dokumenten auf.
        
        Returns:
            bool: True wenn erfolgreich
        """
        try:
            self.embeddings = []
            self.doc_ids = []
            
            # Alle Dokumente mit Embeddings aus MongoDB laden
            cursor = self.collection.find({"embedding_dim": self.dim})
            for doc in cursor:
                if "embedding" in doc:
                    self.add_document(
                        doc["_id"],
                        doc["embedding"],
                        {k: v for k, v in doc.items() if k not in ["_id", "embedding"]}
                    )
            
            # Index neu aufbauen
            return self.build_index()
            
        except Exception as e:
            self.logger.error(f"Fehler beim Neuaufbau aus MongoDB: {str(e)}")
            return False

    def cleanup(self):
        """Räumt Ressourcen auf."""
        try:
            self.client.close()
            self.logger.info("MongoDB Verbindung geschlossen")
        except Exception as e:
            self.logger.error(f"Fehler beim Aufräumen: {str(e)}") 