# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Dict, Optional

class ChangeLogger:
    def __init__(self, log_dir: str | Path = "output/logs") -> None:
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = self.log_dir / "changes.jsonl"

    def log(self, file_path: str, before_text: Optional[str], after_text: Optional[str], metadata: Optional[Dict[str, Any]] = None) -> None:
        entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "file": file_path,
            "before": before_text,
            "after": after_text,
            "metadata": metadata or {},
        }
        with self.log_file.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
