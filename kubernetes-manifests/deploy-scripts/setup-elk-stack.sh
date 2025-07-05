#!/bin/bash
# Skript zur Installation des ELK-Stacks für das ERP-System
# setup-elk-stack.sh

# Setze Variablen
NAMESPACE="erp-system"
ES_VERSION="8.11.1"
KIBANA_VERSION="8.11.1"
LOGSTASH_VERSION="8.11.1"
FILEBEAT_VERSION="8.11.1"

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

# Anwenden der ELK-Stack-Komponenten
echo -e "\n===== Bereitstellung des ELK-Stacks beginnt ====="

# Elasticsearch
echo "Erstelle Elasticsearch-StatefulSet und Service..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
  labels:
    app: elasticsearch
spec:
  selector:
    app: elasticsearch
  ports:
  - port: 9200
    name: http
  - port: 9300
    name: transport
  clusterIP: None
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  serviceName: elasticsearch
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9114"
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:$ES_VERSION
        resources:
          limits:
            memory: 2Gi
            cpu: 1000m
          requests:
            memory: 1Gi
            cpu: 500m
        ports:
        - containerPort: 9200
          name: http
        - containerPort: 9300
          name: transport
        env:
        - name: cluster.name
          value: erp-elk-cluster
        - name: node.name
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: discovery.type
          value: single-node
        - name: ES_JAVA_OPTS
          value: "-Xms1g -Xmx1g"
        - name: xpack.security.enabled
          value: "true"
        - name: ELASTIC_PASSWORD
          valueFrom:
            secretKeyRef:
              name: elasticsearch-credentials
              key: password
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
      - name: elasticsearch-exporter
        image: quay.io/prometheuscommunity/elasticsearch-exporter:latest
        args:
        - '--es.uri=http://localhost:9200'
        - '--es.all'
        - '--es.indices'
        ports:
        - containerPort: 9114
          name: metrics
        env:
        - name: ES_USERNAME
          value: elastic
        - name: ES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: elasticsearch-credentials
              key: password
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: elasticsearch-data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 30Gi
      storageClassName: standard
EOF

# Erstelle Secret für Elasticsearch
echo "Erstelle Secret für Elasticsearch-Zugangsdaten..."
ES_PASSWORD=$(openssl rand -base64 12)
kubectl create secret generic elasticsearch-credentials \
  --from-literal=username=elastic \
  --from-literal=password=$ES_PASSWORD \
  -n $NAMESPACE

# Kibana
echo "Erstelle Kibana-Deployment und Service..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: v1
kind: Service
metadata:
  name: kibana
  labels:
    app: kibana
spec:
  selector:
    app: kibana
  ports:
  - port: 5601
    name: http
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
      - name: kibana
        image: docker.elastic.co/kibana/kibana:$KIBANA_VERSION
        resources:
          limits:
            memory: 1Gi
            cpu: 500m
          requests:
            memory: 512Mi
            cpu: 250m
        ports:
        - containerPort: 5601
          name: http
        env:
        - name: ELASTICSEARCH_HOSTS
          value: http://elasticsearch:9200
        - name: ELASTICSEARCH_USERNAME
          value: elastic
        - name: ELASTICSEARCH_PASSWORD
          valueFrom:
            secretKeyRef:
              name: elasticsearch-credentials
              key: password
        - name: SERVER_PUBLICBASEURL
          value: https://logs.erp.example.com
EOF

# Logstash
echo "Erstelle Logstash-Deployment und Service..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
data:
  logstash.yml: |
    http.host: "0.0.0.0"
    xpack.monitoring.elasticsearch.hosts: [ "http://elasticsearch:9200" ]
    xpack.monitoring.elasticsearch.username: elastic
    xpack.monitoring.elasticsearch.password: \${ELASTICSEARCH_PASSWORD}
  pipelines.yml: |
    - pipeline.id: main
      path.config: "/usr/share/logstash/pipeline"
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
      http {
        port => 8080
        codec => json
      }
    }

    filter {
      if [kubernetes] {
        mutate {
          add_field => { "[@metadata][target_index]" => "kubernetes-%{+YYYY.MM.dd}" }
        }
      } else if [service] {
        mutate {
          add_field => { "[@metadata][target_index]" => "service-%{+YYYY.MM.dd}" }
        }
      } else {
        mutate {
          add_field => { "[@metadata][target_index]" => "logs-%{+YYYY.MM.dd}" }
        }
      }
    }

    output {
      elasticsearch {
        hosts => ["elasticsearch:9200"]
        user => "elastic"
        password => "\${ELASTICSEARCH_PASSWORD}"
        index => "%{[@metadata][target_index]}"
      }
    }
---
apiVersion: v1
kind: Service
metadata:
  name: logstash
  labels:
    app: logstash
spec:
  selector:
    app: logstash
  ports:
  - port: 5044
    name: beats
  - port: 8080
    name: http
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logstash
spec:
  replicas: 1
  selector:
    matchLabels:
      app: logstash
  template:
    metadata:
      labels:
        app: logstash
    spec:
      containers:
      - name: logstash
        image: docker.elastic.co/logstash/logstash:$LOGSTASH_VERSION
        resources:
          limits:
            memory: 1Gi
            cpu: 500m
          requests:
            memory: 512Mi
            cpu: 200m
        ports:
        - containerPort: 5044
          name: beats
        - containerPort: 8080
          name: http
        env:
        - name: ELASTICSEARCH_PASSWORD
          valueFrom:
            secretKeyRef:
              name: elasticsearch-credentials
              key: password
        volumeMounts:
        - name: config
          mountPath: /usr/share/logstash/config/logstash.yml
          subPath: logstash.yml
        - name: config
          mountPath: /usr/share/logstash/config/pipelines.yml
          subPath: pipelines.yml
        - name: config
          mountPath: /usr/share/logstash/pipeline/logstash.conf
          subPath: logstash.conf
      volumes:
      - name: config
        configMap:
          name: logstash-config
EOF

# Filebeat als DaemonSet für die automatische Log-Sammlung von allen Nodes
echo "Erstelle Filebeat-DaemonSet..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
        - add_kubernetes_metadata:
            host: \${NODE_NAME}
            matchers:
            - logs_path:
                logs_path: "/var/log/containers/"

    processors:
      - add_cloud_metadata:
      - add_host_metadata:

    output.logstash:
      hosts: ["logstash:5044"]
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: filebeat
  labels:
    app: filebeat
spec:
  selector:
    matchLabels:
      app: filebeat
  template:
    metadata:
      labels:
        app: filebeat
    spec:
      serviceAccountName: filebeat
      terminationGracePeriodSeconds: 30
      containers:
      - name: filebeat
        image: docker.elastic.co/beats/filebeat:$FILEBEAT_VERSION
        args: [
          "-c", "/etc/filebeat.yml",
          "-e",
        ]
        env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        securityContext:
          runAsUser: 0
        resources:
          limits:
            memory: 200Mi
            cpu: 100m
          requests:
            memory: 100Mi
            cpu: 50m
        volumeMounts:
        - name: config
          mountPath: /etc/filebeat.yml
          readOnly: true
          subPath: filebeat.yml
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: varlog
          mountPath: /var/log
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: filebeat-config
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: varlog
        hostPath:
          path: /var/log
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: filebeat
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: filebeat
rules:
- apiGroups: [""]
  resources:
  - namespaces
  - pods
  - nodes
  verbs:
  - get
  - watch
  - list
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: filebeat
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: filebeat
subjects:
- kind: ServiceAccount
  name: filebeat
  namespace: $NAMESPACE
EOF

# Ingress für Kibana
echo "Erstelle Ingress für Kibana..."
cat <<EOF | kubectl apply -f - -n $NAMESPACE
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kibana-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: monitoring-basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Monitoring Authentication Required"
spec:
  rules:
  - host: logs.erp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kibana
            port:
              number: 5601
  tls:
  - hosts:
    - logs.erp.example.com
    secretName: erp-tls-secret
EOF

# Warte auf die Bereitstellung
echo "Warte auf die Bereitstellung von Elasticsearch..."
kubectl rollout status statefulset/elasticsearch -n $NAMESPACE --timeout=5m || true

echo "Warte auf die Bereitstellung von Kibana..."
kubectl rollout status deployment/kibana -n $NAMESPACE --timeout=5m || true

echo "Warte auf die Bereitstellung von Logstash..."
kubectl rollout status deployment/logstash -n $NAMESPACE --timeout=5m || true

# Benutzerhandbuch
echo -e "\n===== Bereitstellung des ELK-Stacks abgeschlossen ====="
echo "Kibana ist verfügbar unter: https://logs.erp.example.com"
echo "Zugangsdaten sind die gleichen wie für das Monitoring-System."
echo ""
echo "Elasticsearch-Zugangsdaten für Services:"
echo "- Username: elastic"
echo "- Password: $ES_PASSWORD (Diese sollten sicher gespeichert werden)"
echo ""
echo "Logs werden automatisch über Filebeat von allen Kubernetes-Pods gesammelt."
echo "Zusätzlich können Services direkt an Logstash senden:"
echo "- Logstash-Service: logstash.${NAMESPACE}.svc.cluster.local:8080"
echo ""
echo "Um benutzerdefinierte Indices und Dashboards zu erstellen:"
echo "1. Melden Sie sich bei Kibana an"
echo "2. Gehen Sie zu Stack Management > Index Patterns"
echo "3. Erstellen Sie Index-Muster für 'service-*', 'kubernetes-*', etc."
echo "4. Erstellen Sie Dashboards unter Kibana > Dashboard" 