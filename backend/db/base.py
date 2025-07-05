"""
Basismodule für die Datenbankverbindung im ERP-System.

Dieses Modul definiert die grundlegenden Datenbankklassen und -verbindungen,
die im gesamten System verwendet werden.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Datenbank-URL aus Umgebungsvariable oder Standard-SQLite-Datenbank
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./erp_system.db")

# SQLAlchemy-Engine erstellen
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False  # Bei True werden SQL-Statements geloggt
)

# Session-Factory erstellen
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Basisklasse für alle Datenbankmodelle
Base = declarative_base()

def get_db() -> Session:
    """
    Gibt eine Datenbankverbindung aus dem Sessionpool zurück.
    
    Die Verbindung wird nach der Verwendung automatisch geschlossen.
    Diese Funktion ist für FastAPI-Dependency-Injection gedacht.
    
    Yields:
        Session: SQLAlchemy-Session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 