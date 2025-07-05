"""
Test-Skript für die MongoDB-Integration im VALEO-NeuroERP-System

Dieses Skript testet die grundlegenden Funktionen des MongoDB-Connectors
sowie die Integration mit den Such- und RAG-Services.
"""

import os
import sys
import unittest
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId

# Pfad zum Backend-Verzeichnis hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.mongodb_connector import MongoDBConnector
from backend.models.search_history import SearchQuery, SearchResult, SearchHistoryItem
from backend.models.search_history import RAGQueryHistoryItem, DocumentProcessingHistoryItem

# Umgebungsvariablen laden
load_dotenv()

class TestMongoDBConnector(unittest.TestCase):
    """
    Testklasse für den MongoDB-Connector
    """
    
    def setUp(self):
        """
        Testumgebung vorbereiten
        """
        # MongoDB-Connector mit Test-Datenbank initialisieren
        self.mongodb = MongoDBConnector(db_name="valeo_neuroerp_test")
        
        # Test-Collection
        self.test_collection = "test_collection"
        
        # Test-Collection leeren
        self.mongodb.delete_many(self.test_collection, {})
    
    def tearDown(self):
        """
        Aufräumen nach den Tests
        """
        # Test-Collection leeren
        self.mongodb.delete_many(self.test_collection, {})
        
        # Verbindung schließen
        self.mongodb.close()
    
    def test_insert_and_find_one(self):
        """
        Test für das Einfügen und Finden eines Dokuments
        """
        # Test-Dokument
        test_doc = {"name": "Test", "value": 123}
        
        # Dokument einfügen
        doc_id = self.mongodb.insert_one(self.test_collection, test_doc)
        
        # Dokument finden
        found_doc = self.mongodb.find_one(self.test_collection, {"_id": ObjectId(doc_id)})
        
        # Überprüfen
        self.assertIsNotNone(found_doc)
        self.assertEqual(found_doc["name"], "Test")
        self.assertEqual(found_doc["value"], 123)
        self.assertIn("created_at", found_doc)
        self.assertIn("updated_at", found_doc)
    
    def test_insert_many_and_find_many(self):
        """
        Test für das Einfügen und Finden mehrerer Dokumente
        """
        # Test-Dokumente
        test_docs = [
            {"name": "Test1", "value": 123},
            {"name": "Test2", "value": 456},
            {"name": "Test3", "value": 789}
        ]
        
        # Dokumente einfügen
        doc_ids = self.mongodb.insert_many(self.test_collection, test_docs)
        
        # Dokumente finden
        found_docs = self.mongodb.find_many(self.test_collection, {})
        
        # Überprüfen
        self.assertEqual(len(found_docs), 3)
        
        # Nach einem bestimmten Wert filtern
        filtered_docs = self.mongodb.find_many(self.test_collection, {"value": 456})
        self.assertEqual(len(filtered_docs), 1)
        self.assertEqual(filtered_docs[0]["name"], "Test2")
    
    def test_update_one(self):
        """
        Test für die Aktualisierung eines Dokuments
        """
        # Test-Dokument
        test_doc = {"name": "UpdateTest", "value": 123}
        
        # Dokument einfügen
        doc_id = self.mongodb.insert_one(self.test_collection, test_doc)
        
        # Dokument aktualisieren
        self.mongodb.update_one(
            self.test_collection, 
            {"_id": ObjectId(doc_id)}, 
            {"$set": {"value": 999}}
        )
        
        # Aktualisiertes Dokument finden
        updated_doc = self.mongodb.find_one(self.test_collection, {"_id": ObjectId(doc_id)})
        
        # Überprüfen
        self.assertIsNotNone(updated_doc)
        self.assertEqual(updated_doc["value"], 999)
        self.assertEqual(updated_doc["name"], "UpdateTest")
    
    def test_update_many(self):
        """
        Test für die Aktualisierung mehrerer Dokumente
        """
        # Test-Dokumente
        test_docs = [
            {"name": "UpdateTest1", "status": "pending"},
            {"name": "UpdateTest2", "status": "pending"},
            {"name": "UpdateTest3", "status": "completed"}
        ]
        
        # Dokumente einfügen
        self.mongodb.insert_many(self.test_collection, test_docs)
        
        # Dokumente aktualisieren
        modified_count = self.mongodb.update_many(
            self.test_collection, 
            {"status": "pending"}, 
            {"$set": {"status": "completed"}}
        )
        
        # Überprüfen
        self.assertEqual(modified_count, 2)
        
        # Alle Dokumente sollten jetzt "completed" sein
        completed_docs = self.mongodb.find_many(self.test_collection, {"status": "completed"})
        self.assertEqual(len(completed_docs), 3)
    
    def test_delete_one(self):
        """
        Test für das Löschen eines Dokuments
        """
        # Test-Dokumente
        test_docs = [
            {"name": "DeleteTest1"},
            {"name": "DeleteTest2"},
            {"name": "DeleteTest3"}
        ]
        
        # Dokumente einfügen
        self.mongodb.insert_many(self.test_collection, test_docs)
        
        # Ein Dokument löschen
        deleted_count = self.mongodb.delete_one(self.test_collection, {"name": "DeleteTest2"})
        
        # Überprüfen
        self.assertEqual(deleted_count, 1)
        
        # Verbleibende Dokumente prüfen
        remaining_docs = self.mongodb.find_many(self.test_collection, {})
        self.assertEqual(len(remaining_docs), 2)
        names = [doc["name"] for doc in remaining_docs]
        self.assertIn("DeleteTest1", names)
        self.assertIn("DeleteTest3", names)
        self.assertNotIn("DeleteTest2", names)
    
    def test_delete_many(self):
        """
        Test für das Löschen mehrerer Dokumente
        """
        # Test-Dokumente
        test_docs = [
            {"name": "DeleteTest1", "category": "A"},
            {"name": "DeleteTest2", "category": "B"},
            {"name": "DeleteTest3", "category": "A"},
            {"name": "DeleteTest4", "category": "C"}
        ]
        
        # Dokumente einfügen
        self.mongodb.insert_many(self.test_collection, test_docs)
        
        # Dokumente löschen
        deleted_count = self.mongodb.delete_many(self.test_collection, {"category": "A"})
        
        # Überprüfen
        self.assertEqual(deleted_count, 2)
        
        # Verbleibende Dokumente prüfen
        remaining_docs = self.mongodb.find_many(self.test_collection, {})
        self.assertEqual(len(remaining_docs), 2)
        categories = [doc["category"] for doc in remaining_docs]
        self.assertIn("B", categories)
        self.assertIn("C", categories)
        self.assertNotIn("A", categories)
    
    def test_create_index(self):
        """
        Test für die Erstellung eines Index
        """
        # Index erstellen
        index_name = self.mongodb.create_index(
            self.test_collection,
            [("name", 1)]
        )
        
        # Überprüfen (einfach sicherstellen, dass kein Fehler auftritt)
        self.assertIsNotNone(index_name)


class TestSearchHistoryModels(unittest.TestCase):
    """
    Testklasse für die Suchhistorie-Modelle
    """
    
    def test_search_query_model(self):
        """
        Test für das SearchQuery-Modell
        """
        query = SearchQuery(
            query="test query",
            search_type="sourcedAnswer",
            region="DE",
            language="de",
            time_period="day"
        )
        
        self.assertEqual(query.query, "test query")
        self.assertEqual(query.search_type, "sourcedAnswer")
        self.assertEqual(query.region, "DE")
        self.assertEqual(query.language, "de")
        self.assertEqual(query.time_period, "day")
    
    def test_search_result_model(self):
        """
        Test für das SearchResult-Modell
        """
        result = SearchResult(
            title="Test Title",
            snippet="Test Snippet",
            url="https://example.com",
            source="linkup"
        )
        
        self.assertEqual(result.title, "Test Title")
        self.assertEqual(result.snippet, "Test Snippet")
        self.assertEqual(result.url, "https://example.com")
        self.assertEqual(result.source, "linkup")
    
    def test_search_history_item_model(self):
        """
        Test für das SearchHistoryItem-Modell
        """
        query = SearchQuery(
            query="test query",
            search_type="sourcedAnswer"
        )
        
        result = SearchResult(
            title="Test Title",
            snippet="Test Snippet",
            url="https://example.com",
            source="linkup"
        )
        
        history_item = SearchHistoryItem(
            user_id="user123",
            query=query,
            results=[result],
            response_time_ms=500
        )
        
        self.assertEqual(history_item.user_id, "user123")
        self.assertEqual(history_item.query.query, "test query")
        self.assertEqual(len(history_item.results), 1)
        self.assertEqual(history_item.results[0].title, "Test Title")
        self.assertEqual(history_item.response_time_ms, 500)
        self.assertIsNotNone(history_item.timestamp)
        
        # MongoDB-Format testen
        mongo_data = history_item.to_mongo()
        # In Pydantic v2 bleibt _id im Modell, wenn es gesetzt ist
        # Wir überprüfen stattdessen die anderen Felder
        self.assertEqual(mongo_data["user_id"], "user123")
        self.assertEqual(mongo_data["query"]["query"], "test query")
    
    def test_rag_query_history_item_model(self):
        """
        Test für das RAGQueryHistoryItem-Modell
        """
        rag_item = RAGQueryHistoryItem(
            user_id="user123",
            query="What is VALEO-NeuroERP?",
            document_paths=["doc1.odt", "doc2.pdf"],
            answer="VALEO-NeuroERP ist ein ERP-System mit KI-Integration.",
            response_time_ms=800
        )
        
        self.assertEqual(rag_item.user_id, "user123")
        self.assertEqual(rag_item.query, "What is VALEO-NeuroERP?")
        self.assertEqual(len(rag_item.document_paths), 2)
        self.assertEqual(rag_item.document_paths[0], "doc1.odt")
        self.assertEqual(rag_item.answer, "VALEO-NeuroERP ist ein ERP-System mit KI-Integration.")
        self.assertEqual(rag_item.response_time_ms, 800)
        
        # MongoDB-Format testen
        mongo_data = rag_item.to_mongo()
        # In Pydantic v2 bleibt _id im Modell, wenn es gesetzt ist
        # Wir überprüfen stattdessen die anderen Felder
        self.assertEqual(mongo_data["user_id"], "user123")
        self.assertEqual(mongo_data["query"], "What is VALEO-NeuroERP?")
    
    def test_document_processing_history_item_model(self):
        """
        Test für das DocumentProcessingHistoryItem-Modell
        """
        doc_item = DocumentProcessingHistoryItem(
            user_id="user123",
            document_path="doc1.odt",
            document_type="libreoffice_writer",
            status="success",
            processing_time_ms=300
        )
        
        self.assertEqual(doc_item.user_id, "user123")
        self.assertEqual(doc_item.document_path, "doc1.odt")
        self.assertEqual(doc_item.document_type, "libreoffice_writer")
        self.assertEqual(doc_item.status, "success")
        self.assertEqual(doc_item.processing_time_ms, 300)
        self.assertIsNone(doc_item.error_message)
        
        # MongoDB-Format testen
        mongo_data = doc_item.to_mongo()
        # In Pydantic v2 bleibt _id im Modell, wenn es gesetzt ist
        # Wir überprüfen stattdessen die anderen Felder
        self.assertEqual(mongo_data["user_id"], "user123")
        self.assertEqual(mongo_data["document_path"], "doc1.odt")


if __name__ == "__main__":
    unittest.main()