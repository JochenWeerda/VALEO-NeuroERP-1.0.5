# -*- coding: utf-8 -*-
"""
Change-Logger-Agent: Protokolliert Änderungen und sammelt Diffs.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any


def log_changes(changes: List[Dict[str, Any]], out_file: str) -> None:
    Path(out_file).parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"changes": changes}, f, ensure_ascii=False, indent=2)