#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beispiel für die Verwendung des Edge Network Resilience Frameworks.

Dieses Beispiel zeigt, wie das Edge Network Resilience Framework
in einer Anwendung verwendet werden kann.
"""

import asyncio
import json
import logging
import os
import sys

# Füge das übergeordnete Verzeichnis zum Pfad hinzu, um die Module zu importieren
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from edge_resilience import EdgeNetworkResilience, SyncItemPriority

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("example_usage")

async def main():
    """Hauptfunktion für das Beispiel."""
    logger.info("Starte Beispiel für das Edge Network Resilience Framework")
    
    # Konfigurationsdatei erstellen
    config_path = "edge_resilience_config.json"
    config = {
        "offline_manager": {
            "max_reconnect_attempts": 5,
            "reconnect_interval": 3
        },
        "connectivity_check_interval": 10
    }
    
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    logger.info(f"Konfigurationsdatei erstellt: {config_path}")
    
    # Edge Network Resilience Framework initialisieren
    framework = EdgeNetworkResilience(
        config_path=config_path,
        db_path="edge_resilience_example.db",
        api_endpoint="https://api.example.com/v1"
    )
    
    logger.info("Framework initialisiert")
    
    # Framework starten
    await framework.start()
    logger.info("Framework gestartet")
    
    # Elemente zur Synchronisation hinzufügen
    customer_id = framework.add_sync_item(
        entity_type="customer",
        entity_id="12345",
        operation="create",
        data={
            "name": "Max Mustermann",
            "email": "max@example.com",
            "address": {
                "street": "Musterstraße 123",
                "city": "Musterstadt",
                "zip": "12345"
            }
        },
        priority=SyncItemPriority.HIGH
    )
    logger.info(f"Kunde hinzugefügt: {customer_id}")
    
    order_id = framework.add_sync_item(
        entity_type="order",
        entity_id="ORD-001",
        operation="create",
        data={
            "customer_id": "12345",
            "items": [
                {"product_id": "P001", "quantity": 2, "price": 29.99},
                {"product_id": "P002", "quantity": 1, "price": 49.99}
            ],
            "total": 109.97,
            "status": "pending"
        }
    )
    logger.info(f"Bestellung hinzugefügt: {order_id}")
    
    # Statistiken abrufen
    stats = framework.get_sync_stats()
    logger.info(f"Statistiken: {json.dumps(stats, indent=2)}")
    
    # Simuliere Online/Offline-Wechsel
    logger.info("Simuliere Offline-Modus")
    framework.offline_manager.set_network_status(framework.offline_manager.NetworkStatus.OFFLINE)
    
    # Element im Offline-Modus hinzufügen
    offline_order_id = framework.add_sync_item(
        entity_type="order",
        entity_id="ORD-002",
        operation="create",
        data={
            "customer_id": "12345",
            "items": [
                {"product_id": "P003", "quantity": 1, "price": 19.99}
            ],
            "total": 19.99,
            "status": "pending"
        }
    )
    logger.info(f"Offline-Bestellung hinzugefügt: {offline_order_id}")
    
    # Statistiken im Offline-Modus abrufen
    offline_stats = framework.get_sync_stats()
    logger.info(f"Offline-Statistiken: {json.dumps(offline_stats, indent=2)}")
    
    # Simuliere Wiederverbindung
    logger.info("Simuliere Wiederverbindung")
    framework.offline_manager.set_network_status(framework.offline_manager.NetworkStatus.ONLINE)
    
    # Warte auf Verarbeitung der Queue
    logger.info("Warte auf Verarbeitung der Queue")
    await asyncio.sleep(5)
    
    # Abschließende Statistiken abrufen
    final_stats = framework.get_sync_stats()
    logger.info(f"Abschließende Statistiken: {json.dumps(final_stats, indent=2)}")
    
    # Framework stoppen
    await framework.stop()
    logger.info("Framework gestoppt")
    
    # Aufräumen
    if os.path.exists(config_path):
        os.remove(config_path)
    
    logger.info("Beispiel beendet")

if __name__ == "__main__":
    asyncio.run(main()) 