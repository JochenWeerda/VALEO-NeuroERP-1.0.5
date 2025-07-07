import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings
from core.models.transaction import TransactionDB
from core.db.postgresql import Base
from datetime import datetime

# Test PostgreSQL
def test_postgresql_connection():
    """PostgreSQL-Verbindung testen"""
    try:
        # Create database URL
        db_url = (
            f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
            f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
        )
        
        # Create engine
        engine = create_engine(db_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute("SELECT 1").scalar()
            assert result == 1
            
    except Exception as e:
        pytest.fail(f"PostgreSQL-Verbindung fehlgeschlagen: {str(e)}")

def test_transaction_crud():
    """CRUD-Operationen für Transaktionen testen"""
    # Create database URL
    db_url = (
        f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
        f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    )
    
    # Create engine and session
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Create
        transaction = TransactionDB(
            user_id="test_user",
            amount=100.0,
            description="Test Transaction",
            transaction_type="DEBIT",
            status="COMPLETED",
            created_at=datetime.utcnow()
        )
        session.add(transaction)
        session.commit()
        
        # Read
        saved_transaction = session.query(TransactionDB).filter_by(id=transaction.id).first()
        assert saved_transaction is not None
        assert saved_transaction.amount == 100.0
        
        # Update
        saved_transaction.amount = 200.0
        session.commit()
        updated_transaction = session.query(TransactionDB).filter_by(id=transaction.id).first()
        assert updated_transaction.amount == 200.0
        
        # Delete
        session.delete(saved_transaction)
        session.commit()
        deleted_transaction = session.query(TransactionDB).filter_by(id=transaction.id).first()
        assert deleted_transaction is None
        
    finally:
        session.close()

# Test MongoDB
@pytest.mark.asyncio
async def test_mongodb_connection():
    """MongoDB-Verbindung testen"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DATABASE]
        
        # Test connection
        result = await db.command("ping")
        assert result["ok"] == 1.0
        
    except Exception as e:
        pytest.fail(f"MongoDB-Verbindung fehlgeschlagen: {str(e)}")

@pytest.mark.asyncio
async def test_mongodb_crud():
    """CRUD-Operationen für MongoDB testen"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DATABASE]
        collection = db.test_collection
        
        # Create
        test_doc = {"test_field": "test_value"}
        result = await collection.insert_one(test_doc)
        assert result.inserted_id is not None
        
        # Read
        saved_doc = await collection.find_one({"_id": result.inserted_id})
        assert saved_doc is not None
        assert saved_doc["test_field"] == "test_value"
        
        # Update
        update_result = await collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"test_field": "updated_value"}}
        )
        assert update_result.modified_count == 1
        
        updated_doc = await collection.find_one({"_id": result.inserted_id})
        assert updated_doc["test_field"] == "updated_value"
        
        # Delete
        delete_result = await collection.delete_one({"_id": result.inserted_id})
        assert delete_result.deleted_count == 1
        
        deleted_doc = await collection.find_one({"_id": result.inserted_id})
        assert deleted_doc is None
        
    finally:
        # Cleanup
        await collection.drop()

if __name__ == "__main__":
    pytest.main([__file__]) 