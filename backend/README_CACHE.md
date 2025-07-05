# Cache-Infrastruktur für das AI-driven ERP-System

Dieses Dokument beschreibt die verbesserte Cache-Infrastruktur des AI-driven ERP-Systems, die im Rahmen der Phase 3 (Performance-Optimierung) implementiert wurde.

## Übersicht

Die neue Cache-Infrastruktur bietet:

- **Multi-Backend-Unterstützung**: Memory-Cache für Entwicklung, Redis-Cache für Produktion
- **Tag-basierte Invalidierung**: Gezielte Invalidierung verwandter Cache-Einträge
- **Konfigurierbare TTL-Werte**: Anpassbare Lebensdauer für verschiedene Datentypen
- **Cache-Warmup**: Vorausfüllung des Caches mit häufig verwendeten Daten
- **Umfassende Statistiken**: Detaillierte Metriken zur Cache-Nutzung

## Installation und Konfiguration

### 1. Redis-Setup (Optional, für Produktionsumgebung empfohlen)

Um Redis einzurichten, führen Sie das Setup-Skript aus:

```powershell
# Redis installieren und konfigurieren
.\scripts\setup_redis_cache.ps1 -Install

# Nur Redis konfigurieren (wenn bereits installiert)
.\scripts\setup_redis_cache.ps1 -ConfigureOnly

# Benutzerdefinierte Redis-Konfiguration
.\scripts\setup_redis_cache.ps1 -Install -RedisHost "192.168.1.100" -RedisPort "6380"
```

### 2. Abhängigkeiten installieren

```powershell
# Für Memory-Cache (minimal)
pip install --upgrade pip
pip install cachetools

# Für Redis-Cache
pip install --upgrade pip
pip install cachetools redis
```

### 3. Cache-Backend auswählen

Standardmäßig verwendet das System den Memory-Cache. Um Redis zu verwenden, ändern Sie die Konfiguration in `enhanced_cache_manager.py`:

```python
# Memory-Cache (Standard)
cache = EnhancedCacheManager(backend="memory")

# Redis-Cache
redis_cache = EnhancedCacheManager(backend="redis", redis_url="redis://localhost:6379/0")

# Aktiven Cache auswählen
active_cache = cache  # Für Memory-Cache
# active_cache = redis_cache  # Für Redis-Cache
```

## Verwendung

### Grundlegende Verwendung

```python
from enhanced_cache_manager import cache

# Funktion mit Cache-Dekorator
@cache.cached(ttl=300)  # 5 Minuten cachen
async def get_data(id):
    # Daten aus der Datenbank laden (langsame Operation)
    return data
```

### Fortgeschrittene Verwendung mit Tags

```python
from enhanced_cache_manager import cache

# Funktion mit Cache-Dekorator und Tags
@cache.cached(ttl=300, tags=["articles", f"article:{id}", "list"])
async def get_article(id):
    # Artikel aus der Datenbank laden
    return article

# Cache-Tags invalidieren
def update_article(id, data):
    # Artikel aktualisieren
    
    # Nur relevante Cache-Einträge invalidieren
    cache.invalidate_tag(f"article:{id}")  # Invalidiert nur Einträge für diesen Artikel
    cache.invalidate_tag("articles")       # Invalidiert alle Artikel-Listen
    
    return {"success": True}
```

### Cache-Warmup

```python
# Cache mit häufig benötigten Werten füllen
def init_cache():
    # Generator-Funktion für Cache-Werte
    def generate_value(key):
        if key == "global_stats":
            return calculate_global_stats()
        return None
    
    # Cache mit wichtigen Werten vorwärmen
    keys = ["global_stats"]
    cache.warmup(keys, generate_value)
```

### Cache-Statistiken

```python
# Cache-Statistiken abrufen
stats = cache.get_stats()
print(f"Cache-Statistiken: {stats}")

# Beispiel-Ausgabe:
# Cache-Statistiken: {
#   'hits': 42, 
#   'misses': 15, 
#   'sets': 57, 
#   'deletes': 0, 
#   'tag_invalidations': 2, 
#   'hit_rate': 73.68, 
#   'entries': 57, 
#   'tags': 8
# }
```

## Migration bestehender API-Module

Um bestehende API-Module auf den neuen Cache-Manager umzustellen, verwenden Sie das Migrations-Skript:

```powershell
# Alle API-Module migrieren (Dry-Run zum Testen)
python scripts/migrate_to_enhanced_cache.py --all --dry-run

# Alle API-Module migrieren
python scripts/migrate_to_enhanced_cache.py --all

# Einzelne API-Datei migrieren
python scripts/migrate_to_enhanced_cache.py backend/api/charges_api.py
```

Weitere Informationen zur Migration finden Sie in der Dokumentation: `memory-bank/api_cache_migration_guide.md`

## Empfohlene Cache-Tags

Für eine konsistente Verwendung von Cache-Tags empfehlen wir folgende Struktur:

| Tag-Muster | Beschreibung | Beispiel |
|------------|--------------|----------|
| `module` | Modul-/API-Name | `articles`, `charges` |
| `entity:id` | Spezifische Entität | `article:123`, `charge:456` |
| `list` | Listen-Endpunkte | Für Endpunkte, die Listen zurückgeben |
| `stats` | Statistik-Endpunkte | Für Endpunkte, die Statistiken zurückgeben |
| `user:id` | Benutzerspezifische Daten | `user:789` |
| `report` | Berichts-Endpunkte | Für Reporting-Funktionen |

## Performance-Betrachtungen

Für optimale Performance beachten Sie folgende Punkte:

- **TTL-Werte**: Wählen Sie TTL-Werte basierend auf der Änderungshäufigkeit der Daten
  - Häufig ändernde Daten: 30-60 Sekunden
  - Selten ändernde Daten: 300-600 Sekunden
  - Statische Daten: 3600+ Sekunden
- **Redis-Konfiguration**: Für Produktionsumgebungen empfehlen wir:
  - Mindestens 2 GB RAM für Redis
  - Persistenz aktivieren mit AOF-Modus
  - Überwachung der Redis-Speichernutzung
- **Cache-Warmup**: Füllen Sie den Cache beim Anwendungsstart mit häufig abgefragten Daten

## Fehlerbehebung

### Memory-Cache

Bei Problemen mit dem Memory-Cache:
- Cache zurücksetzen: `cache.clear()`
- Speicherverbrauch überprüfen
- Cache-Statistiken analysieren: `cache.get_stats()`

### Redis-Cache

Bei Problemen mit dem Redis-Cache:
- Redis-Verbindung prüfen: `redis-cli ping`
- Redis-Speichernutzung prüfen: `redis-cli info memory`
- Redis-Logs überprüfen
- Redis neu starten: `redis-server --service-stop` gefolgt von `redis-server --service-start`

## Beispiel-Code

Ein vollständiges Beispiel finden Sie unter:
`backend/examples/cache_example.py`

## Weiterführende Dokumentation

- Vollständige Dokumentation: `memory-bank/phase3_cache_infrastructure.md`
- Migrations-Anleitung: `memory-bank/api_cache_migration_guide.md`
- Redis-Dokumentation: [Redis Documentation](https://redis.io/documentation) 