# Notwendige Änderungen am minimal_server.py

Nach der Extraktion der Inventur-API in ein separates Modul müssen folgende Änderungen am `minimal_server.py` vorgenommen werden:

## 1. Entfernung der Inventur-Funktionen

Die folgenden Funktionen müssen aus dem `minimal_server.py` entfernt werden:

```python
@cache.cached(ttl=300)
async def get_inventuren(request):
    # ...

@cache.cached(ttl=300)
async def get_inventur_by_id(request):
    # ...

async def create_inventur(request):
    # ...

async def update_inventur(request):
    # ...

async def delete_inventur(request):
    # ...

async def add_inventur_position(request):
    # ...

async def get_inventur_auftraege_fuer_mitarbeiter(request):
    # ...

async def submit_inventur_ergebnis(request):
    # ...
```

## 2. Entfernung der Inventur-Routen

Die folgenden Routen müssen aus der `routes`-Liste entfernt werden:

```python
# Inventur-Endpunkte
Route("/api/v1/inventur", endpoint=get_inventuren),
Route("/api/v1/inventuren", endpoint=get_inventuren),
Route("/api/v1/inventur/{inventur_id:int}", endpoint=get_inventur_by_id),
Route("/api/v1/inventur/create", endpoint=create_inventur, methods=["POST"]),
Route("/api/v1/inventur/{inventur_id:int}/update", endpoint=update_inventur, methods=["PUT"]),
Route("/api/v1/inventur/{inventur_id:int}/delete", endpoint=delete_inventur, methods=["DELETE"]),
Route("/api/v1/inventur/{inventur_id:int}/position/create", endpoint=add_inventur_position, methods=["POST"]),
Route("/api/v1/inventur/auftraege/mitarbeiter/{mitarbeiter_id:int}", endpoint=get_inventur_auftraege_fuer_mitarbeiter),
Route("/api/v1/inventur/{inventur_id:int}/ergebnis", endpoint=submit_inventur_ergebnis, methods=["POST"]),
```

## 3. Entfernung der Inventur-Demo-Daten

Die Inventur-Demo-Daten müssen entfernt werden:

```python
# Inventur-Daten
inventuren = [
    {
        "id": 1,
        "bezeichnung": "Jahresinventur 2023",
        "inventurdatum": "2023-12-31",
        "lager_id": 1,
        "status": "abgeschlossen",
        "bemerkung": "Komplette Jahresinventur",
        "positionen": []
    },
    {
        "id": 2,
        "bezeichnung": "Zwischeninventur Q1 2024",
        "inventurdatum": "2024-03-31",
        "lager_id": 1,
        "status": "aktiv",
        "bemerkung": "Quartalsinventur",
        "positionen": []
    }
]
```

## 4. Anpassung der lookup_maps-Erstellung

Die Erstellung der Inventur-Lookup-Maps in der `create_lookup_maps`-Funktion muss entfernt werden:

```python
# Lookup-Maps für Inventuren
lookup_maps['inventuren_by_id'] = {inv["id"]: inv for inv in inventuren}
```

## 5. Anpassung der OpenAPI-Dokumentation

Die Inventur-bezogenen Einträge in der OpenAPI-Dokumentation müssen entfernt oder angepasst werden:

```python
"/api/v1/inventur": {
    "get": {
        "summary": "Liste aller Inventuren",
        # ...
    }
},
# weitere Inventur-Endpunkte...
```

## 6. Hinzufügen eines Imports für den modularen Server

Wenn der modulare Server die Inventur-API verwenden soll, muss ein Import hinzugefügt werden:

```python
# In modular_server.py
from backend.api.inventory_api import register_inventory_routes
```

## 7. Registrierung der Inventur-Routen im modularen Server

Im modularen Server müssen die Inventur-Routen registriert werden:

```python
# In modular_server.py
register_routes():
    # ...
    register_inventory_routes(main_router)
```

## Empfohlenes Vorgehen

1. Entwickeln und testen der modularen Inventur-API (abgeschlossen)
2. Parallel Betrieb beider Versionen für einen Übergangszeitraum
3. Umstellung aller Clients auf die neue modulare Version
4. Entfernung der alten Inventur-Funktionalität aus dem minimal_server.py
5. Vollständige Umstellung auf den modularen Server 