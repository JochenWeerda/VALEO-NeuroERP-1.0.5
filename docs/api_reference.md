# VALEO-NeuroERP API-Referenz

## Übersicht

Das VALEO-NeuroERP-System bietet eine umfassende REST-API zur Verwaltung neurologischer ERP-Daten und zugehöriger Geschäftsprozesse. Dieses Dokument beschreibt die verfügbaren Endpunkte, deren Verwendung und Beispiele.

## Authentifizierung

Alle API-Endpunkte erfordern eine Authentifizierung mittels JWT-Token. Um ein Token zu erhalten:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "username": "ihr_benutzername",
    "password": "ihr_passwort"
}
```

Verwenden Sie das Token in nachfolgenden Anfragen:

```http
Authorization: Bearer ihr_token_hier
```

## Standardantwortformat

Alle API-Antworten folgen diesem Format:

```json
{
    "status": "success|error",
    "data": {...},  // Bei erfolgreichen Antworten
    "error": {      // Bei Fehlerantworten
        "code": "FEHLER_CODE",
        "message": "Fehlerbeschreibung"
    }
}
```

## Endpunkte

### Kundenverwaltung

#### Kunde abrufen
```http
GET /api/v1/customers/{kunden_id}
```

#### Kunde erstellen
```http
POST /api/v1/customers
Content-Type: application/json

{
    "name": "Kundenname",
    "email": "kunde@beispiel.de",
    "telefon": "+49123456789"
}
```

### Dokumentenverwaltung

#### Dokument abrufen
```http
GET /api/v1/documents/{dokument_id}
```

#### Dokument erstellen
```http
POST /api/v1/documents
Content-Type: multipart/form-data

datei: [binär]
metadaten: {
    "typ": "rechnung|bericht|rezept",
    "kunden_id": "kunden_id"
}
```

### Transaktionsverwaltung

#### Transaktion abrufen
```http
GET /api/v1/transactions/{transaktions_id}
```

#### Transaktion erstellen
```http
POST /api/v1/transactions
Content-Type: application/json

{
    "kunden_id": "kunden_id",
    "betrag": 100.00,
    "währung": "EUR",
    "typ": "zahlung|erstattung"
}
```

### Analysen

#### Kundenanalysen abrufen
```http
GET /api/v1/analytics/customers/{kunden_id}
```

#### Transaktionsanalysen abrufen
```http
GET /api/v1/analytics/transactions
Abfrageparameter:
- start_datum: JJJJ-MM-TT
- end_datum: JJJJ-MM-TT
- typ: zahlung|erstattung
```

### Systemgesundheit

#### Systemstatus abrufen
```http
GET /api/v1/health
```

#### Metriken abrufen
```http
GET /api/v1/metrics
```

## Fehlercodes

- `AUTH_001`: Authentifizierung fehlgeschlagen
- `AUTH_002`: Token abgelaufen
- `AUTH_003`: Ungültiges Token
- `VAL_001`: Validierungsfehler
- `DB_001`: Datenbankfehler
- `CACHE_001`: Cache-Fehler
- `SYS_001`: Systemfehler

## Ratenbegrenzung

Die API ist auf 100 Anfragen pro Minute pro Client begrenzt. Informationen zur Ratenbegrenzung werden in den Antwortheadern bereitgestellt:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635789600
```

## Versionierung

Die API verwendet URL-Versionierung (v1, v2, etc.). Die aktuelle Version ist v1. Wenn eine neue Version veröffentlicht wird, wird die alte Version mindestens 6 Monate lang unterstützt.

## Überwachung

Die API stellt Prometheus-Metriken unter `/metrics` und einen Gesundheitscheck-Endpunkt unter `/health` bereit. 