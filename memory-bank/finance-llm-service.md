# Finance LLM Service Spezifikation

## Übersicht

Der Finance LLM Service ist ein spezialisierter Microservice zur Integration von Sprachmodellen (LLMs) in die Finanzprozesse des ERP-Systems. Er bietet intelligente Funktionen wie automatische Buchungsvorschläge, Anomalieerkennung und Finanzprognosen durch die Anbindung an verschiedene LLM-Provider.

## Hauptfunktionen

### 1. Intelligente Buchungsvorschläge
- Automatische Kontierungsvorschläge basierend auf Rechnungs-/Belegdaten
- Steuerklassifikation und MwSt-Berechnung
- Erkennung wiederkehrender Transaktionen und Anpassung an Buchungsmuster

### 2. Anomalieerkennung
- Identifikation ungewöhnlicher Finanztransaktionen
- Erkennung potenzieller Doppelbuchungen oder Fehlkategorisierungen
- Monatliche Abweichungsanalyse zu Vorperioden

### 3. Finanzprognosen
- Liquiditätsvorhersagen basierend auf historischen Daten
- Szenarien-Modellierung für verschiedene Geschäftsentwicklungen
- Cash-Flow-Prognosen mit Vertrauensintervallen

### 4. Natürlichsprachliche Abfragen
- Beantwortung von Finanzfragen in natürlicher Sprache
- Erstellung von Finanzberichten nach verbalen Vorgaben
- KI-gestützte Dashboards mit natürlichsprachlicher Interaktion

## Technische Architektur

### Komponenten

```
┌─────────────────────────────────────────────────────────┐
│                 Finance LLM Service                      │
├─────────────┬───────────────┬──────────────┬────────────┤
│ API Gateway │ LLM Connector │ Redis Cache  │ Monitoring │
├─────────────┼───────────────┼──────────────┼────────────┤
│ Suggestion  │ Anomaly       │ Forecast     │ NLP Query  │
│ Engine      │ Detector      │ Generator    │ Processor  │
└─────────────┴───────────────┴──────────────┴────────────┘
```

### Technologien
- **Backend Framework**: FastAPI 0.95+
- **Caching**: Redis 7.0+
- **LLM Integration**: LangChain/LlamaIndex
- **Monitoring**: Prometheus + Grafana
- **Containerisierung**: Docker + Kubernetes
- **Dokumentation**: OpenAPI 3.0 + ReDoc

## API-Endpunkte

### Buchungsvorschläge

#### `POST /api/v1/finance/llm/suggestions/transaction`

Liefert Buchungsvorschläge basierend auf Belegdaten.

**Request:**
```json
{
  "document_type": "invoice",
  "vendor": "ACME GmbH",
  "date": "2023-09-15",
  "total_amount": 1190.00,
  "tax_amount": 190.00,
  "items": [
    {
      "description": "Office Supplies",
      "amount": 500.00
    },
    {
      "description": "Software License",
      "amount": 500.00
    }
  ],
  "ocr_text": "Optional full OCR text from document",
  "history": {
    "include_history": true,
    "vendor_specific": true
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "confidence": 0.92,
      "transactions": [
        {
          "debit_account": "5800",
          "credit_account": "1800",
          "amount": 500.00,
          "tax_code": "19",
          "description": "Office Supplies ACME GmbH",
          "cost_center": "ADM"
        },
        {
          "debit_account": "5400",
          "credit_account": "1800", 
          "amount": 500.00,
          "tax_code": "19",
          "description": "Software License ACME GmbH",
          "cost_center": "IT"
        },
        {
          "debit_account": "1576",
          "credit_account": "1800",
          "amount": 190.00,
          "tax_code": "19",
          "description": "VAT ACME GmbH Invoice",
          "cost_center": null
        }
      ],
      "reasoning": "Based on the vendor and item descriptions, I've identified appropriate expense accounts. Office supplies typically go to account 5800, software licenses to 5400. The cost centers were assigned based on department responsibility."
    }
  ],
  "metadata": {
    "model_used": "gpt-4-1106-preview",
    "processing_time": 0.87,
    "cached": false,
    "version": "1.0.0"
  }
}
```

#### `POST /api/v1/finance/llm/suggestions/account`

Schlägt geeignete Konten basierend auf Buchungsbeschreibung vor.

**Request:**
```json
{
  "description": "Monatsmiete für Büroräume",
  "amount": 2500.00,
  "context": {
    "transaction_type": "expense",
    "recurring": true
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "account": "4210",
      "name": "Miete",
      "confidence": 0.97,
      "reasoning": "Die Beschreibung 'Monatsmiete für Büroräume' deutet klar auf eine Mietausgabe hin."
    },
    {
      "account": "4230",
      "name": "Nebenkosten",
      "confidence": 0.43,
      "reasoning": "Falls die Miete Nebenkosten beinhaltet, könnte auch dieses Konto anteilig verwendet werden."
    }
  ],
  "metadata": {
    "model_used": "gpt-3.5-turbo",
    "processing_time": 0.32,
    "cached": true,
    "version": "1.0.0"
  }
}
```

### Anomalieerkennung

#### `POST /api/v1/finance/llm/anomalies/detect`

Erkennt Anomalien in einer Liste von Transaktionen.

**Request:**
```json
{
  "transactions": [
    {
      "id": "T-2023-1001",
      "date": "2023-09-01",
      "debit_account": "5800",
      "credit_account": "1800",
      "amount": 500.00,
      "description": "Office Supplies"
    },
    {
      "id": "T-2023-1002",
      "date": "2023-09-05",
      "debit_account": "5800", 
      "credit_account": "1800",
      "amount": 5000.00,
      "description": "Office Supplies"
    }
  ],
  "context": {
    "typical_ranges": {
      "5800": {
        "min": 100.00,
        "max": 1000.00,
        "avg": 450.00
      }
    },
    "look_back_period": 90
  }
}
```

**Response:**
```json
{
  "anomalies": [
    {
      "transaction_id": "T-2023-1002",
      "anomaly_type": "amount_unusually_high",
      "confidence": 0.89,
      "description": "The amount of 5000.00 for account 5800 (Office Supplies) is significantly higher than the typical range (100.00-1000.00).",
      "suggestion": "Verify this transaction as it's 10x the average amount for this account."
    }
  ],
  "metadata": {
    "model_used": "claude-2.1",
    "processing_time": 0.54,
    "cached": false,
    "version": "1.0.0"
  }
}
```

#### `GET /api/v1/finance/llm/anomalies/monthly-report`

Erstellt einen monatlichen Anomaliebericht.

**Request:**
```
GET /api/v1/finance/llm/anomalies/monthly-report?year=2023&month=9&detail_level=high
```

**Response:**
```json
{
  "report": {
    "period": "September 2023",
    "total_transactions": 537,
    "anomalies_detected": 12,
    "summary": "12 potential anomalies were detected out of 537 transactions in September 2023. The total monetary value of flagged transactions is €28,500.00.",
    "anomalies": [
      {
        "transaction_id": "T-2023-1002",
        "date": "2023-09-05",
        "anomaly_type": "amount_unusually_high",
        "account": "5800",
        "amount": 5000.00,
        "description": "Unusually high amount for office supplies"
      },
      // Additional anomalies...
    ],
    "trends": {
      "increasing_anomalies": ["Travel Expenses", "Consulting Fees"],
      "decreasing_anomalies": ["Office Supplies", "Software Subscriptions"]
    }
  },
  "metadata": {
    "model_used": "gpt-4-1106-preview",
    "processing_time": 1.87,
    "cached": false,
    "version": "1.0.0"
  }
}
```

### Finanzprognosen

#### `POST /api/v1/finance/llm/forecasts/cash-flow`

Erstellt eine Cash-Flow-Prognose.

**Request:**
```json
{
  "base_period": {
    "start_date": "2023-01-01",
    "end_date": "2023-09-30"
  },
  "forecast_period": {
    "start_date": "2023-10-01",
    "end_date": "2023-12-31"
  },
  "granularity": "month",
  "scenarios": ["baseline", "optimistic", "pessimistic"],
  "account_groups": ["income", "expense", "receivable", "payable"]
}
```

**Response:**
```json
{
  "forecast": {
    "period": "Q4 2023",
    "scenarios": {
      "baseline": {
        "cash_flow": [
          {
            "period": "2023-10",
            "inflow": 120000.00,
            "outflow": 95000.00,
            "net_flow": 25000.00,
            "ending_balance": 175000.00
          },
          {
            "period": "2023-11",
            "inflow": 125000.00,
            "outflow": 97000.00,
            "net_flow": 28000.00,
            "ending_balance": 203000.00
          },
          {
            "period": "2023-12",
            "inflow": 140000.00,
            "outflow": 110000.00,
            "net_flow": 30000.00,
            "ending_balance": 233000.00
          }
        ],
        "confidence_interval": {
          "lower": 0.85,
          "upper": 1.15
        }
      },
      "optimistic": {
        // Similar structure with optimistic numbers
      },
      "pessimistic": {
        // Similar structure with pessimistic numbers
      }
    },
    "key_insights": [
      "Cash position remains strong throughout Q4 with all scenarios showing positive net flow",
      "December typically shows higher inflow due to year-end customer payments",
      "Consider delaying non-essential capital expenditures to January for optimal cash management"
    ]
  },
  "metadata": {
    "model_used": "claude-2.1",
    "processing_time": 2.14,
    "cached": false,
    "version": "1.0.0"
  }
}
```

### Natürlichsprachliche Abfragen

#### `POST /api/v1/finance/llm/query`

Verarbeitet natürlichsprachliche Finanzabfragen.

**Request:**
```json
{
  "query": "Wie hat sich unser Verhältnis von Personalkosten zu Umsatz im Vergleich zum Vorjahr entwickelt?",
  "context": {
    "time_period": {
      "current": {
        "start": "2023-01-01",
        "end": "2023-09-30"
      },
      "previous": {
        "start": "2022-01-01",
        "end": "2022-09-30"
      }
    },
    "preferred_visualization": "chart"
  }
}
```

**Response:**
```json
{
  "answer": {
    "text": "Das Verhältnis von Personalkosten zu Umsatz hat sich in den ersten drei Quartalen 2023 verbessert. Die Personalkosten machen aktuell 32,5% des Umsatzes aus, verglichen mit 36,7% im gleichen Zeitraum des Vorjahres. Das entspricht einer Verbesserung um 4,2 Prozentpunkte.",
    "data": {
      "current_period": {
        "personnel_costs": 1235000.00,
        "revenue": 3800000.00,
        "ratio": 0.325
      },
      "previous_period": {
        "personnel_costs": 1150000.00,
        "revenue": 3130000.00,
        "ratio": 0.367
      },
      "change": {
        "absolute": -0.042,
        "percentage": -11.4
      }
    },
    "visualization": {
      "type": "bar_chart",
      "config": {
        "title": "Personalkosten zu Umsatz",
        "labels": ["2022 Q1-Q3", "2023 Q1-Q3"],
        "values": [36.7, 32.5],
        "format": "percentage"
      }
    }
  },
  "metadata": {
    "model_used": "gpt-4-1106-preview",
    "processing_time": 1.23,
    "cached": false,
    "version": "1.0.0"
  }
}
```

### System-Endpunkte

#### `GET /health`

Liefert Statusinformationen des Services.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "llm_connector": "operational",
    "cache": "operational"
  },
  "llm_providers": [
    {
      "name": "openai",
      "status": "operational",
      "latency": 760
    },
    {
      "name": "anthropic",
      "status": "operational",
      "latency": 910
    },
    {
      "name": "local",
      "status": "operational",
      "latency": 320
    }
  ],
  "metrics": {
    "requests_per_minute": 12.5,
    "p95_response_time": 1200,
    "cache_hit_ratio": 0.72
  }
}
```

## LLM Provider Strategie

### Multi-Provider-Ansatz

```
┌─────────────────┐           ┌─────────────────┐
│ API Request     │           │ Provider Router │
│                 │──────────▶│                 │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────┐
                    │        Provider Selector        │
                    └─────────────────────────────────┘
                      │             │             │
                      ▼             ▼             ▼
          ┌───────────────┐ ┌─────────────┐ ┌───────────────┐
          │ OpenAI        │ │ Anthropic   │ │ Local Models  │
          │ GPT-4/3.5     │ │ Claude      │ │ e.g. LLaMA    │
          └───────┬───────┘ └──────┬──────┘ └───────┬───────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                                   ▼
                       ┌─────────────────────┐
                       │ Response Processor  │
                       └─────────────────────┘
```

### Auswahlkriterien für LLM-Provider

Der Service entscheidet dynamisch, welchen LLM-Provider er für eine Anfrage verwendet, basierend auf:

1. **Aufgabentyp**
   - Komplexe Analysen → GPT-4 oder Claude-2
   - Einfache Klassifikationen → GPT-3.5 oder lokales Modell
   - Zeitkritische Anfragen → Schnellster verfügbarer Provider

2. **Kosteneffizienz**
   - Nutzung kostengünstigerer Modelle für Standardanfragen
   - Hochwertigere Modelle nur für komplexe Aufgaben
   - Automatische Batch-Verarbeitung für nicht zeitkritische Anfragen

3. **Verfügbarkeit**
   - Automatischer Fallback bei Ausfällen oder hoher Latenz
   - Lastverteilung bei hohem Anfragevolumen
   - Priorisierung basierend auf aktueller Leistung

4. **Spezifische Stärken**
   - Finanzanalysen → Claude-2 (gute Performance bei strukturierten Daten)
   - Textverarbeitung → GPT-4 (umfassendes Kontextverständnis)
   - Standard-Klassifikation → Lokale Modelle (Datenschutz, Latenz)

### Ratelimiiting und Warteschlangen

- Dynamische Token-Bucket-Implementierung für jeden Provider
- Priorisierte Warteschlangen für kritische Geschäftsprozesse
- Automatische Wiederholungsmechanismen mit exponentieller Backoff-Strategie

## Caching-Strategie

### Multi-Level-Caching

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Request         │─────▶│ Local Memory    │─────▶│ Redis Cache     │
│                 │      │ Cache (L1)      │      │ (L2)            │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                                                  │
        │                                                  │
        │                                                  ▼
┌─────────────────┐                             ┌─────────────────┐
│ Response        │◀────────────────────────────│ LLM API         │
│                 │                             │                 │
└─────────────────┘                             └─────────────────┘
```

### Cache-Strategien

1. **Exaktes Caching**
   - Identische Anfragen werden direkt aus dem Cache bedient
   - TTL basierend auf Datenaktualitätsanforderungen

2. **Semantisches Caching**
   - Ähnliche Anfragen werden erkannt und mit bestehenden Caches abgeglichen
   - Implementierung eines Ähnlichkeitsmaßes basierend auf Embedding-Distanz
   - Anpassung der Antwort basierend auf der spezifischen Anfrage

3. **Cache-Invalidierung**
   - Automatische Invalidierung bei Änderungen an relevanten Finanzdaten
   - Event-basierte Invalidierung bei Änderungen am Kontenplan oder Buchungsregeln
   - Time-to-Live (TTL) für zeitabhängige Daten

4. **Cache-Warming**
   - Proaktives Caching häufiger Abfragen
   - Periodische Aktualisierung für wichtige geschäftskritische Abfragen
   - Batch-Aktualisierung während Niedriglastzeiten

### Cache-Metriken

- Hit-Rate-Überwachung pro Endpunkt
- Latenzvergleich zwischen gecachten und nicht-gecachten Anfragen
- Cache-Größe und Speicherauslastung
- TTL-Optimierung basierend auf Nutzungsmustern

## Ausfallsicherheit und Fallback-Mechanismen

### Ausfallsicherheit

1. **Circuit Breaker**
   - Implementierung des Circuit-Breaker-Patterns für LLM-API-Anfragen
   - Automatische Deaktivierung instabiler Provider
   - Automatische Wiederherstellung nach definierten Zeiträumen

2. **Bulkhead-Pattern**
   - Isolation der LLM-Provider-Aufrufe in separate Thread-Pools
   - Verhinderung von Kaskadenausfällen bei Überlastung

3. **Timeout-Management**
   - Progressive Timeouts basierend auf Anfragekomplexität
   - Adaptive Timeouts basierend auf beobachteter Latenz

### Fallback-Strategien

1. **Provider-Fallback**
   - Automatischer Wechsel zu alternativen LLM-Providern bei Ausfall
   - Priorisierte Liste von Fallback-Providern pro Anfragekategorie

2. **Komplexitätsreduktion**
   - Vereinfachung der Anfrage bei Timeout oder Überlastung
   - Aufteilen komplexer Anfragen in mehrere einfachere Teilanfragen

3. **Regelbasierte Fallbacks**
   - Konventioneller algorithmischer Ansatz als letzter Fallback
   - Vorregistrierte Standardantworten für kritische Geschäftsfunktionen
   - Lokale Modelle als Backup für einfachere Anfragen

4. **Degradierter Betriebsmodus**
   - Definierte Service-Level für verschiedene Fehlerszenarien
   - Transparente Kommunikation des aktuellen Servicestatus an Clients

## Monitoring und Observability

### Metriken

1. **Leistungsmetriken**
   - Antwortzeiten (Durchschnitt, p95, p99)
   - Durchsatz (Anfragen pro Minute)
   - Fehlversuche und Fehlertypen
   - Cache-Hit-Rate und Cache-Effizienz

2. **LLM-spezifische Metriken**
   - Token-Nutzung pro Provider
   - Kostenverbrauch pro Anfragekategorie
   - Modellauswahl-Verteilung
   - Durchschnittliche Generierungszeit

3. **Geschäftsmetriken**
   - Verwendungshäufigkeit pro Funktionalität
   - Akzeptanzrate von Vorschlägen
   - Genauigkeit von Vorhersagen
   - Erkennungsrate von Anomalien

### Logging

- Strukturierte JSON-Logs für einfache Abfrage und Analyse
- Korrelierte Request-IDs zwischen Services
- Anonymisierung sensibler Finanzdaten in Logs
- Aufbewahrung von Logs gemäß Compliance-Anforderungen

### Alarme

- Proaktive Benachrichtigung bei Service-Degradation
- Schwellenwertbasierte Alarme für kritische Metriken
- Automatische Eskalationspfade basierend auf Schweregrad
- Periodische Gesundheitsberichte für Stakeholder

## Sicherheit und Compliance

### Datenschutz

- Minimierung von Datenübertragungen zu externen LLM-Providern
- Anonymisierung personenbezogener Daten vor LLM-Anfragen
- Lokale Vorverarbeitung sensibler Finanzdaten
- Implementierung von Data Governance Policies

### Audit Trail

- Vollständige Aufzeichnung aller LLM-gestützten Entscheidungen
- Protokollierung von Modellversionen und Anbieterinformationen
- Nachvollziehbare Begründung für alle Vorschläge
- DSGVO-konforme Aufbewahrung von Audit-Informationen

### Vertraulichkeit

- Verschlüsselung aller Daten im Ruhezustand und während der Übertragung
- Zugangskontrolle basierend auf dem Least-Privilege-Prinzip
- Automatischer Ablauf von Cache-Einträgen mit sensiblen Daten
- Regelmäßige Sicherheitsaudits und Penetrationstests

## Integrationspunkte

### Integration mit Finance Core

- REST-API-basierte Kommunikation für Standardabfragen
- gRPC für latenzempfindliche oder hochfrequente Anfragen
- Webhook-basierte Event-Benachrichtigungen für asynchrone Prozesse

### Integration mit Frontend

- WebSocket-Verbindungen für Echtzeit-Vorschläge
- Klare Kennzeichnung von KI-generierten Inhalten
- Interaktive UI-Elemente für Feedback zum KI-Service

### Integration mit Drittsystemen

- OAuth2-basierte API-Zugänge für externe Systeme
- Standardisierte Datenformate für Import/Export (JSON, CSV)
- Webhook-Endpunkte für ereignisbasierte Integrationen

## Implementierungs-Roadmap

### Phase 1: Grundlegende Infrastruktur

- Implementierung des API-Grundgerüsts
- Integration eines primären LLM-Providers (z.B. OpenAI)
- Basisimplementierung des Redis-Caching
- Aufbau der Monitoring-Infrastruktur

### Phase 2: Kerndienste

- Entwicklung des Buchungsvorschlag-Services
- Implementierung des Anomalieerkennungssystems
- Basisversion der natürlichsprachlichen Abfrage

### Phase 3: Erweiterter Service

- Multi-Provider-Integration (Anthropic, lokale Modelle)
- Fortschrittliche Caching-Strategien
- Prognose-Service-Implementierung

### Phase 4: Optimierung

- Feinabstimmung der Modellauswahl-Algorithmen
- Leistungsoptimierung und Skalierbarkeit
- Erweiterte Sicherheits- und Compliance-Features

## Technische Anforderungen

### Hardware-Anforderungen

- **Minimal**: 2 vCPUs, 4GB RAM, 20GB SSD
- **Empfohlen**: 4 vCPUs, 8GB RAM, 40GB SSD
- **Produktion**: 8+ vCPUs, 16GB+ RAM, 100GB+ SSD

### Software-Anforderungen

- Python 3.10+
- Redis 7.0+
- Docker 20.10+
- Kubernetes 1.24+ (für Produktionsumgebungen)

### Netzwerkanforderungen

- Ausgehende Verbindungen zu LLM-API-Endpunkten
- Verbindungen zu Redis Cache
- Interne Verbindungen zu anderen Microservices
- Rate-Limiting für externe APIs 