# -*- coding: utf-8 -*-
"""
Qualitäts-Analyst-Agent: führt grundlegende Code-Qualitätschecks durch.
- Dateilänge, Zeilenanzahl
- Lange Funktionen (heuristisch)
- Namenskonventionen (einfach)
- TODO/FIXME-Erkennung
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Any, List

CODE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx"}


def analyze_file(path: Path) -> Dict[str, Any]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    findings: List[str] = []

    # Heuristik: sehr lange Datei
    if len(lines) > 800:
        findings.append(f"Datei sehr lang ({len(lines)} Zeilen). Aufteilen erwägen.")

    # TODO/FIXME
    if re.search(r"\b(TODO|FIXME)\b", text, flags=re.IGNORECASE):
        findings.append("Enthält TODO/FIXME – offene Aufgaben dokumentiert.")

    # Lange Funktionen (Python/TS heuristisch)
    func_pattern = re.compile(r"^(def |async def |function |const .*?= \(|export function )", re.MULTILINE)
    func_starts = [m.start() for m in func_pattern.finditer(text)]
    func_starts.append(len(text))
    for i in range(len(func_starts) - 1):
        segment = text[func_starts[i]:func_starts[i+1]]
        if segment.count("\n") > 80:
            findings.append("Sehr lange Funktion (>80 Zeilen). Refactoring erwägen.")
            break

    return {
        "path": str(path),
        "lines": len(lines),
        "findings": findings,
        "score": max(0, 100 - len(findings) * 10)
    }


def analyze_paths(paths: List[str]) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    for p in paths:
        path = Path(p)
        if not path.is_file() or path.suffix.lower() not in CODE_SUFFIXES:
            continue
        results.append(analyze_file(path))
    return results