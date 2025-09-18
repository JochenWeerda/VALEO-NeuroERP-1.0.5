# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Any, Dict, List

try:
    from ..memory.rag_manager import RAGMemoryManager  # type: ignore
except Exception:
    RAGMemoryManager = None  # type: ignore

class QueryAgent:
    def __init__(self) -> None:
        self.mgr = RAGMemoryManager() if RAGMemoryManager is not None else None

    def query(self, question: str, k: int = 6) -> List[Dict[str, Any]]:
        if self.mgr is None:
            return []
        return self.mgr.query(question, top_k=k)
