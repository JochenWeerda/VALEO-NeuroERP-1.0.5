#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beispiel für die Optimierung eines ERP-Moduls mit dem Multi-Agent-Framework.

Dieses Skript demonstriert die Verwendung des VALEO-NeuroERP Multi-Agent-Frameworks
zur Optimierung eines Finanzmoduls für bessere Leistung.
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from dotenv import load_dotenv

from linkup_mcp.run_parallel_agents import run_task
from linkup_mcp.parallel_agent_framework import AgentPhase

# Konfiguration des Loggings
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("erp_module_optimization.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Umgebungsvariablen laden
load_dotenv()

# Kontextinformationen für die Optimierungsaufgabe
OPTIMIZATION_CONTEXT = {
    "modul": "Finanzmodul",
    "priorität": "hoch",
    "deadline": "2025-06-30",
    "aktuelle_probleme": [
        "Langsame Datenbankabfragen bei großen Transaktionsvolumen",
        "Ineffiziente Speichernutzung bei der Berichterstellung",
        "Hohe CPU-Auslastung während der Monatsabschlussverarbeitung"
    ],
    "leistungsmetriken": {
        "durchschnittliche_antwortzeit": 2.5,  # Sekunden
        "transaktionen_pro_sekunde": 15.3,
        "speichernutzung": 1.2,  # GB
        "cpu_auslastung": 78.5  # Prozent
    },
    "optimierungsziele": {
        "durchschnittliche_antwortzeit": 1.0,  # Sekunden
        "transaktionen_pro_sekunde": 30.0,
        "speichernutzung": 0.8,  # GB
        "cpu_auslastung": 50.0  # Prozent
    },
    "technische_umgebung": {
        "datenbank": "PostgreSQL 14.5",
        "anwendungsserver": "Python 3.11 mit FastAPI",
        "frontend": "React 18.2",
        "infrastruktur": "Kubernetes-Cluster mit 8 Knoten"
    }
}

def save_results(results, filename="erp_module_optimization_results.json"):
    """Speichert die Ergebnisse in einer JSON-Datei."""
    results_with_timestamp = {
        "timestamp": datetime.now().isoformat(),
        "results": results
    }
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results_with_timestamp, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Ergebnisse wurden in {filename} gespeichert")

def display_results(results):
    """Zeigt die Ergebnisse der Optimierung an."""
    print("\n" + "="*80)
    print("VALEO-NeuroERP Multi-Agent-Framework: ERP-Modul-Optimierung")
    print("="*80)
    
    for phase, phase_results in results.items():
        print(f"\n## {phase.upper()} PHASE ##")
        
        if isinstance(phase_results.get("summary"), list):
            print("\nZusammenfassung:")
            for item in phase_results["summary"]:
                print(f"- {item}")
        else:
            print(f"\nZusammenfassung: {phase_results.get('summary', 'Keine Zusammenfassung verfügbar')}")
        
        if phase_results.get("recommendations"):
            print("\nEmpfehlungen:")
            for rec in phase_results["recommendations"]:
                print(f"- {rec}")
        
        if phase_results.get("metrics"):
            print("\nMetriken:")
            for key, value in phase_results["metrics"].items():
                print(f"- {key}: {value}")
    
    print("\n" + "="*80)

async def main():
    """Hauptfunktion zur Ausführung der ERP-Modul-Optimierung."""
    logger.info("Starte ERP-Modul-Optimierung")
    
    try:
        # Aufgabe ausführen
        results = run_task(
            task_name="ERP-Modul-Optimierung",
            task_description="Optimierung des Finanzmoduls für bessere Leistung und Effizienz",
            context=OPTIMIZATION_CONTEXT,
            use_mcp=True
        )
        
        # Ergebnisse anzeigen
        display_results(results)
        
        # Ergebnisse speichern
        save_results(results)
        
        logger.info("ERP-Modul-Optimierung erfolgreich abgeschlossen")
        
        return results
    
    except Exception as e:
        logger.error(f"Fehler bei der ERP-Modul-Optimierung: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    # Verzeichnisstruktur sicherstellen
    os.makedirs("results", exist_ok=True)
    
    # Aufgabe ausführen
    asyncio.run(main())
