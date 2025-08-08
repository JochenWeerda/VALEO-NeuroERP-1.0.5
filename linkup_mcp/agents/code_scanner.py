# -*- coding: utf-8 -*-
"""
Code-Scanner-Agent für VALEO-NeuroERP.

Traversiert das Repository, klassifiziert Dateien nach Typ
(Code, Config, Doku, Tests) und liefert eine strukturierte Übersicht.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

CODE_EXT = {".py", ".ts", ".tsx", ".js", ".jsx", ".java", ".go"}
DOC_EXT = {".md", ".rst"}
CONF_EXT = {".json", ".yaml", ".yml", ".toml", ".ini"}
TEST_HINTS = {"test", "tests", "spec"}

EXCLUDE_DIRS = {"node_modules", "venv", ".git", "dist", "build", "__pycache__"}


def classify_file(path: Path) -> str:
    suffix = path.suffix.lower()
    name = path.name.lower()
    parent = path.parent.name.lower()

    if suffix in CODE_EXT:
        if any(h in name or h in parent for h in TEST_HINTS):
            return "test"
        return "code"
    if suffix in DOC_EXT:
        return "doc"
    if suffix in CONF_EXT:
        return "config"
    return "other"


def scan_repo(root: str) -> Dict[str, Any]:
    root_path = Path(root)
    result: Dict[str, Any] = {
        "root": str(root_path.resolve()),
        "files": [],
        "by_type": {
            "code": [],
            "test": [],
            "doc": [],
            "config": [],
            "other": []
        }
    }

    for p in root_path.rglob("*"):
        if not p.is_file():
            continue
        if any(ex in p.parts for ex in EXCLUDE_DIRS):
            continue
        ftype = classify_file(p)
        entry = {"path": str(p), "type": ftype, "size": p.stat().st_size}
        result["files"].append(entry)
        result["by_type"][ftype].append(entry)

    logger.info("Scan abgeschlossen: %d Dateien", len(result["files"]))
    return result


def save_scan(result: Dict[str, Any], out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)