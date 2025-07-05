"""
Failover Monitor Service für VALERO-NeuroERP v1.1

Dieser Service überwacht die Datenbank-Replikation und steuert das automatische Failover,
mit dem Ziel, die Failover-Zeit von 3,5s auf unter 2s zu reduzieren.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import DictCursor
import redis
from prometheus_client import Counter, Histogram, Gauge

# Logging Setup
logger = logging.getLogger("FailoverMonitor")

# Prometheus Metrics
failover_duration = Histogram(
    'db_failover_duration_seconds',
    'Time taken for database failover',
    buckets=[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5]
)

replication_lag = Gauge(
    'db_replication_lag_seconds',
    'Current replication lag in seconds'
)

failover_total = Counter(
    'db_failover_total',
    'Total number of failovers'
)

# Pydantic Models
class DatabaseNode(BaseModel):
    """Repräsentiert einen Datenbank-Node"""
    host: str
    port: int
    role: str = Field(..., description="primary oder replica")
    status: str = Field("unknown", description="Status des Nodes")
    last_seen: datetime = Field(default_factory=datetime.now)
    replication_lag: float = Field(0.0, description="Replikationsverzögerung in Sekunden")

class FailoverEvent(BaseModel):
    """Repräsentiert ein Failover-Event"""
    id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    old_primary: str
    new_primary: str
    duration: float
    success: bool
    error: Optional[str] = None

class FailoverMonitor:
    """Hauptklasse für das Datenbank-Failover-Monitoring"""
    
    def __init__(self, config: Dict):
        """Initialisiert den Failover-Monitor"""
        self.config = config
        self.nodes: Dict[str, DatabaseNode] = {}
        self.redis = redis.Redis(
            host=config["redis_host"],
            port=config["redis_port"]
        )
        self.failover_in_progress = False
        
    async def start_monitoring(self):
        """Startet das kontinuierliche Monitoring"""
        logger.info("Starting Failover Monitor")
        while True:
            try:
                await self.check_nodes()
                await self.update_metrics()
                await asyncio.sleep(1)  # 1-Sekunden-Intervall
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                await asyncio.sleep(5)  # Kurze Pause bei Fehler
                
    async def check_nodes(self):
        """Prüft den Status aller Datenbank-Nodes"""
        for node in self.nodes.values():
            try:
                with psycopg2.connect(
                    host=node.host,
                    port=node.port,
                    dbname=self.config["database"],
                    user=self.config["user"],
                    password=self.config["password"]
                ) as conn:
                    with conn.cursor(cursor_factory=DictCursor) as cur:
                        # Prüfe Node-Status
                        cur.execute("SELECT pg_is_in_recovery()")
                        is_replica = cur.fetchone()[0]
                        
                        node.role = "replica" if is_replica else "primary"
                        node.status = "healthy"
                        node.last_seen = datetime.now()
                        
                        # Replikationsverzögerung messen
                        if is_replica:
                            cur.execute("""
                                SELECT EXTRACT(EPOCH FROM (
                                    now() - pg_last_xact_replay_timestamp()
                                ))::float as lag
                            """)
                            node.replication_lag = cur.fetchone()[0] or 0.0
                            
            except Exception as e:
                logger.warning(f"Node {node.host} check failed: {e}")
                node.status = "unreachable"
                
                # Prüfe ob Failover notwendig
                if node.role == "primary":
                    await self.initiate_failover(node)
                    
    async def initiate_failover(self, failed_node: DatabaseNode):
        """Initiiert einen Failover-Prozess"""
        if self.failover_in_progress:
            logger.warning("Failover already in progress")
            return
            
        try:
            self.failover_in_progress = True
            start_time = datetime.now()
            
            # Wähle besten Replica-Node als neuen Primary
            new_primary = await self.select_new_primary()
            if not new_primary:
                raise Exception("No suitable replica found for promotion")
                
            # Promote Replica to Primary
            await self.promote_replica(new_primary)
            
            # Update Routing
            await self.update_connection_routing(new_primary)
            
            # Berechne Failover-Dauer
            duration = (datetime.now() - start_time).total_seconds()
            
            # Erstelle Failover-Event
            event = FailoverEvent(
                id=f"failover_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                old_primary=failed_node.host,
                new_primary=new_primary.host,
                duration=duration,
                success=True
            )
            
            # Update Metrics
            failover_duration.observe(duration)
            failover_total.inc()
            
            logger.info(f"Failover completed in {duration:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Failover failed: {e}")
            event = FailoverEvent(
                id=f"failover_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                old_primary=failed_node.host,
                new_primary="unknown",
                duration=0.0,
                success=False,
                error=str(e)
            )
            
        finally:
            self.failover_in_progress = False
            await self.store_failover_event(event)
            
    async def select_new_primary(self) -> Optional[DatabaseNode]:
        """Wählt den besten Replica-Node als neuen Primary"""
        replicas = [
            node for node in self.nodes.values()
            if node.role == "replica" and node.status == "healthy"
        ]
        
        if not replicas:
            return None
            
        # Wähle Replica mit geringster Verzögerung
        return min(replicas, key=lambda x: x.replication_lag)
        
    async def promote_replica(self, node: DatabaseNode):
        """Promoted einen Replica-Node zum Primary"""
        try:
            with psycopg2.connect(
                host=node.host,
                port=node.port,
                dbname=self.config["database"],
                user=self.config["user"],
                password=self.config["password"]
            ) as conn:
                with conn.cursor() as cur:
                    # Trigger Promotion
                    cur.execute("SELECT pg_promote(true, 60)")
                    
            # Warte auf Promotion
            for _ in range(20):  # Max 2 Sekunden
                if await self.is_node_primary(node):
                    return
                await asyncio.sleep(0.1)
                
            raise Exception("Promotion timeout")
            
        except Exception as e:
            raise Exception(f"Promotion failed: {e}")
            
    async def is_node_primary(self, node: DatabaseNode) -> bool:
        """Prüft ob ein Node Primary ist"""
        try:
            with psycopg2.connect(
                host=node.host,
                port=node.port,
                dbname=self.config["database"],
                user=self.config["user"],
                password=self.config["password"]
            ) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT pg_is_in_recovery()")
                    return not cur.fetchone()[0]
        except:
            return False
            
    async def update_connection_routing(self, new_primary: DatabaseNode):
        """Aktualisiert das Connection Routing"""
        # Update PgBouncer Konfiguration
        await self.update_pgbouncer_config(new_primary)
        
        # Update Application Connection Pool
        await self.update_app_connection_pool(new_primary)
        
    async def update_metrics(self):
        """Aktualisiert die Prometheus Metriken"""
        for node in self.nodes.values():
            if node.role == "replica":
                replication_lag.labels(
                    host=node.host
                ).set(node.replication_lag)
                
    async def store_failover_event(self, event: FailoverEvent):
        """Speichert ein Failover-Event"""
        self.redis.set(
            f"failover_event:{event.id}",
            event.json(),
            ex=86400  # 24 Stunden TTL
        )
        
    async def update_pgbouncer_config(self, new_primary: DatabaseNode):
        """Aktualisiert die PgBouncer-Konfiguration"""
        # TODO: Implementierung der PgBouncer-Konfiguration
        pass
        
    async def update_app_connection_pool(self, new_primary: DatabaseNode):
        """Aktualisiert den Application Connection Pool"""
        # TODO: Implementierung des Connection Pool Updates
        pass 