"""
Tests für die Artikel-Stammdaten-API.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.artikel import Artikel
from app.models.artikel_stammdaten import ArtikelStammdaten

client = TestClient(app)

def test_create_stammdaten(db: Session):
    """Test: Erstellen eines Artikel-Stammdatensatzes"""
    # Testdaten für einen Artikel erstellen
    test_artikel = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel)
    db.commit()
    db.refresh(test_artikel)
    
    # Stammdaten erstellen
    response = client.post(
        "/api/v1/artikel-stammdaten/",
        json={
            "artikel_id": test_artikel.id,
            "kurztext": "Test Kurztext",
            "artikel_art": "Test",
            "artikel_gruppe": "Testwaren",
            "mengen_einheit": "Stk",
            "druck_beschreibung": {
                "aufAnfrageBestell": True,
                "aufAngebot": True,
                "aufLieferschein": False
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["artikel_id"] == test_artikel.id
    assert data["kurztext"] == "Test Kurztext"
    assert data["artikel_art"] == "Test"
    assert data["artikel_gruppe"] == "Testwaren"
    assert data["druck_beschreibung"]["aufAnfrageBestell"] == True
    assert data["druck_beschreibung"]["aufAngebot"] == True
    assert data["druck_beschreibung"]["aufLieferschein"] == False
    
    # Aufräumen
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.artikel_id == test_artikel.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel.id).delete()
    db.commit()

def test_get_stammdaten_list(db: Session):
    """Test: Abrufen einer Liste von Artikel-Stammdatensätzen"""
    # Testdaten für zwei Artikel erstellen
    test_artikel1 = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel 1",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    test_artikel2 = Artikel(
        artikelNr="TEST-002",
        bezeichnung="Test Artikel 2",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel1)
    db.add(test_artikel2)
    db.commit()
    db.refresh(test_artikel1)
    db.refresh(test_artikel2)
    
    # Stammdaten für beide Artikel erstellen
    stammdaten1 = ArtikelStammdaten(
        artikel_id=test_artikel1.id,
        kurztext="Test Kurztext 1",
        artikel_art="Test",
        artikel_gruppe="Testwaren A",
        mengen_einheit="Stk"
    )
    stammdaten2 = ArtikelStammdaten(
        artikel_id=test_artikel2.id,
        kurztext="Test Kurztext 2",
        artikel_art="Test",
        artikel_gruppe="Testwaren B",
        mengen_einheit="Stk"
    )
    db.add(stammdaten1)
    db.add(stammdaten2)
    db.commit()
    
    # Alle Stammdaten abrufen
    response = client.get("/api/v1/artikel-stammdaten/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # Mindestens unsere 2 Testdatensätze
    
    # Nach Gruppe filtern
    response = client.get("/api/v1/artikel-stammdaten/?artikel_gruppe=Testwaren%20A")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(item["artikel_gruppe"] == "Testwaren A" for item in data)
    
    # Aufräumen
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.artikel_id == test_artikel1.id).delete()
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.artikel_id == test_artikel2.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel1.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel2.id).delete()
    db.commit()

def test_get_stammdaten_by_id(db: Session):
    """Test: Abrufen eines Artikel-Stammdatensatzes anhand seiner ID"""
    # Testdaten für einen Artikel erstellen
    test_artikel = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel)
    db.commit()
    db.refresh(test_artikel)
    
    # Stammdaten erstellen
    stammdaten = ArtikelStammdaten(
        artikel_id=test_artikel.id,
        kurztext="Test Kurztext",
        artikel_art="Test",
        artikel_gruppe="Testwaren",
        mengen_einheit="Stk"
    )
    db.add(stammdaten)
    db.commit()
    db.refresh(stammdaten)
    
    # Stammdaten abrufen
    response = client.get(f"/api/v1/artikel-stammdaten/{stammdaten.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == stammdaten.id
    assert data["artikel_id"] == test_artikel.id
    assert data["kurztext"] == "Test Kurztext"
    
    # Aufräumen
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel.id).delete()
    db.commit()

def test_update_stammdaten(db: Session):
    """Test: Aktualisieren eines Artikel-Stammdatensatzes"""
    # Testdaten für einen Artikel erstellen
    test_artikel = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel)
    db.commit()
    db.refresh(test_artikel)
    
    # Stammdaten erstellen
    stammdaten = ArtikelStammdaten(
        artikel_id=test_artikel.id,
        kurztext="Test Kurztext",
        artikel_art="Test",
        artikel_gruppe="Testwaren",
        mengen_einheit="Stk"
    )
    db.add(stammdaten)
    db.commit()
    db.refresh(stammdaten)
    
    # Stammdaten aktualisieren
    response = client.put(
        f"/api/v1/artikel-stammdaten/{stammdaten.id}",
        json={
            "kurztext": "Aktualisierter Kurztext",
            "druck_beschreibung": {
                "aufAnfrageBestell": True,
                "aufAngebot": False
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["kurztext"] == "Aktualisierter Kurztext"
    assert data["druck_beschreibung"]["aufAnfrageBestell"] == True
    assert data["druck_beschreibung"]["aufAngebot"] == False
    
    # Aufräumen
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel.id).delete()
    db.commit()

def test_delete_stammdaten(db: Session):
    """Test: Löschen eines Artikel-Stammdatensatzes"""
    # Testdaten für einen Artikel erstellen
    test_artikel = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel)
    db.commit()
    db.refresh(test_artikel)
    
    # Stammdaten erstellen
    stammdaten = ArtikelStammdaten(
        artikel_id=test_artikel.id,
        kurztext="Test Kurztext",
        artikel_art="Test",
        artikel_gruppe="Testwaren",
        mengen_einheit="Stk"
    )
    db.add(stammdaten)
    db.commit()
    db.refresh(stammdaten)
    
    # Stammdaten löschen
    response = client.delete(f"/api/v1/artikel-stammdaten/{stammdaten.id}")
    assert response.status_code == 204
    
    # Überprüfen, ob die Stammdaten gelöscht wurden
    check_response = client.get(f"/api/v1/artikel-stammdaten/{stammdaten.id}")
    assert check_response.status_code == 404
    
    # Aufräumen
    db.query(Artikel).filter(Artikel.id == test_artikel.id).delete()
    db.commit()

def test_ki_erweiterung(db: Session):
    """Test: Erstellen und Abrufen von KI-Erweiterungen für Artikel-Stammdaten"""
    # Testdaten für einen Artikel erstellen
    test_artikel = Artikel(
        artikelNr="TEST-001",
        bezeichnung="Test Artikel",
        einheit="Stk",
        warengruppe="Testwaren"
    )
    db.add(test_artikel)
    db.commit()
    db.refresh(test_artikel)
    
    # Stammdaten erstellen
    stammdaten = ArtikelStammdaten(
        artikel_id=test_artikel.id,
        kurztext="Test Kurztext",
        artikel_art="Test",
        artikel_gruppe="Testwaren",
        mengen_einheit="Stk"
    )
    db.add(stammdaten)
    db.commit()
    db.refresh(stammdaten)
    
    # KI-Erweiterung erstellen
    response = client.post(
        f"/api/v1/artikel-stammdaten/{stammdaten.id}/ki",
        json={
            "warengruppe_erkennung_ki": True,
            "klassifikation_confidence": 0.85,
            "preis_vk_automatisch": 29.99,
            "beschreibung_gpt": "Automatisch generierte Beschreibung",
            "seo_keywords": [
                {"keyword": "test", "relevanz": 0.9},
                {"keyword": "artikel", "relevanz": 0.8}
            ]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["warengruppe_erkennung_ki"] == True
    assert data["klassifikation_confidence"] == 0.85
    assert data["preis_vk_automatisch"] == 29.99
    assert data["beschreibung_gpt"] == "Automatisch generierte Beschreibung"
    assert len(data["seo_keywords"]) == 2
    
    # KI-Analyse durchführen
    response = client.post(
        f"/api/v1/artikel-stammdaten/{stammdaten.id}/ki/analyze?analysis_type=preisempfehlung"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "empfohlener_vk" in data
    assert "confidence" in data
    
    # Aufräumen
    db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten.id).delete()
    db.query(Artikel).filter(Artikel.id == test_artikel.id).delete()
    db.commit() 