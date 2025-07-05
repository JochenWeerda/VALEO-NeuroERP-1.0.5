"""
Testfälle für den MongoDB-Service.
Enthält Unit-Tests für CRUD-Operationen und Aggregationen.
"""

import pytest
from unittest.mock import MagicMock, patch
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

from backend.services.mongodb_service import MongoDBService


class TestModel(BaseModel):
    """Testmodell für die Tests."""
    name: str
    value: int
    tags: Optional[List[str]] = None


@pytest.fixture
def mock_collection():
    """Fixture für eine Mock-Collection."""
    mock = MagicMock()
    
    # Mock für insert_one
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = ObjectId("60f1a5b3e4b0a1b2c3d4e5f6")
    mock.insert_one.return_value = mock_insert_result
    
    # Mock für find_one
    mock.find_one.return_value = {
        "_id": ObjectId("60f1a5b3e4b0a1b2c3d4e5f6"),
        "name": "test",
        "value": 42,
        "tags": ["tag1", "tag2"]
    }
    
    # Mock für find
    mock_cursor = MagicMock()
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.__iter__.return_value = [
        {
            "_id": ObjectId("60f1a5b3e4b0a1b2c3d4e5f6"),
            "name": "test1",
            "value": 42,
            "tags": ["tag1", "tag2"]
        },
        {
            "_id": ObjectId("60f1a5b3e4b0a1b2c3d4e5f7"),
            "name": "test2",
            "value": 43,
            "tags": ["tag2", "tag3"]
        }
    ]
    mock.find.return_value = mock_cursor
    
    # Mock für update_one
    mock_update_result = MagicMock()
    mock_update_result.modified_count = 1
    mock.update_one.return_value = mock_update_result
    
    # Mock für delete_one
    mock_delete_result = MagicMock()
    mock_delete_result.deleted_count = 1
    mock.delete_one.return_value = mock_delete_result
    
    # Mock für count_documents
    mock.count_documents.return_value = 2
    
    # Mock für create_index
    mock.create_index.return_value = "test_index"
    
    # Mock für aggregate
    mock.aggregate.return_value = [
        {
            "_id": "group1",
            "total": 42
        },
        {
            "_id": "group2",
            "total": 43
        }
    ]
    
    return mock


@pytest.fixture
def mock_db(mock_collection):
    """Fixture für eine Mock-DB."""
    mock = MagicMock()
    mock.__getitem__.return_value = mock_collection
    return mock


@pytest.fixture
def mock_client(mock_db):
    """Fixture für einen Mock-Client."""
    mock = MagicMock()
    mock.__getitem__.return_value = mock_db
    return mock


@pytest.fixture
def mongodb_service(mock_client, monkeypatch):
    """Fixture für den MongoDB-Service mit gemocktem Client."""
    # MongoClient-Klasse patchen
    monkeypatch.setattr("backend.services.mongodb_service.MongoClient", lambda *args, **kwargs: mock_client)
    
    # Service erstellen
    service = MongoDBService(
        collection_name="test_collection",
        model_class=TestModel,
        uri="mongodb://localhost:27017/",
        db_name="test_db"
    )
    
    return service


class TestMongoDBService:
    """Testfälle für den MongoDB-Service."""
    
    def test_init(self, mongodb_service, mock_client):
        """Test für die Initialisierung."""
        assert mongodb_service.uri == "mongodb://localhost:27017/"
        assert mongodb_service.db_name == "test_db"
        assert mongodb_service.collection_name == "test_collection"
        assert mongodb_service.model_class == TestModel
        assert mongodb_service.client == mock_client
    
    def test_close(self, mongodb_service, mock_client):
        """Test für das Schließen der Verbindung."""
        mongodb_service.close()
        mock_client.close.assert_called_once()
    
    def test_insert_one_dict(self, mongodb_service, mock_collection):
        """Test für das Einfügen eines Dokuments als Dict."""
        # Arrange
        data = {
            "name": "test",
            "value": 42,
            "tags": ["tag1", "tag2"]
        }
        
        # Act
        result = mongodb_service.insert_one(data)
        
        # Assert
        assert result == "60f1a5b3e4b0a1b2c3d4e5f6"
        mock_collection.insert_one.assert_called_once()
    
    def test_insert_one_model(self, mongodb_service, mock_collection):
        """Test für das Einfügen eines Dokuments als Pydantic-Modell."""
        # Arrange
        data = TestModel(
            name="test",
            value=42,
            tags=["tag1", "tag2"]
        )
        
        # Act
        result = mongodb_service.insert_one(data)
        
        # Assert
        assert result == "60f1a5b3e4b0a1b2c3d4e5f6"
        mock_collection.insert_one.assert_called_once()
    
    def test_find_one(self, mongodb_service, mock_collection):
        """Test für das Finden eines Dokuments."""
        # Arrange
        query = {"name": "test"}
        
        # Act
        result = mongodb_service.find_one(query)
        
        # Assert
        assert result["_id"] == "60f1a5b3e4b0a1b2c3d4e5f6"  # Als String konvertiert
        assert result["name"] == "test"
        assert result["value"] == 42
        assert result["tags"] == ["tag1", "tag2"]
        mock_collection.find_one.assert_called_once_with(query)
    
    def test_find_one_with_id(self, mongodb_service, mock_collection):
        """Test für das Finden eines Dokuments mit ID."""
        # Arrange
        query = {"_id": "60f1a5b3e4b0a1b2c3d4e5f6"}
        
        # Act
        result = mongodb_service.find_one(query)
        
        # Assert
        assert result["_id"] == "60f1a5b3e4b0a1b2c3d4e5f6"  # Als String konvertiert
        mock_collection.find_one.assert_called_once()
        # Sicherstellen, dass die ID in ObjectId konvertiert wurde
        args, _ = mock_collection.find_one.call_args
        assert isinstance(args[0]["_id"], ObjectId)
    
    def test_find_many(self, mongodb_service, mock_collection):
        """Test für das Finden mehrerer Dokumente."""
        # Arrange
        query = {"tags": "tag2"}
        limit = 10
        skip = 0
        
        # Act
        results = mongodb_service.find_many(query, limit, skip)
        
        # Assert
        assert len(results) == 2
        assert results[0]["_id"] == "60f1a5b3e4b0a1b2c3d4e5f6"  # Als String konvertiert
        assert results[1]["_id"] == "60f1a5b3e4b0a1b2c3d4e5f7"  # Als String konvertiert
        mock_collection.find.assert_called_once_with(query)
    
    def test_find_many_with_sort(self, mongodb_service, mock_collection):
        """Test für das Finden mehrerer Dokumente mit Sortierung."""
        # Arrange
        query = {"tags": "tag2"}
        limit = 10
        skip = 0
        sort_by = "name"
        sort_direction = -1
        
        # Act
        results = mongodb_service.find_many(query, limit, skip, sort_by, sort_direction)
        
        # Assert
        assert len(results) == 2
        mock_collection.find.assert_called_once_with(query)
        mock_collection.find().skip.assert_called_once_with(skip)
        mock_collection.find().skip().limit.assert_called_once_with(limit)
        mock_collection.find().skip().limit().sort.assert_called_once_with(sort_by, sort_direction)
    
    def test_update_one(self, mongodb_service, mock_collection):
        """Test für das Aktualisieren eines Dokuments."""
        # Arrange
        query = {"name": "test"}
        update_data = {"value": 43}
        
        # Act
        result = mongodb_service.update_one(query, update_data)
        
        # Assert
        assert result == 1
        mock_collection.update_one.assert_called_once_with(query, {"$set": update_data})
    
    def test_update_one_with_id(self, mongodb_service, mock_collection):
        """Test für das Aktualisieren eines Dokuments mit ID."""
        # Arrange
        query = {"_id": "60f1a5b3e4b0a1b2c3d4e5f6"}
        update_data = {"value": 43}
        
        # Act
        result = mongodb_service.update_one(query, update_data)
        
        # Assert
        assert result == 1
        mock_collection.update_one.assert_called_once()
        # Sicherstellen, dass die ID in ObjectId konvertiert wurde
        args, _ = mock_collection.update_one.call_args
        assert isinstance(args[0]["_id"], ObjectId)
    
    def test_delete_one(self, mongodb_service, mock_collection):
        """Test für das Löschen eines Dokuments."""
        # Arrange
        query = {"name": "test"}
        
        # Act
        result = mongodb_service.delete_one(query)
        
        # Assert
        assert result == 1
        mock_collection.delete_one.assert_called_once_with(query)
    
    def test_delete_one_with_id(self, mongodb_service, mock_collection):
        """Test für das Löschen eines Dokuments mit ID."""
        # Arrange
        query = {"_id": "60f1a5b3e4b0a1b2c3d4e5f6"}
        
        # Act
        result = mongodb_service.delete_one(query)
        
        # Assert
        assert result == 1
        mock_collection.delete_one.assert_called_once()
        # Sicherstellen, dass die ID in ObjectId konvertiert wurde
        args, _ = mock_collection.delete_one.call_args
        assert isinstance(args[0]["_id"], ObjectId)
    
    def test_count(self, mongodb_service, mock_collection):
        """Test für das Zählen von Dokumenten."""
        # Arrange
        query = {"tags": "tag2"}
        
        # Act
        result = mongodb_service.count(query)
        
        # Assert
        assert result == 2
        mock_collection.count_documents.assert_called_once_with(query)
    
    def test_count_no_query(self, mongodb_service, mock_collection):
        """Test für das Zählen aller Dokumente."""
        # Act
        result = mongodb_service.count()
        
        # Assert
        assert result == 2
        mock_collection.count_documents.assert_called_once_with({})
    
    def test_create_index(self, mongodb_service, mock_collection):
        """Test für das Erstellen eines Index."""
        # Arrange
        keys = [("name", 1)]
        kwargs = {"unique": True}
        
        # Act
        result = mongodb_service.create_index(keys, **kwargs)
        
        # Assert
        assert result == "test_index"
        mock_collection.create_index.assert_called_once_with(keys, **kwargs)
    
    def test_aggregate(self, mongodb_service, mock_collection):
        """Test für die Aggregation."""
        # Arrange
        pipeline = [
            {"$match": {"tags": "tag2"}},
            {"$group": {"_id": "$name", "total": {"$sum": "$value"}}}
        ]
        
        # Act
        results = mongodb_service.aggregate(pipeline)
        
        # Assert
        assert len(results) == 2
        assert results[0]["_id"] == "group1"
        assert results[0]["total"] == 42
        assert results[1]["_id"] == "group2"
        assert results[1]["total"] == 43
        mock_collection.aggregate.assert_called_once_with(pipeline) 