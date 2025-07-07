"""
VALEO-NeuroERP Vector Search Implementation
"""
import os
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import faiss
import torch
from transformers import AutoTokenizer, AutoModel
import structlog
from .config import config

logger = structlog.get_logger(__name__)

class VectorSearch:
    """FAISS-basierte Vektorsuche"""
    def __init__(self):
        self.config = config.get_faiss_config()
        self.index = None
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    async def initialize(self):
        """Initialisiert die Vektorsuche"""
        try:
            # BERT Modell laden
            model_name = "bert-base-german-cased"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name).to(self.device)
            
            # FAISS Index erstellen oder laden
            if os.path.exists(self.config["index_path"]):
                self.index = faiss.read_index(self.config["index_path"])
                logger.info("FAISS index loaded", path=self.config["index_path"])
            else:
                self.index = faiss.IndexFlatIP(self.config["dimension"])
                logger.info("New FAISS index created")
            
        except Exception as e:
            logger.error("Failed to initialize vector search", error=str(e))
            raise
    
    def _get_embedding(self, text: str) -> np.ndarray:
        """Erstellt ein BERT Embedding für einen Text"""
        # Text tokenisieren
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)
        
        # Embedding erstellen
        with torch.no_grad():
            outputs = self.model(**inputs)
            embeddings = outputs.last_hidden_state.mean(dim=1)
        
        # Auf CPU verschieben und normalisieren
        embedding = embeddings.cpu().numpy()
        embedding = embedding / np.linalg.norm(embedding)
        return embedding
    
    async def add_document(self, doc_id: str, text: str):
        """Fügt ein Dokument zum Index hinzu"""
        try:
            # Embedding erstellen
            embedding = self._get_embedding(text)
            
            # Zum Index hinzufügen
            self.index.add(embedding)
            
            # Index speichern
            faiss.write_index(self.index, self.config["index_path"])
            logger.info("Document added to index", doc_id=doc_id)
            
        except Exception as e:
            logger.error("Failed to add document", 
                        doc_id=doc_id,
                        error=str(e))
            raise
    
    async def search(self, query: str, k: int = 10) -> List[Tuple[int, float]]:
        """Führt eine Vektorsuche durch"""
        try:
            # Query-Embedding erstellen
            query_embedding = self._get_embedding(query)
            
            # Suche durchführen
            scores, indices = self.index.search(query_embedding, k)
            
            # Ergebnisse formatieren
            results = list(zip(indices[0], scores[0]))
            return results
            
        except Exception as e:
            logger.error("Vector search failed", error=str(e))
            raise
    
    async def delete_document(self, index: int):
        """Löscht ein Dokument aus dem Index"""
        try:
            # Dokument löschen
            self.index.remove_ids(np.array([index]))
            
            # Index speichern
            faiss.write_index(self.index, self.config["index_path"])
            logger.info("Document deleted from index", index=index)
            
        except Exception as e:
            logger.error("Failed to delete document", 
                        index=index,
                        error=str(e))
            raise
    
    async def update_document(self, index: int, text: str):
        """Aktualisiert ein Dokument im Index"""
        try:
            # Altes Dokument löschen
            await self.delete_document(index)
            
            # Neues Embedding erstellen und hinzufügen
            embedding = self._get_embedding(text)
            self.index.add(embedding)
            
            # Index speichern
            faiss.write_index(self.index, self.config["index_path"])
            logger.info("Document updated in index", index=index)
            
        except Exception as e:
            logger.error("Failed to update document", 
                        index=index,
                        error=str(e))
            raise
    
    def get_index_size(self) -> int:
        """Gibt die Anzahl der Dokumente im Index zurück"""
        return self.index.ntotal
    
    async def save_index(self):
        """Speichert den Index"""
        try:
            faiss.write_index(self.index, self.config["index_path"])
            logger.info("Index saved successfully")
        except Exception as e:
            logger.error("Failed to save index", error=str(e))
            raise
    
    async def load_index(self):
        """Lädt den Index"""
        try:
            self.index = faiss.read_index(self.config["index_path"])
            logger.info("Index loaded successfully")
        except Exception as e:
            logger.error("Failed to load index", error=str(e))
            raise

# Globale Vektorsuche-Instanz
vector_search = VectorSearch() 