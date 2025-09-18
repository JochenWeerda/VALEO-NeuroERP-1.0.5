# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Dict, Any, List
from datetime import datetime

def generate_markdown_report(scan: Dict[str, Any], arch: Dict[str, Any], quality: List[Dict[str, Any]], playbook: Dict[str, Any]) -> str:
    ts = datetime.now().isoformat(); summary = arch.get("summary", {})
    lines = [f"# VALERO – Systembericht ({ts})", "", "## Übersicht",
             f"- Code: {summary.get('code',0)}", f"- Test: {summary.get('test',0)}",
             f"- Docs: {summary.get('doc',0)}", f"- Config: {summary.get('config',0)}",
             "", "## Qualitätsanalyse (Top 10)"]
    for q in sorted(quality, key=lambda x: x.get("score",0))[:10]:
        issues = "; ".join(q.get("findings", [])[:3])
        lines.append(f"- {q['path']} — Score {q.get('score')} — {issues}")
    lines += ["", "## Refactoring-Playbook (Top 10)"]
    for i in playbook.get("items", [])[:10]:
        lines.append(f"- P{i['priority']} — {i['file']}: {i['issue']} — {i['suggestion']}")
    return "\n".join(lines)
