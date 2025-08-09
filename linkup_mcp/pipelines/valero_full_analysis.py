# -*- coding: utf-8 -*-
from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Any

from ..agents.code_scanner import scan_repo, save_scan
from ..agents.structure_mapper import map_architecture
from ..agents.quality_analyst import analyze_paths
from ..agents.serena_refactor import generate_playbook
from ..agents.report_generator import generate_markdown_report
from ..memory.rag_manager import RAGMemoryManager

logger = logging.getLogger(__name__)


def run_valero_full_analysis(project_root: str = ".") -> Dict[str, Any]:
    root = Path(project_root).resolve()
    artifacts_dir = root / "output" / "valero_system"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    # 1) Scan
    scan = scan_repo(str(root))
    save_scan(scan, str(artifacts_dir / "scan.json"))

    # 2) Struktur-Mapping
    arch = map_architecture(scan)
    (artifacts_dir / "architecture.json").write_text(
        __import__("json").dumps(arch, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 3) Qualitätsanalyse
    code_paths = [f["path"] for f in scan.get("by_type", {}).get("code", [])]
    quality = analyze_paths(code_paths)
    (artifacts_dir / "quality.json").write_text(
        __import__("json").dumps(quality, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 4) Serena-Playbook
    playbook = generate_playbook(quality)
    (artifacts_dir / "playbook.json").write_text(
        __import__("json").dumps(playbook, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 5) RAG Memory aufbauen
    memory = RAGMemoryManager()
    memory.build_index([str(root)])
    (artifacts_dir / "rag_manifest.json").write_text(
        __import__("json").dumps(memory.export_manifest(), ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 6) Report generieren
    report_md = generate_markdown_report(scan, arch, quality, playbook)
    (artifacts_dir / "report.md").write_text(report_md, encoding="utf-8")

    return {
        "scan": scan,
        "architecture": arch,
        "quality": quality,
        "playbook": playbook
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_valero_full_analysis(".")