# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import List, Dict, Any

def generate_playbook(findings_per_file: List[Dict[str, Any]]) -> Dict[str, Any]:
    items = []
    for it in findings_per_file:
        for f in it.get("findings", []):
            prio = 5
            if "Sehr lange Funktion" in f: prio = 1
            elif "Datei sehr lang" in f: prio = 2
            elif "TODO" in f or "FIXME" in f: prio = 3
            items.append({"file": it.get("path"), "issue": f, "priority": prio,
                          "suggestion": "Funktion extrahieren, Komplexität senken, kurze Einheiten."})
    items.sort(key=lambda x: x["priority"]) 
    return {"count": len(items), "items": items}
