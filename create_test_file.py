import os

# Zuerst die alte Datei löschen, falls sie existiert
if os.path.exists('tests/test_transaction_service.py'):
    os.remove('tests/test_transaction_service.py')

# Datei neu erstellen
with open('tests/test_transaction_service.py', 'wb') as f:
    f.write(b'''# Test file

"""
Unit-Tests fuer den optimierten Transaktionsservice
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from backend.services.transaction_service import TransactionService
from backend.models.transaction import Transaction
from backend.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionBulkCreate
)
import asyncio

# Test-Datenbank URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def async_engine():
    """Erstellt Test-Datenbankengine"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    yield engine
    await engine.dispose()

@pytest.fixture
async def async_session(async_engine):
    """Erstellt Test-Datenbanksession"""
    async_session = sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    async with async_session() as session:
        yield session

@pytest.fixture
async def transaction_service(async_session):
    """Erstellt Test-Transaktionsservice"""
    service = TransactionService(db=async_session)
    await service.start()
    yield service
    await service.stop()

@pytest.mark.asyncio
async def test_create_single_transaction(transaction_service):
    """Test: Einzelne Transaktion erstellen"""
    # Ein einzelnes Test-Item erstellen
    transaction = TransactionCreate(
        amount=100.0,
        currency="EUR",
        status="pending",
        created_at=datetime.now(),
        transaction_type="purchase",
        description="Test transaction"
    )
    
    # Item senden und Ergebnis pruefen
    result = await transaction_service.create_transaction(transaction)
    
    # Ueberpruefen der Rueckgabewerte
    assert result.amount == 100.0
    assert result.currency == "EUR"
    assert result.status == "pending"
    assert result.transaction_type == "purchase"
    assert result.description == "Test transaction"
''') 