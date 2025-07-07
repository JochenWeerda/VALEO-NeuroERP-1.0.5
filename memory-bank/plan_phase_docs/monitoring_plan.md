# Monitoring- und Observability-Plan

## Monitoring-Stack

### Prometheus-Konfiguration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'valeo-neuroerp'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scheme: 'http'
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']
```

### Grafana-Dashboards

#### System-Overview
```json
{
  "dashboard": {
    "id": null,
    "title": "VALEO-NeuroERP System Overview",
    "tags": ["overview", "system"],
    "timezone": "browser",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(process_cpu_seconds_total[5m])",
            "legendFormat": "CPU Usage"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "process_resident_memory_bytes",
            "legendFormat": "Memory Usage"
          }
        ]
      }
    ]
  }
}
```

#### API-Performance
```json
{
  "dashboard": {
    "id": null,
    "title": "API Performance",
    "tags": ["api", "performance"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Response Time",
        "type": "heatmap",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_bucket[5m])",
            "legendFormat": "{{method}} {{path}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5.*\"}[5m])) by (status)",
            "legendFormat": "{{status}}"
          }
        ]
      }
    ]
  }
}
```

## Logging-System

### ELK-Stack-Konfiguration

#### Logstash-Pipeline
```yaml
input {
  beats {
    port => 5044
  }
}

filter {
  if [type] == "application" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
      target => "@timestamp"
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "valeo-neuroerp-%{+YYYY.MM.dd}"
  }
}
```

#### Elasticsearch-Template
```json
{
  "index_patterns": ["valeo-neuroerp-*"],
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "message": { "type": "text" },
      "trace_id": { "type": "keyword" },
      "span_id": { "type": "keyword" }
    }
  }
}
```

## Tracing-System

### Jaeger-Konfiguration
```yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: valeo-neuroerp-jaeger
spec:
  strategy: production
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: http://elasticsearch:9200
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress-class: nginx
    hosts:
      - jaeger.valeo-neuroerp.local
```

### OpenTelemetry-Integration
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

def setup_tracing():
    trace.set_tracer_provider(TracerProvider())
    jaeger_exporter = JaegerExporter(
        agent_host_name="localhost",
        agent_port=6831,
    )
    span_processor = BatchSpanProcessor(jaeger_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
```

## Alert-System

### Alert-Regeln
```yaml
groups:
  - name: valeo-neuroerp
    rules:
      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage detected
          
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 1.5e9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage detected
          
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.*"}[5m])) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
```

### Alertmanager-Konfiguration
```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'team-email'
  
receivers:
  - name: 'team-email'
    email_configs:
      - to: 'team@valeo-neuroerp.com'
        from: 'alertmanager@valeo-neuroerp.com'
        smarthost: 'smtp.valeo-neuroerp.com:587'
        auth_username: 'alertmanager'
        auth_password: '{{ .Values.smtp.password }}'
```

## Metriken-Sammlung

### Application-Metrics
```typescript
interface ApplicationMetrics {
  performance: {
    responseTime: Histogram;
    throughput: Counter;
    errorRate: Counter;
    saturation: Gauge;
  };
  business: {
    activeUsers: Gauge;
    transactions: Counter;
    revenue: Counter;
    errors: Counter;
  };
  system: {
    cpu: Gauge;
    memory: Gauge;
    disk: Gauge;
    network: Gauge;
  }
}
```

### Custom-Metrics
```python
from prometheus_client import Counter, Histogram, Gauge

# Business Metrics
transaction_counter = Counter(
    'business_transactions_total',
    'Total number of business transactions',
    ['type', 'status']
)

revenue_counter = Counter(
    'business_revenue_total',
    'Total revenue in cents',
    ['product', 'currency']
)

# Performance Metrics
response_time = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.1, 0.3, 0.5, 0.7, 1, 2, 5]
)

active_users = Gauge(
    'active_users_total',
    'Total number of currently active users'
)
```

## Dashboard-Templates

### Performance-Dashboard
```typescript
interface PerformanceDashboard {
  panels: {
    responseTime: {
      title: "API Response Time";
      type: "heatmap";
      metrics: ["http_request_duration_seconds"];
    };
    errorRate: {
      title: "Error Rate";
      type: "graph";
      metrics: ["http_requests_total{status=~\"5.*\"}"];
    };
    throughput: {
      title: "Requests per Second";
      type: "graph";
      metrics: ["http_requests_total"];
    };
    saturation: {
      title: "System Load";
      type: "gauge";
      metrics: ["system_load_average_1m"];
    };
  }
}
```

### Business-Dashboard
```typescript
interface BusinessDashboard {
  panels: {
    activeUsers: {
      title: "Active Users";
      type: "stat";
      metrics: ["active_users_total"];
    };
    revenue: {
      title: "Revenue";
      type: "graph";
      metrics: ["business_revenue_total"];
    };
    transactions: {
      title: "Transactions";
      type: "graph";
      metrics: ["business_transactions_total"];
    };
    errors: {
      title: "Business Errors";
      type: "table";
      metrics: ["business_errors_total"];
    };
  }
}
```

## Health-Checks

### Endpoint-Definitionen
```typescript
interface HealthChecks {
  endpoints: {
    '/health': {
      checks: ['database', 'cache', 'queue'];
      timeout: 5000;
    };
    '/health/live': {
      checks: ['server'];
      timeout: 1000;
    };
    '/health/ready': {
      checks: ['database', 'cache', 'queue', 'dependencies'];
      timeout: 5000;
    };
  }
}
```

### Check-Implementierung
```python
from typing import Dict, List

class HealthCheck:
    async def check_database(self) -> Dict[str, bool]:
        try:
            await db.execute("SELECT 1")
            return {"database": True}
        except Exception:
            return {"database": False}
    
    async def check_cache(self) -> Dict[str, bool]:
        try:
            await redis.ping()
            return {"cache": True}
        except Exception:
            return {"cache": False}
    
    async def check_queue(self) -> Dict[str, bool]:
        try:
            await rabbitmq.check_connection()
            return {"queue": True}
        except Exception:
            return {"queue": False}
    
    async def check_all(self) -> Dict[str, bool]:
        results = await asyncio.gather(
            self.check_database(),
            self.check_cache(),
            self.check_queue()
        )
        return {k: v for d in results for k, v in d.items()} 