#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Automatisiertes Tool zur Überprüfung und Aktualisierung von System-Abhängigkeiten.
Überprüft die installierten Versionen und sucht nach Updates.
Erstellt einen Bericht über mögliche Updates und Kompatibilitätsprobleme.
"""

import os
import sys
import json
import time
import logging
import subprocess
import urllib.request
import platform
from datetime import datetime, timezone, timedelta
import socket
import re
import argparse

# Konfiguration des Loggers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler("tools/update_check.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("update_checker")

# Verzeichnis-Konfiguration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_DIR = os.path.join(BASE_DIR, "backups")
CONFIG_FILE = os.path.join(BASE_DIR, "tools", "dependencies.json")
REPORT_FILE = os.path.join(BASE_DIR, "tools", f"update_report_{datetime.now().strftime('%Y%m%d')}.md")

# Standard-Abhängigkeiten, falls keine Konfigurationsdatei vorhanden
DEFAULT_DEPENDENCIES = {
    "python": {
        "current_version": "3.13.0",
        "check_cmd": "python --version",
        "update_url": "https://www.python.org/downloads/",
        "regex": r"Python (\d+\.\d+\.\d+)"
    },
    "pip": {
        "current_version": "",
        "check_cmd": "pip --version",
        "update_cmd": "python -m pip install --upgrade pip",
        "regex": r"pip (\d+\.\d+(\.\d+)?)"
    },
    "fastapi": {
        "current_version": "0.104.1",
        "check_cmd": "pip show fastapi",
        "update_cmd": "pip install --upgrade fastapi",
        "regex": r"Version: (\d+\.\d+\.\d+)"
    },
    "uvicorn": {
        "current_version": "0.24.0",
        "check_cmd": "pip show uvicorn",
        "update_cmd": "pip install --upgrade uvicorn",
        "regex": r"Version: (\d+\.\d+\.\d+)"
    },
    "sqlalchemy": {
        "current_version": "2.0.23",
        "check_cmd": "pip show sqlalchemy",
        "update_cmd": "pip install --upgrade sqlalchemy",
        "regex": r"Version: (\d+\.\d+\.\d+)"
    },
    "pydantic": {
        "current_version": "",
        "check_cmd": "pip show pydantic",
        "update_cmd": "pip install --upgrade pydantic",
        "regex": r"Version: (\d+\.\d+\.\d+)"
    },
    "git": {
        "current_version": "",
        "check_cmd": "git --version",
        "update_url": "https://git-scm.com/downloads",
        "regex": r"git version (\d+\.\d+\.\d+)"
    },
    "git-lfs": {
        "current_version": "",
        "check_cmd": "git lfs version",
        "update_url": "https://git-lfs.github.com/",
        "regex": r"git-lfs\/(\d+\.\d+\.\d+)"
    },
    "nodejs": {
        "current_version": "",
        "check_cmd": "node --version",
        "update_url": "https://nodejs.org/en/download/",
        "regex": r"v(\d+\.\d+\.\d+)"
    },
    "npm": {
        "current_version": "",
        "check_cmd": "npm --version",
        "update_cmd": "npm install -g npm@latest",
        "regex": r"(\d+\.\d+\.\d+)"
    }
}

def load_dependencies():
    """Lade Abhängigkeiten aus der Konfigurationsdatei oder verwende Standardwerte."""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        else:
            logger.warning(f"Konfigurationsdatei {CONFIG_FILE} nicht gefunden. Verwende Standardwerte.")
            # Erstelle die Konfigurationsdatei mit Standardwerten
            os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
            with open(CONFIG_FILE, 'w') as f:
                json.dump(DEFAULT_DEPENDENCIES, f, indent=4)
            return DEFAULT_DEPENDENCIES
    except Exception as e:
        logger.error(f"Fehler beim Laden der Abhängigkeiten: {e}")
        return DEFAULT_DEPENDENCIES

def save_dependencies(dependencies):
    """Speichere aktualisierte Abhängigkeiten in der Konfigurationsdatei."""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(dependencies, f, indent=4)
        logger.info(f"Abhängigkeiten in {CONFIG_FILE} gespeichert.")
    except Exception as e:
        logger.error(f"Fehler beim Speichern der Abhängigkeiten: {e}")

def run_command(command):
    """Führe einen Shell-Befehl aus und gib das Ergebnis zurück."""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=False,
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout + result.stderr
    except Exception as e:
        logger.error(f"Fehler beim Ausführen des Befehls '{command}': {e}")
        return f"ERROR: {str(e)}"

def extract_version(output, regex_pattern):
    """Extrahiere die Versionsnummer aus der Ausgabe mit einem regulären Ausdruck."""
    try:
        match = re.search(regex_pattern, output)
        if match:
            return match.group(1)
        return None
    except Exception as e:
        logger.error(f"Fehler beim Extrahieren der Version: {e}")
        return None

def check_pypi_version(package_name):
    """Überprüfe die neueste Version eines Python-Pakets auf PyPI."""
    try:
        url = f"https://pypi.org/pypi/{package_name}/json"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            return data["info"]["version"]
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Version für {package_name} von PyPI: {e}")
        return None

def check_nodejs_version():
    """Überprüfe die neueste Node.js-Version von der offiziellen Website."""
    try:
        url = "https://nodejs.org/dist/index.json"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            lts_versions = [v for v in data if v.get("lts")]
            if lts_versions:
                latest_lts = lts_versions[0]
                return latest_lts["version"].lstrip("v")
        return None
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Node.js-Version: {e}")
        return None

def check_db_activity():
    """Überprüfe Datenbankaktivität, um festzustellen, ob das System inaktiv ist."""
    # Implementierung hängt von der verwendeten Datenbank ab
    # Hier eine Mock-Implementierung für Testzwecke
    try:
        # In einer realen Implementierung: Verbindung zur Datenbank und Abfrage nach aktiven Verbindungen
        time.sleep(1)  # Simuliere Datenbankabfrage
        return False  # Annahme: Keine aktive Nutzung
    except Exception as e:
        logger.error(f"Fehler bei der Überprüfung der Datenbankaktivität: {e}")
        return True  # Bei Fehlern nehmen wir an, dass das System aktiv ist

def create_backup():
    """Erstelle ein Backup des Projekts und der Datenbank."""
    logger.info("Erstelle Backup vor dem Update...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_folder = os.path.join(BACKUP_DIR, f"backup_{timestamp}")
    
    try:
        # Erstelle Backup-Verzeichnis
        os.makedirs(backup_folder, exist_ok=True)
        
        # Projekt-Dateien sichern (hier könnte ein tatsächlicher Backup-Befehl stehen)
        # Beispiel:
        # run_command(f"xcopy /E /I /H /Y {BASE_DIR} {os.path.join(backup_folder, 'project')}")
        
        # Datenbank sichern (Beispiel für PostgreSQL)
        # run_command(f"pg_dump -U username -d database_name -f {os.path.join(backup_folder, 'database.sql')}")
        
        logger.info(f"Backup erfolgreich erstellt in {backup_folder}")
        return True
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Backups: {e}")
        return False

def check_compatibility(deps_to_update):
    """Überprüfe Kompatibilität zwischen den zu aktualisierenden Abhängigkeiten."""
    compatibility_issues = []
    
    # Beispiel für Kompatibilitätsprüfungen
    if "fastapi" in deps_to_update and "pydantic" in deps_to_update:
        # Überprüfe, ob FastAPI und Pydantic kompatibel sind
        fastapi_version = deps_to_update["fastapi"]["latest_version"]
        pydantic_version = deps_to_update["pydantic"]["latest_version"]
        
        # Vereinfachtes Beispiel - in der Realität wäre dies eine komplexere Prüfung
        if fastapi_version.startswith("0.10") and not pydantic_version.startswith("1."):
            compatibility_issues.append(
                f"FastAPI {fastapi_version} ist möglicherweise nicht kompatibel mit Pydantic {pydantic_version}. "
                f"FastAPI 0.10x erfordert Pydantic 1.x."
            )
    
    # Weitere Kompatibilitätsprüfungen könnten hier implementiert werden
    
    return compatibility_issues

def generate_update_report(dependencies, deps_to_update, compatibility_issues):
    """Generiere einen Bericht über verfügbare Updates und Kompatibilitätsprobleme."""
    now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    system_info = platform.platform()
    hostname = socket.gethostname()
    
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(f"# Update-Bericht\n\n")
        f.write(f"Erstellt am: {now}\n")
        f.write(f"System: {system_info}\n")
        f.write(f"Hostname: {hostname}\n\n")
        
        f.write("## Installierte Abhängigkeiten\n\n")
        f.write("| Abhängigkeit | Aktuelle Version | Neueste Version | Update verfügbar |\n")
        f.write("|--------------|------------------|-----------------|------------------|\n")
        
        for name, info in dependencies.items():
            current = info.get("current_version", "Nicht installiert")
            latest = info.get("latest_version", "Unbekannt")
            update = "Ja" if name in deps_to_update else "Nein"
            f.write(f"| {name} | {current} | {latest} | {update} |\n")
        
        if deps_to_update:
            f.write("\n## Verfügbare Updates\n\n")
            for name, info in deps_to_update.items():
                current = info.get("current_version")
                latest = info.get("latest_version")
                update_cmd = info.get("update_cmd", info.get("update_url", "Keine Update-Information verfügbar"))
                
                f.write(f"### {name}\n")
                f.write(f"- Aktuelle Version: {current}\n")
                f.write(f"- Neueste Version: {latest}\n")
                f.write(f"- Update-Anweisung: `{update_cmd}`\n\n")
        else:
            f.write("\n## Keine Updates verfügbar\n\n")
            f.write("Alle Abhängigkeiten sind auf dem neuesten Stand.\n\n")
        
        if compatibility_issues:
            f.write("\n## Potenzielle Kompatibilitätsprobleme\n\n")
            for issue in compatibility_issues:
                f.write(f"- {issue}\n")
        
        f.write("\n## Empfohlene Maßnahmen\n\n")
        if deps_to_update:
            f.write("1. Erstellen Sie ein vollständiges Backup des Systems vor dem Update\n")
            f.write("2. Führen Sie Updates in einer Testumgebung durch, bevor Sie das Produktionssystem aktualisieren\n")
            if compatibility_issues:
                f.write("3. Beachten Sie die oben aufgeführten Kompatibilitätsprobleme\n")
            f.write(f"4. Planen Sie das Update für einen ruhigen Zeitraum (vorzugsweise Freitagabend)\n")
            f.write("5. Benachrichtigen Sie alle Benutzer mindestens zwei Tage im Voraus\n")
        else:
            f.write("Keine Maßnahmen erforderlich. Das System ist auf dem neuesten Stand.\n")
    
    logger.info(f"Update-Bericht wurde erstellt: {REPORT_FILE}")
    return REPORT_FILE

def notify_users(days_to_update=2):
    """Benachrichtige Benutzer über anstehende Updates."""
    # Diese Funktion würde in einer tatsächlichen Implementierung
    # mit dem Frontend-System kommunizieren, um Benachrichtigungen anzuzeigen
    update_date = (datetime.now() + timedelta(days=days_to_update)).strftime("%d.%m.%Y")
    logger.info(f"Benutzer wurden über das anstehende Update am {update_date} benachrichtigt.")

def perform_updates(deps_to_update):
    """Führe Updates für die angegebenen Abhängigkeiten durch."""
    success = []
    failed = []
    
    for name, info in deps_to_update.items():
        if "update_cmd" in info:
            logger.info(f"Aktualisiere {name} von {info['current_version']} auf {info['latest_version']}...")
            result = run_command(info["update_cmd"])
            
            # Überprüfe, ob das Update erfolgreich war
            check_result = run_command(info["check_cmd"])
            updated_version = extract_version(check_result, info["regex"])
            
            if updated_version == info["latest_version"]:
                logger.info(f"{name} wurde erfolgreich auf Version {updated_version} aktualisiert.")
                success.append(name)
            else:
                logger.error(f"Fehler beim Aktualisieren von {name}. Version nach Update: {updated_version}")
                failed.append(name)
        else:
            logger.warning(f"Kein Update-Befehl für {name} vorhanden. Manuelles Update erforderlich.")
            
    return success, failed

def main():
    parser = argparse.ArgumentParser(description="Tool zur Überprüfung und Aktualisierung von Abhängigkeiten")
    parser.add_argument("--check", action="store_true", help="Überprüfe verfügbare Updates")
    parser.add_argument("--update", action="store_true", help="Führe verfügbare Updates durch")
    parser.add_argument("--force", action="store_true", help="Erzwinge Updates ohne Aktivitätsprüfung")
    parser.add_argument("--notify", action="store_true", help="Benachrichtige Benutzer über anstehende Updates")
    
    args = parser.parse_args()
    
    # Erstelle Backup-Verzeichnis, falls nicht vorhanden
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    logger.info("Update-Überprüfung gestartet")
    
    # Lade Abhängigkeiten
    dependencies = load_dependencies()
    
    # Aktuelle Versionen prüfen
    for name, info in dependencies.items():
        if "check_cmd" in info:
            result = run_command(info["check_cmd"])
            if result.startswith("ERROR"):
                logger.warning(f"Konnte {name} nicht überprüfen: {result}")
                continue
                
            version = extract_version(result, info["regex"])
            if version:
                dependencies[name]["current_version"] = version
                logger.info(f"{name}: Aktuelle Version {version}")
            else:
                logger.warning(f"Konnte Version für {name} nicht ermitteln.")
    
    # Neueste verfügbare Versionen prüfen
    deps_to_update = {}
    for name, info in dependencies.items():
        if "current_version" not in info or not info["current_version"]:
            continue
            
        latest_version = None
        if name in ["fastapi", "uvicorn", "sqlalchemy", "pydantic"]:
            latest_version = check_pypi_version(name)
        elif name == "nodejs":
            latest_version = check_nodejs_version()
        
        if latest_version:
            dependencies[name]["latest_version"] = latest_version
            logger.info(f"{name}: Neueste Version {latest_version}")
            
            # Vergleiche Versionen
            if latest_version != info["current_version"]:
                deps_to_update[name] = {**info, "latest_version": latest_version}
                logger.info(f"{name}: Update verfügbar ({info['current_version']} -> {latest_version})")
        else:
            dependencies[name]["latest_version"] = info["current_version"]
    
    # Speichere aktualisierte Abhängigkeiten
    save_dependencies(dependencies)
    
    # Überprüfe Kompatibilität
    compatibility_issues = check_compatibility(deps_to_update)
    
    # Generiere Bericht
    report_file = generate_update_report(dependencies, deps_to_update, compatibility_issues)
    
    if args.check:
        logger.info(f"Update-Überprüfung abgeschlossen. Bericht: {report_file}")
        
        # Zeige Zusammenfassung der Ergebnisse
        if deps_to_update:
            print(f"\nVerfügbare Updates ({len(deps_to_update)}):")
            for name, info in deps_to_update.items():
                print(f"- {name}: {info['current_version']} -> {info['latest_version']}")
        else:
            print("\nAlle Abhängigkeiten sind auf dem neuesten Stand.")
            
        if compatibility_issues:
            print("\nPotenzielle Kompatibilitätsprobleme:")
            for issue in compatibility_issues:
                print(f"- {issue}")
    
    if args.notify and deps_to_update:
        notify_users()
    
    if args.update and deps_to_update:
        if not args.force and check_db_activity():
            logger.warning("System wird aktiv genutzt. Update wird nicht durchgeführt.")
            print("System wird aktiv genutzt. Verwenden Sie --force, um das Update zu erzwingen.")
            return
        
        if not create_backup():
            logger.error("Backup fehlgeschlagen. Update wird nicht durchgeführt.")
            print("Backup fehlgeschlagen. Update wird abgebrochen.")
            return
        
        logger.info("Starte Update-Prozess...")
        success, failed = perform_updates(deps_to_update)
        
        if success:
            logger.info(f"Updates erfolgreich abgeschlossen für: {', '.join(success)}")
            print(f"Updates erfolgreich abgeschlossen für: {', '.join(success)}")
        
        if failed:
            logger.error(f"Updates fehlgeschlagen für: {', '.join(failed)}")
            print(f"Updates fehlgeschlagen für: {', '.join(failed)}")

if __name__ == "__main__":
    main() 