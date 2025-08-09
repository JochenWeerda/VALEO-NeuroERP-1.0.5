# -*- coding: utf-8 -*-
"""
VALERO CLI: Analyse, RAG und Serena.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from .pipelines.valero_full_analysis import run_valero_full_analysis
from .memory.rag_manager import RAGMemoryManager
from .serena.integration import (
    plan_refactors as serena_plan_refactors,
    apply_refactors as serena_apply_refactors,
)


def main() -> None:
    parser = argparse.ArgumentParser(prog="valero-cli", description="CLI für VALERO Analyse, RAG und Serena")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_an = sub.add_parser("analyze", help="Vollständige Systemanalyse ausführen")
    p_an.add_argument("root", nargs="?", default=".")

    p_rag_b = sub.add_parser("rag-build", help="RAG-Index aufbauen")
    p_rag_b.add_argument("path", nargs="*", default=["."])

    p_rag_q = sub.add_parser("rag-query", help="RAG-Abfrage stellen")
    p_rag_q.add_argument("question")
    p_rag_q.add_argument("--top-k", type=int, default=6)

    p_ser_p = sub.add_parser("serena-plan", help="Refactoring-Playbook erzeugen")
    p_ser_a = sub.add_parser("serena-apply", help="Refactoring-Playbook anwenden (safe)")
    p_ser_a.add_argument("--apply", action="store_true", help="Tatsächlich anwenden (riskanter)")

    args = parser.parse_args()

    if args.cmd == "analyze":
        res = run_valero_full_analysis(args.root)
        print(json.dumps({
            "code_files": len(res.get("scan", {}).get("by_type", {}).get("code", [])),
            "issues": sum(len(f.get("findings", [])) for f in res.get("quality", [])),
            "playbook_items": len(res.get("playbook", {}).get("items", [])),
            "artifacts_dir": "output/valero_system"
        }, ensure_ascii=False, indent=2))
    elif args.cmd == "rag-build":
        mm = RAGMemoryManager()
        mm.build_index(args.path)
        print(json.dumps(mm.export_manifest(), ensure_ascii=False, indent=2))
    elif args.cmd == "rag-query":
        mm = RAGMemoryManager()
        res = mm.query(args.question, top_k=args.top_k)
        print(json.dumps(res, ensure_ascii=False, indent=2))
    elif args.cmd == "serena-plan":
        base = Path("output/valero_system")
        quality = json.loads((base / "quality.json").read_text(encoding="utf-8"))
        playbook = serena_plan_refactors(quality)
        (base / "playbook.json").write_text(json.dumps(playbook, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({"count": len(playbook.get("items", []))}, ensure_ascii=False, indent=2))
    elif args.cmd == "serena-apply":
        base = Path("output/valero_system")
        playbook = json.loads((base / "playbook.json").read_text(encoding="utf-8"))
        result = serena_apply_refactors(playbook, apply=bool(args.apply))
        (base / "changes.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({"applied": bool(args.apply), "change_count": len(result.get("changes", []))}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main() 