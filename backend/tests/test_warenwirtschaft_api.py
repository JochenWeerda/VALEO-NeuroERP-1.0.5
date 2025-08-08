"""
VALEO NeuroERP 2.0 - Warenwirtschaft API Tests
Serena Quality: Comprehensive unit and integration tests for all WaWi endpoints
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
from backend.app.models.warenwirtschaft import (
    ArtikelStammdaten, Lager, Einlagerung, Bestellung, 
    BestellPosition, Lieferant, Inventur, InventurPosition
)
from backend.app.schemas.warenwirtschaft import (
    ArtikelTyp, LagerTyp, BestellStatus, InventurStatus
)

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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
def sample_artikel_data():
    """Sample article data for testing"""
    return {
        "artikelnummer": "ART001",
        "bezeichnung": "Test Artikel",
        "typ": ArtikelTyp.FERTIGPRODUKT,
        "ean": "1234567890123",
        "hersteller": "Test Hersteller",
        "gewicht": Decimal("1.5"),
        "volumen": Decimal("0.001"),
        "mindestbestand": 10,
        "optimalbestand": 50,
        "einheit": "Stück",
        "preis": Decimal("19.99"),
        "steuersatz": Decimal("19.0"),
        "aktiv": True
    }

@pytest.fixture
def sample_lager_data():
    """Sample warehouse data for testing"""
    return {
        "name": "Test Lager",
        "typ": LagerTyp.HAUPTLAGER,
        "adresse": "Teststraße 123, 12345 Teststadt",
        "kontakt_person": "Max Mustermann",
        "telefon": "+49 123 456789",
        "email": "lager@test.de",
        "aktiv": True
    }

@pytest.fixture
def sample_lieferant_data():
    """Sample supplier data for testing"""
    return {
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

class TestArtikelStammdatenAPI:
    """Test cases for Artikel-Stammdaten endpoints"""
    
    def test_create_artikel_stammdaten_success(self, setup_database, sample_artikel_data):
        """Test successful article creation"""
        response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        assert response.status_code == 201
        data = response.json()
        assert data["artikelnummer"] == "ART001"
        assert data["bezeichnung"] == "Test Artikel"
        assert data["typ"] == "fertigprodukt"
        assert "id" in data
        assert "erstellt_am" in data

    def test_create_artikel_stammdaten_duplicate(self, setup_database, sample_artikel_data):
        """Test duplicate article creation fails"""
        # Create first article
        client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        assert response.status_code == 400
        assert "bereits vorhanden" in response.json()["detail"]

    def test_get_artikel_stammdaten_list(self, setup_database, sample_artikel_data):
        """Test article list retrieval"""
        # Create test articles
        for i in range(3):
            artikel_data = sample_artikel_data.copy()
            artikel_data["artikelnummer"] = f"ART00{i+1}"
            artikel_data["bezeichnung"] = f"Test Artikel {i+1}"
            client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=artikel_data)
        
        response = client.get("/api/v1/warenwirtschaft/artikel-stammdaten/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 3

    def test_get_artikel_stammdaten_by_id(self, setup_database, sample_artikel_data):
        """Test article retrieval by ID"""
        # Create article
        create_response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        artikel_id = create_response.json()["id"]
        
        # Get article by ID
        response = client.get(f"/api/v1/warenwirtschaft/artikel-stammdaten/{artikel_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["artikelnummer"] == "ART001"
        assert data["bezeichnung"] == "Test Artikel"

    def test_update_artikel_stammdaten(self, setup_database, sample_artikel_data):
        """Test article update"""
        # Create article
        create_response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        artikel_id = create_response.json()["id"]
        
        # Update article
        update_data = {"bezeichnung": "Aktualisierter Test Artikel", "preis": "29.99"}
        response = client.put(f"/api/v1/warenwirtschaft/artikel-stammdaten/{artikel_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["bezeichnung"] == "Aktualisierter Test Artikel"
        assert data["preis"] == "29.99"

    def test_delete_artikel_stammdaten(self, setup_database, sample_artikel_data):
        """Test article deletion"""
        # Create article
        create_response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        artikel_id = create_response.json()["id"]
        
        # Delete article
        response = client.delete(f"/api/v1/warenwirtschaft/artikel-stammdaten/{artikel_id}")
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/v1/warenwirtschaft/artikel-stammdaten/{artikel_id}")
        assert get_response.status_code == 404

    def test_artikel_stammdaten_validation(self, setup_database):
        """Test article data validation"""
        invalid_data = {
            "artikelnummer": "",  # Empty artikelnummer
            "bezeichnung": "Test",
            "typ": "invalid_type",  # Invalid type
            "einheit": "Stück"
        }
        
        response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=invalid_data)
        assert response.status_code == 422

class TestLagerAPI:
    """Test cases for Lager endpoints"""
    
    def test_create_lager_success(self, setup_database, sample_lager_data):
        """Test successful warehouse creation"""
        response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Lager"
        assert data["typ"] == "hauptlager"
        assert "id" in data

    def test_get_lager_list(self, setup_database, sample_lager_data):
        """Test warehouse list retrieval"""
        # Create test warehouses
        for i in range(2):
            lager_data = sample_lager_data.copy()
            lager_data["name"] = f"Test Lager {i+1}"
            client.post("/api/v1/warenwirtschaft/lager/", json=lager_data)
        
        response = client.get("/api/v1/warenwirtschaft/lager/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2

    def test_update_lager(self, setup_database, sample_lager_data):
        """Test warehouse update"""
        # Create warehouse
        create_response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        lager_id = create_response.json()["id"]
        
        # Update warehouse
        update_data = {"name": "Aktualisiertes Lager", "aktiv": False}
        response = client.put(f"/api/v1/warenwirtschaft/lager/{lager_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Aktualisiertes Lager"
        assert data["aktiv"] == False

class TestEinlagerungAPI:
    """Test cases for Einlagerung endpoints"""
    
    def test_create_einlagerung_success(self, setup_database, sample_artikel_data, sample_lager_data):
        """Test successful storage creation"""
        # Create prerequisite data
        artikel_response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=sample_artikel_data)
        lager_response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        
        artikel_id = artikel_response.json()["id"]
        lager_id = lager_response.json()["id"]
        
        # Create storage
        einlagerung_data = {
            "artikel_id": artikel_id,
            "lager_id": lager_id,
            "menge": "100.0",
            "lagerplatz": "A-01-01",
            "chargennummer": "CH001",
            "seriennummer": "SN001",
            "ablaufdatum": "2024-12-31",
            "qualitaetskontrolle": True,
            "bemerkung": "Test Einlagerung"
        }
        
        response = client.post("/api/v1/warenwirtschaft/einlagerung/", json=einlagerung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["menge"] == "100.0"
        assert data["lagerplatz"] == "A-01-01"
        assert data["qualitaetskontrolle"] == True

    def test_einlagerung_with_invalid_artikel(self, setup_database, sample_lager_data):
        """Test storage creation with invalid article ID"""
        lager_response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        lager_id = lager_response.json()["id"]
        
        einlagerung_data = {
            "artikel_id": 999,  # Non-existent article
            "lager_id": lager_id,
            "menge": "100.0"
        }
        
        response = client.post("/api/v1/warenwirtschaft/einlagerung/", json=einlagerung_data)
        assert response.status_code == 400

class TestBestellungAPI:
    """Test cases for Bestellung endpoints"""
    
    def test_create_bestellung_success(self, setup_database, sample_lieferant_data):
        """Test successful order creation"""
        # Create supplier
        lieferant_response = client.post("/api/v1/warenwirtschaft/lieferant/", json=sample_lieferant_data)
        lieferant_id = lieferant_response.json()["id"]
        
        # Create order
        bestellung_data = {
            "lieferant_id": lieferant_id,
            "bestelldatum": "2024-01-15",
            "gewuenschtes_lieferdatum": "2024-01-30",
            "status": BestellStatus.ERSTELLT,
            "bemerkung": "Test Bestellung"
        }
        
        response = client.post("/api/v1/warenwirtschaft/bestellung/", json=bestellung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "erstellt"
        assert "bestellnummer" in data

    def test_bestellung_status_transitions(self, setup_database, sample_lieferant_data):
        """Test order status transitions"""
        # Create supplier and order
        lieferant_response = client.post("/api/v1/warenwirtschaft/lieferant/", json=sample_lieferant_data)
        lieferant_id = lieferant_response.json()["id"]
        
        bestellung_data = {
            "lieferant_id": lieferant_id,
            "bestelldatum": "2024-01-15",
            "status": BestellStatus.ERSTELLT
        }
        
        create_response = client.post("/api/v1/warenwirtschaft/bestellung/", json=bestellung_data)
        bestellung_id = create_response.json()["id"]
        
        # Update status to confirmed
        update_data = {"status": BestellStatus.BESTAETIGT}
        response = client.put(f"/api/v1/warenwirtschaft/bestellung/{bestellung_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "bestaetigt"

class TestLieferantAPI:
    """Test cases for Lieferant endpoints"""
    
    def test_create_lieferant_success(self, setup_database, sample_lieferant_data):
        """Test successful supplier creation"""
        response = client.post("/api/v1/warenwirtschaft/lieferant/", json=sample_lieferant_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Lieferant GmbH"
        assert data["email"] == "info@testlieferant.de"
        assert data["zahlungsziel_tage"] == 30

    def test_lieferant_email_validation(self, setup_database, sample_lieferant_data):
        """Test supplier email validation"""
        invalid_data = sample_lieferant_data.copy()
        invalid_data["email"] = "invalid-email"
        
        response = client.post("/api/v1/warenwirtschaft/lieferant/", json=invalid_data)
        assert response.status_code == 422

class TestInventurAPI:
    """Test cases for Inventur endpoints"""
    
    def test_create_inventur_success(self, setup_database, sample_lager_data):
        """Test successful inventory creation"""
        # Create warehouse
        lager_response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        lager_id = lager_response.json()["id"]
        
        # Create inventory
        inventur_data = {
            "lager_id": lager_id,
            "bezeichnung": "Jahresinventur 2024",
            "startdatum": "2024-01-01",
            "enddatum": "2024-01-31",
            "status": InventurStatus.PLANUNG,
            "bemerkung": "Test Inventur"
        }
        
        response = client.post("/api/v1/warenwirtschaft/inventur/", json=inventur_data)
        assert response.status_code == 201
        data = response.json()
        assert data["bezeichnung"] == "Jahresinventur 2024"
        assert data["status"] == "planung"
        assert "inventurnummer" in data

    def test_inventur_status_transitions(self, setup_database, sample_lager_data):
        """Test inventory status transitions"""
        # Create warehouse and inventory
        lager_response = client.post("/api/v1/warenwirtschaft/lager/", json=sample_lager_data)
        lager_id = lager_response.json()["id"]
        
        inventur_data = {
            "lager_id": lager_id,
            "bezeichnung": "Test Inventur",
            "startdatum": "2024-01-01",
            "status": InventurStatus.PLANUNG
        }
        
        create_response = client.post("/api/v1/warenwirtschaft/inventur/", json=inventur_data)
        inventur_id = create_response.json()["id"]
        
        # Update status to running
        update_data = {"status": InventurStatus.LAUFEND}
        response = client.put(f"/api/v1/warenwirtschaft/inventur/{inventur_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "laufend"

class TestAPIErrorHandling:
    """Test cases for API error handling"""
    
    def test_404_not_found(self, setup_database):
        """Test 404 error for non-existent resources"""
        response = client.get("/api/v1/warenwirtschaft/artikel-stammdaten/999")
        assert response.status_code == 404
        
        response = client.put("/api/v1/warenwirtschaft/artikel-stammdaten/999", json={})
        assert response.status_code == 404
        
        response = client.delete("/api/v1/warenwirtschaft/artikel-stammdaten/999")
        assert response.status_code == 404

    def test_422_validation_error(self, setup_database):
        """Test 422 error for invalid data"""
        invalid_data = {
            "artikelnummer": "",  # Empty required field
            "bezeichnung": "Test"
        }
        
        response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=invalid_data)
        assert response.status_code == 422

    def test_400_business_logic_error(self, setup_database):
        """Test 400 error for business logic violations"""
        # Test duplicate creation
        artikel_data = {
            "artikelnummer": "DUPLICATE",
            "bezeichnung": "Test",
            "typ": "fertigprodukt",
            "einheit": "Stück"
        }
        
        # Create first
        client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=artikel_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=artikel_data)
        assert response.status_code == 400

class TestAPIPagination:
    """Test cases for API pagination"""
    
    def test_pagination_default(self, setup_database, sample_artikel_data):
        """Test default pagination"""
        # Create multiple articles
        for i in range(25):
            artikel_data = sample_artikel_data.copy()
            artikel_data["artikelnummer"] = f"ART{i:03d}"
            artikel_data["bezeichnung"] = f"Test Artikel {i}"
            client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=artikel_data)
        
        response = client.get("/api/v1/warenwirtschaft/artikel-stammdaten/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 20  # Default page size
        assert data["total"] == 25
        assert data["page"] == 1

    def test_pagination_with_params(self, setup_database, sample_artikel_data):
        """Test pagination with custom parameters"""
        # Create multiple articles
        for i in range(50):
            artikel_data = sample_artikel_data.copy()
            artikel_data["artikelnummer"] = f"ART{i:03d}"
            artikel_data["bezeichnung"] = f"Test Artikel {i}"
            client.post("/api/v1/warenwirtschaft/artikel-stammdaten/", json=artikel_data)
        
        response = client.get("/api/v1/warenwirtschaft/artikel-stammdaten/?page=2&size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 2
        assert data["size"] == 10
        assert data["total"] == 50

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 