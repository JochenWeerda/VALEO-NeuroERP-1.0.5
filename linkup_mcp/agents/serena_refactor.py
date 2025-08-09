# -*- coding: utf-8 -*-
"""
Serena-Refactor-Agent: erstellt ein Refactoring-Playbook basierend auf Findings.

Hinweis: Platzhalter für echte Serena-Integration.
"""
from __future__ import annotations

from typing import List, Dict, Any


def generate_playbook(findings_per_file: List[Dict[str, Any]]) -> Dict[str, Any]:
    playbook_items: List[Dict[str, Any]] = []
    priority_map = {
        "Sehr lange Funktion": 1,
        "Datei sehr lang": 2,
        "TODO/FIXME": 3
    }

    for item in findings_per_file:
        path = item.get("path")
        for f in item.get("findings", []):
            prio = 5
            for key, val in priority_map.items():
                if key.lower() in f.lower():
                    prio = val
                    break
            playbook_items.append({
                "file": path,
                "issue": f,
                "priority": prio,
                "suggestion": "Extrahiere Funktionen, reduziere Komplexität, dokumentiere Entscheidungen."
            })

    playbook_items.sort(key=lambda x: x["priority"])  # 1 ist höchste Priorität
    return {
        "count": len(playbook_items),
        "items": playbook_items
    }