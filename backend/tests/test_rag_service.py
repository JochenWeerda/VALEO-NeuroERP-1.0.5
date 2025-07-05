"""
Testfälle für den RAG-Service.
Enthält Unit-Tests für die MongoDB-Integration und RAG-Abfragen.
"""

import pytest
import asyncio
from unittest.mock import MagicMock, patch
from datetime import datetime
from typing import Dict, List, Any

from backend.services.rag_service import RAGService
from backend.models.reports.mongodb_schemas import SearchHistoryModel, RAGHistoryModel


@pytest.fixture
def mock_mongodb_service():
    """Fixture für einen Mock des MongoDB-Service."""
    mock_service = MagicMock()
    mock_service.insert_one.return_value = "test_id"
    mock_service.find_one.return_value = {"_id": "test_id", "query": "test_query"}
    mock_service.find_many.return_value = [{"_id": "test_id", "query": "test_query"}]
    mock_service.update_one.return_value = 1
    mock_service.delete_one.return_value = 1
    mock_service.count.return_value = 1
    mock_service.aggregate.return_value = [{"_id": None, "avg_execution_time": 0.5}]
    return mock_service


@pytest.fixture
def rag_service(mock_mongodb_service):
    """Fixture für den RAG-Service mit gemockten MongoDB-Services."""
    service = RAGService()
    service.search_history_service = mock_mongodb_service
    service.rag_history_service = mock_mongodb_service
    return service


class TestRAGService:
    """Testfälle für den RAG-Service."""
    
    @pytest.mark.asyncio
    async def test_web_search(self, rag_service):
        """Test für die Web-Suche."""
        # Arrange
        query = "test_query"
        user_id = "test_user"
        context = {"source": "test"}
        
        # Mock für den search_client mit einer asynchronen Funktion
        mock_search_client = MagicMock()
        
        async def mock_search(q):
            return [{"title": "Test Result"}]
        
        mock_search_client.search = mock_search
        
        # Act
        result = await rag_service.web_search(query, mock_search_client, user_id, context)
        
        # Assert
        assert result["search_id"] == "test_id"
        assert result["query"] == query
        assert len(result["results"]) > 0
        assert "execution_time" in result
        assert "result_count" in result
        
        # Überprüfen, ob insert_one aufgerufen wurde
        rag_service.search_history_service.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_web_search_no_client(self, rag_service):
        """Test für die Web-Suche ohne Client (Dummy-Ergebnisse)."""
        # Arrange
        query = "test_query"
        
        # Act
        result = await rag_service.web_search(query)
        
        # Assert
        assert result["search_id"] == "test_id"
        assert result["query"] == query
        assert len(result["results"]) > 0
        assert "execution_time" in result
        assert "result_count" in result
    
    @pytest.mark.asyncio
    async def test_rag_query(self, rag_service):
        """Test für die RAG-Abfrage."""
        # Arrange
        query = "test_query"
        context = {"source": "test"}
        
        # Mock für den rag_workflow mit einer asynchronen Funktion
        mock_rag_workflow = MagicMock()
        
        async def mock_query(q, c):
            return "Test Response", [{"title": "Test Document", "score": 0.95}]
        
        mock_rag_workflow.query = mock_query
        
        # Act
        result = await rag_service.rag_query(query, mock_rag_workflow, context)
        
        # Assert
        assert result["rag_id"] == "test_id"
        assert result["query"] == query
        assert result["response"] == "Test Response"
        assert len(result["documents"]) > 0
        assert "execution_time" in result
        assert "document_count" in result
        
        # Überprüfen, ob insert_one aufgerufen wurde
        rag_service.rag_history_service.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_rag_query_no_workflow(self, rag_service):
        """Test für die RAG-Abfrage ohne Workflow (Dummy-Antwort)."""
        # Arrange
        query = "test_query"
        
        # Act
        result = await rag_service.rag_query(query)
        
        # Assert
        assert result["rag_id"] == "test_id"
        assert result["query"] == query
        assert "response" in result
        assert len(result["documents"]) > 0
        assert "execution_time" in result
        assert "document_count" in result
    
    @pytest.mark.asyncio
    async def test_get_search_history(self, rag_service):
        """Test für das Abrufen der Suchhistorie."""
        # Arrange
        limit = 10
        skip = 0
        user_id = "test_user"
        
        # Act
        result = await rag_service.get_search_history(limit, skip, user_id)
        
        # Assert
        assert len(result) > 0
        assert result[0]["_id"] == "test_id"
        assert result[0]["query"] == "test_query"
        
        # Überprüfen, ob find_many mit den richtigen Parametern aufgerufen wurde
        rag_service.search_history_service.find_many.assert_called_once_with(
            query={"user_id": user_id},
            limit=limit,
            skip=skip,
            sort_by="timestamp",
            sort_direction=-1
        )
    
    @pytest.mark.asyncio
    async def test_get_rag_history(self, rag_service):
        """Test für das Abrufen der RAG-Abfragehistorie."""
        # Arrange
        limit = 10
        skip = 0
        
        # Act
        result = await rag_service.get_rag_history(limit, skip)
        
        # Assert
        assert len(result) > 0
        assert result[0]["_id"] == "test_id"
        assert result[0]["query"] == "test_query"
        
        # Überprüfen, ob find_many mit den richtigen Parametern aufgerufen wurde
        rag_service.rag_history_service.find_many.assert_called_once_with(
            query={},
            limit=limit,
            skip=skip,
            sort_by="timestamp",
            sort_direction=-1
        )
    
    @pytest.mark.asyncio
    async def test_search_similar_queries(self, rag_service):
        """Test für die Suche nach ähnlichen Abfragen."""
        # Arrange
        query = "test_query"
        limit = 5
        
        # Reset der Mock-Zähler vor dem Test
        rag_service.search_history_service.aggregate.reset_mock()
        rag_service.rag_history_service.aggregate.reset_mock()
        
        # Act
        result = await rag_service.search_similar_queries(query, limit)
        
        # Assert
        assert len(result) > 0
        
        # Überprüfen, ob aggregate mindestens einmal aufgerufen wurde
        assert rag_service.search_history_service.aggregate.call_count >= 1
        assert rag_service.rag_history_service.aggregate.call_count >= 1
    
    @pytest.mark.asyncio
    async def test_get_performance_metrics(self, rag_service):
        """Test für das Abrufen der Leistungsmetriken."""
        # Arrange
        mock_metrics = {
            "_id": None,
            "avg_execution_time": 0.5,
            "max_execution_time": 1.0,
            "min_execution_time": 0.1,
            "avg_document_count": 3.5,
            "total_queries": 10
        }
        rag_service.rag_history_service.aggregate.return_value = [mock_metrics]
        
        # Act
        result = await rag_service.get_performance_metrics()
        
        # Assert
        assert result["avg_execution_time"] == 0.5
        assert result["max_execution_time"] == 1.0
        assert result["min_execution_time"] == 0.1
        assert result["avg_document_count"] == 3.5
        assert result["total_queries"] == 10
        
        # Überprüfen, ob aggregate aufgerufen wurde
        rag_service.rag_history_service.aggregate.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_performance_metrics_empty(self, rag_service):
        """Test für das Abrufen der Leistungsmetriken ohne Daten."""
        # Arrange
        rag_service.rag_history_service.aggregate.return_value = []
        
        # Act
        result = await rag_service.get_performance_metrics()
        
        # Assert
        assert result["avg_execution_time"] == 0
        assert result["max_execution_time"] == 0
        assert result["min_execution_time"] == 0
        assert result["avg_document_count"] == 0
        assert result["total_queries"] == 0 