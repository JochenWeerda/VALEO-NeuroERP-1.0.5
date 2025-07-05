"""
Zentrales Pfadregister für das ERP-System

Dieses Modul verwaltet alle Pfade innerhalb des Systems und bietet eine zentrale
Stelle für die Pfadauflösung zur Laufzeit.
"""

import os
import sys
import inspect
from typing import Dict, Optional, Union, Callable
from pathlib import Path


class PathRegistry:
    """Zentrales Register für alle Pfade im System"""
    
    _instance = None
    
    def __new__(cls):
        """Singleton-Pattern implementieren"""
        if cls._instance is None:
            cls._instance = super(PathRegistry, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialisiere das Pfadregister"""
        self._paths = {}
        self._root_dir = None
        self._modules = {}
        self._handlers = {}
        
        # Bestimme Root-Verzeichnis
        self._detect_root_directory()
        
        # Registriere Basispfade
        self.register_base_paths()
    
    def _detect_root_directory(self):
        """Ermittle das Root-Verzeichnis des Projekts"""
        # Aktuelles Verzeichnis des Skripts
        current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        
        # Suche nach dem backend-Verzeichnis und dann nach dem Projektroot
        parent_dir = current_dir.parent
        if parent_dir.name == 'core':
            backend_dir = parent_dir.parent
            if backend_dir.name == 'backend':
                self._root_dir = backend_dir.parent
            else:
                self._root_dir = backend_dir
        else:
            self._root_dir = parent_dir
            
        # Füge Root-Verzeichnis zum Python-Pfad hinzu, falls noch nicht vorhanden
        root_str = str(self._root_dir)
        if root_str not in sys.path:
            sys.path.insert(0, root_str)
        
        # Füge backend-Verzeichnis zum Python-Pfad hinzu, falls noch nicht vorhanden
        backend_str = str(self._root_dir / 'backend')
        if backend_str not in sys.path:
            sys.path.insert(0, backend_str)
    
    def register_base_paths(self):
        """Registriere Basispfade"""
        self.register_path('root', self._root_dir)
        self.register_path('backend', self._root_dir / 'backend')
        self.register_path('frontend', self._root_dir / 'frontend')
        self.register_path('core', self._root_dir / 'backend' / 'core')
        self.register_path('api', self._root_dir / 'backend' / 'api')
        self.register_path('db', self._root_dir / 'backend' / 'db')
        self.register_path('models', self._root_dir / 'backend' / 'models')
        self.register_path('utils', self._root_dir / 'backend' / 'utils')
        self.register_path('tests', self._root_dir / 'backend' / 'tests')
        self.register_path('memory_bank', self._root_dir / 'memory-bank')
        
        # Stelle sicher, dass die app-Verzeichnisstruktur korrekt registriert ist
        self.register_path('app', self._root_dir / 'backend' / 'app')
        self.register_path('app_core', self._root_dir / 'backend' / 'app' / 'core')
        self.register_path('app_api', self._root_dir / 'backend' / 'app' / 'api')
        self.register_path('app_db', self._root_dir / 'backend' / 'app' / 'db')
        self.register_path('app_models', self._root_dir / 'backend' / 'app' / 'models')
    
    def register_path(self, name: str, path: Union[str, Path]) -> None:
        """Registriere einen Pfad im System
        
        Args:
            name: Eindeutiger Name für den Pfad
            path: Der zu registrierende Pfad
        """
        if isinstance(path, str):
            path = Path(path)
        
        self._paths[name] = path
        
        # Stelle sicher, dass das Verzeichnis im Python-Pfad ist
        path_str = str(path)
        if os.path.isdir(path_str) and path_str not in sys.path:
            sys.path.insert(0, path_str)
    
    def get_path(self, name: str) -> Optional[Path]:
        """Hole einen registrierten Pfad
        
        Args:
            name: Name des registrierten Pfads
            
        Returns:
            Path-Objekt oder None, wenn nicht gefunden
        """
        return self._paths.get(name)
    
    def register_module(self, name: str, module) -> None:
        """Registriere ein Modul im System
        
        Args:
            name: Eindeutiger Name für das Modul
            module: Das zu registrierende Modul
        """
        self._modules[name] = module
        
        # Registriere auch den Pfad zum Modul
        module_file = inspect.getfile(module)
        module_dir = os.path.dirname(module_file)
        self.register_path(f"{name}_dir", module_dir)
    
    def get_module(self, name: str):
        """Hole ein registriertes Modul
        
        Args:
            name: Name des registrierten Moduls
            
        Returns:
            Modul oder None, wenn nicht gefunden
        """
        return self._modules.get(name)
    
    def register_handler(self, name: str, handler: Callable) -> None:
        """Registriere einen Pfad-Handler
        
        Args:
            name: Eindeutiger Name für den Handler
            handler: Die zu registrierende Handler-Funktion
        """
        self._handlers[name] = handler
    
    def get_handler(self, name: str) -> Optional[Callable]:
        """Hole einen registrierten Handler
        
        Args:
            name: Name des registrierten Handlers
            
        Returns:
            Handler-Funktion oder None, wenn nicht gefunden
        """
        return self._handlers.get(name)
    
    def resolve_import_path(self, module_name: str) -> str:
        """Löse den Importpfad für ein Modul auf
        
        Args:
            module_name: Name des Moduls
            
        Returns:
            Korrekter Importpfad als String
        """
        # Versuche zuerst die app-Struktur
        if self.get_path('app') and (self.get_path('app') / module_name).exists():
            return f"app.{module_name}"
        
        # Dann die Standard-Backend-Struktur
        if self.get_path('backend') and (self.get_path('backend') / module_name).exists():
            return module_name
        
        # Fallback
        return module_name
    
    def ensure_module_importable(self, module_path: str) -> None:
        """Stelle sicher, dass ein Modul importiert werden kann
        
        Args:
            module_path: Pfad zum Modul
        """
        parts = module_path.split('.')
        current_path = self.get_path('root')
        
        for part in parts:
            current_path = current_path / part
            path_str = str(current_path)
            if os.path.isdir(path_str) and path_str not in sys.path:
                sys.path.insert(0, path_str)


# Globaler Zugriffspunkt zum Pfadregister
def get_registry() -> PathRegistry:
    """Hole das zentrale Pfadregister
    
    Returns:
        PathRegistry-Instance
    """
    return PathRegistry()


# Funktionen für einfacheren Zugriff

def get_path(name: str) -> Optional[Path]:
    """Hole einen registrierten Pfad
    
    Args:
        name: Name des registrierten Pfads
        
    Returns:
        Path-Objekt oder None, wenn nicht gefunden
    """
    return get_registry().get_path(name)


def resolve_import(module_name: str) -> str:
    """Löse den Importpfad für ein Modul auf
    
    Args:
        module_name: Name des Moduls
        
    Returns:
        Korrekter Importpfad als String
    """
    return get_registry().resolve_import_path(module_name)


def import_module(module_name: str):
    """Importiere ein Modul mit dem richtigen Pfad
    
    Args:
        module_name: Name des Moduls
        
    Returns:
        Importiertes Modul
    """
    import_path = resolve_import(module_name)
    get_registry().ensure_module_importable(import_path)
    
    # Dynamischer Import
    import importlib
    return importlib.import_module(import_path) 