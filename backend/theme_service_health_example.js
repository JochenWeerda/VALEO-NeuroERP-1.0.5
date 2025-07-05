/**
 * Beispiel-Implementierung eines Health-Endpunkts für den Theme-Service
 * Zur Integration mit dem Observer-Service
 */

const express = require('express');
const os = require('os');
const process = require('process');

// Metrik-Sammlung für den Service
class MetricsCollector {
  constructor() {
    this.requestCount = 0;
    this.responseTimes = [];
    this.maxResponseTimeHistory = 100;
    this.startTime = Date.now();
  }

  // Neuen Request zählen
  trackRequest() {
    this.requestCount++;
  }

  // Antwortzeit tracken
  trackResponseTime(timeMs) {
    this.responseTimes.push(timeMs);
    
    // Begrenze die Größe des Arrays
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }
  }

  // Durchschnittliche Antwortzeit berechnen
  getAverageResponseTime() {
    if (this.responseTimes.length === 0) return 0;
    
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  // CPU-Nutzung des Prozesses ermitteln
  getCpuUsagePercent() {
    const cpuUsage = process.cpuUsage();
    // Vereinfachte Berechnung - in Produktion besser mit einem Monitoring-Agent
    return ((cpuUsage.user + cpuUsage.system) / 1000000) * 100;
  }

  // Speichernutzung des Prozesses ermitteln
  getMemoryUsagePercent() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    return (memoryUsage.rss / totalMemory) * 100;
  }

  // Laufzeit in Sekunden ermitteln
  getUptimeSeconds() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

// Erstelle eine Instanz des MetricsCollector
const metricsCollector = new MetricsCollector();

// Express-Router für den Health-Endpunkt
function createHealthRouter() {
  const router = express.Router();
  
  // Health-Endpunkt gemäß Observer-Spezifikation
  router.get('/health', (req, res) => {
    // Request tracken
    metricsCollector.trackRequest();
    
    // Antwortzeit für diesen Request messen
    const startTime = process.hrtime();
    
    // Response vorbereiten
    const response = {
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: metricsCollector.getUptimeSeconds(),
      metrics: {
        cpu_usage_percent: parseFloat(metricsCollector.getCpuUsagePercent().toFixed(2)),
        memory_usage_percent: parseFloat(metricsCollector.getMemoryUsagePercent().toFixed(2)),
        request_count: metricsCollector.requestCount,
        average_response_time_ms: parseFloat(metricsCollector.getAverageResponseTime().toFixed(2)),
        database_connections: 0, // Theme-Service hat keine DB-Verbindungen
        queue_size: 0
      }
    };
    
    // Antwort senden
    res.json(response);
    
    // Antwortzeit messen und tracken
    const hrend = process.hrtime(startTime);
    const responseTimeMs = hrend[0] * 1000 + hrend[1] / 1000000;
    metricsCollector.trackResponseTime(responseTimeMs);
  });
  
  return router;
}

// Middleware zur Zeitmessung für alle Anfragen
function responseTimeMiddleware(req, res, next) {
  const startTime = process.hrtime();
  
  // Wenn die Antwort gesendet wird, die Zeit messen
  res.on('finish', () => {
    const hrend = process.hrtime(startTime);
    const responseTimeMs = hrend[0] * 1000 + hrend[1] / 1000000;
    
    // Nur reguläre API-Anfragen (nicht den Health-Check selbst) tracken
    if (req.path !== '/health') {
      metricsCollector.trackRequest();
      metricsCollector.trackResponseTime(responseTimeMs);
    }
  });
  
  next();
}

// Beispiel für die Verwendung in einer Express-App
/*
const app = express();

// Response-Zeit-Middleware für alle Anfragen
app.use(responseTimeMiddleware);

// Health-Endpunkt einbinden
app.use('/', createHealthRouter());

// Weitere Theme-Service-Routen...
app.use('/api/themes', themesRouter);

// Server starten
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Theme-Service läuft auf http://localhost:${PORT}`);
  console.log(`Health-Endpunkt verfügbar unter: http://localhost:${PORT}/health`);
});
*/

module.exports = {
  createHealthRouter,
  responseTimeMiddleware,
  metricsCollector
}; 