"""
Features-Modul des AI-Driven ERP-Systems

Dieses Modul enthält feature-basierte Module und Erweiterungen des Systems.
"""

# Integriere den Import-Handler
try:
    from backend.core.import_handler import import_module, import_from, import_all_from
except ImportError:
    try:
        from core.import_handler import import_module, import_from, import_all_from
    except ImportError:
        # Fallback ohne Import-Handler
        import importlib
        def import_module(name):
            try:
                return importlib.import_module(name)
            except ImportError:
                try:
                    return importlib.import_module(f"app.{name}")
                except ImportError:
                    return None
        
        def import_from(module_name, attr):
            module = import_module(module_name)
            if module:
                return getattr(module, attr, None)
            return None
        
        def import_all_from(module_name, *attrs):
            result = {}
            module = import_module(module_name)
            if module:
                for attr in attrs:
                    val = getattr(module, attr, None)
                    if val is not None:
                        result[attr] = val
            return result

# Vordefinierte Importe für dieses Modul
registry = import_from('core.path_registry', 'get_registry')
if registry:
    registry = registry()  # Hole die Singleton-Instanz

# Informationsmeldung
print("Features-Modul mit Import-Handler initialisiert.") 