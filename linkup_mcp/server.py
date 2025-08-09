import asyncio
import os
from dotenv import load_dotenv
from linkup import LinkupClient
from rag import RAGWorkflow
from mcp.server.fastmcp import FastMCP
from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict, Any, Optional
from .memory.rag_manager import RAGMemoryManager
from pathlib import Path
from .pipelines.valero_full_analysis import run_valero_full_analysis

load_dotenv()

mcp = FastMCP('linkup-server')
client = LinkupClient()
rag_workflow = RAGWorkflow()
rag_memory = RAGMemoryManager()

# MongoDB-Verbindung herstellen
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[MONGODB_DB_NAME]
search_history_collection = db["search_history"]
rag_history_collection = db["rag_history"]

@mcp.tool()
def web_search(query: str, user_id: Optional[str] = None) -> str:
    """
    Sucht im Web nach Informationen und speichert die Ergebnisse in MongoDB.
    
    Args:
        query: Die Suchanfrage
        user_id: Optional. Die Benutzer-ID für die Nachverfolgung der Suchhistorie
    """
    start_time = datetime.now()
    
    # Suchanfrage ausführen
    search_response = client.search(
        query=query,
        depth="standard",  # "standard" oder "deep"
        output_type="sourcedAnswer",  # "searchResults" oder "sourcedAnswer" oder "structured"
        structured_output_schema=None,  # muss ausgefüllt sein, wenn output_type "structured" ist
    )
    
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)
    
    # Ergebnisse in MongoDB speichern
    search_history_item = {
        "user_id": user_id,
        "query": query,
        "response": search_response,
        "response_time_ms": response_time_ms,
        "timestamp": datetime.now()
    }
    
    search_history_collection.insert_one(search_history_item)
    
    return search_response

@mcp.tool()
async def rag_query(question: str, user_id: Optional[str] = None) -> str:
    """
    Stellt Fragen an lokale Dokumente mit RAG (Retrieval-Augmented Generation) und speichert die Ergebnisse in MongoDB.
    
    Args:
        question: Die Frage zu den Dokumenten
        user_id: Optional. Die Benutzer-ID für die Nachverfolgung der RAG-Abfragehistorie
    """
    start_time = datetime.now()
    
    # RAG-Abfrage ausführen
    response = await rag_workflow.query(question)
    
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)
    
    # Ergebnisse in MongoDB speichern
    rag_history_item = {
        "user_id": user_id,
        "question": question,
        "response": str(response),
        "response_time_ms": response_time_ms,
        "timestamp": datetime.now()
    }
    
    rag_history_collection.insert_one(rag_history_item)
    
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
    from pathlib import Path
    base = Path("output/valero_system")
    data = {}
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
    Ruft die Suchhistorie aus MongoDB ab.
    
    Args:
        user_id: Optional. Die Benutzer-ID zur Filterung der Suchhistorie
        limit: Die maximale Anzahl der zurückzugebenden Historieneinträge
    """
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    history = list(search_history_collection.find(
        query, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    
    return history

@mcp.tool()
def get_rag_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Ruft die RAG-Abfragehistorie aus MongoDB ab.
    
    Args:
        user_id: Optional. Die Benutzer-ID zur Filterung der RAG-Abfragehistorie
        limit: Die maximale Anzahl der zurückzugebenden Historieneinträge
    """
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    history = list(rag_history_collection.find(
        query, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    
    return history

if __name__ == "__main__":
    # Dokumente für RAG laden
    asyncio.run(rag_workflow.ingest_documents("data"))
    mcp.run(transport="stdio")










