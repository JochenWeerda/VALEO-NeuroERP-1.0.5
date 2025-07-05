"""
Initialisiert die Datenbank mit den Grundtabellen und Basisdaten.
"""

import os
import sys
from pathlib import Path
import bcrypt

# Füge das Backend-Verzeichnis zum Python-Pfad hinzu
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from db.database import Base, engine, SessionLocal
from models import *

def init_db():
    """Initialisiert die Datenbank mit allen definierten Modellen."""
    print("Initialisiere Datenbank...")
    
    # Erstelle alle Tabellen
    Base.metadata.create_all(bind=engine)
    print("Datenbank-Tabellen wurden erstellt.")

    # Erstelle einen Admin-Benutzer, wenn noch keiner existiert
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_role = Role(name="admin", description="Administrator")
            db.add(admin_role)
            
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=bcrypt.hashpw("admin".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                is_admin=True,
                is_active=True,
                full_name="Administrator"
            )
            admin.roles.append(admin_role)
            db.add(admin)
            db.commit()
            print("Admin-Benutzer wurde erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen des Admin-Benutzers: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 