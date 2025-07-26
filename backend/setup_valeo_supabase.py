#!/usr/bin/env python3
"""
VALEO NeuroERP Supabase Setup
Automatisches Setup für das bestehende Supabase-Projekt
"""

import os
import sys
import subprocess
import shutil
import requests
import json
from pathlib import Path

# Supabase-Projekt-Konfiguration
SUPABASE_PROJECT_ID = "ftybxxndembbfjdkcsuk"
SUPABASE_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co"

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

def get_supabase_keys():
    """Hilft beim Abrufen der Supabase-Keys"""
    print("🔑 Supabase-Keys abrufen:")
    print(f"1. Gehe zu: https://supabase.com/dashboard/project/{SUPABASE_PROJECT_ID}")
    print("2. Klicke auf 'Settings' → 'API'")
    print("3. Kopiere die folgenden Keys:")
    print("   - Project URL")
    print("   - anon public key")
    print("   - service_role secret key")
    
    return {
        "url": SUPABASE_URL,
        "anon_key": input("Anon Key eingeben: ").strip(),
        "service_role_key": input("Service Role Key eingeben: ").strip()
    }

def create_env_file(keys):
    """Erstellt .env-Datei mit den Supabase-Keys"""
    env_content = f"""# VALEO NeuroERP Supabase Configuration
SUPABASE_URL={keys['url']}
SUPABASE_ANON_KEY={keys['anon_key']}
SUPABASE_SERVICE_ROLE_KEY={keys['service_role_key']}
SUPABASE_PROJECT_ID={SUPABASE_PROJECT_ID}

# MCP Server Configuration
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000
MCP_SERVER_DEBUG=true

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/valeo_neuroerp

# Security
JWT_SECRET_KEY=valeo-neuroerp-jwt-secret-2024
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/mcp_server.log

# Cache Configuration
CACHE_TIMEOUT=300
CACHE_ENABLED=true

# Development
DEBUG=true
ENVIRONMENT=development
"""
    
    env_file = Path(".env")
    with open(env_file, "w") as f:
        f.write(env_content)
    
    print("✅ .env-Datei mit Supabase-Keys erstellt")
    return True

def install_dependencies():
    """Installiert alle notwendigen Dependencies"""
    print("📦 Dependencies installieren...")
    
    # Python-Dependencies
    if not run_command("pip install -r requirements.txt", "Python-Dependencies installieren"):
        return False
    
    # Zusätzliche Dependencies für VALEO
    valeo_deps = [
        "mcp>=1.0.0",
        "supabase>=2.0.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "psycopg2-binary>=2.9.0",
        "pydantic>=2.5.0"
    ]
    
    for dep in valeo_deps:
        if not run_command(f"pip install {dep}", f"{dep} installieren"):
            return False
    
    return True

def setup_database_schema():
    """Führt das Datenbank-Schema aus"""
    print("🗄️ Datenbank-Schema einrichten...")
    
    # SQL-Schema lesen
    schema_file = Path("../database/supabase_schema.sql")
    if not schema_file.exists():
        print("❌ SQL-Schema-Datei nicht gefunden")
        return False
    
    with open(schema_file, "r") as f:
        sql_schema = f.read()
    
    print("📋 SQL-Schema bereit:")
    print("1. Gehe zu: https://supabase.com/dashboard/project/{SUPABASE_PROJECT_ID}/sql")
    print("2. Kopiere den folgenden SQL-Code:")
    print("3. Führe ihn im SQL-Editor aus")
    print("\n" + "="*50)
    print(sql_schema)
    print("="*50)
    
    input("\nDrücke Enter nach dem Ausführen des SQL-Schemas...")
    return True

def test_supabase_connection(keys):
    """Testet die Supabase-Verbindung"""
    print("🧪 Supabase-Verbindung testen...")
    
    try:
        # Test-Request an Supabase
        headers = {
            "apikey": keys['anon_key'],
            "Authorization": f"Bearer {keys['anon_key']}"
        }
        
        response = requests.get(f"{keys['url']}/rest/v1/", headers=headers)
        
        if response.status_code == 200:
            print("✅ Supabase-Verbindung erfolgreich")
            return True
        else:
            print(f"❌ Supabase-Verbindung fehlgeschlagen: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Verbindungstest fehlgeschlagen: {e}")
        return False

def create_mcp_config():
    """Erstellt MCP-Server-Konfiguration"""
    print("⚙️ MCP-Server-Konfiguration erstellen...")
    
    mcp_config = f"""# VALEO NeuroERP MCP Server Configuration
[mcp]
name = "valeo-supabase-schema"
version = "1.0.0"
description = "Supabase Schema Provider für VALEO NeuroERP"

[server]
host = "localhost"
port = 8000
debug = true

[supabase]
url = "{SUPABASE_URL}"
project_id = "{SUPABASE_PROJECT_ID}"

[valeo]
project_name = "VALEO NeuroERP"
environment = "development"
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
        "cache",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Verzeichnis {directory} erstellt")
    
    return True

def test_mcp_server():
    """Testet den MCP-Server"""
    print("🧪 MCP-Server testen...")
    
    try:
        # Test-Import
        import mcp
        import supabase
        import fastapi
        print("✅ Alle Python-Dependencies verfügbar")
        
        # MCP-Server-Test
        if not run_command("python -c 'from mcp_supabase_server import main; print(\"MCP Server verfügbar\")'", "MCP-Server testen"):
            return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Import-Fehler: {e}")
        return False

def create_startup_scripts():
    """Erstellt Startup-Skripte"""
    print("🚀 Startup-Skripte erstellen...")
    
    # Windows PowerShell Script
    windows_script = """# VALEO NeuroERP MCP Server Startup (Windows)
Write-Host "🚀 VALEO NeuroERP MCP Server starten..." -ForegroundColor Green

# Umgebungsvariablen laden
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# MCP Server starten
python mcp_supabase_server.py
"""
    
    with open("start_mcp_server.ps1", "w") as f:
        f.write(windows_script)
    
    # Linux/Mac Shell Script
    linux_script = """#!/bin/bash
# VALEO NeuroERP MCP Server Startup (Linux/Mac)
echo "🚀 VALEO NeuroERP MCP Server starten..."

# Umgebungsvariablen laden
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# MCP Server starten
python mcp_supabase_server.py
"""
    
    with open("start_mcp_server.sh", "w") as f:
        f.write(linux_script)
    
    # Ausführbar machen (Linux/Mac)
    os.chmod("start_mcp_server.sh", 0o755)
    
    print("✅ Startup-Skripte erstellt:")
    print("   - start_mcp_server.ps1 (Windows)")
    print("   - start_mcp_server.sh (Linux/Mac)")
    
    return True

def main():
    """Hauptfunktion"""
    print("🚀 VALEO NeuroERP Supabase Setup")
    print("=" * 50)
    print(f"Projekt: {SUPABASE_PROJECT_ID}")
    print(f"URL: {SUPABASE_URL}")
    print("=" * 50)
    
    # Verzeichnisse erstellen
    if not create_directories():
        sys.exit(1)
    
    # Dependencies installieren
    if not install_dependencies():
        print("❌ Installation der Dependencies fehlgeschlagen")
        sys.exit(1)
    
    # Supabase-Keys abrufen
    keys = get_supabase_keys()
    
    # .env-Datei erstellen
    if not create_env_file(keys):
        print("❌ Erstellung der .env-Datei fehlgeschlagen")
        sys.exit(1)
    
    # Supabase-Verbindung testen
    if not test_supabase_connection(keys):
        print("❌ Supabase-Verbindung fehlgeschlagen")
        sys.exit(1)
    
    # MCP-Konfiguration erstellen
    if not create_mcp_config():
        print("❌ MCP-Konfiguration fehlgeschlagen")
        sys.exit(1)
    
    # Datenbank-Schema einrichten
    setup_database_schema()
    
    # MCP-Server testen
    if not test_mcp_server():
        print("❌ MCP-Server-Test fehlgeschlagen")
        sys.exit(1)
    
    # Startup-Skripte erstellen
    create_startup_scripts()
    
    print("\n🎉 VALEO NeuroERP Supabase Setup erfolgreich abgeschlossen!")
    print("\n📋 Nächste Schritte:")
    print("1. ✅ Supabase-Keys konfiguriert")
    print("2. ✅ Dependencies installiert")
    print("3. ✅ Datenbank-Schema ausgeführt")
    print("4. ✅ MCP-Server getestet")
    print("\n🚀 Server starten:")
    print("   Windows: .\\start_mcp_server.ps1")
    print("   Linux/Mac: ./start_mcp_server.sh")
    print("   Oder: python mcp_supabase_server.py")
    
    print("\n🔗 Links:")
    print(f"- Supabase Dashboard: https://supabase.com/dashboard/project/{SUPABASE_PROJECT_ID}")
    print("- MCP Server API: http://localhost:8000")
    print("- Frontend: http://localhost:3000")
    
    print("\n📊 Verfügbare Endpunkte:")
    print("- GET  /api/health - Health-Check")
    print("- GET  /api/tables - Alle Tabellen")
    print("- GET  /api/schema/{table} - Schema für Tabelle")
    print("- POST /api/cache/clear - Cache leeren")

if __name__ == "__main__":
    main() 