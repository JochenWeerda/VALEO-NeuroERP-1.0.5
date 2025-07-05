#!/usr/bin/env python
"""
Projektstruktur-Optimierer für das ERP-System

Dieses Skript optimiert die Projektstruktur für zukünftige Erweiterungen und
ermöglicht die Erstellung neuer Feature-Templates.
"""

import os
import sys
import argparse
from pathlib import Path

# Füge das Projektverzeichnis zum Pythonpfad hinzu
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, str(current_dir))

try:
    # Versuche, den Moduloptimierer zu importieren
    from backend.utils.module_optimizer import optimize_project, create_feature
except ImportError:
    print("Fehler: Module Optimizer konnte nicht importiert werden.")
    print("Stelle sicher, dass das Skript im Projektroot ausgeführt wird.")
    sys.exit(1)


def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(
        description="Optimiert die Projektstruktur für zukünftige Erweiterungen."
    )
    parser.add_argument(
        "--dry-run", "-d",
        action="store_true",
        help="Simuliert die Optimierung ohne Änderungen vorzunehmen"
    )
    parser.add_argument(
        "--feature", "-f",
        help="Erstellt eine neue Feature-Struktur mit dem angegebenen Namen"
    )
    parser.add_argument(
        "--analyze", "-a",
        action="store_true",
        help="Analysiert die Projektstruktur und gibt Empfehlungen (erfordert analyze_structure.py)"
    )
    args = parser.parse_args()
    
    if args.analyze:
        try:
            # Importiere die Analysefunktionen
            from backend.utils.module_analyzer import analyze_project, print_analysis_report
            print("Analysiere Projektstruktur...")
            analysis = analyze_project()
            print_analysis_report(analysis)
        except ImportError:
            print("Fehler: Module Analyzer konnte nicht importiert werden.")
            print("Führe zuerst 'python analyze_structure.py' aus.")
            sys.exit(1)
    
    if args.feature:
        print(f"Erstelle Feature-Template: {args.feature}")
        changes = create_feature(args.feature, dry_run=args.dry_run)
        print(f"Feature {args.feature} {'würde erstellt werden' if args.dry_run else 'erstellt'}:")
        for change in changes:
            print(f"  - {change}")
    elif not args.analyze:
        print("Optimiere Projektstruktur...")
        changes = optimize_project(dry_run=args.dry_run)
        print(f"Projektstruktur {'würde optimiert werden' if args.dry_run else 'optimiert'}:")
        for change in changes:
            print(f"  - {change}")
    
    if args.dry_run:
        print("\nInfo: Dies war ein Testlauf. Keine Änderungen wurden vorgenommen.")
        print("Um die Änderungen tatsächlich durchzuführen, führen Sie das Skript ohne --dry-run aus.")


if __name__ == "__main__":
    main()