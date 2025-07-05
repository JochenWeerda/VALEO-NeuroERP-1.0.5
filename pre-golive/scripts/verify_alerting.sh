#!/bin/bash

# Konfiguration
PROMETHEUS_URL="http://prometheus:9090"
ALERTMANAGER_URL="http://alertmanager:9093"
GRAFANA_URL="http://grafana:3000"
NAMESPACE="valeo-staging"
RULES_FILE="prometheus-rules.yaml"

echo "Starting Monitoring & Alerting Validation..."
echo "Prometheus: $PROMETHEUS_URL"
echo "Alertmanager: $ALERTMANAGER_URL"
echo "Grafana: $GRAFANA_URL"

# Funktion zum Prüfen der API-Erreichbarkeit
check_api_health() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name health... "
    if curl -s -f "$url/-/healthy" > /dev/null; then
        echo "OK"
        return 0
    else
        echo "FAIL"
        return 1
    fi
}

# Funktion zum Prüfen der Prometheus-Regeln
check_prometheus_rules() {
    echo "Checking Prometheus rules..."
    local error_count=0
    
    # Regel-Syntax validieren
    echo -n "  - Rule syntax: "
    if promtool check rules $RULES_FILE; then
        echo "OK"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    # Aktive Regeln prüfen
    echo -n "  - Active rules: "
    local active_rules=$(curl -s $PROMETHEUS_URL/api/v1/rules | jq '.data.groups[].rules | length' | awk '{sum+=$1} END {print sum}')
    if [ "$active_rules" -gt 0 ]; then
        echo "OK ($active_rules rules)"
    else
        echo "FAIL (no active rules)"
        ((error_count++))
    fi
    
    return $error_count
}

# Funktion zum Prüfen der Alert-Konfiguration
check_alertmanager_config() {
    echo "Checking Alertmanager configuration..."
    local error_count=0
    
    # Konfiguration validieren
    echo -n "  - Config syntax: "
    if amtool check-config /etc/alertmanager/alertmanager.yml; then
        echo "OK"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    # Receiver prüfen
    echo -n "  - Receivers: "
    local receivers=$(curl -s $ALERTMANAGER_URL/api/v2/receivers | jq '. | length')
    if [ "$receivers" -gt 0 ]; then
        echo "OK ($receivers configured)"
    else
        echo "FAIL (no receivers)"
        ((error_count++))
    fi
    
    # Routing prüfen
    echo -n "  - Route tree: "
    if curl -s $ALERTMANAGER_URL/api/v2/status | jq -e '.config.route' > /dev/null; then
        echo "OK"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    return $error_count
}

# Funktion zum Prüfen der Service-Metriken
check_service_metrics() {
    local service=$1
    echo "Checking metrics for $service..."
    local error_count=0
    
    # Verfügbare Metriken zählen
    echo -n "  - Available metrics: "
    local metric_count=$(curl -s "$PROMETHEUS_URL/api/v1/targets/metadata" | jq --arg job "$service" '.data[] | select(.target.job==$job) | .metric' | wc -l)
    if [ "$metric_count" -gt 0 ]; then
        echo "OK ($metric_count metrics)"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    # Up-Metrik prüfen
    echo -n "  - Service up status: "
    local up_status=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=up{job=\"$service\"}" | jq '.data.result[0].value[1]')
    if [ "$up_status" = "1" ]; then
        echo "OK"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    return $error_count
}

# Funktion zum Prüfen der Grafana-Dashboards
check_grafana_dashboards() {
    echo "Checking Grafana dashboards..."
    local error_count=0
    
    # API-Token prüfen
    if [ -z "$GRAFANA_API_TOKEN" ]; then
        echo "WARN: GRAFANA_API_TOKEN not set"
        return 1
    fi
    
    # Dashboards auflisten
    echo -n "  - Dashboard count: "
    local dashboard_count=$(curl -s -H "Authorization: Bearer $GRAFANA_API_TOKEN" "$GRAFANA_URL/api/search" | jq '. | length')
    if [ "$dashboard_count" -gt 0 ]; then
        echo "OK ($dashboard_count dashboards)"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    # Datenquellen prüfen
    echo -n "  - Data sources: "
    local datasource_count=$(curl -s -H "Authorization: Bearer $GRAFANA_API_TOKEN" "$GRAFANA_URL/api/datasources" | jq '. | length')
    if [ "$datasource_count" -gt 0 ]; then
        echo "OK ($datasource_count sources)"
    else
        echo "FAIL"
        ((error_count++))
    fi
    
    return $error_count
}

# Funktion zum Simulieren eines Test-Alerts
test_alert_pipeline() {
    echo "Testing alert pipeline..."
    local test_alert="test_alert_$(date +%s)"
    
    # Test-Alert erstellen
    echo -n "  - Creating test alert: "
    curl -X POST "$PROMETHEUS_URL/api/v1/admin/tsdb/create_alert" \
        --data "{\"name\":\"$test_alert\",\"expr\":\"vector(1)\"}"
    echo "OK"
    
    # Auf Alert-Firing warten
    echo -n "  - Waiting for alert to fire: "
    local timeout=60
    local start_time=$(date +%s)
    
    while true; do
        if curl -s "$ALERTMANAGER_URL/api/v2/alerts" | jq -e --arg name "$test_alert" '.[] | select(.labels.alertname==$name)' > /dev/null; then
            echo "OK"
            break
        fi
        
        local current_time=$(date +%s)
        if [ $((current_time - start_time)) -gt $timeout ]; then
            echo "FAIL (timeout)"
            return 1
        fi
        sleep 2
    done
    
    # Alert-Benachrichtigung prüfen
    echo -n "  - Checking notification delivery: "
    if curl -s "$ALERTMANAGER_URL/api/v2/alerts" | jq -e --arg name "$test_alert" '.[] | select(.status.state=="active")' > /dev/null; then
        echo "OK"
    else
        echo "FAIL"
        return 1
    fi
    
    return 0
}

# Hauptprüfungen durchführen
echo -e "\n=== Running Checks ==="

WARN_COUNT=0
FAIL_COUNT=0

# API-Gesundheit prüfen
check_api_health "$PROMETHEUS_URL" "Prometheus" || ((FAIL_COUNT++))
check_api_health "$ALERTMANAGER_URL" "Alertmanager" || ((FAIL_COUNT++))
check_api_health "$GRAFANA_URL" "Grafana" || ((FAIL_COUNT++))

# Prometheus-Regeln prüfen
if ! check_prometheus_rules; then
    RULE_ERRORS=$?
    echo "FAIL: $RULE_ERRORS rule errors found"
    ((FAIL_COUNT++))
fi

# Alertmanager-Konfiguration prüfen
if ! check_alertmanager_config; then
    CONFIG_ERRORS=$?
    echo "FAIL: $CONFIG_ERRORS configuration errors found"
    ((FAIL_COUNT++))
fi

# Service-Metriken prüfen
SERVICES=(
    "excel-export-service"
    "cache-manager"
    "api-gateway"
    "failover-monitor"
    "auth-service"
)

for SERVICE in "${SERVICES[@]}"; do
    if ! check_service_metrics "$SERVICE"; then
        METRIC_ERRORS=$?
        echo "WARN: $METRIC_ERRORS metric errors found for $SERVICE"
        ((WARN_COUNT++))
    fi
done

# Grafana-Dashboards prüfen
if ! check_grafana_dashboards; then
    DASHBOARD_ERRORS=$?
    echo "WARN: $DASHBOARD_ERRORS dashboard errors found"
    ((WARN_COUNT++))
fi

# Alert-Pipeline testen
if ! test_alert_pipeline; then
    echo "FAIL: Alert pipeline test failed"
    ((FAIL_COUNT++))
fi

# Screenshots erstellen
echo -n "Capturing monitoring dashboard... "
if command -v chromium &> /dev/null; then
    chromium --headless --screenshot="monitoring_dashboard.png" "$GRAFANA_URL/d/main/valeo-neuroerp-monitoring"
    echo "OK"
else
    echo "WARN: Could not capture screenshots (chromium not installed)"
    ((WARN_COUNT++))
fi

# Metriken sammeln
echo -e "\n=== Monitoring Metrics ==="
TOTAL_ALERTS=$(curl -s "$PROMETHEUS_URL/api/v1/alerts" | jq '.data.alerts | length')
ACTIVE_ALERTS=$(curl -s "$ALERTMANAGER_URL/api/v2/alerts" | jq '. | length')
SILENCED_ALERTS=$(curl -s "$ALERTMANAGER_URL/api/v2/silences" | jq '. | length')

echo "Total Alert Rules: $TOTAL_ALERTS"
echo "Active Alerts: $ACTIVE_ALERTS"
echo "Silenced Alerts: $SILENCED_ALERTS"

# Zusammenfassung
echo -e "\n=== Summary ==="
echo "Warnings: $WARN_COUNT"
echo "Failures: $FAIL_COUNT"

# Status setzen
if [ $FAIL_COUNT -gt 0 ]; then
    echo "FAIL: Monitoring validation failed"
    exit 1
elif [ $WARN_COUNT -gt 0 ]; then
    echo "WARN: Monitoring validation completed with warnings"
    exit 0
else
    echo "OK: Monitoring validation successful"
    exit 0
fi 