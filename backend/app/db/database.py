from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base

# SQLite-Datenbank (erp.db) verwenden
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Nur für SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 