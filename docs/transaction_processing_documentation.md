# Transaktionsverarbeitung - Dokumentation

## Übersicht

Die Transaktionsverarbeitungskomponente ist ein zentraler Bestandteil des VALEO-NeuroERP-Systems und ermöglicht die effiziente und fehlertolerante Verarbeitung von Transaktionen mit hohem Volumen. Sie verwendet einen Chunked Processing-Ansatz mit Savepoints, um optimale Performance und Fehlertoleranz zu gewährleisten.

## Architektur

Die Komponente besteht aus folgenden Hauptbestandteilen:

1. **Transaction**: Repräsentiert eine einzelne Transaktion im System.
2. **TransactionStatus**: Verfolgt den Status einer Transaktion während der Verarbeitung.
3. **TransactionResult**: Enthält das Ergebnis einer Transaktionsverarbeitung.
4. **TransactionProcessor**: Verarbeitet Transaktionen in Chunks mit Savepoints.

### Transaktionstypen

Das System unterstützt verschiedene Transaktionstypen:

- **Inventory**: Transaktionen, die den Lagerbestand beeinflussen.
- **Financial**: Transaktionen, die finanzielle Konten betreffen.
- **Transfer**: Transaktionen, die Geld zwischen Konten transferieren.

## Chunked Processing mit Savepoints

Der implementierte Ansatz teilt große Transaktionsbatches in kleinere Chunks auf und verwendet Datenbank-Savepoints, um teilweise Commits innerhalb einer Transaktion zu ermöglichen.

### Vorteile

- **Bessere Fehlertoleranz**: Fehler in einem Chunk beeinflussen nicht andere Chunks.
- **Reduzierte Sperrzeit**: Datensätze werden nicht über den gesamten Batch gesperrt.
- **Geringerer Speicherverbrauch**: Durch Verarbeitung in Chunks wird der Speicherverbrauch reduziert.
- **Feinere Granularität**: Fehlerbehandlung auf Chunk-Ebene ermöglicht präzisere Fehlerberichte.

### Verarbeitungsablauf

1. **Chunking**: Transaktionen werden in Chunks aufgeteilt (Standard: 100 Transaktionen pro Chunk).
2. **Validierung**: Jede Transaktion wird validiert, bevor sie verarbeitet wird.
3. **Verarbeitung**: Validierte Transaktionen werden verarbeitet und in der Datenbank gespeichert.
4. **Fehlerbehandlung**: Bei Fehlern wird nur der betroffene Chunk zurückgerollt, nicht der gesamte Batch.
5. **Statusverfolgung**: Der Status jeder Transaktion wird während der Verarbeitung aktualisiert.

## API-Endpunkte

Die Komponente bietet folgende API-Endpunkte:

### `POST /api/transactions/`

Erstellt und verarbeitet eine einzelne Transaktion.

**Request-Body**:
```json
{
  "type": "inventory",
  "amount": 100.0,
  "direction": "in",
  "article_id": "artikel-123",
  "description": "Wareneingang"
}
```

**Response**:
```json
{
  "id": "tx-123",
  "type": "inventory",
  "amount": 100.0,
  "direction": "in",
  "article_id": "artikel-123",
  "description": "Wareneingang",
  "status": "completed",
  "created_at": "2025-06-01T10:00:00Z",
  "updated_at": "2025-06-01T10:00:00Z"
}
```

### `POST /api/transactions/batch`

Verarbeitet einen Batch von Transaktionen.

**Request-Body**:
```json
{
  "transactions": [
    {
      "type": "inventory",
      "amount": 100.0,
      "direction": "in",
      "article_id": "artikel-123",
      "description": "Wareneingang"
    },
    {
      "type": "financial",
      "amount": 500.0,
      "direction": "out",
      "account_id": "konto-456",
      "description": "Zahlung"
    }
  ]
}
```

**Response**:
```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "failed_transactions": [],
  "processing_time": 0.123,
  "success_rate": 100.0
}
```

### `GET /api/transactions/{transaction_id}`

Ruft eine Transaktion anhand ihrer ID ab.

**Response**:
```json
{
  "id": "tx-123",
  "type": "inventory",
  "amount": 100.0,
  "direction": "in",
  "article_id": "artikel-123",
  "description": "Wareneingang",
  "status": "completed",
  "created_at": "2025-06-01T10:00:00Z",
  "updated_at": "2025-06-01T10:00:00Z"
}
```

### `GET /api/transactions/`

Listet Transaktionen auf, optional gefiltert nach Typ.

**Query-Parameter**:
- `skip`: Anzahl der zu überspringenden Transaktionen (Standard: 0)
- `limit`: Maximale Anzahl der zurückzugebenden Transaktionen (Standard: 100)
- `transaction_type`: Filtert nach Transaktionstyp (optional)

**Response**:
```json
[
  {
    "id": "tx-123",
    "type": "inventory",
    "amount": 100.0,
    "direction": "in",
    "article_id": "artikel-123",
    "description": "Wareneingang",
    "status": "completed",
    "created_at": "2025-06-01T10:00:00Z",
    "updated_at": "2025-06-01T10:00:00Z"
  },
  {
    "id": "tx-456",
    "type": "financial",
    "amount": 500.0,
    "direction": "out",
    "account_id": "konto-456",
    "description": "Zahlung",
    "status": "completed",
    "created_at": "2025-06-01T10:00:00Z",
    "updated_at": "2025-06-01T10:00:00Z"
  }
]
```

## Datenmodell

### Transaction

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | String | Eindeutige ID der Transaktion |
| type | String | Typ der Transaktion (inventory, financial, transfer) |
| amount | Float | Betrag der Transaktion |
| direction | String | Richtung der Transaktion (in, out) |
| description | Text | Beschreibung der Transaktion |
| reference_id | String | Referenz zu externen Dokumenten |
| article_id | String | ID des betroffenen Artikels (für Inventartransaktionen) |
| account_id | String | ID des betroffenen Kontos (für Finanztransaktionen) |
| target_account_id | String | ID des Zielkontos (für Transfertransaktionen) |
| created_at | DateTime | Erstellungszeitpunkt |
| updated_at | DateTime | Letzter Aktualisierungszeitpunkt |

### TransactionStatus

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | String | Eindeutige ID des Status |
| transaction_id | String | ID der zugehörigen Transaktion |
| status | String | Status der Transaktion (pending, processing, completed, failed) |
| error_message | Text | Fehlermeldung bei fehlgeschlagenen Transaktionen |
| timestamp | DateTime | Zeitstempel der Statusänderung |
| completed_at | DateTime | Zeitpunkt der Fertigstellung |

## Performance-Optimierung

### Empfohlene Chunk-Größe

Die optimale Chunk-Größe hängt von verschiedenen Faktoren ab:

- **Systemressourcen**: Verfügbarer Arbeitsspeicher und CPU-Leistung
- **Datenbankleistung**: Anzahl der gleichzeitigen Verbindungen und Transaktionen
- **Transaktionskomplexität**: Komplexität der zu verarbeitenden Transaktionen

Empfohlene Werte:
- **Kleine Systeme**: 50-100 Transaktionen pro Chunk
- **Mittlere Systeme**: 100-500 Transaktionen pro Chunk
- **Große Systeme**: 500-1000 Transaktionen pro Chunk

### Indizierung

Für optimale Performance wurden folgende Indizes erstellt:

- `transactions.type`
- `transactions.reference_id`
- `transactions.article_id`
- `transactions.account_id`
- `transaction_status.transaction_id`
- `transaction_status.status`
- `transaction_status.timestamp`

## Fehlerbehandlung

Die Komponente bietet eine robuste Fehlerbehandlung:

1. **Validierungsfehler**: Werden vor der Verarbeitung erkannt und zurückgemeldet.
2. **Verarbeitungsfehler**: Führen zum Rollback des aktuellen Chunks.
3. **Datenbankfehler**: Werden protokolliert und führen zum Rollback der gesamten Transaktion.

### Fehlerberichte

Für jede fehlgeschlagene Transaktion wird ein detaillierter Fehlerbericht erstellt:

```json
{
  "transaction_id": "tx-123",
  "error": "Unzureichender Bestand für Artikel artikel-123: 50 < 100"
}
```

## Beispiel-Implementierung

```python
from backend.models.transaction_processing import Transaction, TransactionProcessor

# Transaktion erstellen
transaction = Transaction(
    id="tx-123",
    type="inventory",
    amount=100.0,
    direction="in",
    article_id="artikel-123",
    description="Wareneingang"
)

# Transaktionsprozessor initialisieren
processor = TransactionProcessor(chunk_size=100)

# Transaktion verarbeiten
result = processor.process_transactions([transaction])

# Ergebnis überprüfen
if result.has_failures():
    print(f"Fehler bei der Verarbeitung: {result.failed_transactions}")
else:
    print(f"Transaktion erfolgreich verarbeitet: {result.successful}/{result.total}")
```

## Monitoring und Logging

Die Komponente bietet umfangreiche Logging-Funktionen:

- **INFO**: Allgemeine Informationen zur Transaktionsverarbeitung
- **DEBUG**: Detaillierte Informationen zur Chunk-Verarbeitung
- **WARNING**: Warnungen bei fehlgeschlagenen Chunks
- **ERROR**: Fehler bei der Transaktionsverarbeitung

## Erweiterungsmöglichkeiten

Die Komponente kann in Zukunft wie folgt erweitert werden:

1. **Asynchrone Verarbeitung**: Integration mit einer Message Queue für höchste Skalierbarkeit
2. **Dynamische Chunk-Größe**: Automatische Anpassung der Chunk-Größe basierend auf Systemlast
3. **Transaktionswiederholung**: Automatische Wiederholung fehlgeschlagener Transaktionen
4. **Erweiterte Validierung**: Zusätzliche Validierungsregeln für spezifische Transaktionstypen
5. **Reporting**: Erweiterte Berichterstellung für Transaktionsverarbeitung und -fehler 