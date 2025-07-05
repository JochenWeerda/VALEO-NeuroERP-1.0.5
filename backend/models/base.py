import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Datenbank-URL aus Umgebungsvariablen holen
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/erp")

# SQLAlchemy-Konfiguration
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Hilfsfunktion, um eine Datenbankverbindung zu erhalten
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 