# CREATE-Phase: Berichtsmodul mit MongoDB-Integration für MCP RAG

## Übersicht

In der CREATE-Phase wird das Berichtsmodul mit MongoDB-Integration für MCP RAG (Retrieval Augmented Generation) implementiert. Der Fokus liegt auf der Erstellung effizienter Komponenten für Systemüberwachung und minimale Berichterstellung.

## Implementierungsziele

1. **Minimale Berichterstellung**
   - Nur notwendige Informationen anzeigen
   - Warnungen bei kritischen Systemzuständen
   - Effiziente Datenverarbeitung

2. **MongoDB-Integration für MCP RAG**
   - Speicherung von Web-Suchergebnissen
   - Protokollierung von RAG-Abfragen
   - Optimierung für minimalen Speicherverbrauch

3. **Systemüberwachung**
   - Überwachung kritischer Metriken (CPU, Speicher, Festplatte)
   - Warnungen bei Grenzwertüberschreitungen
   - Automatische Benachrichtigung bei Systemausfällen

## Architekturkomponenten

### Backend-Komponenten

1. **ReportService**
   - Grundlegende Berichtsfunktionen
   - Asynchrone Verarbeitung mit Celery
   - Integration mit MongoDB für Berichtsdaten

2. **SystemMonitorService**
   - Überwachung von Systemmetriken
   - Erkennung kritischer Zustände
   - Benachrichtigungssystem

3. **MCPMongoDBConnector**
   - CRUD-Operationen für MongoDB
   - Optimierte Abfragen
   - Verbindungspooling

4. **MCP RAG-Integration**
   - Web-Suche mit Ergebnisspeicherung
   - RAG-Abfragen mit Protokollierung
   - Optimierung der Wissensbasis

### Frontend-Komponenten

1. **SystemStatusDashboard**
   - Anzeige kritischer Systemzustände
   - Warnungen bei Grenzwertüberschreitungen
   - Echtzeit-Updates

2. **ReportViewer**
   - Minimale Berichtsanzeige
   - Filterung nach Wichtigkeit
   - Exportfunktionen

## Datenmodelle

### MongoDB-Schemas

1. **SearchHistory**
   ```javascript
   {
     _id: ObjectId,
     query: String,
     timestamp: Date,
     results: Array,
     user_id: String,
     context: Object
   }
   ```

2. **RAGHistory**
   ```javascript
   {
     _id: ObjectId,
     query: String,
     timestamp: Date,
     response: String,
     documents: Array,
     performance_metrics: Object
   }
   ```

3. **SystemStatus**
   ```javascript
   {
     _id: ObjectId,
     timestamp: Date,
     metrics: {
       cpu_usage: Number,
       memory_usage: Number,
       disk_usage: Number,
       services: Array
     },
     warnings: Array,
     critical_issues: Array
   }
   ```

### SQL-Datenmodelle

1. **Report**
   - Grundlegende Berichtsinformationen
   - Konfiguration und Parameter
   - Beziehungen zu anderen Entitäten

2. **ReportSchedule**
   - Zeitplaninformationen
   - Wiederholungseinstellungen
   - Beziehung zum Bericht

3. **ReportFile**
   - Generierte Berichtsdateien
   - Metadaten und Speicherort
   - Beziehung zum Bericht

## Implementierungsdetails

### MongoDB-Integration

```python
class MCPMongoDBConnector:
    """MongoDB-Connector für MCP-Integration."""
    
    def __init__(self, uri: str = None, db_name: str = None):
        """Initialisiert den MongoDB-Connector."""
        self.uri = uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.db_name = db_name or os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")
        self.client = MongoClient(self.uri)
        self.db = self.client[self.db_name]
        
    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Fügt ein Dokument in die Sammlung ein."""
        result = self.db[collection_name].insert_one(document)
        return str(result.inserted_id)
        
    async def find_one(self, collection_name: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Findet ein Dokument in der Sammlung."""
        return self.db[collection_name].find_one(query)
        
    async def find_many(self, collection_name: str, query: Dict[str, Any], limit: int = 100) -> List[Dict[str, Any]]:
        """Findet mehrere Dokumente in der Sammlung."""
        return list(self.db[collection_name].find(query).limit(limit))
        
    async def update_one(self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any]) -> int:
        """Aktualisiert ein Dokument in der Sammlung."""
        result = self.db[collection_name].update_one(query, {"$set": update})
        return result.modified_count
        
    async def delete_one(self, collection_name: str, query: Dict[str, Any]) -> int:
        """Löscht ein Dokument aus der Sammlung."""
        result = self.db[collection_name].delete_one(query)
        return result.deleted_count
```

### Systemüberwachung

```python
class SystemMonitorService:
    """Service zur Überwachung des Systemzustands."""
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_system_status(self) -> Dict[str, Any]:
        """Ruft den aktuellen Systemstatus ab."""
        status = {
            "status": "ok",
            "warnings": [],
            "critical_issues": [],
            "timestamp": datetime.now(),
            "metrics": {
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent,
                "services": self._check_services()
            }
        }
        
        # Warnungen hinzufügen, wenn Metriken kritische Werte überschreiten
        if status["metrics"]["cpu_usage"] > 90:
            status["warnings"].append("CPU-Auslastung über 90%")
            
        if status["metrics"]["memory_usage"] > 90:
            status["warnings"].append("Speicherauslastung über 90%")
            
        if status["metrics"]["disk_usage"] > 90:
            status["warnings"].append("Festplattenauslastung über 90%")
            
        # Status auf "warning" oder "critical" setzen, wenn Warnungen vorhanden sind
        if any(service["status"] == "down" for service in status["metrics"]["services"]):
            status["status"] = "critical"
            status["critical_issues"].append("Ein oder mehrere Dienste sind ausgefallen")
        elif status["warnings"]:
            status["status"] = "warning"
            
        return status
        
    def _check_services(self) -> List[Dict[str, Any]]:
        """Überprüft den Status der Dienste."""
        services = []
        
        # Beispiel für die Überprüfung von Diensten
        services.append(self._check_service("database", "MongoDB"))
        services.append(self._check_service("api", "FastAPI"))
        services.append(self._check_service("celery", "Celery Worker"))
        services.append(self._check_service("redis", "Redis"))
        
        return services
        
    def _check_service(self, service_type: str, service_name: str) -> Dict[str, Any]:
        """Überprüft den Status eines Dienstes."""
        # Hier würde die tatsächliche Überprüfung des Dienstes erfolgen
        # Für dieses Beispiel wird ein zufälliger Status zurückgegeben
        import random
        
        # 95% Wahrscheinlichkeit für "up", 5% für "down"
        status = "up" if random.random() < 0.95 else "down"
        
        return {
            "type": service_type,
            "name": service_name,
            "status": status,
            "last_check": datetime.now()
        }
```

### MCP RAG-Integration

```python
@mcp.tool()
def web_search(query: str, user_id: Optional[str] = None) -> str:
    """Führt eine Websuche durch und speichert die Ergebnisse in MongoDB."""
    # Websuche durchführen
    results = client.search(query)
    
    # Ergebnisse in MongoDB speichern
    search_history = {
        "query": query,
        "timestamp": datetime.now(),
        "results": results,
        "user_id": user_id,
        "context": {"source": "web_search_tool"}
    }
    
    search_history_collection.insert_one(search_history)
    
    return results

@mcp.tool()
def rag_query(query: str, context: Optional[Dict[str, Any]] = None) -> str:
    """Führt eine RAG-Abfrage durch und speichert die Ergebnisse in MongoDB."""
    # RAG-Abfrage durchführen
    start_time = time.time()
    response, documents = rag_workflow.query(query, context)
    end_time = time.time()
    
    # Ergebnisse in MongoDB speichern
    rag_history = {
        "query": query,
        "timestamp": datetime.now(),
        "response": response,
        "documents": documents,
        "performance_metrics": {
            "execution_time": end_time - start_time,
            "document_count": len(documents)
        }
    }
    
    rag_history_collection.insert_one(rag_history)
    
    return response
```

## Tests

### Unit-Tests

1. **MCPMongoDBConnector-Tests**
   - Verbindungsaufbau
   - CRUD-Operationen
   - Fehlerbehandlung

2. **SystemMonitorService-Tests**
   - Statusabfrage
   - Warnungserkennung
   - Dienststatus-Überprüfung

3. **ReportService-Tests**
   - Berichtserstellung
   - Zeitplanverwaltung
   - Dateiexport

### Integrationstests

1. **MongoDB-Integration**
   - Verbindung zur Datenbank
   - Datenpersistenz
   - Abfrageleistung

2. **MCP RAG-Integration**
   - Web-Suche mit Speicherung
   - RAG-Abfragen mit Protokollierung
   - Leistungsmessung

## Nächste Schritte

1. **Implementierung der Datenmodelle**
   - MongoDB-Schemas erstellen
   - SQL-Datenmodelle implementieren
   - Migrationen erstellen

2. **Implementierung der Services**
   - ReportService implementieren
   - SystemMonitorService implementieren
   - MCPMongoDBConnector implementieren

3. **Frontend-Entwicklung**
   - SystemStatusDashboard erstellen
   - ReportViewer implementieren
   - Integration mit Backend-API

4. **Tests und Dokumentation**
   - Unit-Tests schreiben
   - Integrationstests schreiben
   - Dokumentation erstellen 