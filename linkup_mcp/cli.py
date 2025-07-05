"""
CLI-Tool für die Steuerung des GENXAIS-Zyklus.
"""

import click
import asyncio
from typing import Optional
from datetime import datetime

from .config.genxais_cycle_config import GenXAISConfig, PhaseType
from .langgraph_graphiti_integration import LangGraphGraphitiIntegration

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

if __name__ == '__main__':
    cli() 