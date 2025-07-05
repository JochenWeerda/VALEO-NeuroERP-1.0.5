#!/bin/bash

# Konfiguration
REGISTRY="registry.valeo-neuroerp.com"
VERSION="1.1.0"
SERVICES=(
    "excel-export-service"
    "cache-manager"
    "api-gateway"
    "failover-monitor"
    "auth-service"
)

echo "Starting Image Registry Validation..."
echo "Registry: $REGISTRY"
echo "Version: $VERSION"

# Registry-Login testen
echo -n "Testing registry access... "
if ! docker login $REGISTRY; then
    echo "FAIL: Registry login failed"
    exit 1
fi
echo "OK"

# Funktion zum Überprüfen der Image-Größe
check_image_size() {
    local image=$1
    local size=$(docker image inspect $image --format='{{.Size}}' | numfmt --to=iec-i)
    local size_bytes=$(docker image inspect $image --format='{{.Size}}')
    
    echo "Image Size: $size"
    
    # Warnung bei Images > 1GB
    if [ $size_bytes -gt 1073741824 ]; then
        echo "WARN: Image size exceeds 1GB"
    fi
}

# Funktion zum Ausführen des Trivy-Scans
run_security_scan() {
    local image=$1
    echo "Running security scan for $image..."
    
    if ! command -v trivy &> /dev/null; then
        echo "WARN: Trivy not installed, skipping security scan"
        return
    }
    
    # Scan durchführen
    trivy image --severity HIGH,CRITICAL $image
    
    # Kritische Vulnerabilities zählen
    local crit_count=$(trivy image --severity CRITICAL $image | grep -c "CRITICAL")
    if [ $crit_count -gt 0 ]; then
        echo "FAIL: Found $crit_count critical vulnerabilities"
        return 1
    fi
}

# Images überprüfen
for SERVICE in "${SERVICES[@]}"; do
    echo -e "\n=== Checking $SERVICE ==="
    IMAGE="$REGISTRY/$SERVICE:$VERSION"
    
    # Image pullen
    echo -n "Pulling image... "
    if ! docker pull $IMAGE; then
        echo "FAIL: Could not pull image $IMAGE"
        continue
    fi
    echo "OK"
    
    # Image-Größe prüfen
    check_image_size $IMAGE
    
    # Manifest prüfen
    echo -n "Checking manifest... "
    if ! docker manifest inspect $IMAGE > /dev/null; then
        echo "FAIL: Manifest check failed"
        continue
    fi
    echo "OK"
    
    # Layer prüfen
    echo -n "Checking layers... "
    LAYERS=$(docker history $IMAGE --no-trunc --format "{{.Size}}")
    if [ -z "$LAYERS" ]; then
        echo "FAIL: Could not get layer information"
        continue
    fi
    echo "OK"
    
    # Security Scan
    if ! run_security_scan $IMAGE; then
        echo "WARN: Security issues found in $SERVICE"
    fi
    
    # Image signieren (falls Cosign installiert)
    if command -v cosign &> /dev/null; then
        echo -n "Verifying signature... "
        if ! cosign verify $IMAGE; then
            echo "WARN: Image signature verification failed"
        else
            echo "OK"
        fi
    else
        echo "WARN: Cosign not installed, skipping signature verification"
    fi
    
    # Backup erstellen
    echo -n "Creating backup... "
    if ! docker save $IMAGE | gzip > "backup_${SERVICE}_${VERSION}.tar.gz"; then
        echo "WARN: Backup creation failed"
    else
        echo "OK"
    fi
done

# Registry-Status prüfen
echo -e "\n=== Registry Status ==="
echo -n "Checking registry health... "
if curl -f "$REGISTRY/v2/_catalog" > /dev/null 2>&1; then
    echo "OK"
else
    echo "WARN: Registry health check failed"
fi

# Zusammenfassung
echo -e "\n=== Summary ==="
TOTAL_IMAGES=${#SERVICES[@]}
PULLED_IMAGES=$(docker images | grep $REGISTRY | wc -l)
WARN_COUNT=$(grep -c "WARN" "$0.log")
FAIL_COUNT=$(grep -c "FAIL" "$0.log")

echo "Total images checked: $TOTAL_IMAGES"
echo "Successfully pulled: $PULLED_IMAGES"
echo "Warnings: $WARN_COUNT"
echo "Failures: $FAIL_COUNT"

# Status setzen
if [ $FAIL_COUNT -gt 0 ]; then
    echo "FAIL: Critical issues found"
    exit 1
elif [ $WARN_COUNT -gt 0 ]; then
    echo "WARN: Non-critical issues found"
    exit 0
else
    echo "OK: All checks passed"
    exit 0
fi 