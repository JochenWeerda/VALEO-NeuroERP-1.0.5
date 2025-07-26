#!/usr/bin/env python3
"""
VALEO-NeuroERP VAN Zyklus Starter
Startet einen neuen VAN (Vision, Analysis, Navigation) Zyklus
"""
import asyncio
import json
import sys
from datetime import datetime
from typing import Dict, Any

# Import der VAN Phase Manager Komponenten
try:
    from backend.core.van_phase_manager import VANPhaseManager, VANState
    print("✅ VAN Phase Manager erfolgreich importiert")
except ImportError as e:
    print(f"❌ Fehler beim Import des VAN Phase Managers: {e}")
    print("Versuche alternativen Import...")
    sys.exit(1)

class VANCycleStarter:
    """Starter für VAN Zyklen"""
    
    def __init__(self):
        self.van_manager = VANPhaseManager()
        self.cycle_id = None
        
    def generate_cycle_id(self) -> str:
        """Generiert eine eindeutige Cycle ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"van_cycle_{timestamp}"
    
    async def start_new_cycle(self) -> Dict[str, Any]:
        """Startet einen neuen VAN Zyklus"""
        try:
            # Cycle ID generieren
            self.cycle_id = self.generate_cycle_id()
            print(f"🔄 Starte VAN Zyklus: {self.cycle_id}")
            
            # Zyklus starten
            cycle_id = await self.van_manager.start_cycle(self.cycle_id)
            
            # Status abrufen
            state = await self.van_manager.get_cycle_status(cycle_id)
            
            print(f"✅ VAN Zyklus erfolgreich gestartet!")
            print(f"📊 Status: {state.status}")
            print(f"🎯 Aktuelle Stufe: {state.stage}")
            
            return {
                "cycle_id": cycle_id,
                "state": state.dict(),
                "success": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Fehler beim Starten des VAN Zyklus: {e}")
            return {
                "cycle_id": self.cycle_id,
                "error": str(e),
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_cycle_status(self, cycle_id: str) -> Dict[str, Any]:
        """Gibt den Status eines Zyklus zurück"""
        try:
            state = await self.van_manager.get_cycle_status(cycle_id)
            return {
                "cycle_id": cycle_id,
                "state": state.dict(),
                "success": True
            }
        except Exception as e:
            return {
                "cycle_id": cycle_id,
                "error": str(e),
                "success": False
            }
    
    async def list_active_cycles(self) -> Dict[str, Any]:
        """Listet alle aktiven Zyklen auf"""
        try:
            cycles = await self.van_manager.list_active_cycles()
            return {
                "cycles": [cycle.dict() for cycle in cycles],
                "count": len(cycles),
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }

async def main():
    """Hauptfunktion"""
    print("🚀 VALEO-NeuroERP VAN Zyklus Starter")
    print("=" * 50)
    
    starter = VANCycleStarter()
    
    # Neuen Zyklus starten
    result = await starter.start_new_cycle()
    
    if result["success"]:
        print("\n📋 Zyklus Details:")
        print(f"   ID: {result['cycle_id']}")
        print(f"   Status: {result['state']['status']}")
        print(f"   Stufe: {result['state']['stage']}")
        print(f"   Zeitstempel: {result['timestamp']}")
        
        # Aktive Zyklen auflisten
        print("\n📊 Aktive Zyklen:")
        cycles_result = await starter.list_active_cycles()
        if cycles_result["success"]:
            for i, cycle in enumerate(cycles_result["cycles"], 1):
                print(f"   {i}. {cycle['cycle_id']} - {cycle['status']} ({cycle['stage']})")
        else:
            print(f"   Fehler beim Abrufen der Zyklen: {cycles_result['error']}")
    
    else:
        print(f"\n❌ Fehler: {result['error']}")
    
    print("\n" + "=" * 50)
    print("VAN Zyklus Starter beendet")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  VAN Zyklus Starter abgebrochen")
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}")
        sys.exit(1) 