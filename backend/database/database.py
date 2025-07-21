"""
Database-Konfiguration für VALEO NeuroERP
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL aus Environment oder Default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./valeo_neuroerp.db")

# Engine erstellen
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base für Models
Base = declarative_base()

def get_db():
    """Database Session Dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Erstelle alle Tabellen"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Lösche alle Tabellen"""
    Base.metadata.drop_all(bind=engine) 