#!/bin/bash

# Konfiguration
GITLAB_URL="https://gitlab.valeo-neuroerp.com"
GITLAB_TOKEN="your-token-here"  # Sollte über Umgebungsvariable gesetzt werden
PIPELINE_FILE=".gitlab-ci.yml"
PROJECT_ID="valeo-neuroerp"
VERSION="1.1.0"

echo "Starting CI/CD Pipeline Validation..."
echo "GitLab URL: $GITLAB_URL"
echo "Project: $PROJECT_ID"
echo "Version: $VERSION"

# GitLab CLI prüfen
if ! command -v gitlab &> /dev/null; then
    echo "FAIL: GitLab CLI not installed"
    exit 1
fi

# Pipeline-Datei prüfen
echo -n "Checking pipeline file... "
if [ ! -f "$PIPELINE_FILE" ]; then
    echo "FAIL: Pipeline file not found"
    exit 1
fi
echo "OK"

# Pipeline-Syntax validieren
echo -n "Validating pipeline syntax... "
if ! gitlab-ci-lint "$PIPELINE_FILE"; then
    echo "FAIL: Pipeline syntax validation failed"
    exit 1
fi
echo "OK"

# Funktion zum Prüfen der Pipeline-Stages
check_pipeline_stages() {
    local stages=(
        "test"
        "build"
        "scan"
        "push"
        "deploy"
        "notify"
    )
    
    echo "Checking pipeline stages..."
    local missing_stages=0
    
    for stage in "${stages[@]}"; do
        echo -n "  - $stage: "
        if grep -q "stage: $stage" "$PIPELINE_FILE"; then
            echo "OK"
        else
            echo "FAIL"
            ((missing_stages++))
        fi
    done
    
    return $missing_stages
}

# Funktion zum Prüfen der Pipeline-Jobs
check_pipeline_jobs() {
    local required_jobs=(
        "unit_tests"
        "integration_tests"
        "build_images"
        "security_scan"
        "push_images"
        "deploy_staging"
        "notify_slack"
    )
    
    echo "Checking pipeline jobs..."
    local missing_jobs=0
    
    for job in "${required_jobs[@]}"; do
        echo -n "  - $job: "
        if grep -q "^$job:" "$PIPELINE_FILE"; then
            echo "OK"
        else
            echo "FAIL"
            ((missing_jobs++))
        fi
    done
    
    return $missing_jobs
}

# Funktion zum Prüfen der Pipeline-Variablen
check_pipeline_variables() {
    local required_vars=(
        "CI_REGISTRY"
        "CI_REGISTRY_USER"
        "CI_REGISTRY_PASSWORD"
        "KUBE_CONFIG"
        "SLACK_WEBHOOK"
    )
    
    echo "Checking pipeline variables..."
    local missing_vars=0
    
    for var in "${required_vars[@]}"; do
        echo -n "  - $var: "
        if gitlab variable list -p $PROJECT_ID | grep -q "^$var"; then
            echo "OK"
        else
            echo "FAIL"
            ((missing_vars++))
        fi
    done
    
    return $missing_vars
}

# Funktion zum Prüfen der Pipeline-Berechtigungen
check_pipeline_permissions() {
    echo "Checking pipeline permissions..."
    local permission_errors=0
    
    # Registry-Zugriff
    echo -n "  - Registry access: "
    if gitlab runner list -p $PROJECT_ID | grep -q "docker"; then
        echo "OK"
    else
        echo "FAIL"
        ((permission_errors++))
    fi
    
    # Kubernetes-Zugriff
    echo -n "  - Kubernetes access: "
    if kubectl auth can-i get pods --all-namespaces; then
        echo "OK"
    else
        echo "FAIL"
        ((permission_errors++))
    fi
    
    # Slack-Webhook
    echo -n "  - Slack webhook: "
    if curl -s -f -I "$SLACK_WEBHOOK_URL" > /dev/null; then
        echo "OK"
    else
        echo "FAIL"
        ((permission_errors++))
    fi
    
    return $permission_errors
}

# Funktion zum Testen der Pipeline-Ausführung
test_pipeline_execution() {
    echo "Testing pipeline execution..."
    
    # Pipeline triggern
    echo -n "  - Triggering pipeline: "
    PIPELINE_ID=$(gitlab pipeline create -p $PROJECT_ID -r $VERSION)
    if [ -n "$PIPELINE_ID" ]; then
        echo "OK (ID: $PIPELINE_ID)"
    else
        echo "FAIL"
        return 1
    fi
    
    # Auf Pipeline-Abschluss warten
    echo -n "  - Waiting for pipeline completion: "
    local timeout=600  # 10 Minuten
    local start_time=$(date +%s)
    
    while true; do
        local status=$(gitlab pipeline show -p $PROJECT_ID -i $PIPELINE_ID -f status)
        
        case $status in
            "success")
                echo "OK"
                return 0
                ;;
            "failed"|"canceled")
                echo "FAIL"
                return 1
                ;;
            *)
                local current_time=$(date +%s)
                if [ $((current_time - start_time)) -gt $timeout ]; then
                    echo "FAIL (timeout)"
                    return 1
                fi
                sleep 10
                ;;
        esac
    done
}

# Hauptprüfungen durchführen
echo -e "\n=== Running Checks ==="

WARN_COUNT=0
FAIL_COUNT=0

# Stages prüfen
if ! check_pipeline_stages; then
    MISSING_STAGES=$?
    echo "FAIL: $MISSING_STAGES required stages missing"
    ((FAIL_COUNT++))
fi

# Jobs prüfen
if ! check_pipeline_jobs; then
    MISSING_JOBS=$?
    echo "FAIL: $MISSING_JOBS required jobs missing"
    ((FAIL_COUNT++))
fi

# Variablen prüfen
if ! check_pipeline_variables; then
    MISSING_VARS=$?
    echo "WARN: $MISSING_VARS required variables missing"
    ((WARN_COUNT++))
fi

# Berechtigungen prüfen
if ! check_pipeline_permissions; then
    PERMISSION_ERRORS=$?
    echo "FAIL: $PERMISSION_ERRORS permission errors found"
    ((FAIL_COUNT++))
fi

# Pipeline-Ausführung testen
if ! test_pipeline_execution; then
    echo "FAIL: Pipeline execution test failed"
    ((FAIL_COUNT++))
fi

# Pipeline-Metriken sammeln
echo -e "\n=== Pipeline Metrics ==="
TOTAL_PIPELINES=$(gitlab pipeline list -p $PROJECT_ID --per-page 1 | wc -l)
SUCCESS_RATE=$(gitlab pipeline list -p $PROJECT_ID --status success --per-page 100 | wc -l)
AVG_DURATION=$(gitlab pipeline list -p $PROJECT_ID --per-page 10 | awk '{sum+=$4} END {print sum/NR}')

echo "Total Pipelines: $TOTAL_PIPELINES"
echo "Success Rate: $SUCCESS_RATE%"
echo "Average Duration: ${AVG_DURATION}s"

# Zusammenfassung
echo -e "\n=== Summary ==="
echo "Warnings: $WARN_COUNT"
echo "Failures: $FAIL_COUNT"

# Status setzen
if [ $FAIL_COUNT -gt 0 ]; then
    echo "FAIL: CI/CD pipeline validation failed"
    exit 1
elif [ $WARN_COUNT -gt 0 ]; then
    echo "WARN: CI/CD pipeline validation completed with warnings"
    exit 0
else
    echo "OK: CI/CD pipeline validation successful"
    exit 0
fi 