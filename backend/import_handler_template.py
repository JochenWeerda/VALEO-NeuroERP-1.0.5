"""
Vorlage für die Integration des Import-Handlers in neue Module

Kopieren Sie diesen Code in Ihre __init__.py-Datei, um den Import-Handler zu integrieren.
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
# Fügen Sie hier Ihre vordefinierten Importe hinzu, z.B.:
# settings = import_from('core.config', 'settings')
# Base = import_from('db.base', 'Base')

# Informationsmeldung
print("[MODULNAME]-Modul mit Import-Handler initialisiert.") 