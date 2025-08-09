import asyncio
import os
from dotenv import load_dotenv

# Optionale Abhängigkeiten robust behandeln
try:
    from linkup import LinkupClient  # type: ignore
except Exception:
    LinkupClient = None  # type: ignore

try:
    from rag import RAGWorkflow  # type: ignore
except Exception:
    RAGWorkflow = None  # type: ignore

try:
    from mcp.server.fastmcp import FastMCP
except Exception as e:
    raise

try:
    from pymongo import MongoClient  # type: ignore
except Exception:
    MongoClient = None  # type: ignore

from datetime import datetime
from typing import List, Dict, Any, Optional
from .memory.rag_manager import RAGMemoryManager
from pathlib import Path
from .pipelines.valero_full_analysis import run_valero_full_analysis
from .serena.integration import plan_refactors as serena_plan_refactors, apply_refactors as serena_apply_refactors

load_dotenv()

mcp = FastMCP('linkup-server')
client = LinkupClient() if LinkupClient is not None else None
rag_workflow = RAGWorkflow() if RAGWorkflow is not None else None
rag_memory = RAGMemoryManager()

# MongoDB-Verbindung herstellen (optional)
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")

if MongoClient is not None:
    try:
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client[MONGODB_DB_NAME]
        search_history_collection = db.get_collection("search_history")
        rag_history_collection = db.get_collection("rag_history")
    except Exception:
        search_history_collection = None
        rag_history_collection = None
else:
    search_history_collection = None
    rag_history_collection = None


@mcp.tool()
def web_search(query: str, user_id: Optional[str] = None) -> Any:
    """
    Sucht im Web nach Informationen und speichert die Ergebnisse optional in MongoDB.
    """
    if client is None:
        return {"error": "LinkupClient nicht verfügbar"}

    start_time = datetime.now()
    search_response = client.search(
        query=query,
        depth="standard",
        output_type="sourcedAnswer",
        structured_output_schema=None,
    )
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)

    if search_history_collection is not None:
        try:
            search_history_collection.insert_one({
                "user_id": user_id,
                "query": query,
                "response": search_response,
                "response_time_ms": response_time_ms,
                "timestamp": datetime.now()
            })
        except Exception:
            pass

    return search_response


@mcp.tool()
async def rag_query(question: str, user_id: Optional[str] = None) -> Any:
    """
    Stellt Fragen an lokale Dokumente mit RAG (klassischer Workflow) – optional verfügbar.
    Fällt zurück, wenn RAGWorkflow nicht verfügbar ist.
    """
    if rag_workflow is None:
        return {"error": "RAGWorkflow nicht verfügbar. Verwende rag_query_local."}

    start_time = datetime.now()
    response = await rag_workflow.query(question)
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)

    if rag_history_collection is not None:
        try:
            rag_history_collection.insert_one({
                "user_id": user_id,
                "question": question,
                "response": str(response),
                "response_time_ms": response_time_ms,
                "timestamp": datetime.now()
            })
        except Exception:
            pass

    return str(response)


@mcp.tool()
def run_full_analysis(paths: list[str] | None = None) -> dict:
    """Führt die vollständige Systemanalyse aus und gibt eine kurze Übersicht zurück."""
    root = paths[0] if paths else "."
    result = run_valero_full_analysis(root)
    return {
        "files": {
            "scan": "output/valero_system/scan.json",
            "architecture": "output/valero_system/architecture.json",
            "quality": "output/valero_system/quality.json",
            "playbook": "output/valero_system/playbook.json",
            "report": "output/valero_system/report.md",
        },
        "counts": {
            "code_files": len(result.get("scan", {}).get("by_type", {}).get("code", [])),
            "issues": sum(len(f.get("findings", [])) for f in result.get("quality", [])),
            "playbook_items": len(result.get("playbook", {}).get("items", [])),
        },
    }


@mcp.tool()
def analysis_overview(limit: int = 10) -> dict:
    """Gibt einen Überblick über Architektur, Qualität und Playbook zurück (Top-N)."""
    import json
    base = Path("output/valero_system")
    try:
        arch = json.loads((base / "architecture.json").read_text(encoding="utf-8"))
        qual = json.loads((base / "quality.json").read_text(encoding="utf-8"))
        play = json.loads((base / "playbook.json").read_text(encoding="utf-8"))
    except Exception:
        return {"error": "Noch keine Analyse-Artefakte gefunden. Bitte run_full_analysis ausführen."}

    qual_sorted = sorted(qual, key=lambda x: x.get("score", 0))[:limit]
    return {
        "summary": arch.get("summary", {}),
        "quality_top": [
            {"path": q.get("path"), "score": q.get("score"), "findings": q.get("findings", [])[:3]}
            for q in qual_sorted
        ],
        "playbook_top": play.get("items", [])[:limit],
    }


@mcp.tool()
def build_rag_index(paths: list[str] | None = None) -> dict:
    """Baut oder erweitert den RAG-Index aus den gegebenen Pfaden."""
    if not paths:
        paths = [str(Path.cwd())]
    rag_memory.build_index(paths)
    return rag_memory.export_manifest()


@mcp.tool()
def rag_query_local(question: str, top_k: int = 6) -> list[dict]:
    """Fragt den lokalen RAG-Speicher ab und liefert Top-K Treffer mit Scores."""
    return rag_memory.query(question, top_k=top_k)


@mcp.tool()
def get_search_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Ruft die Suchhistorie aus MongoDB ab (falls verfügbar).
    """
    if search_history_collection is None:
        return []
    query = {}
    if user_id:
        query["user_id"] = user_id
    history = list(search_history_collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return history


@mcp.tool()
def get_rag_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Ruft die RAG-Abfragehistorie aus MongoDB ab (falls verfügbar).
    """
    if rag_history_collection is None:
        return []
    query = {}
    if user_id:
        query["user_id"] = user_id
    history = list(rag_history_collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return history


@mcp.tool()
def serena_plan(limit: int = 1000) -> dict:
    """Erstellt ein Refactoring-Playbook aus der letzten Qualitätsanalyse."""
    import json
    base = Path("output/valero_system")
    try:
        quality = json.loads((base / "quality.json").read_text(encoding="utf-8"))
    except Exception:
        return {"error": "Keine quality.json gefunden. Bitte run_full_analysis zuerst ausführen."}
    playbook = serena_plan_refactors(quality)
    (base / "playbook.json").write_text(json.dumps(playbook, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"count": len(playbook.get("items", []))}


@mcp.tool()
def serena_apply(dry_run: bool = True) -> dict:
    """Wendet Refactoring-Playbook sicher an (standard dry-run) und gibt Change-Report zurück."""
    import json
    base = Path("output/valero_system")
    try:
        playbook = json.loads((base / "playbook.json").read_text(encoding="utf-8"))
    except Exception:
        return {"error": "Keine playbook.json gefunden. Bitte serena_plan ausführen."}
    result = serena_apply_refactors(playbook, apply=not dry_run)
    (base / "changes.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"applied": not dry_run, "change_count": len(result.get("changes", []))}


if __name__ == "__main__":
    # Dokumente für klassischen RAG-Workflow nur laden, wenn verfügbar
    if rag_workflow is not None:
        asyncio.run(rag_workflow.ingest_documents("data"))
    mcp.run(transport="stdio")










