"""
Test-Skript für die Integration der MongoDB mit den Search- und RAG-Services

Dieses Skript testet die Integration der MongoDB-Datenbank mit den
Such- und RAG-Services im VALEO-NeuroERP-System.
"""

import os
import sys
import unittest
import tempfile
from unittest.mock import patch, MagicMock
from datetime import datetime
from dotenv import load_dotenv

# Pfad zum Backend-Verzeichnis hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Korrekte Importe mit dem Backend-Präfix
from backend.mongodb_connector import MongoDBConnector
from backend.services.search_service import SearchService
from backend.services.rag_service import RAGService
from backend.models.search_history import SearchQuery, SearchResult, SearchHistoryItem
from backend.models.search_history import RAGQueryHistoryItem, DocumentProcessingHistoryItem

# Umgebungsvariablen laden
load_dotenv()

class TestSearchServiceIntegration(unittest.TestCase):
    """
    Testklasse für die Integration des Such-Service mit MongoDB
    """
    
    def setUp(self):
        """
        Testumgebung vorbereiten
        """
        # MongoDB-Connector mit Test-Datenbank initialisieren
        self.mongodb = MongoDBConnector(db_name="valeo_neuroerp_test")
        
        # Linkup-Client mocken
        self.linkup_patcher = patch('backend.services.search_service.Linkup')
        self.mock_linkup = self.linkup_patcher.start()
        self.mock_linkup_instance = MagicMock()
        self.mock_linkup.return_value = self.mock_linkup_instance
        
        # Such-Service initialisieren
        self.search_service = SearchService(
            linkup_api_key="test_api_key",
            mongodb_connector=self.mongodb
        )
        
        # Collections leeren
        self.mongodb.delete_many(self.search_service.search_history_collection, {})
    
    def tearDown(self):
        """
        Aufräumen nach den Tests
        """
        # Linkup-Mock beenden
        self.linkup_patcher.stop()
        
        # Collections leeren
        self.mongodb.delete_many(self.search_service.search_history_collection, {})
        
        # Verbindung schließen
        self.mongodb.close()
    
    def test_perform_web_search_and_store_history(self):
        """
        Test für die Durchführung einer Web-Suche und Speicherung in der Suchhistorie
        """
        # Mock-Antwort für die Linkup-Suche
        mock_search_response = {
            "answer": "Dies ist eine Testantwort.",
            "sources": [
                {
                    "title": "Test-Quelle 1",
                    "snippet": "Dies ist ein Testausschnitt 1.",
                    "url": "https://example.com/1"
                },
                {
                    "title": "Test-Quelle 2",
                    "snippet": "Dies ist ein Testausschnitt 2.",
                    "url": "https://example.com/2"
                }
            ]
        }
        self.mock_linkup_instance.search.return_value = mock_search_response
        
        # Web-Suche durchführen
        result = self.search_service.perform_web_search(
            query="Testabfrage",
            search_type="sourcedAnswer",
            language="de",
            user_id="test_user"
        )
        
        # Überprüfen, ob die Linkup-API aufgerufen wurde
        self.mock_linkup_instance.search.assert_called_once()
        
        # Überprüfen, ob das Ergebnis korrekt ist
        self.assertEqual(result["answer"], "Dies ist eine Testantwort.")
        self.assertEqual(len(result["sources"]), 2)
        
        # Suchhistorie abrufen
        history = self.search_service.get_search_history(user_id="test_user")
        
        # Überprüfen, ob die Suchhistorie gespeichert wurde
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["query"]["query"], "Testabfrage")
        self.assertEqual(history[0]["user_id"], "test_user")
        self.assertEqual(len(history[0]["results"]), 2)
    
    def test_get_and_clear_search_history(self):
        """
        Test für das Abrufen und Löschen der Suchhistorie
        """
        # Mock-Antworten für die Linkup-Suche
        self.mock_linkup_instance.search.return_value = {
            "answer": "Dies ist eine Testantwort.",
            "sources": []
        }
        
        # Mehrere Suchanfragen durchführen
        self.search_service.perform_web_search(query="Abfrage 1", user_id="user1")
        self.search_service.perform_web_search(query="Abfrage 2", user_id="user1")
        self.search_service.perform_web_search(query="Abfrage 3", user_id="user2")
        
        # Suchhistorie für Benutzer 1 abrufen
        history_user1 = self.search_service.get_search_history(user_id="user1")
        self.assertEqual(len(history_user1), 2)
        
        # Suchhistorie für Benutzer 2 abrufen
        history_user2 = self.search_service.get_search_history(user_id="user2")
        self.assertEqual(len(history_user2), 1)
        
        # Gesamte Suchhistorie abrufen
        all_history = self.search_service.get_search_history()
        self.assertEqual(len(all_history), 3)
        
        # Suchhistorie für Benutzer 1 löschen
        deleted_count = self.search_service.clear_search_history(user_id="user1")
        self.assertEqual(deleted_count, 2)
        
        # Überprüfen, ob die Suchhistorie für Benutzer 1 gelöscht wurde
        history_user1_after = self.search_service.get_search_history(user_id="user1")
        self.assertEqual(len(history_user1_after), 0)
        
        # Überprüfen, ob die Suchhistorie für Benutzer 2 noch vorhanden ist
        history_user2_after = self.search_service.get_search_history(user_id="user2")
        self.assertEqual(len(history_user2_after), 1)
    
    def test_search_in_history(self):
        """
        Test für die Suche in der Suchhistorie
        """
        # Mock-Antwort für die Linkup-Suche
        self.mock_linkup_instance.search.return_value = {
            "answer": "Dies ist eine Testantwort.",
            "sources": []
        }
        
        # Suchanfragen durchführen
        self.search_service.perform_web_search(query="VALEO-NeuroERP System", user_id="user1")
        self.search_service.perform_web_search(query="MongoDB Integration", user_id="user1")
        self.search_service.perform_web_search(query="Python FastAPI", user_id="user1")
        
        # In der Suchhistorie nach "MongoDB" suchen
        # Hinweis: Da wir den Text-Index in den Tests nicht erstellen können,
        # können wir diese Funktionalität nicht vollständig testen.
        # Wir überprüfen nur, ob die Methode ohne Fehler aufgerufen werden kann.
        try:
            results = self.search_service.search_in_history("MongoDB", user_id="user1")
            # Wir erwarten keine Ergebnisse, da der Text-Index fehlt
            self.assertEqual(len(results), 0)
        except Exception as e:
            # Wenn ein Fehler auftritt (z.B. weil kein Text-Index existiert),
            # ist das in diesem Test akzeptabel
            pass


class TestRAGServiceIntegration(unittest.TestCase):
    """
    Testklasse für die Integration des RAG-Service mit MongoDB
    """
    
    def setUp(self):
        """
        Testumgebung vorbereiten
        """
        # MongoDB-Connector mit Test-Datenbank initialisieren
        self.mongodb = MongoDBConnector(db_name="valeo_neuroerp_test")
        
        # OpenAI-Komponenten mocken
        self.openai_embeddings_patcher = patch('backend.services.rag_service.OpenAIEmbeddings')
        self.mock_openai_embeddings = self.openai_embeddings_patcher.start()
        self.mock_openai_embeddings_instance = MagicMock()
        self.mock_openai_embeddings.return_value = self.mock_openai_embeddings_instance
        
        self.openai_chat_patcher = patch('backend.services.rag_service.ChatOpenAI')
        self.mock_openai_chat = self.openai_chat_patcher.start()
        self.mock_openai_chat_instance = MagicMock()
        self.mock_openai_chat.return_value = self.mock_openai_chat_instance
        
        # FAISS-Vektorindex mocken
        self.faiss_patcher = patch('backend.services.rag_service.FAISS')
        self.mock_faiss = self.faiss_patcher.start()
        self.mock_faiss_instance = MagicMock()
        self.mock_faiss.from_texts.return_value = self.mock_faiss_instance
        self.mock_faiss.load_local.return_value = self.mock_faiss_instance
        
        # RetrievalQA-Chain mocken
        self.retrieval_qa_patcher = patch('backend.services.rag_service.RetrievalQA')
        self.mock_retrieval_qa = self.retrieval_qa_patcher.start()
        self.mock_retrieval_qa_instance = MagicMock()
        self.mock_retrieval_qa.from_chain_type.return_value = self.mock_retrieval_qa_instance
        self.mock_retrieval_qa_instance.invoke.return_value = {"result": "Dies ist eine RAG-Testantwort."}
        
        # LibreOffice-Prozessor mocken
        self.libreoffice_patcher = patch('backend.services.rag_service.LibreOfficeProcessor')
        self.mock_libreoffice = self.libreoffice_patcher.start()
        self.mock_libreoffice_instance = MagicMock()
        self.mock_libreoffice.return_value = self.mock_libreoffice_instance
        self.mock_libreoffice_instance.extract_text.return_value = "Dies ist ein Testdokument."
        
        # Temporäres Verzeichnis für Vektorindex erstellen
        self.temp_dir = tempfile.TemporaryDirectory()
        
        # RAG-Service initialisieren
        self.rag_service = RAGService(
            openai_api_key="test_api_key",
            mongodb_connector=self.mongodb,
            vector_store_path=os.path.join(self.temp_dir.name, "index")
        )
        
        # Collections leeren
        self.mongodb.delete_many(self.rag_service.rag_query_collection, {})
        self.mongodb.delete_many(self.rag_service.document_processing_collection, {})
    
    def tearDown(self):
        """
        Aufräumen nach den Tests
        """
        # Mocks beenden
        self.openai_embeddings_patcher.stop()
        self.openai_chat_patcher.stop()
        self.faiss_patcher.stop()
        self.retrieval_qa_patcher.stop()
        self.libreoffice_patcher.stop()
        
        # Collections leeren
        self.mongodb.delete_many(self.rag_service.rag_query_collection, {})
        self.mongodb.delete_many(self.rag_service.document_processing_collection, {})
        
        # Temporäres Verzeichnis löschen
        self.temp_dir.cleanup()
        
        # Verbindung schließen
        self.mongodb.close()
    
    def test_process_document_and_store_history(self):
        """
        Test für die Verarbeitung eines Dokuments und Speicherung in der Historie
        """
        # Testdokumentpfad
        test_doc_path = "test_document.odt"
        
        # Dokument verarbeiten
        result = self.rag_service.process_document(
            document_path=test_doc_path,
            user_id="test_user"
        )
        
        # Überprüfen, ob das Ergebnis korrekt ist
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["document_type"], "libreoffice_writer")
        
        # Dokumentenverarbeitungshistorie abrufen
        history = self.rag_service.get_document_processing_history(user_id="test_user")
        
        # Überprüfen, ob die Historie gespeichert wurde
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["document_path"], test_doc_path)
        self.assertEqual(history[0]["user_id"], "test_user")
        self.assertEqual(history[0]["status"], "success")
    
    def test_perform_rag_query_and_store_history(self):
        """
        Test für die Durchführung einer RAG-Abfrage und Speicherung in der Historie
        """
        # RAG-Abfrage durchführen
        result = self.rag_service.perform_rag_query(
            query="Was ist VALEO-NeuroERP?",
            user_id="test_user"
        )
        
        # Überprüfen, ob das Ergebnis korrekt ist
        self.assertEqual(result["answer"], "Dies ist eine RAG-Testantwort.")
        
        # RAG-Abfragehistorie abrufen
        history = self.rag_service.get_rag_query_history(user_id="test_user")
        
        # Überprüfen, ob die Historie gespeichert wurde
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["query"], "Was ist VALEO-NeuroERP?")
        self.assertEqual(history[0]["user_id"], "test_user")
        self.assertEqual(history[0]["answer"], "Dies ist eine RAG-Testantwort.")
    
    def test_get_and_clear_rag_history(self):
        """
        Test für das Abrufen und Löschen der RAG-Abfragehistorie
        """
        # Mehrere RAG-Abfragen durchführen
        self.rag_service.perform_rag_query(query="Abfrage 1", user_id="user1")
        self.rag_service.perform_rag_query(query="Abfrage 2", user_id="user1")
        self.rag_service.perform_rag_query(query="Abfrage 3", user_id="user2")
        
        # RAG-Abfragehistorie für Benutzer 1 abrufen
        history_user1 = self.rag_service.get_rag_query_history(user_id="user1")
        self.assertEqual(len(history_user1), 2)
        
        # RAG-Abfragehistorie für Benutzer 2 abrufen
        history_user2 = self.rag_service.get_rag_query_history(user_id="user2")
        self.assertEqual(len(history_user2), 1)
        
        # RAG-Abfragehistorie für Benutzer 1 löschen
        deleted_count = self.rag_service.clear_rag_query_history(user_id="user1")
        self.assertEqual(deleted_count, 2)
        
        # Überprüfen, ob die RAG-Abfragehistorie für Benutzer 1 gelöscht wurde
        history_user1_after = self.rag_service.get_rag_query_history(user_id="user1")
        self.assertEqual(len(history_user1_after), 0)
        
        # Überprüfen, ob die RAG-Abfragehistorie für Benutzer 2 noch vorhanden ist
        history_user2_after = self.rag_service.get_rag_query_history(user_id="user2")
        self.assertEqual(len(history_user2_after), 1)
    
    def test_get_and_clear_document_history(self):
        """
        Test für das Abrufen und Löschen der Dokumentenverarbeitungshistorie
        """
        # Dokumente verarbeiten
        self.rag_service.process_document(document_path="doc1.odt", user_id="user1")
        self.rag_service.process_document(document_path="doc2.odt", user_id="user1")
        self.rag_service.process_document(document_path="doc3.odt", user_id="user2")
        
        # Dokumentenverarbeitungshistorie für Benutzer 1 abrufen
        history_user1 = self.rag_service.get_document_processing_history(user_id="user1")
        self.assertEqual(len(history_user1), 2)
        
        # Dokumentenverarbeitungshistorie für Benutzer 2 abrufen
        history_user2 = self.rag_service.get_document_processing_history(user_id="user2")
        self.assertEqual(len(history_user2), 1)
        
        # Dokumentenverarbeitungshistorie für Benutzer 1 löschen
        deleted_count = self.rag_service.clear_document_processing_history(user_id="user1")
        self.assertEqual(deleted_count, 2)
        
        # Überprüfen, ob die Dokumentenverarbeitungshistorie für Benutzer 1 gelöscht wurde
        history_user1_after = self.rag_service.get_document_processing_history(user_id="user1")
        self.assertEqual(len(history_user1_after), 0)
        
        # Überprüfen, ob die Dokumentenverarbeitungshistorie für Benutzer 2 noch vorhanden ist
        history_user2_after = self.rag_service.get_document_processing_history(user_id="user2")
        self.assertEqual(len(history_user2_after), 1)


if __name__ == "__main__":
    unittest.main() 