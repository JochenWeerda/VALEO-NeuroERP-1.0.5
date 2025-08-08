"""
VALEO NeuroERP 2.0 - Übergreifende Services API Tests
Serena Quality: Comprehensive unit and integration tests for all Cross-Cutting Services endpoints
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decimal import Decimal
from datetime import date, datetime
import json

from backend.app.main import app
from backend.app.database.connection import get_db, Base
from backend.app.models.uebergreifende_services import (
    Benutzer, Rolle, Permission, SystemEinstellung, WorkflowDefinition,
    WorkflowExecution, Dokument, DokumentVersion, Integration, Backup, MonitoringAlert
)
from backend.app.schemas.uebergreifende_services import (
    UserStatus, PermissionLevel, WorkflowStatus, IntegrationType, 
    BackupType, MonitoringLevel, DocumentType
)

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crosscutting.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    """Setup test database with tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_benutzer_data():
    """Sample user data for testing"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "vorname": "Max",
        "nachname": "Mustermann",
        "status": UserStatus.AKTIV,
        "telefon": "+49 123 456789",
        "abteilung": "IT",
        "position": "Entwickler",
        "aktiv": True
    }

@pytest.fixture
def sample_rolle_data():
    """Sample role data for testing"""
    return {
        "name": "Administrator",
        "beschreibung": "Vollzugriff auf alle Funktionen",
        "aktiv": True
    }

@pytest.fixture
def sample_permission_data():
    """Sample permission data for testing"""
    return {
        "name": "warenwirtschaft_read",
        "modul": "warenwirtschaft",
        "resource": "artikel",
        "action": "read",
        "level": PermissionLevel.READ,
        "beschreibung": "Artikel lesen",
        "aktiv": True
    }

@pytest.fixture
def sample_system_einstellung_data():
    """Sample system setting data for testing"""
    return {
        "schluessel": "system.name",
        "wert": "VALEO NeuroERP 2.0",
        "typ": "string",
        "beschreibung": "Systemname",
        "kategorie": "general",
        "aktiv": True
    }

@pytest.fixture
def sample_workflow_definition_data():
    """Sample workflow definition data for testing"""
    return {
        "name": "Bestellprozess",
        "beschreibung": "Automatisierter Bestellprozess",
        "modul": "warenwirtschaft",
        "status": WorkflowStatus.DRAFT,
        "version": "1.0",
        "konfiguration": {"steps": ["create", "approve", "send"]},
        "aktiv": True
    }

class TestBenutzerAPI:
    """Test cases for Benutzer endpoints"""
    
    def test_create_benutzer_success(self, setup_database, sample_benutzer_data):
        """Test successful user creation"""
        benutzer_data = sample_benutzer_data.copy()
        benutzer_data["password"] = "securepassword123"
        
        response = client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["vorname"] == "Max"
        assert data["nachname"] == "Mustermann"
        assert data["status"] == "aktiv"
        assert "id" in data
        assert "erstellt_am" in data

    def test_create_benutzer_duplicate_username(self, setup_database, sample_benutzer_data):
        """Test duplicate username creation fails"""
        benutzer_data = sample_benutzer_data.copy()
        benutzer_data["password"] = "securepassword123"
        
        # Create first user
        client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        assert response.status_code == 400
        assert "bereits vorhanden" in response.json()["detail"]

    def test_get_benutzer_list(self, setup_database, sample_benutzer_data):
        """Test user list retrieval"""
        # Create test users
        for i in range(3):
            benutzer_data = sample_benutzer_data.copy()
            benutzer_data["username"] = f"testuser{i+1}"
            benutzer_data["email"] = f"test{i+1}@example.com"
            benutzer_data["password"] = "securepassword123"
            client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        
        response = client.get("/api/v1/uebergreifende-services/benutzer/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 3

    def test_get_benutzer_by_id(self, setup_database, sample_benutzer_data):
        """Test user retrieval by ID"""
        # Create user
        benutzer_data = sample_benutzer_data.copy()
        benutzer_data["password"] = "securepassword123"
        create_response = client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        benutzer_id = create_response.json()["id"]
        
        # Get user by ID
        response = client.get(f"/api/v1/uebergreifende-services/benutzer/{benutzer_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_update_benutzer(self, setup_database, sample_benutzer_data):
        """Test user update"""
        # Create user
        benutzer_data = sample_benutzer_data.copy()
        benutzer_data["password"] = "securepassword123"
        create_response = client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        benutzer_id = create_response.json()["id"]
        
        # Update user
        update_data = {"position": "Senior Entwickler", "status": UserStatus.INAKTIV}
        response = client.put(f"/api/v1/uebergreifende-services/benutzer/{benutzer_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["position"] == "Senior Entwickler"
        assert data["status"] == "inaktiv"

    def test_benutzer_validation(self, setup_database):
        """Test user data validation"""
        invalid_data = {
            "username": "",  # Empty username
            "email": "invalid-email",  # Invalid email
            "vorname": "Max",
            "nachname": "Mustermann",
            "password": "123"  # Too short password
        }
        
        response = client.post("/api/v1/uebergreifende-services/benutzer/", json=invalid_data)
        assert response.status_code == 422

class TestRolleAPI:
    """Test cases for Rolle endpoints"""
    
    def test_create_rolle_success(self, setup_database, sample_rolle_data):
        """Test successful role creation"""
        response = client.post("/api/v1/uebergreifende-services/rolle/", json=sample_rolle_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Administrator"
        assert data["beschreibung"] == "Vollzugriff auf alle Funktionen"
        assert data["aktiv"] == True
        assert "id" in data

    def test_get_rolle_list(self, setup_database, sample_rolle_data):
        """Test role list retrieval"""
        # Create test roles
        for i in range(3):
            rolle_data = sample_rolle_data.copy()
            rolle_data["name"] = f"Rolle {i+1}"
            rolle_data["beschreibung"] = f"Beschreibung für Rolle {i+1}"
            client.post("/api/v1/uebergreifende-services/rolle/", json=rolle_data)
        
        response = client.get("/api/v1/uebergreifende-services/rolle/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    def test_update_rolle(self, setup_database, sample_rolle_data):
        """Test role update"""
        # Create role
        create_response = client.post("/api/v1/uebergreifende-services/rolle/", json=sample_rolle_data)
        rolle_id = create_response.json()["id"]
        
        # Update role
        update_data = {"beschreibung": "Aktualisierte Beschreibung", "aktiv": False}
        response = client.put(f"/api/v1/uebergreifende-services/rolle/{rolle_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["beschreibung"] == "Aktualisierte Beschreibung"
        assert data["aktiv"] == False

class TestPermissionAPI:
    """Test cases for Permission endpoints"""
    
    def test_create_permission_success(self, setup_database, sample_permission_data):
        """Test successful permission creation"""
        response = client.post("/api/v1/uebergreifende-services/permission/", json=sample_permission_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "warenwirtschaft_read"
        assert data["modul"] == "warenwirtschaft"
        assert data["resource"] == "artikel"
        assert data["action"] == "read"
        assert data["level"] == "read"
        assert "id" in data

    def test_get_permission_list(self, setup_database, sample_permission_data):
        """Test permission list retrieval"""
        # Create test permissions
        for i in range(3):
            permission_data = sample_permission_data.copy()
            permission_data["name"] = f"permission_{i+1}"
            permission_data["resource"] = f"resource_{i+1}"
            client.post("/api/v1/uebergreifende-services/permission/", json=permission_data)
        
        response = client.get("/api/v1/uebergreifende-services/permission/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    def test_permission_level_validation(self, setup_database, sample_permission_data):
        """Test permission level validation"""
        invalid_data = sample_permission_data.copy()
        invalid_data["level"] = "invalid_level"  # Invalid level
        
        response = client.post("/api/v1/uebergreifende-services/permission/", json=invalid_data)
        assert response.status_code == 422

class TestSystemEinstellungAPI:
    """Test cases for SystemEinstellung endpoints"""
    
    def test_create_system_einstellung_success(self, setup_database, sample_system_einstellung_data):
        """Test successful system setting creation"""
        response = client.post("/api/v1/uebergreifende-services/system-einstellung/", json=sample_system_einstellung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["schluessel"] == "system.name"
        assert data["wert"] == "VALEO NeuroERP 2.0"
        assert data["typ"] == "string"
        assert data["kategorie"] == "general"
        assert "id" in data

    def test_get_system_einstellung_list(self, setup_database, sample_system_einstellung_data):
        """Test system setting list retrieval"""
        # Create test settings
        for i in range(3):
            setting_data = sample_system_einstellung_data.copy()
            setting_data["schluessel"] = f"setting.key.{i+1}"
            setting_data["wert"] = f"value_{i+1}"
            client.post("/api/v1/uebergreifende-services/system-einstellung/", json=setting_data)
        
        response = client.get("/api/v1/uebergreifende-services/system-einstellung/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    def test_update_system_einstellung(self, setup_database, sample_system_einstellung_data):
        """Test system setting update"""
        # Create setting
        create_response = client.post("/api/v1/uebergreifende-services/system-einstellung/", json=sample_system_einstellung_data)
        setting_id = create_response.json()["id"]
        
        # Update setting
        update_data = {"wert": "VALEO NeuroERP 2.1", "aktiv": False}
        response = client.put(f"/api/v1/uebergreifende-services/system-einstellung/{setting_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["wert"] == "VALEO NeuroERP 2.1"
        assert data["aktiv"] == False

class TestWorkflowDefinitionAPI:
    """Test cases for WorkflowDefinition endpoints"""
    
    def test_create_workflow_definition_success(self, setup_database, sample_workflow_definition_data):
        """Test successful workflow definition creation"""
        response = client.post("/api/v1/uebergreifende-services/workflow-definition/", json=sample_workflow_definition_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Bestellprozess"
        assert data["beschreibung"] == "Automatisierter Bestellprozess"
        assert data["modul"] == "warenwirtschaft"
        assert data["status"] == "draft"
        assert data["version"] == "1.0"
        assert "id" in data

    def test_workflow_definition_status_transitions(self, setup_database, sample_workflow_definition_data):
        """Test workflow definition status transitions"""
        create_response = client.post("/api/v1/uebergreifende-services/workflow-definition/", json=sample_workflow_definition_data)
        workflow_id = create_response.json()["id"]
        
        # Update status to active
        update_data = {"status": WorkflowStatus.ACTIVE}
        response = client.put(f"/api/v1/uebergreifende-services/workflow-definition/{workflow_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "active"

    def test_get_workflow_definition_list(self, setup_database, sample_workflow_definition_data):
        """Test workflow definition list retrieval"""
        # Create test workflows
        for i in range(3):
            workflow_data = sample_workflow_definition_data.copy()
            workflow_data["name"] = f"Workflow {i+1}"
            workflow_data["beschreibung"] = f"Beschreibung für Workflow {i+1}"
            client.post("/api/v1/uebergreifende-services/workflow-definition/", json=workflow_data)
        
        response = client.get("/api/v1/uebergreifende-services/workflow-definition/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

class TestWorkflowExecutionAPI:
    """Test cases for WorkflowExecution endpoints"""
    
    def test_create_workflow_execution_success(self, setup_database, sample_workflow_definition_data):
        """Test successful workflow execution creation"""
        # Create workflow definition first
        workflow_response = client.post("/api/v1/uebergreifende-services/workflow-definition/", json=sample_workflow_definition_data)
        workflow_id = workflow_response.json()["id"]
        
        # Create workflow execution
        execution_data = {
            "workflow_definition_id": workflow_id,
            "status": WorkflowStatus.DRAFT,
            "input_data": {"order_id": 123, "customer_id": 456},
            "output_data": None,
            "start_time": None,
            "end_time": None,
            "bemerkung": "Test Execution"
        }
        
        response = client.post("/api/v1/uebergreifende-services/workflow-execution/", json=execution_data)
        assert response.status_code == 201
        data = response.json()
        assert data["workflow_definition_id"] == workflow_id
        assert data["status"] == "draft"
        assert data["input_data"]["order_id"] == 123
        assert "id" in data

    def test_workflow_execution_status_transitions(self, setup_database, sample_workflow_definition_data):
        """Test workflow execution status transitions"""
        # Create workflow definition and execution
        workflow_response = client.post("/api/v1/uebergreifende-services/workflow-definition/", json=sample_workflow_definition_data)
        workflow_id = workflow_response.json()["id"]
        
        execution_data = {
            "workflow_definition_id": workflow_id,
            "status": WorkflowStatus.DRAFT,
            "input_data": {"test": "data"}
        }
        
        create_response = client.post("/api/v1/uebergreifende-services/workflow-execution/", json=execution_data)
        execution_id = create_response.json()["id"]
        
        # Update status to active
        update_data = {"status": WorkflowStatus.ACTIVE}
        response = client.put(f"/api/v1/uebergreifende-services/workflow-execution/{execution_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "active"

class TestDokumentAPI:
    """Test cases for Dokument endpoints"""
    
    def test_create_dokument_success(self, setup_database):
        """Test successful document creation"""
        dokument_data = {
            "name": "Handbuch.pdf",
            "typ": DocumentType.MANUAL,
            "beschreibung": "Benutzerhandbuch",
            "datei_pfad": "/documents/handbuch.pdf",
            "datei_groesse": 1024000,
            "mime_type": "application/pdf",
            "version": "1.0",
            "tags": ["handbuch", "pdf", "dokumentation"],
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/dokument/", json=dokument_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Handbuch.pdf"
        assert data["typ"] == "manual"
        assert data["datei_pfad"] == "/documents/handbuch.pdf"
        assert data["version"] == "1.0"
        assert len(data["tags"]) == 3
        assert "id" in data

    def test_get_dokument_list(self, setup_database):
        """Test document list retrieval"""
        # Create test documents
        for i in range(3):
            dokument_data = {
                "name": f"Dokument {i+1}.pdf",
                "typ": DocumentType.MANUAL,
                "beschreibung": f"Beschreibung für Dokument {i+1}",
                "datei_pfad": f"/documents/dokument_{i+1}.pdf",
                "datei_groesse": 1024000,
                "mime_type": "application/pdf",
                "version": "1.0",
                "tags": [f"tag_{i+1}"],
                "aktiv": True
            }
            client.post("/api/v1/uebergreifende-services/dokument/", json=dokument_data)
        
        response = client.get("/api/v1/uebergreifende-services/dokument/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    def test_dokument_validation(self, setup_database):
        """Test document data validation"""
        invalid_data = {
            "name": "",  # Empty name
            "typ": "invalid_type",  # Invalid type
            "datei_pfad": "/documents/test.pdf",
            "version": "1.0",
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/dokument/", json=invalid_data)
        assert response.status_code == 422

class TestIntegrationAPI:
    """Test cases for Integration endpoints"""
    
    def test_create_integration_success(self, setup_database):
        """Test successful integration creation"""
        integration_data = {
            "name": "DATEV Integration",
            "typ": IntegrationType.API,
            "beschreibung": "Integration mit DATEV für Buchhaltung",
            "konfiguration": {"api_key": "test_key", "endpoint": "https://api.datev.de"},
            "endpoint_url": "https://api.datev.de/v1",
            "api_key": "sk_test_123456789",
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/integration/", json=integration_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "DATEV Integration"
        assert data["typ"] == "api"
        assert data["endpoint_url"] == "https://api.datev.de/v1"
        assert "id" in data

    def test_integration_validation(self, setup_database):
        """Test integration data validation"""
        invalid_data = {
            "name": "Test Integration",
            "typ": "invalid_type",  # Invalid type
            "beschreibung": "Test Beschreibung",
            "konfiguration": {},
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/integration/", json=invalid_data)
        assert response.status_code == 422

class TestBackupAPI:
    """Test cases for Backup endpoints"""
    
    def test_create_backup_success(self, setup_database):
        """Test successful backup creation"""
        backup_data = {
            "name": "Tägliches Backup",
            "typ": BackupType.FULL,
            "beschreibung": "Vollständiges tägliches Backup",
            "datei_pfad": "/backups/daily_backup_2024-01-15.sql",
            "datei_groesse": 52428800,  # 50MB
            "checksum": "a1b2c3d4e5f6...",
            "komprimiert": True,
            "verschluesselt": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/backup/", json=backup_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Tägliches Backup"
        assert data["typ"] == "full"
        assert data["datei_pfad"] == "/backups/daily_backup_2024-01-15.sql"
        assert data["komprimiert"] == True
        assert data["verschluesselt"] == True
        assert "id" in data

    def test_backup_validation(self, setup_database):
        """Test backup data validation"""
        invalid_data = {
            "name": "Test Backup",
            "typ": "invalid_type",  # Invalid type
            "datei_pfad": "/backups/test.sql",
            "komprimiert": True,
            "verschluesselt": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/backup/", json=invalid_data)
        assert response.status_code == 422

class TestMonitoringAlertAPI:
    """Test cases for MonitoringAlert endpoints"""
    
    def test_create_monitoring_alert_success(self, setup_database):
        """Test successful monitoring alert creation"""
        alert_data = {
            "name": "High CPU Usage",
            "beschreibung": "CPU-Nutzung über 90%",
            "level": MonitoringLevel.HIGH,
            "kategorie": "System",
            "bedingung": "cpu_usage > 90",
            "aktion": "send_email_notification",
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/monitoring-alert/", json=alert_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "High CPU Usage"
        assert data["level"] == "high"
        assert data["kategorie"] == "System"
        assert data["bedingung"] == "cpu_usage > 90"
        assert "id" in data

    def test_monitoring_alert_validation(self, setup_database):
        """Test monitoring alert data validation"""
        invalid_data = {
            "name": "Test Alert",
            "level": "invalid_level",  # Invalid level
            "kategorie": "Test",
            "bedingung": "test > 0",
            "aktion": "test_action",
            "aktiv": True
        }
        
        response = client.post("/api/v1/uebergreifende-services/monitoring-alert/", json=invalid_data)
        assert response.status_code == 422

class TestAPIErrorHandling:
    """Test cases for API error handling"""
    
    def test_404_not_found(self, setup_database):
        """Test 404 error for non-existent resources"""
        response = client.get("/api/v1/uebergreifende-services/benutzer/999")
        assert response.status_code == 404
        
        response = client.put("/api/v1/uebergreifende-services/benutzer/999", json={})
        assert response.status_code == 404
        
        response = client.delete("/api/v1/uebergreifende-services/benutzer/999")
        assert response.status_code == 404

    def test_422_validation_error(self, setup_database):
        """Test 422 error for invalid data"""
        invalid_data = {
            "username": "",  # Empty required field
            "email": "test@example.com",
            "vorname": "Max",
            "nachname": "Mustermann"
        }
        
        response = client.post("/api/v1/uebergreifende-services/benutzer/", json=invalid_data)
        assert response.status_code == 422

    def test_400_business_logic_error(self, setup_database):
        """Test 400 error for business logic violations"""
        # Test duplicate creation
        benutzer_data = {
            "username": "duplicate",
            "email": "duplicate@example.com",
            "vorname": "Max",
            "nachname": "Mustermann",
            "password": "securepassword123"
        }
        
        # Create first
        client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        assert response.status_code == 400

class TestAPIPagination:
    """Test cases for API pagination"""
    
    def test_pagination_default(self, setup_database, sample_benutzer_data):
        """Test default pagination"""
        # Create multiple users
        for i in range(25):
            benutzer_data = sample_benutzer_data.copy()
            benutzer_data["username"] = f"testuser{i+1}"
            benutzer_data["email"] = f"test{i+1}@example.com"
            benutzer_data["password"] = "securepassword123"
            client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        
        response = client.get("/api/v1/uebergreifende-services/benutzer/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 20  # Default page size
        assert data["total"] == 25
        assert data["page"] == 1

    def test_pagination_with_params(self, setup_database, sample_benutzer_data):
        """Test pagination with custom parameters"""
        # Create multiple users
        for i in range(50):
            benutzer_data = sample_benutzer_data.copy()
            benutzer_data["username"] = f"testuser{i+1}"
            benutzer_data["email"] = f"test{i+1}@example.com"
            benutzer_data["password"] = "securepassword123"
            client.post("/api/v1/uebergreifende-services/benutzer/", json=benutzer_data)
        
        response = client.get("/api/v1/uebergreifende-services/benutzer/?page=2&size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 2
        assert data["size"] == 10
        assert data["total"] == 50

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 