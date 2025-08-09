# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Dict, Any, List
from pathlib import Path
import json

from ..agents.serena_refactor import generate_playbook


def plan_refactors(quality_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Erzeugt ein Refactoring-Playbook aus Qualitäts-Findings."""
    return generate_playbook(quality_findings)


def apply_refactors(playbook: Dict[str, Any], apply: bool = False) -> Dict[str, Any]:
    """
    Wendet Refactorings sicher an. Standardmäßig dry-run (apply=False).
    Aktuell werden keine destruktiven Änderungen vorgenommen; es wird nur ein Change-Report erzeugt.
    """
    changes: List[Dict[str, Any]] = []
    for item in playbook.get("items", []):
        changes.append({
            "file": item.get("file"),
            "issue": item.get("issue"),
            "action": "noop" if not apply else "planned",
            "note": "Kein automatisches Refactoring angewendet (sicherer Modus)",
        })

    return {"applied": bool(apply), "changes": changes}