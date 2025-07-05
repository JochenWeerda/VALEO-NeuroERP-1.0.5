#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Konfiguration
REGISTRY="registry.valeo-neuroerp.com"
VERSION="1.1.0"
REPORT_FILE="../reports/image_report.md"

# Liste der Services
SERVICES=(
    "excel-export-service"
    "cache-manager"
    "api-gateway"
    "failover-monitor"
    "auth-service"
)

# Report-Header erstellen
cat > $REPORT_FILE << EOL
# Docker Image Validierungsbericht - VALEO-NeuroERP v${VERSION}

Erstellungsdatum: $(date '+%Y-%m-%d %H:%M:%S')

## Image-Übersicht

| Service | Status | Größe | Vulnerabilities | Registry |
|---------|--------|-------|----------------|----------|
EOL

# Registry-Login testen
echo "Testing registry access..."
if ! docker login $REGISTRY; then
    echo -e "${RED}❌ Registry login failed${NC}"
    exit 1
fi

# Images überprüfen
for SERVICE in "${SERVICES[@]}"; do
    echo -e "\n${YELLOW}Checking $SERVICE...${NC}"
    IMAGE="${REGISTRY}/${SERVICE}:${VERSION}"
    
    # Image pullen
    if docker pull $IMAGE; then
        SIZE=$(docker image inspect $IMAGE --format='{{.Size}}' | numfmt --to=iec-i)
        echo -e "${GREEN}✓ Image pulled successfully${NC}"
        PULL_STATUS="✅"
    else
        echo -e "${RED}❌ Failed to pull image${NC}"
        PULL_STATUS="❌"
        SIZE="N/A"
    fi
    
    # Trivy Scan durchführen
    if command -v trivy &> /dev/null; then
        VULN_COUNT=$(trivy image --quiet --severity HIGH,CRITICAL $IMAGE | grep -c "Total")
        VULN_STATUS="${VULN_COUNT} (High+Critical)"
    else
        VULN_STATUS="Scanner not found"
    fi
    
    # Report aktualisieren
    echo "| $SERVICE | $PULL_STATUS | $SIZE | $VULN_STATUS | $REGISTRY |" >> $REPORT_FILE
done

# Zusammenfassung
cat >> $REPORT_FILE << EOL

## Details

### Registry-Zugriff
- Registry: \`${REGISTRY}\`
- Login-Status: $(if docker login $REGISTRY &>/dev/null; then echo "✅"; else echo "❌"; fi)

### Sicherheits-Scan
- Scanner: Trivy
- Fokus: High & Critical Vulnerabilities
- Scan-Datum: $(date '+%Y-%m-%d')

### Empfehlungen
1. Images mit Vulnerabilities patchen
2. Große Images optimieren
3. Registry-Zugriffsrechte überprüfen

### Nächste Schritte
- [ ] Kritische Vulnerabilities beheben
- [ ] Image-Größen optimieren
- [ ] Registry-Backup erstellen
- [ ] Deployment-Skripte aktualisieren
EOL

echo -e "\n${GREEN}Report generated: $REPORT_FILE${NC}" 