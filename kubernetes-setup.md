# 🐳 VALEO NeuroERP - Kubernetes Setup für Stakeholder-Demonstration

## 🎯 Übersicht

Kubernetes bietet eine stabilere und professionellere Umgebung für die Stakeholder-Demonstration. Hier ist die vollständige Setup-Anleitung.

## 📋 Voraussetzungen

### 1. Kubernetes-Cluster
- **Minikube** (für lokale Entwicklung)
- **Docker Desktop** mit Kubernetes aktiviert
- **kubectl** Command-Line-Tool

### 2. Tools Installation
```bash
# Minikube installieren
winget install minikube

# kubectl installieren
winget install kubernetes.kubectl

# Helm installieren (optional)
winget install helm.helm
```

## 🚀 Kubernetes-Setup

### 1. Cluster starten
```bash
# Minikube starten
minikube start --driver=docker --cpus=4 --memory=8192

# Cluster-Status prüfen
kubectl cluster-info
kubectl get nodes
```

### 2. Namespace erstellen
```bash
kubectl create namespace valeo-neuroerp
kubectl config set-context --current --namespace=valeo-neuroerp
```

## 📦 Container-Images erstellen

### 1. Frontend Image
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Backend Image
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Images bauen
```bash
# Frontend Image
docker build -t valeo-neuroerp-frontend:latest ./frontend

# Backend Image
docker build -t valeo-neuroerp-backend:latest ./backend

# Images in Minikube laden
minikube image load valeo-neuroerp-frontend:latest
minikube image load valeo-neuroerp-backend:latest
```

## 🔧 Kubernetes-Manifests

### 1. Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: valeo-frontend
  labels:
    app: valeo-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: valeo-frontend
  template:
    metadata:
      labels:
        app: valeo-frontend
    spec:
      containers:
      - name: frontend
        image: valeo-neuroerp-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: valeo-frontend-service
spec:
  selector:
    app: valeo-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: valeo-frontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: valeo-neuroerp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: valeo-frontend-service
            port:
              number: 80
```

### 2. Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: valeo-backend
  labels:
    app: valeo-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: valeo-backend
  template:
    metadata:
      labels:
        app: valeo-backend
    spec:
      containers:
      - name: backend
        image: valeo-neuroerp-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://user:password@postgres-service:5432/valeo_erp"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: valeo-backend-service
spec:
  selector:
    app: valeo-backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

### 3. PostgreSQL Database
```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  labels:
    app: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "valeo_erp"
        - name: POSTGRES_USER
          value: "user"
        - name: POSTGRES_PASSWORD
          value: "password"
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## 🚀 Deployment

### 1. Manifests anwenden
```bash
# Namespace erstellen
kubectl create namespace valeo-neuroerp

# Manifests anwenden
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Status prüfen
kubectl get pods
kubectl get services
kubectl get ingress
```

### 2. Ingress Controller aktivieren
```bash
# NGINX Ingress Controller installieren
minikube addons enable ingress

# Ingress Status prüfen
kubectl get pods -n ingress-nginx
```

### 3. Hosts-Datei aktualisieren
```bash
# Minikube IP ermitteln
minikube ip

# Hosts-Datei bearbeiten (als Administrator)
# C:\Windows\System32\drivers\etc\hosts
# <minikube-ip> valeo-neuroerp.local
```

## 📊 Monitoring & Logs

### 1. Pod-Status überwachen
```bash
# Alle Pods anzeigen
kubectl get pods -o wide

# Pod-Logs anzeigen
kubectl logs -f deployment/valeo-frontend
kubectl logs -f deployment/valeo-backend

# Pod-Status beschreiben
kubectl describe pod <pod-name>
```

### 2. Services testen
```bash
# Port-Forward für lokalen Zugriff
kubectl port-forward service/valeo-frontend-service 8080:80

# Service testen
curl http://localhost:8080
```

## 🎯 Demo-Workflow

### 1. System starten
```bash
# Cluster starten
minikube start

# Services deployen
kubectl apply -f k8s/

# Status prüfen
kubectl get all
```

### 2. Demo durchführen
- **URL:** http://valeo-neuroerp.local
- **Alternative:** http://localhost:8080 (mit Port-Forward)
- **Credentials:** admin / admin123

### 3. System stoppen
```bash
# Services löschen
kubectl delete -f k8s/

# Cluster stoppen
minikube stop
```

## 🔧 Troubleshooting

### 1. Pod-Probleme
```bash
# Pod-Status prüfen
kubectl get pods
kubectl describe pod <pod-name>

# Pod-Logs anzeigen
kubectl logs <pod-name>
```

### 2. Service-Probleme
```bash
# Service-Status prüfen
kubectl get services
kubectl describe service <service-name>

# Endpoints prüfen
kubectl get endpoints
```

### 3. Ingress-Probleme
```bash
# Ingress-Status prüfen
kubectl get ingress
kubectl describe ingress <ingress-name>

# Ingress-Controller-Logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## 📈 Vorteile von Kubernetes

### ✅ Stabilität
- **Automatische Neustarts** bei Fehlern
- **Health Checks** für alle Services
- **Load Balancing** zwischen Pods

### ✅ Skalierbarkeit
- **Horizontale Skalierung** möglich
- **Ressourcen-Management** automatisch
- **Rolling Updates** ohne Downtime

### ✅ Professionalität
- **Enterprise-Grade** Infrastruktur
- **Monitoring & Logging** integriert
- **CI/CD-Pipeline** kompatibel

### ✅ Demo-Qualität
- **Stabile Performance** garantiert
- **Professionelle Präsentation**
- **Einfache Wartung**

## 🎉 Fazit

Kubernetes bietet eine deutlich stabilere und professionellere Umgebung für die Stakeholder-Demonstration. Das System läuft zuverlässiger und kann bei Bedarf einfach skaliert werden.

**Empfehlung:** Für die Stakeholder-Demonstration ist Kubernetes die bessere Wahl! 