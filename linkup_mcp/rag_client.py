# -*- coding: utf-8 -*-
"""
Verbesserter RAG-Client für VALEO-NeuroERP.
Dieser Client stellt eine robuste Integration mit dem RAG-System her.
"""

import aiohttp
import logging
from typing import Dict, Any, List, Optional, Union

logger = logging.getLogger("rag_client")

class RAGClient:
    """Client für die RAG-Integration"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialisiert den RAG-Client"""
        self.config = config or {}
        self.api_endpoint = self.config.get("api_endpoint", "http://localhost:8000/api/v1/query")
        self.api_token = self.config.get("api_token", "")
        self.collection = self.config.get("collection", "default")
        self.session = None
        
    async def initialize(self) -> None:
        """Initialisiert die HTTP-Session"""
        self.session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
        )
        logger.info(f"RAG-Client initialisiert für Endpoint: {self.api_endpoint}")
    
    async def query(self, query_text: str, top_k: int = 5) -> Dict[str, Any]:
        """Führt eine Abfrage an das RAG-System durch"""
        if not self.session:
            await self.initialize()
        
        try:
            payload = {
                "query": query_text,
                "collection": self.collection,
                "top_k": top_k
            }
            
            async with self.session.post(self.api_endpoint, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    return {
                        "status": "success",
                        "results": result.get("results", []),
                        "metadata": result.get("metadata", {})
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"RAG-Abfrage fehlgeschlagen: {error_text}")
                    return {
                        "status": "error",
                        "message": f"HTTP-Fehler: {response.status}",
                        "details": error_text
                    }
        except Exception as e:
            logger.error(f"Fehler bei der RAG-Abfrage: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def close(self) -> None:
        """Schließt die HTTP-Session"""
        if self.session:
            await self.session.close()
            self.session = None
            logger.info("RAG-Client-Session geschlossen")
