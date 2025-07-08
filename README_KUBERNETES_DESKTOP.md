# VALEO-NeuroERP-2.0 – Lokale Installation mit Docker Desktop & Kubernetes

## Voraussetzungen
- Docker Desktop (mit aktiviertem Kubernetes)
- kubectl (wird mit Docker Desktop installiert)
- (Optional) NGINX-Ingress-Controller für lokale Ingress-Routen

## 1. Images lokal bauen

### Backend
```bash
docker build -t erp-backend:latest -f docker/api-server.Dockerfile .
```

### Frontend
```bash
docker build -t erp-frontend:latest -f docker/frontend-server.Dockerfile .
```

## 2. Namespace anlegen (optional, empfohlen)
```bash
kubectl create namespace erp-system
```

## 3. Datenbank & Infrastruktur deployen
```bash
kubectl apply -f kubernetes/database-pv.yaml
kubectl apply -f kubernetes/database-deployment.yaml
kubectl apply -f kubernetes/database-service.yaml
kubectl apply -f kubernetes/db-credentials.yaml
```

## 4. Backend & Services deployen
```bash
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
```

## 5. Frontend deployen
```bash
kubectl apply -f kubernetes-manifests/frontend.yaml
```

## 6. (Optional) Weitere Services
- Monitoring, Auth, Notification, Dokumentenservice etc.:
```bash
kubectl apply -f kubernetes-manifests/<service-verzeichnis>/<service>.yaml
```

## 7. Ingress/Domain für Desktop anpassen
- In `kubernetes-manifests/frontend.yaml` ggf. Host auf `localhost` oder `neuroerp.local` setzen:
```yaml
spec:
  rules:
    - host: neuroerp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```
- Hosts-Datei anpassen (Windows):
```
127.0.0.1 neuroerp.local
```
- NGINX-Ingress-Controller installieren (falls nicht vorhanden):
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

## 8. Zugriff
- Frontend: http://neuroerp.local (oder http://localhost, je nach Ingress)
- Backend: http://localhost:8000 (ggf. per PortForwarding)

## 9. Troubleshooting
- Logs anzeigen:
```bash
kubectl logs -n erp-system deployment/erp-backend
kubectl logs -n erp-system deployment/frontend
```
- Pods/Services prüfen:
```bash
kubectl get pods -n erp-system
kubectl get svc -n erp-system
```
- Port-Forwarding (falls kein Ingress):
```bash
kubectl port-forward svc/frontend 8080:80 -n erp-system
kubectl port-forward svc/erp-backend-service 8000:8000 -n erp-system
```

---

**Hinweis:**
- Für produktive Nutzung sollten Secrets, Volumes und Ressourcenlimits angepasst werden.
- Für weitere Microservices analog vorgehen (siehe `kubernetes-manifests/`). 