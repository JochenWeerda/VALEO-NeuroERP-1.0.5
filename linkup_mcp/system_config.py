# -*- coding: utf-8 -*-
from __future__ import annotations

import os
import json
import shutil
import platform
import subprocess
from pathlib import Path
from typing import Any, Dict

SETTINGS_PATH = Path("output/config/settings.json")
SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)

DEFAULT_SETTINGS: Dict[str, Any] = {
    "firstRunCompleted": False,
    "mode": "development",  # development | demo | production | training
    "assistants": {
        "voice": False,
        "rag": True,
        "vector_backend": "fallback",  # fallback | faiss | chroma | qdrant
        "dir_scoped_index": True,
        "chroma_enabled": False,
        "qdrant_enabled": False,
    },
    "llm": {
        "provider": "ollama",
        "model": "gpt-oss-20b-small",
    },
    "privacy": {
        "telemetry": False
    }
}


def load_settings() -> Dict[str, Any]:
    if SETTINGS_PATH.exists():
        try:
            return json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return DEFAULT_SETTINGS.copy()


def save_settings(settings: Dict[str, Any]) -> None:
    try:
        SETTINGS_PATH.write_text(json.dumps(settings, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


def mark_first_run_completed() -> None:
    s = load_settings()
    s["firstRunCompleted"] = True
    save_settings(s)


def hardware_check() -> Dict[str, Any]:
    info: Dict[str, Any] = {
        "os": platform.platform(),
        "python": platform.python_version(),
        "cpu_count": os.cpu_count() or 1,
        "ram_gb": None,
        "disk_total_gb": None,
        "disk_free_gb": None,
        "has_nvidia": False,
        "ffmpeg_present": False,
        "audio_input_available": False,
        "audio_output_available": False,
    }

    # RAM
    try:
        import psutil  # type: ignore
        vm = psutil.virtual_memory()
        info["ram_gb"] = round(vm.total / (1024 ** 3), 1)
    except Exception:
        info["ram_gb"] = None

    # Disk
    try:
        total, used, free = shutil.disk_usage(".")
        info["disk_total_gb"] = round(total / (1024 ** 3), 1)
        info["disk_free_gb"] = round(free / (1024 ** 3), 1)
    except Exception:
        pass

    # NVIDIA GPU
    try:
        res = subprocess.run(["nvidia-smi", "-L"], capture_output=True, text=True, timeout=2)
        info["has_nvidia"] = (res.returncode == 0 and bool(res.stdout.strip()))
    except Exception:
        info["has_nvidia"] = False

    # ffmpeg
    info["ffmpeg_present"] = shutil.which("ffmpeg") is not None

    # Audio devices (best effort)
    try:
        import sounddevice as sd  # type: ignore
        devices = sd.query_devices()
        info["audio_input_available"] = any(d.get("max_input_channels", 0) > 0 for d in devices)
        info["audio_output_available"] = any(d.get("max_output_channels", 0) > 0 for d in devices)
    except Exception:
        info["audio_input_available"] = False
        info["audio_output_available"] = False

    return info


def recommend_auto_config(hw: Dict[str, Any]) -> Dict[str, Any]:
    settings = load_settings()

    ram = hw.get("ram_gb") or 0
    has_gpu = bool(hw.get("has_nvidia"))
    audio_in = bool(hw.get("audio_input_available"))
    audio_out = bool(hw.get("audio_output_available"))

    # Base
    settings["assistants"]["rag"] = True
    settings["assistants"]["vector_backend"] = "fallback"  # minimal Ressourcen
    settings["assistants"]["dir_scoped_index"] = True
    settings["assistants"]["chroma_enabled"] = False
    settings["assistants"]["qdrant_enabled"] = False

    # Voice only if audio present
    settings["assistants"]["voice"] = audio_in and audio_out

    # LLM choice
    if has_gpu and ram >= 24:
        settings["llm"]["model"] = "gpt-oss-20b-small"
    elif ram >= 16:
        settings["llm"]["model"] = "gpt-oss-20b-small"
    else:
        settings["llm"]["model"] = "gpt-oss-20b-small"

    # Production guidance: keep telemetry off by default
    settings["privacy"]["telemetry"] = False

    return settings
