"""
Tests für Datenpersistierung in VALEO NeuroERP 2.0
Testet die vollständige Datenbank-Integration
"""

import pytest
import asyncio
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from fastapi.testclient import TestClient

from backend.app.database.base import Base
from backend.app.models import Customer, Article, Invoice, Order
from backend.app.services.database_service import DatabaseService, NotFoundError
from backend.app.api.real_endpoints import router
from backend.app.main import app

# Test-Datenbank URL
TEST_DATABASE_URL = "sqlite:///./test.db"
ASYNC_TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Test-Client
client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    """Erstellt eine Test-Datenbank-Session"""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    yield session
    
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
async def async_db_session():
    """Erstellt eine asynchrone Test-Datenbank-Session"""
    engine = create_async_engine(ASYNC_TEST_DATABASE_URL)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session
    
    await engine.dispose()

class TestCustomerPersistence:
    """Tests für Kunden-Datenpersistierung"""
    
    def test_create_customer(self, db_session: Session):
        """Test: Kunde erstellen und speichern"""
        service = DatabaseService(Customer)
        
        customer_data = {
            "customer_number": "K-2024-001",
            "name": "Test GmbH",
            "address": "Teststraße 123",
            "city": "Berlin",
            "postal_code": "10115",
            "email": "test@example.com",
            "phone": "+49 30 12345678",
            "credit_limit": Decimal("10000.00")
        }
        
        # Kunde erstellen
        customer = service.create(db_session, **customer_data)
        
        # Assertions
        assert customer.id is not None
        assert customer.customer_number == "K-2024-001"
        assert customer.name == "Test GmbH"
        assert customer.credit_limit == Decimal("10000.00")
        assert customer.active is True
        assert customer.created_at is not None
    
    def test_update_customer(self, db_session: Session):
        """Test: Kunde aktualisieren"""
        service = DatabaseService(Customer)
        
        # Kunde erstellen
        customer = service.create(
            db_session,
            customer_number="K-2024-002",
            name="Update Test GmbH",
            address="Alte Straße 1",
            city="Hamburg",
            postal_code="20095"
        )
        
        # Kunde aktualisieren
        updated = service.update(
            db_session,
            customer.id,
            address="Neue Straße 2",
            credit_limit=Decimal("20000.00")
        )
        
        # Assertions
        assert updated.address == "Neue Straße 2"
        assert updated.credit_limit == Decimal("20000.00")
        assert updated.name == "Update Test GmbH"  # Unverändert
        assert updated.updated_at > customer.created_at
    
    def test_soft_delete_customer(self, db_session: Session):
        """Test: Kunde soft-delete"""
        service = DatabaseService(Customer)
        
        # Kunde erstellen
        customer = service.create(
            db_session,
            customer_number="K-2024-003",
            name="Delete Test GmbH",
            address="Löschstraße 1",
            city="München",
            postal_code="80331"
        )
        
        # Soft Delete
        result = service.delete(db_session, customer.id)
        
        # Assertions
        assert result is True
        
        # Kunde sollte noch existieren aber deleted_at gesetzt
        deleted_customer = db_session.query(Customer).filter(
            Customer.id == customer.id
        ).first()
        
        assert deleted_customer is not None
        assert deleted_customer.deleted_at is not None
    
    def test_search_customers(self, db_session: Session):
        """Test: Kunden-Suche"""
        service = DatabaseService(Customer)
        
        # Mehrere Kunden erstellen
        customers = [
            {"customer_number": "K-2024-004", "name": "Müller GmbH", "city": "Berlin", "postal_code": "10115", "address": "Str. 1"},
            {"customer_number": "K-2024-005", "name": "Schmidt AG", "city": "Hamburg", "postal_code": "20095", "address": "Str. 2"},
            {"customer_number": "K-2024-006", "name": "Meyer & Co", "city": "Berlin", "postal_code": "10117", "address": "Str. 3"},
        ]
        
        for data in customers:
            service.create(db_session, **data)
        
        # Suche nach Stadt
        berlin_customers = service.get_multi(
            db_session,
            filters={"city": "Berlin"}
        )
        assert len(berlin_customers) == 2
        
        # Textsuche
        search_results = service.search(
            db_session,
            search_term="Schmidt",
            search_fields=["name", "customer_number"]
        )
        assert len(search_results) == 1
        assert search_results[0].name == "Schmidt AG"

class TestArticlePersistence:
    """Tests für Artikel-Datenpersistierung"""
    
    def test_create_article_with_stock(self, db_session: Session):
        """Test: Artikel mit Lagerbestand erstellen"""
        service = DatabaseService(Article)
        
        article_data = {
            "article_number": "ART-001",
            "description": "Test Artikel",
            "unit": "Stück",
            "price": Decimal("99.99"),
            "stock": Decimal("100"),
            "min_stock": Decimal("10"),
            "category": "Elektronik",
            "ean": "1234567890123"
        }
        
        article = service.create(db_session, **article_data)
        
        assert article.id is not None
        assert article.stock == Decimal("100")
        assert article.price == Decimal("99.99")
        assert article.tax_rate == Decimal("19.00")  # Default
    
    def test_stock_validation(self, db_session: Session):
        """Test: Lagerbestands-Validierung"""
        service = DatabaseService(Article)
        
        # Artikel mit niedrigem Bestand
        article = service.create(
            db_session,
            article_number="ART-002",
            description="Low Stock Artikel",
            unit="Stück",
            price=Decimal("50.00"),
            stock=Decimal("5"),
            min_stock=Decimal("10")
        )
        
        # Bestand ist unter Mindestbestand
        assert article.stock < article.min_stock
        
        # Bestand auf 0 setzen
        updated = service.update(db_session, article.id, stock=Decimal("0"))
        assert updated.stock == Decimal("0")
    
    def test_article_categories(self, db_session: Session):
        """Test: Artikel-Kategorien"""
        service = DatabaseService(Article)
        
        categories = ["Elektronik", "Bürobedarf", "Elektronik", "Werkzeug"]
        
        for i, cat in enumerate(categories):
            service.create(
                db_session,
                article_number=f"ART-CAT-{i:03d}",
                description=f"Artikel in {cat}",
                unit="Stück",
                price=Decimal("10.00"),
                category=cat
            )
        
        # Artikel nach Kategorie filtern
        electronics = service.get_multi(
            db_session,
            filters={"category": "Elektronik"}
        )
        assert len(electronics) == 2

class TestInvoicePersistence:
    """Tests für Rechnungs-Datenpersistierung"""
    
    def test_create_invoice_with_positions(self, db_session: Session):
        """Test: Rechnung mit Positionen erstellen"""
        # Services
        customer_service = DatabaseService(Customer)
        article_service = DatabaseService(Article)
        invoice_service = DatabaseService(Invoice)
        
        # Kunde erstellen
        customer = customer_service.create(
            db_session,
            customer_number="K-INV-001",
            name="Rechnungstest GmbH",
            address="Rechnungsstraße 1",
            city="Frankfurt",
            postal_code="60311"
        )
        
        # Artikel erstellen
        articles = []
        for i in range(3):
            article = article_service.create(
                db_session,
                article_number=f"ART-INV-{i:03d}",
                description=f"Test Artikel {i+1}",
                unit="Stück",
                price=Decimal(f"{(i+1)*10}.00"),
                stock=Decimal("100")
            )
            articles.append(article)
        
        # Rechnung erstellen
        invoice = invoice_service.create(
            db_session,
            invoice_number="RE-2024-00001",
            customer_id=customer.id,
            invoice_date=date.today(),
            due_date=date.today() + timedelta(days=14),
            status="draft"
        )
        
        # Positionen hinzufügen (normalerweise über separate API)
        # Hier direkt für Test
        from backend.app.models import InvoicePosition
        
        total = Decimal("0")
        for i, article in enumerate(articles):
            quantity = i + 1
            pos = InvoicePosition(
                invoice_id=invoice.id,
                position_number=i + 1,
                article_id=article.id,
                description=article.description,
                quantity=Decimal(str(quantity)),
                unit=article.unit,
                price=article.price,
                tax_rate=Decimal("19.00"),
                net_amount=article.price * quantity,
                tax_amount=(article.price * quantity) * Decimal("0.19"),
                total_amount=(article.price * quantity) * Decimal("1.19")
            )
            db_session.add(pos)
            total += pos.total_amount
        
        db_session.commit()
        db_session.refresh(invoice)
        
        # Assertions
        assert invoice.id is not None
        assert invoice.customer_id == customer.id
        assert len(db_session.query(InvoicePosition).filter(
            InvoicePosition.invoice_id == invoice.id
        ).all()) == 3
    
    def test_invoice_status_transitions(self, db_session: Session):
        """Test: Rechnungsstatus-Übergänge"""
        # Setup
        customer_service = DatabaseService(Customer)
        invoice_service = DatabaseService(Invoice)
        
        customer = customer_service.create(
            db_session,
            customer_number="K-STATUS-001",
            name="Status Test GmbH",
            address="Statusstraße 1",
            city="Köln",
            postal_code="50667"
        )
        
        invoice = invoice_service.create(
            db_session,
            invoice_number="RE-2024-00002",
            customer_id=customer.id,
            invoice_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            status="draft",
            total_amount=Decimal("1000.00")
        )
        
        # Status-Übergänge
        # Draft -> Sent
        sent_invoice = invoice_service.update(
            db_session,
            invoice.id,
            status="sent"
        )
        assert sent_invoice.status == "sent"
        
        # Sent -> Paid
        paid_invoice = invoice_service.update(
            db_session,
            invoice.id,
            status="paid",
            paid_amount=Decimal("1000.00"),
            paid_at=datetime.utcnow()
        )
        assert paid_invoice.status == "paid"
        assert paid_invoice.paid_amount == Decimal("1000.00")
        assert paid_invoice.paid_at is not None

class TestTransactionIntegrity:
    """Tests für Transaktions-Integrität"""
    
    def test_invoice_rollback_on_error(self, db_session: Session):
        """Test: Rollback bei Fehler während Rechnungserstellung"""
        from backend.app.services.database_service import TransactionService
        
        customer_service = DatabaseService(Customer)
        
        # Kunde erstellen
        customer = customer_service.create(
            db_session,
            customer_number="K-TRANS-001",
            name="Transaction Test GmbH",
            address="Transaktionsstraße 1",
            city="Stuttgart",
            postal_code="70173"
        )
        
        initial_count = db_session.query(Invoice).count()
        
        try:
            with TransactionService.transaction(db_session) as trans:
                # Rechnung erstellen
                invoice = Invoice(
                    invoice_number="RE-2024-ERROR",
                    customer_id=customer.id,
                    invoice_date=date.today(),
                    due_date=date.today() + timedelta(days=14)
                )
                trans.add(invoice)
                trans.flush()
                
                # Fehler provozieren
                raise ValueError("Simulated error")
                
        except ValueError:
            pass
        
        # Keine neue Rechnung sollte existieren
        final_count = db_session.query(Invoice).count()
        assert final_count == initial_count
    
    def test_concurrent_stock_update(self, db_session: Session):
        """Test: Gleichzeitige Lagerbestands-Updates"""
        service = DatabaseService(Article)
        
        # Artikel mit Bestand erstellen
        article = service.create(
            db_session,
            article_number="ART-CONC-001",
            description="Concurrent Test Artikel",
            unit="Stück",
            price=Decimal("25.00"),
            stock=Decimal("50")
        )
        
        # Simuliere zwei gleichzeitige Bestandsänderungen
        # In echter Anwendung würden diese in separaten Transaktionen laufen
        
        # Transaktion 1: Verkauf von 10 Stück
        updated1 = service.update(
            db_session,
            article.id,
            stock=article.stock - Decimal("10")
        )
        
        # Transaktion 2: Wareneingang von 20 Stück
        # Muss aktuellen Bestand neu lesen
        current = service.get(db_session, article.id)
        updated2 = service.update(
            db_session,
            article.id,
            stock=current.stock + Decimal("20")
        )
        
        # Finaler Bestand sollte 60 sein (50 - 10 + 20)
        assert updated2.stock == Decimal("60")

class TestAPIIntegration:
    """Tests für API-Integration mit Datenbank"""
    
    def test_api_create_customer(self):
        """Test: Kunde über API erstellen"""
        customer_data = {
            "customer_number": "K-API-001",
            "name": "API Test GmbH",
            "address": "API Straße 1",
            "city": "Düsseldorf",
            "postal_code": "40210",
            "email": "api@test.com",
            "credit_limit": 5000.00
        }
        
        response = client.post("/api/v2/customers", json=customer_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["customer_number"] == "K-API-001"
        assert data["id"] is not None
    
    def test_api_search_articles(self):
        """Test: Artikel über API suchen"""
        # Erst einige Artikel erstellen
        articles = [
            {
                "article_number": "SEARCH-001",
                "description": "Laptop Professional",
                "unit": "Stück",
                "price": 999.99,
                "category": "Computer"
            },
            {
                "article_number": "SEARCH-002",
                "description": "Mouse Wireless",
                "unit": "Stück",
                "price": 29.99,
                "category": "Zubehör"
            }
        ]
        
        for article in articles:
            client.post("/api/v2/articles", json=article)
        
        # Suche nach "laptop"
        response = client.get("/api/v2/articles?search=laptop")
        assert response.status_code == 200
        
        results = response.json()
        assert len(results) >= 1
        assert any("Laptop" in r["description"] for r in results)
    
    def test_api_invoice_workflow(self):
        """Test: Kompletter Rechnungs-Workflow über API"""
        # 1. Kunde anlegen
        customer_resp = client.post("/api/v2/customers", json={
            "customer_number": "K-WORKFLOW-001",
            "name": "Workflow Test GmbH",
            "address": "Workflowstraße 1",
            "city": "Essen",
            "postal_code": "45127"
        })
        customer_id = customer_resp.json()["id"]
        
        # 2. Artikel anlegen
        article_resp = client.post("/api/v2/articles", json={
            "article_number": "ART-WORKFLOW-001",
            "description": "Workflow Test Artikel",
            "unit": "Stück",
            "price": 100.00,
            "stock": 50
        })
        article_id = article_resp.json()["id"]
        
        # 3. Rechnung erstellen
        invoice_data = {
            "customer_id": customer_id,
            "positions": [
                {
                    "article_id": article_id,
                    "quantity": 5,
                    "price": 100.00
                }
            ]
        }
        
        invoice_resp = client.post("/api/v2/invoices", json=invoice_data)
        assert invoice_resp.status_code == 200
        
        invoice = invoice_resp.json()
        assert invoice["total_amount"] == 595.00  # 5 * 100 * 1.19 (inkl. MwSt)
        assert invoice["status"] == "draft"

class TestDataValidation:
    """Tests für Datenvalidierung"""
    
    def test_customer_validation(self):
        """Test: Kunden-Validierung"""
        # Ungültige PLZ
        invalid_customer = {
            "customer_number": "K-INVALID-001",
            "name": "Invalid Test GmbH",
            "address": "Teststraße 1",
            "city": "Berlin",
            "postal_code": "123",  # Zu kurz
            "email": "invalid-email"  # Ungültige Email
        }
        
        response = client.post("/api/v2/customers", json=invalid_customer)
        assert response.status_code == 400
        
        errors = response.json()["detail"]["errors"]
        assert "postal_code" in errors
        assert "email" in errors
    
    def test_invoice_position_validation(self):
        """Test: Rechnungspositions-Validierung"""
        # Setup: Kunde erstellen
        customer_resp = client.post("/api/v2/customers", json={
            "customer_number": "K-VAL-001",
            "name": "Validation Test GmbH",
            "address": "Validierungsstraße 1",
            "city": "Leipzig",
            "postal_code": "04109"
        })
        customer_id = customer_resp.json()["id"]
        
        # Rechnung ohne Positionen
        invalid_invoice = {
            "customer_id": customer_id,
            "positions": []  # Leer!
        }
        
        response = client.post("/api/v2/invoices", json=invalid_invoice)
        assert response.status_code == 400
        
        errors = response.json()["detail"]["errors"]
        assert "positions" in errors

if __name__ == "__main__":
    pytest.main([__file__, "-v"])