#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beispiel für die Code-Generierung mit dem Multi-Agent-Framework.

Dieses Skript demonstriert die Verwendung des VALEO-NeuroERP Multi-Agent-Frameworks
zur Generierung von Code für ein neues Feature im ERP-System.
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
        logging.FileHandler("code_generation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Umgebungsvariablen laden
load_dotenv()

# Anforderungen für das neue Feature
FEATURE_REQUIREMENTS = {
    "feature_name": "Automatisierte Rechnungsverarbeitung",
    "prioritaet": "hoch",
    "deadline": "2025-07-30",
    "beschreibung": "Ein neues Feature zur automatischen Verarbeitung eingehender Rechnungen mit OCR und Validierung.",
    "technische_spezifikation": {
        "programmiersprache": "Python",
        "framework": "FastAPI",
        "datenbank": "PostgreSQL",
        "externe_dienste": ["OCR-Service", "Validierungsservice", "E-Mail-Service"],
        "architektur": "Microservices"
    },
    "funktionale_anforderungen": [
        {
            "id": "F-001",
            "titel": "OCR-Verarbeitung",
            "beschreibung": "Extraktion von Rechnungsdaten aus PDF- und Bilddateien mittels OCR",
            "akzeptanzkriterien": [
                "Unterstützung für PDF-, JPEG-, PNG- und TIFF-Formate",
                "Erkennung von Rechnungsnummer, Datum, Betrag, MwSt. und Lieferantendaten",
                "Mindestgenauigkeit von 90% bei der Texterkennung"
            ]
        },
        {
            "id": "F-002",
            "titel": "Datenvalidierung",
            "beschreibung": "Automatische Validierung der extrahierten Rechnungsdaten",
            "akzeptanzkriterien": [
                "Prüfung auf Vollständigkeit der erforderlichen Felder",
                "Validierung gegen Lieferantendaten im System",
                "Erkennung von Duplikaten"
            ]
        },
        {
            "id": "F-003",
            "titel": "Workflow-Integration",
            "beschreibung": "Integration in den bestehenden Rechnungsgenehmigungsworkflow",
            "akzeptanzkriterien": [
                "Automatische Weiterleitung an zuständige Genehmiger",
                "E-Mail-Benachrichtigungen bei erforderlichen Aktionen",
                "Statusverfolgung im System"
            ]
        }
    ],
    "code_struktur": {
        "hauptmodule": [
            "invoice_processor.py",
            "ocr_service.py",
            "validation_service.py",
            "workflow_manager.py",
            "notification_service.py"
        ],
        "api_endpunkte": [
            "/api/invoices/upload",
            "/api/invoices/{invoice_id}",
            "/api/invoices/{invoice_id}/validate",
            "/api/invoices/{invoice_id}/approve",
            "/api/invoices/{invoice_id}/reject"
        ],
        "datenmodelle": [
            "Invoice",
            "InvoiceItem",
            "Supplier",
            "ValidationResult",
            "WorkflowStatus"
        ]
    },
    "bestehender_code": {
        "relevante_module": [
            "auth_service.py",
            "database_manager.py",
            "email_service.py",
            "file_storage.py"
        ],
        "zu_erweiternde_schnittstellen": [
            "FinanzmodulSchnittstelle",
            "LieferantenmodulSchnittstelle",
            "WorkflowEngineSchnittstelle"
        ]
    },
    "testanforderungen": {
        "unit_tests": True,
        "integration_tests": True,
        "performance_tests": False,
        "testabdeckung": "mindestens 80%"
    }
}

def save_results(results, filename="code_generation_results.json"):
    """Speichert die Ergebnisse in einer JSON-Datei."""
    results_with_timestamp = {
        "timestamp": datetime.now().isoformat(),
        "results": results
    }
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results_with_timestamp, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Ergebnisse wurden in {filename} gespeichert")

def save_generated_code(results):
    """Speichert den generierten Code in Dateien."""
    if not os.path.exists("generated_code"):
        os.makedirs("generated_code")
    
    create_results = results.get("create", {})
    if not create_results:
        logger.warning("Keine CREATE-Phase-Ergebnisse gefunden, kein Code zu speichern.")
        return
    
    code_files = create_results.get("code_files", {})
    if not code_files:
        logger.warning("Keine Code-Dateien in den CREATE-Phase-Ergebnissen gefunden.")
        return
    
    for filename, content in code_files.items():
        file_path = os.path.join("generated_code", filename)
        
        # Stellen Sie sicher, dass das Verzeichnis existiert
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        logger.info(f"Code-Datei gespeichert: {file_path}")

def display_results(results):
    """Zeigt die Ergebnisse der Code-Generierung an."""
    print("\n" + "="*80)
    print("VALEO-NeuroERP Multi-Agent-Framework: Code-Generierung")
    print("="*80)
    
    # Fokus auf CREATE-Phase für Code-Generierung
    create_results = results.get("create", {})
    
    if create_results:
        print("\n## CODE-GENERIERUNGSERGEBNISSE ##")
        
        if isinstance(create_results.get("summary"), list):
            print("\nZusammenfassung:")
            for item in create_results["summary"]:
                print(f"- {item}")
        else:
            print(f"\nZusammenfassung: {create_results.get('summary', 'Keine Zusammenfassung verfügbar')}")
        
        if create_results.get("generated_files"):
            print("\nGenerierte Dateien:")
            for file in create_results["generated_files"]:
                print(f"- {file}")
        
        if create_results.get("architecture"):
            print("\nArchitektur:")
            print(create_results["architecture"])
        
        if create_results.get("notes"):
            print("\nHinweise:")
            for note in create_results["notes"]:
                print(f"- {note}")
    
    # Auch PLAN-Phase-Ergebnisse anzeigen, falls vorhanden
    plan_results = results.get("plan", {})
    if plan_results:
        print("\n## PLANUNGSERGEBNISSE ##")
        
        if plan_results.get("implementation_plan"):
            print("\nImplementierungsplan:")
            plan = plan_results["implementation_plan"]
            for step in plan:
                print(f"- {step}")
    
    print("\n" + "="*80)

async def main():
    """Hauptfunktion zur Ausführung der Code-Generierung."""
    logger.info("Starte Code-Generierung")
    
    try:
        # Aufgabe ausführen (PLAN und CREATE Phasen für Code-Generierung)
        results = run_task(
            task_name="Code-Generierung Rechnungsverarbeitung",
            task_description="Generierung von Code für das Feature zur automatisierten Rechnungsverarbeitung",
            context=FEATURE_REQUIREMENTS,
            use_mcp=True,
            phases=[AgentPhase.PLAN, AgentPhase.CREATE]  # Nur PLAN und CREATE Phasen ausführen
        )
        
        # Ergebnisse anzeigen
        display_results(results)
        
        # Generierten Code speichern
        save_generated_code(results)
        
        # Ergebnisse speichern
        save_results(results)
        
        logger.info("Code-Generierung erfolgreich abgeschlossen")
        
        return results
    
    except Exception as e:
        logger.error(f"Fehler bei der Code-Generierung: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    # Verzeichnisstruktur sicherstellen
    os.makedirs("results", exist_ok=True)
    
    # Aufgabe ausführen
    asyncio.run(main()) 