#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beispiel für die Anforderungsanalyse mit dem Multi-Agent-Framework.

Dieses Skript demonstriert die Verwendung des VALEO-NeuroERP Multi-Agent-Frameworks
zur Analyse und Validierung von Anforderungen für ein neues ERP-Modul.
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
        logging.FileHandler("requirement_analysis.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Umgebungsvariablen laden
load_dotenv()

# Anforderungen für das neue ERP-Modul
REQUIREMENTS = {
    "modul_name": "Lieferkettenmanagement",
    "prioritaet": "hoch",
    "deadline": "2025-09-30",
    "beschreibung": "Ein neues Modul zur Verwaltung und Optimierung der Lieferkette mit Echtzeitverfolgung und KI-gestützter Prognose.",
    "funktionale_anforderungen": [
        {
            "id": "F-001",
            "titel": "Lieferantenverwaltung",
            "beschreibung": "Verwaltung von Lieferantendaten, Kontakten und Verträgen",
            "prioritaet": "hoch",
            "akzeptanzkriterien": [
                "Vollständige CRUD-Operationen für Lieferantendaten",
                "Dokumentenverwaltung für Verträge",
                "Bewertungssystem für Lieferanten"
            ]
        },
        {
            "id": "F-002",
            "titel": "Bestandsverfolgung",
            "beschreibung": "Echtzeitverfolgung von Beständen entlang der Lieferkette",
            "prioritaet": "hoch",
            "akzeptanzkriterien": [
                "Echtzeit-Updates zu Bestandsänderungen",
                "Standortverfolgung mit Karte",
                "Benachrichtigungen bei kritischen Bestandslevels"
            ]
        },
        {
            "id": "F-003",
            "titel": "Prognosemodell",
            "beschreibung": "KI-gestütztes Modell zur Vorhersage von Lieferverzögerungen und Bedarfsspitzen",
            "prioritaet": "mittel",
            "akzeptanzkriterien": [
                "Vorhersagegenauigkeit von mindestens 85%",
                "Integration historischer Daten",
                "Anpassbare Parameter für das Modell"
            ]
        },
        {
            "id": "F-004",
            "titel": "Dashboard",
            "beschreibung": "Übersichtliches Dashboard mit wichtigen KPIs und Warnungen",
            "prioritaet": "mittel",
            "akzeptanzkriterien": [
                "Anpassbare Widgets",
                "Filterfunktionen nach Zeitraum und Lieferant",
                "Exportfunktion für Berichte"
            ]
        },
        {
            "id": "F-005",
            "titel": "Automatisierte Bestellung",
            "beschreibung": "Automatische Generierung von Bestellungen basierend auf Bestandslevels und Prognosen",
            "prioritaet": "niedrig",
            "akzeptanzkriterien": [
                "Konfigurierbare Bestellregeln",
                "Genehmigungsworkflow",
                "Integration mit dem Einkaufsmodul"
            ]
        }
    ],
    "nicht_funktionale_anforderungen": [
        {
            "id": "NF-001",
            "titel": "Leistung",
            "beschreibung": "Das System muss schnell auf Benutzeranfragen reagieren",
            "kriterium": "Antwortzeit unter 1 Sekunde für 95% der Anfragen"
        },
        {
            "id": "NF-002",
            "titel": "Skalierbarkeit",
            "beschreibung": "Das System muss mit wachsender Datenmenge und Benutzerzahl umgehen können",
            "kriterium": "Unterstützung von bis zu 1000 gleichzeitigen Benutzern und 10 Millionen Datensätzen"
        },
        {
            "id": "NF-003",
            "titel": "Sicherheit",
            "beschreibung": "Schutz sensibler Lieferanten- und Bestandsdaten",
            "kriterium": "Verschlüsselung aller Daten, rollenbasierte Zugriffskontrollen, Audit-Logs"
        },
        {
            "id": "NF-004",
            "titel": "Verfügbarkeit",
            "beschreibung": "Das System muss hochverfügbar sein",
            "kriterium": "99.9% Uptime, automatisches Failover"
        }
    ],
    "technische_einschraenkungen": [
        "Integration mit bestehendem PostgreSQL-Datenbanksystem",
        "Kompatibilität mit dem bestehenden ERP-System",
        "Einhaltung der DSGVO-Anforderungen",
        "Verwendung des vorhandenen Authentifizierungssystems"
    ],
    "stakeholder": [
        {"name": "Einkaufsabteilung", "interesse": "Hauptnutzer des Systems"},
        {"name": "Lagerverwaltung", "interesse": "Bestandsverfolgung und -optimierung"},
        {"name": "IT-Abteilung", "interesse": "Integration und Wartung"},
        {"name": "Geschäftsleitung", "interesse": "Kostenreduktion und Effizienzsteigerung"}
    ]
}

def save_results(results, filename="requirement_analysis_results.json"):
    """Speichert die Ergebnisse in einer JSON-Datei."""
    results_with_timestamp = {
        "timestamp": datetime.now().isoformat(),
        "results": results
    }
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results_with_timestamp, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Ergebnisse wurden in {filename} gespeichert")

def display_results(results):
    """Zeigt die Ergebnisse der Anforderungsanalyse an."""
    print("\n" + "="*80)
    print("VALEO-NeuroERP Multi-Agent-Framework: Anforderungsanalyse")
    print("="*80)
    
    # Zeige nur VAN-Phase-Ergebnisse an, da es sich um eine Anforderungsanalyse handelt
    van_results = results.get("van", {})
    
    if van_results:
        print("\n## ANALYSEERGEBNISSE ##")
        
        if isinstance(van_results.get("summary"), list):
            print("\nZusammenfassung:")
            for item in van_results["summary"]:
                print(f"- {item}")
        else:
            print(f"\nZusammenfassung: {van_results.get('summary', 'Keine Zusammenfassung verfügbar')}")
        
        if van_results.get("validation_results"):
            print("\nValidierungsergebnisse:")
            validation = van_results["validation_results"]
            print(f"- Machbarkeitsbewertung: {validation.get('machbarkeit_score', 'N/A')}")
            print(f"- Validierungsstatus: {validation.get('validierung_status', 'N/A')}")
            
            if validation.get("risiken"):
                print("\nIdentifizierte Risiken:")
                for risk in validation["risiken"]:
                    print(f"- {risk.get('beschreibung')} (Schweregrad: {risk.get('schweregrad')})")
                    if risk.get("minderungsstrategien"):
                        print("  Minderungsstrategien:")
                        for strategy in risk["minderungsstrategien"]:
                            print(f"  - {strategy}")
        
        if van_results.get("recommendations"):
            print("\nEmpfehlungen:")
            for rec in van_results["recommendations"]:
                print(f"- {rec}")
        
        if van_results.get("dependencies"):
            print("\nIdentifizierte Abhängigkeiten:")
            for dep in van_results["dependencies"]:
                print(f"- {dep}")
    
    print("\n" + "="*80)

async def main():
    """Hauptfunktion zur Ausführung der Anforderungsanalyse."""
    logger.info("Starte Anforderungsanalyse")
    
    try:
        # Aufgabe ausführen (nur VAN-Phase, da es sich um eine Anforderungsanalyse handelt)
        results = run_task(
            task_name="Anforderungsanalyse Lieferkettenmanagement",
            task_description="Analyse und Validierung der Anforderungen für das neue Lieferkettenmanagement-Modul",
            context=REQUIREMENTS,
            use_mcp=True,
            phases=[AgentPhase.VAN]  # Nur VAN-Phase ausführen
        )
        
        # Ergebnisse anzeigen
        display_results(results)
        
        # Ergebnisse speichern
        save_results(results)
        
        logger.info("Anforderungsanalyse erfolgreich abgeschlossen")
        
        return results
    
    except Exception as e:
        logger.error(f"Fehler bei der Anforderungsanalyse: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    # Verzeichnisstruktur sicherstellen
    os.makedirs("results", exist_ok=True)
    
    # Aufgabe ausführen
    asyncio.run(main()) 