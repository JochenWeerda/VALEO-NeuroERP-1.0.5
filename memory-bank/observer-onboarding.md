# Observer-Integration: Onboarding-Guide für neue Microservices

## Übersicht

Dieses Dokument bietet eine umfassende Anleitung für die Integration neuer Microservices mit dem Observer-System. Der Observer-Microservice überwacht die Leistung und Zuverlässigkeit aller Dienste im AI-gesteuerten ERP-System und ermöglicht eine kontinuierliche Optimierung.

## 1. Health-Endpunkt implementieren

### Anforderungen

Jeder Microservice MUSS einen `/health`-Endpunkt implementieren, der den folgenden JSON-Rückgabewert bereitstellt:

```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2024-07-15T12:00:00Z",
  "uptime_seconds": 3600,
  "metrics": {
    "cpu_usage_percent": 12.5,
    "memory_usage_percent": 35.8,
    "request_count": 1254,
    "average_response_time_ms": 48.2,
    "database_connections": 5,
    "queue_size": 0
  }
}
```

### Implementierungsbeispiele

#### Python (FastAPI/Starlette)

```python
import psutil
import time
from datetime import datetime
from fastapi import APIRouter, FastAPI

router = APIRouter()

@router.get("/health")
async def health_check():
    # CPU und Speichernutzung des aktuellen Prozesses
    current_process = psutil.Process()
    cpu_usage = current_process.cpu_percent(interval=0.1)
    memory_percent = current_process.memory_percent()
    
    # Laufzeit berechnen
    uptime_seconds = time.time() - current_process.create_time()
    
    # API-Statistiken (in echten Services aus Metriken holen)
    request_count = 1254  # Beispielwert
    avg_response_time = 48.2  # Beispielwert in ms
    
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": int(uptime_seconds),
        "metrics": {
            "cpu_usage_percent": round(cpu_usage, 2),
            "memory_usage_percent": round(memory_percent, 2),
            "request_count": request_count,
            "average_response_time_ms": avg_response_time,
            "database_connections": 5,
            "queue_size": 0
        }
    }

# In der Hauptanwendung einbinden
app = FastAPI()
app.include_router(router)
```

#### Node.js (Express)

```javascript
const express = require('express');
const os = require('os');
const process = require('process');

const router = express.Router();

// Health-Endpunkt
router.get('/health', (req, res) => {
  const startTime = process.uptime();
  
  // Speichernutzung
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const memoryPercent = (memoryUsage.rss / totalMemory) * 100;
  
  // CPU-Nutzung (vereinfacht - in Produktion einen Monitoring-Agent verwenden)
  const cpuUsage = process.cpuUsage();
  const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) * 100;
  
  // API-Statistiken (in echten Services aus Metriken holen)
  const requestCount = 1254;  // Beispielwert
  const avgResponseTime = 48.2;  // Beispielwert in ms
  
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    metrics: {
      cpu_usage_percent: parseFloat(cpuPercent.toFixed(2)),
      memory_usage_percent: parseFloat(memoryPercent.toFixed(2)),
      request_count: requestCount,
      average_response_time_ms: avgResponseTime,
      database_connections: 5,
      queue_size: 0
    }
  });
});

// In der Hauptanwendung einbinden
const app = express();
app.use('/', router);
```

## 2. Observer-Konfiguration aktualisieren

Nach der Implementierung des Health-Endpunkts muss der neue Service in der `observer_config.json` registriert werden:

```json
{
  "services": {
    "my_new_service": {
      "name": "Mein Neuer Microservice",
      "url": "http://localhost:PORT/health",
      "process_name": "node",
      "process_args": "my_service.js",
      "threshold_cpu": 70,
      "threshold_memory": 70,
      "threshold_response": 0.5
    }
  }
}
```

## 3. Performance-Schwellwerte definieren

Für jeden Microservice gelten die folgenden Standard-Schwellwerte:

| Metrik | Warnung | Kritisch | Beschreibung |
|--------|---------|----------|--------------|
| CPU-Auslastung | 70% | 85% | Prozessor-Auslastung des Service-Prozesses |
| Speichernutzung | 75% | 90% | RAM-Auslastung des Service-Prozesses |
| Antwortzeit | 300ms | 500ms | Durchschnittliche Zeit für API-Antworten |

Diese Schwellwerte können in der Konfiguration für jeden Service individuell angepasst werden.

## 4. Monitoring-Dashboard nutzen

Nach erfolgreicher Integration ist der neue Service im Observer-Dashboard sichtbar:

- **URL**: http://localhost:8010
- **Metriken**: Echtzeit-Überwachung von CPU, RAM und Latenzzeiten
- **Optimierungsberichte**: Automatisch generierte Berichte alle 15 Minuten

## 5. Tipps zur Performance-Optimierung

1. **Frühzeitige Optimierung**: Nutzen Sie den Observer bereits während der Entwicklung
2. **Eigene Metriken**: Erweitern Sie den Health-Endpunkt um service-spezifische Metriken
3. **Alarme einrichten**: Konfigurieren Sie E-Mail-Benachrichtigungen für kritische Ereignisse
4. **Trennung von Ressourcen**: Vermeiden Sie gemeinsame Ressourcennutzung zwischen Services
5. **Horizontale Skalierung**: Planen Sie von Anfang an für horizontale Skalierbarkeit

## 6. Integration in CI/CD-Pipeline

Jede CI/CD-Pipeline sollte Performance-Tests enthalten:

1. Starten Sie den Observer-Service in der Test-Umgebung
2. Führen Sie Last- und Performance-Tests durch
3. Prüfen Sie die Metriken gegen definierte Schwellwerte
4. Lehnen Sie Pull-Requests ab, die kritische Schwellwerte überschreiten

## 7. Fehlersuche

Bei Problemen mit der Observer-Integration:

1. Prüfen Sie die Erreichbarkeit des Health-Endpunkts mit `curl http://localhost:PORT/health`
2. Überprüfen Sie das JSON-Format auf Kompatibilität
3. Stellen Sie sicher, dass der Prozess eindeutig identifizierbar ist
4. Konsultieren Sie die Observer-Logs in `observer.log` und `optimizer.log`

## Unterstützung

Bei Fragen zur Integration wenden Sie sich an das DevOps-Team oder erstellen Sie ein Issue im internen Issue-Tracker.

---

*Dokument erstellt: Juli 2024* 