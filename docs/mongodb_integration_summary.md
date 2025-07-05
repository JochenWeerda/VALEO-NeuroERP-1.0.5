# MongoDB-Integration für VALEO-NeuroERP

Diese Dokumentation fasst die Integration von MongoDB in das VALEO-NeuroERP-System zusammen.

## Implementierte Komponenten

1. **MongoDB-Connector** (`backend/mongodb_connector.py`)
   - Grundlegende CRUD-Operationen für MongoDB
   - Verbindungsmanagement und Collection-Zugriff
   - Automatische Zeitstempelverwaltung für Dokumente

2. **Datenmodelle** (`backend/models/search_history.py`)
   - Pydantic v2-kompatible Modelle für MongoDB-Dokumente
   - Modelle für Suchhistorie, RAG-Abfragen und Dokumentenverarbeitung
   - ObjectId-Handling für MongoDB-Kompatibilität

3. **Services**
   - **SearchService** (`backend/services/search_service.py`) für Web-Suche mit Linkup API und MongoDB-Speicherung
   - **RAGService** (`backend/services/rag_service.py`) für RAG-Abfragen und Dokumentenverarbeitung mit MongoDB-Integration

4. **Tests**
   - **Unit-Tests** (`backend/tests/test_mongodb_integration.py`) für den MongoDB-Connector und die Modelle
   - **Service-Integration-Tests** (`backend/tests/test_service_integration.py`) für die Integration der Services mit MongoDB
   - **Praktischer Test** (`backend/tests/run_mongodb_test.py`) für die Demonstration der MongoDB-Integration

## Datenmodelle

Die folgenden Datenmodelle wurden für die MongoDB-Integration implementiert:

### Suchhistorie

```python
class SearchQuery(BaseModel):
    query: str
    search_type: str
    region: Optional[str] = None
    language: Optional[str] = None
    time_period: Optional[str] = None

class SearchResult(BaseModel):
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None
    source: str
    content: Optional[str] = None

class SearchHistoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    query: SearchQuery
    results: List[SearchResult] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
```

### RAG-Abfragen

```python
class RAGQueryHistoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    query: str
    document_paths: List[str] = []
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
```

### Dokumentenverarbeitung

```python
class DocumentProcessingHistoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[str] = None
    document_path: str
    document_type: str
    status: str  # "success", "error"
    error_message: Optional[str] = None
    processing_time_ms: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

## MongoDB-Connector

Der MongoDB-Connector bietet folgende Funktionen:

- **Verbindungsmanagement**: Herstellen und Schließen der Verbindung zur MongoDB-Datenbank
- **Collection-Zugriff**: Zugriff auf MongoDB-Collections
- **CRUD-Operationen**:
  - `insert_one`: Einfügen eines Dokuments
  - `insert_many`: Einfügen mehrerer Dokumente
  - `find_one`: Finden eines Dokuments
  - `find_many`: Finden mehrerer Dokumente
  - `update_one`: Aktualisieren eines Dokuments
  - `update_many`: Aktualisieren mehrerer Dokumente
  - `delete_one`: Löschen eines Dokuments
  - `delete_many`: Löschen mehrerer Dokumente
- **Index-Verwaltung**: Erstellen von Indizes für Collections

## Services

### SearchService

Der SearchService integriert die Web-Suche mit der Linkup API und speichert die Suchergebnisse in der MongoDB-Datenbank:

- **Web-Suche**: Durchführung von Web-Suchen mit der Linkup API
- **Suchhistorie**: Speicherung der Suchergebnisse in der MongoDB-Datenbank
- **Historien-Verwaltung**: Abrufen und Löschen der Suchhistorie

### RAGService

Der RAGService implementiert die Dokumentenverarbeitung und RAG-Abfragen und speichert die Ergebnisse in der MongoDB-Datenbank:

- **Dokumentenverarbeitung**: Verarbeitung von Dokumenten für das RAG-System
- **RAG-Abfragen**: Durchführung von RAG-Abfragen mit LangChain und FAISS
- **Historien-Verwaltung**: Abrufen und Löschen der RAG-Abfragehistorie und Dokumentenverarbeitungshistorie

## Tests

Die Tests überprüfen die korrekte Funktionsweise der MongoDB-Integration:

- **Unit-Tests**: Testen der grundlegenden Funktionen des MongoDB-Connectors und der Pydantic-Modelle
- **Service-Integration-Tests**: Testen der Integration der Services mit MongoDB
- **Praktischer Test**: Demonstration der MongoDB-Integration mit praktischen Beispielen

## Konfiguration

Die MongoDB-Integration wird über Umgebungsvariablen konfiguriert:

```
MONGODB_URI=mongodb://localhost:27017/
LINKUP_API_KEY=your-linkup-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Fazit

Die MongoDB-Integration für das VALEO-NeuroERP-System wurde erfolgreich implementiert und getestet. Sie bietet eine robuste Basis für die Speicherung und Verwaltung von Suchergebnissen, RAG-Abfragen und Dokumentenverarbeitungshistorien. Die Integration ist modular aufgebaut und kann leicht erweitert werden, um weitere Funktionen zu unterstützen. 