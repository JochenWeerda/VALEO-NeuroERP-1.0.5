# Service Discovery Implementierung

## Überblick
Die Service Discovery wurde mit Consul implementiert, um eine robuste und skalierbare Microservices-Architektur zu gewährleisten.

## Komponenten

### 1. Consul Server
- Konfiguration in `config/consul/server.json`
- Single-Node Setup für Development
- ACL System aktiviert
- Prometheus Metriken Integration

### 2. Consul Service
- Implementiert in `backend/services/consul/consul_service.py`
- Asynchrone Service Registration/Deregistration
- Health Check Management
- KV Store Operationen

## Features

### Service Registration
```python
await consul_service.register_service(
    service_name="finance-service",
    service_port=8001,
    tags=["finance", "v1"]
)
```

### Health Checks
- HTTP Health Checks
- Intervall: 10 Sekunden
- Timeout: 5 Sekunden

### KV Store
- Konfigurationsdaten
- Feature Flags
- Distributed Locking

## Security

### ACL System
- Token-basierte Authentifizierung
- Default Deny Policy
- Token Persistence aktiviert

### TLS
- TLS für alle Consul Kommunikation
- Automatische Zertifikatrotation
- Strict Transport Security

## Monitoring

### Prometheus Integration
- Metriken Exposition
- 24h Retention
- Custom Labels

### Logging
- Strukturiertes Logging
- Log Level: INFO
- Performance Metriken

## Deployment

### Voraussetzungen
- Consul Binary >= 1.9.0
- Mindestens 2GB RAM
- Persistenter Storage

### Installation
1. Consul Binary installieren
2. Server Konfiguration kopieren
3. Service starten
4. ACL Bootstrap durchführen

### Skalierung
- Multi-Node Setup möglich
- Automatische Leader Election
- Cross-DC Replikation unterstützt 