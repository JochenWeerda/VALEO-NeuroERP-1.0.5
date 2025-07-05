# Modulstruktur des AI-Driven ERP-Systems

Dieses Dokument beschreibt die optimierte Modulstruktur des ERP-Systems und erklärt, wie das zentrale Pfadregister zur Verwaltung von Importpfaden verwendet wird.

## Zentrales Pfadregister

Die Kernkomponente der neuen Modulstruktur ist das zentrale Pfadregister, das die folgenden Probleme löst:

- **Importprobleme:** Keine fehlgeschlagenen Imports mehr durch falsche Pfade
- **Modulverschiebung:** Module können verschoben werden, ohne Importpfade zu ändern
- **Erweiterbarkeit:** Einfache Integration neuer Features ohne Pfadkonflikte

### Verwendung des Pfadregisters

Um das Pfadregister in Ihrem Modul zu verwenden:

```python
# Importiere den Import-Handler
try:
    from backend.core.import_handler import import_module, import_from
except ImportError:
    # Fallback für direkten Import
    from core.import_handler import import_module, import_from

# Verwende den Import-Handler
settings = import_from('core.config', 'settings')
db_module = import_module('db.database')
```

## Neue Modulstruktur

Die Projektstruktur wurde für zukünftige Erweiterungen optimiert:

```
backend/
├── core/                  # Kernfunktionalitäten
│   ├── path_registry.py   # Zentrales Pfadregister
│   └── import_handler.py  # Import-Handler
├── api/                   # API-Definitionen
├── db/                    # Datenbankzugriff
├── models/                # Datenmodelle
├── utils/                 # Hilfsfunktionen
│   ├── module_analyzer.py # Analyse-Tool
│   └── module_optimizer.py # Optimierungs-Tool
├── features/              # Feature-basierte Module
│   └── example_feature/   # Beispiel-Feature
│       ├── api/           # Feature-spezifische API
│       ├── models/        # Feature-spezifische Modelle
│       ├── services/      # Feature-spezifische Geschäftslogik
│       └── tests/         # Feature-Tests
├── app/                   # Kompatibilitätsschicht (alte Struktur)
└── tests/                 # Tests
```

## Feature-basierte Entwicklung

Die neue Struktur unterstützt feature-basierte Entwicklung. Jedes Feature wird in einem eigenen Verzeichnis unter `features/` implementiert und enthält alle notwendigen Komponenten.

### Erstellen eines neuen Features

Verwenden Sie das `optimize_project.py`-Skript, um ein neues Feature zu erstellen:

```bash
python optimize_project.py --feature mein_neues_feature
```

Dies erstellt die folgende Struktur:

```
features/
└── mein_neues_feature/
    ├── api/         # API-Endpunkte
    ├── models/      # Datenmodelle
    ├── services/    # Geschäftslogik
    └── tests/       # Tests
```

## Analysetools

Das Projekt enthält Tools zur Analyse und Optimierung der Modulstruktur:

### Analyse der Modulstruktur

```bash
python analyze_structure.py
```

Dieses Skript analysiert die aktuelle Projektstruktur und gibt Empfehlungen für Optimierungen.

### Optimierung der Projektstruktur

```bash
python optimize_project.py
```

Dieses Skript optimiert die Projektstruktur für zukünftige Erweiterungen.

## Richtlinien für neue Module

Bei der Entwicklung neuer Module sollten folgende Richtlinien beachtet werden:

1. **Verwenden Sie den Import-Handler:** Importieren Sie Module mit `import_module` und `import_from`
2. **Feature-basierte Entwicklung:** Implementieren Sie neue Funktionen als eigenständige Features
3. **Trennung von Benutzeroberfläche und Geschäftslogik:** API-Endpunkte und Geschäftslogik trennen
4. **Zentrale Konfiguration:** Verwenden Sie das Pfadregister für alle Konfigurationen

## Migrationsschritte für bestehende Module

Um bestehende Module auf die neue Struktur umzustellen:

1. Ersetzen Sie direkte Imports durch den Import-Handler
2. Organisieren Sie zusammengehörige Funktionalitäten als Features
3. Führen Sie das Analyseskript aus, um weitere Optimierungsmöglichkeiten zu identifizieren
4. Verwenden Sie das Optimierungsskript, um die Struktur zu verbessern

## Häufige Probleme und Lösungen

### Import-Fehler

Wenn Imports fehlschlagen:

```python
# Fehlgeschlagener Import
from app.core.config import settings

# Lösung mit Import-Handler
from backend.core.import_handler import import_from
settings = import_from('core.config', 'settings')
```

### Zirkuläre Abhängigkeiten

Wenn zirkuläre Abhängigkeiten auftreten:

1. Verwenden Sie den `import_module`-Ansatz für verzögerte Imports
2. Extrahieren Sie gemeinsame Funktionalität in ein separates Modul
3. Verwenden Sie Dependency Injection statt direkter Imports

## Zukunftsvision

Die neue Modulstruktur ist so konzipiert, dass sie mit dem Projekt wachsen kann:

- **Mikroservices:** Einfache Umwandlung von Features in eigenständige Mikroservices
- **Pluginsystem:** Features können als Plugins implementiert werden
- **Versionierung:** Unterstützung für mehrere API-Versionen
- **Modularisierung:** Klare Trennung der Komponenten für bessere Wartbarkeit

## Abhängigkeiten und Kompatibilität

### Python-Version
Das System wurde mit Python 3.11 getestet und für diese Version optimiert.

### Bibliotheken
Für die ordnungsgemäße Funktion des Systems werden folgende Versionen empfohlen:

- pydantic>=1.10.0 (für Python 3.11 kompatibel)
- fastapi>=0.104.0 (kompatibel mit Pydantic)
- uvicorn>=0.24.0
- sqlalchemy>=2.0.0

Bei Aktualisierungen des Python-Interpreters sollte stets die Kompatibilität der Bibliotheken überprüft werden. 