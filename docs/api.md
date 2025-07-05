# VALEO NeuroERP API

## Übersicht

Die API verwendet:
- REST-Architektur
- JSON-Formate
- Token-basierte Authentifizierung
- Versionierung

## Versionierung

APIs sind versioniert:
```
/api/v1/...  # Aktuelle Version
/api/v2/...  # Beta Version
```

## Authentifizierung

Bearer Token im Header:
```
Authorization: Bearer <token>
```

## Endpoints

### Users

#### GET /api/v1/users
Liste aller Benutzer

Response:
```json
{
  "users": [
    {
      "id": "123",
      "username": "test",
      "email": "test@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/users
Neuen Benutzer erstellen

Request:
```json
{
  "username": "test",
  "email": "test@example.com",
  "password": "secret"
}
```

### Documents

#### GET /api/v1/documents
Liste aller Dokumente

Query Parameter:
- `type`: Dokumententyp
- `status`: Status
- `page`: Seitennummer
- `per_page`: Einträge pro Seite

#### POST /api/v1/documents
Neues Dokument erstellen

Request:
```json
{
  "type": "invoice",
  "content": {
    "number": "INV-001",
    "customer": "123",
    "items": []
  }
}
```

### Metrics

#### GET /api/v1/metrics
System-Metriken

Response:
```json
{
  "cpu_usage": 45.2,
  "memory_usage": 1024,
  "active_users": 100,
  "requests_per_minute": 60
}
```

## Fehler

Standardisierte Fehlerantworten:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "reason": "Invalid format"
    }
  }
}
```

HTTP Status Codes:
- 200: Erfolg
- 201: Erstellt
- 400: Ungültige Anfrage
- 401: Nicht authentifiziert
- 403: Nicht autorisiert
- 404: Nicht gefunden
- 500: Server-Fehler

## Deprecation

Veraltete Endpoints:
```
Deprecation: true
Sunset: Sat, 1 Jan 2025 00:00:00 GMT
Link: </api/v2/users>; rel="successor-version"
```

## Rate Limiting

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
``` 