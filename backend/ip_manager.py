"""
IP-Manager-Service

Zentrale Verwaltung von IP-Adressen und Ports für Microservices.
Ermöglicht dynamische Portzuweisung und verhindert Konflikte.
"""

import os
import sys
import json
import time
import logging
import socket
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Set

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ip_manager.log')
    ]
)
logger = logging.getLogger("ip_manager")

class IPManagerService:
    """
    Service zur zentralen Verwaltung von IP-Adressen und Ports für Microservices.
    """
    
    def __init__(self, config_path: str = "ip_manager_config.json"):
        """
        Initialisiert den IP-Manager-Service.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
        """
        # Standardkonfiguration
        self.default_config = {
            "service_ip_base": "127.0.0.1",
            "default_port_range": [8000, 9000],
            "environment": "development",
            "reserved_ports": [80, 443, 3000, 3001, 5000, 5001],
            "port_allocation_strategy": "sequential",  # 'sequential' oder 'random'
            "service_type_ranges": {
                "api": [8000, 8099],
                "web": [3000, 3099],
                "database": [5000, 5099],
                "observer": [8010, 8010],
                "finance": [8007, 8007],
                "minimal": [8005, 8005]
            },
            "fallback_mode": True,  # Aktiviert den Fallback-Modus
            "data_dir": "ip_manager_data",
            "registry_file": "ip_registry.json",
            "allocation_retries": 3,  # Anzahl Versuche bei Portzuweisung
            "retry_delay": 1  # Sekunden zwischen Zuweisungsversuchen
        }
        
        # Konfiguration laden
        self.config = self._load_config(config_path)
        
        # Registry für IP-Adressen und Ports
        self.ip_registry: Dict[str, Dict[str, Any]] = {}
        
        # Set für belegte Ports
        self.reserved_ports: Set[int] = set(self.config.get("reserved_ports", []))
        
        # Datenverzeichnis
        self.data_dir = Path(self.config.get("data_dir", "ip_manager_data"))
        self.data_dir.mkdir(exist_ok=True)
        
        # Registry-Datei
        self.registry_file = self.data_dir / self.config.get("registry_file", "ip_registry.json")
        
        # Laden bestehender Registrierungen, falls vorhanden
        self._load_registry()
        
        # Speichern der Konfiguration, falls noch nicht vorhanden
        if not os.path.exists(config_path):
            self._save_config(config_path)
        
        # Lock für Thread-Sicherheit
        self.lock = threading.Lock()
        
        logger.info(f"IP-Manager-Service initialisiert in Umgebung: {self.config.get('environment')}")
        logger.info(f"Port-Zuweisung: {self.config.get('port_allocation_strategy')}")
        logger.info(f"Fallback-Modus: {'Aktiviert' if self.config.get('fallback_mode') else 'Deaktiviert'}")
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """
        Lädt die Konfiguration aus einer JSON-Datei oder erstellt eine Standardkonfiguration.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
            
        Returns:
            Die geladene Konfiguration als Dictionary
        """
        config = self.default_config.copy()
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    loaded_config = json.load(f)
                logger.info(f"Konfiguration geladen aus: {config_path}")
                
                # Konfiguration aktualisieren
                for key, value in loaded_config.items():
                    config[key] = value
        except Exception as e:
            logger.error(f"Fehler beim Laden der Konfiguration: {str(e)}")
            logger.info("Verwende Standardkonfiguration")
        
        return config
    
    def _save_config(self, config_path: str):
        """
        Speichert die aktuelle Konfiguration in einer JSON-Datei.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
        """
        try:
            with open(config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
            logger.info(f"Konfiguration gespeichert in: {config_path}")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Konfiguration: {str(e)}")
    
    def _load_registry(self):
        """Lädt die IP-Registry aus der JSON-Datei, falls vorhanden."""
        try:
            if self.registry_file.exists():
                with open(self.registry_file, 'r') as f:
                    self.ip_registry = json.load(f)
                
                # Belegte Ports aus dem Registry in das Set übernehmen
                for service_id, service_info in self.ip_registry.items():
                    if service_info.get("port"):
                        self.reserved_ports.add(service_info["port"])
                
                logger.info(f"IP-Registry geladen mit {len(self.ip_registry)} Einträgen")
                logger.debug(f"Belegte Ports: {sorted(list(self.reserved_ports))}")
        except Exception as e:
            logger.error(f"Fehler beim Laden der IP-Registry: {str(e)}")
            self.ip_registry = {}
    
    def _save_registry(self):
        """Speichert die IP-Registry in einer JSON-Datei."""
        try:
            with open(self.registry_file, 'w') as f:
                json.dump(self.ip_registry, f, indent=2)
            logger.debug(f"IP-Registry gespeichert in: {self.registry_file}")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der IP-Registry: {str(e)}")
    
    def _is_port_available(self, port: int) -> bool:
        """
        Prüft, ob ein Port verfügbar ist.
        
        Args:
            port: Der zu prüfende Port
            
        Returns:
            True, wenn der Port verfügbar ist, sonst False
        """
        # Prüfen, ob der Port bereits in der Registry ist
        if port in self.reserved_ports:
            return False
        
        # Testen, ob der Port tatsächlich verfügbar ist
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            
            # Wenn result != 0, ist der Port nicht belegt
            return result != 0
        except Exception as e:
            logger.warning(f"Fehler bei der Portverfügbarkeitsprüfung für Port {port}: {str(e)}")
            # Im Fehlerfall gehen wir davon aus, dass der Port nicht verfügbar ist
            return False
    
    def _assign_next_available_port(self, service_type: str = None, preferred_port: int = None) -> int:
        """
        Weist den nächsten verfügbaren Port zu.
        
        Args:
            service_type: Typ des Services für die Bestimmung des Portbereichs
            preferred_port: Bevorzugter Port, falls angegeben
            
        Returns:
            Verfügbarer Port oder -1, wenn kein Port verfügbar ist
        """
        # Versuche zuerst den bevorzugten Port, falls angegeben
        if preferred_port and self._is_port_available(preferred_port):
            return preferred_port
        
        # Bestimme den Portbereich basierend auf dem Service-Typ
        port_range = self.config.get("default_port_range", [8000, 9000])
        if service_type and service_type in self.config.get("service_type_ranges", {}):
            port_range = self.config["service_type_ranges"][service_type]
        
        # Strategie für die Portzuweisung
        strategy = self.config.get("port_allocation_strategy", "sequential")
        
        if strategy == "sequential":
            # Sequentielle Portzuweisung
            for port in range(port_range[0], port_range[1] + 1):
                if self._is_port_available(port):
                    return port
        elif strategy == "random":
            # Zufällige Portzuweisung
            import random
            ports = list(range(port_range[0], port_range[1] + 1))
            random.shuffle(ports)
            
            for port in ports:
                if self._is_port_available(port):
                    return port
        
        # Fallback: Wenn kein Port im angegebenen Bereich verfügbar ist,
        # suchen wir im gesamten Portbereich
        if self.config.get("fallback_mode", True) and service_type:
            logger.warning(f"Kein verfügbarer Port im Bereich für Service-Typ {service_type} gefunden")
            logger.info("Fallback: Suche im gesamten Portbereich")
            
            # Bereichsgrenzen für die Fallback-Suche
            full_range = self.config.get("default_port_range", [8000, 9000])
            
            if strategy == "sequential":
                for port in range(full_range[0], full_range[1] + 1):
                    if port >= port_range[0] and port <= port_range[1]:
                        continue  # Diesen Bereich haben wir bereits geprüft
                    
                    if self._is_port_available(port):
                        return port
            elif strategy == "random":
                import random
                ports = [p for p in range(full_range[0], full_range[1] + 1) 
                         if p < port_range[0] or p > port_range[1]]
                random.shuffle(ports)
                
                for port in ports:
                    if self._is_port_available(port):
                        return port
        
        # Wenn kein Port verfügbar ist
        logger.error("Kein verfügbarer Port gefunden")
        return -1
    
    def register_service(self, 
                         service_id: str, 
                         service_name: str, 
                         service_type: str = "generic",
                         preferred_port: int = None,
                         host: str = None,
                         **kwargs) -> Dict[str, Any]:
        """
        Registriert einen Service und weist eine IP-Adresse und einen Port zu.
        
        Args:
            service_id: Eindeutige ID des Services
            service_name: Name des Services
            service_type: Typ des Services für die Bestimmung des Portbereichs
            preferred_port: Bevorzugter Port, falls angegeben
            host: Bevorzugte IP-Adresse, falls angegeben
            **kwargs: Weitere Parameter für den Service
            
        Returns:
            Dictionary mit den Zuweisung (ip, port) und Status
        """
        with self.lock:
            # Prüfen, ob der Service bereits registriert ist
            if service_id in self.ip_registry:
                logger.info(f"Service bereits registriert: {service_id}")
                
                # Aktualisiere Heartbeat
                self.ip_registry[service_id]["last_heartbeat"] = datetime.now().isoformat()
                self._save_registry()
                
                return {
                    "ip": self.ip_registry[service_id]["ip"],
                    "port": self.ip_registry[service_id]["port"],
                    "status": "already_registered"
                }
            
            # Basis-IP bestimmen
            service_ip = host or self.config.get("service_ip_base", "127.0.0.1")
            
            # Port zuweisen
            max_retries = self.config.get("allocation_retries", 3)
            retry_delay = self.config.get("retry_delay", 1)
            
            for attempt in range(max_retries):
                port = self._assign_next_available_port(service_type, preferred_port)
                
                if port > 0:
                    # Port erfolgreich zugewiesen
                    self.reserved_ports.add(port)
                    
                    # Service registrieren
                    self.ip_registry[service_id] = {
                        "service_name": service_name,
                        "service_type": service_type,
                        "ip": service_ip,
                        "port": port,
                        "status": "active",
                        "registered_at": datetime.now().isoformat(),
                        "last_heartbeat": datetime.now().isoformat(),
                        "environment": self.config.get("environment", "development")
                    }
                    
                    # Weitere Parameter hinzufügen
                    for key, value in kwargs.items():
                        if key not in self.ip_registry[service_id]:
                            self.ip_registry[service_id][key] = value
                    
                    # Registry speichern
                    self._save_registry()
                    
                    logger.info(f"Service registriert: {service_id} auf {service_ip}:{port}")
                    
                    return {
                        "ip": service_ip,
                        "port": port,
                        "status": "registered"
                    }
                
                # Wenn kein Port verfügbar ist, warten und erneut versuchen
                logger.warning(f"Versuch {attempt+1}/{max_retries}: Kein Port verfügbar für {service_id}")
                
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
            
            # Wenn nach allen Versuchen kein Port zugewiesen werden konnte
            logger.error(f"Konnte keinen Port für Service {service_id} zuweisen")
            
            # Fallback: Wenn im Fallback-Modus, gib den bevorzugten Port zurück
            if self.config.get("fallback_mode", True) and preferred_port:
                logger.warning(f"Fallback: Verwende bevorzugten Port {preferred_port} für {service_id}")
                
                self.ip_registry[service_id] = {
                    "service_name": service_name,
                    "service_type": service_type,
                    "ip": service_ip,
                    "port": preferred_port,
                    "status": "fallback",
                    "registered_at": datetime.now().isoformat(),
                    "last_heartbeat": datetime.now().isoformat(),
                    "environment": self.config.get("environment", "development"),
                    "fallback_reason": "no_available_port"
                }
                
                # Weitere Parameter hinzufügen
                for key, value in kwargs.items():
                    if key not in self.ip_registry[service_id]:
                        self.ip_registry[service_id][key] = value
                
                # Registry speichern
                self._save_registry()
                
                return {
                    "ip": service_ip,
                    "port": preferred_port,
                    "status": "fallback"
                }
            
            return {
                "status": "error",
                "message": "Kein Port verfügbar"
            }
    
    def deregister_service(self, service_id: str) -> bool:
        """
        Meldet einen Service ab und gibt seinen Port frei.
        
        Args:
            service_id: ID des abzumeldenden Services
            
        Returns:
            True, wenn der Service erfolgreich abgemeldet wurde, sonst False
        """
        with self.lock:
            if service_id in self.ip_registry:
                # Port freigeben
                port = self.ip_registry[service_id].get("port")
                if port and port in self.reserved_ports:
                    self.reserved_ports.remove(port)
                
                # Service aus Registry entfernen
                del self.ip_registry[service_id]
                
                # Registry speichern
                self._save_registry()
                
                logger.info(f"Service abgemeldet: {service_id}")
                return True
            
            logger.warning(f"Service nicht gefunden für Abmeldung: {service_id}")
            return False
    
    def get_service_endpoint(self, service_id: str) -> Optional[str]:
        """
        Gibt den Endpunkt eines Services zurück.
        
        Args:
            service_id: ID des Services
            
        Returns:
            URL des Service-Endpunkts oder None, wenn der Service nicht gefunden wurde
        """
        if service_id in self.ip_registry:
            service = self.ip_registry[service_id]
            return f"http://{service['ip']}:{service['port']}"
        
        logger.warning(f"Service nicht gefunden: {service_id}")
        return None
    
    def get_service_info(self, service_id: str) -> Optional[Dict[str, Any]]:
        """
        Gibt die Informationen zu einem Service zurück.
        
        Args:
            service_id: ID des Services
            
        Returns:
            Dictionary mit Service-Informationen oder None, wenn nicht gefunden
        """
        return self.ip_registry.get(service_id)
    
    def list_services(self, service_type: str = None) -> List[Dict[str, Any]]:
        """
        Gibt eine Liste aller registrierten Services zurück.
        
        Args:
            service_type: Optional. Filtert nach Service-Typ
            
        Returns:
            Liste der registrierten Services
        """
        if service_type:
            return [service for service_id, service in self.ip_registry.items() 
                    if service.get("service_type") == service_type]
        
        return list(self.ip_registry.values())
    
    def heartbeat(self, service_id: str) -> bool:
        """
        Aktualisiert den Heartbeat eines Services.
        
        Args:
            service_id: ID des Services
            
        Returns:
            True, wenn der Heartbeat aktualisiert wurde, sonst False
        """
        with self.lock:
            if service_id in self.ip_registry:
                self.ip_registry[service_id]["last_heartbeat"] = datetime.now().isoformat()
                self._save_registry()
                return True
            
            logger.warning(f"Service nicht gefunden für Heartbeat: {service_id}")
            return False
    
    def check_stale_services(self, timeout_minutes: int = 30) -> List[str]:
        """
        Überprüft auf inaktive Services und gibt ihre IDs zurück.
        
        Args:
            timeout_minutes: Timeout in Minuten seit dem letzten Heartbeat
            
        Returns:
            Liste der IDs inaktiver Services
        """
        now = datetime.now()
        stale_services = []
        
        for service_id, service in self.ip_registry.items():
            last_heartbeat = service.get("last_heartbeat")
            if not last_heartbeat:
                continue
            
            try:
                heartbeat_time = datetime.fromisoformat(last_heartbeat)
                elapsed = now - heartbeat_time
                
                if elapsed.total_seconds() > timeout_minutes * 60:
                    stale_services.append(service_id)
            except ValueError:
                logger.warning(f"Ungültiges Heartbeat-Format für Service {service_id}: {last_heartbeat}")
        
        return stale_services
    
    def cleanup_stale_services(self, timeout_minutes: int = 30) -> int:
        """
        Bereinigt inaktive Services.
        
        Args:
            timeout_minutes: Timeout in Minuten seit dem letzten Heartbeat
            
        Returns:
            Anzahl der bereinigten Services
        """
        stale_services = self.check_stale_services(timeout_minutes)
        
        for service_id in stale_services:
            self.deregister_service(service_id)
        
        return len(stale_services)

# Singleton-Instanz des IP-Manager-Services
_ip_manager_instance = None

def get_ip_manager(config_path: str = "ip_manager_config.json") -> IPManagerService:
    """
    Gibt die Singleton-Instanz des IP-Manager-Services zurück.
    
    Args:
        config_path: Pfad zur Konfigurationsdatei
        
    Returns:
        Instanz des IP-Manager-Services
    """
    global _ip_manager_instance
    
    if _ip_manager_instance is None:
        _ip_manager_instance = IPManagerService(config_path)
    
    return _ip_manager_instance

if __name__ == "__main__":
    # Beispiel für die Verwendung des IP-Manager-Services
    ip_manager = get_ip_manager()
    
    # Service registrieren
    result = ip_manager.register_service(
        service_id="example-service-1",
        service_name="Example Service 1",
        service_type="api",
        preferred_port=8080
    )
    
    print(f"Registrierungsergebnis: {result}")
    
    # Alle Services auflisten
    services = ip_manager.list_services()
    print(f"Registrierte Services: {len(services)}")
    
    # Service-Endpunkt abrufen
    endpoint = ip_manager.get_service_endpoint("example-service-1")
    print(f"Endpunkt: {endpoint}")
    
    # Service abmelden
    ip_manager.deregister_service("example-service-1")
    print("Service abgemeldet") 