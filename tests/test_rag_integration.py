# -*- coding: utf-8 -*-
"""
Tests für die verbesserte RAG-Integration.
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock
from linkup_mcp.rag_client import RAGClient

@pytest.mark.asyncio
async def test_rag_client_initialization():
    """Test für die Initialisierung des RAG-Clients"""
    config = {
        "api_endpoint": "http://test-endpoint/api/v1/query",
        "api_token": "test_token",
        "collection": "test_collection"
    }
    
    client = RAGClient(config)
    
    assert client.api_endpoint == "http://test-endpoint/api/v1/query"
    assert client.api_token == "test_token"
    assert client.collection == "test_collection"
    assert client.session is None
    
    # Test initialize
    with patch("aiohttp.ClientSession") as mock_session:
        await client.initialize()
        mock_session.assert_called_once()
        assert client.session is not None

@pytest.mark.asyncio
async def test_rag_query():
    """Test für die RAG-Abfrage"""
    client = RAGClient({
        "api_endpoint": "http://test-endpoint/api/v1/query",
        "api_token": "test_token",
        "collection": "test_collection"
    })
    
    # Mock für die Session und Response
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.json = MagicMock(return_value={
        "results": [
            {"text": "Test Result 1", "score": 0.95},
            {"text": "Test Result 2", "score": 0.85}
        ],
        "metadata": {"query_time_ms": 42}
    })
    
    mock_session = MagicMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = MagicMock(return_value=mock_response)
    mock_session.__aexit__ = MagicMock(return_value=None)
    
    # Setze die Mock-Session
    client.session = mock_session
    
    # Führe die Abfrage durch
    result = await client.query("test query", top_k=2)
    
    # Überprüfe das Ergebnis
    assert result["status"] == "success"
    assert len(result["results"]) == 2
    assert result["results"][0]["text"] == "Test Result 1"
    assert result["results"][0]["score"] == 0.95
    assert result["metadata"]["query_time_ms"] == 42
