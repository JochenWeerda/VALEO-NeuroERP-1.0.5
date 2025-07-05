# Redis-Cluster für die Produktionsumgebung

Diese Dokumentation beschreibt die Einrichtung eines Redis-Clusters für die Produktionsumgebung des AI-driven ERP-Systems zur Optimierung der Cache-Leistung.

## Architektur

Für die Produktionsumgebung empfehlen wir eine dreistufige Redis-Architektur:

1. **Master-Node**: Hauptknoten für Schreiboperationen
2. **Replica-Nodes**: Leseknoten für horizontale Skalierung
3. **Sentinel-Nodes**: Überwachung und automatisches Failover

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Redis Master  │────>│  Redis Replica  │────>│  Redis Replica  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ^                       ^                       ^
         │                       │                       │
         │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Sentinel     │<───>│    Sentinel     │<───>│    Sentinel     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Hardwareanforderungen

Für eine mittelgroße Produktionsumgebung empfehlen wir folgende Mindestspezifikationen:

| Knotentyp | CPU | RAM | Festplatte | Anzahl |
|-----------|-----|-----|------------|--------|
| Master    | 4   | 8GB | 100GB SSD  | 1      |
| Replica   | 2   | 4GB | 100GB SSD  | 2      |
| Sentinel  | 1   | 1GB | 20GB SSD   | 3      |

## Installationsschritte

### 1. Vorbereitung der Server

Führen Sie auf jedem Server folgende Befehle aus:

```bash
# System aktualisieren
sudo apt-get update
sudo apt-get upgrade -y

# Redis-Abhängigkeiten installieren
sudo apt-get install -y build-essential tcl

# Redis herunterladen und installieren (neueste stabile Version)
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# Verzeichnisse erstellen
sudo mkdir -p /etc/redis
sudo mkdir -p /var/redis/6379
```

### 2. Konfiguration des Master-Knotens

Erstellen Sie eine Konfigurationsdatei auf dem Master-Server:

```bash
sudo nano /etc/redis/6379.conf
```

Fügen Sie folgende Konfiguration hinzu:

```
port 6379
bind 0.0.0.0
protected-mode yes
requirepass "StarkesPasswortHier"
masterauth "StarkesPasswortHier"
maxmemory 6gb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
dir /var/redis/6379
```

Erstellen Sie einen Systemd-Service:

```bash
sudo nano /etc/systemd/system/redis.service
```

Mit folgendem Inhalt:

```
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/6379.conf
ExecStop=/usr/local/bin/redis-cli -h 127.0.0.1 -p 6379 -a "StarkesPasswortHier" shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. Konfiguration der Replica-Knoten

Auf jedem Replica-Server erstellen Sie eine ähnliche Konfiguration:

```bash
sudo nano /etc/redis/6379.conf
```

Mit dem Unterschied:

```
port 6379
bind 0.0.0.0
protected-mode yes
requirepass "StarkesPasswortHier"
masterauth "StarkesPasswortHier"
replicaof master-ip 6379
maxmemory 3gb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
dir /var/redis/6379
```

### 4. Konfiguration der Sentinel-Knoten

Auf jedem Sentinel-Server erstellen Sie:

```bash
sudo nano /etc/redis/sentinel.conf
```

Mit folgendem Inhalt:

```
port 26379
sentinel monitor mymaster master-ip 6379 2
sentinel auth-pass mymaster StarkesPasswortHier
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

Starten Sie den Sentinel-Dienst:

```bash
sudo redis-sentinel /etc/redis/sentinel.conf
```

### 5. Firewall-Konfiguration

Öffnen Sie die folgenden Ports:

```bash
# Redis-Server Port
sudo ufw allow 6379/tcp

# Sentinel-Port
sudo ufw allow 26379/tcp
```

## Integration mit dem EnhancedCacheManager

Passen Sie die Cache-Konfiguration im System an:

```python
# Redis-Cache mit Sentinel-Unterstützung
from redis.sentinel import Sentinel

sentinel = Sentinel([
    ('sentinel1-ip', 26379),
    ('sentinel2-ip', 26379),
    ('sentinel3-ip', 26379)
], socket_timeout=0.5)

# Master für Schreiboperationen
master = sentinel.master_for('mymaster', password='StarkesPasswortHier', socket_timeout=0.5)

# Replica für Leseoperationen
replica = sentinel.slave_for('mymaster', password='StarkesPasswortHier', socket_timeout=0.5)

# Cache-Manager mit Redis-Verbindung initialisieren
redis_cache = EnhancedCacheManager(
    backend="redis", 
    redis_client=master,  # Verwenden Sie master für Schreibzugriffe
    default_ttl=300,
    enable_stats=True
)
```

## Monitoring und Wartung

### Monitoring mit Redis INFO

```bash
redis-cli -h master-ip -p 6379 -a "StarkesPasswortHier" INFO
```

### Überwachung wichtiger Metriken

- **used_memory**: Verwendeter Speicher
- **connected_clients**: Anzahl der verbundenen Clients
- **keyspace_hits/keyspace_misses**: Cache-Trefferrate
- **instantaneous_ops_per_sec**: Operationen pro Sekunde

### Wartungsaufgaben

#### Regelmäßige Backups

```bash
# Konfiguration für automatisches Backup
redis-cli -h master-ip -p 6379 -a "StarkesPasswortHier" BGSAVE
```

#### Speicherüberwachung

```bash
# Größe des Schlüsselraums anzeigen
redis-cli -h master-ip -p 6379 -a "StarkesPasswortHier" INFO keyspace
```

## Troubleshooting

### Verbindungsprobleme

```bash
# Netzwerkverbindung prüfen
ping master-ip

# Redis-Verbindung testen
redis-cli -h master-ip -p 6379 -a "StarkesPasswortHier" PING
```

### Replikationsprobleme

```bash
# Replikationsstatus prüfen
redis-cli -h replica-ip -p 6379 -a "StarkesPasswortHier" INFO replication
```

### Speicherprobleme

```bash
# Speichernutzung prüfen
redis-cli -h master-ip -p 6379 -a "StarkesPasswortHier" INFO memory
```

## Skalierungsstrategien

### Vertikale Skalierung

- Erhöhen Sie den verfügbaren Speicher (RAM) auf den bestehenden Knoten
- Passen Sie die `maxmemory`-Einstellung in der Konfiguration an

### Horizontale Skalierung

- Fügen Sie weitere Replica-Knoten hinzu
- Aktualisieren Sie die Sentinel-Konfiguration entsprechend

### Sharding (fortgeschritten)

- Verwenden Sie Redis Cluster für größere Datensätze
- Konfigurieren Sie mehrere Master-Knoten mit Hash-Slots

## Nächste Schritte

1. Automatische Backup-Strategie implementieren
2. Monitoring mit Prometheus und Grafana einrichten
3. Automatisierte Deployment-Pipeline mit Ansible oder Terraform erstellen
4. Dokumentation für Notfallwiederherstellung erstellen 