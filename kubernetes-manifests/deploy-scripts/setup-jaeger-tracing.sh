#!/bin/bash
# Skript zur Installation von Jaeger Tracing für das ERP-System
# setup-jaeger-tracing.sh

# Setze Variablen
NAMESPACE="erp-system"
JAEGER_VERSION="1.46.0"

# Funktion zum Überprüfen des Namespace
ensure_namespace() {
    local namespace=$1
    
    echo "Überprüfe, ob Namespace $namespace existiert..."
    if kubectl get namespace $namespace >/dev/null 2>&1; then
        echo "Namespace $namespace existiert bereits."
    else
        echo "Namespace $namespace existiert nicht. Erstelle Namespace..."
        kubectl create namespace $namespace
    fi
}

# Funktion zum Anwenden von Manifesten
apply_manifest() {
    local manifest_path=$1
    local description=$2
    
    echo -e "\nAnwenden von $description..."
    if kubectl apply -f $manifest_path; then
        echo -e "\e[32m$description erfolgreich angewendet.\e[0m"
    else
        echo -e "\e[31mFehler beim Anwenden von $manifest_path. Breche ab.\e[0m"
        exit 1
    fi
}

# Überprüfe Namespace
ensure_namespace $NAMESPACE

# Anwenden der Jaeger-Komponenten
echo -e "\n===== Bereitstellung von Jaeger Tracing beginnt ====="

# Installiere Jaeger Operator über das Custom Resource
echo "Installiere Jaeger Operator..."
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v$JAEGER_VERSION/jaeger-operator.yaml -n $NAMESPACE

# Warte auf Operator
echo "Warte auf Start des Jaeger Operators..."
kubectl wait --for=condition=available --timeout=300s deployment/jaeger-operator -n $NAMESPACE

# Erstelle Jaeger Instance
echo "Erstelle Jaeger Instance..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
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
EOF

# Erstelle Service Monitoring für Jaeger
echo "Erstelle ServiceMonitor für Jaeger..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
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
EOF

# Erstelle Secret für Elasticsearch (Beispiel - sollte in einer sicheren Produktionsumgebung angepasst werden)
echo "Erstelle Secret für Elasticsearch-Verbindung..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: v1
kind: Secret
metadata:
  name: jaeger-elasticsearch
type: Opaque
data:
  # Beispiel-Credentials - in Produktion entsprechend ändern
  ES_USERNAME: $(echo -n "elastic" | base64)
  ES_PASSWORD: $(echo -n "changeme" | base64)
EOF

# Erstelle Secret für Elasticsearch-Zertifikate (Beispiel - sollte in einer sicheren Produktionsumgebung angepasst werden)
echo "Erstelle Secret für Elasticsearch-Zertifikate..."
mkdir -p tmp-certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tmp-certs/tls.key -out tmp-certs/tls.crt -subj "/CN=elasticsearch"
kubectl create secret generic jaeger-elasticsearch-certs --from-file=ca.crt=tmp-certs/tls.crt -n $NAMESPACE
rm -rf tmp-certs

# Aktualisiere Ingress für Jaeger
echo "Aktualisiere Ingress für Jaeger UI..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
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
EOF

# Anleitung zur Verwendung
echo -e "\n===== Bereitstellung von Jaeger Tracing abgeschlossen ====="
echo "Jaeger UI ist verfügbar unter: https://tracing.erp.example.com"
echo "Zugangsdaten sind die gleichen wie für das Monitoring-System."
echo ""
echo "Für die Instrumentierung der Services:"
echo "1. OpenTracing-Bibliotheken in jede Anwendung integrieren"
echo "2. Konfiguration für Jaeger Tracing Agent: 'erp-jaeger-agent.${NAMESPACE}.svc.cluster.local:6831'"
echo "3. Verbindungsparameter für Client-Services setzen:"
echo "   - JAEGER_AGENT_HOST=erp-jaeger-agent.${NAMESPACE}.svc.cluster.local"
echo "   - JAEGER_AGENT_PORT=6831"
echo "   - JAEGER_SAMPLER_TYPE=const"
echo "   - JAEGER_SAMPLER_PARAM=1"
echo ""
echo "Für weitere Informationen zur Instrumentierung siehe: https://www.jaegertracing.io/docs/ 