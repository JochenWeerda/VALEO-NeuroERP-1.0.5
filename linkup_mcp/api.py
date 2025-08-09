# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any

try:
    from fastapi import FastAPI
    from pydantic import BaseModel
    HAS_FASTAPI = True
except Exception:
    HAS_FASTAPI = False

from .pipelines.valero_full_analysis import run_valero_full_analysis
from .memory.rag_manager import RAGMemoryManager


if HAS_FASTAPI:
    app = FastAPI(title="VALERO API")

    class AnalyzeRequest(BaseModel):
        root: str = "."

    class RagBuildRequest(BaseModel):
        paths: List[str] = ["."]

    class RagQueryRequest(BaseModel):
        question: str
        top_k: int = 6

    @app.post("/analyze")
    def analyze(req: AnalyzeRequest) -> Dict[str, Any]:
        res = run_valero_full_analysis(req.root)
        return {
            "code_files": len(res.get("scan", {}).get("by_type", {}).get("code", [])),
            "issues": sum(len(f.get("findings", [])) for f in res.get("quality", [])),
            "playbook_items": len(res.get("playbook", {}).get("items", [])),
            "artifacts_dir": "output/valero_system",
        }

    @app.post("/rag/build")
    def rag_build(req: RagBuildRequest) -> Dict[str, Any]:
        mm = RAGMemoryManager()
        return mm.build_index(req.paths)

    @app.post("/rag/query")
    def rag_query(req: RagQueryRequest) -> List[Dict[str, Any]]:
        mm = RAGMemoryManager()
        return mm.query(req.question, top_k=req.top_k)
else:
    # Fallback: Hinweisfunktionen
    def app_unavailable() -> None:
        raise RuntimeError("FastAPI ist nicht installiert. Bitte 'fastapi' und 'uvicorn' hinzufügen.")