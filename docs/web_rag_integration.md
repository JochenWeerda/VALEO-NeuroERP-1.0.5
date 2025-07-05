# VALEO-NeuroERP Web-Suche und RAG-Integration

Diese Dokumentation beschreibt die Integration von Web-Suche und RAG-Funktionalitäten in das VALEO-NeuroERP-System.

## Architektur

Die Integration besteht aus folgenden Komponenten:

1. **FastAPI-Server**: Stellt REST-API-Endpunkte für Web-Suche, RAG-Abfragen und Dokumentenverarbeitung bereit.
2. **Linkup API**: Ermöglicht die Web-Suche mit verschiedenen Suchtypen und Parametern.
3. **LangChain und FAISS**: Implementiert das RAG-System mit Vektorindex für dokumentenbasierte Abfragen.
4. **LibreOffice-Prozessor**: Extrahiert Text aus LibreOffice-Dokumenten für das RAG-System.
5. **MongoDB-Datenbank**: Speichert die Suchhistorie, RAG-Abfragehistorie und Dokumentenverarbeitungshistorie.

## Komponenten

### MongoDB-Connector

Der MongoDB-Connector stellt die Verbindung zur MongoDB-Datenbank her und bietet grundlegende Operationen für die Speicherung und den Abruf von Daten.

```python
from backend.mongodb_connector import MongoDBConnector

# MongoDB-Connector initialisieren
mongodb_connector = MongoDBConnector(connection_string="mongodb://localhost:27017/")

# Dokument einfügen
document_id = mongodb_connector.insert_one("collection_name", {"key": "value"})

# Dokumente abfragen
results = mongodb_connector.find_many("collection_name", {"key": "value"}, limit=10)
```

### Such-Service

Der Such-Service implementiert die Web-Suche mit der Linkup API und speichert die Suchergebnisse in der MongoDB-Datenbank.

```python
from backend.services.search_service import SearchService

# Such-Service initialisieren
search_service = SearchService(linkup_api_key="your-api-key", mongodb_connector=mongodb_connector)

# Web-Suche durchführen
results = search_service.perform_web_search(
    query="VALEO-NeuroERP",
    search_type="sourcedAnswer",
    language="de"
)

# Suchhistorie abrufen
history = search_service.get_search_history(limit=10)
```

### RAG-Service

Der RAG-Service implementiert die Dokumentenverarbeitung und RAG-Abfragen und speichert die Ergebnisse in der MongoDB-Datenbank.

```python
from backend.services.rag_service import RAGService

# RAG-Service initialisieren
rag_service = RAGService(openai_api_key="your-api-key", mongodb_connector=mongodb_connector)

# Dokument verarbeiten
result = rag_service.process_document("path/to/document.odt")

# RAG-Abfrage durchführen
answer = rag_service.perform_rag_query(
    query="Was ist VALEO-NeuroERP?",
    document_paths=["path/to/document.odt"]
)

# RAG-Abfragehistorie abrufen
history = rag_service.get_rag_query_history(limit=10)
```

### LibreOffice-Prozessor

Der LibreOffice-Prozessor extrahiert Text aus LibreOffice-Dokumenten mit zwei Methoden:

1. **UNO-Bridge**: Direkte Kommunikation mit LibreOffice für die Textextraktion.
2. **Konvertierung**: Fallback-Methode, die das Dokument in ein Textformat konvertiert.

```python
from backend.libreoffice_processor import LibreOfficeProcessor

# LibreOffice-Prozessor initialisieren
processor = LibreOfficeProcessor()

# Text aus Dokument extrahieren
text = processor.extract_text("path/to/document.odt")
```

## Datenmodelle

Die folgenden Pydantic-Modelle werden für die API-Anfragen und -Antworten sowie für die MongoDB-Speicherung verwendet:

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
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = None
    query: SearchQuery
    results: List[SearchResult] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
```

### RAG-Abfragehistorie

```python
class RAGQueryHistoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = None
    query: str
    document_paths: List[str] = []
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
```

### Dokumentenverarbeitungshistorie

```python
class DocumentProcessingHistoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = None
    document_path: str
    document_type: str
    status: str  # "success", "error"
    error_message: Optional[str] = None
    processing_time_ms: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

## API-Endpunkte

Die folgenden API-Endpunkte sind verfügbar:

### Web-Suche

```
POST /api/search
```

Führt eine Web-Suche mit der Linkup API durch.

**Anfrage:**

```json
{
  "query": "VALEO-NeuroERP",
  "search_type": "sourcedAnswer",
  "language": "de",
  "user_id": "user123"
}
```

**Antwort:**

```json
{
  "results": [...],
  "answer": "VALEO-NeuroERP ist ein ERP-System mit KI-Integration...",
  "sources": [...],
  "response_time_ms": 1234
}
```

### RAG-Abfrage

```
POST /api/rag/query
```

Führt eine RAG-Abfrage durch.

**Anfrage:**

```json
{
  "query": "Was ist VALEO-NeuroERP?",
  "document_paths": ["path/to/document.odt"],
  "user_id": "user123"
}
```

**Antwort:**

```json
{
  "answer": "VALEO-NeuroERP ist ein ERP-System mit KI-Integration...",
  "response_time_ms": 1234
}
```

### Dokumentenverarbeitung

```
POST /api/documents/process
```

Verarbeitet ein Dokument und fügt es zum Vektorindex hinzu.

**Anfrage:**

```json
{
  "document_path": "path/to/document.odt",
  "user_id": "user123"
}
```

**Antwort:**

```json
{
  "status": "success",
  "message": "Dokument erfolgreich verarbeitet: path/to/document.odt",
  "document_type": "libreoffice_writer",
  "processing_time_ms": 1234
}
```

### Dokumenten-Upload

```
POST /api/documents/upload
```

Lädt ein Dokument hoch und verarbeitet es optional für das RAG-System.

**Anfrage:**

Multipart-Formular mit:
- `file`: Datei
- `user_id`: Benutzer-ID (optional)
- `process`: Boolean (optional)

**Antwort:**

```json
{
  "status": "success",
  "message": "Datei erfolgreich hochgeladen: document.odt",
  "file_path": "uploads/document.odt",
  "processing": {
    "status": "success",
    "message": "Dokument erfolgreich verarbeitet: uploads/document.odt",
    "document_type": "libreoffice_writer",
    "processing_time_ms": 1234
  }
}
```

### Suchhistorie abrufen

```
GET /api/search/history
```

Ruft die Suchhistorie ab.

**Parameter:**
- `user_id`: Benutzer-ID (optional)
- `limit`: Maximale Anzahl der zurückzugebenden Einträge (optional, Standard: 10)

**Antwort:**

```json
{
  "items": [...],
  "count": 10
}
```

### RAG-Abfragehistorie abrufen

```
GET /api/rag/history
```

Ruft die RAG-Abfragehistorie ab.

**Parameter:**
- `user_id`: Benutzer-ID (optional)
- `limit`: Maximale Anzahl der zurückzugebenden Einträge (optional, Standard: 10)

**Antwort:**

```json
{
  "items": [...],
  "count": 10
}
```

### Dokumentenverarbeitungshistorie abrufen

```
GET /api/documents/history
```

Ruft die Dokumentenverarbeitungshistorie ab.

**Parameter:**
- `user_id`: Benutzer-ID (optional)
- `status`: Status der Verarbeitung (optional, "success" oder "error")
- `limit`: Maximale Anzahl der zurückzugebenden Einträge (optional, Standard: 10)

**Antwort:**

```json
{
  "items": [...],
  "count": 10
}
```

### Historien löschen

```
DELETE /api/search/history
DELETE /api/rag/history
DELETE /api/documents/history
```

Löscht die jeweilige Historie.

**Parameter:**
- `user_id`: Benutzer-ID (optional)

**Antwort:**

```json
{
  "status": "success",
  "message": "10 Einträge gelöscht",
  "deleted_count": 10
}
```

### Gesundheitscheck

```
GET /api/health
```

Führt einen Gesundheitscheck der API durch.

**Antwort:**

```json
{
  "status": "healthy",
  "timestamp": "2025-06-24T07:00:00.000Z",
  "services": {
    "mongodb": "connected"
  }
}
```

## Konfiguration

Die Konfiguration erfolgt über Umgebungsvariablen in einer `.env`-Datei:

```
LINKUP_API_KEY=your-linkup-api-key
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://localhost:27017/
```

## Installation und Start

1. Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

2. MongoDB-Server starten (falls lokal):

```bash
mongod --dbpath /path/to/data/db
```

3. Server starten:

```bash
cd backend
python main.py
```

Der Server ist dann unter `http://localhost:8000` erreichbar.

## Integration in VALEO-NeuroERP

Die Integration in das bestehende VALEO-NeuroERP-System erfolgt über die REST-API-Endpunkte. Die Frontend-Komponenten können die API-Endpunkte aufrufen, um Web-Suche und dokumentenbasierte Abfragen durchzuführen.
