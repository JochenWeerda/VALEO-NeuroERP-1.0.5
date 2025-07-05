import unittest
from unittest.mock import MagicMock, patch, call
from datetime import datetime
from backend.services.service_layer import ServiceLayer
from core.genxais_core import GENXAISCore, RAGSystem, APMCycle, AgentSystem

class TestServiceLayer(unittest.TestCase):
    """
    Tests für die Service Layer
    """
    def setUp(self):
        """
        Test-Setup
        """
        # Mock-Objekte erstellen
        self.mock_core = MagicMock(spec=GENXAISCore)
        self.mock_rag = MagicMock(spec=RAGSystem)
        self.mock_apm = MagicMock(spec=APMCycle)
        self.mock_agents = MagicMock(spec=AgentSystem)
        
        # Service Layer initialisieren
        self.service = ServiceLayer()
        
        # Mock-Objekte injizieren
        self.service.core = self.mock_core
        self.service.rag = self.mock_rag
        self.service.apm = self.mock_apm
        self.service.agents = self.mock_agents
        
        # Timestamp für Tests
        self.test_timestamp = datetime.utcnow().isoformat()
        self.mock_core.get_current_timestamp.return_value = self.test_timestamp
        
    def test_handle_request_success(self):
        """
        Test: Erfolgreiche Request-Verarbeitung
        """
        # Test-Daten
        endpoint = "/api/v1/users"
        method = "GET"
        data = {"id": 1}
        
        # Mock-Rückgabewerte konfigurieren
        self.mock_rag.store_context.return_value = {"id": "context_1"}
        self.mock_apm.start_operation.return_value = {"id": "operation_1"}
        self.mock_agents.create_agent.return_value = {"id": "agent_1"}
        
        # Request ausführen
        result = self.service.handle_request(endpoint, method, data)
        
        # Assertions
        self.assertEqual(result["status"], "success")
        
        # Überprüfen der RAG System Aufrufe
        expected_calls = [
            call({
                "endpoint": endpoint,
                "method": method,
                "data": data,
                "timestamp": self.test_timestamp
            }),
            call({
                "endpoint": endpoint,
                "method": method,
                "data": data,
                "agent_id": "agent_1",
                "timestamp": self.test_timestamp
            })
        ]
        self.mock_rag.store_context.assert_has_calls(expected_calls, any_order=True)
        
        # Überprüfen der APM Framework Aufrufe
        self.mock_apm.start_operation.assert_called_once_with(f"{method}_{endpoint}")
        self.mock_apm.end_operation.assert_called_once()
        
    def test_handle_request_error(self):
        """
        Test: Fehlerhafte Request-Verarbeitung
        """
        # Test-Daten
        endpoint = "/api/v1/invalid"
        method = "POST"
        data = {"invalid": True}
        
        # Mock-Fehler konfigurieren
        self.mock_rag.store_context.side_effect = Exception("Test-Fehler")
        
        # Request ausführen
        result = self.service.handle_request(endpoint, method, data)
        
        # Assertions
        self.assertEqual(result["status"], "error")
        self.assertIn("error", result)
        
    def test_process_user_request(self):
        """
        Test: Benutzer-Anfragen
        """
        # GET Request
        get_result = self.service.process_user_request("GET", {})
        self.assertIn("users", get_result)
        
        # POST Request
        post_data = {"name": "Test User"}
        post_result = self.service.process_user_request("POST", post_data)
        self.assertEqual(post_result["status"], "created")
        self.assertEqual(post_result["user"], post_data)
        
        # PUT Request
        put_data = {"id": 1, "name": "Updated User"}
        put_result = self.service.process_user_request("PUT", put_data)
        self.assertEqual(put_result["status"], "updated")
        
        # DELETE Request
        delete_result = self.service.process_user_request("DELETE", {"id": 1})
        self.assertEqual(delete_result["status"], "deleted")
        
    def test_process_product_request(self):
        """
        Test: Produkt-Anfragen
        """
        # GET Request
        get_result = self.service.process_product_request("GET", {})
        self.assertIn("products", get_result)
        
        # POST Request
        post_data = {"name": "Test Product"}
        post_result = self.service.process_product_request("POST", post_data)
        self.assertEqual(post_result["status"], "created")
        
        # PUT Request
        put_data = {"id": 1, "name": "Updated Product"}
        put_result = self.service.process_product_request("PUT", put_data)
        self.assertEqual(put_result["status"], "updated")
        
        # DELETE Request
        delete_result = self.service.process_product_request("DELETE", {"id": 1})
        self.assertEqual(delete_result["status"], "deleted")
        
    def test_process_order_request(self):
        """
        Test: Bestell-Anfragen
        """
        # GET Request
        get_result = self.service.process_order_request("GET", {})
        self.assertIn("orders", get_result)
        
        # POST Request
        post_data = {"user_id": 1, "products": [1, 2, 3]}
        post_result = self.service.process_order_request("POST", post_data)
        self.assertEqual(post_result["status"], "created")
        
        # PUT Request
        put_data = {"id": 1, "status": "shipped"}
        put_result = self.service.process_order_request("PUT", put_data)
        self.assertEqual(put_result["status"], "updated")
        
        # DELETE Request
        delete_result = self.service.process_order_request("DELETE", {"id": 1})
        self.assertEqual(delete_result["status"], "deleted")
        
    def test_optimize_performance(self):
        """
        Test: Performance-Optimierung
        """
        # Mock-Konfiguration
        self.mock_apm.start_operation.return_value = {"id": "optimize_1"}
        self.mock_agents.create_agent.return_value = {"id": "agent_1"}
        
        # Optimierung durchführen
        result = self.service.optimize_performance()
        
        # Assertions
        self.assertEqual(result["status"], "success")
        self.assertIn("optimizations", result)
        self.assertEqual(len(result["optimizations"]), 3)
        
        # Überprüfen der Optimierungsaktionen
        for opt in result["optimizations"]:
            self.assertIn("type", opt)
            self.assertIn("actions", opt)
            self.assertEqual(len(opt["actions"]), 3)
            
        # Mock-Aufrufe überprüfen
        self.mock_apm.start_operation.assert_called_once()
        self.mock_agents.create_agent.assert_called_once()
        self.mock_rag.store_context.assert_called()
        self.mock_apm.end_operation.assert_called_once()

if __name__ == "__main__":
    unittest.main() 