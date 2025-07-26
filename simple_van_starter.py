#!/usr/bin/env python3
"""
Vereinfachter VALEO-NeuroERP VAN Zyklus Starter
Verwendet HTTP-Requests zur VAN Phase API
"""
import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class SimpleVANStarter:
    """Vereinfachter VAN Zyklus Starter über HTTP API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1/van"
        
    def generate_cycle_id(self) -> str:
        """Generiert eine eindeutige Cycle ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"van_cycle_{timestamp}"
    
    def start_new_cycle(self, cycle_id: Optional[str] = None) -> Dict[str, Any]:
        """Startet einen neuen VAN Zyklus über HTTP API"""
        try:
            if cycle_id is None:
                cycle_id = self.generate_cycle_id()
                
            print(f"🔄 Starte VAN Zyklus: {cycle_id}")
            
            # Request-Daten vorbereiten
            request_data = {
                "cycle_id": cycle_id
            }
            
            # HTTP POST Request an VAN API
            response = requests.post(
                f"{self.api_url}/cycles",
                json=request_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ VAN Zyklus erfolgreich gestartet!")
                print(f"📊 Status: {result['state']['status']}")
                print(f"🎯 Aktuelle Stufe: {result['state']['stage']}")
                
                return {
                    "cycle_id": cycle_id,
                    "state": result['state'],
                    "success": True,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                print(f"❌ HTTP Fehler: {response.status_code}")
                print(f"Response: {response.text}")
                return {
                    "cycle_id": cycle_id,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "success": False,
                    "timestamp": datetime.now().isoformat()
                }
                
        except requests.exceptions.ConnectionError:
            error_msg = f"Verbindung zur API fehlgeschlagen: {self.api_url}"
            print(f"❌ {error_msg}")
            return {
                "cycle_id": cycle_id,
                "error": error_msg,
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Fehler beim Starten des VAN Zyklus: {e}")
            return {
                "cycle_id": cycle_id,
                "error": str(e),
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_cycle_status(self, cycle_id: str) -> Dict[str, Any]:
        """Gibt den Status eines Zyklus zurück"""
        try:
            response = requests.get(
                f"{self.api_url}/cycles/{cycle_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    "cycle_id": cycle_id,
                    "state": response.json(),
                    "success": True
                }
            else:
                return {
                    "cycle_id": cycle_id,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "success": False
                }
                
        except Exception as e:
            return {
                "cycle_id": cycle_id,
                "error": str(e),
                "success": False
            }
    
    def list_active_cycles(self) -> Dict[str, Any]:
        """Listet alle aktiven Zyklen auf"""
        try:
            response = requests.get(
                f"{self.api_url}/cycles",
                timeout=10
            )
            
            if response.status_code == 200:
                cycles = response.json()
                return {
                    "cycles": cycles,
                    "count": len(cycles),
                    "success": True
                }
            else:
                return {
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "success": False
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }

def simulate_van_cycle() -> Dict[str, Any]:
    """Simuliert einen VAN Zyklus ohne API-Server"""
    cycle_id = f"van_cycle_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"🔄 Simuliere VAN Zyklus: {cycle_id}")
    
    # Simulierte VAN Phase Daten
    van_state = {
        "cycle_id": cycle_id,
        "stage": "vision",
        "status": "running",
        "vision_data": {
            "requirements": ["KI-gestützte ERP-Funktionen", "Moderne UI/UX", "Skalierbare Architektur"],
            "stakeholders": ["Entwicklungsteam", "Endbenutzer", "Management"],
            "constraints": ["Performance", "Sicherheit", "Compliance"]
        },
        "analysis_data": {},
        "next_steps_data": {},
        "metadata": {
            "created_at": datetime.now().isoformat(),
            "framework_version": "2.0",
            "phase": "VAN"
        },
        "error": None
    }
    
    print(f"✅ VAN Zyklus simuliert!")
    print(f"📊 Status: {van_state['status']}")
    print(f"🎯 Aktuelle Stufe: {van_state['stage']}")
    
    return {
        "cycle_id": cycle_id,
        "state": van_state,
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "simulated": True
    }

def main():
    """Hauptfunktion"""
    print("🚀 VALEO-NeuroERP VAN Zyklus Starter")
    print("=" * 50)
    
    # Versuche zuerst die API zu verwenden
    starter = SimpleVANStarter()
    result = starter.start_new_cycle()
    
    # Falls API nicht verfügbar, simuliere einen Zyklus
    if not result["success"]:
        print("\n⚠️  API nicht verfügbar, simuliere VAN Zyklus...")
        result = simulate_van_cycle()
    
    if result["success"]:
        print("\n📋 Zyklus Details:")
        print(f"   ID: {result['cycle_id']}")
        print(f"   Status: {result['state']['status']}")
        print(f"   Stufe: {result['state']['stage']}")
        print(f"   Zeitstempel: {result['timestamp']}")
        
        if result.get("simulated"):
            print(f"   ⚠️  Simuliert (kein API-Server)")
        
        # Vision-Daten anzeigen (falls vorhanden)
        if result['state'].get('vision_data'):
            print("\n🎯 Vision-Daten:")
            vision = result['state']['vision_data']
            if vision.get('requirements'):
                print("   Anforderungen:")
                for req in vision['requirements']:
                    print(f"     • {req}")
            if vision.get('stakeholders'):
                print("   Stakeholder:")
                for stakeholder in vision['stakeholders']:
                    print(f"     • {stakeholder}")
    
    else:
        print(f"\n❌ Fehler: {result['error']}")
    
    print("\n" + "=" * 50)
    print("VAN Zyklus Starter beendet")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  VAN Zyklus Starter abgebrochen")
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}") 