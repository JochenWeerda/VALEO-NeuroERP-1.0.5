# Minimal FastAPI API to control local voice assistant and settings
from __future__ import annotations

import os
import sys
import subprocess
import signal
from pathlib import Path
from typing import Optional, Any, Dict, List

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
except Exception as e:
    raise SystemExit("FastAPI ist nicht installiert. Bitte installieren: pip install fastapi uvicorn")

from .system_config import load_settings, save_settings, hardware_check, recommend_auto_config, mark_first_run_completed

try:
    from .memory.rag_manager import RAGMemoryManager  # type: ignore
except Exception:
    RAGMemoryManager = None  # type: ignore

from .apps.business_tools import suggest_reorder, dedupe_leads, match_payments, generate_dunning
from .rag_answer import synthesize_local_ollama

PID_FILE = Path("output/runtime/voice_assistant.pid")
PID_FILE.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="VALERO Local Assistant API", version="0.2.0")

# CORS: erlauben localhost-Entwicklung
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoiceStatus(BaseModel):
    running: bool
    pid: Optional[int] = None

class SettingsModel(BaseModel):
    data: Dict[str, Any]

class AutoConfigResponse(BaseModel):
    hardware: Dict[str, Any]
    suggested: Dict[str, Any]

class RagBuildRequest(BaseModel):
    paths: Optional[List[str]] = None
    backend: Optional[str] = None  # override

class RagQueryResponse(BaseModel):
    hits: List[Dict[str, Any]]

class ReorderRequest(BaseModel):
  items: List[Dict[str, Any]]

class DedupeRequest(BaseModel):
  leads: List[Dict[str, Any]]

class MatchRequest(BaseModel):
  invoices: List[Dict[str, Any]]
  payments: List[Dict[str, Any]]

class DunningRequest(BaseModel):
  invoices: List[Dict[str, Any]]

class RagAnswerRequest(BaseModel):
  question: str
  k: int = 6


def _read_pid() -> Optional[int]:
    if PID_FILE.exists():
        try:
            return int(PID_FILE.read_text(encoding="utf-8").strip())
        except Exception:
            return None
    return None


def _is_process_running(pid: int) -> bool:
    try:
        if os.name == "nt":
            import ctypes
            PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
            handle = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                return True
            return False
        else:
            os.kill(pid, 0)
            return True
    except Exception:
        return False


@app.get("/voice/status", response_model=VoiceStatus)
async def voice_status() -> VoiceStatus:
    pid = _read_pid()
    if pid and _is_process_running(pid):
        return VoiceStatus(running=True, pid=pid)
    return VoiceStatus(running=False, pid=None)


@app.post("/voice/start", response_model=VoiceStatus)
async def voice_start() -> VoiceStatus:
    # respect settings
    s = load_settings()
    if not s.get("assistants", {}).get("voice", False):
        return VoiceStatus(running=False, pid=None)

    pid = _read_pid()
    if pid and _is_process_running(pid):
        return VoiceStatus(running=True, pid=pid)

    python_exe = sys.executable or "python"
    script_path = Path("scripts/voice_assistant.py").resolve()
    if not script_path.exists():
        raise RuntimeError(f"Script nicht gefunden: {script_path}")

    creationflags = 0
    kwargs = {}
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
    else:
        kwargs["start_new_session"] = True

    proc = subprocess.Popen(
        [python_exe, str(script_path), "--auto"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        creationflags=creationflags,
        **kwargs,  # type: ignore[arg-type]
    )

    import time
    for _ in range(20):
        time.sleep(0.1)
        new_pid = _read_pid()
        if new_pid:
            return VoiceStatus(running=True, pid=new_pid)

    try:
        PID_FILE.write_text(str(proc.pid), encoding="utf-8")
    except Exception:
        pass
    return VoiceStatus(running=True, pid=proc.pid)


@app.post("/voice/stop", response_model=VoiceStatus)
async def voice_stop() -> VoiceStatus:
    pid = _read_pid()
    if not pid:
        return VoiceStatus(running=False, pid=None)

    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.kill(pid, signal.SIGTERM)
    except Exception:
        pass

    try:
        if PID_FILE.exists():
            PID_FILE.unlink()
    except Exception:
        pass

    return VoiceStatus(running=False, pid=None)


@app.get("/settings", response_model=SettingsModel)
async def get_settings() -> SettingsModel:
    return SettingsModel(data=load_settings())


@app.post("/settings", response_model=SettingsModel)
async def set_settings(payload: SettingsModel) -> SettingsModel:
    save_settings(payload.data)
    return SettingsModel(data=load_settings())


@app.get("/autoconfig", response_model=AutoConfigResponse)
async def get_autoconfig() -> AutoConfigResponse:
    hw = hardware_check()
    suggested = recommend_auto_config(hw)
    return AutoConfigResponse(hardware=hw, suggested=suggested)


@app.post("/first-run/completed")
async def first_run_completed() -> Dict[str, bool]:
    mark_first_run_completed()
    return {"ok": True}


@app.post("/rag/build")
async def rag_build(req: RagBuildRequest) -> Dict[str, Any]:
    if RAGMemoryManager is None:
        return {"ok": False, "error": "RAGMemoryManager nicht verfügbar"}
    s = load_settings()
    backend = (req.backend or s.get("assistants", {}).get("vector_backend") or "fallback").lower()
    # set env for manager (it reads env by default)
    os.environ["VECTOR_BACKEND"] = backend
    mgr = RAGMemoryManager()
    paths = req.paths or ["."]
    mgr.build_index(paths)
    return {"ok": True, "backend": backend, "paths": paths}


@app.get("/rag/query", response_model=RagQueryResponse)
async def rag_query(q: str, k: int = 6) -> RagQueryResponse:
    if RAGMemoryManager is None:
        return RagQueryResponse(hits=[])
    s = load_settings()
    backend = (s.get("assistants", {}).get("vector_backend") or "fallback").lower()
    os.environ["VECTOR_BACKEND"] = backend
    mgr = RAGMemoryManager()
    hits = mgr.query(q, top_k=k)
    return RagQueryResponse(hits=hits)


@app.post('/rag/answer')
async def rag_answer(req: RagAnswerRequest) -> Dict[str, Any]:
  if RAGMemoryManager is None:
    return {"answer": "", "hits": []}
  s = load_settings()
  backend = (s.get("assistants", {}).get("vector_backend") or "fallback").lower()
  os.environ["VECTOR_BACKEND"] = backend
  mgr = RAGMemoryManager()
  hits = mgr.query(req.question, top_k=req.k)
  # use settings for model and env for base url
  model = (s.get("llm", {}) or {}).get("model", "gpt-oss-20b-small")
  base_url = os.getenv("OLLAMA_BASE_URL", os.getenv("LLM_BASE_URL", "http://localhost:11434"))
  answer = synthesize_local_ollama(req.question, hits, base_url=base_url, model=model)
  return {"answer": answer, "hits": hits}


@app.post('/biz/reorder')
async def biz_reorder(body: ReorderRequest) -> Dict[str, Any]:
  return {"suggestions": suggest_reorder(body.items)}

@app.post('/biz/dedupe')
async def biz_dedupe(body: DedupeRequest) -> Dict[str, Any]:
  u, d = dedupe_leads(body.leads)
  return {"uniques": u, "duplicates": d}

@app.post('/biz/match')
async def biz_match(body: MatchRequest) -> Dict[str, Any]:
  return match_payments(body.invoices, body.payments)

@app.post('/biz/dunning')
async def biz_dunning(body: DunningRequest) -> Dict[str, Any]:
  return {"dunning": generate_dunning(body.invoices)}

@app.get('/biz/reorder-file')
async def biz_reorder_file(file: str) -> Dict[str, Any]:
  from .apps.business_tools import reorder_from_file
  return {"suggestions": reorder_from_file(file)}

@app.get('/biz/dedupe-file')
async def biz_dedupe_file(file: str) -> Dict[str, Any]:
  from .apps.business_tools import dedupe_from_file
  return dedupe_from_file(file)

@app.get('/biz/match-file')
async def biz_match_file(invoices: str, payments: str) -> Dict[str, Any]:
  from .apps.business_tools import match_from_files
  return match_from_files(invoices, payments)

@app.get('/biz/dunning-file')
async def biz_dunning_file(invoices: str) -> Dict[str, Any]:
  from .apps.business_tools import dunning_from_file
  return {"dunning": dunning_from_file(invoices)}


@app.post("/demo/seed")
async def demo_seed() -> Dict[str, Any]:
    out = Path("output/demo")
    out.mkdir(parents=True, exist_ok=True)
    created = []
    samples = {
        "stock.json": [
            {"sku": "KAS-001", "name": "Kalkammonsalpeter", "unit": "to", "stock": 42.0, "reorder_point": 20.0},
            {"sku": "URE-010", "name": "Harnstoff", "unit": "to", "stock": 12.0, "reorder_point": 15.0}
        ],
        "leads.json": [
            {"company": "Müller Agrar GmbH", "contact": "Max Müller", "email": "max@mueller-agrar.de"},
            {"company": "Landhof KG", "contact": "Anna Schuster", "email": "anna@landhof.de"}
        ],
        "invoices.json": [
            {"invoice_no": "INV-2025-0001", "customer": "Müller Agrar GmbH", "amount": 1234.56, "open": True},
            {"invoice_no": "INV-2025-0002", "customer": "Landhof KG", "amount": 789.10, "open": False}
        ],
        "payments.json": [
            {"reference": "INV-2025-0001", "amount": 1234.56},
            {"reference": "INV-2025-0009", "amount": 250.00}
        ]
    }
    for fname, data in samples.items():
        p = out / fname
        if not p.exists():
            p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            created.append(str(p))
    return {"ok": True, "created": created}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("VALEO_API_PORT", "8099")))
