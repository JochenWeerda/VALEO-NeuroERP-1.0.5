# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Any, Dict, List


def plan_refactors(quality_findings: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [{"file": "example.py", "action": "rename_variable", "reason": "naming", "risk": "low"}]


def apply_refactors(plan: List[Dict[str, Any]], dry_run: bool = True) -> Dict[str, Any]:
    return {"applied": [] if dry_run else plan, "dry_run": dry_run}
