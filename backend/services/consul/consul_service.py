"""
Consul Service für Service Discovery
"""
import consul
import socket
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

from backend.core.config import settings

# Logger Setup
logger = logging.getLogger(__name__)

@dataclass
class ServiceHealth:
    """Service Health Information"""
    status: str
    output: str
    timestamp: datetime

@dataclass
class ServiceInfo:
    """Service Information"""
    id: str
    name: str
    address: str
    port: int
    tags: List[str]
    meta: Dict[str, str]
    health: ServiceHealth

class ConsulService:
    """Consul Service Implementation"""
    
    def __init__(self):
        """Initialize Consul client"""
        self.client = consul.Consul(
            host=settings.CONSUL_HOST,
            port=settings.CONSUL_PORT,
            token=settings.CONSUL_TOKEN
        )
        self.datacenter = settings.CONSUL_DATACENTER
        
    async def register_service(
        self,
        service_name: str,
        service_id: Optional[str] = None,
        service_port: int = 8000,
        tags: Optional[List[str]] = None,
        meta: Optional[Dict[str, str]] = None
    ) -> bool:
        """Register a service with Consul"""
        try:
            # Service ID generieren wenn nicht angegeben
            if not service_id:
                service_id = f"{service_name}-{socket.gethostname()}"
                
            # Service registrieren
            success = self.client.agent.service.register(
                name=service_name,
                service_id=service_id,
                port=service_port,
                tags=tags or [],
                meta=meta or {},
                check={
                    "http": f"http://localhost:{service_port}/health",
                    "interval": "10s",
                    "timeout": "5s"
                }
            )
            
            if success:
                logger.info(f"Service {service_name} erfolgreich registriert")
                return True
            else:
                logger.error(f"Fehler bei der Registrierung von {service_name}")
                return False
                
        except Exception as e:
            logger.error(f"Service Registration Error: {str(e)}")
            return False
            
    async def deregister_service(self, service_id: str) -> bool:
        """Deregister a service from Consul"""
        try:
            success = self.client.agent.service.deregister(service_id)
            
            if success:
                logger.info(f"Service {service_id} erfolgreich deregistriert")
                return True
            else:
                logger.error(f"Fehler bei der Deregistrierung von {service_id}")
                return False
                
        except Exception as e:
            logger.error(f"Service Deregistration Error: {str(e)}")
            return False
            
    async def get_service(self, service_name: str) -> Optional[ServiceInfo]:
        """Get service information from Consul"""
        try:
            # Service Details abrufen
            index, services = self.client.health.service(service_name)
            
            if not services:
                return None
                
            # Ersten gesunden Service verwenden
            service = services[0]
            service_data = service["Service"]
            health_check = service["Checks"][0]
            
            return ServiceInfo(
                id=service_data["ID"],
                name=service_data["Service"],
                address=service_data["Address"],
                port=service_data["Port"],
                tags=service_data["Tags"],
                meta=service_data["Meta"],
                health=ServiceHealth(
                    status=health_check["Status"],
                    output=health_check["Output"],
                    timestamp=datetime.fromtimestamp(
                        health_check["CreateIndex"]
                    )
                )
            )
            
        except Exception as e:
            logger.error(f"Service Lookup Error: {str(e)}")
            return None
            
    async def get_healthy_services(
        self,
        service_name: str
    ) -> List[ServiceInfo]:
        """Get all healthy instances of a service"""
        try:
            # Alle gesunden Services abrufen
            index, services = self.client.health.service(
                service_name,
                passing=True
            )
            
            return [
                ServiceInfo(
                    id=service["Service"]["ID"],
                    name=service["Service"]["Service"],
                    address=service["Service"]["Address"],
                    port=service["Service"]["Port"],
                    tags=service["Service"]["Tags"],
                    meta=service["Service"]["Meta"],
                    health=ServiceHealth(
                        status=service["Checks"][0]["Status"],
                        output=service["Checks"][0]["Output"],
                        timestamp=datetime.fromtimestamp(
                            service["Checks"][0]["CreateIndex"]
                        )
                    )
                )
                for service in services
            ]
            
        except Exception as e:
            logger.error(f"Healthy Services Lookup Error: {str(e)}")
            return []
            
    async def put_kv(self, key: str, value: str) -> bool:
        """Put a value in Consul KV store"""
        try:
            success = self.client.kv.put(key, value)
            
            if success:
                logger.info(f"KV Pair {key} erfolgreich gespeichert")
                return True
            else:
                logger.error(f"Fehler beim Speichern von KV Pair {key}")
                return False
                
        except Exception as e:
            logger.error(f"KV Store Error: {str(e)}")
            return False
            
    async def get_kv(self, key: str) -> Optional[str]:
        """Get a value from Consul KV store"""
        try:
            index, data = self.client.kv.get(key)
            
            if data:
                return data["Value"].decode("utf-8")
            return None
            
        except Exception as e:
            logger.error(f"KV Lookup Error: {str(e)}")
            return None
            
    async def delete_kv(self, key: str) -> bool:
        """Delete a value from Consul KV store"""
        try:
            success = self.client.kv.delete(key)
            
            if success:
                logger.info(f"KV Pair {key} erfolgreich gelöscht")
                return True
            else:
                logger.error(f"Fehler beim Löschen von KV Pair {key}")
                return False
                
        except Exception as e:
            logger.error(f"KV Delete Error: {str(e)}")
            return False
            
    async def register_health_check(
        self,
        check_name: str,
        service_id: str,
        notes: Optional[str] = None,
        http_url: Optional[str] = None,
        interval: str = "10s",
        timeout: str = "5s"
    ) -> bool:
        """Register a health check with Consul"""
        try:
            check_id = f"service:{service_id}:{check_name}"
            
            # Health Check registrieren
            success = self.client.agent.check.register(
                name=check_name,
                check_id=check_id,
                service_id=service_id,
                notes=notes,
                http=http_url,
                interval=interval,
                timeout=timeout
            )
            
            if success:
                logger.info(f"Health Check {check_name} erfolgreich registriert")
                return True
            else:
                logger.error(
                    f"Fehler bei der Registrierung von Health Check {check_name}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Health Check Registration Error: {str(e)}")
            return False
            
    async def deregister_health_check(
        self,
        check_id: str
    ) -> bool:
        """Deregister a health check from Consul"""
        try:
            success = self.client.agent.check.deregister(check_id)
            
            if success:
                logger.info(f"Health Check {check_id} erfolgreich deregistriert")
                return True
            else:
                logger.error(
                    f"Fehler bei der Deregistrierung von Health Check {check_id}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Health Check Deregistration Error: {str(e)}")
            return False
            
# Consul Service Instance
consul_service = ConsulService() 