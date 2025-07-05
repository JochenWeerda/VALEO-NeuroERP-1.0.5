#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Konfiguration
WORKSPACE_ROOT=$(pwd)
LOG_DIR="$WORKSPACE_ROOT/pre-golive/logs"
REPORT_DIR="$WORKSPACE_ROOT/pre-golive/reports"
FINAL_REPORT="$REPORT_DIR/golive_readiness_final.md"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx/yyy/zzz"

# Verzeichnisse erstellen
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"

# Initialisiere Final Report
cat > "$FINAL_REPORT" << EOL
# GoLive Readiness Report - VALEO-NeuroERP v1.1.0

Erstellungsdatum: $(date '+%Y-%m-%d %H:%M:%S')

## Pipeline-Status

| Pipeline | Status | Warnungen | Metriken |
|----------|--------|-----------|----------|
EOL

# Funktion für Slack-Benachrichtigungen
send_slack_notification() {
    local status=$1
    local message=$2
    local color=""
    
    case $status in
        "OK") color="#36a64f" ;;
        "WARN") color="#ffd700" ;;
        "FAIL") color="#ff0000" ;;
    esac
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"attachments\": [
                {
                    \"color\": \"$color\",
                    \"title\": \"VALEO-NeuroERP v1.1.0 - PRE-GOLIVE-FINAL-RUN\",
                    \"text\": \"$message\",
                    \"footer\": \"Pipeline Status Update\"
                }
            ]
        }" $SLACK_WEBHOOK_URL
}

# Funktion zum Ausführen einer Pipeline
run_pipeline() {
    local pipeline_id=$1
    local task_name=$2
    local script_name=$3
    local log_file="$LOG_DIR/${pipeline_id}_log.txt"
    local report_file="$REPORT_DIR/report_${pipeline_id}.md"
    local status="FAIL"
    local warnings=0
    local metrics=""
    
    echo -e "\n${YELLOW}Starte Pipeline $pipeline_id: $task_name${NC}"
    
    # Skript ausführen und Output loggen
    if bash "pre-golive/scripts/$script_name" > "$log_file" 2>&1; then
        # Warnungen zählen
        warnings=$(grep -c "WARN" "$log_file")
        
        # Status basierend auf Warnungen setzen
        if [ $warnings -eq 0 ]; then
            status="OK"
        else
            status="WARN"
        fi
        
        # Metriken extrahieren (pipeline-spezifisch)
        case $pipeline_id in
            "P1")
                metrics=$(grep "Image Size:" "$log_file" | wc -l)
                ;;
            "P2")
                metrics=$(grep "Health Check:" "$log_file" | grep "OK" | wc -l)
                ;;
            "P3")
                metrics=$(grep "RPS:" "$log_file" | tail -n1 | cut -d' ' -f2)
                ;;
            "P4")
                metrics=$(grep "Pipeline Duration:" "$log_file" | cut -d' ' -f3)
                ;;
            "P5")
                metrics=$(grep "Active Alerts:" "$log_file" | cut -d' ' -f3)
                ;;
        esac
    fi
    
    # Report für diese Pipeline erstellen
    cat > "$report_file" << EOL
# Pipeline Report: $pipeline_id - $task_name

## Status: $status
- Ausführungszeitpunkt: $(date '+%Y-%m-%d %H:%M:%S')
- Warnungen: $warnings
- Metriken: $metrics

## Details

\`\`\`
$(tail -n 20 "$log_file")
\`\`\`

## Ressourcenverbrauch
$(top -b -n 1 | head -n 5)

EOL
    
    # Screenshots anhängen (falls vorhanden)
    case $pipeline_id in
        "P3")
            echo -e "\n## Performance-Graph\n![k6-Graph](../screenshots/k6_graph.png)" >> "$report_file"
            ;;
        "P5")
            echo -e "\n## Monitoring-Dashboard\n![Grafana](../screenshots/grafana_dashboard.png)" >> "$report_file"
            ;;
    esac
    
    # Final Report aktualisieren
    echo "| $pipeline_id | $status | $warnings | $metrics |" >> "$FINAL_REPORT"
    
    # Slack-Benachrichtigung senden
    send_slack_notification "$status" "Pipeline $pipeline_id ($task_name) abgeschlossen: $status"
    
    # Status zurückgeben
    echo "$status"
}

# Pipelines parallel ausführen
echo "Starte PRE-GOLIVE-FINAL-RUN..."

declare -A pipeline_status

# Pipelines im Hintergrund starten
run_pipeline "P1" "Image Registry Validierung" "check_images.sh" & pid1=$!
run_pipeline "P2" "Staging Deployment & Health Check" "deploy_staging.sh" & pid2=$!
run_pipeline "P3" "k6 Lasttest mit Metriken" "run_loadtest.sh" & pid3=$!
run_pipeline "P4" "CI/CD-Pipeline Validierung" "validate_cicd.sh" & pid4=$!
run_pipeline "P5" "Monitoring + Alerts validieren" "verify_alerting.sh" & pid5=$!

# Auf Abschluss aller Pipelines warten
wait $pid1 $pid2 $pid3 $pid4 $pid5

# Final Report abschließen
cat >> "$FINAL_REPORT" << EOL

## Zusammenfassung

Gesamtstatus: $(if grep -q "FAIL" "$FINAL_REPORT"; then echo "❌ FAIL"; elif grep -q "WARN" "$FINAL_REPORT"; then echo "⚠️ WARN"; else echo "✅ OK"; fi)

### Nächste Schritte

$(if grep -q "FAIL\|WARN" "$FINAL_REPORT"; then
    echo "1. Identifizierte Probleme beheben"
    echo "2. Betroffene Pipelines neu ausführen"
    echo "3. Final Report aktualisieren"
else
    echo "✅ Alle Checks erfolgreich - Bereit für DEPLOYMENT-PROD"
fi)

## Validierungsdetails

$(for p in P1 P2 P3 P4 P5; do
    echo "### $p"
    cat "$REPORT_DIR/report_${p}.md"
    echo
done)

EOL

# Finale Slack-Benachrichtigung
if grep -q "FAIL" "$FINAL_REPORT"; then
    send_slack_notification "FAIL" "PRE-GOLIVE-FINAL-RUN abgeschlossen mit Fehlern. Siehe $FINAL_REPORT"
    exit 1
elif grep -q "WARN" "$FINAL_REPORT"; then
    send_slack_notification "WARN" "PRE-GOLIVE-FINAL-RUN abgeschlossen mit Warnungen. Siehe $FINAL_REPORT"
    exit 0
else
    send_slack_notification "OK" "PRE-GOLIVE-FINAL-RUN erfolgreich abgeschlossen. Bereit für DEPLOYMENT-PROD"
    # Trigger next phase
    echo "DEPLOYMENT-PROD" > "$WORKSPACE_ROOT/next_phase.txt"
    exit 0
fi 