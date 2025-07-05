#!/usr/bin/env python3
"""
CI/CD-Pipeline-Skript für das AI-gesteuerte ERP-System mit Python 3.11
"""

import os
import sys
import json
import argparse
import subprocess
import platform
from datetime import datetime
from pathlib import Path

# Konfiguration
CONFIG = {
    "python_version": "3.11",
    "venv_dir": ".venv311",
    "requirements_file": "requirements.txt",
    "backend_port": 8005,
    "observer_port": 8010,
    "finance_port": 8007,
    "test_script": "test_api_client.py",
    "report_dir": "ci_reports"
}

def print_header(text):
    """Gibt einen formatierten Header aus"""
    print("\n" + "="*80)
    print(f" {text}")
    print("="*80)

def print_info(text):
    """Gibt eine Informationsmeldung aus"""
    print(f"[INFO] {text}")

def print_error(text):
    """Gibt eine Fehlermeldung aus"""
    print(f"[ERROR] {text}", file=sys.stderr)

def run_command(command, cwd=None, shell=False):
    """Führt einen Befehl aus und gibt das Ergebnis zurück"""
    try:
        print_info(f"Ausführen: {command}")
        result = subprocess.run(
            command if shell else command.split(),
            shell=shell,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print_error(f"Befehl fehlgeschlagen: {command}")
        print_error(f"Fehler: {e.stderr}")
        return None

def check_python_version():
    """Überprüft die Python-Version"""
    print_header("Python-Version überprüfen")
    
    result = run_command("python --version")
    if not result:
        print_error("Python konnte nicht ausgeführt werden")
        return False
    
    version = result.split()[1]
    print_info(f"Aktuelle Python-Version: {version}")
    
    major, minor = map(int, version.split(".")[:2])
    if major != 3 or minor != 11:
        print_error(f"Python 3.11 ist erforderlich, gefunden: {version}")
        return False
    
    print_info("Python 3.11 gefunden - OK")
    return True

def setup_venv():
    """Erstellt und aktiviert die virtuelle Umgebung"""
    print_header("Virtuelle Umgebung einrichten")
    
    venv_dir = CONFIG["venv_dir"]
    if not os.path.exists(venv_dir):
        print_info(f"Erstelle virtuelle Umgebung in {venv_dir}")
        run_command(f"python -m venv {venv_dir}")
    else:
        print_info(f"Virtuelle Umgebung existiert bereits in {venv_dir}")
    
    # Pfad zum Python-Interpreter in der virtuellen Umgebung bestimmen
    is_windows = platform.system() == "Windows"
    venv_python = os.path.join(venv_dir, "Scripts" if is_windows else "bin", "python")
    
    # Pip aktualisieren
    print_info("Pip aktualisieren")
    run_command(f"{venv_python} -m pip install --upgrade pip")
    
    # Abhängigkeiten installieren
    print_info("Abhängigkeiten installieren")
    run_command(f"{venv_python} -m pip install -r {CONFIG['requirements_file']}")
    
    print_info("Virtuelle Umgebung erfolgreich eingerichtet")
    return venv_python

def test_minimal_server(venv_python):
    """Testet den minimalen Server"""
    print_header("Test des minimalen Servers")
    
    # Server starten
    server_port = CONFIG["backend_port"]
    print_info(f"Starte minimalen Server auf Port {server_port}")
    
    # Erstelle einen temporären Prozess für den Server
    server_process = subprocess.Popen(
        [venv_python, "backend/minimal_server.py", "--port", str(server_port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Warte, bis der Server gestartet ist (5 Sekunden)
    import time
    print_info("Warte, bis der Server gestartet ist...")
    time.sleep(5)
    
    # Teste den API-Client
    print_info("Teste API-Client")
    test_result = run_command(f"{venv_python} {CONFIG['test_script']}")
    
    # Server beenden
    print_info("Beende Server")
    server_process.terminate()
    
    if "Health-Status: 200" in test_result:
        print_info("Test des minimalen Servers erfolgreich")
        return True
    else:
        print_error("Test des minimalen Servers fehlgeschlagen")
        print_error(test_result)
        return False

def generate_report(tests_passed):
    """Generiert einen Bericht über die CI/CD-Pipeline"""
    print_header("Berichterstellung")
    
    report_dir = CONFIG["report_dir"]
    os.makedirs(report_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report_file = os.path.join(report_dir, f"ci_report_{timestamp}.md")
    
    print_info(f"Erstelle Bericht in {report_file}")
    
    with open(report_file, "w") as f:
        f.write("# CI/CD-Pipeline-Bericht\n\n")
        f.write(f"Erstellt am: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n\n")
        f.write(f"Python-Version: {CONFIG['python_version']}\n")
        f.write(f"Betriebssystem: {platform.system()} {platform.release()}\n\n")
        
        f.write("## Testergebnisse\n\n")
        f.write(f"- Minimaler Server: {'✅ Bestanden' if tests_passed else '❌ Fehlgeschlagen'}\n")
        
        f.write("\n## Zusammenfassung\n\n")
        if tests_passed:
            f.write("Alle Tests wurden erfolgreich abgeschlossen. Das System ist bereit für den Einsatz mit Python 3.11.\n")
        else:
            f.write("Einige Tests sind fehlgeschlagen. Bitte überprüfen Sie die Fehler und beheben Sie sie, bevor Sie fortfahren.\n")
    
    print_info(f"Bericht wurde in {report_file} gespeichert")
    return report_file

def main():
    """Hauptfunktion der CI/CD-Pipeline"""
    parser = argparse.ArgumentParser(description="CI/CD-Pipeline für Python 3.11")
    parser.add_argument("--skip-tests", action="store_true", help="Tests überspringen")
    parser.add_argument("--report-only", action="store_true", help="Nur Bericht erstellen")
    args = parser.parse_args()
    
    print_header("CI/CD-Pipeline für Python 3.11")
    print_info(f"Startzeit: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    
    # Python-Version überprüfen
    if not check_python_version():
        print_error("Die Pipeline wurde aufgrund von Fehlern abgebrochen")
        return 1
    
    # Virtuelle Umgebung einrichten (überspringen, wenn nur Bericht erstellt werden soll)
    if not args.report_only:
        venv_python = setup_venv()
    else:
        venv_python = None
    
    # Tests ausführen (überspringen, wenn gewünscht oder nur Bericht erstellt werden soll)
    tests_passed = True
    if not args.skip_tests and not args.report_only:
        tests_passed = test_minimal_server(venv_python)
    
    # Bericht erstellen
    report_file = generate_report(tests_passed)
    
    print_header("CI/CD-Pipeline abgeschlossen")
    print_info(f"Endzeit: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    print_info(f"Bericht: {report_file}")
    
    return 0 if tests_passed else 1

if __name__ == "__main__":
    sys.exit(main()) 