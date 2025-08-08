"""
VALEO NeuroERP 2.0 - Test Configuration
Serena Quality: Central test configuration for all API tests
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator, Dict, Any
import os
import tempfile
import shutil

from backend.app.main import app
from backend.app.database.connection import get_db, Base
from backend.app.models import (
    # Warenwirtschaft
    ArtikelStammdaten, Lager, Einlagerung, Bestellung, BestellPosition,
    Lieferant, Inventur, InventurPosition,
    # Finanzbuchhaltung
    Konto, Kontengruppe, Buchung, Buchungsvorlage, Rechnung, 
    RechnungPosition, Zahlung, Kostenstelle, Budget, Steuer,
    # CRM
    Kunde, Kontakt, Angebot, AngebotPosition, Auftrag, AuftragPosition,
    Verkaufschance, MarketingKampagne, Kundenservice, TicketAntwort,
    # Übergreifende Services
    Benutzer, Rolle, Permission, SystemEinstellung, WorkflowDefinition,
    WorkflowExecution, Dokument, DokumentVersion, Integration, Backup, MonitoringAlert
)

# Test database configuration
TEST_DATABASE_URL = "sqlite:///./test_valero_erp.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override database dependency
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session) -> Generator[TestClient, None, None]:
    """Create a test client with database session"""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def sample_warenwirtschaft_data() -> Dict[str, Any]:
    """Sample data for Warenwirtschaft tests"""
    return {
        "artikel": {
            "artikelnummer": "ART001",
            "bezeichnung": "Test Artikel",
            "typ": "fertigprodukt",
            "ean": "1234567890123",
            "hersteller": "Test Hersteller",
            "gewicht": "1.5",
            "volumen": "0.001",
            "mindestbestand": 10,
            "optimalbestand": 50,
            "einheit": "Stück",
            "preis": "19.99",
            "steuersatz": "19.0",
            "aktiv": True
        },
        "lager": {
            "name": "Test Lager",
            "typ": "hauptlager",
            "adresse": "Teststraße 123, 12345 Teststadt",
            "kontakt_person": "Max Mustermann",
            "telefon": "+49 123 456789",
            "email": "lager@test.de",
            "aktiv": True
        },
        "lieferant": {
            "name": "Test Lieferant GmbH",
            "anschrift": "Lieferantenstraße 456, 54321 Lieferstadt",
            "telefon": "+49 987 654321",
            "email": "info@testlieferant.de",
            "website": "https://testlieferant.de",
            "steuernummer": "123/456/78901",
            "ust_id": "DE123456789",
            "zahlungsziel_tage": 30,
            "aktiv": True
        }
    }

@pytest.fixture
def sample_finanzbuchhaltung_data() -> Dict[str, Any]:
    """Sample data for Finanzbuchhaltung tests"""
    return {
        "konto": {
            "kontonummer": "1000",
            "bezeichnung": "Kasse",
            "typ": "aktiva",
            "kontengruppe_id": None,
            "steuersatz": "0.0",
            "aktiv": True
        },
        "kontengruppe": {
            "gruppennummer": "1000",
            "bezeichnung": "Aktiva",
            "typ": "aktiva",
            "aktiv": True
        },
        "buchung": {
            "buchungsdatum": "2024-01-15",
            "buchungstext": "Test Buchung",
            "soll_konto_id": 1,
            "haben_konto_id": 2,
            "betrag": "100.00",
            "steuerbetrag": "19.00",
            "belegnummer": "BELEG001",
            "bemerkung": "Test Buchung"
        },
        "rechnung": {
            "rechnungsdatum": "2024-01-15",
            "faelligkeitsdatum": "2024-02-15",
            "kunde_id": 1,
            "lieferant_id": None,
            "rechnungstyp": "ausgang",
            "status": "erstellt",
            "netto_betrag": "100.00",
            "steuerbetrag": "19.00",
            "brutto_betrag": "119.00",
            "zahlungsziel_tage": 30,
            "bemerkung": "Test Rechnung"
        }
    }

@pytest.fixture
def sample_crm_data() -> Dict[str, Any]:
    """Sample data for CRM tests"""
    return {
        "kunde": {
            "kundennummer": "K001",
            "typ": "geschaeft",
            "name": "Test Kunde GmbH",
            "anschrift": "Kundenstraße 123, 12345 Kundenstadt",
            "telefon": "+49 123 456789",
            "email": "info@testkunde.de",
            "website": "https://testkunde.de",
            "steuernummer": "123/456/78901",
            "ust_id": "DE123456789",
            "zahlungsziel_tage": 30,
            "kreditlimit": "10000.00",
            "aktiv": True
        },
        "kontakt": {
            "kunde_id": 1,
            "vorname": "Max",
            "nachname": "Mustermann",
            "position": "Geschäftsführer",
            "telefon": "+49 123 456789",
            "email": "max.mustermann@testkunde.de",
            "mobil": "+49 987 654321",
            "hauptkontakt": True,
            "bemerkung": "Hauptansprechpartner"
        },
        "angebot": {
            "kunde_id": 1,
            "angebotsdatum": "2024-01-15",
            "gueltig_bis": "2024-02-15",
            "status": "erstellt",
            "netto_betrag": "1000.00",
            "steuerbetrag": "190.00",
            "brutto_betrag": "1190.00",
            "bemerkung": "Test Angebot"
        },
        "auftrag": {
            "kunde_id": 1,
            "angebot_id": None,
            "auftragsdatum": "2024-01-15",
            "gewuenschtes_lieferdatum": "2024-02-15",
            "status": "erstellt",
            "netto_betrag": "1000.00",
            "steuerbetrag": "190.00",
            "brutto_betrag": "1190.00",
            "bemerkung": "Test Auftrag"
        }
    }

@pytest.fixture
def sample_uebergreifende_services_data() -> Dict[str, Any]:
    """Sample data for Übergreifende Services tests"""
    return {
        "benutzer": {
            "username": "testuser",
            "email": "test@example.com",
            "vorname": "Max",
            "nachname": "Mustermann",
            "status": "aktiv",
            "telefon": "+49 123 456789",
            "abteilung": "IT",
            "position": "Entwickler",
            "aktiv": True,
            "password": "securepassword123"
        },
        "rolle": {
            "name": "Administrator",
            "beschreibung": "Vollzugriff auf alle Funktionen",
            "aktiv": True
        },
        "permission": {
            "name": "warenwirtschaft_read",
            "modul": "warenwirtschaft",
            "resource": "artikel",
            "action": "read",
            "level": "read",
            "beschreibung": "Artikel lesen",
            "aktiv": True
        },
        "system_einstellung": {
            "schluessel": "system.name",
            "wert": "VALEO NeuroERP 2.0",
            "typ": "string",
            "beschreibung": "Systemname",
            "kategorie": "general",
            "aktiv": True
        }
    }

@pytest.fixture
def test_headers() -> Dict[str, str]:
    """Test headers for API requests"""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

@pytest.fixture
def mock_current_user():
    """Mock current user for authentication tests"""
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "vorname": "Max",
        "nachname": "Mustermann",
        "status": "aktiv",
        "aktiv": True
    }

@pytest.fixture
def mock_permissions():
    """Mock permissions for authorization tests"""
    return [
        "warenwirtschaft:artikel:read",
        "warenwirtschaft:artikel:write",
        "finanzbuchhaltung:konto:read",
        "finanzbuchhaltung:konto:write",
        "crm:kunde:read",
        "crm:kunde:write",
        "uebergreifende_services:benutzer:read",
        "uebergreifende_services:benutzer:write"
    ]

class TestDataFactory:
    """Factory for creating test data"""
    
    @staticmethod
    def create_artikel_data(artikelnummer: str = "ART001") -> Dict[str, Any]:
        """Create article test data"""
        return {
            "artikelnummer": artikelnummer,
            "bezeichnung": f"Test Artikel {artikelnummer}",
            "typ": "fertigprodukt",
            "ean": "1234567890123",
            "hersteller": "Test Hersteller",
            "gewicht": "1.5",
            "volumen": "0.001",
            "mindestbestand": 10,
            "optimalbestand": 50,
            "einheit": "Stück",
            "preis": "19.99",
            "steuersatz": "19.0",
            "aktiv": True
        }
    
    @staticmethod
    def create_konto_data(kontonummer: str = "1000") -> Dict[str, Any]:
        """Create account test data"""
        return {
            "kontonummer": kontonummer,
            "bezeichnung": f"Test Konto {kontonummer}",
            "typ": "aktiva",
            "kontengruppe_id": None,
            "steuersatz": "0.0",
            "aktiv": True
        }
    
    @staticmethod
    def create_kunde_data(kundennummer: str = "K001") -> Dict[str, Any]:
        """Create customer test data"""
        return {
            "kundennummer": kundennummer,
            "typ": "geschaeft",
            "name": f"Test Kunde {kundennummer} GmbH",
            "anschrift": f"Kundenstraße {kundennummer}, 12345 Kundenstadt",
            "telefon": "+49 123 456789",
            "email": f"info@testkunde{kundennummer}.de",
            "website": f"https://testkunde{kundennummer}.de",
            "steuernummer": "123/456/78901",
            "ust_id": "DE123456789",
            "zahlungsziel_tage": 30,
            "kreditlimit": "10000.00",
            "aktiv": True
        }
    
    @staticmethod
    def create_benutzer_data(username: str = "testuser") -> Dict[str, Any]:
        """Create user test data"""
        return {
            "username": username,
            "email": f"{username}@example.com",
            "vorname": "Max",
            "nachname": "Mustermann",
            "status": "aktiv",
            "telefon": "+49 123 456789",
            "abteilung": "IT",
            "position": "Entwickler",
            "aktiv": True,
            "password": "securepassword123"
        }

class TestAssertions:
    """Custom assertions for API tests"""
    
    @staticmethod
    def assert_successful_response(response, expected_status_code: int = 201):
        """Assert successful API response"""
        assert response.status_code == expected_status_code
        assert response.headers["content-type"] == "application/json"
    
    @staticmethod
    def assert_error_response(response, expected_status_code: int = 400):
        """Assert error API response"""
        assert response.status_code == expected_status_code
        assert "detail" in response.json()
    
    @staticmethod
    def assert_validation_error(response):
        """Assert validation error response"""
        assert response.status_code == 422
        assert "detail" in response.json()
    
    @staticmethod
    def assert_not_found_error(response):
        """Assert not found error response"""
        assert response.status_code == 404
    
    @staticmethod
    def assert_unauthorized_error(response):
        """Assert unauthorized error response"""
        assert response.status_code == 401
    
    @staticmethod
    def assert_forbidden_error(response):
        """Assert forbidden error response"""
        assert response.status_code == 403
    
    @staticmethod
    def assert_pagination_response(response, expected_total: int, expected_page: int = 1):
        """Assert pagination response structure"""
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "pages" in data
        assert data["total"] == expected_total
        assert data["page"] == expected_page
        assert isinstance(data["items"], list)

class TestHelpers:
    """Helper functions for tests"""
    
    @staticmethod
    def create_test_entity(client: TestClient, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a test entity and return the response data"""
        response = client.post(endpoint, json=data)
        assert response.status_code == 201
        return response.json()
    
    @staticmethod
    def create_multiple_test_entities(client: TestClient, endpoint: str, data_template: Dict[str, Any], count: int) -> list:
        """Create multiple test entities and return the response data list"""
        entities = []
        for i in range(count):
            data = data_template.copy()
            # Update unique fields
            if "artikelnummer" in data:
                data["artikelnummer"] = f"{data['artikelnummer']}{i+1}"
            if "kundennummer" in data:
                data["kundennummer"] = f"{data['kundennummer']}{i+1}"
            if "kontonummer" in data:
                data["kontonummer"] = f"{data['kontonummer']}{i+1}"
            if "username" in data:
                data["username"] = f"{data['username']}{i+1}"
                data["email"] = f"{data['username']}{i+1}@example.com"
            
            response = client.post(endpoint, json=data)
            assert response.status_code == 201
            entities.append(response.json())
        
        return entities
    
    @staticmethod
    def cleanup_test_data(client: TestClient, endpoint: str, entity_ids: list):
        """Clean up test data by deleting entities"""
        for entity_id in entity_ids:
            response = client.delete(f"{endpoint}/{entity_id}")
            assert response.status_code == 204

# Test markers for different modules
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line(
        "markers", "warenwirtschaft: mark test as Warenwirtschaft module test"
    )
    config.addinivalue_line(
        "markers", "finanzbuchhaltung: mark test as Finanzbuchhaltung module test"
    )
    config.addinivalue_line(
        "markers", "crm: mark test as CRM module test"
    )
    config.addinivalue_line(
        "markers", "uebergreifende_services: mark test as Übergreifende Services module test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running test"
    )

# Test collection hooks
def pytest_collection_modifyitems(config, items):
    """Modify test collection to add default markers"""
    for item in items:
        # Add module markers based on test file names
        if "warenwirtschaft" in item.nodeid:
            item.add_marker(pytest.mark.warenwirtschaft)
        elif "finanzbuchhaltung" in item.nodeid:
            item.add_marker(pytest.mark.finanzbuchhaltung)
        elif "crm" in item.nodeid:
            item.add_marker(pytest.mark.crm)
        elif "uebergreifende_services" in item.nodeid:
            item.add_marker(pytest.mark.uebergreifende_services)
        
        # Add integration marker for API tests
        if "test_" in item.nodeid and "api" in item.nodeid:
            item.add_marker(pytest.mark.integration) 