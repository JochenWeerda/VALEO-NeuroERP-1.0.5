# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any

EXCLUDE = {"node_modules", ".git", "venv", "build", "dist", "__pycache__"}
CODE = {".py", ".ts", ".tsx", ".js", ".jsx", ".java", ".go"}
DOC = {".md", ".rst"}
CONF = {".json", ".yaml", ".yml", ".toml", ".ini"}
TEST_HINTS = {"test", "tests", "spec"}

def classify(path: Path) -> str:
    s = path.suffix.lower(); name = path.name.lower(); parent = path.parent.name.lower()
    if s in CODE:
        return "test" if any(h in name or h in parent for h in TEST_HINTS) else "code"
    if s in DOC: return "doc"
    if s in CONF: return "config"
    return "other"

def scan_repo(root: str) -> Dict[str, Any]:
    r = Path(root)
    out: Dict[str, Any] = {"root": str(r.resolve()), "files": [], "by_type": {"code": [], "test": [], "doc": [], "config": [], "other": []}}
    for p in r.rglob("*"):
        if not p.is_file(): continue
        if any(e in p.parts for e in EXCLUDE): continue
        t = classify(p)
        entry = {"path": str(p), "type": t, "size": p.stat().st_size}
        out["files"].append(entry); out["by_type"][t].append(entry)
    return out

def save_scan(result: Dict[str, Any], out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
