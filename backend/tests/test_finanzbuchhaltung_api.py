"""
VALEO NeuroERP 2.0 - Finanzbuchhaltung API Tests
Serena Quality: Comprehensive unit and integration tests for all FiBu endpoints
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
from backend.app.models.finanzbuchhaltung import (
    Konto, Kontengruppe, Buchung, Buchungsvorlage, Rechnung, 
    RechnungPosition, Zahlung, Kostenstelle, Budget, Steuer
)
from backend.app.schemas.finanzbuchhaltung import (
    KontenTyp, BuchungTyp, RechnungStatus, ZahlungTyp, SteuerTyp
)

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_fibu.db"
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
def sample_konto_data():
    """Sample account data for testing"""
    return {
        "kontonummer": "1000",
        "bezeichnung": "Kasse",
        "typ": KontenTyp.AKTIVA,
        "kontengruppe_id": None,
        "steuersatz": Decimal("0.0"),
        "aktiv": True
    }

@pytest.fixture
def sample_kontengruppe_data():
    """Sample account group data for testing"""
    return {
        "gruppennummer": "1000",
        "bezeichnung": "Aktiva",
        "typ": KontenTyp.AKTIVA,
        "aktiv": True
    }

@pytest.fixture
def sample_buchung_data():
    """Sample booking data for testing"""
    return {
        "buchungsdatum": "2024-01-15",
        "buchungstext": "Test Buchung",
        "soll_konto_id": 1,
        "haben_konto_id": 2,
        "betrag": Decimal("100.00"),
        "steuerbetrag": Decimal("19.00"),
        "belegnummer": "BELEG001",
        "bemerkung": "Test Buchung"
    }

@pytest.fixture
def sample_rechnung_data():
    """Sample invoice data for testing"""
    return {
        "rechnungsdatum": "2024-01-15",
        "faelligkeitsdatum": "2024-02-15",
        "kunde_id": 1,
        "lieferant_id": None,
        "rechnungstyp": "ausgang",
        "status": RechnungStatus.ERSTELLT,
        "netto_betrag": Decimal("100.00"),
        "steuerbetrag": Decimal("19.00"),
        "brutto_betrag": Decimal("119.00"),
        "zahlungsziel_tage": 30,
        "bemerkung": "Test Rechnung"
    }

@pytest.fixture
def sample_zahlung_data():
    """Sample payment data for testing"""
    return {
        "zahlungsdatum": "2024-01-20",
        "rechnung_id": 1,
        "zahlungstyp": ZahlungTyp.UEBERWEISUNG,
        "betrag": Decimal("119.00"),
        "referenz": "REF001",
        "bemerkung": "Test Zahlung"
    }

class TestKontoAPI:
    """Test cases for Konto endpoints"""
    
    def test_create_konto_success(self, setup_database, sample_konto_data):
        """Test successful account creation"""
        response = client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        assert response.status_code == 201
        data = response.json()
        assert data["kontonummer"] == "1000"
        assert data["bezeichnung"] == "Kasse"
        assert data["typ"] == "aktiva"
        assert "id" in data
        assert "erstellt_am" in data

    def test_create_konto_duplicate(self, setup_database, sample_konto_data):
        """Test duplicate account creation fails"""
        # Create first account
        client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        assert response.status_code == 400
        assert "bereits vorhanden" in response.json()["detail"]

    def test_get_konto_list(self, setup_database, sample_konto_data):
        """Test account list retrieval"""
        # Create test accounts
        for i in range(3):
            konto_data = sample_konto_data.copy()
            konto_data["kontonummer"] = f"100{i}"
            konto_data["bezeichnung"] = f"Test Konto {i+1}"
            client.post("/api/v1/finanzbuchhaltung/konto/", json=konto_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/konto/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 3

    def test_get_konto_by_id(self, setup_database, sample_konto_data):
        """Test account retrieval by ID"""
        # Create account
        create_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        konto_id = create_response.json()["id"]
        
        # Get account by ID
        response = client.get(f"/api/v1/finanzbuchhaltung/konto/{konto_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["kontonummer"] == "1000"
        assert data["bezeichnung"] == "Kasse"

    def test_update_konto(self, setup_database, sample_konto_data):
        """Test account update"""
        # Create account
        create_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        konto_id = create_response.json()["id"]
        
        # Update account
        update_data = {"bezeichnung": "Aktualisierte Kasse", "aktiv": False}
        response = client.put(f"/api/v1/finanzbuchhaltung/konto/{konto_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["bezeichnung"] == "Aktualisierte Kasse"
        assert data["aktiv"] == False

    def test_delete_konto(self, setup_database, sample_konto_data):
        """Test account deletion"""
        # Create account
        create_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=sample_konto_data)
        konto_id = create_response.json()["id"]
        
        # Delete account
        response = client.delete(f"/api/v1/finanzbuchhaltung/konto/{konto_id}")
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/v1/finanzbuchhaltung/konto/{konto_id}")
        assert get_response.status_code == 404

    def test_konto_validation(self, setup_database):
        """Test account data validation"""
        invalid_data = {
            "kontonummer": "",  # Empty kontonummer
            "bezeichnung": "Test",
            "typ": "invalid_type",  # Invalid type
            "aktiv": True
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/konto/", json=invalid_data)
        assert response.status_code == 422

class TestKontengruppeAPI:
    """Test cases for Kontengruppe endpoints"""
    
    def test_create_kontengruppe_success(self, setup_database, sample_kontengruppe_data):
        """Test successful account group creation"""
        response = client.post("/api/v1/finanzbuchhaltung/kontengruppe/", json=sample_kontengruppe_data)
        assert response.status_code == 201
        data = response.json()
        assert data["gruppennummer"] == "1000"
        assert data["bezeichnung"] == "Aktiva"
        assert data["typ"] == "aktiva"
        assert "id" in data

    def test_get_kontengruppe_list(self, setup_database, sample_kontengruppe_data):
        """Test account group list retrieval"""
        # Create test groups
        for i in range(2):
            gruppe_data = sample_kontengruppe_data.copy()
            gruppe_data["gruppennummer"] = f"100{i}"
            gruppe_data["bezeichnung"] = f"Test Gruppe {i+1}"
            client.post("/api/v1/finanzbuchhaltung/kontengruppe/", json=gruppe_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/kontengruppe/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2

    def test_update_kontengruppe(self, setup_database, sample_kontengruppe_data):
        """Test account group update"""
        # Create group
        create_response = client.post("/api/v1/finanzbuchhaltung/kontengruppe/", json=sample_kontengruppe_data)
        gruppe_id = create_response.json()["id"]
        
        # Update group
        update_data = {"bezeichnung": "Aktualisierte Aktiva", "aktiv": False}
        response = client.put(f"/api/v1/finanzbuchhaltung/kontengruppe/{gruppe_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["bezeichnung"] == "Aktualisierte Aktiva"
        assert data["aktiv"] == False

class TestBuchungAPI:
    """Test cases for Buchung endpoints"""
    
    def test_create_buchung_success(self, setup_database, sample_konto_data):
        """Test successful booking creation"""
        # Create prerequisite accounts
        konto1_data = sample_konto_data.copy()
        konto1_data["kontonummer"] = "1000"
        konto1_data["bezeichnung"] = "Kasse"
        
        konto2_data = sample_konto_data.copy()
        konto2_data["kontonummer"] = "1200"
        konto2_data["bezeichnung"] = "Bank"
        
        konto1_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=konto1_data)
        konto2_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=konto2_data)
        
        konto1_id = konto1_response.json()["id"]
        konto2_id = konto2_response.json()["id"]
        
        # Create booking
        buchung_data = {
            "buchungsdatum": "2024-01-15",
            "buchungstext": "Test Buchung",
            "soll_konto_id": konto1_id,
            "haben_konto_id": konto2_id,
            "betrag": "100.00",
            "steuerbetrag": "19.00",
            "belegnummer": "BELEG001",
            "bemerkung": "Test Buchung"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/buchung/", json=buchung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["betrag"] == "100.00"
        assert data["buchungstext"] == "Test Buchung"
        assert "buchungsnummer" in data

    def test_buchung_with_invalid_konten(self, setup_database):
        """Test booking creation with invalid account IDs"""
        buchung_data = {
            "buchungsdatum": "2024-01-15",
            "buchungstext": "Test Buchung",
            "soll_konto_id": 999,  # Non-existent account
            "haben_konto_id": 998,  # Non-existent account
            "betrag": "100.00"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/buchung/", json=buchung_data)
        assert response.status_code == 400

    def test_get_buchung_list(self, setup_database, sample_konto_data):
        """Test booking list retrieval"""
        # Create accounts and bookings
        konto1_data = sample_konto_data.copy()
        konto1_data["kontonummer"] = "1000"
        konto2_data = sample_konto_data.copy()
        konto2_data["kontonummer"] = "1200"
        
        konto1_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=konto1_data)
        konto2_response = client.post("/api/v1/finanzbuchhaltung/konto/", json=konto2_data)
        
        konto1_id = konto1_response.json()["id"]
        konto2_id = konto2_response.json()["id"]
        
        # Create multiple bookings
        for i in range(3):
            buchung_data = {
                "buchungsdatum": "2024-01-15",
                "buchungstext": f"Test Buchung {i+1}",
                "soll_konto_id": konto1_id,
                "haben_konto_id": konto2_id,
                "betrag": f"{100 + i}.00"
            }
            client.post("/api/v1/finanzbuchhaltung/buchung/", json=buchung_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/buchung/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

class TestRechnungAPI:
    """Test cases for Rechnung endpoints"""
    
    def test_create_rechnung_success(self, setup_database):
        """Test successful invoice creation"""
        rechnung_data = {
            "rechnungsdatum": "2024-01-15",
            "faelligkeitsdatum": "2024-02-15",
            "kunde_id": 1,
            "lieferant_id": None,
            "rechnungstyp": "ausgang",
            "status": RechnungStatus.ERSTELLT,
            "netto_betrag": "100.00",
            "steuerbetrag": "19.00",
            "brutto_betrag": "119.00",
            "zahlungsziel_tage": 30,
            "bemerkung": "Test Rechnung"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/rechnung/", json=rechnung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["netto_betrag"] == "100.00"
        assert data["brutto_betrag"] == "119.00"
        assert data["status"] == "erstellt"
        assert "rechnungsnummer" in data

    def test_rechnung_status_transitions(self, setup_database):
        """Test invoice status transitions"""
        rechnung_data = {
            "rechnungsdatum": "2024-01-15",
            "faelligkeitsdatum": "2024-02-15",
            "kunde_id": 1,
            "rechnungstyp": "ausgang",
            "status": RechnungStatus.ERSTELLT,
            "netto_betrag": "100.00",
            "steuerbetrag": "19.00",
            "brutto_betrag": "119.00",
            "zahlungsziel_tage": 30
        }
        
        create_response = client.post("/api/v1/finanzbuchhaltung/rechnung/", json=rechnung_data)
        rechnung_id = create_response.json()["id"]
        
        # Update status to sent
        update_data = {"status": RechnungStatus.VERSENDET}
        response = client.put(f"/api/v1/finanzbuchhaltung/rechnung/{rechnung_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "versendet"

class TestZahlungAPI:
    """Test cases for Zahlung endpoints"""
    
    def test_create_zahlung_success(self, setup_database):
        """Test successful payment creation"""
        # First create an invoice
        rechnung_data = {
            "rechnungsdatum": "2024-01-15",
            "faelligkeitsdatum": "2024-02-15",
            "kunde_id": 1,
            "rechnungstyp": "ausgang",
            "status": RechnungStatus.ERSTELLT,
            "netto_betrag": "100.00",
            "steuerbetrag": "19.00",
            "brutto_betrag": "119.00",
            "zahlungsziel_tage": 30
        }
        
        rechnung_response = client.post("/api/v1/finanzbuchhaltung/rechnung/", json=rechnung_data)
        rechnung_id = rechnung_response.json()["id"]
        
        # Create payment
        zahlung_data = {
            "zahlungsdatum": "2024-01-20",
            "rechnung_id": rechnung_id,
            "zahlungstyp": ZahlungTyp.UEBERWEISUNG,
            "betrag": "119.00",
            "referenz": "REF001",
            "bemerkung": "Test Zahlung"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/zahlung/", json=zahlung_data)
        assert response.status_code == 201
        data = response.json()
        assert data["betrag"] == "119.00"
        assert data["zahlungstyp"] == "ueberweisung"
        assert "zahlungsnummer" in data

    def test_zahlung_with_invalid_rechnung(self, setup_database):
        """Test payment creation with invalid invoice ID"""
        zahlung_data = {
            "zahlungsdatum": "2024-01-20",
            "rechnung_id": 999,  # Non-existent invoice
            "zahlungstyp": ZahlungTyp.UEBERWEISUNG,
            "betrag": "119.00"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/zahlung/", json=zahlung_data)
        assert response.status_code == 400

class TestKostenstelleAPI:
    """Test cases for Kostenstelle endpoints"""
    
    def test_create_kostenstelle_success(self, setup_database):
        """Test successful cost center creation"""
        kostenstelle_data = {
            "kostenstellen_nummer": "KS001",
            "bezeichnung": "Marketing",
            "abteilung": "Marketing",
            "verantwortlicher": "Max Mustermann",
            "budget": "50000.00",
            "aktiv": True
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/kostenstelle/", json=kostenstelle_data)
        assert response.status_code == 201
        data = response.json()
        assert data["kostenstellen_nummer"] == "KS001"
        assert data["bezeichnung"] == "Marketing"
        assert data["budget"] == "50000.00"

    def test_get_kostenstelle_list(self, setup_database):
        """Test cost center list retrieval"""
        # Create test cost centers
        for i in range(3):
            kostenstelle_data = {
                "kostenstellen_nummer": f"KS00{i+1}",
                "bezeichnung": f"Test Kostenstelle {i+1}",
                "abteilung": f"Abteilung {i+1}",
                "aktiv": True
            }
            client.post("/api/v1/finanzbuchhaltung/kostenstelle/", json=kostenstelle_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/kostenstelle/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

class TestBudgetAPI:
    """Test cases for Budget endpoints"""
    
    def test_create_budget_success(self, setup_database):
        """Test successful budget creation"""
        # First create a cost center
        kostenstelle_data = {
            "kostenstellen_nummer": "KS001",
            "bezeichnung": "Marketing",
            "aktiv": True
        }
        
        kostenstelle_response = client.post("/api/v1/finanzbuchhaltung/kostenstelle/", json=kostenstelle_data)
        kostenstelle_id = kostenstelle_response.json()["id"]
        
        # Create budget
        budget_data = {
            "jahr": 2024,
            "kostenstelle_id": kostenstelle_id,
            "kategorie": "Marketing Budget",
            "budget_betrag": "50000.00",
            "verbraucht_betrag": "0.00",
            "bemerkung": "Test Budget"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/budget/", json=budget_data)
        assert response.status_code == 201
        data = response.json()
        assert data["jahr"] == 2024
        assert data["budget_betrag"] == "50000.00"
        assert data["verbraucht_betrag"] == "0.00"

class TestSteuerAPI:
    """Test cases for Steuer endpoints"""
    
    def test_create_steuer_success(self, setup_database):
        """Test successful tax creation"""
        steuer_data = {
            "steuernummer": "UST001",
            "bezeichnung": "Umsatzsteuer 19%",
            "steuertyp": SteuerTyp.UMSATZSTEUER,
            "steuersatz": "19.00",
            "aktiv": True
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/steuer/", json=steuer_data)
        assert response.status_code == 201
        data = response.json()
        assert data["steuernummer"] == "UST001"
        assert data["bezeichnung"] == "Umsatzsteuer 19%"
        assert data["steuersatz"] == "19.00"

    def test_steuer_validation(self, setup_database):
        """Test tax data validation"""
        invalid_data = {
            "steuernummer": "UST001",
            "bezeichnung": "Test Steuer",
            "steuertyp": "invalid_type",  # Invalid type
            "steuersatz": "150.00",  # Invalid rate > 100%
            "aktiv": True
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/steuer/", json=invalid_data)
        assert response.status_code == 422

class TestAPIErrorHandling:
    """Test cases for API error handling"""
    
    def test_404_not_found(self, setup_database):
        """Test 404 error for non-existent resources"""
        response = client.get("/api/v1/finanzbuchhaltung/konto/999")
        assert response.status_code == 404
        
        response = client.put("/api/v1/finanzbuchhaltung/konto/999", json={})
        assert response.status_code == 404
        
        response = client.delete("/api/v1/finanzbuchhaltung/konto/999")
        assert response.status_code == 404

    def test_422_validation_error(self, setup_database):
        """Test 422 error for invalid data"""
        invalid_data = {
            "kontonummer": "",  # Empty required field
            "bezeichnung": "Test"
        }
        
        response = client.post("/api/v1/finanzbuchhaltung/konto/", json=invalid_data)
        assert response.status_code == 422

    def test_400_business_logic_error(self, setup_database):
        """Test 400 error for business logic violations"""
        # Test duplicate creation
        konto_data = {
            "kontonummer": "DUPLICATE",
            "bezeichnung": "Test",
            "typ": "aktiva",
            "aktiv": True
        }
        
        # Create first
        client.post("/api/v1/finanzbuchhaltung/konto/", json=konto_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/finanzbuchhaltung/konto/", json=konto_data)
        assert response.status_code == 400

class TestAPIPagination:
    """Test cases for API pagination"""
    
    def test_pagination_default(self, setup_database, sample_konto_data):
        """Test default pagination"""
        # Create multiple accounts
        for i in range(25):
            konto_data = sample_konto_data.copy()
            konto_data["kontonummer"] = f"100{i:02d}"
            konto_data["bezeichnung"] = f"Test Konto {i}"
            client.post("/api/v1/finanzbuchhaltung/konto/", json=konto_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/konto/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 20  # Default page size
        assert data["total"] == 25
        assert data["page"] == 1

    def test_pagination_with_params(self, setup_database, sample_konto_data):
        """Test pagination with custom parameters"""
        # Create multiple accounts
        for i in range(50):
            konto_data = sample_konto_data.copy()
            konto_data["kontonummer"] = f"100{i:02d}"
            konto_data["bezeichnung"] = f"Test Konto {i}"
            client.post("/api/v1/finanzbuchhaltung/konto/", json=konto_data)
        
        response = client.get("/api/v1/finanzbuchhaltung/konto/?page=2&size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 2
        assert data["size"] == 10
        assert data["total"] == 50

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 