# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import List, Dict, Any

from ..memory.rag_manager import RAGMemoryManager


class QueryAgent:
    def __init__(self, memory: RAGMemoryManager) -> None:
        self.memory = memory

    def query(self, question: str, top_k: int = 6) -> List[Dict[str, Any]]:
        return self.memory.query(question, top_k=top_k)