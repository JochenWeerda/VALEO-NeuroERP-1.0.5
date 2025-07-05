# Import-Handler und Pfadregister

Diese Dokumentation beschreibt die Verwendung des Import-Handlers und des Pfadregisters im ERP-System.

## Überblick

Das ERP-System verfügt über zwei zentrale Komponenten zur Verwaltung von Importpfaden:

1. **Pfadregister**: Verwaltet alle Pfade im System und bietet eine zentrale Stelle für die Pfadauflösung.
2. **Import-Handler**: Stellt zuverlässige Import-Funktionen mit Fallback-Strategien und Caching bereit.

## Import-Handler in ein Modul integrieren

Jedes Modul sollte den Import-Handler in seiner `__init__.py`-Datei integrieren, um zuverlässige Imports zu gewährleisten. Eine Vorlage finden Sie in `backend/import_handler_template.py`.

Kopieren Sie den folgenden Code in Ihre `__init__.py`-Datei:

```python
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
```

## Import-Funktionen verwenden

Der Import-Handler bietet drei Hauptfunktionen:

### 1. `import_module`

Importiert ein Modul mit dem richtigen Pfad:

```python
# Importiere ein Modul
config_module = import_module('core.config')
```

### 2. `import_from`

Importiert ein Attribut aus einem Modul:

```python
# Importiere ein Attribut
settings = import_from('core.config', 'settings')
```

### 3. `import_all_from`

Importiert mehrere Attribute aus einem Modul:

```python
# Importiere mehrere Attribute
models = import_all_from('models.odata_models', 'Tour', 'Pickliste', 'Auftrag')
tour_model = models.get('Tour')
```

## Vordefinierte Importe in Modulen

Es ist empfehlenswert, häufig verwendete Importe in der `__init__.py`-Datei des Moduls vorzudefinieren:

```python
# Vordefinierte Importe für dieses Modul
Base = import_from('db.base', 'Base')
engine = import_from('db.database', 'engine')
```

## Pfadregister verwenden

Das Pfadregister bietet Funktionen zur Verwaltung von Pfaden:

```python
# Importiere das Pfadregister
from backend.core.path_registry import get_registry, get_path, resolve_import

# Hole einen registrierten Pfad
backend_path = get_path('backend')

# Löse einen Importpfad auf
import_path = resolve_import('core.config')
```

## Vorteile der Verwendung

Die Verwendung des Import-Handlers und des Pfadregisters bietet folgende Vorteile:

1. **Zuverlässige Imports**: Keine fehlgeschlagenen Imports mehr durch falsche Pfade
2. **Modulverschiebung**: Module können verschoben werden, ohne Importpfade zu ändern
3. **Erweiterbarkeit**: Einfache Integration neuer Features ohne Pfadkonflikte
4. **Fallback-Strategien**: Automatische Fallbacks bei Importproblemen

## Testen der Funktionalität

Ein Testskript für den Import-Handler und das Pfadregister finden Sie in `backend/utils/import_test.py`. Führen Sie dieses Skript aus, um die Funktionalität zu testen:

```bash
python utils/import_test.py
``` 