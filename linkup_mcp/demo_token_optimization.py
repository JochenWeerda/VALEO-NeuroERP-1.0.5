# -*- coding: utf-8 -*-
"""
SOFORT EINSETZBARE Demo - Token-Optimierung in Aktion.
"""

import asyncio
import json
from datetime import datetime
from apm_framework.immediate_token_optimizer import optimize_immediately

async def demo_sofortige_optimierung():
    """
    Demonstriert SOFORTIGE Token-Optimierung.
    """
    
    print(" SOFORTIGE TOKEN-OPTIMIERUNG - LIVE DEMO")
    print("=" * 50)
    
    # Beispiel-Projekt
    project_data = {
        "project_id": "valeo_erp_optimization",
        "description": "ERP-System Optimierung mit AI-Integration und Performance-Verbesserungen",
        "requirements": [
            {"id": "req_001", "description": "User Interface Modernisierung", "priority": "high"},
            {"id": "req_002", "description": "API Performance Optimierung", "priority": "high"},
            {"id": "req_003", "description": "Database Query Optimierung", "priority": "medium"},
            {"id": "req_004", "description": "Automated Testing Implementation", "priority": "medium"},
            {"id": "req_005", "description": "AI-basierte Anomalie-Erkennung", "priority": "high"},
            {"id": "req_006", "description": "Real-time Dashboard", "priority": "medium"},
            {"id": "req_007", "description": "Security Audit und Verbesserungen", "priority": "high"}
        ],
        "constraints": [
            {"type": "budget", "value": "50000 EUR", "severity": "high"},
            {"type": "time", "value": "12 weeks", "severity": "high"},
            {"type": "team_size", "value": "5 developers", "severity": "medium"}
        ],
        "target_date": "2025-09-30"
    }
    
    print(" Projekt-Daten:")
    print(f"   - Projekt: {project_data['project_id']}")
    print(f"   - Requirements: {len(project_data['requirements'])}")
    print(f"   - Constraints: {len(project_data['constraints'])}")
    
    # SOFORTIGE Optimierung ausführen
    print("\n Starte SOFORTIGE Optimierung...")
    start_time = datetime.now()
    
    try:
        result = await optimize_immediately(project_data)
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        print(f" Optimierung abgeschlossen in {processing_time:.2f} Sekunden!")
        
        # Ergebnisse anzeigen
        print("\n OPTIMIERUNGSERGEBNISSE:")
        print("-" * 30)
        
        savings = result.get("savings_report", {}).get("immediate_savings", {})
        performance = result.get("savings_report", {}).get("performance", {})
        
        print(f" Token-Einsparungen: {savings.get('tokens_saved', 0):,}")
        print(f" Kosteneinsparungen: {savings.get('cost_saved_eur', 0):.2f} EUR")
        print(f" Einsparung: {savings.get('savings_percentage', 0):.1f}%")
        print(f" Agent-Delegationen: {performance.get('agent_delegations', 0)}")
        print(f" LLM-Calls vermieden: {performance.get('llm_calls_avoided', 0)}")
        
        # VAN-Modus Ergebnisse
        van_result = result.get("van_result", {})
        if van_result:
            print(f"\n VAN-Modus:")
            print(f"   - Token-Einsparung: {van_result.get('token_savings', 0):,}")
            print(f"   - Agent-Delegationen: {van_result.get('agent_delegations', 0)}")
            print(f"   - Optimierungen: {', '.join(van_result.get('optimizations', []))}")
        
        # PLAN-Modus Ergebnisse  
        plan_result = result.get("plan_result", {})
        if plan_result:
            print(f"\n PLAN-Modus:")
            print(f"   - Workpackages: {plan_result.get('workpackage_count', 0)}")
            print(f"   - Aufwand (Stunden): {plan_result.get('total_effort_hours', 0)}")
            print(f"   - Token-Einsparung: {plan_result.get('token_savings', 0):,}")
        
        # Hochrechnung für Produktionseinsatz
        print("\n PRODUKTIONS-HOCHRECHNUNG:")
        print("-" * 35)
        
        daily_savings = savings.get('cost_saved_eur', 0) * 10  # 10 Projekte/Tag
        monthly_savings = daily_savings * 22  # 22 Arbeitstage
        yearly_savings = monthly_savings * 12
        
        print(f" Täglich (10 Projekte): {daily_savings:.2f} EUR")
        print(f" Monatlich: {monthly_savings:.2f} EUR")  
        print(f" Jährlich: {yearly_savings:.2f} EUR")
        
        # ROI-Berechnung
        implementation_cost = 5000  # Geschätzte Implementierungskosten
        roi_months = implementation_cost / monthly_savings if monthly_savings > 0 else float('inf')
        
        print(f"\n ROI-Analyse:")
        print(f"   - Implementierungskosten: {implementation_cost} EUR")
        print(f"   - ROI erreicht nach: {roi_months:.1f} Monaten")
        print(f"   - Jahres-ROI: {(yearly_savings / implementation_cost * 100):.0f}%")
        
        print(f"\n STATUS: {result.get('status', 'UNKNOWN')}")
        print(f" EMPFEHLUNG: {result.get('savings_report', {}).get('impact', {}).get('recommendation', 'EVALUATE')}")
        
        # Detaillierte JSON-Ausgabe für weitere Verarbeitung
        print(f"\n Vollständiger Bericht verfügbar als JSON")
        
        return result
        
    except Exception as e:
        print(f" Fehler bei der Optimierung: {str(e)}")
        return None

async def demo_kontinuierliche_optimierung():
    """Demonstriert kontinuierliche Optimierung."""
    
    print("\n KONTINUIERLICHE OPTIMIERUNG - Demo")
    print("=" * 40)
    
    from apm_framework.immediate_token_optimizer import ImmediateTokenOptimizer
    
    optimizer = ImmediateTokenOptimizer()
    
    # Beispiel-Tasks
    tasks = [
        {"id": "task_001", "type": "validation", "data": {"requirements": ["req1", "req2"]}},
        {"id": "task_002", "type": "calculation", "data": {"efforts": [16, 20, 12]}},
        {"id": "task_003", "type": "complex_analysis", "data": {"architecture": "microservices"}},
        {"id": "task_004", "type": "formatting", "data": {"reports": ["report1", "report2"]}},
        {"id": "task_005", "type": "strategic_planning", "data": {"vision": "digital_transformation"}}
    ]
    
    print(f" {len(tasks)} Tasks für kontinuierliche Optimierung:")
    for task in tasks:
        print(f"   - {task['id']}: {task['type']}")
    
    result = await optimizer.continuous_optimization(tasks)
    
    print(f"\n Kontinuierliche Optimierung abgeschlossen!")
    print(f" Zusätzliche Einsparungen: {result.get('continuous_savings', 0):,} Token")
    print(f" Status: {result.get('status', 'UNKNOWN')}")
    
    return result

async def main():
    """Hauptdemo-Funktion."""
    
    print(" VALEO NeuroERP - TOKEN-OPTIMIERUNG LIVE DEMO")
    print("=" * 55)
    print("", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print()
    
    # Demo 1: Sofortige Optimierung
    demo1_result = await demo_sofortige_optimierung()
    
    # Demo 2: Kontinuierliche Optimierung
    demo2_result = await demo_kontinuierliche_optimierung()
    
    print("\n" + "=" * 55)
    print(" DEMO ABGESCHLOSSEN - SYSTEM EINSATZBEREIT!")
    print("=" * 55)
    
    if demo1_result and demo2_result:
        total_savings = (
            demo1_result.get("savings_report", {}).get("immediate_savings", {}).get("tokens_saved", 0) +
            demo2_result.get("continuous_savings", 0)
        )
        
        print(f" GESAMT-TOKEN-EINSPARUNG: {total_savings:,}")
        print(f" GESAMT-KOSTENEINSPARUNG: {(total_savings / 1000) * 0.03:.2f} EUR")
        print(f" BEREIT FÜR PRODUKTIVEN EINSATZ!")

if __name__ == "__main__":
    asyncio.run(main())
