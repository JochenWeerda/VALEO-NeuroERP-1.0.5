#!/usr/bin/env python3
"""
VALEO NeuroERP 2.0 - Testdaten Initialisierung
Hauptskript zur Erstellung umfangreicher Testdaten für alle Module
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.db.init_test_data import init_test_data
from app.db.database import engine
from app.db.base import Base

def create_tables():
    """Erstellt alle Tabellen in der Datenbank"""
    print("🏗️ Erstelle Datenbanktabellen...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabellen erfolgreich erstellt!")

def main():
    """Hauptfunktion zur Initialisierung der Testdaten"""
    print("🚀 VALEO NeuroERP 2.0 - Testdaten Initialisierung")
    print("=" * 60)
    
    try:
        # Erstelle Tabellen
        create_tables()
        
        # Initialisiere Testdaten
        init_test_data()
        
        print("\n🎉 Testdaten Initialisierung erfolgreich abgeschlossen!")
        print("\n📊 Erstellte Testdaten:")
        print("   📦 Warenwirtschaft:")
        print("      - 3 Lieferanten")
        print("      - 3 Artikelstammdaten")
        print("      - 2 Lager")
        print("      - 2 Bestellungen")
        print("   💰 Finanzbuchhaltung:")
        print("      - 4 Konten")
        print("      - 2 Buchungen")
        print("      - 2 Rechnungen")
        print("   👥 CRM:")
        print("      - 3 Kunden")
        print("      - 2 Kontakte")
        print("      - 2 Angebote")
        print("   🔧 Übergreifende Services:")
        print("      - 3 Benutzer")
        print("      - 3 Rollen")
        print("      - 3 Systemeinstellungen")
        
        print("\n🔗 API-Endpoints verfügbar unter:")
        print("   - http://localhost:8000/api/v1/")
        print("   - http://localhost:8000/docs (Swagger UI)")
        
        print("\n🎯 Nächste Schritte:")
        print("   1. Starten Sie den Backend-Server: python main.py")
        print("   2. Starten Sie den Frontend-Server: npm run dev")
        print("   3. Öffnen Sie http://localhost:3000 im Browser")
        
    except Exception as e:
        print(f"\n❌ Fehler bei der Testdaten Initialisierung: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 