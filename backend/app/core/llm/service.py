from typing import Dict, Any, Optional, List
import httpx
from pydantic import BaseModel
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class LLMConfig(BaseModel):
    model_name: str = "llama2"
    base_url: str = "http://localhost:11434"
    temperature: float = 0.7
    max_tokens: int = 2000
    context_window: int = 4096

class LLMService:
    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self.client = httpx.AsyncClient(base_url=self.config.base_url, timeout=30.0)
        self._model_loaded = False

    async def ensure_model_loaded(self):
        if not self._model_loaded:
            try:
                response = await self.client.post("/api/pull", json={"name": self.config.model_name})
                response.raise_for_status()
                self._model_loaded = True
                logger.info(f"Model {self.config.model_name} erfolgreich geladen")
            except Exception as e:
                logger.error(f"Fehler beim Laden des Modells: {str(e)}")
                raise

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        await self.ensure_model_loaded()
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = await self.client.post(
                "/api/chat",
                json={
                    "model": self.config.model_name,
                    "messages": messages,
                    "temperature": self.config.temperature,
                    "max_tokens": self.config.max_tokens
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Fehler bei der LLM-Generierung: {str(e)}")
            raise

    async def generate_embedding(self, text: str) -> List[float]:
        await self.ensure_model_loaded()
        
        try:
            response = await self.client.post(
                "/api/embeddings",
                json={
                    "model": self.config.model_name,
                    "prompt": text
                }
            )
            response.raise_for_status()
            return response.json()["embedding"]
        except Exception as e:
            logger.error(f"Fehler bei der Embedding-Generierung: {str(e)}")
            raise

    async def close(self):
        await self.client.aclose() 