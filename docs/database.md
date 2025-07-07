# Datenbank-Dokumentation für VALEO-NeuroERP

## Übersicht

VALEO-NeuroERP verwendet ein Multi-Datenbank-System für verschiedene Anwendungsfälle:

- **PostgreSQL**: Transaktionen und strukturierte Daten
- **MongoDB**: Dokumente, Workflows und unstrukturierte Daten
- **Redis**: Caching und Session-Management
- **ChromaDB**: RAG-System für Vektordatenbank

## PostgreSQL

### Konfiguration
- Host: localhost
- Port: 5432
- Datenbank: valeo_neuroerp
- Benutzer: valeo

### Tabellen
- `transactions`: Finanztransaktionen
- Weitere Tabellen werden über Alembic-Migrationen verwaltet

### Wartung
- VACUUM ANALYZE wird regelmäßig durchgeführt
- Backup-Skripte sind verfügbar
- Monitoring über Prometheus/Grafana

## MongoDB

### Konfiguration
- URI: mongodb://localhost:27017
- Datenbank: valeo_neuroerp

### Collections
- `users`: Benutzerdaten
- `documents`: Dokumentenverwaltung
- `workflows`: Workflow-Definitionen und -Status

### Indizes
- `users.email`: Unique Index
- `documents.user_id`: Index für schnelle Benutzersuche
- `workflows.user_id`: Index für Workflow-Zuordnung

## Redis

### Konfiguration
- Host: localhost
- Port: 6379
- DB: 0

### Verwendung
- Session-Cache
- API-Rate-Limiting
- Temporäre Datenspeicherung

## ChromaDB

### Konfiguration
- Persist Directory: ./data/chroma
- Embedding Model: sentence-transformers/all-mpnet-base-v2

### Verwendung
- Vektordatenbank für RAG-System
- Semantische Suche
- Ähnlichkeitsanalyse

## Backup und Restore

### Backup-Skript
```bash
python scripts/backup.py --action backup
```

### Restore-Skript
```bash
python scripts/backup.py --action restore --mongodb-backup path/to/mongodb.gz --postgresql-backup path/to/postgresql.sql
```

## Wartung

### Wartungsskript
```bash
python scripts/maintenance.py
```

Führt folgende Aufgaben durch:
- PostgreSQL VACUUM ANALYZE
- MongoDB Collection Compact
- Bereinigung alter Logs
- Statistikanalyse

## Migration

### Neue Migration erstellen
```bash
python scripts/migrate.py --action create --message "Migration description"
```

### Migrationen ausführen
```bash
python scripts/migrate.py --action upgrade
```

## Initialisierung

### Datenbanken initialisieren
```bash
python scripts/init_db.py
```

## Tests

### Datenbank-Tests ausführen
```bash
pytest tests/test_db.py
```

## Monitoring

- Prometheus-Metriken auf Port 9090
- Grafana-Dashboard auf Port 3000
- Detaillierte Logs in ./logs/app.log

## Sicherheit

- Passwörter werden verschlüsselt gespeichert
- JWT-basierte Authentifizierung
- Rate-Limiting für API-Endpunkte
- Regelmäßige Sicherheits-Audits

## Best Practices

1. **Backup**
   - Tägliche Backups durchführen
   - Backups regelmäßig testen
   - Backup-Rotation implementieren

2. **Monitoring**
   - Metriken überwachen
   - Alerts konfigurieren
   - Performance-Probleme frühzeitig erkennen

3. **Wartung**
   - Regelmäßige Wartungsfenster einplanen
   - Logs regelmäßig bereinigen
   - Indizes optimieren

4. **Entwicklung**
   - Migrations für Schemaänderungen verwenden
   - Tests für Datenbankoperationen schreiben
   - Transaktionen für kritische Operationen nutzen 