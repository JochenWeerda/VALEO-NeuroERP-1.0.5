#!/bin/bash

# Konfiguration
NAMESPACE="valeo-staging"
BASE_URL="http://api-gateway.$NAMESPACE.svc.cluster.local:8000"
DURATION="5m"
VUS=50  # Virtual Users
VUS_MAX=100
TEST_FILE="k6_test.js"

echo "Starting k6 Load Tests..."
echo "Target: $BASE_URL"
echo "Duration: $DURATION"
echo "Virtual Users: $VUS (max: $VUS_MAX)"

# k6 Installation prüfen
if ! command -v k6 &> /dev/null; then
    echo "FAIL: k6 is not installed"
    exit 1
fi

# k6 Testskript erstellen
cat > $TEST_FILE << EOL
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Metriken definieren
const failureRate = new Rate('failed_requests');

// Testkonfiguration
export const options = {
    stages: [
        { duration: '1m', target: ${VUS} },      // Ramping up
        { duration: '3m', target: ${VUS} },      // Steady load
        { duration: '1m', target: ${VUS_MAX} },  // Peak load
    ],
    thresholds: {
        'failed_requests': ['rate<0.1'],  // weniger als 10% Fehler
        'http_req_duration': ['p(95)<500'],  // 95% der Requests unter 500ms
        'http_reqs': ['rate>100'],  // mindestens 100 RPS
    },
};

// Hilfsfunktion für Token-Generierung
function getAuthToken() {
    const loginRes = http.post(\`\${__ENV.BASE_URL}/auth/login\`, {
        username: 'test_user',
        password: 'test_pass',
    });
    return loginRes.json('token');
}

// Haupttestfunktion
export default function() {
    const token = getAuthToken();
    const headers = {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json',
    };

    // Test 1: Auth-Service
    {
        const res = http.get(\`\${__ENV.BASE_URL}/auth/verify\`, { headers });
        check(res, {
            'auth-verify-status-200': (r) => r.status === 200,
        });
        failureRate.add(res.status !== 200);
        sleep(1);
    }

    // Test 2: Excel-Export
    {
        const res = http.post(\`\${__ENV.BASE_URL}/excel/generate\`, {
            data: { test: 'data' }
        }, { headers });
        check(res, {
            'excel-export-status-200': (r) => r.status === 200,
        });
        failureRate.add(res.status !== 200);
        sleep(1);
    }

    // Test 3: Cache-Manager
    {
        const res = http.get(\`\${__ENV.BASE_URL}/cache/status\`, { headers });
        check(res, {
            'cache-status-200': (r) => r.status === 200,
        });
        failureRate.add(res.status !== 200);
        sleep(1);
    }

    // Test 4: Failover-Monitor
    {
        const res = http.get(\`\${__ENV.BASE_URL}/monitor/status\`, { headers });
        check(res, {
            'monitor-status-200': (r) => r.status === 200,
        });
        failureRate.add(res.status !== 200);
        sleep(1);
    }

    // Test 5: API-Gateway Routes
    {
        const res = http.get(\`\${__ENV.BASE_URL}/routes\`, { headers });
        check(res, {
            'routes-status-200': (r) => r.status === 200,
        });
        failureRate.add(res.status !== 200);
        sleep(1);
    }
}
EOL

# Prometheus-Exporter starten (falls nicht vorhanden)
if ! pgrep -f "k6-prometheus-exporter" > /dev/null; then
    echo -n "Starting Prometheus exporter... "
    k6-prometheus-exporter &
    echo "OK"
fi

# Grafana-Dashboard aktualisieren
echo -n "Updating Grafana dashboard... "
if curl -X POST http://grafana:3000/api/dashboards/db -H "Content-Type: application/json" -d @k6-dashboard.json; then
    echo "OK"
else
    echo "WARN: Could not update Grafana dashboard"
fi

# k6 Test ausführen
echo "Running k6 tests..."
k6 run \
    --out json=test_results.json \
    --out prometheus \
    --tag testid=pre-golive-final \
    --env BASE_URL=$BASE_URL \
    $TEST_FILE

# Testergebnisse analysieren
echo -e "\n=== Test Results ==="

# JSON-Ergebnisse parsen
TOTAL_REQS=$(jq '.metrics.http_reqs.values.count' test_results.json)
AVG_DURATION=$(jq '.metrics.http_req_duration.values.avg' test_results.json)
P95_DURATION=$(jq '.metrics.http_req_duration.values."p(95)"' test_results.json)
ERROR_RATE=$(jq '.metrics.failed_requests.values.rate' test_results.json)
RPS=$(echo "$TOTAL_REQS / ($DURATION * 60)" | bc -l)

echo "Total Requests: $TOTAL_REQS"
echo "Average Duration: ${AVG_DURATION}ms"
echo "P95 Duration: ${P95_DURATION}ms"
echo "Error Rate: ${ERROR_RATE}%"
echo "RPS: $RPS"

# Screenshots erstellen
echo -n "Capturing performance graphs... "
if command -v chromium &> /dev/null; then
    chromium --headless --screenshot="k6_graph.png" http://grafana:3000/d/k6/k6-load-testing-results
    echo "OK"
else
    echo "WARN: Could not capture screenshots (chromium not installed)"
fi

# Schwellwerte prüfen
WARN_COUNT=0
FAIL_COUNT=0

# RPS-Check
if (( $(echo "$RPS < 100" | bc -l) )); then
    echo "FAIL: RPS below threshold (100)"
    ((FAIL_COUNT++))
fi

# Latenz-Check
if (( $(echo "$P95_DURATION > 500" | bc -l) )); then
    echo "WARN: P95 latency above threshold (500ms)"
    ((WARN_COUNT++))
fi

# Fehlerrate-Check
if (( $(echo "$ERROR_RATE > 10" | bc -l) )); then
    echo "FAIL: Error rate above threshold (10%)"
    ((FAIL_COUNT++))
elif (( $(echo "$ERROR_RATE > 5" | bc -l) )); then
    echo "WARN: Error rate above warning threshold (5%)"
    ((WARN_COUNT++))
fi

# Zusammenfassung
echo -e "\n=== Summary ==="
echo "Warnings: $WARN_COUNT"
echo "Failures: $FAIL_COUNT"

# Status setzen
if [ $FAIL_COUNT -gt 0 ]; then
    echo "FAIL: Performance issues found"
    exit 1
elif [ $WARN_COUNT -gt 0 ]; then
    echo "WARN: Performance warnings found"
    exit 0
else
    echo "OK: All performance tests passed"
    exit 0
fi 