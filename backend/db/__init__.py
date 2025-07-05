"""
Datenbank-Module für das AI-gestützte ERP-System.

Dieses Paket enthält die Datenbankverbindung und Hilfsfunktionen.
"""

# Exportiere die wichtigen Funktionen und Klassen
from .base import Base, engine, SessionLocal, get_db

__all__ = [
    'Base',
    'engine',
    'SessionLocal',
    'get_db'
]