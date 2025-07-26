#!/usr/bin/env python3
"""
Test-Benutzer erstellen für VALEO NeuroERP
"""

import os
import sys
import uuid
from datetime import datetime
from passlib.context import CryptContext

# Pfad hinzufügen
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Passwort hashen"""
    return pwd_context.hash(password)

def create_test_user():
    """Test-Benutzer erstellen"""
    
    # Test-Benutzer Daten
    test_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@valeoflow.de",
        "full_name": "VALEO Administrator",
        "hashed_password": get_password_hash("admin123"),
        "role": "admin",
        "disabled": False,
        "created_at": datetime.utcnow()
    }
    
    print("Test-Benutzer erstellt:")
    print(f"Username: {test_user['username']}")
    print(f"Password: admin123")
    print(f"Role: {test_user['role']}")
    print(f"Email: {test_user['email']}")
    
    return test_user

if __name__ == "__main__":
    create_test_user() 