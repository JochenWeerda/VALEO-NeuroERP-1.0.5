# Kubernetes-Konfiguration für das ERP-System

Diese Konfiguration stellt das modulare ERP-System in einem Kubernetes-Cluster bereit.

## Voraussetzungen

- Docker Desktop mit aktiviertem Kubernetes oder ein anderer Kubernetes-Cluster
- kubectl (Befehlszeilen-Tool für Kubernetes)
- Docker-Images für alle Microservices (werden automatisch erstellt)

## Microservices

Das ERP-System besteht aus folgenden Microservices:

1. **Backend-API**: Modulares ERP-Backend mit FastAPI (Port 8003)
2. **Frontend**: React-basierte Benutzeroberfläche (Port 80)
3. **Auth-Service**: Authentifizierung und Autorisierung (Port 8080)
4. **Reporting-Service**: Berichterstellung und Analysen (Port 8090)
5. **Document-Service**: Dokumentenverwaltung (Port 8070)
6. **Notification-Service**: E-Mail- und Push-Benachrichtigungen (Port 8085)
7. **Datenbank**: PostgreSQL-Datenbank für persistente Datenspeicherung

## Komponenten

Die Bereitstellung umfasst folgende Kubernetes-Komponenten:

1. **Deployments**: Für alle stateless Microservices
2. **StatefulSets**: Für die Datenbank und den Document-Service (zustandsbehaftet)
3. **Services**: Für die Kommunikation zwischen Komponenten
4. **ConfigMaps**: Für die Konfiguration der Microservices
5. **Secrets**: Für sensible Daten (Passwörter, API-Schlüssel)
6. **PersistentVolumes**: Für dauerhafte Datenspeicherung
7. **Ingress**: Für den externen Zugriff auf die API und das Frontend
8. **NetworkPolicies**: Zur Absicherung der Netzwerkkommunikation
9. **HorizontalPodAutoscalers**: Für automatische Skalierung bei Last

## Verzeichnisstruktur

```
kubernetes/
├── backend-deployment.yaml    # Deployment für das Backend
├── backend-service.yaml       # Service für das Backend
├── database-deployment.yaml   # Deployment für die Datenbank
├── database-service.yaml      # Service für die Datenbank
├── database-pv.yaml           # PersistentVolume und PersistentVolumeClaim
├── ingress.yaml               # Ingress-Konfiguration
├── deploy.ps1                 # PowerShell-Skript für Windows
├── deploy.sh                  # Bash-Skript für Linux/Unix
└── README.md                  # Diese Datei

kubernetes-manifests/
├── frontend.yaml                       # Frontend-Konfiguration
├── auth-service/                       # Authentifizierungsservice
│   └── auth-service.yaml
├── reporting-service/                  # Reporting-Service
│   └── reporting-service.yaml
├── document-service/                   # Dokumentenverwaltung
│   └── document-service.yaml
└── notification-service/               # Benachrichtigungsservice
    └── notification-service.yaml

kubernetes-tests/                       # Testskripte
├── test-auth-service.sh
├── test-reporting-service.sh
├── test-document-service.sh
├── test-notification-service.sh
├── test-frontend.sh
└── integration-tests.sh
```

## Bereitstellung

### Unter Windows

```powershell
cd kubernetes
.\deploy.ps1
```

### Unter Linux/Unix

```bash
cd kubernetes
chmod +x deploy.sh
./deploy.sh
```

## Microservice-Bereitstellung

Für die Bereitstellung der zusätzlichen Microservices:

```bash
kubectl apply -f kubernetes-manifests/frontend.yaml
kubectl apply -f kubernetes-manifests/auth-service/auth-service.yaml
kubectl apply -f kubernetes-manifests/reporting-service/reporting-service.yaml
kubectl apply -f kubernetes-manifests/document-service/document-service.yaml
kubectl apply -f kubernetes-manifests/notification-service/notification-service.yaml
```

## Testing

Nach der Bereitstellung können die Integrationstests ausgeführt werden:

```bash
cd kubernetes-tests
chmod +x integration-tests.sh
./integration-tests.sh
```

## Zugriff auf die Anwendung

Nach erfolgreicher Bereitstellung ist die Anwendung unter folgenden URLs erreichbar:

- **Frontend**: http://erp.example.com/
- **API**: http://erp.example.com/api/
- **API-Dokumentation**: http://erp.example.com/api/docs/
- **Auth-Service**: http://erp.example.com/auth/

## Überwachung

Überwachen Sie den Status der Bereitstellung mit:

```bash
kubectl get all -n erp-system
```

Für detaillierte Protokolle eines Services:

```bash
kubectl logs -n erp-system deployment/SERVICE_NAME
```

## Netzwerkrichtlinien

Die NetworkPolicies begrenzen den Netzwerkverkehr zwischen den Microservices:

- Frontend kann nur mit API-Server und Auth-Service kommunizieren
- Auth-Service kann nur mit API-Server und Notification-Service kommunizieren
- Jeder Service kann nur mit den für seine Funktion notwendigen anderen Services kommunizieren

## Ressourcenmanagement

Alle Microservices haben definierte Ressourcenanforderungen und -limits:

- **CPU-Anforderungen**: 100m-500m je nach Service
- **Speicheranforderungen**: 256Mi-1Gi je nach Service
- **Horizontale Skalierung**: Automatisch bei 75% CPU-Auslastung

## Aufräumen

Um alle erstellten Ressourcen zu entfernen:

```bash
kubectl delete namespace erp-system
``` 