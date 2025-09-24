import os
import json
import asyncio
import datetime
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import httpx
except Exception:
    httpx = None  # Fallback, wenn httpx nicht installiert ist

# Optional: ChromaDB für Vektor-RAG
try:
    import chromadb  # type: ignore
    from chromadb.config import Settings  # type: ignore
    CHROMA_AVAILABLE = True
except Exception:
    chromadb = None
    Settings = None  # type: ignore
    CHROMA_AVAILABLE = False

# Basis-Pfade
BASE_DIR = Path(__file__).resolve().parents[2]
OUTPUT_DIR = BASE_DIR / "output" / "ai-workflow"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# In-Memory Status Store (einfacher Runtime-Speicher; optional später durch DB ersetzen)
_JOB_STATUS: Dict[str, Dict[str, Any]] = {}


class MCPMessenger:
    """Einfache MCP-HTTP-Brücke. Erwartet HTTP-Endpoints, kann aber leicht an echte MCP-Transporte angepasst werden."""

    def __init__(self, endpoints: Optional[Dict[str, str]] = None, api_token: Optional[str] = None):
        self.endpoints = endpoints or {}
        self.api_token = api_token

    async def post(self, agent: str, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = self.endpoints.get(agent)
        if not url:
            return {"status": "skipped", "reason": f"Kein Endpoint für Agent {agent}"}
        if httpx is None:
            return {"status": "error", "error": "httpx nicht installiert"}
        headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
        async with httpx.AsyncClient(timeout=60) as client:
            try:
                resp = await client.post(url.rstrip("/") + "/" + path.lstrip("/"), json=payload, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return {"status": "error", "code": resp.status_code, "text": resp.text}
            except Exception as e:
                return {"status": "error", "error": str(e)}


# Hilfsfunktionen
async def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"))

async def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: path.write_text(content, encoding="utf-8"))


# Agenten-Implementierungen (parallel ausführbar)
async def agent_code_scanner(root: Path, excludes: Optional[List[str]] = None) -> Dict[str, Any]:
    excludes = set(excludes or ["venv", ".venv", ".git", "node_modules", "__pycache__"]) 
    file_map: List[Dict[str, Any]] = []
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = Path(dirpath).relative_to(root)
        # Excludes anwenden
        if any(part in excludes for part in rel_dir.parts):
            continue
        for fname in filenames:
            rel_file = rel_dir / fname
            # Skip große/kompilierte Dateien
            if rel_file.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".mp4", ".dll", ".exe", ".bin"}:
                continue
            file_map.append({
                "path": str(rel_file).replace("\\", "/"),
                "ext": rel_file.suffix.lower(),
                "size": (root / rel_file).stat().st_size if (root / rel_file).exists() else 0,
            })
    stats = {
        "total_files": len(file_map),
        "by_ext": {},
    }
    for f in file_map:
        stats["by_ext"].setdefault(f["ext"], 0)
        stats["by_ext"][f["ext"]] += 1
    return {"files": file_map, "stats": stats}


async def agent_structure_mapper(code_scan: Dict[str, Any]) -> Dict[str, Any]:
    # Einfache Baumstruktur aus den Datei-Pfaden ableiten
    tree: Dict[str, Any] = {}
    for f in code_scan.get("files", []):
        parts = f["path"].split("/")
        node = tree
        for idx, part in enumerate(parts):
            is_last = idx == len(parts) - 1
            if part not in node:
                node[part] = {} if not is_last else {"__file__": True, "ext": f["ext"], "size": f["size"]}
            node = node[part]
    return {"architecture_tree": tree}


async def agent_rag_memory_manager(chunks: List[Dict[str, Any]], config: Dict[str, Any]) -> Dict[str, Any]:
    """Speichert Chunks im konfigurierten Vektorspeicher (Chroma, wenn verfügbar),
    andernfalls schreibt nur eine Metadatei.
    """
    vectorstore = (config or {}).get("vectorstore", "filesystem")
    persist_dir = (config or {}).get("persist_dir")

    if vectorstore == "chromadb" and CHROMA_AVAILABLE:
        try:
            persist_path = str(persist_dir) if persist_dir else str(OUTPUT_DIR / "chroma_store")
            client = chromadb.Client(Settings(persist_directory=persist_path, is_persistent=True))

            collection_name = (config or {}).get("collection", "valero_code")
            collection = client.get_or_create_collection(name=collection_name)

            # Batching, um große Upserts zu vermeiden
            batch_size = 512
            total_added = 0
            ids: List[str] = []
            docs: List[str] = []
            metas: List[Dict[str, Any]] = []
            for idx, c in enumerate(chunks):
                cid = c["id"]
                content = c.get("text") or ""
                meta = {
                    "path": c.get("path"),
                    "ext": c.get("ext"),
                    "chunk_index": c.get("chunk_index"),
                    "size": c.get("metadata", {}).get("size"),
                }
                ids.append(cid)
                docs.append(content)
                metas.append(meta)
                if len(ids) >= batch_size:
                    collection.upsert(ids=ids, documents=docs, metadatas=metas)
                    total_added += len(ids)
                    ids, docs, metas = [], [], []
            if ids:
                collection.upsert(ids=ids, documents=docs, metadatas=metas)
                total_added += len(ids)

            return {
                "status": "stored",
                "num_chunks": len(chunks),
                "vectorstore": "chromadb",
                "persist_dir": persist_path,
                "collection": collection_name,
                "added": total_added,
            }
        except Exception as e:
            return {"status": "error", "error": str(e), "vectorstore": "chromadb"}

    # Fallback: Nur Metadaten
    return {
        "status": "stored",
        "num_chunks": len(chunks),
        "vectorstore": vectorstore,
        "persist_dir": None,
        "collection": None,
        "added": 0,
    }


async def agent_quality_analyst(code_scan: Dict[str, Any]) -> Dict[str, Any]:
    # Sehr einfache Heuristiken: große Dateien, übergroße Module
    large_files = [f for f in code_scan.get("files", []) if f.get("size", 0) > 200_000]
    many_lines_exts = {".py", ".ts", ".tsx", ".js"}
    candidates = [f for f in code_scan.get("files", []) if f.get("ext") in many_lines_exts and f.get("size", 0) > 50_000]
    findings = []
    for f in large_files:
        findings.append({"type": "size", "path": f["path"], "size": f["size"], "severity": "medium"})
    for f in candidates:
        findings.append({"type": "complexity_candidate", "path": f["path"], "size": f["size"], "severity": "low"})
    return {"summary": {"large_files": len(large_files), "complexity_candidates": len(candidates)}, "findings": findings}


async def agent_serena_refactor(findings: Dict[str, Any], mcp: MCPMessenger) -> Dict[str, Any]:
    # Hook zu Serena-MCP (falls verfügbar). Pfad/Command exemplarisch.
    payload = {"action": "refactor_suggestions", "findings": findings.get("findings", [])}
    resp = await mcp.post("serena", path="actions/refactor", payload=payload)
    return {"serena_response": resp}


async def agent_change_logger(before_after: Dict[str, Any]) -> Dict[str, Any]:
    # Platzhalter für Change Diffs (kann via Git ermittelt werden)
    return {"changes": before_after}


async def agent_query_layer_init(index_info: Dict[str, Any]) -> Dict[str, Any]:
    return {"status": "ready", "index_info": index_info}


async def agent_report_generator(results: Dict[str, Any]) -> str:
    lines = [
        "# VALERO – Multi-Agenten Analyse & Refactoring Report",
        f"Erstellt am: {datetime.datetime.utcnow().isoformat()}",
        "",
        "## Zusammenfassung",
        f"- Dateien gescannt: {results.get('code_scan', {}).get('stats', {}).get('total_files', 0)}",
        f"- RAG Chunks: {results.get('rag', {}).get('num_chunks', 0)}",
        f"- Findings: {len(results.get('quality', {}).get('findings', []))}",
        "",
        "## Details",
        "### Qualität",
        json.dumps(results.get("quality", {}), indent=2, ensure_ascii=False),
        "",
        "### Serena-Refactor Antwort",
        json.dumps(results.get("serena", {}), indent=2, ensure_ascii=False),
    ]
    return "\n".join(lines)


# Orchestrator
async def run_multi_agent_pipeline(
    repo_root: Optional[str] = None,
    mcp_endpoints: Optional[Dict[str, str]] = None,
    api_token: Optional[str] = None,
    vectorstore_cfg: Optional[Dict[str, Any]] = None,
    job_id: Optional[str] = None,
) -> Dict[str, Any]:
    job_id = job_id or str(uuid.uuid4())
    _JOB_STATUS[job_id] = {"status": "running", "start": datetime.datetime.utcnow().isoformat()}

    root = Path(repo_root) if repo_root else BASE_DIR
    out_dir = OUTPUT_DIR / job_id
    out_dir.mkdir(parents=True, exist_ok=True)

    mcp = MCPMessenger(endpoints=mcp_endpoints, api_token=api_token)

    try:
        # Phase 1: parallele Basisagenten
        code_scan_task = asyncio.create_task(agent_code_scanner(root))
        await asyncio.sleep(0)  # Cooperative scheduling

        # Warte auf Scan (Struktur-Mapper und Qualität benötigen Scan)
        code_scan = await code_scan_task
        await write_json(out_dir / "code_scan.json", code_scan)

        structure_task = asyncio.create_task(agent_structure_mapper(code_scan))
        quality_task = asyncio.create_task(agent_quality_analyst(code_scan))

        structure, quality = await asyncio.gather(structure_task, quality_task)
        await write_json(out_dir / "structure.json", structure)
        await write_json(out_dir / "quality.json", quality)

        # Phase 2: RAG-Chunks vorbereiten (Inhalte lesen und in kleinere Abschnitte zerlegen)
        def should_index_extension(ext: str) -> bool:
            return ext in {".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".yml", ".yaml", ".toml", ".ini"}

        def chunk_text(text: str, max_chars: int = 1500, overlap: int = 150) -> List[str]:
            if max_chars <= 0:
                return [text]
            chunks_local: List[str] = []
            start = 0
            n = len(text)
            while start < n:
                end = min(n, start + max_chars)
                # versuche auf Zeilengrenze zu schneiden
                if end < n:
                    nl = text.rfind("\n", start, end)
                    if nl != -1 and nl > start + 200:  # nicht zu kurz abschneiden
                        end = nl
                chunks_local.append(text[start:end])
                start = max(end - overlap, start + 1) if overlap > 0 else end
                if start >= end:
                    start = end
            return chunks_local

        chunks: List[Dict[str, Any]] = []
        max_files = 1500  # defensiv, um RAM zu schonen
        files = [f for f in code_scan.get("files", []) if should_index_extension(f.get("ext", ""))]
        for idx, f in enumerate(files[:max_files]):
            rel_path = f["path"]
            abs_path = root / rel_path
            text = ""
            try:
                if abs_path.exists() and f.get("size", 0) <= 200_000:
                    text = abs_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                text = ""
            if not text:
                continue
            pieces = chunk_text(text)
            for cidx, piece in enumerate(pieces):
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "path": rel_path,
                    "ext": f["ext"],
                    "metadata": {"size": f["size"]},
                    "chunk_index": cidx,
                    "text": piece,
                })

        rag_cfg = vectorstore_cfg or {"vectorstore": "chromadb"}
        # persist dir mit job_id separieren
        rag_cfg.setdefault("persist_dir", OUTPUT_DIR / "chroma_store")
        rag_cfg.setdefault("collection", f"valero_code")
        rag = await agent_rag_memory_manager(chunks, rag_cfg)
        await write_json(out_dir / "rag.json", rag)

        # Phase 3: Serena-Refactor via MCP
        serena = await agent_serena_refactor(quality, mcp)
        await write_json(out_dir / "serena.json", serena)

        # Phase 4: Change-Logger (Platzhalter)
        changes = await agent_change_logger({"before": {}, "after": {}})
        await write_json(out_dir / "changes.json", changes)

        # Phase 5: Query-Layer Initialisierung
        query_layer = await agent_query_layer_init({"vectorstore": rag})
        await write_json(out_dir / "query_layer.json", query_layer)

        # Report
        report_md = await agent_report_generator({
            "code_scan": code_scan,
            "structure": structure,
            "quality": quality,
            "rag": rag,
            "serena": serena,
            "changes": changes,
        })
        await write_text(out_dir / "report.md", report_md)

        _JOB_STATUS[job_id].update({
            "status": "completed",
            "end": datetime.datetime.utcnow().isoformat(),
            "output_dir": str(out_dir),
        })
        return {"job_id": job_id, "status": "completed", "output": str(out_dir)}

    except Exception as e:
        _JOB_STATUS[job_id].update({
            "status": "error",
            "error": str(e),
            "end": datetime.datetime.utcnow().isoformat(),
        })
        return {"job_id": job_id, "status": "error", "error": str(e)}


def get_job_status(job_id: str) -> Dict[str, Any]:
    return _JOB_STATUS.get(job_id, {"status": "unknown"})
