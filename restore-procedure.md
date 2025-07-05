# Wiederherstellungsverfahren für das ERP-System

Diese Dokumentation beschreibt die Schritte zur Wiederherstellung des ERP-Systems aus Backups in verschiedenen Szenarien.

## 1. Vorbereitung

Bevor Sie mit der Wiederherstellung beginnen, stellen Sie sicher, dass:

1. Sie Zugriff auf die Backup-Speicherorte haben (S3-Bucket oder alternativer Speicher)
2. Die Zielumgebung bereit ist (Kubernetes-Cluster oder Docker-Umgebung)
3. Ausreichende Berechtigungen für alle erforderlichen Operationen vorliegen
4. Ein Wiederherstellungsprotokoll für die Dokumentation vorbereitet ist

## 2. Redis-Datenwiederherstellung

### 2.1 Wiederherstellung aus S3-Backup

```bash
# 1. Neuestes Backup identifizieren oder spezifisches Backup auswählen
BACKUP_FILE=$(aws s3 ls s3://erp-backups/redis/hourly/ | sort | tail -1 | awk '{print $4}')
# Oder für ein spezifisches Datum:
# BACKUP_FILE="redis-20230415-120000.rdb"

# 2. Backup herunterladen
aws s3 cp s3://erp-backups/redis/hourly/$BACKUP_FILE /tmp/

# 3. Backup in Pod kopieren
kubectl cp /tmp/$BACKUP_FILE erp-system/redis-0:/tmp/

# 4. Redis anhalten und RDB-Datei ersetzen
kubectl exec -it -n erp-system redis-0 -- bash -c "
  redis-cli SAVE
  redis-cli SHUTDOWN NOSAVE
  cp /tmp/$BACKUP_FILE /data/dump.rdb
  redis-server /etc/redis/redis.conf
"
```

### 2.2 Wiederherstellung bei Redis-Cluster

Für einen Redis-Cluster ist der Prozess komplexer:

```bash
# 1. Backup herunterladen wie oben
# 2. Cluster in den Wartungsmodus versetzen
kubectl annotate statefulset -n erp-system redis maintenance=true

# 3. Für jeden Redis-Node:
for i in {0..2}; do
  kubectl cp /tmp/$BACKUP_FILE erp-system/redis-$i:/tmp/
  kubectl exec -it -n erp-system redis-$i -- bash -c "
    redis-cli CLUSTER FAILOVER
    sleep 5
    redis-cli SAVE
    redis-cli SHUTDOWN NOSAVE
    cp /tmp/$BACKUP_FILE /data/dump.rdb
    redis-server /etc/redis/redis.conf
  "
  # Warten, bis der Node wieder im Cluster verfügbar ist
  sleep 30
done

# 4. Wartungsmodus beenden
kubectl annotate statefulset -n erp-system redis maintenance-
```

## 3. Komplette System-Wiederherstellung

### 3.1 Mit Velero (für Kubernetes)

```bash
# 1. Verfügbare Backups anzeigen
velero backup get

# 2. Vollständige Wiederherstellung eines Namespaces
velero restore create --from-backup erp-system-backup-20230415-120000 --namespace-mappings erp-system:erp-system-restored

# 3. Status der Wiederherstellung prüfen
velero restore describe erp-system-backup-20230415-120000-20230415-150000
```

### 3.2 Selektive Wiederherstellung mit Velero

```bash
# Nur bestimmte Ressourcen wiederherstellen
velero restore create --from-backup erp-system-backup-20230415-120000 --include-resources persistentvolumeclaims,persistentvolumes,deployments,configmaps,secrets
```

## 4. Wiederherstellung von Konfigurationsdaten

### 4.1 ConfigMaps und Secrets

```bash
# 1. Aus Backup extrahieren
mkdir -p /tmp/k8s-restore/configmaps /tmp/k8s-restore/secrets

# 2. ConfigMaps wiederherstellen
kubectl get configmap -n erp-system-backup -o yaml > /tmp/k8s-restore/configmaps/all-configmaps.yaml

# Anpassen der Namespace-Referenzen (mit sed oder manuell)
sed -i 's/namespace: erp-system-backup/namespace: erp-system/g' /tmp/k8s-restore/configmaps/all-configmaps.yaml

# Anwenden der ConfigMaps
kubectl apply -f /tmp/k8s-restore/configmaps/all-configmaps.yaml

# 3. Ähnlicher Prozess für Secrets
kubectl get secret -n erp-system-backup -o yaml > /tmp/k8s-restore/secrets/all-secrets.yaml
# Anpassungen und Anwendung wie bei ConfigMaps
```

## 5. Anwendungsspezifische Wiederherstellung

### 5.1 API-Server

```bash
# 1. Deployment neu starten, um Konfigurationsänderungen zu übernehmen
kubectl rollout restart deployment -n erp-system api-server

# 2. Status überwachen
kubectl rollout status deployment -n erp-system api-server
```

### 5.2 Celery-Worker

```bash
# 1. Laufende Tasks abschließen lassen oder abbrechen
kubectl exec -it -n erp-system celery-flower-0 -- celery -A backend.tasks.celery_app control cancel_all

# 2. Worker neu starten
kubectl rollout restart deployment -n erp-system celery-worker

# 3. Status überwachen
kubectl rollout status deployment -n erp-system celery-worker
```

## 6. Verifizierung nach der Wiederherstellung

Nach Abschluss der Wiederherstellung sollten folgende Prüfungen durchgeführt werden:

### 6.1 System-Integritätsprüfung

```bash
# 1. Alle Pods prüfen
kubectl get pods -n erp-system

# 2. Anwendungslogs auf Fehler prüfen
kubectl logs -n erp-system deployment/api-server | grep -i error

# 3. Endpunktverfügbarkeit prüfen
kubectl exec -it -n erp-system deploy/tools -- curl -s http://api-server:8003/health | jq
```

### 6.2 Datenintegrität prüfen

```bash
# Redis-Daten prüfen
kubectl exec -it -n erp-system redis-0 -- redis-cli INFO keyspace

# Stichprobenartige Datenabfragen
kubectl exec -it -n erp-system deploy/api-server -- python -c "
from backend.demo_server_celery_enhanced import verify_data_integrity
result = verify_data_integrity()
print(f'Datenintegrität: {'OK' if result else 'FEHLER'}')
"
```

## 7. Notfall-Wiederherstellung (Disaster Recovery)

### 7.1 Kompletter Cluster-Verlust

Bei vollständigem Verlust der Infrastruktur:

1. Neuen Kubernetes-Cluster bereitstellen
2. Velero-Client und -Server installieren
3. Backup-Speicherort konfigurieren
4. Wiederherstellung über Velero ausführen:

```bash
# Backup-Speicherort konfigurieren
velero backup-location create default --provider aws --bucket erp-backups --prefix velero --config region=eu-central-1

# Vollständige Wiederherstellung
velero restore create --from-backup latest-full-backup
```

### 7.2 Datenkorruption

Bei Datenkorruption ohne Infrastrukturverlust:

1. Betroffene Komponente identifizieren
2. Selektive Wiederherstellung nur der betroffenen Daten
3. Integritätsprüfungen durchführen

## 8. Wiederherstellungstests

Regelmäßige Wiederherstellungstests sollten nach folgendem Zeitplan durchgeführt werden:

| Test-Typ                     | Häufigkeit  | Umgebung     | Verantwortlich |
|------------------------------|-------------|--------------|----------------|
| Redis-Wiederherstellung      | Wöchentlich | Test         | DevOps-Team    |
| Selektive Wiederherstellung  | Monatlich   | Test         | DevOps-Team    |
| Vollständige Wiederherstellung | Quartalsweise | Isolierte DR | DevOps + Entwicklungsteam |
| Notfall-Simulation          | Halbjährlich | DR-Übung    | Alle Teams     |

## 9. Dokumentation und Protokollierung

Bei jeder Wiederherstellung muss ein Protokoll mit folgenden Informationen geführt werden:

- Datum und Uhrzeit der Wiederherstellung
- Auslöser/Grund für die Wiederherstellung
- Verwendete Backup-Dateien (mit vollständigen Pfaden)
- Durchgeführte Schritte
- Beteiligte Personen
- Aufgetretene Probleme und deren Lösungen
- Ergebnisse der Integritätsprüfungen
- Zeit bis zur vollständigen Wiederherstellung (RTO erreicht?)
- Datenverlust seit letztem Backup (RPO erreicht?)

## 10. Wartung und Verbesserung

- Analysieren Sie nach jeder Wiederherstellung den Prozess und identifizieren Sie Verbesserungsmöglichkeiten
- Aktualisieren Sie diese Dokumentation mit neuen Erkenntnissen
- Überprüfen Sie die Effektivität der Backup-Strategie anhand der tatsächlichen Wiederherstellungsergebnisse
- Passen Sie RPO- und RTO-Ziele bei Bedarf an 