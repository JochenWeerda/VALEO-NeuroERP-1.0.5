"""
CLI-Tool für die Steuerung des GENXAIS-Zyklus.
"""

import click
import asyncio
from typing import Optional
from datetime import datetime

from .config.genxais_cycle_config import GenXAISConfig, PhaseType
from .langgraph_graphiti_integration import LangGraphGraphitiIntegration

# -*- coding: utf-8 -*-
import argparse
import json
from pathlib import Path

from .pipelines.valero_full_analysis import run_valero_full_analysis
from .memory.rag_manager import RAGMemoryManager
from .serena.integration import plan_refactors as serena_plan_refactors, apply_refactors as serena_apply_refactors


@click.group()
def cli():
    """GENXAIS Cycle Manager CLI"""
    pass

@cli.command()
@click.option('--phase', type=click.Choice([p.value for p in PhaseType]), help='Phase to execute')
@click.option('--auto/--no-auto', default=False, help='Enable automatic mode')
@click.option('--config-file', type=str, default=None, help='Path to config file')
def execute(phase: Optional[str], auto: bool, config_file: Optional[str]):
    """Führt eine spezifische Phase oder den automatischen Zyklus aus."""
    config = GenXAISConfig()  # TODO: Load from config file if provided
    
    if auto and phase:
        click.echo("Error: Cannot specify both --auto and --phase")
        return
    
    async def run():
        integration = LangGraphGraphitiIntegration(config)
        
        if auto:
            click.echo("Starting automatic cycle execution...")
            while True:
                last_phase = await integration.detect_last_phase()
                if not last_phase:
                    current_phase = PhaseType.VAN
                else:
                    current_idx = config.phases.index(last_phase.phase)
                    next_idx = (current_idx + 1) % len(config.phases)
                    current_phase = config.phases[next_idx]
                
                click.echo(f"Executing phase: {current_phase.value}")
                
                review = await integration.extract_review(current_phase)
                prompt = await integration.generate_next_prompt(review, current_phase)
                await integration.store_prompt(current_phase, prompt)
                await integration.trigger_execution(current_phase)
                
                if not config.cron.enabled:
                    break
                
                await asyncio.sleep(900)  # 15 Minuten warten
        
        else:
            current_phase = PhaseType(phase)
            click.echo(f"Executing single phase: {current_phase.value}")
            
            review = await integration.extract_review(current_phase)
            prompt = await integration.generate_next_prompt(review, current_phase)
            await integration.store_prompt(current_phase, prompt)
            await integration.trigger_execution(current_phase)
    
    asyncio.run(run())

@cli.command()
@click.option('--phase', type=click.Choice([p.value for p in PhaseType]), required=True)
def status(phase: str):
    """Zeigt den Status einer Phase an."""
    config = GenXAISConfig()
    
    async def run():
        integration = LangGraphGraphitiIntegration(config)
        collection = integration.mongodb.get_collection(config.mongodb.collections["logs"])
        
        logs = await collection.find(
            {"phase": phase},
            sort=[("timestamp", -1)],
            limit=5
        ).to_list(length=5)
        
        click.echo(f"\nStatus für Phase {phase}:")
        for log in logs:
            click.echo(f"[{log['timestamp']}] {log['status']}: {log['message']}")
    
    asyncio.run(run())

@cli.command()
def list_phases():
    """Listet alle verfügbaren Phasen auf."""
    for phase in PhaseType:
        click.echo(phase.value)

def main() -> None:
    parser = argparse.ArgumentParser(prog="valero-cli", description="CLI für VALERO Analyse und RAG")
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
        # Falls bereits Index existiert, wird Fallback/Vectorstore geladen
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