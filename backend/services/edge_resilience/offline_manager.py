#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Offline-Manager für das Edge Network Resilience Framework.

Dieser Modul stellt Funktionen für die Verwaltung des Offline-Modus für Edge-Geräte bereit.
"""

import asyncio
import json
import logging
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable

# Logging konfigurieren
logger = logging.getLogger("edge_resilience.offline_manager")

class NetworkStatus(Enum):
    """Netzwerkstatus für Edge-Geräte."""
    ONLINE = "online"
    OFFLINE = "offline"
    UNSTABLE = "unstable"
    RECONNECTING = "reconnecting"

class OfflineManager:
    """
    Manager für den Offline-Modus von Edge-Geräten.
    
    Diese Klasse bietet Funktionen zur Erkennung des Netzwerkstatus,
    zur Umschaltung zwischen Online- und Offline-Modus und zur Verwaltung
    des Offline-Zustands.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialisiert den Offline-Manager.
        
        Args:
            config: Optionale Konfiguration für den Offline-Manager
        """
        self.config = config or {}
        self.network_status = NetworkStatus.ONLINE
        self.last_online_timestamp = datetime.now()
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = self.config.get("max_reconnect_attempts", 10)
        self.reconnect_interval = self.config.get("reconnect_interval", 5)  # Sekunden
        self.status_listeners: List[Callable[[NetworkStatus], None]] = []
        
        # Konfiguriere Logger
        self._setup_logging()
        
        logger.info("Offline-Manager initialisiert")
    
    def _setup_logging(self):
        """Konfiguriert das Logging für den Offline-Manager."""
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    def register_status_listener(self, listener: Callable[[NetworkStatus], None]):
        """
        Registriert einen Listener für Statusänderungen.
        
        Args:
            listener: Funktion, die bei Statusänderungen aufgerufen wird
        """
        self.status_listeners.append(listener)
        logger.debug(f"Status-Listener registriert: {listener}")
    
    def _notify_status_change(self, status: NetworkStatus):
        """
        Benachrichtigt alle registrierten Listener über eine Statusänderung.
        
        Args:
            status: Neuer Netzwerkstatus
        """
        for listener in self.status_listeners:
            try:
                listener(status)
            except Exception as e:
                logger.error(f"Fehler beim Benachrichtigen des Listeners: {e}")
    
    def set_network_status(self, status: NetworkStatus):
        """
        Setzt den Netzwerkstatus.
        
        Args:
            status: Neuer Netzwerkstatus
        """
        if self.network_status != status:
            logger.info(f"Netzwerkstatus geändert: {self.network_status} -> {status}")
            self.network_status = status
            
            if status == NetworkStatus.ONLINE:
                self.last_online_timestamp = datetime.now()
                self.reconnect_attempts = 0
            
            self._notify_status_change(status)
    
    def is_online(self) -> bool:
        """
        Prüft, ob das Gerät online ist.
        
        Returns:
            True, wenn das Gerät online ist, sonst False
        """
        return self.network_status == NetworkStatus.ONLINE
    
    def is_offline(self) -> bool:
        """
        Prüft, ob das Gerät offline ist.
        
        Returns:
            True, wenn das Gerät offline ist, sonst False
        """
        return self.network_status == NetworkStatus.OFFLINE
    
    async def check_network_connectivity(self, endpoint: str) -> bool:
        """
        Prüft die Netzwerkkonnektivität zu einem Endpunkt.
        
        Args:
            endpoint: URL des zu prüfenden Endpunkts
            
        Returns:
            True, wenn der Endpunkt erreichbar ist, sonst False
        """
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(endpoint, timeout=5) as response:
                    if response.status == 200:
                        if self.network_status != NetworkStatus.ONLINE:
                            self.set_network_status(NetworkStatus.ONLINE)
                        return True
                    else:
                        logger.warning(f"Endpunkt {endpoint} nicht erreichbar: Status {response.status}")
                        return False
        except aiohttp.ClientError as e:
            logger.error(f"Netzwerkfehler beim Zugriff auf {endpoint}: {e}")
            if self.network_status == NetworkStatus.ONLINE:
                self.set_network_status(NetworkStatus.OFFLINE)
            return False
        except asyncio.TimeoutError:
            logger.error(f"Timeout beim Zugriff auf {endpoint}")
            if self.network_status == NetworkStatus.ONLINE:
                self.set_network_status(NetworkStatus.UNSTABLE)
            return False
    
    async def start_connectivity_monitor(self, endpoint: str, interval: int = 30):
        """
        Startet einen Monitor für die Netzwerkkonnektivität.
        
        Args:
            endpoint: URL des zu überwachenden Endpunkts
            interval: Intervall in Sekunden zwischen den Prüfungen
        """
        logger.info(f"Starte Konnektivitätsmonitor für {endpoint} (Intervall: {interval}s)")
        
        while True:
            await self.check_network_connectivity(endpoint)
            await asyncio.sleep(interval)
    
    async def reconnect(self, endpoint: str) -> bool:
        """
        Versucht, die Verbindung wiederherzustellen.
        
        Args:
            endpoint: URL des Endpunkts für die Wiederverbindung
            
        Returns:
            True, wenn die Wiederverbindung erfolgreich war, sonst False
        """
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error(f"Maximale Anzahl an Wiederverbindungsversuchen erreicht: {self.max_reconnect_attempts}")
            return False
        
        self.reconnect_attempts += 1
        self.set_network_status(NetworkStatus.RECONNECTING)
        
        # Exponentieller Backoff
        backoff_time = min(self.reconnect_interval * (2 ** (self.reconnect_attempts - 1)), 300)  # Max 5 Minuten
        logger.info(f"Wiederverbindungsversuch {self.reconnect_attempts}/{self.max_reconnect_attempts} in {backoff_time}s")
        
        await asyncio.sleep(backoff_time)
        
        # Versuche Wiederverbindung
        if await self.check_network_connectivity(endpoint):
            logger.info("Wiederverbindung erfolgreich")
            self.set_network_status(NetworkStatus.ONLINE)
            return True
        else:
            logger.warning("Wiederverbindung fehlgeschlagen")
            return False
    
    async def start_reconnect_loop(self, endpoint: str):
        """
        Startet eine Schleife für Wiederverbindungsversuche.
        
        Args:
            endpoint: URL des Endpunkts für die Wiederverbindung
        """
        logger.info("Starte Wiederverbindungsschleife")
        
        while self.network_status != NetworkStatus.ONLINE and self.reconnect_attempts < self.max_reconnect_attempts:
            if await self.reconnect(endpoint):
                break
        
        if self.network_status != NetworkStatus.ONLINE:
            logger.error("Wiederverbindung endgültig fehlgeschlagen")
    
    def get_offline_duration(self) -> float:
        """
        Gibt die Dauer des Offline-Zustands in Sekunden zurück.
        
        Returns:
            Dauer des Offline-Zustands in Sekunden
        """
        if self.is_online():
            return 0
        
        return (datetime.now() - self.last_online_timestamp).total_seconds()
    
    def get_status_info(self) -> Dict[str, Any]:
        """
        Gibt Informationen zum aktuellen Status zurück.
        
        Returns:
            Dictionary mit Statusinformationen
        """
        return {
            "status": self.network_status.value,
            "last_online": self.last_online_timestamp.isoformat(),
            "offline_duration": self.get_offline_duration(),
            "reconnect_attempts": self.reconnect_attempts,
            "max_reconnect_attempts": self.max_reconnect_attempts
        }
    
    def to_json(self) -> str:
        """
        Konvertiert den Status in JSON.
        
        Returns:
            JSON-Repräsentation des Status
        """
        return json.dumps(self.get_status_info())

# Beispielverwendung
async def main():
    """Hauptfunktion für Beispielverwendung."""
    # Konfiguration
    config = {
        "max_reconnect_attempts": 5,
        "reconnect_interval": 3
    }
    
    # Offline-Manager erstellen
    manager = OfflineManager(config)
    
    # Status-Listener registrieren
    def status_listener(status):
        print(f"Status geändert: {status}")
    
    manager.register_status_listener(status_listener)
    
    # Konnektivität prüfen
    endpoint = "https://api.example.com/health"
    is_online = await manager.check_network_connectivity(endpoint)
    print(f"Online: {is_online}")
    
    # Status-Informationen ausgeben
    print(f"Status: {manager.get_status_info()}")
    
    # Konnektivitätsmonitor starten (im Hintergrund)
    asyncio.create_task(manager.start_connectivity_monitor(endpoint, 10))
    
    # Warte auf Statusänderungen
    await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(main()) 