"""
Microservice-Registrierung für den Observer-Service.
Dieses Modul ermöglicht es Microservices, sich beim Observer-Service zu registrieren.
"""

import os
import sys
import json
import socket
import logging
import requests
import platform
import time
from typing import Dict, Any, Optional, List
from pathlib import Path

# Konfiguriere Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MicroserviceRegister")

# TODO: Erweiterung für zentrales IP-Adressmanagement
# Die MicroserviceRegister-Klasse soll um Funktionen für dynamische IP- und Port-Zuweisung 
# erweitert werden. Statt fest konfigurierter Ports sollen Services beim Start einen Port
# vom IP-Manager-Service anfordern und zugewiesen bekommen. Dies würde Portkonflikte vermeiden
# und die Containerisierung vorbereiten.
# 
# Geplante Erweiterungen:
# - Methode zum Anfordern eines Ports vom IP-Manager
# - Dynamische Endpunkt-Konfiguration basierend auf zugewiesenen Ports
# - Service-Discovery für die Kommunikation zwischen Microservices
# - Unterstützung für verschiedene Umgebungen (Entwicklung, Test, Produktion)
#
# Siehe memory-bank/archive/archive-ip-management.md für Details zum Konzept

class MicroserviceRegister:
    """
    Klasse zur Registrierung von Microservices beim Observer-Service.
    """
    
    def __init__(self, 
                 observer_url: str = None,
                 service_name: str = None,
                 service_type: str = "microservice",
                 port: int = None,
                 endpoints: List[str] = None,
                 health_endpoint: str = "/health",
                 restart_script: str = None,
                 ip_manager_url: str = None,
                 use_ip_manager: bool = True):
        """
        Initialisiert den Microservice-Register.
        
        Args:
            observer_url: URL des Observer-Services
            service_name: Name des Microservices
            service_type: Typ des Microservices
            port: Port, auf dem der Microservice läuft (optional bei Verwendung des IP-Managers)
            endpoints: Liste der API-Endpunkte des Microservices
            health_endpoint: Endpunkt für den Gesundheitsstatus
            restart_script: Pfad zum Skript, das den Microservice neu starten kann
            ip_manager_url: URL des IP-Manager-Services (optional)
            use_ip_manager: Gibt an, ob der IP-Manager für Portzuweisungen verwendet werden soll
        """
        self.observer_url = observer_url or os.environ.get("OBSERVER_URL", "http://localhost:8010/register")
        self.service_name = service_name
        self.service_type = service_type
        self.port = port or int(os.environ.get("PORT", "8000"))  # Standardport als Fallback
        self.endpoints = endpoints or []
        self.health_endpoint = health_endpoint
        self.hostname = socket.gethostname()
        self.host_ip = socket.gethostbyname(self.hostname)
        self.system_info = platform.system()
        self.restart_script = restart_script
        
        # IP-Manager-Konfiguration
        self.ip_manager_url = ip_manager_url or os.environ.get("IP_MANAGER_URL", "http://localhost:8020")
        self.use_ip_manager = use_ip_manager
        self.ip_manager_retries = 3  # Anzahl der Versuche für IP-Manager-Anfragen
        self.service_id = None  # Wird während der Registrierung gesetzt
        
        # Überprüfen, ob die wichtigsten Parameter gesetzt sind
        if not self.service_name:
            raise ValueError("service_name muss angegeben werden")
        
        # Standard-Neustart-Skript bestimmen, falls keines angegeben wurde
        if not self.restart_script:
            script_name = f"restart_{self.service_name.lower().replace('-', '_')}_service.ps1"
            self.restart_script = os.path.join("backend", "restart_scripts", script_name)
            
            # Prüfen, ob das Standard-Skript existiert
            if not os.path.exists(self.restart_script):
                logger.warning(f"Kein Neustart-Skript gefunden unter: {self.restart_script}")
                self.restart_script = None
            else:
                logger.info(f"Verwende Standard-Neustart-Skript: {self.restart_script}")
        
        # IP-Manager für Portzuweisung verwenden, falls aktiviert
        if self.use_ip_manager:
            self._register_with_ip_manager()
    
    def _register_with_ip_manager(self):
        """
        Registriert den Service beim IP-Manager und erhält einen Port zugewiesen.
        Falls der IP-Manager nicht verfügbar ist, wird der angegebene Port als Fallback verwendet.
        """
        if not self.use_ip_manager:
            logger.debug("IP-Manager ist deaktiviert, verwende angegebenen Port")
            return
        
        # Service-ID für den IP-Manager generieren
        self.service_id = f"{self.service_name}_{self.hostname}"
        
        # Daten für die IP-Manager-Registrierung vorbereiten
        register_data = {
            "service_id": self.service_id,
            "service_name": self.service_name,
            "service_type": self.service_type,
            "preferred_port": self.port,  # Ursprünglicher Port als Präferenz
            "additional_info": {
                "health_endpoint": self.health_endpoint,
                "restart_script": self.restart_script,
                "system_info": self.system_info
            }
        }
        
        # Versuche, beim IP-Manager zu registrieren
        for attempt in range(self.ip_manager_retries):
            try:
                logger.info(f"Registriere Service beim IP-Manager (Versuch {attempt+1}/{self.ip_manager_retries})...")
                response = requests.post(
                    f"{self.ip_manager_url}/register",
                    json=register_data,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                if response.status_code == 200:
                    result = response.json()
                    new_port = result.get("port")
                    new_ip = result.get("ip")
                    status = result.get("status")
                    
                    # Port und IP aus der Antwort verwenden
                    if new_port and new_ip:
                        logger.info(f"IP-Manager-Registrierung erfolgreich: {new_ip}:{new_port} (Status: {status})")
                        self.port = new_port
                        self.host_ip = new_ip
                        return
                    else:
                        logger.warning("IP-Manager-Antwort enthält keine gültigen Port/IP-Informationen")
                else:
                    logger.warning(f"IP-Manager-Registrierung fehlgeschlagen: HTTP {response.status_code}")
            
            except requests.RequestException as e:
                logger.warning(f"Fehler bei der IP-Manager-Verbindung: {str(e)}")
            
            # Warten vor dem nächsten Versuch, außer beim letzten
            if attempt < self.ip_manager_retries - 1:
                wait_time = 2 ** attempt  # Exponentielles Backoff
                logger.info(f"Warte {wait_time} Sekunden vor dem nächsten Versuch...")
                time.sleep(wait_time)
        
        logger.warning(f"IP-Manager nicht verfügbar nach {self.ip_manager_retries} Versuchen")
        logger.info(f"Fallback: Verwende den ursprünglich angegebenen Port {self.port}")
    
    def _deregister_from_ip_manager(self):
        """
        Meldet den Service vom IP-Manager ab.
        """
        if not self.use_ip_manager or not self.service_id:
            return
        
        try:
            logger.info(f"Melde Service vom IP-Manager ab: {self.service_id}")
            response = requests.post(
                f"{self.ip_manager_url}/deregister",
                json={"service_id": self.service_id},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info("Service erfolgreich vom IP-Manager abgemeldet")
            else:
                logger.warning(f"Fehler bei der IP-Manager-Abmeldung: HTTP {response.status_code}")
        
        except requests.RequestException as e:
            logger.warning(f"Fehler bei der IP-Manager-Verbindung: {str(e)}")
    
    def get_service_data(self) -> Dict[str, Any]:
        """
        Erstellt ein Dictionary mit den Service-Daten für die Registrierung.
        
        Returns:
            Dictionary mit Service-Daten
        """
        service_data = {
            "service_name": self.service_name,
            "service_type": self.service_type,
            "version": os.environ.get("SERVICE_VERSION", "0.1.0"),
            "host": self.host_ip,
            "port": self.port,
            "health_endpoint": self.health_endpoint,
            "api_endpoints": self.endpoints,
            "monitoring": {
                "log_level": os.environ.get("LOG_LEVEL", "info"),
                "metrics_enabled": True,
            },
            "system_info": self.system_info,
        }
        
        # Neustart-Skript hinzufügen, falls vorhanden
        if self.restart_script:
            service_data["restart_script"] = self.restart_script
        
        # IP-Manager-Service-ID hinzufügen, falls vorhanden
        if self.service_id and self.use_ip_manager:
            service_data["ip_manager_service_id"] = self.service_id
        
        return service_data
    
    def register(self) -> bool:
        """
        Registriert den Microservice beim Observer-Service.
        
        Returns:
            True, wenn die Registrierung erfolgreich war, sonst False
        """
        service_data = self.get_service_data()
        
        try:
            # Maximal 3 Versuche mit 5 Sekunden Wartezeit
            max_retries = 3
            retry_count = 0
            
            while retry_count < max_retries:
                try:
                    response = requests.post(
                        self.observer_url,
                        json=service_data,
                        headers={"Content-Type": "application/json"},
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        logger.info(f"Microservice {self.service_name} erfolgreich registriert")
                        return True
                    else:
                        logger.warning(f"Fehler bei der Registrierung: HTTP {response.status_code}")
                        retry_count += 1
                except (requests.RequestException, ConnectionError) as e:
                    logger.warning(f"Verbindungsfehler: {str(e)}")
                    retry_count += 1
                
                if retry_count < max_retries:
                    logger.info(f"Warte 5 Sekunden vor dem nächsten Versuch ({retry_count+1}/{max_retries})...")
                    import time
                    time.sleep(5)
            
            logger.error(f"Registrierung fehlgeschlagen nach {max_retries} Versuchen")
            return False
            
        except Exception as e:
            logger.error(f"Fehler bei der Registrierung: {str(e)}")
            return False
    
    @staticmethod
    def register_microservice(
        service_name: str,
        port: int,
        endpoints: List[str] = None,
        observer_url: str = None,
        restart_script: str = None,
        ip_manager_url: str = None,
        use_ip_manager: bool = True
    ) -> bool:
        """
        Statische Methode zur einfachen Registrierung eines Microservices.
        
        Args:
            service_name: Name des Microservices
            port: Port, auf dem der Microservice läuft (optional bei Verwendung des IP-Managers)
            endpoints: Liste der API-Endpunkte des Microservices
            observer_url: URL des Observer-Services
            restart_script: Pfad zum Skript, das den Microservice neu starten kann
            ip_manager_url: URL des IP-Manager-Services (optional)
            use_ip_manager: Gibt an, ob der IP-Manager für Portzuweisungen verwendet werden soll
            
        Returns:
            True, wenn die Registrierung erfolgreich war, sonst False
        """
        try:
            register = MicroserviceRegister(
                observer_url=observer_url,
                service_name=service_name,
                port=port,
                endpoints=endpoints,
                restart_script=restart_script,
                ip_manager_url=ip_manager_url,
                use_ip_manager=use_ip_manager
            )
            return register.register()
        except Exception as e:
            logger.error(f"Fehler bei der Registrierung von {service_name}: {str(e)}")
            return False

    def deregister(self):
        """
        Meldet den Microservice vom Observer-Service ab
        
        :return: True, wenn die Abmeldung erfolgreich war, sonst False
        """
        # Zuerst vom IP-Manager abmelden
        if self.use_ip_manager and self.service_id:
            self._deregister_from_ip_manager()
        
        # Dann vom Observer abmelden
        deregistration_data = {
            "service_name": self.service_name,
            "host": self.host_ip,
            "port": self.port
        }
        
        try:
            response = requests.post(
                f"{self.observer_url}/deregister", 
                json=deregistration_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                logger.info(f"Service {self.service_name} erfolgreich vom Observer abgemeldet")
                return True
            else:
                logger.error(f"Fehler bei der Abmeldung: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Verbindungsfehler beim Abmelden: {e}")
            return False 