"""
Tests für den API-Gateway
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.services.api_gateway import (
    APIGateway,
    APIKey,
    APIEndpoint,
    ServiceRegistration,
    APIResponse
)

# Test Data
TEST_API_KEY = APIKey(
    id="test123",
    key="test_key_hash",
    name="Test API Key",
    organization="Test Org",
    permissions=["read:users", "write:reports"],
    rate_limit=60,
    created_at=datetime.now(),
    is_active=True
)

TEST_ENDPOINT = APIEndpoint(
    path="/users",
    methods=["GET", "POST"],
    required_permissions=["read:users"],
    rate_limit=30,
    cache_ttl=300,
    validation_schema={
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "email": {"type": "string", "format": "email"}
        }
    }
)

TEST_SERVICE = ServiceRegistration(
    name="user-service",
    base_url="http://user-service:8000",
    health_check_url="/health",
    endpoints=[TEST_ENDPOINT],
    is_active=True
)

@pytest.fixture
def api_gateway():
    """Fixture für das API Gateway"""
    return APIGateway()

@pytest.fixture
def test_client(api_gateway):
    """Test client für FastAPI"""
    return TestClient(api_gateway.app)

@pytest.fixture
def mock_db():
    """Mock für die Datenbank-Session"""
    return Mock(spec=Session)

@pytest.fixture
def mock_redis():
    """Mock für Redis"""
    with patch("backend.services.api_gateway.redis_client") as mock:
        yield mock

class TestAPIGateway:
    """Testfälle für das API Gateway"""
    
    async def test_create_api_key(self, api_gateway, test_client, mock_db):
        """Test: API-Key erstellen"""
        response = test_client.post(
            "/api/v1/keys",
            json={
                "name": "Test Key",
                "organization": "Test Org",
                "permissions": ["read:users"],
                "rate_limit": 60
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "key" in data
        assert data["name"] == "Test Key"
        
    async def test_validate_api_key_success(self, api_gateway, mock_db):
        """Test: Erfolgreiche API-Key-Validierung"""
        with patch.object(api_gateway, "get_api_key_data", return_value=TEST_API_KEY):
            key = await api_gateway.validate_api_key("test_key", mock_db)
            
            assert key.id == TEST_API_KEY.id
            assert key.is_active
            
    async def test_validate_api_key_failure(self, api_gateway, mock_db):
        """Test: Fehlgeschlagene API-Key-Validierung"""
        with patch.object(api_gateway, "get_api_key_data", return_value=None):
            with pytest.raises(HTTPException) as exc:
                await api_gateway.validate_api_key("invalid_key", mock_db)
                
            assert exc.value.status_code == 401
            
    async def test_check_rate_limit(self, api_gateway, mock_redis):
        """Test: Rate Limit Prüfung"""
        mock_redis.get.return_value = b"30"  # Aktueller Zähler
        
        result = await api_gateway.check_rate_limit(TEST_API_KEY, TEST_ENDPOINT)
        
        assert result is True
        assert mock_redis.incr.called
        assert mock_redis.expire.called
        
    async def test_validate_permissions_success(self, api_gateway):
        """Test: Erfolgreiche Berechtigungsprüfung"""
        result = await api_gateway.validate_permissions(TEST_API_KEY, TEST_ENDPOINT)
        
        assert result is True
        
    async def test_validate_permissions_failure(self, api_gateway):
        """Test: Fehlgeschlagene Berechtigungsprüfung"""
        endpoint = APIEndpoint(
            path="/admin",
            methods=["GET"],
            required_permissions=["admin:access"]
        )
        
        result = await api_gateway.validate_permissions(TEST_API_KEY, endpoint)
        
        assert result is False
        
    async def test_handle_request_success(self, api_gateway, test_client):
        """Test: Erfolgreiche Request-Verarbeitung"""
        api_gateway.services["user-service"] = TEST_SERVICE
        
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY), \
             patch.object(api_gateway, "forward_request") as mock_forward:
            
            mock_forward.return_value = APIResponse(
                success=True,
                data={"id": 1, "name": "Test User"}
            )
            
            response = test_client.get(
                "/api/v1/user-service/users",
                headers={"X-API-Key": "test_key"}
            )
            
            assert response.status_code == 200
            assert mock_forward.called
            
    async def test_handle_request_rate_limit(self, api_gateway, test_client, mock_redis):
        """Test: Rate Limit überschritten"""
        api_gateway.services["user-service"] = TEST_SERVICE
        mock_redis.get.return_value = b"60"  # Rate Limit erreicht
        
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY):
            response = test_client.get(
                "/api/v1/user-service/users",
                headers={"X-API-Key": "test_key"}
            )
            
            assert response.status_code == 429
            
    async def test_handle_request_invalid_service(self, api_gateway, test_client):
        """Test: Ungültiger Service"""
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY):
            response = test_client.get(
                "/api/v1/invalid-service/users",
                headers={"X-API-Key": "test_key"}
            )
            
            assert response.status_code == 404
            
    async def test_register_service(self, api_gateway, test_client):
        """Test: Service registrieren"""
        with patch.object(api_gateway, "check_service_health", return_value=True):
            response = test_client.post(
                "/api/v1/services",
                json=TEST_SERVICE.dict()
            )
            
            assert response.status_code == 200
            assert response.json()["name"] == TEST_SERVICE.name
            assert TEST_SERVICE.name in api_gateway.services
            
    async def test_register_service_duplicate(self, api_gateway, test_client):
        """Test: Doppelte Service-Registrierung"""
        api_gateway.services[TEST_SERVICE.name] = TEST_SERVICE
        
        response = test_client.post(
            "/api/v1/services",
            json=TEST_SERVICE.dict()
        )
        
        assert response.status_code == 400
        
    async def test_unregister_service(self, api_gateway, test_client):
        """Test: Service abmelden"""
        api_gateway.services[TEST_SERVICE.name] = TEST_SERVICE
        
        response = test_client.delete(f"/api/v1/services/{TEST_SERVICE.name}")
        
        assert response.status_code == 200
        assert TEST_SERVICE.name not in api_gateway.services
        
    async def test_cache_handling(self, api_gateway, test_client, mock_redis):
        """Test: Cache-Handling"""
        api_gateway.services["user-service"] = TEST_SERVICE
        cached_response = b'{"id": 1, "name": "Cached User"}'
        mock_redis.get.return_value = cached_response
        
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY):
            response = test_client.get(
                "/api/v1/user-service/users",
                headers={"X-API-Key": "test_key"}
            )
            
            assert response.status_code == 200
            assert response.content == cached_response
            
    async def test_metrics_update(self, api_gateway, test_client):
        """Test: Metrik-Aktualisierung"""
        api_gateway.services["user-service"] = TEST_SERVICE
        
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY), \
             patch.object(api_gateway, "forward_request") as mock_forward, \
             patch("backend.services.api_gateway.request_count") as mock_counter:
            
            mock_forward.return_value = APIResponse(success=True)
            
            response = test_client.get(
                "/api/v1/user-service/users",
                headers={"X-API-Key": "test_key"}
            )
            
            assert response.status_code == 200
            assert mock_counter.labels.called
            
    async def test_request_validation(self, api_gateway, test_client):
        """Test: Request-Validierung"""
        api_gateway.services["user-service"] = TEST_SERVICE
        
        with patch.object(api_gateway, "validate_api_key", return_value=TEST_API_KEY), \
             patch.object(api_gateway, "validate_request") as mock_validate:
            
            mock_validate.side_effect = ValueError("Invalid email format")
            
            response = test_client.post(
                "/api/v1/user-service/users",
                headers={"X-API-Key": "test_key"},
                json={"name": "Test", "email": "invalid"}
            )
            
            assert response.status_code == 400
            assert "Invalid email format" in response.json()["detail"] 