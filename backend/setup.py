#!/usr/bin/env python3
"""
Setup-Skript für MCP Supabase Schema Server
Installiert alle Dependencies und konfiguriert die Umgebung
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command: str, description: str) -> bool:
    """Führt einen Befehl aus und gibt Status zurück"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} erfolgreich")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} fehlgeschlagen: {e}")
        print(f"Fehler: {e.stderr}")
        return False

def check_python_version():
    """Prüft Python-Version"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 oder höher erforderlich")
        sys.exit(1)
    print(f"✅ Python {sys.version} gefunden")

def install_dependencies():
    """Installiert Python-Dependencies"""
    if not run_command("pip install -r requirements.txt", "Python-Dependencies installieren"):
        return False
    
    # Zusätzliche Dependencies für MCP
    mcp_deps = [
        "mcp>=1.0.0",
        "supabase>=2.0.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0"
    ]
    
    for dep in mcp_deps:
        if not run_command(f"pip install {dep}", f"{dep} installieren"):
            return False
    
    return True

def create_env_file():
    """Erstellt .env-Datei aus Template"""
    env_template = Path("config.env.example")
    env_file = Path(".env")
    
    if env_file.exists():
        print("⚠️ .env-Datei existiert bereits")
        return True
    
    if not env_template.exists():
        print("❌ config.env.example nicht gefunden")
        return False
    
    shutil.copy(env_template, env_file)
    print("✅ .env-Datei erstellt")
    print("⚠️ Bitte konfiguriere die Supabase-Einstellungen in .env")
    return True

def setup_supabase():
    """Setup für Supabase"""
    print("🔧 Supabase-Setup:")
    print("1. Erstelle ein neues Projekt auf https://supabase.com")
    print("2. Kopiere die Projekt-URL und API-Keys")
    print("3. Aktualisiere die .env-Datei mit deinen Supabase-Daten")
    print("4. Führe das SQL-Schema aus: database/supabase_schema.sql")
    
    return True

def setup_mcp_server():
    """Setup für MCP-Server"""
    print("🔧 MCP-Server-Setup:")
    
    # MCP-Server-Konfiguration erstellen
    mcp_config = """
# MCP Server Konfiguration
[mcp]
name = "supabase-schema"
version = "1.0.0"
description = "Supabase Schema Provider für VALEO NeuroERP"

[server]
host = "localhost"
port = 8000
debug = true

[supabase]
url = "${SUPABASE_URL}"
key = "${SUPABASE_ANON_KEY}"
project_id = "${SUPABASE_PROJECT_ID}"
"""
    
    config_file = Path("mcp_config.toml")
    with open(config_file, "w") as f:
        f.write(mcp_config)
    
    print("✅ MCP-Server-Konfiguration erstellt")
    return True

def create_directories():
    """Erstellt notwendige Verzeichnisse"""
    directories = [
        "logs",
        "data",
        "cache"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Verzeichnis {directory} erstellt")
    
    return True

def setup_database():
    """Setup für Datenbank"""
    print("🔧 Datenbank-Setup:")
    print("1. Führe das SQL-Schema in deiner Supabase-Datenbank aus:")
    print("   - Gehe zu deinem Supabase-Projekt")
    print("   - Öffne den SQL-Editor")
    print("   - Kopiere den Inhalt von database/supabase_schema.sql")
    print("   - Führe das Script aus")
    
    return True

def test_installation():
    """Testet die Installation"""
    print("🧪 Installation testen...")
    
    # Python-Imports testen
    try:
        import mcp
        import supabase
        import fastapi
        print("✅ Alle Python-Dependencies verfügbar")
    except ImportError as e:
        print(f"❌ Import-Fehler: {e}")
        return False
    
    # MCP-Server testen
    if not run_command("python -c 'from mcp_supabase_server import main; print(\"MCP Server verfügbar\")'", "MCP-Server testen"):
        return False
    
    return True

def main():
    """Hauptfunktion"""
    print("🚀 VALEO NeuroERP MCP Supabase Setup")
    print("=" * 50)
    
    # Python-Version prüfen
    check_python_version()
    
    # Verzeichnisse erstellen
    if not create_directories():
        sys.exit(1)
    
    # Dependencies installieren
    if not install_dependencies():
        print("❌ Installation der Dependencies fehlgeschlagen")
        sys.exit(1)
    
    # Umgebungsvariablen erstellen
    if not create_env_file():
        print("❌ Erstellung der .env-Datei fehlgeschlagen")
        sys.exit(1)
    
    # MCP-Server konfigurieren
    if not setup_mcp_server():
        print("❌ MCP-Server-Setup fehlgeschlagen")
        sys.exit(1)
    
    # Supabase-Setup
    setup_supabase()
    
    # Datenbank-Setup
    setup_database()
    
    # Installation testen
    if not test_installation():
        print("❌ Installation-Test fehlgeschlagen")
        sys.exit(1)
    
    print("\n🎉 Setup erfolgreich abgeschlossen!")
    print("\n📋 Nächste Schritte:")
    print("1. Konfiguriere deine Supabase-Daten in .env")
    print("2. Führe das Datenbank-Schema aus")
    print("3. Starte den MCP-Server: python mcp_supabase_server.py")
    print("4. Teste die Frontend-Integration")
    
    print("\n🔗 Nützliche Links:")
    print("- Supabase Dashboard: https://supabase.com/dashboard")
    print("- MCP Dokumentation: https://modelcontextprotocol.io/")
    print("- VALEO NeuroERP Frontend: http://localhost:3000")

if __name__ == "__main__":
    main() 