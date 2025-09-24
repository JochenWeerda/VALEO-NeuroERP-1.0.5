from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import Any, Dict, Optional
import os
import asyncio
import uuid
from pathlib import Path
import traceback

from .multi_agent_orchestrator import run_multi_agent_pipeline, get_job_status

router = APIRouter(prefix="/api/ai-workflow", tags=["AI-Workflow"])


@router.post("/start")
async def start_workflow(background_tasks: BackgroundTasks, repo_root: Optional[str] = None, api_token: Optional[str] = None) -> Dict[str, Any]:
    mcp_endpoints = {
        # Beispiel: Serena MCP-Server (falls aktiv)
        "serena": "http://localhost:3001",  # Passe den Port/Host an deinen MCP-Server an
    }

    job: Dict[str, Any] = {"status": "accepted", "job_id": None}

    async def _run(job_id: str):
        await run_multi_agent_pipeline(
            repo_root=repo_root,
            mcp_endpoints=mcp_endpoints,
            api_token=api_token,
            vectorstore_cfg={"vectorstore": "chromadb"},
            job_id=job_id,
        )

    # Hintergrund-Task starten
    job_id = str(uuid.uuid4())  # stabile Job-ID
    asyncio.create_task(_run(job_id))
    job["job_id"] = job_id

    return job


@router.get("/status/{job_id}")
async def workflow_status(job_id: str) -> Dict[str, Any]:
    return get_job_status(job_id)


@router.get("/query")
async def rag_query(q: str, collection: Optional[str] = None, persist_dir: Optional[str] = None, n: int = 5) -> Dict[str, Any]:
    """Einfacher Query-Endpunkt. Standard: Fallback-Dateisuche.
    ChromaDB wird nur verwendet, wenn USE_CHROMA=1 gesetzt ist.
    """
    max_n = max(1, min(int(n), 20))
    use_chroma = os.environ.get("USE_CHROMA", "0") == "1"
    try:
        if use_chroma:
            from chromadb import Client  # type: ignore
            from chromadb.config import Settings  # type: ignore
            persist_path = persist_dir or "output/ai-workflow/chroma_store"
            coll_name = collection or "valero_code"
            client = Client(Settings(persist_directory=persist_path, is_persistent=True))
            coll = client.get_or_create_collection(name=coll_name)
            res = coll.query(query_texts=[q], n_results=max_n)
            return {"mode": "chroma", "results": res, "collection": coll_name, "persist_dir": persist_path}

        # Fallback-Dateisuche
        base_dir = Path(__file__).resolve().parents[2]
        allowed_ext = {".py", ".ts", ".tsx", ".js", ".jsx", ".md", ".txt", ".json", ".yml", ".yaml"}
        max_file_size = 200_000
        matches: list[dict[str, Any]] = []
        needle = q.lower()
        for dirpath, _, filenames in os.walk(base_dir):
            for fn in filenames:
                p = Path(dirpath) / fn
                if p.suffix.lower() not in allowed_ext:
                    continue
                try:
                    if p.stat().st_size > max_file_size:
                        continue
                    text = p.read_text(encoding="utf-8", errors="ignore")
                except Exception:
                    continue
                idx = text.lower().find(needle)
                if idx != -1:
                    start = max(0, idx - 120)
                    end = min(len(text), idx + len(q) + 120)
                    snippet = text[start:end]
                    matches.append({
                        "path": str(p.relative_to(base_dir)).replace("\\", "/"),
                        "snippet": snippet,
                    })
                    if len(matches) >= max_n:
                        break
            if len(matches) >= max_n:
                break
        return {"mode": "fallback", "results": {"documents": [m["snippet"] for m in matches]}, "files": matches}
    except Exception as e:
        return {"mode": "error", "error": str(e), "trace": traceback.format_exc()}
