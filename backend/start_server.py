#!/usr/bin/env python3
"""
Einfaches Script zum Starten des VALEO NeuroERP Backend-Servers
"""

import uvicorn
import sys
import os

# Pfad zum Backend hinzufügen
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starte VALEO NeuroERP Backend...")
    print("📍 Server wird auf http://localhost:8000 gestartet")
    print("🔧 Drücken Sie Ctrl+C zum Beenden")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server wird beendet...")
    except Exception as e:
        print(f"❌ Fehler beim Starten des Servers: {e}")
        sys.exit(1) 