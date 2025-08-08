"""
VALEO NeuroERP 2.0 - CRM API Tests
Serena Quality: Comprehensive unit and integration tests for all CRM endpoints
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
from backend.app.models.crm import (
    Kunde, Kontakt, Angebot, AngebotPosition, Auftrag, 
    AuftragPosition, Verkaufschance, MarketingKampagne, 
    Kundenservice, TicketAntwort
)
from backend.app.schemas.crm import (
    KundenTyp, AngebotStatus, AuftragStatus, VerkaufschanceStatus, 
    TicketStatus, TicketPrioritaet
)

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crm.db"
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
def sample_kunde_data():
    """Sample customer data for testing"""
    return {
        "kundennummer": "K001",
        "typ": KundenTyp.GESCHAEFT,
        "name": "Test Kunde GmbH",
        "anschrift": "Kundenstraße 123, 12345 Kundenstadt",
        "telefon": "+49 123 456789",
        "email": "info@testkunde.de",
        "website": "https://testkunde.de",
        "steuernummer": "123/456/78901",
        "ust_id": "DE123456789",
        "zahlungsziel_tage": 30,
        "kreditlimit": Decimal("10000.00"),
        "aktiv": True
    }

@pytest.fixture
def sample_kontakt_data():
    """Sample contact data for testing"""
    return {
        "kunde_id": 1,
        "vorname": "Max",
        "nachname": "Mustermann",
        "position": "Geschäftsführer",
        "telefon": "+49 123 456789",
        "email": "max.mustermann@testkunde.de",
        "mobil": "+49 987 654321",
        "hauptkontakt": True,
        "bemerkung": "Hauptansprechpartner"
    }

@pytest.fixture
def sample_angebot_data():
    """Sample offer data for testing"""
    return {
        "kunde_id": 1,
        "angebotsdatum": "2024-01-15",
        "gueltig_bis": "2024-02-15",
        "status": AngebotStatus.ERSTELLT,
        "netto_betrag": Decimal("1000.00"),
        "steuerbetrag": Decimal("190.00"),
        "brutto_betrag": Decimal("1190.00"),
        "bemerkung": "Test Angebot"
    }

@pytest.fixture
def sample_auftrag_data():
    """Sample order data for testing"""
    return {
        "kunde_id": 1,
        "angebot_id": None,
        "auftragsdatum": "2024-01-15",
        "gewuenschtes_lieferdatum": "2024-02-15",
        "status": AuftragStatus.ERSTELLT,
        "netto_betrag": Decimal("1000.00"),
        "steuerbetrag": Decimal("190.00"),
        "brutto_betrag": Decimal("1190.00"),
        "bemerkung": "Test Auftrag"
    }

@pytest.fixture
def sample_verkaufschance_data():
    """Sample sales opportunity data for testing"""
    return {
        "kunde_id": 1,
        "bezeichnung": "Großauftrag Test Kunde",
        "status": VerkaufschanceStatus.LEAD,
        "wahrscheinlichkeit": 75,
        "erwarteter_wert": Decimal("50000.00"),
        "erwartetes_datum": "2024-06-30",
        "beschreibung": "Potentieller Großauftrag für neue Produktlinie",
        "bemerkung": "Hohe Priorität"
    }

class TestKundeAPI:
    """Test cases for Kunde endpoints"""
    
    def test_create_kunde_success(self, setup_database, sample_kunde_data):
        """Test successful customer creation"""
        response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        assert response.status_code == 201
        data = response.json()
        assert data["kundennummer"] == "K001"
        assert data["name"] == "Test Kunde GmbH"
        assert data["typ"] == "geschaeft"
        assert "id" in data
        assert "erstellt_am" in data

    def test_create_kunde_duplicate(self, setup_database, sample_kunde_data):
        """Test duplicate customer creation fails"""
        # Create first customer
        client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        assert response.status_code == 400
        assert "bereits vorhanden" in response.json()["detail"]

    def test_get_kunde_list(self, setup_database, sample_kunde_data):
        """Test customer list retrieval"""
        # Create test customers
        for i in range(3):
            kunde_data = sample_kunde_data.copy()
            kunde_data["kundennummer"] = f"K00{i+1}"
            kunde_data["name"] = f"Test Kunde {i+1} GmbH"
            client.post("/api/v1/crm/kunde/", json=kunde_data)
        
        response = client.get("/api/v1/crm/kunde/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 3

    def test_get_kunde_by_id(self, setup_database, sample_kunde_data):
        """Test customer retrieval by ID"""
        # Create customer
        create_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = create_response.json()["id"]
        
        # Get customer by ID
        response = client.get(f"/api/v1/crm/kunde/{kunde_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["kundennummer"] == "K001"
        assert data["name"] == "Test Kunde GmbH"

    def test_update_kunde(self, setup_database, sample_kunde_data):
        """Test customer update"""
        # Create customer
        create_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = create_response.json()["id"]
        
        # Update customer
        update_data = {"name": "Aktualisierter Test Kunde", "kreditlimit": "15000.00"}
        response = client.put(f"/api/v1/crm/kunde/{kunde_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Aktualisierter Test Kunde"
        assert data["kreditlimit"] == "15000.00"

    def test_delete_kunde(self, setup_database, sample_kunde_data):
        """Test customer deletion"""
        # Create customer
        create_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = create_response.json()["id"]
        
        # Delete customer
        response = client.delete(f"/api/v1/crm/kunde/{kunde_id}")
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/v1/crm/kunde/{kunde_id}")
        assert get_response.status_code == 404

    def test_kunde_validation(self, setup_database):
        """Test customer data validation"""
        invalid_data = {
            "kundennummer": "",  # Empty kundennummer
            "name": "Test",
            "typ": "invalid_type",  # Invalid type
            "aktiv": True
        }
        
        response = client.post("/api/v1/crm/kunde/", json=invalid_data)
        assert response.status_code == 422

class TestKontaktAPI:
    """Test cases for Kontakt endpoints"""
    
    def test_create_kontakt_success(self, setup_database, sample_kunde_data, sample_kontakt_data):
        """Test successful contact creation"""
        # Create customer first
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Update kontakt data with correct kunde_id
        kontakt_data = sample_kontakt_data.copy()
        kontakt_data["kunde_id"] = kunde_id
        
        response = client.post("/api/v1/crm/kontakt/", json=kontakt_data)
        assert response.status_code == 201
        data = response.json()
        assert data["vorname"] == "Max"
        assert data["nachname"] == "Mustermann"
        assert data["position"] == "Geschäftsführer"
        assert data["hauptkontakt"] == True

    def test_get_kontakt_list(self, setup_database, sample_kunde_data, sample_kontakt_data):
        """Test contact list retrieval"""
        # Create customer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Create test contacts
        for i in range(3):
            kontakt_data = sample_kontakt_data.copy()
            kontakt_data["kunde_id"] = kunde_id
            kontakt_data["vorname"] = f"Max{i+1}"
            kontakt_data["nachname"] = f"Mustermann{i+1}"
            client.post("/api/v1/crm/kontakt/", json=kontakt_data)
        
        response = client.get("/api/v1/crm/kontakt/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    def test_update_kontakt(self, setup_database, sample_kunde_data, sample_kontakt_data):
        """Test contact update"""
        # Create customer and contact
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        kontakt_data = sample_kontakt_data.copy()
        kontakt_data["kunde_id"] = kunde_id
        
        kontakt_response = client.post("/api/v1/crm/kontakt/", json=kontakt_data)
        kontakt_id = kontakt_response.json()["id"]
        
        # Update contact
        update_data = {"position": "Vertriebsleiter", "hauptkontakt": False}
        response = client.put(f"/api/v1/crm/kontakt/{kontakt_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["position"] == "Vertriebsleiter"
        assert data["hauptkontakt"] == False

class TestAngebotAPI:
    """Test cases for Angebot endpoints"""
    
    def test_create_angebot_success(self, setup_database, sample_kunde_data, sample_angebot_data):
        """Test successful offer creation"""
        # Create customer first
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Update angebot data with correct kunde_id
        angebot_data = sample_angebot_data.copy()
        angebot_data["kunde_id"] = kunde_id
        
        response = client.post("/api/v1/crm/angebot/", json=angebot_data)
        assert response.status_code == 201
        data = response.json()
        assert data["netto_betrag"] == "1000.00"
        assert data["brutto_betrag"] == "1190.00"
        assert data["status"] == "erstellt"
        assert "angebotsnummer" in data

    def test_angebot_status_transitions(self, setup_database, sample_kunde_data, sample_angebot_data):
        """Test offer status transitions"""
        # Create customer and offer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        angebot_data = sample_angebot_data.copy()
        angebot_data["kunde_id"] = kunde_id
        
        create_response = client.post("/api/v1/crm/angebot/", json=angebot_data)
        angebot_id = create_response.json()["id"]
        
        # Update status to sent
        update_data = {"status": AngebotStatus.VERSENDET}
        response = client.put(f"/api/v1/crm/angebot/{angebot_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "versendet"

    def test_get_angebot_list(self, setup_database, sample_kunde_data, sample_angebot_data):
        """Test offer list retrieval"""
        # Create customer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Create test offers
        for i in range(3):
            angebot_data = sample_angebot_data.copy()
            angebot_data["kunde_id"] = kunde_id
            angebot_data["netto_betrag"] = f"{1000 + i * 100}.00"
            angebot_data["brutto_betrag"] = f"{1190 + i * 119}.00"
            client.post("/api/v1/crm/angebot/", json=angebot_data)
        
        response = client.get("/api/v1/crm/angebot/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

class TestAuftragAPI:
    """Test cases for Auftrag endpoints"""
    
    def test_create_auftrag_success(self, setup_database, sample_kunde_data, sample_auftrag_data):
        """Test successful order creation"""
        # Create customer first
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Update auftrag data with correct kunde_id
        auftrag_data = sample_auftrag_data.copy()
        auftrag_data["kunde_id"] = kunde_id
        
        response = client.post("/api/v1/crm/auftrag/", json=auftrag_data)
        assert response.status_code == 201
        data = response.json()
        assert data["netto_betrag"] == "1000.00"
        assert data["brutto_betrag"] == "1190.00"
        assert data["status"] == "erstellt"
        assert "auftragsnummer" in data

    def test_auftrag_status_transitions(self, setup_database, sample_kunde_data, sample_auftrag_data):
        """Test order status transitions"""
        # Create customer and order
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        auftrag_data = sample_auftrag_data.copy()
        auftrag_data["kunde_id"] = kunde_id
        
        create_response = client.post("/api/v1/crm/auftrag/", json=auftrag_data)
        auftrag_id = create_response.json()["id"]
        
        # Update status to confirmed
        update_data = {"status": AuftragStatus.BESTAETIGT}
        response = client.put(f"/api/v1/crm/auftrag/{auftrag_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "bestaetigt"

    def test_auftrag_with_angebot(self, setup_database, sample_kunde_data, sample_angebot_data, sample_auftrag_data):
        """Test order creation with offer reference"""
        # Create customer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Create offer
        angebot_data = sample_angebot_data.copy()
        angebot_data["kunde_id"] = kunde_id
        angebot_response = client.post("/api/v1/crm/angebot/", json=angebot_data)
        angebot_id = angebot_response.json()["id"]
        
        # Create order with offer reference
        auftrag_data = sample_auftrag_data.copy()
        auftrag_data["kunde_id"] = kunde_id
        auftrag_data["angebot_id"] = angebot_id
        
        response = client.post("/api/v1/crm/auftrag/", json=auftrag_data)
        assert response.status_code == 201
        data = response.json()
        assert data["angebot_id"] == angebot_id

class TestVerkaufschanceAPI:
    """Test cases for Verkaufschance endpoints"""
    
    def test_create_verkaufschance_success(self, setup_database, sample_kunde_data, sample_verkaufschance_data):
        """Test successful sales opportunity creation"""
        # Create customer first
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Update verkaufschance data with correct kunde_id
        verkaufschance_data = sample_verkaufschance_data.copy()
        verkaufschance_data["kunde_id"] = kunde_id
        
        response = client.post("/api/v1/crm/verkaufschance/", json=verkaufschance_data)
        assert response.status_code == 201
        data = response.json()
        assert data["bezeichnung"] == "Großauftrag Test Kunde"
        assert data["wahrscheinlichkeit"] == 75
        assert data["erwarteter_wert"] == "50000.00"
        assert data["status"] == "lead"

    def test_verkaufschance_status_transitions(self, setup_database, sample_kunde_data, sample_verkaufschance_data):
        """Test sales opportunity status transitions"""
        # Create customer and opportunity
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        verkaufschance_data = sample_verkaufschance_data.copy()
        verkaufschance_data["kunde_id"] = kunde_id
        
        create_response = client.post("/api/v1/crm/verkaufschance/", json=verkaufschance_data)
        verkaufschance_id = create_response.json()["id"]
        
        # Update status to contacted
        update_data = {"status": VerkaufschanceStatus.KONTAKTIERT}
        response = client.put(f"/api/v1/crm/verkaufschance/{verkaufschance_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "kontaktiert"

    def test_verkaufschance_probability_validation(self, setup_database, sample_kunde_data, sample_verkaufschance_data):
        """Test sales opportunity probability validation"""
        # Create customer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Test invalid probability
        invalid_data = sample_verkaufschance_data.copy()
        invalid_data["kunde_id"] = kunde_id
        invalid_data["wahrscheinlichkeit"] = 150  # Invalid: > 100
        
        response = client.post("/api/v1/crm/verkaufschance/", json=invalid_data)
        assert response.status_code == 422

class TestMarketingKampagneAPI:
    """Test cases for MarketingKampagne endpoints"""
    
    def test_create_marketing_kampagne_success(self, setup_database):
        """Test successful marketing campaign creation"""
        kampagne_data = {
            "name": "Frühjahrs-Kampagne 2024",
            "beschreibung": "Marketing-Kampagne für neue Produkte",
            "startdatum": "2024-03-01",
            "enddatum": "2024-05-31",
            "budget": "25000.00",
            "status": "aktiv",
            "typ": "email",
            "bemerkung": "Test Kampagne"
        }
        
        response = client.post("/api/v1/crm/marketing-kampagne/", json=kampagne_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Frühjahrs-Kampagne 2024"
        assert data["budget"] == "25000.00"
        assert data["status"] == "aktiv"

    def test_get_marketing_kampagne_list(self, setup_database):
        """Test marketing campaign list retrieval"""
        # Create test campaigns
        for i in range(3):
            kampagne_data = {
                "name": f"Test Kampagne {i+1}",
                "beschreibung": f"Beschreibung für Kampagne {i+1}",
                "startdatum": "2024-01-01",
                "enddatum": "2024-12-31",
                "budget": f"{10000 + i * 5000}.00",
                "status": "aktiv",
                "typ": "email"
            }
            client.post("/api/v1/crm/marketing-kampagne/", json=kampagne_data)
        
        response = client.get("/api/v1/crm/marketing-kampagne/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

class TestKundenserviceAPI:
    """Test cases for Kundenservice endpoints"""
    
    def test_create_kundenservice_success(self, setup_database, sample_kunde_data):
        """Test successful customer service ticket creation"""
        # Create customer first
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Create service ticket
        ticket_data = {
            "kunde_id": kunde_id,
            "betreff": "Produktproblem",
            "beschreibung": "Das Produkt funktioniert nicht wie erwartet",
            "status": TicketStatus.OFFEN,
            "prioritaet": TicketPrioritaet.MITTEL,
            "kategorie": "Technischer Support",
            "zugewiesen_an": "Support Team",
            "bemerkung": "Dringend zu bearbeiten"
        }
        
        response = client.post("/api/v1/crm/kundenservice/", json=ticket_data)
        assert response.status_code == 201
        data = response.json()
        assert data["betreff"] == "Produktproblem"
        assert data["status"] == "offen"
        assert data["prioritaet"] == "mittel"
        assert "ticketnummer" in data

    def test_ticket_status_transitions(self, setup_database, sample_kunde_data):
        """Test ticket status transitions"""
        # Create customer and ticket
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        ticket_data = {
            "kunde_id": kunde_id,
            "betreff": "Test Ticket",
            "beschreibung": "Test Beschreibung",
            "status": TicketStatus.OFFEN,
            "prioritaet": TicketPrioritaet.MITTEL,
            "kategorie": "Support"
        }
        
        create_response = client.post("/api/v1/crm/kundenservice/", json=ticket_data)
        ticket_id = create_response.json()["id"]
        
        # Update status to in progress
        update_data = {"status": TicketStatus.IN_BEARBEITUNG}
        response = client.put(f"/api/v1/crm/kundenservice/{ticket_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "in_bearbeitung"

    def test_ticket_priority_validation(self, setup_database, sample_kunde_data):
        """Test ticket priority validation"""
        # Create customer
        kunde_response = client.post("/api/v1/crm/kunde/", json=sample_kunde_data)
        kunde_id = kunde_response.json()["id"]
        
        # Test invalid priority
        invalid_data = {
            "kunde_id": kunde_id,
            "betreff": "Test Ticket",
            "beschreibung": "Test Beschreibung",
            "status": TicketStatus.OFFEN,
            "prioritaet": "invalid_priority",  # Invalid priority
            "kategorie": "Support"
        }
        
        response = client.post("/api/v1/crm/kundenservice/", json=invalid_data)
        assert response.status_code == 422

class TestAPIErrorHandling:
    """Test cases for API error handling"""
    
    def test_404_not_found(self, setup_database):
        """Test 404 error for non-existent resources"""
        response = client.get("/api/v1/crm/kunde/999")
        assert response.status_code == 404
        
        response = client.put("/api/v1/crm/kunde/999", json={})
        assert response.status_code == 404
        
        response = client.delete("/api/v1/crm/kunde/999")
        assert response.status_code == 404

    def test_422_validation_error(self, setup_database):
        """Test 422 error for invalid data"""
        invalid_data = {
            "kundennummer": "",  # Empty required field
            "name": "Test"
        }
        
        response = client.post("/api/v1/crm/kunde/", json=invalid_data)
        assert response.status_code == 422

    def test_400_business_logic_error(self, setup_database):
        """Test 400 error for business logic violations"""
        # Test duplicate creation
        kunde_data = {
            "kundennummer": "DUPLICATE",
            "name": "Test",
            "typ": "geschaeft",
            "aktiv": True
        }
        
        # Create first
        client.post("/api/v1/crm/kunde/", json=kunde_data)
        
        # Try to create duplicate
        response = client.post("/api/v1/crm/kunde/", json=kunde_data)
        assert response.status_code == 400

class TestAPIPagination:
    """Test cases for API pagination"""
    
    def test_pagination_default(self, setup_database, sample_kunde_data):
        """Test default pagination"""
        # Create multiple customers
        for i in range(25):
            kunde_data = sample_kunde_data.copy()
            kunde_data["kundennummer"] = f"K{i:03d}"
            kunde_data["name"] = f"Test Kunde {i} GmbH"
            client.post("/api/v1/crm/kunde/", json=kunde_data)
        
        response = client.get("/api/v1/crm/kunde/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 20  # Default page size
        assert data["total"] == 25
        assert data["page"] == 1

    def test_pagination_with_params(self, setup_database, sample_kunde_data):
        """Test pagination with custom parameters"""
        # Create multiple customers
        for i in range(50):
            kunde_data = sample_kunde_data.copy()
            kunde_data["kundennummer"] = f"K{i:03d}"
            kunde_data["name"] = f"Test Kunde {i} GmbH"
            client.post("/api/v1/crm/kunde/", json=kunde_data)
        
        response = client.get("/api/v1/crm/kunde/?page=2&size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 2
        assert data["size"] == 10
        assert data["total"] == 50

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 