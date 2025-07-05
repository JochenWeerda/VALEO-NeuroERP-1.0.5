# MongoDB und MCP RAG Integration für VALEO-NeuroERP

Diese Dokumentation beschreibt die Integration von MongoDB mit dem MCP RAG (Retrieval Augmented Generation) System für Berichterstellung und Systemüberwachung in VALEO-NeuroERP.

## Übersicht

Die Integration verbindet MongoDB als Datenspeicher mit dem MCP RAG-System, um folgende Funktionen zu ermöglichen:

1. **Speicherung von Web-Suchergebnissen** für spätere Analysen und Verbesserung der KI-Antworten
2. **Protokollierung von RAG-Abfragen** zur Optimierung der Wissensbasis
3. **Systemzustandsüberwachung** mit Warnmeldungen bei kritischen Zuständen
4. **Berichterstellung** mit minimaler Benutzeroberfläche für wichtige Systemzustände

## Architektur

Die Integration besteht aus folgenden Komponenten:

```
+----------------+       +----------------+       +----------------+
|                |       |                |       |                |
|  Frontend UI   | <---> |  Backend API   | <---> |  MongoDB       |
|                |       |                |       |                |
+----------------+       +-------+--------+       +----------------+
                                 |
                                 v
                         +----------------+
                         |                |
                         |  MCP RAG       |
                         |  System        |
                         |                |
                         +----------------+
```

## MongoDB-Sammlungen

Für die Integration werden folgende MongoDB-Sammlungen verwendet:

1. **search_history**: Speichert Web-Suchanfragen und -ergebnisse
   - `user_id`: Benutzer-ID (optional)
   - `query`: Suchanfrage
   - `response`: Antwort der Suche
   - `response_time_ms`: Antwortzeit in Millisekunden
   - `timestamp`: Zeitstempel der Anfrage

2. **rag_history**: Speichert RAG-Abfragen und -antworten
   - `user_id`: Benutzer-ID (optional)
   - `question`: Gestellte Frage
   - `response`: Generierte Antwort
   - `response_time_ms`: Antwortzeit in Millisekunden
   - `timestamp`: Zeitstempel der Anfrage

3. **system_status**: Speichert Systemzustandsdaten
   - `status`: Gesamtstatus ('ok', 'warning', 'critical')
   - `warnings`: Liste von Warnungen
   - `critical_issues`: Liste kritischer Probleme
   - `system_metrics`: CPU-, Speicher- und Festplattenauslastung
   - `service_status`: Status der wichtigsten Dienste
   - `timestamp`: Zeitstempel der Statusprüfung

## MCP RAG Integration

Das MCP RAG-System ist über den `linkup_mcp/server.py` integriert und bietet folgende Funktionalitäten:

### Web-Suche

```python
@mcp.tool()
def web_search(query: str, user_id: Optional[str] = None) -> str:
    """Sucht im Web nach Informationen und speichert die Ergebnisse in MongoDB."""
    # Implementierung...
```

### RAG-Abfragen

```python
@mcp.tool()
async def rag_query(question: str, user_id: Optional[str] = None) -> str:
    """Stellt Fragen an lokale Dokumente mit RAG und speichert die Ergebnisse in MongoDB."""
    # Implementierung...
```

### Historienabfragen

```python
@mcp.tool()
def get_search_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Ruft die Suchhistorie aus MongoDB ab."""
    # Implementierung...

@mcp.tool()
def get_rag_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Ruft die RAG-Abfragehistorie aus MongoDB ab."""
    # Implementierung...
```

## MongoDB-Connector

Der `MCPMongoDBConnector` in `linkup_mcp/mongodb_connector.py` stellt eine einfache Schnittstelle für MongoDB-Operationen bereit:

```python
connector = MCPMongoDBConnector()
connector.insert_one("search_history", {
    "user_id": "user123",
    "query": "Systemstatus prüfen",
    "response": "...",
    "timestamp": datetime.now()
})
```

## Systemüberwachung

Der `SystemMonitorService` in `backend/services/system_monitor_service.py` überwacht den Systemzustand und meldet kritische Probleme:

```python
monitor_service = SystemMonitorService(db)
status = monitor_service.get_system_status()
if status["status"] == "critical":
    # Benachrichtigung senden
```

## Frontend-Integration

Das Frontend zeigt den Systemstatus mit Warnungen für kritische Zustände an:

```jsx
<SystemStatus />
```

## Konfiguration

Die Integration wird über Umgebungsvariablen konfiguriert:

```
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=valeo_neuroerp
```

## Datenoptimierung

Um die Systemleistung zu optimieren, werden nur die wichtigsten Daten gesammelt:

1. Bei Web-Suchen und RAG-Abfragen werden nur Anfragen, Antworten und Metadaten gespeichert
2. Bei der Systemüberwachung werden nur kritische Metriken erfasst
3. Die Benutzeroberfläche zeigt nur Warnungen für kritische Zustände an

## Sicherheit

Beachten Sie folgende Sicherheitsaspekte:

1. MongoDB-Verbindungen sollten mit Authentifizierung und TLS/SSL gesichert werden
2. Sensible Daten sollten vor der Speicherung anonymisiert werden
3. Der Zugriff auf die MongoDB-Sammlungen sollte durch Berechtigungen eingeschränkt werden

## Fehlerbehebung

Häufige Probleme und Lösungen:

1. **Verbindungsprobleme**: Überprüfen Sie die MongoDB-URI und Netzwerkverbindung
2. **Langsame Abfragen**: Erstellen Sie Indizes für häufig abgefragte Felder
3. **Hohe Speichernutzung**: Implementieren Sie eine Bereinigungsstrategie für alte Daten

## Nächste Schritte

Für zukünftige Verbesserungen:

1. Implementierung einer Vektordatenbank für effizientere semantische Suche
2. Integration von MongoDB Atlas Vector Search für verbesserte RAG-Funktionalität
3. Automatische Optimierung der RAG-Antworten basierend auf Nutzerfeedback 