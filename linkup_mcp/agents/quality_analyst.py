# -*- coding: utf-8 -*-
from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Any, List

SUF = {".py", ".ts", ".tsx", ".js", ".jsx"}

def analyze_file(path: Path) -> Dict[str, Any]:
    txt = path.read_text(encoding="utf-8", errors="ignore"); lines = txt.splitlines(); findings: List[str] = []
    if len(lines) > 800: findings.append(f"Datei sehr lang ({len(lines)} Zeilen)")
    if re.search(r"\b(TODO|FIXME)\b", txt, flags=re.I): findings.append("TODO/FIXME vorhanden")
    func_re = re.compile(r"^(def |async def |function |const .*?= \(|export function )", re.M)
    starts = [m.start() for m in func_re.finditer(txt)] + [len(txt)]
    for i in range(len(starts)-1):
        if txt[starts[i]:starts[i+1]].count("\n") > 80:
            findings.append("Sehr lange Funktion (>80 Zeilen)"); break
    return {"path": str(path), "lines": len(lines), "findings": findings, "score": max(0, 100 - 10*len(findings))}

def analyze_paths(paths: List[str]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for p in paths:
        pp = Path(p)
        if pp.is_file() and pp.suffix.lower() in SUF:
            out.append(analyze_file(pp))
    return out
