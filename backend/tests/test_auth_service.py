"""
Tests für den Auth-Service
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.services.auth_service import (
    router,
    Permission,
    Role,
    User,
    Token,
    TokenData,
    PermissionChecker,
    create_access_token,
    verify_password,
    get_password_hash
)

# Test Data
TEST_USER = User(
    id="test123",
    email="test@example.com",
    hashed_password=get_password_hash("password123"),
    roles=["admin", "user"],
    is_active=True,
    created_at=datetime.now()
)

TEST_ROLE_ADMIN = Role(
    id="admin",
    name="Administrator",
    description="Voller Systemzugriff",
    permissions=[
        Permission(
            resource="users",
            action="manage",
            conditions=None,
            fields=None
        ),
        Permission(
            resource="reports",
            action="read",
            conditions={"type": "confidential"},
            fields=["id", "title", "content"]
        )
    ],
    created_at=datetime.now()
)

TEST_ROLE_USER = Role(
    id="user",
    name="Benutzer",
    description="Eingeschränkter Zugriff",
    permissions=[
        Permission(
            resource="reports",
            action="read",
            conditions={"type": "public"},
            fields=["id", "title"]
        )
    ],
    created_at=datetime.now()
)

@pytest.fixture
def test_client():
    """Test client für FastAPI"""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)

@pytest.fixture
def mock_db():
    """Mock für die Datenbank-Session"""
    return Mock(spec=Session)

@pytest.fixture
def mock_redis():
    """Mock für Redis"""
    with patch("backend.services.auth_service.redis_client") as mock:
        yield mock

class TestAuthService:
    """Testfälle für den Auth-Service"""
    
    def test_password_hashing(self):
        """Test: Passwort-Hashing"""
        password = "test123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrong", hashed)
        
    def test_create_access_token(self):
        """Test: Token-Erstellung"""
        data = {
            "user_id": TEST_USER.id,
            "roles": TEST_USER.roles
        }
        
        token = create_access_token(data)
        
        assert token.access_token is not None
        assert token.token_type == "bearer"
        assert token.expires_at > datetime.utcnow()
        
    async def test_login_success(self, test_client, mock_db):
        """Test: Erfolgreicher Login"""
        with patch("backend.services.auth_service.authenticate_user", return_value=TEST_USER), \
             patch("backend.services.auth_service.get_role") as mock_get_role:
            
            mock_get_role.side_effect = [TEST_ROLE_ADMIN, TEST_ROLE_USER]
            
            response = test_client.post(
                "/api/v1/auth/token",
                data={"username": "test@example.com", "password": "password123"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
            
    async def test_login_failure(self, test_client, mock_db):
        """Test: Fehlgeschlagener Login"""
        with patch("backend.services.auth_service.authenticate_user", return_value=None):
            response = test_client.post(
                "/api/v1/auth/token",
                data={"username": "wrong@example.com", "password": "wrong"}
            )
            
            assert response.status_code == 401
            
    async def test_logout(self, test_client, mock_redis):
        """Test: Logout"""
        token = create_access_token({"user_id": TEST_USER.id}).access_token
        
        response = test_client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        assert mock_redis.set.called
        
    async def test_get_current_user(self, test_client, mock_db):
        """Test: Aktuellen Benutzer abrufen"""
        with patch("backend.services.auth_service.get_user", return_value=TEST_USER):
            token = create_access_token({"user_id": TEST_USER.id}).access_token
            
            response = test_client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == TEST_USER.id
            assert data["email"] == TEST_USER.email
            
    async def test_check_permission_success(self, test_client, mock_db):
        """Test: Erfolgreiche Berechtigungsprüfung"""
        with patch("backend.services.auth_service.get_user", return_value=TEST_USER), \
             patch("backend.services.auth_service.get_role") as mock_get_role:
            
            mock_get_role.return_value = TEST_ROLE_ADMIN
            token = create_access_token({"user_id": TEST_USER.id}).access_token
            
            response = test_client.get(
                "/api/v1/auth/check-permission",
                params={
                    "resource": "reports",
                    "action": "read",
                    "conditions": {"type": "confidential"},
                    "fields": ["id", "title"]
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 200
            assert response.json() is True
            
    async def test_check_permission_failure(self, test_client, mock_db):
        """Test: Fehlgeschlagene Berechtigungsprüfung"""
        with patch("backend.services.auth_service.get_user", return_value=TEST_USER), \
             patch("backend.services.auth_service.get_role") as mock_get_role:
            
            mock_get_role.return_value = TEST_ROLE_USER
            token = create_access_token({"user_id": TEST_USER.id}).access_token
            
            response = test_client.get(
                "/api/v1/auth/check-permission",
                params={
                    "resource": "users",
                    "action": "manage"
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 403
            
    def test_permission_checker(self):
        """Test: PermissionChecker-Klasse"""
        checker = PermissionChecker([
            Permission(
                resource="reports",
                action="read",
                conditions={"type": "confidential"},
                fields=["id", "title"]
            )
        ])
        
        # Test: Übereinstimmende Berechtigungen
        assert checker.match_permission(
            Permission(
                resource="reports",
                action="read",
                conditions={"type": "confidential"},
                fields=["id", "title"]
            ),
            Permission(
                resource="reports",
                action="read",
                conditions={"type": "confidential"},
                fields=["id", "title", "content"]
            )
        )
        
        # Test: Nicht übereinstimmende Berechtigungen
        assert not checker.match_permission(
            Permission(
                resource="reports",
                action="write",
                conditions={"type": "confidential"},
                fields=["id", "title"]
            ),
            Permission(
                resource="reports",
                action="read",
                conditions={"type": "confidential"},
                fields=["id", "title"]
            )
        )
        
    def test_token_blacklisting(self, test_client, mock_redis):
        """Test: Token-Blacklisting"""
        token = create_access_token({"user_id": TEST_USER.id}).access_token
        
        # Token zur Blacklist hinzufügen
        mock_redis.get.return_value = b"1"
        
        with patch("backend.services.auth_service.get_user", return_value=TEST_USER):
            response = test_client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 401
            
    def test_role_inheritance(self):
        """Test: Vererbung von Rollen-Berechtigungen"""
        user = TEST_USER.copy()
        user.roles = ["admin", "user"]  # Beide Rollen
        
        checker = PermissionChecker([
            Permission(
                resource="reports",
                action="read",
                conditions={"type": "confidential"},
                fields=["id", "title", "content"]
            )
        ])
        
        with patch("backend.services.auth_service.get_role") as mock_get_role:
            mock_get_role.side_effect = [TEST_ROLE_ADMIN, TEST_ROLE_USER]
            
            permissions = checker.get_user_permissions(user)
            
            # Benutzer sollte alle Berechtigungen beider Rollen haben
            assert len(permissions) == 3

    def test_create_role_and_permission(self, test_client, mock_db):
        """Test: Rolle und Berechtigung anlegen"""
        # Rolle anlegen
        response = test_client.post("/api/v1/auth/roles", json={"name": "Testrolle", "description": "Test"})
        assert response.status_code == 200
        role = response.json()
        assert role["name"] == "Testrolle"
        # Berechtigung anlegen
        response = test_client.post("/api/v1/auth/permissions", json={"resource": "test", "action": "read"})
        assert response.status_code == 200
        perm = response.json()
        assert perm["resource"] == "test"

    def test_grant_temporary_permission(self, test_client, mock_db):
        """Test: Temporäre Berechtigung vergeben und prüfen"""
        # Temporäre Berechtigung anlegen
        now = datetime.utcnow()
        response = test_client.post("/api/v1/auth/temporary-permissions", json={
            "user_id": 1,
            "permission_id": 1,
            "valid_from": now.isoformat(),
            "valid_until": (now + timedelta(hours=1)).isoformat(),
            "context": "{}",
            "granted_by": 2
        })
        assert response.status_code == 200
        temp_perm = response.json()
        assert temp_perm["user_id"] == 1
        assert temp_perm["permission_id"] == 1

    def test_audit_log(self, test_client, mock_db):
        """Test: Audit-Log abrufen"""
        response = test_client.get("/api/v1/auth/audit-log")
        assert response.status_code == 200
        logs = response.json()
        assert isinstance(logs, list)

    def test_permission_check_with_multiple_roles_and_temp(self, test_client, mock_db):
        """Test: Permission-Check mit mehreren Rollen und temporärer Berechtigung"""
        # User mit zwei Rollen und einer temporären Berechtigung
        with patch("backend.services.auth_service.get_user", return_value=TEST_USER), \
             patch("backend.services.auth_service.get_role") as mock_get_role, \
             patch("backend.services.auth_service.TemporaryPermission") as mock_temp_perm:
            mock_get_role.side_effect = [TEST_ROLE_ADMIN, TEST_ROLE_USER]
            mock_temp_perm.query.filter.return_value.all.return_value = [
                Permission(resource="special", action="access", conditions=None, fields=None)
            ]
            token = create_access_token({"user_id": TEST_USER.id}).access_token
            response = test_client.get(
                "/api/v1/auth/check-permission",
                params={"resource": "special", "action": "access"},
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200
            assert response.json() is True 