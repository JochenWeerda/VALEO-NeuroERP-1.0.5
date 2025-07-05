"""
Redis Cluster Manager für VALEO-NeuroERP
"""
from typing import List, Dict, Optional
import asyncio
import logging
from datetime import datetime
import aioredis
from redis.cluster import RedisCluster, ClusterNode
import psutil
from kubernetes import client, config
from backend.monitoring.metrics import metrics
from backend.core.config import settings

logger = logging.getLogger(__name__)

class RedisClusterManager:
    def __init__(
        self,
        initial_nodes: List[Dict[str, str]],
        namespace: str = "valeo-neuroerp",
        min_nodes: int = 3,
        max_nodes: int = 10
    ):
        """
        Initialisiert den Redis Cluster Manager
        
        Args:
            initial_nodes: Liste der initialen Redis Nodes
            namespace: Kubernetes Namespace
            min_nodes: Minimale Anzahl Nodes
            max_nodes: Maximale Anzahl Nodes
        """
        self.initial_nodes = initial_nodes
        self.namespace = namespace
        self.min_nodes = min_nodes
        self.max_nodes = max_nodes
        
        # Kubernetes Client
        config.load_incluster_config()
        self.k8s_apps = client.AppsV1Api()
        
        # Redis Cluster
        self.cluster: Optional[RedisCluster] = None
        
        # Metriken
        self.last_scale_time = datetime.now()
        self.scale_cooldown = 300  # 5 Minuten
        
    async def connect(self):
        """Verbindung zum Redis Cluster herstellen"""
        try:
            startup_nodes = [
                ClusterNode(host=node["host"], port=int(node["port"]))
                for node in self.initial_nodes
            ]
            
            self.cluster = RedisCluster(
                startup_nodes=startup_nodes,
                decode_responses=True,
                skip_full_coverage_check=True
            )
            
            logger.info("Erfolgreich mit Redis Cluster verbunden")
            
        except Exception as e:
            logger.error(f"Fehler beim Verbinden mit Redis Cluster: {str(e)}")
            raise
            
    async def get_cluster_info(self) -> Dict:
        """Cluster-Informationen abrufen"""
        if not self.cluster:
            await self.connect()
            
        info = {}
        for node in self.cluster.get_nodes():
            node_info = node.info()
            info[f"{node.host}:{node.port}"] = {
                "role": node_info["role"],
                "connected_clients": node_info["connected_clients"],
                "used_memory": node_info["used_memory"],
                "keys": node_info["db0"]["keys"]
            }
            
        return info
        
    async def monitor_cluster(self):
        """Überwacht den Cluster-Status und skaliert bei Bedarf"""
        while True:
            try:
                # Cluster-Metriken sammeln
                cluster_info = await self.get_cluster_info()
                
                for node_id, info in cluster_info.items():
                    # Redis Metriken aufzeichnen
                    metrics.track_redis_metrics(
                        node=node_id,
                        clients=info["connected_clients"],
                        memory=info["used_memory"]
                    )
                    
                # Skalierungsbedarf prüfen
                await self.check_scaling_needs(cluster_info)
                
            except Exception as e:
                logger.error(f"Fehler beim Cluster-Monitoring: {str(e)}")
                
            await asyncio.sleep(60)  # 1 Minute Pause
            
    async def check_scaling_needs(self, cluster_info: Dict):
        """
        Prüft ob Skalierung notwendig ist
        
        Args:
            cluster_info: Aktuelle Cluster-Informationen
        """
        try:
            # Cooldown prüfen
            if (datetime.now() - self.last_scale_time).total_seconds() < self.scale_cooldown:
                return
                
            current_nodes = len(cluster_info)
            
            # Metriken berechnen
            total_memory = sum(
                info["used_memory"] for info in cluster_info.values()
            )
            avg_memory = total_memory / current_nodes
            
            total_clients = sum(
                info["connected_clients"] for info in cluster_info.values()
            )
            avg_clients = total_clients / current_nodes
            
            # CPU-Auslastung prüfen
            cpu_load = psutil.cpu_percent()
            
            # Skalierungsentscheidung
            if self.should_scale_out(avg_memory, avg_clients, cpu_load, current_nodes):
                await self.scale_out()
            elif self.should_scale_in(avg_memory, avg_clients, cpu_load, current_nodes):
                await self.scale_in()
                
        except Exception as e:
            logger.error(f"Fehler bei Skalierungsprüfung: {str(e)}")
            
    def should_scale_out(
        self,
        avg_memory: int,
        avg_clients: int,
        cpu_load: float,
        current_nodes: int
    ) -> bool:
        """Prüft ob Hochskalierung notwendig ist"""
        if current_nodes >= self.max_nodes:
            return False
            
        # Skalierungskriterien
        memory_threshold = 0.75 * settings.REDIS_MAX_MEMORY  # 75% Speicherauslastung
        clients_threshold = settings.REDIS_MAX_CLIENTS * 0.8  # 80% Client-Auslastung
        cpu_threshold = 80.0  # 80% CPU-Auslastung
        
        return (
            avg_memory > memory_threshold or
            avg_clients > clients_threshold or
            cpu_load > cpu_threshold
        )
        
    def should_scale_in(
        self,
        avg_memory: int,
        avg_clients: int,
        cpu_load: float,
        current_nodes: int
    ) -> bool:
        """Prüft ob Herunterskalierung möglich ist"""
        if current_nodes <= self.min_nodes:
            return False
            
        # Skalierungskriterien
        memory_threshold = 0.3 * settings.REDIS_MAX_MEMORY  # 30% Speicherauslastung
        clients_threshold = settings.REDIS_MAX_CLIENTS * 0.3  # 30% Client-Auslastung
        cpu_threshold = 30.0  # 30% CPU-Auslastung
        
        return (
            avg_memory < memory_threshold and
            avg_clients < clients_threshold and
            cpu_load < cpu_threshold
        )
        
    async def scale_out(self):
        """Fügt einen neuen Redis Node hinzu"""
        try:
            # StatefulSet skalieren
            current = self.k8s_apps.read_namespaced_stateful_set(
                name="redis-cluster",
                namespace=self.namespace
            )
            
            if current.spec.replicas < self.max_nodes:
                current.spec.replicas += 1
                
                self.k8s_apps.patch_namespaced_stateful_set(
                    name="redis-cluster",
                    namespace=self.namespace,
                    body=current
                )
                
                logger.info(f"Redis Cluster auf {current.spec.replicas} Nodes hochskaliert")
                self.last_scale_time = datetime.now()
                
        except Exception as e:
            logger.error(f"Fehler beim Hochskalieren: {str(e)}")
            
    async def scale_in(self):
        """Entfernt einen Redis Node"""
        try:
            # StatefulSet skalieren
            current = self.k8s_apps.read_namespaced_stateful_set(
                name="redis-cluster",
                namespace=self.namespace
            )
            
            if current.spec.replicas > self.min_nodes:
                # Daten vom zu entfernenden Node migrieren
                await self.migrate_data(current.spec.replicas - 1)
                
                current.spec.replicas -= 1
                
                self.k8s_apps.patch_namespaced_stateful_set(
                    name="redis-cluster",
                    namespace=self.namespace,
                    body=current
                )
                
                logger.info(f"Redis Cluster auf {current.spec.replicas} Nodes herunterskaliert")
                self.last_scale_time = datetime.now()
                
        except Exception as e:
            logger.error(f"Fehler beim Herunterskalieren: {str(e)}")
            
    async def migrate_data(self, node_index: int):
        """
        Migriert Daten von einem Node bevor er entfernt wird
        
        Args:
            node_index: Index des zu entfernenden Nodes
        """
        try:
            # Redis Cluster API für Resharding nutzen
            node_id = f"redis-cluster-{node_index}"
            
            # Reshard-Plan erstellen
            reshard_plan = self.cluster.create_reshard_plan(node_id)
            
            # Resharding durchführen
            for step in reshard_plan:
                await self.cluster.execute_reshard_step(step)
                
            logger.info(f"Daten von Node {node_id} erfolgreich migriert")
            
        except Exception as e:
            logger.error(f"Fehler bei Datenmigration: {str(e)}")
            raise 