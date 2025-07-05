"""
Tests für die Inventur-API

Diese Tests überprüfen die Funktionalität der Inventur-API.
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os
from pathlib import Path

# Pfade konfigurieren
BASE_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(BASE_DIR))

# Imports für die Tests
from starlette.routing import Route
from starlette.applications import Starlette
from backend.api.inventory_api import (
    get_inventuren, get_inventur_by_id, create_inventur, update_inventur,
    delete_inventur, add_inventur_position, get_inventur_auftraege_fuer_mitarbeiter,
    submit_inventur_ergebnis, create_lookup_maps, inventuren
)

# Test-Fixture für die Starlette-App
@pytest.fixture
def app():
    """
    Erstellt eine Test-App mit den Inventur-Routen.
    """
    # Lookup-Maps erstellen
    create_lookup_maps()
    
    # Test-App erstellen
    routes = [
        Route("/api/v1/inventur", endpoint=get_inventuren),
        Route("/api/v1/inventuren", endpoint=get_inventuren),
        Route("/api/v1/inventur/{inventur_id:int}", endpoint=get_inventur_by_id),
        Route("/api/v1/inventur/create", endpoint=create_inventur, methods=["POST"]),
        Route("/api/v1/inventur/{inventur_id:int}/update", endpoint=update_inventur, methods=["PUT"]),
        Route("/api/v1/inventur/{inventur_id:int}/delete", endpoint=delete_inventur, methods=["DELETE"]),
        Route("/api/v1/inventur/{inventur_id:int}/position/create", endpoint=add_inventur_position, methods=["POST"]),
        Route("/api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id:int}", endpoint=get_inventur_auftraege_fuer_mitarbeiter),
        Route("/api/v1/inventur/{inventur_id:int}/ergebnis", endpoint=submit_inventur_ergebnis, methods=["POST"]),
    ]
    
    return Starlette(routes=routes)

@pytest.fixture
def client(app):
    """
    Erstellt einen TestClient für die App.
    """
    return TestClient(app)

# Tests für die Inventur-API
def test_get_inventuren(client):
    """
    Test für GET /api/v1/inventur.
    """
    response = client.get("/api/v1/inventur")
    assert response.status_code == 200
    assert "inventuren" in response.json()
    assert isinstance(response.json()["inventuren"], list)
    assert len(response.json()["inventuren"]) >= 2  # Mindestens 2 Demo-Inventuren

def test_get_inventur_by_id(client):
    """
    Test für GET /api/v1/inventur/{inventur_id}.
    """
    # Test mit existierender Inventur
    response = client.get("/api/v1/inventur/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
    
    # Test mit nicht existierender Inventur
    response = client.get("/api/v1/inventur/999")
    assert response.status_code == 404
    assert "error" in response.json()

def test_create_inventur(client):
    """
    Test für POST /api/v1/inventur/create.
    """
    # Originale Anzahl der Inventuren
    original_count = len(inventuren)
    
    # Neue Inventur erstellen
    data = {
        "bezeichnung": "Test-Inventur",
        "inventurdatum": "2024-05-01"
    }
    response = client.post("/api/v1/inventur/create", json=data)
    
    # Überprüfungen
    assert response.status_code == 200
    assert response.json()["bezeichnung"] == "Test-Inventur"
    assert "id" in response.json()
    
    # Prüfen, ob die Inventur hinzugefügt wurde
    assert len(inventuren) == original_count + 1
    
    # Test mit fehlenden Pflichtfeldern
    data_incomplete = {
        "bezeichnung": "Unvollständige Inventur"
    }
    response = client.post("/api/v1/inventur/create", json=data_incomplete)
    assert response.status_code == 400
    assert "error" in response.json()

def test_update_inventur(client):
    """
    Test für PUT /api/v1/inventur/{inventur_id}/update.
    """
    # Neue Inventur erstellen
    data = {
        "bezeichnung": "Update-Test-Inventur",
        "inventurdatum": "2024-05-15"
    }
    create_response = client.post("/api/v1/inventur/create", json=data)
    inventur_id = create_response.json()["id"]
    
    # Inventur aktualisieren
    update_data = {
        "bezeichnung": "Aktualisierte Inventur",
        "status": "aktiv"
    }
    update_response = client.put(f"/api/v1/inventur/{inventur_id}/update", json=update_data)
    
    # Überprüfungen
    assert update_response.status_code == 200
    assert update_response.json()["bezeichnung"] == "Aktualisierte Inventur"
    assert update_response.json()["status"] == "aktiv"
    assert update_response.json()["inventurdatum"] == "2024-05-15"  # Unverändert
    
    # Test mit nicht existierender Inventur
    response = client.put("/api/v1/inventur/999/update", json=update_data)
    assert response.status_code == 404
    assert "error" in response.json()

def test_delete_inventur(client):
    """
    Test für DELETE /api/v1/inventur/{inventur_id}/delete.
    """
    # Neue Inventur erstellen
    data = {
        "bezeichnung": "Zu löschende Inventur",
        "inventurdatum": "2024-05-20"
    }
    create_response = client.post("/api/v1/inventur/create", json=data)
    inventur_id = create_response.json()["id"]
    
    # Originale Anzahl der Inventuren
    original_count = len(inventuren)
    
    # Inventur löschen
    delete_response = client.delete(f"/api/v1/inventur/{inventur_id}/delete")
    
    # Überprüfungen
    assert delete_response.status_code == 200
    assert "message" in delete_response.json()
    assert len(inventuren) == original_count - 1
    
    # Test mit nicht existierender Inventur
    response = client.delete(f"/api/v1/inventur/{inventur_id}/delete")
    assert response.status_code == 404
    assert "error" in response.json()

def test_add_inventur_position(client):
    """
    Test für POST /api/v1/inventur/{inventur_id}/position/create.
    """
    # Bestehende Inventur verwenden
    inventur_id = 1
    
    # Position hinzufügen
    position_data = {
        "artikel_id": 101,
        "lager_id": 1,
        "bestandsmenge": 100.0
    }
    response = client.post(f"/api/v1/inventur/{inventur_id}/position/create", json=position_data)
    
    # Überprüfungen
    assert response.status_code == 200
    assert response.json()["artikel_id"] == 101
    assert response.json()["bestandsmenge"] == 100.0
    assert "id" in response.json()
    
    # Test mit fehlenden Pflichtfeldern
    incomplete_data = {
        "artikel_id": 102
    }
    response = client.post(f"/api/v1/inventur/{inventur_id}/position/create", json=incomplete_data)
    assert response.status_code == 400
    assert "error" in response.json()
    
    # Test mit nicht existierender Inventur
    response = client.post("/api/v1/inventur/999/position/create", json=position_data)
    assert response.status_code == 404
    assert "error" in response.json()

# Weitere Tests könnten hier hinzugefügt werden, z.B. für:
# - get_inventur_auftraege_fuer_mitarbeiter
# - submit_inventur_ergebnis
# - Integrationstests für vollständige Workflows 