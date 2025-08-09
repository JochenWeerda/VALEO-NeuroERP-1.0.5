# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Dict, Any, List
from datetime import datetime


def generate_markdown_report(scan: Dict[str, Any], arch: Dict[str, Any], quality: List[Dict[str, Any]], playbook: Dict[str, Any]) -> str:
    ts = datetime.now().isoformat()
    summary = arch.get("summary", {})
    lines = [
        f"# VALERO – Systembericht ({ts})",
        "",
        "## Übersicht",
        f"- Code-Dateien: {summary.get('code', 0)}",
        f"- Test-Dateien: {summary.get('test', 0)}",
        f"- Doku-Dateien: {summary.get('doc', 0)}",
        f"- Config-Dateien: {summary.get('config', 0)}",
        "",
        "## Qualitätsanalyse (Top 10)",
    ]
    sorted_q = sorted(quality, key=lambda x: x.get("score", 0))[:10]
    for q in sorted_q:
        issues = "; ".join(q.get("findings", [])[:3])
        lines.append(f"- {q['path']} — Score: {q.get('score')} — {issues}")

    lines += [
        "",
        "## Refactoring-Playbook (Top 10)",
    ]
    for item in playbook.get("items", [])[:10]:
        lines.append(f"- P{item['priority']} — {item['file']}: {item['issue']} — {item['suggestion']}")

    return "\n".join(lines)