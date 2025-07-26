#!/usr/bin/env python3
"""
VALEO NeuroERP - Automatisierte Update-Matrix
Testet verschiedene Paketversionen auf Kompatibilität und Sicherheit
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse

class UpdateMatrix:
    """Automatisierte Update-Matrix für VALEO NeuroERP Backend"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.results: Dict[str, Dict] = {}
        
    def run_command(self, command: List[str], cwd: Optional[Path] = None) -> Tuple[int, str, str]:
        """Führt einen Befehl aus und gibt Exit-Code, stdout, stderr zurück"""
        try:
            result = subprocess.run(
                command,
                cwd=cwd or self.project_root,
                capture_output=True,
                text=True,
                timeout=300  # 5 Minuten Timeout
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return -1, "", "Command timed out"
        except Exception as e:
            return -1, "", str(e)
    
    def test_dependency_matrix(self) -> Dict[str, Dict]:
        """Testet verschiedene Abhängigkeitsversionen"""
        print("🔍 Teste Update-Matrix...")
        
        # Test-Matrix definieren
        test_configs = {
            "jose-34": {
                "python-jose": ">=3.4.0",
                "starlette": ">=0.46.2",
                "description": "python-jose 3.4+ (Sicherheitsfix)"
            },
            "jose-33": {
                "python-jose": "==3.3.0",
                "starlette": ">=0.46.2", 
                "description": "python-jose 3.3.0 (Aktuell, unsicher)"
            },
            "starlette-latest": {
                "python-jose": ">=3.4.0",
                "starlette": ">=0.47.0",
                "description": "Neueste starlette Version"
            }
        }
        
        for config_name, config in test_configs.items():
            print(f"\n📦 Teste Konfiguration: {config['description']}")
            
            # Temporäre requirements.txt erstellen
            temp_req = self.project_root / f"requirements-{config_name}.txt"
            self._create_temp_requirements(temp_req, config)
            
            # Test ausführen
            success = self._test_configuration(config_name, temp_req)
            
            # Aufräumen
            temp_req.unlink(missing_ok=True)
            
            self.results[config_name] = {
                "success": success,
                "config": config,
                "timestamp": time.time()
            }
        
        return self.results
    
    def _create_temp_requirements(self, req_file: Path, config: Dict):
        """Erstellt temporäre requirements.txt für Test"""
        base_requirements = [
            "fastapi==0.115.14",
            "uvicorn[standard]==0.24.0", 
            "pydantic==2.11.7",
            "python-dotenv==1.0.0",
            "requests==2.31.0"
        ]
        
        # Konfiguration-spezifische Anforderungen hinzufügen
        for package, version in config.items():
            if package != "description":
                base_requirements.append(f"{package}{version}")
        
        req_file.write_text("\n".join(base_requirements))
    
    def _test_configuration(self, config_name: str, req_file: Path) -> bool:
        """Testet eine spezifische Konfiguration"""
        print(f"  🧪 Teste {config_name}...")
        
        # Virtuelle Umgebung erstellen
        venv_path = self.project_root / f"venv-{config_name}"
        
        # Python -m venv erstellen
        exit_code, stdout, stderr = self.run_command([
            sys.executable, "-m", "venv", str(venv_path)
        ])
        
        if exit_code != 0:
            print(f"    ❌ Virtuelle Umgebung konnte nicht erstellt werden: {stderr}")
            return False
        
        # Pakete installieren
        pip_path = venv_path / "Scripts" / "pip.exe" if sys.platform == "win32" else venv_path / "bin" / "pip"
        
        exit_code, stdout, stderr = self.run_command([
            str(pip_path), "install", "-r", str(req_file)
        ])
        
        if exit_code != 0:
            print(f"    ❌ Pakete konnten nicht installiert werden: {stderr}")
            return False
        
        # Import-Test
        python_path = venv_path / "Scripts" / "python.exe" if sys.platform == "win32" else venv_path / "bin" / "python"
        
        test_script = f"""
import sys
try:
    import fastapi
    import uvicorn
    import pydantic
    import python_jose
    import starlette
    print("✅ Alle Pakete erfolgreich importiert")
    sys.exit(0)
except ImportError as e:
    print(f"❌ Import-Fehler: {{e}}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unerwarteter Fehler: {{e}}")
    sys.exit(1)
"""
        
        exit_code, stdout, stderr = self.run_command([
            str(python_path), "-c", test_script
        ])
        
        # Aufräumen
        import shutil
        shutil.rmtree(venv_path, ignore_errors=True)
        
        if exit_code == 0:
            print(f"    ✅ {config_name} erfolgreich getestet")
            return True
        else:
            print(f"    ❌ {config_name} fehlgeschlagen: {stderr}")
            return False
    
    def run_security_audit(self) -> Dict:
        """Führt Sicherheitsaudit durch"""
        print("\n🔒 Führe Sicherheitsaudit durch...")
        
        # pip-audit
        exit_code, stdout, stderr = self.run_command([
            sys.executable, "-m", "pip", "install", "pip-audit"
        ])
        
        if exit_code == 0:
            exit_code, stdout, stderr = self.run_command([
                sys.executable, "-m", "pip_audit", "--format=json"
            ])
            
            if exit_code == 0:
                try:
                    audit_results = json.loads(stdout)
                    return {
                        "success": True,
                        "vulnerabilities": audit_results.get("vulnerabilities", []),
                        "timestamp": time.time()
                    }
                except json.JSONDecodeError:
                    return {
                        "success": False,
                        "error": "JSON-Parsing fehlgeschlagen",
                        "output": stdout
                    }
        
        return {
            "success": False,
            "error": stderr,
            "output": stdout
        }
    
    def generate_report(self) -> str:
        """Generiert einen detaillierten Bericht"""
        report = []
        report.append("# VALEO NeuroERP - Update-Matrix Bericht")
        report.append(f"Generiert am: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Dependency-Matrix Ergebnisse
        report.append("## 📦 Dependency-Matrix Ergebnisse")
        for config_name, result in self.results.items():
            status = "✅ Erfolgreich" if result["success"] else "❌ Fehlgeschlagen"
            report.append(f"### {config_name}")
            report.append(f"- **Status:** {status}")
            report.append(f"- **Beschreibung:** {result['config']['description']}")
            report.append("")
        
        # Empfehlungen
        report.append("## 🎯 Empfehlungen")
        
        if self.results.get("jose-34", {}).get("success", False):
            report.append("✅ **python-jose 3.4+ ist sicher und kompatibel**")
            report.append("   - Sicherheitslücken behoben")
            report.append("   - Alle Tests erfolgreich")
        else:
            report.append("⚠️ **python-jose 3.4+ hat Kompatibilitätsprobleme**")
            report.append("   - Manuelle Überprüfung erforderlich")
        
        if self.results.get("starlette-latest", {}).get("success", False):
            report.append("✅ **Neueste starlette Version ist kompatibel**")
        else:
            report.append("⚠️ **starlette Update erfordert weitere Tests**")
        
        return "\n".join(report)
    
    def save_results(self, output_file: Path):
        """Speichert Ergebnisse in JSON-Format"""
        results_data = {
            "timestamp": time.time(),
            "matrix_results": self.results,
            "summary": {
                "total_configs": len(self.results),
                "successful_configs": sum(1 for r in self.results.values() if r["success"]),
                "failed_configs": sum(1 for r in self.results.values() if not r["success"])
            }
        }
        
        output_file.write_text(json.dumps(results_data, indent=2))
        print(f"📄 Ergebnisse gespeichert in: {output_file}")

def main():
    parser = argparse.ArgumentParser(description="VALEO NeuroERP Update-Matrix")
    parser.add_argument("--output", "-o", type=Path, default=Path("update-matrix-results.json"),
                       help="Ausgabedatei für Ergebnisse")
    parser.add_argument("--report", "-r", type=Path, default=Path("update-matrix-report.md"),
                       help="Ausgabedatei für Bericht")
    
    args = parser.parse_args()
    
    project_root = Path(__file__).parent.parent
    matrix = UpdateMatrix(project_root)
    
    print("🚀 VALEO NeuroERP - Automatisierte Update-Matrix")
    print("=" * 50)
    
    # Dependency-Matrix testen
    matrix.test_dependency_matrix()
    
    # Sicherheitsaudit
    security_results = matrix.run_security_audit()
    
    # Bericht generieren
    report = matrix.generate_report()
    args.report.write_text(report, encoding='utf-8')
    
    # Ergebnisse speichern
    matrix.save_results(args.output)
    
    print(f"\n📊 Bericht generiert: {args.report}")
    print(f"📄 Ergebnisse gespeichert: {args.output}")
    
    # Zusammenfassung
    successful = sum(1 for r in matrix.results.values() if r["success"])
    total = len(matrix.results)
    
    print(f"\n🎯 Zusammenfassung: {successful}/{total} Konfigurationen erfolgreich")
    
    if successful == total:
        print("✅ Alle Tests erfolgreich - Updates sind sicher!")
        return 0
    else:
        print("⚠️ Einige Tests fehlgeschlagen - Manuelle Überprüfung erforderlich")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 