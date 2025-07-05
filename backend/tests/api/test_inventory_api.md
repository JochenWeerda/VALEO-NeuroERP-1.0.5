# Testplan für die Inventur-API

## Testfälle für API-Endpunkte

### 1. GET /api/v1/inventur - Alle Inventuren abrufen

**Positive Tests:**
- ✅ Erfolgreicher Abruf aller Inventuren
- ✅ Korrekte Antwortstruktur (JSON mit Liste von Inventuren)
- ✅ Korrektes Caching-Verhalten (TTL: 300s)

**Negative Tests:**
- ❌ Authentifizierungsfehler (wenn Authentifizierung implementiert ist)

### 2. GET /api/v1/inventur/{inventur_id} - Eine Inventur abrufen

**Positive Tests:**
- ✅ Erfolgreicher Abruf einer vorhandenen Inventur
- ✅ Korrekte Antwortstruktur (JSON mit Inventur-Details)
- ✅ Korrektes Caching-Verhalten (TTL: 300s)

**Negative Tests:**
- ❌ Abruf einer nicht vorhandenen Inventur (404 Not Found)
- ❌ Ungültige ID (z.B. Buchstaben statt Zahlen)

### 3. POST /api/v1/inventur/create - Inventur erstellen

**Positive Tests:**
- ✅ Erfolgreiche Erstellung einer Inventur mit Mindestangaben
- ✅ Erfolgreiche Erstellung einer Inventur mit allen optionalen Feldern
- ✅ Korrekte Antwortstruktur (JSON mit erstellter Inventur)
- ✅ Eindeutige ID-Generierung

**Negative Tests:**
- ❌ Fehlende Pflichtfelder
- ❌ Ungültige Datentypen
- ❌ Ungültiges Datum-Format

### 4. PUT /api/v1/inventur/{inventur_id}/update - Inventur aktualisieren

**Positive Tests:**
- ✅ Erfolgreiche Aktualisierung einer vorhandenen Inventur
- ✅ Teilweise Aktualisierung (nur einzelne Felder)
- ✅ Korrekte Antwortstruktur (JSON mit aktualisierter Inventur)

**Negative Tests:**
- ❌ Aktualisierung einer nicht vorhandenen Inventur (404 Not Found)
- ❌ Ungültige Datentypen

### 5. DELETE /api/v1/inventur/{inventur_id}/delete - Inventur löschen

**Positive Tests:**
- ✅ Erfolgreiche Löschung einer vorhandenen Inventur
- ✅ Korrekte Antwortstruktur (Bestätigungsmeldung)

**Negative Tests:**
- ❌ Löschung einer nicht vorhandenen Inventur (404 Not Found)

### 6. POST /api/v1/inventur/{inventur_id}/position/create - Inventurposition hinzufügen

**Positive Tests:**
- ✅ Erfolgreiche Hinzufügung einer Position zu einer vorhandenen Inventur
- ✅ Korrekte Antwortstruktur (JSON mit erstellter Position)
- ✅ Eindeutige ID-Generierung für die Position

**Negative Tests:**
- ❌ Hinzufügung zu einer nicht vorhandenen Inventur (404 Not Found)
- ❌ Fehlende Pflichtfelder
- ❌ Ungültige Datentypen

### 7. GET /api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id} - Inventuraufträge für Mitarbeiter

**Positive Tests:**
- ✅ Erfolgreicher Abruf der Aufträge für einen Mitarbeiter
- ✅ Korrekte Antwortstruktur (JSON mit Liste von Aufträgen)

**Negative Tests:**
- ❌ Ungültige Mitarbeiter-ID

### 8. POST /api/v1/inventur/{inventur_id}/ergebnis - Inventurergebnis einreichen

**Positive Tests:**
- ✅ Erfolgreiche Einreichung eines Ergebnisses
- ✅ Korrekte Antwortstruktur (JSON mit Bestätigung)
- ✅ Korrekte Aktualisierung der Hauptinventur

**Negative Tests:**
- ❌ Einreichung für eine nicht vorhandene Inventur (404 Not Found)
- ❌ Fehlende Pflichtfelder
- ❌ Ungültige Datentypen

## Integrationstest-Szenarien

### 1. Vollständiger Inventur-Workflow

1. Inventur erstellen
2. Positionen hinzufügen
3. Inventuraufträge für Mitarbeiter abrufen
4. Inventurergebnisse einreichen
5. Inventur aktualisieren (Status auf "abgeschlossen" setzen)
6. Inventur abrufen und prüfen

### 2. Integration mit dem modularen Server

1. Modularen Server starten
2. Inventur-API-Endpunkte aufrufen
3. Korrekte Funktionalität prüfen

## Leistungstests

1. Abruf von vielen Inventuren (z.B. 1000+)
2. Gleichzeitige Anfragen von mehreren Clients
3. Überprüfung des Caching-Verhaltens

## Testumgebung

- Pytest für Unit- und Integrationstests
- Unittest für Mock-Tests
- FastAPI TestClient für API-Tests
- Locust für Lasttests

## Beispiel-Testcode (Pseudocode)

```python
def test_get_inventuren():
    # Arrange
    client = TestClient(app)
    
    # Act
    response = client.get("/api/v1/inventur")
    
    # Assert
    assert response.status_code == 200
    assert "inventuren" in response.json()
    assert isinstance(response.json()["inventuren"], list)

def test_create_inventur():
    # Arrange
    client = TestClient(app)
    data = {
        "bezeichnung": "Test-Inventur",
        "inventurdatum": "2024-05-01"
    }
    
    # Act
    response = client.post("/api/v1/inventur/create", json=data)
    
    # Assert
    assert response.status_code == 200
    assert response.json()["bezeichnung"] == "Test-Inventur"
    assert "id" in response.json()
```

## Testabdeckung

Ziel ist eine Testabdeckung von mindestens 85% für:
- Funktionen
- Zeilen
- Verzweigungen

## Regressionstest-Strategie

1. Automatisierte Tests bei jeder Änderung ausführen
2. Snapshot-Tests für API-Antworten
3. Vergleich mit der Legacy-Implementierung im minimal_server.py

## Testdaten

Für die Tests werden speziell präparierte Testdaten verwendet, die folgende Szenarien abdecken:
- Leere Inventur
- Inventur mit vielen Positionen
- Inventur mit verschiedenen Status
- Inventur mit Chargen-Integration 