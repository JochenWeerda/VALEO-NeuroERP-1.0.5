"""
Datenbankverbindung und -konfiguration für das ERP-System.
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

# Datenbankverbindung konfigurieren
# Für die Entwicklung verwenden wir SQLite, für Produktion könnte PostgreSQL verwendet werden
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./erp_system.db")

# Engine erstellen
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Sessionmaker konfigurieren
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Metadata mit extend_existing=True konfigurieren
metadata = MetaData()

# Base-Klasse für die Models
Base = declarative_base(metadata=metadata)

# Hilfsfunktion, um Datenbankverbindung für FastAPI-Dependency-Injection bereitzustellen
def get_db() -> Generator:
    """
    Erstellt eine Datenbankverbindung und gibt sie als Generator zurück.
    Wird für FastAPI Dependency Injection verwendet.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 