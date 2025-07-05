"""
Modul-Analyse-Werkzeug

Dieses Modul analysiert die Struktur des Projekts und gibt Empfehlungen für Optimierungen.
"""

import os
import sys
import inspect
import importlib
import pkgutil
import warnings
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional, Any
from collections import defaultdict

# Versuche, das Pfadregister zu importieren
try:
    from backend.core.path_registry import get_registry
except ImportError:
    try:
        from core.path_registry import get_registry
    except ImportError:
        # Fallback ohne Pfadregister
        def get_registry():
            return None


class ModuleAnalyzer:
    """Analysiert die Modulstruktur des Projekts"""
    
    def __init__(self, root_dir: Optional[str] = None):
        """Initialisiere den Modul-Analyzer
        
        Args:
            root_dir: Wurzelverzeichnis des Projekts (optional)
        """
        self.registry = get_registry()
        
        if root_dir:
            self.root_dir = Path(root_dir)
        elif self.registry:
            self.root_dir = self.registry.get_path('root')
        else:
            # Versuche, das Wurzelverzeichnis zu ermitteln
            current_file = Path(inspect.getfile(inspect.currentframe()))
            self.root_dir = current_file.parent.parent.parent
        
        self.backend_dir = self.root_dir / 'backend'
        
        # Datenstrukturen für die Analyse
        self.modules = {}
        self.dependencies = defaultdict(set)
        self.import_errors = defaultdict(list)
        self.circular_deps = []
        self.module_counts = defaultdict(int)
        self.file_counts = defaultdict(int)
    
    def analyze(self) -> Dict[str, Any]:
        """Führe eine vollständige Analyse durch
        
        Returns:
            Dictionary mit Analyseergebnissen
        """
        self._scan_modules()
        self._analyze_dependencies()
        self._detect_circular_dependencies()
        self._count_modules_and_files()
        
        return {
            'modules': self.modules,
            'dependencies': dict(self.dependencies),
            'import_errors': dict(self.import_errors),
            'circular_dependencies': self.circular_deps,
            'module_counts': dict(self.module_counts),
            'file_counts': dict(self.file_counts),
            'recommendations': self._generate_recommendations()
        }
    
    def _scan_modules(self) -> None:
        """Scanne alle Module im Projekt"""
        if not self.backend_dir.exists():
            warnings.warn(f"Backend-Verzeichnis nicht gefunden: {self.backend_dir}")
            return
        
        # Füge das Wurzelverzeichnis zum Pythonpfad hinzu
        sys.path.insert(0, str(self.root_dir))
        sys.path.insert(0, str(self.backend_dir))
        
        for root, dirs, files in os.walk(str(self.backend_dir)):
            # Ignoriere __pycache__ und andere versteckte Verzeichnisse
            dirs[:] = [d for d in dirs if not d.startswith('__') and not d.startswith('.')]
            
            for file in files:
                if file.endswith('.py') and not file.startswith('__'):
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(self.backend_dir)
                    
                    # Bestimme den Modulnamen
                    parts = list(rel_path.parts)
                    if parts[-1] == '__init__.py':
                        parts.pop()  # Entferne __init__.py
                    else:
                        parts[-1] = parts[-1].replace('.py', '')
                    
                    module_name = '.'.join(parts)
                    
                    # Speichere Modulinformationen
                    self.modules[module_name] = {
                        'path': str(file_path),
                        'is_package': file == '__init__.py',
                        'package': '.'.join(parts[:-1]) if parts[:-1] else None,
                        'imports': [],
                        'loc': self._count_loc(file_path)
                    }
    
    def _analyze_dependencies(self) -> None:
        """Analysiere die Abhängigkeiten zwischen Modulen"""
        for module_name, info in self.modules.items():
            try:
                # Versuche, das Modul zu importieren
                if info['is_package']:
                    module = importlib.import_module(module_name)
                else:
                    module = importlib.import_module(module_name)
                
                # Analysiere die Importe
                imports = []
                
                for name, obj in inspect.getmembers(module):
                    if inspect.ismodule(obj):
                        imports.append(obj.__name__)
                
                # Filtere nur Projektimporte
                project_imports = [imp for imp in imports if imp.startswith('backend.') or not '.' in imp]
                
                self.modules[module_name]['imports'] = project_imports
                
                # Aktualisiere Abhängigkeiten
                for imp in project_imports:
                    self.dependencies[module_name].add(imp)
            
            except ImportError as e:
                self.import_errors[module_name].append(str(e))
    
    def _detect_circular_dependencies(self) -> None:
        """Erkennt zirkuläre Abhängigkeiten zwischen Modulen"""
        visited = set()
        path = []
        
        def dfs(node):
            if node in path:
                # Zyklus gefunden
                cycle = path[path.index(node):] + [node]
                self.circular_deps.append(cycle)
                return
            
            if node in visited:
                return
            
            visited.add(node)
            path.append(node)
            
            for neighbor in self.dependencies.get(node, []):
                dfs(neighbor)
            
            path.pop()
        
        for module in self.modules:
            dfs(module)
    
    def _count_modules_and_files(self) -> None:
        """Zählt Module und Dateien pro Paket"""
        for module_name, info in self.modules.items():
            parts = module_name.split('.')
            
            # Zähle Module pro Paketebene
            for i in range(len(parts)):
                pkg = '.'.join(parts[:i+1])
                self.module_counts[pkg] += 1
            
            # Zähle Dateien pro Verzeichnis
            pkg_dir = info['package'] if info['package'] else ''
            self.file_counts[pkg_dir] += 1
    
    def _count_loc(self, file_path: Path) -> int:
        """Zählt die Codezeilen in einer Datei
        
        Args:
            file_path: Pfad zur Datei
            
        Returns:
            Anzahl der Codezeilen
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Entferne leere Zeilen und Kommentare
            code_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
            return len(code_lines)
        except Exception:
            return 0
    
    def _generate_recommendations(self) -> List[str]:
        """Generiert Empfehlungen zur Optimierung der Modulstruktur
        
        Returns:
            Liste von Empfehlungen
        """
        recommendations = []
        
        # Überprüfe auf große Module
        large_modules = {name: info for name, info in self.modules.items() if info['loc'] > 300}
        if large_modules:
            recommendations.append(
                f"Große Module aufteilen: {', '.join(large_modules.keys())}. "
                f"Module mit mehr als 300 Zeilen sollten in kleinere Module aufgeteilt werden."
            )
        
        # Überprüfe auf übermäßig große Pakete
        large_packages = {pkg: count for pkg, count in self.file_counts.items() if count > 10 and pkg}
        if large_packages:
            recommendations.append(
                f"Große Pakete strukturieren: {', '.join(large_packages.keys())}. "
                f"Pakete mit mehr als 10 Dateien sollten in Unterpakete strukturiert werden."
            )
        
        # Überprüfe auf viele Abhängigkeiten
        high_coupling = {name: deps for name, deps in self.dependencies.items() if len(deps) > 8}
        if high_coupling:
            recommendations.append(
                f"Hohe Kopplung reduzieren: {', '.join(high_coupling.keys())}. "
                f"Module mit mehr als 8 Abhängigkeiten sollten refaktoriert werden."
            )
        
        # Behandle zirkuläre Abhängigkeiten
        if self.circular_deps:
            cycles = [' -> '.join(cycle) for cycle in self.circular_deps[:3]]
            recommendations.append(
                f"Zirkuläre Abhängigkeiten auflösen: {'; '.join(cycles)}. "
                f"Zirkuläre Abhängigkeiten führen zu schwer wartbarem Code."
            )
        
        # Überprüfe Import-Fehler
        if self.import_errors:
            error_modules = list(self.import_errors.keys())[:5]
            recommendations.append(
                f"Import-Fehler beheben: {', '.join(error_modules)}. "
                f"Diese Module können nicht korrekt importiert werden."
            )
        
        # Allgemeine Empfehlungen für die Zukunft
        recommendations.append(
            "Modulstruktur für Erweiterungen: Verwenden Sie ein klares Paketschema mit "
            "feature-basierten Unterpaketen für zukünftige Erweiterungen."
        )
        
        recommendations.append(
            "Trennung von Benutzeroberfläche und Geschäftslogik: Stellen Sie sicher, dass API-Endpunkte "
            "und Geschäftslogik in separaten Modulen implementiert sind."
        )
        
        recommendations.append(
            "Zentrale Konfiguration: Verwenden Sie das Pfadregister und den Import-Handler für alle "
            "zukünftigen Module, um Importprobleme zu vermeiden."
        )
        
        return recommendations


def analyze_project(root_dir: Optional[str] = None) -> Dict[str, Any]:
    """Analysiert die Projektstruktur und gibt Empfehlungen
    
    Args:
        root_dir: Wurzelverzeichnis des Projekts (optional)
        
    Returns:
        Dictionary mit Analyseergebnissen
    """
    analyzer = ModuleAnalyzer(root_dir)
    return analyzer.analyze()


def print_analysis_report(analysis: Dict[str, Any]) -> None:
    """Gibt einen Analysebericht aus
    
    Args:
        analysis: Analyseergebnisse
    """
    print("=== MODULSTRUKTUR-ANALYSE ===")
    print(f"Gefundene Module: {len(analysis['modules'])}")
    
    print("\n--- MODULSTATISTIKEN ---")
    sorted_modules = sorted(analysis['module_counts'].items(), key=lambda x: x[1], reverse=True)
    for module, count in sorted_modules[:10]:
        print(f"{module}: {count} Module")
    
    print("\n--- VERZEICHNISSTATISTIKEN ---")
    sorted_dirs = sorted(analysis['file_counts'].items(), key=lambda x: x[1], reverse=True)
    for dir_name, count in sorted_dirs[:10]:
        dir_display = dir_name if dir_name else "(root)"
        print(f"{dir_display}: {count} Dateien")
    
    if analysis['circular_dependencies']:
        print("\n--- ZIRKULÄRE ABHÄNGIGKEITEN ---")
        for cycle in analysis['circular_dependencies'][:5]:
            print(" -> ".join(cycle))
    
    if analysis['import_errors']:
        print("\n--- IMPORT-FEHLER ---")
        for module, errors in list(analysis['import_errors'].items())[:5]:
            print(f"{module}: {errors[0]}")
    
    print("\n--- EMPFEHLUNGEN ---")
    for i, rec in enumerate(analysis['recommendations'], 1):
        print(f"{i}. {rec}")


if __name__ == "__main__":
    # Wenn direkt ausgeführt, analysiere das aktuelle Projekt
    analysis = analyze_project()
    print_analysis_report(analysis) 