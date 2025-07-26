#!/usr/bin/env python3
"""
VALEO NeuroERP - Schneller Update-Check
Einfache und robuste Überprüfung der kritischen Sicherheitsupdates
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

def run_command(command: List[str]) -> tuple[int, str, str]:
    """Führt einen Befehl aus und gibt Exit-Code, stdout, stderr zurück"""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=60,
            encoding='utf-8',
            errors='replace'
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except Exception as e:
        return -1, "", str(e)

def check_package_version(package_name: str) -> Optional[str]:
    """Prüft die installierte Version eines Pakets"""
    exit_code, stdout, stderr = run_command([
        sys.executable, "-m", "pip", "show", package_name
    ])
    
    if exit_code == 0:
        for line in stdout.split('\n'):
            if line.startswith('Version:'):
                return line.split(':', 1)[1].strip()
    return None

def test_import(package_name: str) -> bool:
    """Testet ob ein Paket importiert werden kann"""
    test_script = f"""
try:
    import {package_name}
    print("SUCCESS")
except ImportError:
    print("IMPORT_ERROR")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
    
    exit_code, stdout, stderr = run_command([
        sys.executable, "-c", test_script
    ])
    
    return exit_code == 0 and "SUCCESS" in stdout

def check_security_vulnerabilities() -> Dict:
    """Prüft auf bekannte Sicherheitslücken"""
    print("🔒 Prüfe Sicherheitslücken...")
    
    # Kritische Pakete mit bekannten CVEs
    critical_packages = {
        "python-jose": {
            "current_version": check_package_version("python-jose"),
            "min_safe_version": "3.4.0",
            "cve": "CVE-2024-33663",
            "severity": "KRITISCH"
        },
        "starlette": {
            "current_version": check_package_version("starlette"),
            "min_safe_version": "0.47.0",
            "cve": "CVE-2024-47874", 
            "severity": "HOCH"
        }
    }
    
    results = {}
    for package, info in critical_packages.items():
        current = info["current_version"]
        min_safe = info["min_safe_version"]
        
        if current:
            # Einfache Versionsvergleich
            current_parts = [int(x) for x in current.split('.')]
            safe_parts = [int(x) for x in min_safe.split('.')]
            
            is_safe = current_parts >= safe_parts
            results[package] = {
                "current_version": current,
                "min_safe_version": min_safe,
                "is_safe": is_safe,
                "cve": info["cve"],
                "severity": info["severity"]
            }
        else:
            results[package] = {
                "current_version": "Nicht installiert",
                "min_safe_version": min_safe,
                "is_safe": False,
                "cve": info["cve"],
                "severity": info["severity"]
            }
    
    return results

def test_compatibility_updates() -> Dict:
    """Testet Kompatibilität mit sicheren Versionen"""
    print("🧪 Teste Kompatibilität...")
    
    # Test-Konfigurationen
    test_configs = {
        "python-jose-34": {
            "package": "python-jose>=3.4.0",
            "description": "python-jose 3.4+ (Sicherheitsfix)"
        },
        "starlette-latest": {
            "package": "starlette>=0.47.0", 
            "description": "starlette 0.47+ (Sicherheitsfix)"
        }
    }
    
    results = {}
    for config_name, config in test_configs.items():
        print(f"  📦 Teste {config['description']}...")
        
        # Temporäre Installation testen
        exit_code, stdout, stderr = run_command([
            sys.executable, "-m", "pip", "install", "--dry-run", config["package"]
        ])
        
        # Import-Test (falls Paket bereits installiert)
        package_name = config["package"].split(">=")[0].split("==")[0]
        import_works = test_import(package_name)
        
        results[config_name] = {
            "description": config["description"],
            "dry_run_success": exit_code == 0,
            "import_works": import_works,
            "compatible": exit_code == 0 or import_works
        }
    
    return results

def generate_report(security_results: Dict, compatibility_results: Dict) -> str:
    """Generiert einen Bericht"""
    report = []
    report.append("# VALEO NeuroERP - Schneller Update-Check")
    report.append(f"Generiert am: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    
    # Sicherheitsergebnisse
    report.append("## 🔒 Sicherheitsstatus")
    for package, info in security_results.items():
        status = "✅ SICHER" if info["is_safe"] else "❌ UNSICHER"
        report.append(f"### {package}")
        report.append(f"- **Status:** {status}")
        report.append(f"- **Aktuelle Version:** {info['current_version']}")
        report.append(f"- **Min. sichere Version:** {info['min_safe_version']}")
        report.append(f"- **CVE:** {info['cve']} ({info['severity']})")
        report.append("")
    
    # Kompatibilitätsergebnisse
    report.append("## 🧪 Kompatibilitätstests")
    for config_name, info in compatibility_results.items():
        status = "✅ KOMPATIBEL" if info["compatible"] else "❌ INKOMPATIBEL"
        report.append(f"### {config_name}")
        report.append(f"- **Status:** {status}")
        report.append(f"- **Beschreibung:** {info['description']}")
        report.append(f"- **Dry-Run:** {'✅' if info['dry_run_success'] else '❌'}")
        report.append(f"- **Import-Test:** {'✅' if info['import_works'] else '❌'}")
        report.append("")
    
    # Empfehlungen
    report.append("## 🎯 Empfehlungen")
    
    unsafe_packages = [p for p, info in security_results.items() if not info["is_safe"]]
    if unsafe_packages:
        report.append("### ⚠️ Sofortige Updates erforderlich:")
        for package in unsafe_packages:
            info = security_results[package]
            report.append(f"- **{package}** auf Version {info['min_safe_version']}+ aktualisieren")
        report.append("")
        report.append("### 🔧 Update-Befehle:")
        for package in unsafe_packages:
            info = security_results[package]
            report.append(f"```bash")
            report.append(f"pip install {package}>={info['min_safe_version']}")
            report.append(f"```")
    else:
        report.append("✅ **Alle kritischen Pakete sind auf sicheren Versionen!**")
    
    return "\n".join(report)

def main():
    print("🚀 VALEO NeuroERP - Schneller Update-Check")
    print("=" * 50)
    
    # Sicherheitsprüfung
    security_results = check_security_vulnerabilities()
    
    # Kompatibilitätstests
    compatibility_results = test_compatibility_updates()
    
    # Bericht generieren
    report = generate_report(security_results, compatibility_results)
    
    # Bericht speichern
    report_file = Path("quick-update-report.md")
    report_file.write_text(report, encoding='utf-8')
    
    # Ergebnisse speichern
    results_data = {
        "timestamp": time.time(),
        "security_results": security_results,
        "compatibility_results": compatibility_results,
        "summary": {
            "unsafe_packages": len([p for p, info in security_results.items() if not info["is_safe"]]),
            "total_critical_packages": len(security_results)
        }
    }
    
    results_file = Path("quick-update-results.json")
    results_file.write_text(json.dumps(results_data, indent=2), encoding='utf-8')
    
    print(f"\n📊 Bericht generiert: {report_file}")
    print(f"📄 Ergebnisse gespeichert: {results_file}")
    
    # Zusammenfassung
    unsafe_count = results_data["summary"]["unsafe_packages"]
    total_count = results_data["summary"]["total_critical_packages"]
    
    print(f"\n🎯 Zusammenfassung: {unsafe_count}/{total_count} kritische Pakete unsicher")
    
    if unsafe_count == 0:
        print("✅ Alle kritischen Pakete sind sicher!")
        return 0
    else:
        print("⚠️ Sicherheitsupdates erforderlich!")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 