# Tests für die MongoDB-Integration in VALEO-NeuroERP

Diese Tests überprüfen die Integration von MongoDB in das VALEO-NeuroERP-System für die Web-Suche und RAG-Funktionalitäten.

## Voraussetzungen

- MongoDB-Server (lokal oder remote)
- Python-Abhängigkeiten aus `requirements.txt`
- Konfigurierte `.env`-Datei mit den erforderlichen Umgebungsvariablen

## Umgebungsvariablen

Stellen Sie sicher, dass die folgenden Umgebungsvariablen in einer `.env`-Datei im Hauptverzeichnis definiert sind:

```
MONGODB_URI=mongodb://localhost:27017/
LINKUP_API_KEY=your-linkup-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Verfügbare Tests

### Einheitentests

1. **test_mongodb_integration.py** - Testet die grundlegenden Funktionen des MongoDB-Connectors und die Pydantic-Modelle für die Suchhistorie.

   ```bash
   python -m unittest backend/tests/test_mongodb_integration.py
   ```

2. **test_service_integration.py** - Testet die Integration der MongoDB-Datenbank mit den Such- und RAG-Services.

   ```bash
   python -m unittest backend/tests/test_service_integration.py
   ```

### Praktische Tests

1. **run_mongodb_test.py** - Demonstriert die Verwendung der MongoDB-Integration mit praktischen Beispielen.

   ```bash
   python backend/tests/run_mongodb_test.py
   ```

## Testdatenbank

Die Tests verwenden eine separate Testdatenbank (`valeo_neuroerp_test` oder `valeo_neuroerp_demo`), um die Produktionsdaten nicht zu beeinträchtigen. Die Testdatenbank wird vor und nach den Tests geleert.

## Fehlerbehebung

Wenn die Tests fehlschlagen, überprüfen Sie folgende Punkte:

1. **MongoDB-Verbindung**: Stellen Sie sicher, dass der MongoDB-Server läuft und über die angegebene URI erreichbar ist.

   ```bash
   mongod --dbpath /path/to/data/db
   ```

2. **Umgebungsvariablen**: Überprüfen Sie, ob die Umgebungsvariablen korrekt gesetzt sind.

3. **Python-Abhängigkeiten**: Stellen Sie sicher, dass alle erforderlichen Python-Pakete installiert sind.

   ```bash
   pip install -r requirements.txt
   ```

4. **Berechtigungen**: Überprüfen Sie, ob der MongoDB-Benutzer die erforderlichen Berechtigungen hat.

## Mocking

Die Tests für die Such- und RAG-Services verwenden Mocks für externe Abhängigkeiten wie die Linkup API, OpenAI und FAISS, um die Tests unabhängig von diesen externen Diensten durchführen zu können. 