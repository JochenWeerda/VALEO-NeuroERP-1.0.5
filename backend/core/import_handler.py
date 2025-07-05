"""
Import-Handler für das ERP-System

Dieses Modul bietet eine zentrale Lösung für alle Import-Probleme im System.
Es nutzt das Pfadregister, um zur Laufzeit die korrekten Import-Pfade aufzulösen.
"""

import importlib
import sys
import inspect
from pathlib import Path
from typing import Any, Dict, Optional, List, Union, Set

# Nutze relatives Import für das Pfadregister
try:
    from .path_registry import get_registry, get_path, resolve_import
except ImportError:
    # Fallback für direkten Import
    from path_registry import get_registry, get_path, resolve_import


class ImportHandler:
    """Handler für dynamische Imports zur Laufzeit"""
    
    _instance = None
    
    def __new__(cls):
        """Singleton-Pattern implementieren"""
        if cls._instance is None:
            cls._instance = super(ImportHandler, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialisiere den Import-Handler"""
        self._import_cache = {}
        self._failed_imports = set()
        self._import_hooks = []
        
        # Hole Referenz zum Pfadregister
        self._registry = get_registry()
    
    def register_import_hook(self, hook_function):
        """Registriere eine Hook-Funktion für Imports
        
        Args:
            hook_function: Funktion, die vor einem Import ausgeführt wird
        """
        self._import_hooks.append(hook_function)
    
    def _run_import_hooks(self, module_name: str):
        """Führe alle registrierten Import-Hooks aus
        
        Args:
            module_name: Name des zu importierenden Moduls
        """
        for hook in self._import_hooks:
            hook(module_name)
    
    def import_module(self, module_name: str, force_reload: bool = False) -> Any:
        """Importiere ein Modul dynamisch mit korrektem Pfad
        
        Args:
            module_name: Name des zu importierenden Moduls
            force_reload: Wenn True, wird das Modul neu geladen
            
        Returns:
            Importiertes Modul oder None bei Fehler
        """
        # Prüfe Cache, außer bei erzwungenem Neuladen
        if not force_reload and module_name in self._import_cache:
            return self._import_cache[module_name]
        
        # Prüfe, ob Import bereits fehlgeschlagen ist
        if module_name in self._failed_imports and not force_reload:
            return None
        
        # Führe Import-Hooks aus
        self._run_import_hooks(module_name)
        
        # Verwende das Pfadregister zur Auflösung des Importpfads
        import_path = resolve_import(module_name)
        
        # Stelle sicher, dass das Modul importiert werden kann
        self._registry.ensure_module_importable(import_path)
        
        try:
            # Versuche den Import
            if force_reload and import_path in sys.modules:
                module = importlib.reload(sys.modules[import_path])
            else:
                module = importlib.import_module(import_path)
            
            # Cache das Ergebnis
            self._import_cache[module_name] = module
            
            # Registriere das Modul im Pfadregister
            self._registry.register_module(module_name, module)
            
            return module
        except ImportError as e:
            # Fallback-Strategien implementieren
            fallback_module = self._try_fallback_imports(module_name)
            if fallback_module:
                self._import_cache[module_name] = fallback_module
                return fallback_module
            
            # Markiere als fehlgeschlagen
            self._failed_imports.add(module_name)
            return None
    
    def _try_fallback_imports(self, module_name: str) -> Optional[Any]:
        """Versuche alternative Import-Strategien
        
        Args:
            module_name: Name des zu importierenden Moduls
            
        Returns:
            Importiertes Modul oder None bei Fehler
        """
        # Liste der möglichen Importpfade
        possible_paths = [
            module_name,
            f"app.{module_name}",
            f"backend.{module_name}",
            f"backend.app.{module_name}"
        ]
        
        # Wenn ein Punkt im Namen ist, versuche es auch ohne Präfix
        if "." in module_name:
            possible_paths.append(module_name.split(".")[-1])
        
        # Versuche jeden möglichen Pfad
        for path in possible_paths:
            try:
                module = importlib.import_module(path)
                # Cache das Ergebnis
                self._import_cache[module_name] = module
                return module
            except ImportError:
                continue
        
        return None
    
    def import_from(self, module_name: str, attribute: str) -> Any:
        """Importiere ein Attribut aus einem Modul
        
        Args:
            module_name: Name des zu importierenden Moduls
            attribute: Name des zu importierenden Attributs
            
        Returns:
            Importiertes Attribut oder None bei Fehler
        """
        module = self.import_module(module_name)
        if module is None:
            return None
        
        return getattr(module, attribute, None)
    
    def import_all_from(self, module_name: str, *attributes) -> Dict[str, Any]:
        """Importiere mehrere Attribute aus einem Modul
        
        Args:
            module_name: Name des zu importierenden Moduls
            *attributes: Namen der zu importierenden Attribute
            
        Returns:
            Dictionary mit Attributnamen und -werten
        """
        result = {}
        module = self.import_module(module_name)
        
        if module is None:
            return result
        
        for attr in attributes:
            value = getattr(module, attr, None)
            if value is not None:
                result[attr] = value
        
        return result
    
    def clear_cache(self, module_name: Optional[str] = None) -> None:
        """Lösche den Import-Cache
        
        Args:
            module_name: Optional, nur den Cache für dieses Modul löschen
        """
        if module_name:
            if module_name in self._import_cache:
                del self._import_cache[module_name]
            if module_name in self._failed_imports:
                self._failed_imports.remove(module_name)
        else:
            self._import_cache.clear()
            self._failed_imports.clear()


# Globaler Zugriffspunkt zum Import-Handler
def get_import_handler() -> ImportHandler:
    """Hole den Import-Handler
    
    Returns:
        ImportHandler-Instance
    """
    return ImportHandler()


# Funktionen für einfacheren Zugriff

def import_module(module_name: str, force_reload: bool = False) -> Any:
    """Importiere ein Modul dynamisch mit korrektem Pfad
    
    Args:
        module_name: Name des zu importierenden Moduls
        force_reload: Wenn True, wird das Modul neu geladen
        
    Returns:
        Importiertes Modul oder None bei Fehler
    """
    return get_import_handler().import_module(module_name, force_reload)


def import_from(module_name: str, attribute: str) -> Any:
    """Importiere ein Attribut aus einem Modul
    
    Args:
        module_name: Name des zu importierenden Moduls
        attribute: Name des zu importierenden Attributs
        
    Returns:
        Importiertes Attribut oder None bei Fehler
    """
    return get_import_handler().import_from(module_name, attribute)


def import_all_from(module_name: str, *attributes) -> Dict[str, Any]:
    """Importiere mehrere Attribute aus einem Modul
    
    Args:
        module_name: Name des zu importierenden Moduls
        *attributes: Namen der zu importierenden Attribute
        
    Returns:
        Dictionary mit Attributnamen und -werten
    """
    return get_import_handler().import_all_from(module_name, *attributes)


def clear_import_cache(module_name: Optional[str] = None) -> None:
    """Lösche den Import-Cache
    
    Args:
        module_name: Optional, nur den Cache für dieses Modul löschen
    """
    get_import_handler().clear_cache(module_name) 