"""
Praktischer Test der MongoDB-Integration für VALEO-NeuroERP

Dieses Skript demonstriert die Verwendung der MongoDB-Integration
mit den Such- und RAG-Services des VALEO-NeuroERP-Systems.
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId

# Pfad zum Backend-Verzeichnis hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Korrekte Importe mit dem Backend-Präfix
from backend.mongodb_connector import MongoDBConnector
from backend.models.search_history import SearchQuery, SearchResult, SearchHistoryItem
from backend.models.search_history import RAGQueryHistoryItem, DocumentProcessingHistoryItem

# Umgebungsvariablen laden
load_dotenv()

def print_separator(title):
    """
    Gibt einen Separator mit Titel aus.
    """
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80 + "\n")

def test_mongodb_basic_operations():
    """
    Testet grundlegende MongoDB-Operationen.
    """
    print_separator("Test der grundlegenden MongoDB-Operationen")
    
    # MongoDB-Connector initialisieren
    print("MongoDB-Connector initialisieren...")
    mongodb = MongoDBConnector(db_name="valeo_neuroerp_demo")
    
    # Test-Collection
    test_collection = "demo_collection"
    
    # Collection leeren
    print("Collection leeren...")
    mongodb.delete_many(test_collection, {})
    
    # Dokument einfügen
    print("Dokument einfügen...")
    test_doc = {
        "name": "VALEO-NeuroERP",
        "version": "1.0",
        "features": ["Web-Suche", "RAG", "MongoDB-Integration"],
        "active": True
    }
    doc_id = mongodb.insert_one(test_collection, test_doc)
    print(f"Eingefügtes Dokument-ID: {doc_id}")
    
    # Dokument abrufen
    print("\nDokument abrufen...")
    # Konvertiere den String zurück zu einer ObjectId für die Abfrage
    found_doc = mongodb.find_one(test_collection, {"_id": ObjectId(doc_id)})
    
    if found_doc:
        print("Gefundenes Dokument:")
        print(f"  Name: {found_doc['name']}")
        print(f"  Version: {found_doc['version']}")
        print(f"  Features: {', '.join(found_doc['features'])}")
        print(f"  Aktiv: {found_doc['active']}")
        print(f"  Erstellt am: {found_doc['created_at']}")
    else:
        print("Dokument nicht gefunden!")
    
    # Mehrere Dokumente einfügen
    print("\nMehrere Dokumente einfügen...")
    test_docs = [
        {"name": "Dokument 1", "category": "A", "priority": 1},
        {"name": "Dokument 2", "category": "B", "priority": 2},
        {"name": "Dokument 3", "category": "A", "priority": 3}
    ]
    doc_ids = mongodb.insert_many(test_collection, test_docs)
    print(f"Eingefügte Dokument-IDs: {doc_ids}")
    
    # Alle Dokumente abrufen
    print("\nAlle Dokumente abrufen...")
    all_docs = mongodb.find_many(test_collection, {})
    print(f"Anzahl der Dokumente: {len(all_docs)}")
    
    # Nach Kategorie filtern
    print("\nNach Kategorie 'A' filtern...")
    category_a_docs = mongodb.find_many(test_collection, {"category": "A"})
    print(f"Anzahl der Dokumente in Kategorie A: {len(category_a_docs)}")
    for doc in category_a_docs:
        print(f"  Name: {doc['name']}, Priorität: {doc['priority']}")
    
    # Dokument aktualisieren
    print("\nDokument aktualisieren...")
    update_result = mongodb.update_one(
        test_collection,
        {"name": "Dokument 2"},
        {"$set": {"priority": 5, "updated": True}}
    )
    print(f"Aktualisierte Dokumente: {update_result}")
    
    # Aktualisiertes Dokument abrufen
    updated_doc = mongodb.find_one(test_collection, {"name": "Dokument 2"})
    if updated_doc:
        print("Aktualisiertes Dokument:")
        print(f"  Name: {updated_doc['name']}")
        print(f"  Priorität: {updated_doc['priority']}")
        print(f"  Aktualisiert: {updated_doc.get('updated', False)}")
        print(f"  Aktualisiert am: {updated_doc['updated_at']}")
    else:
        print("Aktualisiertes Dokument nicht gefunden!")
    
    # Dokument löschen
    print("\nDokument löschen...")
    delete_result = mongodb.delete_one(test_collection, {"name": "Dokument 3"})
    print(f"Gelöschte Dokumente: {delete_result}")
    
    # Verbleibende Dokumente zählen
    remaining_docs = mongodb.find_many(test_collection, {})
    print(f"Verbleibende Dokumente: {len(remaining_docs)}")
    
    # Collection leeren
    print("\nCollection leeren...")
    mongodb.delete_many(test_collection, {})
    
    # Verbindung schließen
    print("\nVerbindung schließen...")
    mongodb.close()

def test_search_history_models():
    """
    Testet die Suchhistorie-Modelle.
    """
    print_separator("Test der Suchhistorie-Modelle")
    
    # SearchQuery erstellen
    print("SearchQuery erstellen...")
    query = SearchQuery(
        query="VALEO-NeuroERP MongoDB Integration",
        search_type="sourcedAnswer",
        region="DE",
        language="de",
        time_period="day"
    )
    print(f"Query: {query.query}")
    print(f"Typ: {query.search_type}")
    print(f"Region: {query.region}")
    print(f"Sprache: {query.language}")
    print(f"Zeitraum: {query.time_period}")
    
    # SearchResult erstellen
    print("\nSearchResult erstellen...")
    result1 = SearchResult(
        title="MongoDB-Integration in VALEO-NeuroERP",
        snippet="Die Integration von MongoDB in das VALEO-NeuroERP-System ermöglicht...",
        url="https://example.com/valeo-neuroerp/mongodb",
        source="linkup"
    )
    result2 = SearchResult(
        title="VALEO-NeuroERP Dokumentation",
        snippet="VALEO-NeuroERP ist ein ERP-System mit KI-Integration...",
        url="https://example.com/valeo-neuroerp/docs",
        source="linkup"
    )
    print(f"Ergebnis 1: {result1.title}")
    print(f"Ergebnis 2: {result2.title}")
    
    # SearchHistoryItem erstellen
    print("\nSearchHistoryItem erstellen...")
    history_item = SearchHistoryItem(
        user_id="demo_user",
        query=query,
        results=[result1, result2],
        response_time_ms=450
    )
    print(f"Benutzer-ID: {history_item.user_id}")
    print(f"Abfrage: {history_item.query.query}")
    print(f"Anzahl der Ergebnisse: {len(history_item.results)}")
    print(f"Antwortzeit: {history_item.response_time_ms} ms")
    print(f"Zeitstempel: {history_item.timestamp}")
    
    # MongoDB-Format
    print("\nMongoDB-Format:")
    mongo_data = history_item.to_mongo()
    for key, value in mongo_data.items():
        if key == "results":
            print(f"  {key}: [{len(value)} Ergebnisse]")
        elif key == "query":
            print(f"  {key}: {value['query']}")
        else:
            print(f"  {key}: {value}")

def test_rag_history_models():
    """
    Testet die RAG-Historienmodelle.
    """
    print_separator("Test der RAG-Historienmodelle")
    
    # RAGQueryHistoryItem erstellen
    print("RAGQueryHistoryItem erstellen...")
    rag_item = RAGQueryHistoryItem(
        user_id="demo_user",
        query="Was ist die MongoDB-Integration in VALEO-NeuroERP?",
        document_paths=["docs/mongodb_integration.md", "docs/system_architecture.md"],
        answer="Die MongoDB-Integration in VALEO-NeuroERP ermöglicht die Speicherung von Suchanfragen und RAG-Abfragen...",
        response_time_ms=750
    )
    print(f"Benutzer-ID: {rag_item.user_id}")
    print(f"Abfrage: {rag_item.query}")
    print(f"Dokumente: {', '.join(rag_item.document_paths)}")
    print(f"Antwort: {rag_item.answer[:50]}...")
    print(f"Antwortzeit: {rag_item.response_time_ms} ms")
    print(f"Zeitstempel: {rag_item.timestamp}")
    
    # DocumentProcessingHistoryItem erstellen
    print("\nDocumentProcessingHistoryItem erstellen...")
    doc_item = DocumentProcessingHistoryItem(
        user_id="demo_user",
        document_path="docs/mongodb_integration.md",
        document_type="markdown",
        status="success",
        processing_time_ms=350
    )
    print(f"Benutzer-ID: {doc_item.user_id}")
    print(f"Dokument: {doc_item.document_path}")
    print(f"Dokumenttyp: {doc_item.document_type}")
    print(f"Status: {doc_item.status}")
    print(f"Verarbeitungszeit: {doc_item.processing_time_ms} ms")
    print(f"Zeitstempel: {doc_item.timestamp}")
    
    # Fehlerfall simulieren
    print("\nFehlerfall simulieren...")
    error_item = DocumentProcessingHistoryItem(
        user_id="demo_user",
        document_path="docs/missing_document.pdf",
        document_type="pdf",
        status="error",
        error_message="Datei nicht gefunden",
        processing_time_ms=120
    )
    print(f"Dokument: {error_item.document_path}")
    print(f"Status: {error_item.status}")
    print(f"Fehlermeldung: {error_item.error_message}")

def test_mongodb_integration():
    """
    Testet die Integration von MongoDB mit den Modellen.
    """
    print_separator("Test der MongoDB-Integration mit den Modellen")
    
    # MongoDB-Connector initialisieren
    print("MongoDB-Connector initialisieren...")
    mongodb = MongoDBConnector(db_name="valeo_neuroerp_demo")
    
    # Collections
    search_history_collection = "search_history"
    rag_query_collection = "rag_query_history"
    document_processing_collection = "document_processing_history"
    
    # Collections leeren
    print("Collections leeren...")
    mongodb.delete_many(search_history_collection, {})
    mongodb.delete_many(rag_query_collection, {})
    mongodb.delete_many(document_processing_collection, {})
    
    # SearchHistoryItem erstellen und speichern
    print("\nSuchhistorie speichern...")
    query = SearchQuery(
        query="VALEO-NeuroERP MongoDB",
        search_type="sourcedAnswer"
    )
    result = SearchResult(
        title="MongoDB-Integration in VALEO-NeuroERP",
        snippet="Die Integration von MongoDB in das VALEO-NeuroERP-System...",
        url="https://example.com/valeo-neuroerp/mongodb",
        source="linkup"
    )
    search_item = SearchHistoryItem(
        user_id="demo_user",
        query=query,
        results=[result],
        response_time_ms=450
    )
    search_id = mongodb.insert_one(search_history_collection, search_item.to_mongo())
    print(f"Gespeicherte Suchhistorie-ID: {search_id}")
    
    # RAGQueryHistoryItem erstellen und speichern
    print("\nRAG-Abfragehistorie speichern...")
    rag_item = RAGQueryHistoryItem(
        user_id="demo_user",
        query="Was ist die MongoDB-Integration?",
        document_paths=["docs/mongodb_integration.md"],
        answer="Die MongoDB-Integration ermöglicht...",
        response_time_ms=750
    )
    rag_id = mongodb.insert_one(rag_query_collection, rag_item.to_mongo())
    print(f"Gespeicherte RAG-Abfragehistorie-ID: {rag_id}")
    
    # DocumentProcessingHistoryItem erstellen und speichern
    print("\nDokumentenverarbeitungshistorie speichern...")
    doc_item = DocumentProcessingHistoryItem(
        user_id="demo_user",
        document_path="docs/mongodb_integration.md",
        document_type="markdown",
        status="success",
        processing_time_ms=350
    )
    doc_id = mongodb.insert_one(document_processing_collection, doc_item.to_mongo())
    print(f"Gespeicherte Dokumentenverarbeitungshistorie-ID: {doc_id}")
    
    # Daten abrufen
    print("\nDaten abrufen...")
    
    # Suchhistorie abrufen
    search_history = mongodb.find_many(search_history_collection, {})
    print(f"Anzahl der Suchhistorieneinträge: {len(search_history)}")
    for item in search_history:
        print(f"  Abfrage: {item['query']['query']}")
        print(f"  Benutzer: {item['user_id']}")
        print(f"  Zeitstempel: {item['timestamp']}")
    
    # RAG-Abfragehistorie abrufen
    rag_history = mongodb.find_many(rag_query_collection, {})
    print(f"\nAnzahl der RAG-Abfragehistorieneinträge: {len(rag_history)}")
    for item in rag_history:
        print(f"  Abfrage: {item['query']}")
        print(f"  Benutzer: {item['user_id']}")
        print(f"  Zeitstempel: {item['timestamp']}")
    
    # Dokumentenverarbeitungshistorie abrufen
    doc_history = mongodb.find_many(document_processing_collection, {})
    print(f"\nAnzahl der Dokumentenverarbeitungshistorieneinträge: {len(doc_history)}")
    for item in doc_history:
        print(f"  Dokument: {item['document_path']}")
        print(f"  Status: {item['status']}")
        print(f"  Benutzer: {item['user_id']}")
        print(f"  Zeitstempel: {item['timestamp']}")
    
    # Collections leeren
    print("\nCollections leeren...")
    mongodb.delete_many(search_history_collection, {})
    mongodb.delete_many(rag_query_collection, {})
    mongodb.delete_many(document_processing_collection, {})
    
    # Verbindung schließen
    print("\nVerbindung schließen...")
    mongodb.close()

def main():
    """
    Hauptfunktion zum Ausführen der Tests.
    """
    print_separator("VALEO-NeuroERP MongoDB-Integration Test")
    print("Datum und Uhrzeit:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("Dieser Test demonstriert die MongoDB-Integration im VALEO-NeuroERP-System.\n")
    
    try:
        # Grundlegende MongoDB-Operationen testen
        test_mongodb_basic_operations()
        
        # Suchhistorie-Modelle testen
        test_search_history_models()
        
        # RAG-Historienmodelle testen
        test_rag_history_models()
        
        # MongoDB-Integration mit den Modellen testen
        test_mongodb_integration()
        
        print_separator("Test abgeschlossen")
        print("Alle Tests wurden erfolgreich durchgeführt.")
        
    except Exception as e:
        print("\nFEHLER:", str(e))
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 