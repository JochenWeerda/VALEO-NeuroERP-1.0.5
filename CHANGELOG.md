# Changelog

## [1.0.2] - 2024-03-15

### Hinzugefügt
- Vektorsuche-Integration mit FAISS und MongoDB
  - Hochperformante Ähnlichkeitssuche für Dokumente
  - Metadaten-Verwaltung in MongoDB
  - FastAPI-Endpunkte für Dokumentenverwaltung
  - Beispielskript für die Verwendung
- Neue Abhängigkeiten:
  - faiss-cpu>=1.7.4
  - sentence-transformers>=2.2.2

### Verbessert
- Datenbank-Integration:
  - Optimierte MongoDB-Indizes
  - Verbesserte PostgreSQL-Synchronisation
  - Erweiterte Backup-Funktionalität
- Dokumentation:
  - Neue Vektorsuche-Dokumentation
  - Aktualisierte API-Referenz
  - Erweiterte Beispiele

### Fehlerbehebungen
- Korrigierte Encoding-Probleme in der Dokumentenverarbeitung
- Verbesserte Fehlerbehandlung in API-Endpunkten
- Optimierte Speichernutzung für große Indizes 