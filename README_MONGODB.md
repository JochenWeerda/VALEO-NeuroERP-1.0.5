# VALEO-NeuroERP MongoDB-Integration

Diese README beschreibt die Einrichtung und Verwendung der MongoDB-Integration für das VALEO-NeuroERP-System.

## Voraussetzungen

- Python 3.8 oder höher
- MongoDB 4.4 oder höher
- Linkup API-Schlüssel
- OpenAI API-Schlüssel

## Installation

1. MongoDB installieren und starten:
   - Windows: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Linux: `sudo apt install mongodb`
   - macOS: `brew install mongodb-community`

2. Python-Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```

3. Umgebungsvariablen setzen:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB_NAME=valeo_neuroerp
   LINKUP_API_KEY=your_linkup_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

## Verwendung

### MCP Server starten

Unter Windows:
```powershell
.\start_mcp_server_mongodb.ps1
```

Manuell:
```bash
python server_fastmcp_mongodb.py
```

### Tests ausführen

```bash
python backend/tests/test_mcp_mongodb_integration.py
```

## Komponenten

### MongoDB-Connector

Der MongoDB-Connector (`backend/mongodb_connector.py`) stellt grundlegende CRUD-Operationen für MongoDB bereit:

- `insert_one`: Fügt ein Dokument ein
- `insert_many`: Fügt mehrere Dokumente ein
- `find_one`: Findet ein Dokument
- `find_many`: Findet mehrere Dokumente
- `update_one`: Aktualisiert ein Dokument
- `update_many`: Aktualisiert mehrere Dokumente
- `delete_one`: Löscht ein Dokument
- `delete_many`: Löscht mehrere Dokumente

### Datenmodelle

Die Datenmodelle (`backend/models/search_history.py`) definieren die Struktur der in MongoDB gespeicherten Daten:

- `SearchQuery`: Repräsentiert eine Suchanfrage
- `SearchResult`: Repräsentiert ein Suchergebnis
- `SearchHistoryItem`: Repräsentiert einen Eintrag in der Suchhistorie
- `RAGQueryHistoryItem`: Repräsentiert einen Eintrag in der RAG-Abfragehistorie
- `DocumentProcessingHistoryItem`: Repräsentiert einen Eintrag in der Dokumentenverarbeitungshistorie

### MCP-Tools

Der MCP Server stellt folgende Tools bereit:

- `web_search`: Sucht im Web nach Informationen und speichert die Ergebnisse in MongoDB
- `rag_query`: Stellt Fragen an lokale Dokumente und speichert die Ergebnisse in MongoDB
- `get_search_history`: Ruft die Suchhistorie aus MongoDB ab
- `get_rag_history`: Ruft die RAG-Abfragehistorie aus MongoDB ab
- `get_document_history`: Ruft die Dokumentenverarbeitungshistorie aus MongoDB ab

## API-Endpunkte

Der MCP Server stellt folgende API-Endpunkte bereit:

### Web-Suche

```http
POST http://localhost:8001/tools
Content-Type: application/json

{
  "tool_name": "web_search",
  "parameters": {
    "query": "VALEO-NeuroERP MongoDB",
    "user_id": "user123",
    "search_type": "sourcedAnswer",
    "language": "de",
    "region": "DE"
  }
}
```

### RAG-Abfrage

```http
POST http://localhost:8001/tools
Content-Type: application/json

{
  "tool_name": "rag_query",
  "parameters": {
    "question": "Was ist VALEO-NeuroERP?",
    "user_id": "user123"
  }
}
```

### Suchhistorie abrufen

```http
POST http://localhost:8001/tools
Content-Type: application/json

{
  "tool_name": "get_search_history",
  "parameters": {
    "user_id": "user123",
    "limit": 10
  }
}
```

### RAG-Abfragehistorie abrufen

```http
POST http://localhost:8001/tools
Content-Type: application/json

{
  "tool_name": "get_rag_history",
  "parameters": {
    "user_id": "user123",
    "limit": 10
  }
}
```

### Dokumentenverarbeitungshistorie abrufen

```http
POST http://localhost:8001/tools
Content-Type: application/json

{
  "tool_name": "get_document_history",
  "parameters": {
    "user_id": "user123",
    "status": "success",
    "limit": 10
  }
}
```

## Fehlerbehebung

### MongoDB-Verbindungsprobleme

Wenn der Server nicht mit MongoDB verbinden kann:

1. Stellen Sie sicher, dass MongoDB läuft:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/macOS
   sudo systemctl status mongodb
   ```

2. Überprüfen Sie die Verbindungs-URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   ```

### Linkup API-Probleme

Wenn die Web-Suche nicht funktioniert:

1. Überprüfen Sie den Linkup API-Schlüssel:
   ```
   LINKUP_API_KEY=your_linkup_api_key
   ```

2. Testen Sie die Linkup API direkt:
   ```python
   from linkup.client import LinkupClient
   
   client = LinkupClient(api_key="your_linkup_api_key")
   response = client.search(query="test")
   print(response)
   ```

### RAG-Probleme

Wenn RAG-Abfragen nicht funktionieren:

1. Stellen Sie sicher, dass Dokumente im Datenverzeichnis vorhanden sind:
   ```
   data/
     document1.txt
     document2.txt
     ...
   ```

2. Überprüfen Sie den OpenAI API-Schlüssel:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## Weitere Informationen

Weitere Informationen finden Sie in der Dokumentation:

- [MongoDB-Integration für MCP Server](docs/mongodb_mcp_integration.md)
- [MongoDB-Integration-Zusammenfassung](mongodb_integration_summary.md) 