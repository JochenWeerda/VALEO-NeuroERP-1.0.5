# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path
from typing import Dict, Any

from ..agents.code_scanner import scan_repo, save_scan
from ..agents.structure_mapper import map_architecture
from ..agents.quality_analyst import analyze_paths
from ..agents.serena_refactor import generate_playbook
from ..agents.report_generator import generate_markdown_report
from ..memory.rag_manager import RAGMemoryManager


def run_valero_full_analysis(project_root: str = ".") -> Dict[str, Any]:
    root = Path(project_root).resolve()
    outdir = root / "output" / "valero_system"
    outdir.mkdir(parents=True, exist_ok=True)

    scan = scan_repo(str(root))
    save_scan(scan, str(outdir / "scan.json"))

    arch = map_architecture(scan)
    (outdir / "architecture.json").write_text(
        __import__("json").dumps(arch, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    code_paths = [f["path"] for f in scan.get("by_type", {}).get("code", [])]
    quality = analyze_paths(code_paths)
    (outdir / "quality.json").write_text(
        __import__("json").dumps(quality, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    playbook = generate_playbook(quality)
    (outdir / "playbook.json").write_text(
        __import__("json").dumps(playbook, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    mem = RAGMemoryManager()
    mem.build_index([str(root)])
    (outdir / "rag_manifest.json").write_text(
        __import__("json").dumps(mem.export_manifest(), ensure_ascii=False, indent=2), encoding="utf-8"
    )

    report = generate_markdown_report(scan, arch, quality, playbook)
    (outdir / "report.md").write_text(report, encoding="utf-8")

    return {"scan": scan, "architecture": arch, "quality": quality, "playbook": playbook}


if __name__ == "__main__":
    run_valero_full_analysis(".")
