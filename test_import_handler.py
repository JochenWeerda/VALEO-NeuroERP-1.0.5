#!/usr/bin/env python
"""
Test für den Import-Handler und das Pfadregister

Dieses Skript testet die Funktionalität des Import-Handlers und des Pfadregisters.
"""

import os
import sys
from pathlib import Path

# Füge das Projektverzeichnis zum Pythonpfad hinzu
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, str(current_dir))

def test_path_registry():
    """Testet die Funktionalität des Pfadregisters"""
    print("=== TEST PFADREGISTER ===")
    
    try:
        # Importiere das Pfadregister
        from backend.core.path_registry import get_registry, get_path, resolve_import
        
        # Hole das Registry-Singleton
        registry = get_registry()
        
        # Teste registrierte Pfade
        print("Registrierte Pfade:")
        for name in ['root', 'backend', 'core', 'api', 'db', 'models', 'utils']:
            path = get_path(name)
            print(f"  - {name}: {path}")
        
        # Teste Importpfadauflösung
        print("\nImportpfadauflösung:")
        modules = ['core.config', 'db.database', 'models.odata_models']
        for module in modules:
            import_path = resolve_import(module)
            print(f"  - {module} -> {import_path}")
        
        print("\nPfadregister-Test erfolgreich!")
    except ImportError as e:
        print(f"Fehler beim Importieren des Pfadregisters: {e}")
    except Exception as e:
        print(f"Fehler beim Testen des Pfadregisters: {e}")

def test_import_handler():
    """Testet die Funktionalität des Import-Handlers"""
    print("\n=== TEST IMPORT-HANDLER ===")
    
    try:
        # Importiere den Import-Handler
        from backend.core.import_handler import import_module, import_from, import_all_from
        
        # Teste Modulimport
        print("Modulimport:")
        modules = ['core.config', 'db.database', 'models.odata_models']
        for module_name in modules:
            module = import_module(module_name)
            print(f"  - {module_name}: {'Erfolgreich' if module else 'Fehlgeschlagen'}")
        
        # Teste Import eines Attributs
        print("\nAttributimport:")
        imports = [
            ('core.config', 'settings'),
            ('db.database', 'get_db'),
            ('models.odata_models', 'Tour')
        ]
        for module_name, attr in imports:
            obj = import_from(module_name, attr)
            print(f"  - {module_name}.{attr}: {'Erfolgreich' if obj else 'Fehlgeschlagen'}")
        
        # Teste Import mehrerer Attribute
        print("\nMulti-Attributimport:")
        result = import_all_from('models.odata_models', 'Tour', 'Pickliste', 'Auftrag')
        print(f"  - Gefundene Attribute: {', '.join(result.keys())}")
        
        print("\nImport-Handler-Test erfolgreich!")
    except ImportError as e:
        print(f"Fehler beim Importieren des Import-Handlers: {e}")
    except Exception as e:
        print(f"Fehler beim Testen des Import-Handlers: {e}")

def test_fallback_imports():
    """Testet die Fallback-Importmechanismen"""
    print("\n=== TEST FALLBACK-IMPORTS ===")
    
    try:
        # Importiere den Import-Handler
        from backend.core.import_handler import import_module
        
        # Teste verschiedene Importpfade
        print("Fallback-Importpfade:")
        modules = [
            'core.config',
            'app.core.config',
            'backend.core.config',
            'backend.app.core.config'
        ]
        for module_name in modules:
            module = import_module(module_name)
            print(f"  - {module_name}: {'Erfolgreich' if module else 'Fehlgeschlagen'}")
        
        print("\nFallback-Import-Test erfolgreich!")
    except ImportError as e:
        print(f"Fehler beim Importieren des Import-Handlers: {e}")
    except Exception as e:
        print(f"Fehler beim Testen der Fallback-Imports: {e}")

if __name__ == "__main__":
    print("Starte Tests für Pfadregister und Import-Handler...\n")
    
    # Teste das Pfadregister
    test_path_registry()
    
    # Teste den Import-Handler
    test_import_handler()
    
    # Teste Fallback-Imports
    test_fallback_imports()
    
    print("\nAlle Tests abgeschlossen!") 