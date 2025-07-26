#!/usr/bin/env python3
"""
VALEO-NeuroERP VAN Phase Analyse
Führt eine detaillierte Analyse der Anforderungen durch
"""
import requests
import json
from datetime import datetime
from typing import Dict, Any, List

class VANAnalysis:
    """VAN Phase Analyse-Komponente"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1/van"
        
    def get_cycle_status(self, cycle_id: str) -> Dict[str, Any]:
        """Gibt den Status eines Zyklus zurück"""
        try:
            response = requests.get(f"{self.api_url}/cycles/{cycle_id}", timeout=10)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def update_cycle_stage(self, cycle_id: str, stage: str) -> Dict[str, Any]:
        """Aktualisiert die Stufe eines Zyklus"""
        try:
            response = requests.put(f"{self.api_url}/cycles/{cycle_id}/stage?stage={stage}", timeout=10)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def analyze_requirements(self, vision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Führt eine detaillierte Analyse der Anforderungen durch"""
        
        analysis = {
            "timestamp": datetime.now().isoformat(),
            "analysis_phase": "detailed_requirements_analysis",
            "requirements_breakdown": {},
            "technical_analysis": {},
            "risk_assessment": {},
            "feasibility_study": {},
            "recommendations": []
        }
        
        # 1. Anforderungen aufschlüsseln
        requirements = vision_data.get("requirements", [])
        analysis["requirements_breakdown"] = {
            "functional_requirements": [],
            "non_functional_requirements": [],
            "technical_requirements": [],
            "business_requirements": []
        }
        
        for req in requirements:
            if "KI" in req or "Workflow" in req:
                analysis["requirements_breakdown"]["functional_requirements"].append({
                    "requirement": req,
                    "priority": "high",
                    "complexity": "high",
                    "dependencies": ["AI/ML Infrastructure", "Workflow Engine"]
                })
            elif "UI/UX" in req:
                analysis["requirements_breakdown"]["non_functional_requirements"].append({
                    "requirement": req,
                    "priority": "high",
                    "complexity": "medium",
                    "dependencies": ["Frontend Framework", "Design System"]
                })
            elif "Architektur" in req or "Datenverarbeitung" in req:
                analysis["requirements_breakdown"]["technical_requirements"].append({
                    "requirement": req,
                    "priority": "critical",
                    "complexity": "high",
                    "dependencies": ["Cloud Infrastructure", "Message Queue", "Database"]
                })
            else:
                analysis["requirements_breakdown"]["business_requirements"].append({
                    "requirement": req,
                    "priority": "medium",
                    "complexity": "medium",
                    "dependencies": ["Business Logic Layer"]
                })
        
        # 2. Technische Analyse
        analysis["technical_analysis"] = {
            "architecture_patterns": {
                "microservices": {
                    "suitability": "high",
                    "benefits": ["Skalierbarkeit", "Wartbarkeit", "Technologie-Flexibilität"],
                    "challenges": ["Distributed System Complexity", "Service Discovery", "Data Consistency"]
                },
                "event_driven": {
                    "suitability": "high",
                    "benefits": ["Loose Coupling", "Real-time Processing", "Scalability"],
                    "challenges": ["Event Ordering", "Error Handling", "Debugging"]
                },
                "api_first": {
                    "suitability": "high",
                    "benefits": ["Integration", "Reusability", "Documentation"],
                    "challenges": ["Versioning", "Security", "Performance"]
                }
            },
            "technology_stack": {
                "frontend": {
                    "framework": "React 18 + TypeScript",
                    "ui_libraries": ["Material-UI", "Ant Design"],
                    "styling": "Tailwind CSS",
                    "state_management": "Zustand",
                    "data_fetching": "React Query"
                },
                "backend": {
                    "framework": "FastAPI + Python",
                    "database": "PostgreSQL + Redis",
                    "message_queue": "RabbitMQ/Apache Kafka",
                    "search": "Elasticsearch",
                    "caching": "Redis"
                },
                "ai_ml": {
                    "framework": "LangGraph + LangChain",
                    "models": "OpenAI GPT-4, Claude",
                    "vector_store": "ChromaDB/FAISS",
                    "rag": "Custom RAG Pipeline"
                },
                "infrastructure": {
                    "containerization": "Docker + Kubernetes",
                    "monitoring": "Prometheus + Grafana",
                    "logging": "ELK Stack",
                    "ci_cd": "GitHub Actions"
                }
            }
        }
        
        # 3. Risikoanalyse
        analysis["risk_assessment"] = {
            "technical_risks": [
                {
                    "risk": "KI-Modell-Performance",
                    "probability": "medium",
                    "impact": "high",
                    "mitigation": "Model Monitoring, Fallback-Systeme"
                },
                {
                    "risk": "Microservice-Komplexität",
                    "probability": "high",
                    "impact": "medium",
                    "mitigation": "Service Mesh, Monitoring, Dokumentation"
                },
                {
                    "risk": "Datenkonsistenz",
                    "probability": "medium",
                    "impact": "high",
                    "mitigation": "Saga Pattern, Event Sourcing"
                }
            ],
            "business_risks": [
                {
                    "risk": "Anwenderakzeptanz",
                    "probability": "medium",
                    "impact": "high",
                    "mitigation": "User Research, Iterative Entwicklung"
                },
                {
                    "risk": "Compliance-Anforderungen",
                    "probability": "high",
                    "impact": "critical",
                    "mitigation": "Compliance-by-Design, Audit-Trails"
                }
            ],
            "operational_risks": [
                {
                    "risk": "Skalierbarkeit",
                    "probability": "medium",
                    "impact": "high",
                    "mitigation": "Load Testing, Auto-Scaling"
                },
                {
                    "risk": "Sicherheit",
                    "probability": "high",
                    "impact": "critical",
                    "mitigation": "Security-by-Design, Penetration Testing"
                }
            ]
        }
        
        # 4. Machbarkeitsstudie
        analysis["feasibility_study"] = {
            "technical_feasibility": {
                "score": 85,
                "rating": "high",
                "factors": {
                    "positive": [
                        "Erprobte Technologien verfügbar",
                        "KI-Frameworks ausgereift",
                        "Cloud-Infrastruktur skalierbar",
                        "Open Source Komponenten verfügbar"
                    ],
                    "challenges": [
                        "KI-Modell-Integration komplex",
                        "Microservice-Orchestrierung",
                        "Real-time Performance",
                        "Datenqualität und -konsistenz"
                    ]
                }
            },
            "economic_feasibility": {
                "score": 80,
                "rating": "high",
                "factors": {
                    "positive": [
                        "ROI durch Automatisierung",
                        "Skalierbare Kosten",
                        "Reduzierung manueller Prozesse"
                    ],
                    "challenges": [
                        "Hohe initiale Entwicklungskosten",
                        "KI-Modell-Training und -Wartung",
                        "Infrastruktur-Kosten"
                    ]
                }
            },
            "operational_feasibility": {
                "score": 75,
                "rating": "medium",
                "factors": {
                    "positive": [
                        "Agile Entwicklung möglich",
                        "Iterative Verbesserung",
                        "Modulare Architektur"
                    ],
                    "challenges": [
                        "Team-Skills für KI/ML",
                        "DevOps-Kultur erforderlich",
                        "Change Management"
                    ]
                }
            }
        }
        
        # 5. Empfehlungen
        analysis["recommendations"] = [
            {
                "category": "Architektur",
                "recommendation": "Event-driven Microservices mit API Gateway",
                "priority": "high",
                "rationale": "Skalierbarkeit und Wartbarkeit"
            },
            {
                "category": "KI/ML",
                "recommendation": "Hybrid-Ansatz: Regelbasierte + KI-Systeme",
                "priority": "high",
                "rationale": "Robustheit und Transparenz"
            },
            {
                "category": "Frontend",
                "recommendation": "Progressive Web App mit Offline-Funktionalität",
                "priority": "medium",
                "rationale": "Benutzerfreundlichkeit und Performance"
            },
            {
                "category": "Sicherheit",
                "recommendation": "Zero-Trust Security Model",
                "priority": "critical",
                "rationale": "Compliance und Datenschutz"
            },
            {
                "category": "Deployment",
                "recommendation": "Blue-Green Deployment mit Feature Flags",
                "priority": "medium",
                "rationale": "Minimale Downtime und Risiko"
            }
        ]
        
        return analysis
    
    def generate_analysis_report(self, cycle_id: str) -> Dict[str, Any]:
        """Generiert einen vollständigen Analysebericht"""
        
        # Aktuellen Zyklus-Status abrufen
        status_result = self.get_cycle_status(cycle_id)
        if not status_result["success"]:
            return {"success": False, "error": f"Fehler beim Abrufen des Zyklus: {status_result['error']}"}
        
        cycle_data = status_result["data"]
        vision_data = cycle_data.get("vision_data", {})
        
        # Detaillierte Analyse durchführen
        analysis = self.analyze_requirements(vision_data)
        
        # Zur Analysis-Phase wechseln
        stage_result = self.update_cycle_stage(cycle_id, "analysis")
        if not stage_result["success"]:
            return {"success": False, "error": f"Fehler beim Wechsel zur Analysis-Phase: {stage_result['error']}"}
        
        return {
            "success": True,
            "cycle_id": cycle_id,
            "analysis": analysis,
            "stage_updated": True
        }

def main():
    """Hauptfunktion"""
    print("🔍 VALEO-NeuroERP VAN Phase - Detaillierte Anforderungsanalyse")
    print("=" * 70)
    
    # Neuen Zyklus starten oder bestehenden verwenden
    cycle_id = input("VAN Zyklus ID (Enter für neuen Zyklus): ").strip()
    
    if not cycle_id:
        # Neuen Zyklus starten
        from simple_van_starter import SimpleVANStarter
        starter = SimpleVANStarter()
        result = starter.start_new_cycle()
        if result["success"]:
            cycle_id = result["cycle_id"]
            print(f"✅ Neuer Zyklus gestartet: {cycle_id}")
        else:
            print(f"❌ Fehler beim Starten des Zyklus: {result['error']}")
            return
    
    # Analyse durchführen
    analyzer = VANAnalysis()
    report = analyzer.generate_analysis_report(cycle_id)
    
    if report["success"]:
        print(f"\n✅ Analyse erfolgreich abgeschlossen für Zyklus: {cycle_id}")
        
        analysis = report["analysis"]
        
        # Zusammenfassung ausgeben
        print("\n📊 ANALYSE-ZUSAMMENFASSUNG")
        print("-" * 50)
        
        # Anforderungen
        req_breakdown = analysis["requirements_breakdown"]
        print(f"\n🎯 Anforderungen:")
        print(f"   • Funktionale Anforderungen: {len(req_breakdown['functional_requirements'])}")
        print(f"   • Nicht-funktionale Anforderungen: {len(req_breakdown['non_functional_requirements'])}")
        print(f"   • Technische Anforderungen: {len(req_breakdown['technical_requirements'])}")
        print(f"   • Geschäftsanforderungen: {len(req_breakdown['business_requirements'])}")
        
        # Machbarkeit
        feasibility = analysis["feasibility_study"]
        print(f"\n📈 Machbarkeit:")
        print(f"   • Technische Machbarkeit: {feasibility['technical_feasibility']['score']}/100 ({feasibility['technical_feasibility']['rating']})")
        print(f"   • Wirtschaftliche Machbarkeit: {feasibility['economic_feasibility']['score']}/100 ({feasibility['economic_feasibility']['rating']})")
        print(f"   • Operative Machbarkeit: {feasibility['operational_feasibility']['score']}/100 ({feasibility['operational_feasibility']['rating']})")
        
        # Risiken
        risks = analysis["risk_assessment"]
        total_risks = len(risks["technical_risks"]) + len(risks["business_risks"]) + len(risks["operational_risks"])
        print(f"\n⚠️  Risiken identifiziert: {total_risks}")
        
        # Empfehlungen
        recommendations = analysis["recommendations"]
        print(f"\n💡 Empfehlungen: {len(recommendations)}")
        
        # Detaillierte Empfehlungen
        print(f"\n🔍 TOP-EMPFOHLUNGEN:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. [{rec['category']}] {rec['recommendation']}")
            print(f"      Priorität: {rec['priority']} | Begründung: {rec['rationale']}")
        
        # Technologie-Stack
        tech_stack = analysis["technical_analysis"]["technology_stack"]
        print(f"\n🛠️  EMPFOHLENER TECHNOLOGIE-STACK:")
        print(f"   Frontend: {tech_stack['frontend']['framework']} + {', '.join(tech_stack['frontend']['ui_libraries'])}")
        print(f"   Backend: {tech_stack['backend']['framework']} + {tech_stack['backend']['database']}")
        print(f"   KI/ML: {tech_stack['ai_ml']['framework']} + {tech_stack['ai_ml']['models']}")
        print(f"   Infrastructure: {tech_stack['infrastructure']['containerization']}")
        
        # Bericht speichern
        filename = f"van_analysis_report_{cycle_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detaillierter Bericht gespeichert: {filename}")
        
    else:
        print(f"\n❌ Fehler bei der Analyse: {report['error']}")
    
    print("\n" + "=" * 70)
    print("VAN Phase Analyse beendet")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Analyse abgebrochen")
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}") 