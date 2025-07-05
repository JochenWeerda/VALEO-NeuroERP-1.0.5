#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Edge Network Resilience Framework.

Dieses Modul integriert die Komponenten des Edge Network Resilience Frameworks
für eine robuste Offline-Funktionalität in Edge-Umgebungen.
"""

import asyncio
import json
import logging
import os
from typing import Dict, List, Optional, Any, Callable, Union

from .offline_manager import OfflineManager, NetworkStatus
from .sync_queue import SyncQueue, SyncItem, SyncItemStatus, SyncItemPriority

# Logging konfigurieren
logger = logging.getLogger("edge_resilience")

class EdgeNetworkResilience:
    """
    Hauptklasse für das Edge Network Resilience Framework.
    
    Diese Klasse integriert den Offline-Manager und die Synchronisations-Queue
    für eine robuste Offline-Funktionalität in Edge-Umgebungen.
    """
    
    def __init__(
        self,
        config_path: Optional[str] = None,
        db_path: str = "edge_resilience.db",
        api_endpoint: str = "https://api.example.com/v1"
    ):
        """
        Initialisiert das Edge Network Resilience Framework.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
            db_path: Pfad zur SQLite-Datenbank für die Synchronisations-Queue
            api_endpoint: URL des API-Endpunkts
        """
        # Konfiguration laden
        self.config = self._load_config(config_path) if config_path else {}
        
        # Offline-Manager initialisieren
        offline_config = self.config.get("offline_manager", {})
        self.offline_manager = OfflineManager(offline_config)
        
        # Synchronisations-Queue initialisieren
        self.sync_queue = SyncQueue(db_path)
        
        # API-Endpunkt
        self.api_endpoint = api_endpoint
        
        # Event-Handler registrieren
        self._register_event_handlers()
        
        # Hintergrundaufgaben
        self._background_tasks = []
        
        # Konfiguriere Logger
        self._setup_logging()
        
        logger.info("Edge Network Resilience Framework initialisiert")
    
    def _setup_logging(self):
        """Konfiguriert das Logging für das Framework."""
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """
        Lädt die Konfiguration aus einer JSON-Datei.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
            
        Returns:
            Dictionary mit Konfigurationsparametern
        """
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Fehler beim Laden der Konfiguration: {e}")
            return {}
    
    def _register_event_handlers(self):
        """Registriert Event-Handler für Offline-Manager und Synchronisations-Queue."""
        # Offline-Manager-Events
        self.offline_manager.register_status_listener(self._handle_network_status_change)
        
        # Synchronisations-Queue-Events
        self.sync_queue.register_listener("added", self._handle_sync_item_added)
        self.sync_queue.register_listener("completed", self._handle_sync_item_completed)
        self.sync_queue.register_listener("failed", self._handle_sync_item_failed)
        self.sync_queue.register_listener("conflict", self._handle_sync_item_conflict)
    
    def _handle_network_status_change(self, status: NetworkStatus):
        """
        Handler für Änderungen des Netzwerkstatus.
        
        Args:
            status: Neuer Netzwerkstatus
        """
        logger.info(f"Netzwerkstatus geändert: {status.value}")
        
        if status == NetworkStatus.ONLINE:
            # Bei Wiederverbindung Synchronisation starten
            asyncio.create_task(self._process_pending_sync_items())
    
    def _handle_sync_item_added(self, item: SyncItem):
        """
        Handler für hinzugefügte Synchronisationselemente.
        
        Args:
            item: Hinzugefügtes Element
        """
        logger.info(f"Synchronisationselement hinzugefügt: {item.item_id}")
        
        # Wenn online, sofort verarbeiten
        if self.offline_manager.is_online():
            asyncio.create_task(self._process_sync_item(item))
    
    def _handle_sync_item_completed(self, item: SyncItem):
        """
        Handler für abgeschlossene Synchronisationselemente.
        
        Args:
            item: Abgeschlossenes Element
        """
        logger.info(f"Synchronisationselement abgeschlossen: {item.item_id}")
    
    def _handle_sync_item_failed(self, item: SyncItem):
        """
        Handler für fehlgeschlagene Synchronisationselemente.
        
        Args:
            item: Fehlgeschlagenes Element
        """
        logger.warning(f"Synchronisationselement fehlgeschlagen: {item.item_id}")
    
    def _handle_sync_item_conflict(self, item: SyncItem):
        """
        Handler für Synchronisationselemente mit Konflikten.
        
        Args:
            item: Element mit Konflikt
        """
        logger.warning(f"Konflikt bei Synchronisationselement: {item.item_id}")
    
    async def _process_sync_item(self, item: SyncItem) -> bool:
        """
        Verarbeitet ein einzelnes Synchronisationselement.
        
        Args:
            item: Zu verarbeitendes Element
            
        Returns:
            True, wenn die Verarbeitung erfolgreich war, sonst False
        """
        import aiohttp
        
        if not self.offline_manager.is_online():
            logger.warning(f"Kann Element {item.item_id} nicht verarbeiten: Offline")
            return False
        
        try:
            # URL für die Operation bestimmen
            url = f"{self.api_endpoint}/{item.entity_type}"
            if item.operation in ["update", "delete"]:
                url = f"{url}/{item.entity_id}"
            
            # HTTP-Methode bestimmen
            method = {
                "create": "POST",
                "update": "PUT",
                "delete": "DELETE",
                "get": "GET"
            }.get(item.operation, "POST")
            
            # Anfrage senden
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    json=item.data if item.operation != "delete" else None,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                ) as response:
                    if response.status in [200, 201, 204]:
                        logger.info(f"Element {item.item_id} erfolgreich synchronisiert")
                        return True
                    else:
                        logger.error(f"Fehler bei Synchronisation von {item.item_id}: Status {response.status}")
                        return False
        
        except Exception as e:
            logger.error(f"Fehler bei Verarbeitung von {item.item_id}: {e}")
            return False
    
    async def _process_pending_sync_items(self):
        """Verarbeitet alle ausstehenden Synchronisationselemente."""
        logger.info("Verarbeite ausstehende Synchronisationselemente")
        
        # Nur verarbeiten, wenn online
        if not self.offline_manager.is_online():
            logger.warning("Kann ausstehende Elemente nicht verarbeiten: Offline")
            return
        
        # Queue-Verarbeitung starten
        await self.sync_queue.process_queue(self._process_sync_item)
    
    async def start(self):
        """Startet das Edge Network Resilience Framework."""
        logger.info("Starte Edge Network Resilience Framework")
        
        # Konnektivitätsmonitor starten
        health_endpoint = f"{self.api_endpoint}/health"
        monitor_interval = self.config.get("connectivity_check_interval", 30)
        
        monitor_task = asyncio.create_task(
            self.offline_manager.start_connectivity_monitor(health_endpoint, monitor_interval)
        )
        self._background_tasks.append(monitor_task)
        
        # Queue-Verarbeitung starten, wenn online
        if self.offline_manager.is_online():
            queue_task = asyncio.create_task(self._process_pending_sync_items())
            self._background_tasks.append(queue_task)
    
    async def stop(self):
        """Stoppt das Edge Network Resilience Framework."""
        logger.info("Stoppe Edge Network Resilience Framework")
        
        # Hintergrundaufgaben abbrechen
        for task in self._background_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        
        self._background_tasks = []
    
    def add_sync_item(
        self,
        entity_type: str,
        entity_id: str,
        operation: str,
        data: Dict[str, Any] = None,
        priority: SyncItemPriority = SyncItemPriority.NORMAL
    ) -> str:
        """
        Fügt ein Element zur Synchronisationswarteschlange hinzu.
        
        Args:
            entity_type: Typ der Entität (z.B. "customer", "order")
            entity_id: ID der Entität
            operation: Operation (z.B. "create", "update", "delete")
            data: Zu synchronisierende Daten
            priority: Priorität des Elements
            
        Returns:
            ID des hinzugefügten Elements
        """
        item = SyncItem(
            entity_type=entity_type,
            entity_id=entity_id,
            operation=operation,
            data=data or {},
            priority=priority
        )
        
        return self.sync_queue.add_item(item)
    
    def get_sync_item(self, item_id: str) -> Optional[SyncItem]:
        """
        Holt ein Element aus der Synchronisationswarteschlange.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            Das gefundene Element oder None, wenn nicht gefunden
        """
        return self.sync_queue.get_item(item_id)
    
    def get_sync_stats(self) -> Dict[str, Any]:
        """
        Gibt Statistiken zur Synchronisation zurück.
        
        Returns:
            Dictionary mit Statistiken
        """
        queue_stats = self.sync_queue.get_queue_stats()
        network_status = self.offline_manager.get_status_info()
        
        return {
            "queue": queue_stats,
            "network": network_status
        }
    
    def is_online(self) -> bool:
        """
        Prüft, ob das System online ist.
        
        Returns:
            True, wenn das System online ist, sonst False
        """
        return self.offline_manager.is_online()

# Beispielverwendung
async def main():
    """Hauptfunktion für Beispielverwendung."""
    # Edge Network Resilience Framework initialisieren
    framework = EdgeNetworkResilience(
        db_path="edge_resilience.db",
        api_endpoint="https://api.example.com/v1"
    )
    
    # Framework starten
    await framework.start()
    
    # Element zur Synchronisation hinzufügen
    item_id = framework.add_sync_item(
        entity_type="customer",
        entity_id="12345",
        operation="update",
        data={"name": "Max Mustermann", "email": "max@example.com"},
        priority=SyncItemPriority.HIGH
    )
    
    print(f"Element hinzugefügt: {item_id}")
    
    # Statistiken abrufen
    stats = framework.get_sync_stats()
    print(f"Statistiken: {stats}")
    
    # Warten auf Verarbeitung
    await asyncio.sleep(60)
    
    # Framework stoppen
    await framework.stop()

if __name__ == "__main__":
    asyncio.run(main()) 