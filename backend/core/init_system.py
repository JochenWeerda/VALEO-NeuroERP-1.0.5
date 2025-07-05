import os
import logging
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Datenbank-URL aus Umgebungsvariablen holen
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/erp")

# Logging konfigurieren
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

# SQLAlchemy-Konfiguration
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def initialize_system():
    """
    Initialisiert das ERP-System, erstellt die Datenbanktabellen und grundlegende Einstellungen.
    """
    logger.info("Initialisiere das ERP-System...")
    
    # Verbindung zur Datenbank prüfen
    try:
        connection = engine.connect()
        connection.close()
        logger.info("Datenbankverbindung erfolgreich hergestellt.")
    except Exception as e:
        logger.error(f"Fehler bei der Datenbankverbindung: {e}")
        raise
    
    # Datenbanktabellen erstellen
    try:
        from backend.models.base import Base
        from backend.models.user import User, UserRole
        from backend.models.tenant import Tenant
        from backend.models.settings import SystemSettings
        
        # Überprüfen, ob die Tabellen bereits existieren
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if "users" not in existing_tables or "tenants" not in existing_tables:
            logger.info("Erstelle Datenbanktabellen...")
            Base.metadata.create_all(bind=engine)
            logger.info("Datenbanktabellen erfolgreich erstellt.")
        else:
            logger.info("Datenbanktabellen existieren bereits.")
        
        # Systemeinstellungen initialisieren
        db = SessionLocal()
        try:
            # Prüfen, ob Systemeinstellungen bereits existieren
            settings = db.query(SystemSettings).first()
            if not settings:
                logger.info("Erstelle Systemeinstellungen...")
                settings = SystemSettings(
                    system_name="AI-getriebenes ERP-System",
                    version="1.0.0",
                    is_initialized=True,
                    multi_tenant_enabled=os.environ.get("FEATURE_MULTI_TENANT", "true").lower() == "true",
                    roles_enabled=os.environ.get("FEATURE_ROLES_ENABLED", "true").lower() == "true"
                )
                db.add(settings)
                db.commit()
                logger.info("Systemeinstellungen erfolgreich erstellt.")
            else:
                logger.info("Systemeinstellungen existieren bereits.")
        except Exception as e:
            db.rollback()
            logger.error(f"Fehler beim Initialisieren der Systemeinstellungen: {e}")
            raise
        finally:
            db.close()
        
        logger.info("System-Initialisierung abgeschlossen!")
        return True
        
    except Exception as e:
        logger.error(f"Fehler bei der System-Initialisierung: {e}")
        raise

if __name__ == "__main__":
    initialize_system() 