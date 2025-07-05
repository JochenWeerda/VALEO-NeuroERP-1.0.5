# Modularisierung des minimal_server.py - Phase 5: Microservice-Vorbereitung

## Übersicht

Nach der Implementierung erweiterter Funktionalitäten in Phase 4 konzentriert sich Phase 5 auf die Vorbereitung des modularen Systems für eine vollständige Microservice-Architektur. Diese Phase legt den Grundstein für eine flexible, skalierbare und resiliente Systemlandschaft, indem sie die notwendige Infrastruktur und Kommunikationsmuster für Microservices etabliert.

## Ziele der Phase 5

1. **Ermöglichung unabhängiger Deployment-Zyklen** durch standardisierte Service-Schnittstellen
2. **Verbesserung der Skalierbarkeit** durch containerisierte Microservices
3. **Erhöhung der Resilienz** durch robuste Kommunikationsmuster und Fehlertoleranzstrategien
4. **Vereinfachung der Service-Entdeckung** durch zentrale Service-Registry
5. **Zentralisierung des API-Zugriffs** durch ein intelligentes API-Gateway

## Architektur-Komponenten

### 1. Kommunikations-Framework

Ein standardisiertes Kommunikations-Framework wird implementiert, das sowohl synchrone (REST) als auch asynchrone (Event-basierte) Kommunikation unterstützt:

```python
# Beispiel für API-Gateway-Integration
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import JSONResponse
import httpx

async def proxy_request(request):
    service_name = request.path_params["service"]
    path = request.path_params["path"]
    
    # Service-Discovery: Service-Endpunkt ermitteln
    service_url = get_service_url(service_name)
    if not service_url:
        return JSONResponse({"error": f"Service {service_name} not found"}, status_code=404)
    
    # Request an Service weiterleiten
    full_url = f"{service_url}/{path}"
    
    headers = {k: v for k, v in request.headers.items() 
               if k.lower() not in ["host", "content-length"]}
    
    # JWT-Token für Service-zu-Service-Kommunikation hinzufügen
    headers["Authorization"] = f"Bearer {generate_service_token(service_name)}"
    
    async with httpx.AsyncClient() as client:
        method = request.method.lower()
        request_func = getattr(client, method)
        
        # Request-Body für POST/PUT/PATCH
        body = await request.body() if method in ["post", "put", "patch"] else None
        
        response = await request_func(
            full_url,
            headers=headers,
            params=dict(request.query_params),
            content=body
        )
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )

# Gateway-Routes
routes = [
    Route("/api/{service}/{path:path}", endpoint=proxy_request, methods=["GET", "POST", "PUT", "DELETE"]),
    # ... weitere Gateway-Routen
]

gateway_app = Starlette(routes=routes)
```

**Hauptmerkmale:**
- Standardisierte REST-API-Schnittstellen mit einheitlicher Fehlerbehandlung
- Event-basierte Kommunikation über Message-Broker (RabbitMQ/Kafka)
- Zentrales API-Gateway für einheitlichen Zugriff
- Service-Discovery-Mechanismus für dynamische Service-Lokalisierung

### 2. Container-Infrastruktur

Eine containerbasierte Infrastruktur wird eingerichtet, um die Microservices zu verpacken und zu verwalten:

```dockerfile
# Beispiel-Dockerfile für Chargen-API
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/api/charges_api.py /app/api/
COPY ./backend/core /app/core/

ENV MODULE_NAME="charges_api"
ENV PORT=8000

CMD ["uvicorn", "api.charges_api:app", "--host", "0.0.0.0", "--port", "${PORT}"]
```

```yaml
# Beispiel docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build:
      context: .
      dockerfile: ./gateway/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SERVICE_REGISTRY_URL=http://service-registry:8080
    depends_on:
      - service-registry
    networks:
      - erp-network

  service-registry:
    image: consul:latest
    ports:
      - "8500:8500"
      - "8600:8600/udp"
    command: "agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0"
    networks:
      - erp-network

  charges-api:
    build:
      context: .
      dockerfile: ./backend/Dockerfile.charges
    environment:
      - MODULE_NAME=charges_api
      - PORT=8001
      - SERVICE_REGISTRY_URL=http://service-registry:8080
    depends_on:
      - service-registry
    networks:
      - erp-network

  articles-api:
    build:
      context: .
      dockerfile: ./backend/Dockerfile.articles
    environment:
      - MODULE_NAME=articles_api
      - PORT=8002
      - SERVICE_REGISTRY_URL=http://service-registry:8080
    depends_on:
      - service-registry
    networks:
      - erp-network

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    networks:
      - erp-network

networks:
  erp-network:
    driver: bridge
```

**Hauptmerkmale:**
- Docker-Container für alle Microservices
- Docker Compose für lokale Entwicklung und Tests
- Kubernetes-Manifeste für produktive Deployments
- CI/CD-Pipeline für automatisierte Builds und Deployments

### 3. Service-Aufteilung

Die bestehenden Module werden in eigenständige Microservices aufgeteilt, wobei jeder Service seine eigene Datenbank und API hat:

```python
# Beispiel für OpenAPI-Spezifikation (charges_api_openapi.py)
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Chargen API", version="1.0.0")

class ChargeBase(BaseModel):
    artikel_id: int
    menge: float
    einheit_id: int
    herstellungsdatum: datetime
    mindesthaltbarkeitsdatum: Optional[datetime] = None
    charge_nummer: str
    status: str = "aktiv"
    bemerkungen: Optional[str] = None

class ChargeCreate(ChargeBase):
    pass

class Charge(ChargeBase):
    id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

# Endpunkte definieren...
@app.get("/api/v1/charges", response_model=List[Charge])
async def get_charges():
    """
    Gibt alle Chargen zurück.
    """
    pass

@app.get("/api/v1/charge/{id}", response_model=Charge)
async def get_charge(id: int):
    """
    Gibt eine spezifische Charge anhand der ID zurück.
    """
    pass

@app.post("/api/v1/charge/create", response_model=Charge, status_code=201)
async def create_charge(charge: ChargeCreate):
    """
    Erstellt eine neue Charge.
    """
    pass

# OpenAPI-Schema generieren
def get_charges_api_schema():
    return get_openapi(
        title=app.title,
        version=app.version,
        description="API für die Chargenverwaltung",
        routes=app.routes,
    )
```

**Hauptmerkmale:**
- Klare Domain-basierte Service-Boundaries
- Eigene Datenbanken pro Microservice
- Standardisierte API-Verträge mit OpenAPI-Spezifikationen
- Shared Libraries für gemeinsame Funktionen

### 4. Resilienz und Fehlertoleranz

Robuste Mechanismen für Fehlertoleranz und Resilienz werden implementiert:

```python
# Beispiel für Circuit Breaker
import time
from enum import Enum
from typing import Callable, Dict, Any

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=30):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0

    async def execute(self, func: Callable, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is open")
        
        try:
            result = await func(*args, **kwargs)
            
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                
            return result
            
        except Exception as e:
            self.last_failure_time = time.time()
            self.failure_count += 1
            
            if self.failure_count >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.OPEN
                
            raise e

# Circuit Breakers für Services
circuit_breakers: Dict[str, CircuitBreaker] = {}

async def call_service_with_circuit_breaker(service_name: str, func: Callable, *args, **kwargs):
    if service_name not in circuit_breakers:
        circuit_breakers[service_name] = CircuitBreaker()
        
    try:
        return await circuit_breakers[service_name].execute(func, *args, **kwargs)
    except Exception as e:
        # Fallback-Strategie
        if service_name == "articles_api":
            logger.warning(f"Fallback für articles_api: {str(e)}")
            return get_cached_articles()
        elif service_name == "charges_api":
            logger.warning(f"Fallback für charges_api: {str(e)}")
            return get_cached_charges()
        else:
            raise e
```

**Hauptmerkmale:**
- Circuit Breaker für Schutz vor Kaskadenausfällen
- Retry-Mechanismen mit Exponential Backoff
- Fallback-Strategien für degradierten Betrieb
- Distributed Tracing für End-to-End-Verfolgung von Anfragen

## Implementierungsplan

Die Umsetzung der Phase 5 erfolgt in vier aufeinanderfolgenden Sprints:

### Sprint 9: Kommunikations-Framework
- Standardisierung der REST-API-Schnittstellen
- Implementierung eines Message-Brokers für asynchrone Kommunikation
- Entwicklung eines API-Gateways für zentralen Zugriff
- Einrichtung von Service-Discovery

### Sprint 10: Container-Infrastruktur
- Erstellung von Dockerfiles für alle Module
- Konfiguration von Docker Compose für lokale Entwicklung
- Vorbereitung von Kubernetes-Manifesten
- Einrichtung einer CI/CD-Pipeline

### Sprint 11: Service-Aufteilung
- Definition der Service-Boundaries
- Aufteilung der gemeinsamen Codebasis in getrennte Dienste
- Isolation der Datenbanken pro Service
- Entwicklung von Schnittstellenverträgen

### Sprint 12: Resilienz und Fehlertoleranz
- Implementierung von Circuit Breaker für Service-Aufrufe
- Entwicklung von Retry-Mechanismen
- Einführung von Fallback-Strategien
- Integration von Distributed Tracing

## Erwartete Ergebnisse

Nach Abschluss der Phase 5 erwarten wir folgende Verbesserungen und Vorteile:

- Erfolgreiche unabhängige Bereitstellung aller Mikroservices
- Nahtlose Kommunikation zwischen Diensten auch bei Teilausfällen
- Automatisierte CI/CD-Pipeline mit unter 15 Minuten Durchlaufzeit
- Resilienz bei simulierten Ausfällen einzelner Dienste
- Verbesserte Skalierbarkeit durch unabhängige Skalierung einzelner Dienste
- Erhöhte Entwicklungsgeschwindigkeit durch parallele Teams

## Risiken und Mitigationsstrategien

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigationsstrategie |
|--------|-------------------|------------|---------------------|
| Erhöhte Komplexität durch verteiltes System | Hoch | Hoch | Umfassende Dokumentation und kontinuierliche Schulung |
| Netzwerklatenz zwischen Services | Hoch | Mittel | Optimierung der Service-Kommunikation und Caching |
| Fehler in der Service-Discovery | Mittel | Hoch | Robuste Fallback-Strategien und Monitoring |
| Inkonsistenzen bei verteilten Daten | Hoch | Hoch | Eventual Consistency-Modell und Event Sourcing |

## Ausblick auf zukünftige Entwicklungen

Nach erfolgreichem Abschluss der Phase 5 sind folgende weiterführende Entwicklungen geplant:

1. **Erweiterte Microservice-Funktionalitäten**:
   - Implementierung von CQRS (Command Query Responsibility Segregation)
   - Event Sourcing für robuste Datenverwaltung
   - Saga-Pattern für verteilte Transaktionen

2. **Erweiterte Infrastruktur**:
   - Multi-Cluster-Kubernetes-Setup für erhöhte Verfügbarkeit
   - Service Mesh (Istio/Linkerd) für erweiterte Netzwerkfunktionen
   - Automatisches Scaling basierend auf Metriken

3. **KI-Integration**:
   - Microservice für KI-basierte Analysen
   - Echtzeit-Anomalieerkennung
   - Vorhersagemodelle für Geschäftsprozesse

4. **Erweiterte Monitoring-Funktionen**:
   - Geschäftsprozess-Monitoring
   - Real-time Dashboards
   - Proaktive Alarmsysteme 