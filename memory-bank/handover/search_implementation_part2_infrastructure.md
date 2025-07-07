# VALEO-NeuroERP: Erweiterte Suchfunktionalität - Teil 2: Infrastruktur & Monitoring

## 🔧 Infrastruktur & DevOps

### Kubernetes-Konfiguration

```yaml
# Search API Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: search-api
  namespace: valeo-search
spec:
  replicas: 3
  selector:
    matchLabels:
      app: search-api
  template:
    metadata:
      labels:
        app: search-api
    spec:
      containers:
      - name: search-api
        image: valeo/search-api:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: search-secrets
              key: mongodb-uri
        - name: REDIS_URI
          valueFrom:
            secretKeyRef:
              name: search-secrets
              key: redis-uri
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20

# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: search-api-hpa
  namespace: valeo-search
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: search-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

# Service Configuration
apiVersion: v1
kind: Service
metadata:
  name: search-api-service
  namespace: valeo-search
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: search-api

# Ingress Configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: search-api-ingress
  namespace: valeo-search
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: search.valeo-neuroerp.local
    http:
      paths:
      - path: /api/v1/search
        pathType: Prefix
        backend:
          service:
            name: search-api-service
            port:
              number: 80
```

### Monitoring-Stack

#### Prometheus-Konfiguration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'search-api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - valeo-search
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: search-api
        action: keep

  - job_name: 'search-metrics'
    static_configs:
      - targets: ['search-metrics:9090']
    metrics_path: '/metrics'
    scheme: 'http'

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['mongodb-exporter:9216']
```

#### Grafana-Dashboards

```json
{
  "dashboard": {
    "id": null,
    "title": "Search Performance Dashboard",
    "tags": ["search", "performance"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Search Latency",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(search_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th Percentile"
          }
        ]
      },
      {
        "title": "Search Throughput",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(search_requests_total[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "gauge",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(search_cache_hits_total[5m])) / sum(rate(search_cache_requests_total[5m])) * 100",
            "legendFormat": "Hit Rate %"
          }
        ]
      }
    ]
  }
}
```

### ELK-Stack-Konfiguration

#### Elasticsearch-Config

```yaml
cluster.name: valeo-search-logs
node.name: ${HOSTNAME}

network.host: 0.0.0.0
discovery.seed_hosts: ["elasticsearch-0.elasticsearch"]
cluster.initial_master_nodes: ["elasticsearch-0"]

xpack.security.enabled: true
xpack.monitoring.collection.enabled: true

path:
  data: /usr/share/elasticsearch/data
  logs: /usr/share/elasticsearch/logs

bootstrap.memory_lock: true

indices.query.bool.max_clause_count: 2048
search.max_buckets: 100000
```

#### Logstash-Pipeline

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  if [type] == "search_logs" {
    json {
      source => "message"
    }
    date {
      match => ["timestamp", "ISO8601"]
      target => "@timestamp"
    }
    mutate {
      add_field => {
        "environment" => "${ENV:production}"
      }
    }
  }
}

output {
  if [type] == "search_logs" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "search-logs-%{+YYYY.MM.dd}"
      user => "${ELASTIC_USER}"
      password => "${ELASTIC_PASSWORD}"
    }
  }
}
```

#### Kibana-Dashboard

```json
{
  "version": 1,
  "objects": [
    {
      "id": "search-analytics",
      "type": "dashboard",
      "attributes": {
        "title": "Search Analytics Dashboard",
        "hits": 0,
        "description": "Comprehensive search analytics and monitoring",
        "panelsJSON": "[{\"type\":\"visualization\",\"id\":\"search-volume\"},{\"type\":\"visualization\",\"id\":\"search-latency\"},{\"type\":\"visualization\",\"id\":\"error-rate\"}]",
        "optionsJSON": "{\"darkTheme\":false}",
        "version": 1,
        "timeRestore": false,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "{\"filter\":[],\"query\":{\"language\":\"lucene\",\"query\":\"\"}}"
        }
      }
    }
  ]
}
```

### Metriken-Definition

```python
METRICS = {
    "search_performance": {
        "request_duration_seconds": {
            "type": "Histogram",
            "description": "Search request duration in seconds",
            "buckets": [0.1, 0.5, 1.0, 2.0, 5.0]
        },
        "requests_total": {
            "type": "Counter",
            "description": "Total number of search requests"
        },
        "errors_total": {
            "type": "Counter",
            "description": "Total number of search errors",
            "labels": ["error_type"]
        }
    },
    "cache_performance": {
        "hits_total": {
            "type": "Counter",
            "description": "Total number of cache hits"
        },
        "misses_total": {
            "type": "Counter",
            "description": "Total number of cache misses"
        },
        "size_bytes": {
            "type": "Gauge",
            "description": "Current size of cache in bytes"
        }
    },
    "search_quality": {
        "relevance_score": {
            "type": "Histogram",
            "description": "Search result relevance scores",
            "buckets": [0.2, 0.4, 0.6, 0.8, 1.0]
        },
        "zero_results_total": {
            "type": "Counter",
            "description": "Searches with zero results"
        }
    }
}
```

### Alert-Regeln

```yaml
groups:
- name: search_alerts
  rules:
  - alert: HighSearchLatency
    expr: histogram_quantile(0.95, sum(rate(search_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High search latency detected"
      description: "95th percentile of search latency is above 2 seconds"

  - alert: HighErrorRate
    expr: sum(rate(search_errors_total[5m])) / sum(rate(search_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High search error rate"
      description: "Error rate is above 5%"

  - alert: LowCacheHitRate
    expr: sum(rate(search_cache_hits_total[5m])) / sum(rate(search_cache_requests_total[5m])) < 0.7
    for: 15m
    labels:
      severity: warning
    annotations:
      summary: "Low cache hit rate"
      description: "Cache hit rate is below 70%"

  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{container="search-api"} > 900000000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
      description: "Container is using more than 900MB of memory"
```

### Backup-Strategie

```yaml
backup:
  schedules:
    elasticsearch:
      full:
        frequency: "daily"
        retention: "30 days"
        time: "02:00 UTC"
      incremental:
        frequency: "hourly"
        retention: "7 days"
    
    mongodb:
      full:
        frequency: "daily"
        retention: "30 days"
        time: "03:00 UTC"
      oplog:
        frequency: "15 minutes"
        retention: "24 hours"
    
    redis:
      snapshot:
        frequency: "hourly"
        retention: "7 days"
      aof:
        enabled: true
        fsync: "everysec"

  storage:
    type: "S3"
    bucket: "valeo-search-backup"
    retention_policy:
      hot: "7 days"
      warm: "30 days"
      cold: "365 days"
    encryption:
      enabled: true
      type: "AES-256"

  validation:
    frequency: "daily"
    checks:
      - integrity
      - consistency
      - restoration_test
```

### Disaster Recovery

```yaml
dr_plan:
  rto: "4 hours"  # Recovery Time Objective
  rpo: "15 minutes"  # Recovery Point Objective
  
  procedures:
    service_failure:
      - step: "Identify affected components"
        timeout: "5 minutes"
      - step: "Switch to backup instance"
        timeout: "10 minutes"
      - step: "Verify data consistency"
        timeout: "15 minutes"
      - step: "Update DNS/routing"
        timeout: "5 minutes"
    
    data_corruption:
      - step: "Stop write operations"
        timeout: "1 minute"
      - step: "Identify corruption scope"
        timeout: "15 minutes"
      - step: "Restore from last valid backup"
        timeout: "60 minutes"
      - step: "Replay transaction logs"
        timeout: "30 minutes"
      - step: "Verify data integrity"
        timeout: "30 minutes"
    
    complete_failure:
      - step: "Activate DR site"
        timeout: "30 minutes"
      - step: "Update global DNS"
        timeout: "15 minutes"
      - step: "Verify all services"
        timeout: "30 minutes"
``` 