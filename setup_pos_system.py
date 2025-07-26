#!/usr/bin/env python3
"""
VALEO NeuroERP - Kassensystem Setup-Skript
Installiert und konfiguriert das Point-of-Sale System
"""

import os
import sys
import subprocess
import json
import logging
from pathlib import Path

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pos_setup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class POSSystemSetup:
    """Setup-Klasse für das Kassensystem"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / 'backend'
        self.frontend_dir = self.project_root / 'frontend'
        self.config_dir = self.project_root / 'config'
        
    def check_prerequisites(self):
        """Prüft die Voraussetzungen für die Installation"""
        logger.info("Prüfe Voraussetzungen...")
        
        # Python-Version prüfen
        if sys.version_info < (3, 8):
            logger.error("Python 3.8 oder höher erforderlich")
            return False
        
        # Node.js prüfen
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                logger.error("Node.js nicht gefunden")
                return False
            logger.info(f"Node.js Version: {result.stdout.strip()}")
        except FileNotFoundError:
            logger.error("Node.js nicht installiert")
            return False
        
        # npm prüfen
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                logger.error("npm nicht gefunden")
                return False
            logger.info(f"npm Version: {result.stdout.strip()}")
        except FileNotFoundError:
            logger.error("npm nicht installiert")
            return False
        
        # PostgreSQL prüfen
        try:
            result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                logger.warning("PostgreSQL nicht gefunden - Datenbank-Setup übersprungen")
            else:
                logger.info(f"PostgreSQL Version: {result.stdout.strip()}")
        except FileNotFoundError:
            logger.warning("PostgreSQL nicht installiert - Datenbank-Setup übersprungen")
        
        logger.info("Voraussetzungen erfüllt")
        return True
    
    def setup_backend(self):
        """Backend-Setup"""
        logger.info("Setup Backend...")
        
        # Python-Abhängigkeiten installieren
        requirements_file = self.backend_dir / 'requirements.txt'
        if requirements_file.exists():
            logger.info("Installiere Python-Abhängigkeiten...")
            try:
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
                ], check=True)
                logger.info("Python-Abhängigkeiten installiert")
            except subprocess.CalledProcessError as e:
                logger.error(f"Fehler beim Installieren der Python-Abhängigkeiten: {e}")
                return False
        
        # POS-spezifische Abhängigkeiten
        pos_requirements = [
            'fastapi',
            'uvicorn',
            'sqlalchemy',
            'psycopg2-binary',
            'requests',
            'python-multipart'
        ]
        
        logger.info("Installiere POS-spezifische Abhängigkeiten...")
        for req in pos_requirements:
            try:
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install', req
                ], check=True)
                logger.info(f"Installiert: {req}")
            except subprocess.CalledProcessError as e:
                logger.error(f"Fehler beim Installieren von {req}: {e}")
                return False
        
        # Konfigurationsdateien erstellen
        self.create_backend_config()
        
        logger.info("Backend-Setup abgeschlossen")
        return True
    
    def setup_frontend(self):
        """Frontend-Setup"""
        logger.info("Setup Frontend...")
        
        if not self.frontend_dir.exists():
            logger.error("Frontend-Verzeichnis nicht gefunden")
            return False
        
        # npm install
        logger.info("Installiere npm-Abhängigkeiten...")
        try:
            subprocess.run(['npm', 'install'], cwd=self.frontend_dir, check=True)
            logger.info("npm-Abhängigkeiten installiert")
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler beim npm install: {e}")
            return False
        
        # Build erstellen
        logger.info("Erstelle Frontend-Build...")
        try:
            subprocess.run(['npm', 'run', 'build'], cwd=self.frontend_dir, check=True)
            logger.info("Frontend-Build erstellt")
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler beim Frontend-Build: {e}")
            return False
        
        logger.info("Frontend-Setup abgeschlossen")
        return True
    
    def setup_database(self):
        """Datenbank-Setup"""
        logger.info("Setup Datenbank...")
        
        migration_file = self.backend_dir / 'database' / 'migrations' / 'pos_system_migration.sql'
        if not migration_file.exists():
            logger.error(f"Migration-Datei nicht gefunden: {migration_file}")
            return False
        
        # Datenbankverbindung prüfen
        db_config = self.get_database_config()
        if not db_config:
            logger.error("Datenbank-Konfiguration nicht gefunden")
            return False
        
        # Migration ausführen
        try:
            cmd = [
                'psql',
                '-h', db_config.get('host', 'localhost'),
                '-p', str(db_config.get('port', 5432)),
                '-U', db_config.get('user', 'postgres'),
                '-d', db_config.get('database', 'valeo_erp'),
                '-f', str(migration_file)
            ]
            
            # Passwort über Umgebungsvariable
            env = os.environ.copy()
            if 'password' in db_config:
                env['PGPASSWORD'] = db_config['password']
            
            subprocess.run(cmd, env=env, check=True)
            logger.info("Datenbank-Migration erfolgreich")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler bei der Datenbank-Migration: {e}")
            return False
        except FileNotFoundError:
            logger.warning("psql nicht gefunden - Datenbank-Setup übersprungen")
            return True
        
        return True
    
    def create_backend_config(self):
        """Backend-Konfiguration erstellen"""
        logger.info("Erstelle Backend-Konfiguration...")
        
        config_dir = self.backend_dir / 'config'
        config_dir.mkdir(exist_ok=True)
        
        # POS-Konfiguration
        pos_config = {
            'tse': {
                'simulator': True,
                'host': 'localhost',
                'port': 8080,
                'timeout': 30
            },
            'cash_drawer': {
                'enabled': True,
                'port': 'COM1' if os.name == 'nt' else '/dev/ttyUSB0'
            },
            'payment_methods': [
                'bar', 'ec_karte', 'kreditkarte', 'paypal', 'klarna', 'ueberweisung', 'rechnung'
            ],
            'currency': 'EUR',
            'tax_rates': {
                'reduced': 7.0,
                'standard': 19.0
            },
            'receipt_template': {
                'company_name': 'VALEO NeuroERP',
                'address': 'Musterstraße 123, 12345 Musterstadt',
                'phone': '+49 123 456789',
                'email': 'info@valeo-neuroerp.de',
                'website': 'www.valeo-neuroerp.de'
            }
        }
        
        config_file = config_dir / 'pos_config.json'
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(pos_config, f, indent=2, ensure_ascii=False)
        
        logger.info(f"POS-Konfiguration erstellt: {config_file}")
    
    def get_database_config(self):
        """Datenbank-Konfiguration laden"""
        config_files = [
            self.backend_dir / 'config.env',
            self.backend_dir / 'config' / 'database.json',
            self.project_root / '.env'
        ]
        
        for config_file in config_files:
            if config_file.exists():
                try:
                    if config_file.suffix == '.json':
                        with open(config_file, 'r', encoding='utf-8') as f:
                            return json.load(f)
                    else:
                        # .env Datei parsen
                        config = {}
                        with open(config_file, 'r', encoding='utf-8') as f:
                            for line in f:
                                if '=' in line and not line.startswith('#'):
                                    key, value = line.strip().split('=', 1)
                                    config[key] = value
                        return config
                except Exception as e:
                    logger.warning(f"Fehler beim Laden der Konfiguration {config_file}: {e}")
        
        return None
    
    def create_startup_scripts(self):
        """Startup-Skripte erstellen"""
        logger.info("Erstelle Startup-Skripte...")
        
        # Windows Batch-Skript
        if os.name == 'nt':
            batch_script = self.project_root / 'start_pos_system.bat'
            with open(batch_script, 'w', encoding='utf-8') as f:
                f.write('@echo off\n')
                f.write('echo Starte VALEO NeuroERP Kassensystem...\n')
                f.write('cd /d "%~dp0"\n')
                f.write('echo Starte Backend...\n')
                f.write('start "VALEO POS Backend" cmd /k "cd backend && python main.py"\n')
                f.write('timeout /t 5\n')
                f.write('echo Starte Frontend...\n')
                f.write('start "VALEO POS Frontend" cmd /k "cd frontend && npm run dev"\n')
                f.write('echo Kassensystem gestartet!\n')
                f.write('echo Backend: http://localhost:8000\n')
                f.write('echo Frontend: http://localhost:3000\n')
                f.write('pause\n')
            
            logger.info(f"Windows Startup-Skript erstellt: {batch_script}")
        
        # Linux/Mac Shell-Skript
        shell_script = self.project_root / 'start_pos_system.sh'
        with open(shell_script, 'w', encoding='utf-8') as f:
            f.write('#!/bin/bash\n')
            f.write('echo "Starte VALEO NeuroERP Kassensystem..."\n')
            f.write('cd "$(dirname "$0")"\n')
            f.write('echo "Starte Backend..."\n')
            f.write('cd backend && python main.py &\n')
            f.write('sleep 5\n')
            f.write('echo "Starte Frontend..."\n')
            f.write('cd ../frontend && npm run dev &\n')
            f.write('echo "Kassensystem gestartet!"\n')
            f.write('echo "Backend: http://localhost:8000"\n')
            f.write('echo "Frontend: http://localhost:3000"\n')
            f.write('wait\n')
        
        # Ausführbar machen
        os.chmod(shell_script, 0o755)
        logger.info(f"Shell Startup-Skript erstellt: {shell_script}")
    
    def create_documentation(self):
        """Dokumentation erstellen"""
        logger.info("Erstelle Dokumentation...")
        
        docs_dir = self.project_root / 'docs'
        docs_dir.mkdir(exist_ok=True)
        
        # Quick Start Guide
        quick_start = docs_dir / 'POS_QUICK_START.md'
        with open(quick_start, 'w', encoding='utf-8') as f:
            f.write('# VALEO NeuroERP Kassensystem - Quick Start\n\n')
            f.write('## Schnellstart\n\n')
            f.write('1. **System starten**\n')
            f.write('   ```bash\n')
            f.write('   # Windows\n')
            f.write('   start_pos_system.bat\n\n')
            f.write('   # Linux/Mac\n')
            f.write('   ./start_pos_system.sh\n')
            f.write('   ```\n\n')
            f.write('2. **Browser öffnen**\n')
            f.write('   - Frontend: http://localhost:3000\n')
            f.write('   - Backend API: http://localhost:8000\n')
            f.write('   - API Docs: http://localhost:8000/docs\n\n')
            f.write('3. **Kassensystem verwenden**\n')
            f.write('   - Im Dashboard auf "Kassensystem" Tab klicken\n')
            f.write('   - Artikel zum Warenkorb hinzufügen\n')
            f.write('   - Zahlung abschließen\n\n')
            f.write('## TSE-Simulator\n\n')
            f.write('Für Entwicklungszwecke wird ein TSE-Simulator verwendet:\n')
            f.write('- Simuliert echte TSE-Funktionalität\n')
            f.write('- Erstellt digitale Signaturen\n')
            f.write('- Audit-Trail für alle Transaktionen\n\n')
            f.write('## Support\n\n')
            f.write('- Dokumentation: `KASSENSYSTEM_DOKUMENTATION.md`\n')
            f.write('- Logs: `pos_setup.log`\n')
            f.write('- API: http://localhost:8000/docs\n')
        
        logger.info(f"Quick Start Guide erstellt: {quick_start}")
    
    def run_setup(self):
        """Vollständiges Setup ausführen"""
        logger.info("Starte VALEO NeuroERP Kassensystem Setup...")
        
        try:
            # Voraussetzungen prüfen
            if not self.check_prerequisites():
                logger.error("Voraussetzungen nicht erfüllt")
                return False
            
            # Backend-Setup
            if not self.setup_backend():
                logger.error("Backend-Setup fehlgeschlagen")
                return False
            
            # Frontend-Setup
            if not self.setup_frontend():
                logger.error("Frontend-Setup fehlgeschlagen")
                return False
            
            # Datenbank-Setup
            if not self.setup_database():
                logger.error("Datenbank-Setup fehlgeschlagen")
                return False
            
            # Startup-Skripte erstellen
            self.create_startup_scripts()
            
            # Dokumentation erstellen
            self.create_documentation()
            
            logger.info("=" * 50)
            logger.info("VALEO NeuroERP Kassensystem Setup erfolgreich!")
            logger.info("=" * 50)
            logger.info("")
            logger.info("Nächste Schritte:")
            logger.info("1. System starten: ./start_pos_system.sh (Linux/Mac) oder start_pos_system.bat (Windows)")
            logger.info("2. Browser öffnen: http://localhost:3000")
            logger.info("3. Im Dashboard auf 'Kassensystem' Tab klicken")
            logger.info("4. Dokumentation lesen: KASSENSYSTEM_DOKUMENTATION.md")
            logger.info("")
            logger.info("Viel Erfolg mit dem VALEO NeuroERP Kassensystem!")
            
            return True
            
        except Exception as e:
            logger.error(f"Setup fehlgeschlagen: {e}")
            return False

def main():
    """Hauptfunktion"""
    setup = POSSystemSetup()
    success = setup.run_setup()
    
    if success:
        print("\n✅ Setup erfolgreich abgeschlossen!")
        sys.exit(0)
    else:
        print("\n❌ Setup fehlgeschlagen!")
        sys.exit(1)

if __name__ == "__main__":
    main() 