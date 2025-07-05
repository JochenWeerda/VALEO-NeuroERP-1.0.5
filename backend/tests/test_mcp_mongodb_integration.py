"""
Test der MongoDB-Integration mit dem MCP Server für VALEO-NeuroERP

Dieses Skript testet die Integration von MongoDB mit dem MCP Server
für Web-Suche und RAG-Abfragen.
"""

import os
import sys
import asyncio
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
import requests

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pfad zum Backend-Verzeichnis hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Korrekte Importe mit dem Backend-Präfix
from backend.mongodb_connector import MongoDBConnector

# Umgebungsvariablen laden
load_dotenv()

# MCP Server URL
MCP_SERVER_URL = "http://localhost:8001/tools"

def print_separator(title):
    """
    Gibt einen Separator mit Titel aus.
    """
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80 + "\n")

def call_mcp_tool(tool_name, parameters):
    """
    Ruft ein Tool des MCP Servers auf.
    """
    payload = {
        "tool_name": tool_name,
        "parameters": parameters
    }
    
    try:
        response = requests.post(MCP_SERVER_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Fehler beim Aufrufen des MCP Tools {tool_name}: {str(e)}")
        return {"error": str(e)}

def test_web_search():
    """
    Testet die Web-Suche mit MongoDB-Integration.
    """
    print_separator("Test der Web-Suche mit MongoDB-Integration")
    
    # Web-Suche durchführen
    print("Web-Suche durchführen...")
    search_query = "VALEO-NeuroERP MongoDB Integration"
    user_id = "test_user"
    
    response = call_mcp_tool("web_search", {
        "query": search_query,
        "user_id": user_id,
        "search_type": "sourcedAnswer",
        "language": "de",
        "region": "DE"
    })
    
    if "error" in response:
        print(f"Fehler bei der Web-Suche: {response['error']}")
        return False
    
    print("Web-Suche erfolgreich!")
    
    # Suchhistorie abrufen
    print("\nSuchhistorie abrufen...")
    history_response = call_mcp_tool("get_search_history", {
        "user_id": user_id,
        "limit": 5
    })
    
    if "error" in history_response:
        print(f"Fehler beim Abrufen der Suchhistorie: {history_response['error']}")
        return False
    
    items = history_response.get("items", [])
    print(f"Anzahl der Suchhistorieneinträge: {len(items)}")
    
    # Überprüfen, ob unsere Suche in der Historie ist
    found = False
    for item in items:
        if item["query"]["query"] == search_query:
            found = True
            print(f"Suchanfrage gefunden: {item['query']['query']}")
            print(f"Zeitstempel: {item['timestamp']}")
            print(f"Anzahl der Ergebnisse: {len(item.get('results', []))}")
            break
    
    if not found:
        print("Suchanfrage nicht in der Historie gefunden!")
        return False
    
    return True

def test_rag_query():
    """
    Testet die RAG-Abfrage mit MongoDB-Integration.
    """
    print_separator("Test der RAG-Abfrage mit MongoDB-Integration")
    
    # RAG-Abfrage durchführen
    print("RAG-Abfrage durchführen...")
    question = "Was ist VALEO-NeuroERP?"
    user_id = "test_user"
    
    response = call_mcp_tool("rag_query", {
        "question": question,
        "user_id": user_id
    })
    
    if "error" in response:
        print(f"Fehler bei der RAG-Abfrage: {response['error']}")
        return False
    
    print("RAG-Abfrage erfolgreich!")
    print(f"Antwort: {response.get('result', '')[:100]}...")
    
    # RAG-Abfragehistorie abrufen
    print("\nRAG-Abfragehistorie abrufen...")
    history_response = call_mcp_tool("get_rag_history", {
        "user_id": user_id,
        "limit": 5
    })
    
    if "error" in history_response:
        print(f"Fehler beim Abrufen der RAG-Abfragehistorie: {history_response['error']}")
        return False
    
    items = history_response.get("items", [])
    print(f"Anzahl der RAG-Abfragehistorieneinträge: {len(items)}")
    
    # Überprüfen, ob unsere Abfrage in der Historie ist
    found = False
    for item in items:
        if item["query"] == question:
            found = True
            print(f"RAG-Abfrage gefunden: {item['query']}")
            print(f"Zeitstempel: {item['timestamp']}")
            print(f"Antwort: {item.get('answer', '')[:50]}...")
            break
    
    if not found:
        print("RAG-Abfrage nicht in der Historie gefunden!")
        return False
    
    return True

def test_document_history():
    """
    Testet die Dokumentenverarbeitungshistorie.
    """
    print_separator("Test der Dokumentenverarbeitungshistorie")
    
    # Dokumentenverarbeitungshistorie abrufen
    print("Dokumentenverarbeitungshistorie abrufen...")
    
    response = call_mcp_tool("get_document_history", {
        "limit": 10
    })
    
    if "error" in response:
        print(f"Fehler beim Abrufen der Dokumentenverarbeitungshistorie: {response['error']}")
        return False
    
    items = response.get("items", [])
    print(f"Anzahl der Dokumentenverarbeitungshistorieneinträge: {len(items)}")
    
    if len(items) > 0:
        print("\nDetails zum ersten Eintrag:")
        item = items[0]
        print(f"Dokument: {item.get('document_path', '')}")
        print(f"Status: {item.get('status', '')}")
        print(f"Dokumenttyp: {item.get('document_type', '')}")
        print(f"Verarbeitungszeit: {item.get('processing_time_ms', '')} ms")
        print(f"Zeitstempel: {item.get('timestamp', '')}")
    else:
        print("Keine Dokumentenverarbeitungshistorieneinträge gefunden!")
    
    return True

def test_mongodb_connection():
    """
    Testet die direkte Verbindung zur MongoDB.
    """
    print_separator("Test der direkten MongoDB-Verbindung")
    
    try:
        # MongoDB-Connector initialisieren
        print("MongoDB-Connector initialisieren...")
        mongodb = MongoDBConnector()
        
        # Collections überprüfen
        collections = ["search_history", "rag_query_history", "document_processing_history"]
        
        for collection in collections:
            count = len(mongodb.find_many(collection, {}))
            print(f"Anzahl der Einträge in {collection}: {count}")
        
        # Verbindung schließen
        mongodb.close()
        print("MongoDB-Verbindung erfolgreich getestet!")
        return True
        
    except Exception as e:
        print(f"Fehler bei der direkten MongoDB-Verbindung: {str(e)}")
        return False

def main():
    """
    Hauptfunktion zum Ausführen der Tests.
    """
    print_separator("VALEO-NeuroERP MCP MongoDB-Integration Test")
    print("Datum und Uhrzeit:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("Dieser Test überprüft die MongoDB-Integration mit dem MCP Server.\n")
    
    try:
        # Überprüfen, ob der MCP Server läuft
        try:
            requests.get("http://localhost:8001/health")
            print("MCP Server ist erreichbar.")
        except requests.exceptions.ConnectionError:
            print("FEHLER: MCP Server ist nicht erreichbar. Bitte starten Sie den Server mit 'python server_fastmcp_mongodb.py'.")
            return 1
        
        # MongoDB-Verbindung testen
        if not test_mongodb_connection():
            print("FEHLER: MongoDB-Verbindung fehlgeschlagen.")
            return 1
        
        # Web-Suche testen
        web_search_success = test_web_search()
        
        # RAG-Abfrage testen
        rag_query_success = test_rag_query()
        
        # Dokumentenverarbeitungshistorie testen
        doc_history_success = test_document_history()
        
        # Zusammenfassung
        print_separator("Testergebnisse")
        print(f"Web-Suche: {'Erfolgreich' if web_search_success else 'Fehlgeschlagen'}")
        print(f"RAG-Abfrage: {'Erfolgreich' if rag_query_success else 'Fehlgeschlagen'}")
        print(f"Dokumentenverarbeitungshistorie: {'Erfolgreich' if doc_history_success else 'Fehlgeschlagen'}")
        
        if web_search_success and rag_query_success and doc_history_success:
            print("\nAlle Tests wurden erfolgreich durchgeführt!")
        else:
            print("\nEinige Tests sind fehlgeschlagen. Bitte überprüfen Sie die Fehler.")
            return 1
        
    except Exception as e:
        print("\nFEHLER:", str(e))
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 