#!/usr/bin/env python
"""
Analyse der Modulstruktur des ERP-Systems

Dieses Skript analysiert die aktuelle Projektstruktur und gibt Empfehlungen für Optimierungen.
"""

import os
import sys
import argparse
from pathlib import Path

# Füge das Projektverzeichnis zum Pythonpfad hinzu
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, str(current_dir))

try:
    # Versuche, den Modulanalyzer zu importieren
    from backend.utils.module_analyzer import analyze_project, print_analysis_report
except ImportError:
    print("Fehler: Module Analyzer konnte nicht importiert werden.")
    print("Stelle sicher, dass das Skript im Projektroot ausgeführt wird.")
    sys.exit(1)


def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(
        description="Analysiert die Modulstruktur des ERP-Systems und gibt Empfehlungen."
    )
    parser.add_argument(
        "--output", "-o",
        help="Pfad zur Ausgabedatei (optional)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Ausführliche Ausgabe"
    )
    args = parser.parse_args()
    
    print("Analysiere Projektstruktur...")
    analysis = analyze_project()
    
    if args.output:
        # Ausgabe in Datei
        import json
        
        # Konvertiere Sets zu Listen für JSON-Serialisierung
        serializable_analysis = analysis.copy()
        serializable_analysis['dependencies'] = {
            k: list(v) for k, v in analysis['dependencies'].items()
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(serializable_analysis, f, indent=2, ensure_ascii=False)
        print(f"Analyse wurde in '{args.output}' gespeichert.")
    
    # Konsolenausgabe
    print_analysis_report(analysis)
    
    if args.verbose:
        # Zeige zusätzliche Details an
        print("\n=== DETAILLIERTE MODULINFORMATIONEN ===")
        for module_name, info in sorted(analysis['modules'].items()):
            print(f"\n{module_name}:")
            print(f"  Pfad: {info['path']}")
            print(f"  Paket: {info['package'] or '(root)'}")
            print(f"  Codezeilen: {info['loc']}")
            print(f"  Importe: {', '.join(info['imports'][:5])}" + 
                  (f" und {len(info['imports']) - 5} weitere..." if len(info['imports']) > 5 else ""))


if __name__ == "__main__":
    main() 