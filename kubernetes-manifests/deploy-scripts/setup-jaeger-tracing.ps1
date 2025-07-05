# PowerShell-Skript zur Installation von Jaeger Tracing für das ERP-System
# setup-jaeger-tracing.ps1

# Setze Variablen
$NAMESPACE = "erp-system"
$JAEGER_VERSION = "1.46.0"

# Funktion zum Überprüfen des Namespace
function Ensure-Namespace {
    param (
        [string] $Namespace
    )
    
    Write-Host "Überprüfe, ob Namespace $Namespace existiert..."
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    
    if (-not $namespaceExists) {
        Write-Host "Namespace $Namespace existiert nicht. Erstelle Namespace..."
        kubectl create namespace $Namespace
    } else {
        Write-Host "Namespace $Namespace existiert bereits."
    }
}

# Funktion zum Anwenden von Manifesten aus String
function Apply-ManifestFromString {
    param (
        [string] $ManifestContent,
        [string] $Description
    )
    
    Write-Host "`nAnwenden von $Description..."
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $ManifestContent

    kubectl apply -f $tempFile -n $NAMESPACE
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fehler beim Anwenden von $Description. Breche ab." -ForegroundColor Red
        Remove-Item -Path $tempFile
        exit 1
    } else {
        Write-Host "$Description erfolgreich angewendet." -ForegroundColor Green
    }
    
    Remove-Item -Path $tempFile
}

# Überprüfe Namespace
Ensure-Namespace -Namespace $NAMESPACE

# Anwenden der Jaeger-Komponenten
Write-Host "`n===== Bereitstellung von Jaeger Tracing beginnt =====" -ForegroundColor Cyan

# Installiere Jaeger Operator über das Custom Resource
Write-Host "Installiere Jaeger Operator..."
kubectl create -f "https://github.com/jaegertracing/jaeger-operator/releases/download/v$JAEGER_VERSION/jaeger-operator.yaml" -n $NAMESPACE

# Warte auf Operator
Write-Host "Warte auf Start des Jaeger Operators..."
kubectl wait --for=condition=available --timeout=300s deployment/jaeger-operator -n $NAMESPACE

# Erstelle Jaeger Instance
Write-Host "Erstelle Jaeger Instance..."
$jaegerInstanceYaml = @"
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: erp-jaeger
spec:
  strategy: production
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: https://elasticsearch:9200
        tls:
          ca: /es/certificates/ca.crt
    secretName: jaeger-elasticsearch
  ingress:
    enabled: true
    hosts:
      - tracing.erp.example.com
  annotations:
    scheduler.alpha.kubernetes.io/critical-pod: ""
"@

Apply-ManifestFromString -ManifestContent $jaegerInstanceYaml -Description "Jaeger Instance"

# Erstelle Service Monitoring für Jaeger
Write-Host "Erstelle ServiceMonitor für Jaeger..."
$serviceMonitorYaml = @"
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: jaeger-monitor
  labels:
    monitoring: jaeger
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: jaeger
  endpoints:
  - port: http
    interval: 30s
"@

Apply-ManifestFromString -ManifestContent $serviceMonitorYaml -Description "Jaeger ServiceMonitor"

# Erstelle Secret für Elasticsearch
Write-Host "Erstelle Secret für Elasticsearch-Verbindung..."
$elasticUsername = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("elastic"))
$elasticPassword = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("changeme"))

$elasticSecretYaml = @"
apiVersion: v1
kind: Secret
metadata:
  name: jaeger-elasticsearch
type: Opaque
data:
  # Beispiel-Credentials - in Produktion entsprechend ändern
  ES_USERNAME: $elasticUsername
  ES_PASSWORD: $elasticPassword
"@

Apply-ManifestFromString -ManifestContent $elasticSecretYaml -Description "Elasticsearch Secret"

# Erstelle Secret für Elasticsearch-Zertifikate
Write-Host "Erstelle Secret für Elasticsearch-Zertifikate..."
$tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Zertifikat erstellen (vereinfachte Version für Windows)
$cert = New-SelfSignedCertificate -Subject "CN=elasticsearch" -CertStoreLocation "cert:\LocalMachine\My" -KeyExportPolicy Exportable -KeySpec Signature -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256

# PFX exportieren
$certPassword = ConvertTo-SecureString -String "password" -Force -AsPlainText
$pfxPath = "$tempDir\cert.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $certPassword | Out-Null

# PEM-Format extrahieren (benötigt OpenSSL)
$openSslPath = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
if (Test-Path $openSslPath) {
    & $openSslPath pkcs12 -in $pfxPath -clcerts -nokeys -out "$tempDir\tls.crt" -password pass:password
    kubectl create secret generic jaeger-elasticsearch-certs --from-file=ca.crt="$tempDir\tls.crt" -n $NAMESPACE
} else {
    Write-Host "OpenSSL nicht gefunden. Verwende Standard-Zertifikat für Elasticsearch..." -ForegroundColor Yellow
    kubectl create secret generic jaeger-elasticsearch-certs --from-literal=ca.crt="DUMMY_CERT" -n $NAMESPACE
}

# Temporäres Verzeichnis löschen
Remove-Item -Path $tempDir -Recurse -Force

# Aktualisiere Ingress für Jaeger
Write-Host "Aktualisiere Ingress für Jaeger UI..."
$jaegerIngressYaml = @"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jaeger-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: monitoring-basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Monitoring Authentication Required"
spec:
  rules:
  - host: tracing.erp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: erp-jaeger-query
            port:
              number: 16686
  tls:
  - hosts:
    - tracing.erp.example.com
    secretName: erp-tls-secret
"@

Apply-ManifestFromString -ManifestContent $jaegerIngressYaml -Description "Jaeger Ingress"

# Anleitung zur Verwendung
Write-Host "`n===== Bereitstellung von Jaeger Tracing abgeschlossen =====" -ForegroundColor Cyan
Write-Host "Jaeger UI ist verfügbar unter: https://tracing.erp.example.com"
Write-Host "Zugangsdaten sind die gleichen wie für das Monitoring-System."
Write-Host ""
Write-Host "Für die Instrumentierung der Services:"
Write-Host "1. OpenTracing-Bibliotheken in jede Anwendung integrieren"
Write-Host "2. Konfiguration für Jaeger Tracing Agent: 'erp-jaeger-agent.$NAMESPACE.svc.cluster.local:6831'"
Write-Host "3. Verbindungsparameter für Client-Services setzen:"
Write-Host "   - JAEGER_AGENT_HOST=erp-jaeger-agent.$NAMESPACE.svc.cluster.local"
Write-Host "   - JAEGER_AGENT_PORT=6831"
Write-Host "   - JAEGER_SAMPLER_TYPE=const"
Write-Host "   - JAEGER_SAMPLER_PARAM=1"
Write-Host ""
Write-Host "Für weitere Informationen zur Instrumentierung siehe: https://www.jaegertracing.io/docs/" 