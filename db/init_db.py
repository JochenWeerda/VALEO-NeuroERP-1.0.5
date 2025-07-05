"""
Datenbankinitialierung für das AI-gestützte ERP-System.

Dieses Skript erstellt die Datenbank und alle Tabellen.
"""

import os
import sys
import logging

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Direkter Import der Datenbankkomponenten
logger.info("Importiere Datenbankkomponenten...")
from base import Base, engine

def init_db():
    """Initialisiert die Datenbank und erstellt alle Tabellen."""
    try:
        logger.info("Erstelle Datenbank und Tabellen...")
        Base.metadata.create_all(bind=engine)
        logger.info("Datenbank erfolgreich initialisiert!")
    except Exception as e:
        logger.error(f"Fehler beim Initialisieren der Datenbank: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_db() 