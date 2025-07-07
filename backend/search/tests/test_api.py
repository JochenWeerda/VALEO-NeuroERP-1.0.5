"""
VALEO-NeuroERP Search API Tests
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from ..main import app
from ..database import db
from ..schemas import DocumentCreate, DocumentUpdate

client = TestClient(app)

@pytest.fixture
async def setup_test_data():
    """Test-Daten vorbereiten"""
    # Verbindung herstellen
    await db.connect()
    
    # Test-Dokumente
    test_docs = [
        {
            "title": "Test Dokument 1",
            "content": "Dies ist ein Test-Dokument für die Suche",
            "metadata": {
                "type": "test",
                "tags": ["test", "search"]
            },
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "title": "Test Dokument 2",
            "content": "Ein weiteres Test-Dokument mit anderen Begriffen",
            "metadata": {
                "type": "test",
                "tags": ["test", "other"]
            },
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    # Dokumente einfügen
    doc_ids = []
    for doc in test_docs:
        doc_id = await db.insert_document(doc)
        doc_ids.append(doc_id)
    
    yield doc_ids
    
    # Aufräumen
    for doc_id in doc_ids:
        await db.delete_document({"_id": doc_id})
    await db.disconnect()

def test_search_text():
    """Test der Textsuche"""
    response = client.post(
        "/api/v1/search/",
        json={
            "query": "Test-Dokument",
            "search_type": "text",
            "page": 1,
            "page_size": 10
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0
    assert data["total"] > 0
    assert data["search_type"] == "text"

def test_search_with_filters():
    """Test der Suche mit Filtern"""
    response = client.post(
        "/api/v1/search/",
        json={
            "query": "Test",
            "filters": {
                "metadata.type": "test",
                "metadata.tags": "search"
            },
            "search_type": "text",
            "page": 1,
            "page_size": 10
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0
    for result in data["results"]:
        assert result["metadata"]["type"] == "test"
        assert "search" in result["metadata"]["tags"]

def test_create_document():
    """Test der Dokument-Erstellung"""
    doc = {
        "title": "Neues Test-Dokument",
        "content": "Inhalt des neuen Test-Dokuments",
        "metadata": {
            "type": "test",
            "tags": ["new", "test"]
        }
    }
    response = client.post(
        "/api/v1/search/documents",
        json=doc
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == doc["title"]
    assert data["content"] == doc["content"]
    assert data["metadata"] == doc["metadata"]
    
    # Aufräumen
    doc_id = data["id"]
    delete_response = client.delete(f"/api/v1/search/documents/{doc_id}")
    assert delete_response.status_code == 200

def test_get_document(setup_test_data):
    """Test des Dokument-Abrufs"""
    doc_id = setup_test_data[0]
    response = client.get(f"/api/v1/search/documents/{doc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc_id
    assert "title" in data
    assert "content" in data

def test_update_document(setup_test_data):
    """Test der Dokument-Aktualisierung"""
    doc_id = setup_test_data[0]
    update = {
        "title": "Aktualisierter Titel",
        "metadata": {
            "type": "updated",
            "tags": ["updated", "test"]
        }
    }
    response = client.put(
        f"/api/v1/search/documents/{doc_id}",
        json=update
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update["title"]
    assert data["metadata"] == update["metadata"]

def test_delete_document(setup_test_data):
    """Test der Dokument-Löschung"""
    doc_id = setup_test_data[0]
    response = client.delete(f"/api/v1/search/documents/{doc_id}")
    assert response.status_code == 200
    
    # Überprüfen, ob das Dokument wirklich gelöscht wurde
    get_response = client.get(f"/api/v1/search/documents/{doc_id}")
    assert get_response.status_code == 404

def test_search_pagination():
    """Test der Suchergebnis-Paginierung"""
    response = client.post(
        "/api/v1/search/",
        json={
            "query": "Test",
            "search_type": "text",
            "page": 1,
            "page_size": 1
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) <= 1
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert data["total_pages"] >= 1

def test_invalid_search():
    """Test mit ungültigen Suchparametern"""
    response = client.post(
        "/api/v1/search/",
        json={
            "query": "",  # Leere Suchanfrage
            "search_type": "invalid",  # Ungültiger Suchtyp
            "page": 0,  # Ungültige Seitennummer
            "page_size": 1000  # Zu große Seitengröße
        }
    )
    assert response.status_code == 422  # Validierungsfehler 