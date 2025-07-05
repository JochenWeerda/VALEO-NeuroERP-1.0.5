#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Unit-Tests für das Edge Network Resilience Framework.
"""

import asyncio
import json
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock

from ..edge_network_resilience import EdgeNetworkResilience
from ..offline_manager import NetworkStatus
from ..sync_queue import SyncItemPriority, SyncItemStatus

class TestEdgeNetworkResilience(unittest.TestCase):
    """Test-Klasse für das Edge Network Resilience Framework."""

    def setUp(self):
        """Setup für Tests."""
        # Temporäre Datenbank für Tests
        self.temp_db = tempfile.NamedTemporaryFile(delete=False).name
        
        # Temporäre Konfigurationsdatei erstellen
        self.temp_config = tempfile.NamedTemporaryFile(delete=False, suffix='.json')
        self.config = {
            "offline_manager": {
                "max_reconnect_attempts": 3,
                "reconnect_interval": 1
            },
            "connectivity_check_interval": 10
        }
        with open(self.temp_config.name, 'w') as f:
            json.dump(self.config, f)
        
        # Framework initialisieren
        self.framework = EdgeNetworkResilience(
            config_path=self.temp_config.name,
            db_path=self.temp_db,
            api_endpoint="https://api.example.com/v1"
        )
    
    def tearDown(self):
        """Aufräumen nach Tests."""
        # Temporäre Dateien löschen
        if os.path.exists(self.temp_db):
            os.unlink(self.temp_db)
        
        if os.path.exists(self.temp_config.name):
            os.unlink(self.temp_config.name)
    
    def test_init(self):
        """Test der Initialisierung."""
        self.assertIsNotNone(self.framework.offline_manager)
        self.assertIsNotNone(self.framework.sync_queue)
        self.assertEqual(self.framework.api_endpoint, "https://api.example.com/v1")
        self.assertEqual(self.framework.config, self.config)
    
    def test_is_online(self):
        """Test der is_online-Methode."""
        # Standardmäßig sollte das Framework online sein
        self.assertTrue(self.framework.is_online())
        
        # Status ändern und prüfen
        self.framework.offline_manager.set_network_status(NetworkStatus.OFFLINE)
        self.assertFalse(self.framework.is_online())
    
    def test_add_sync_item(self):
        """Test der add_sync_item-Methode."""
        item_id = self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"},
            priority=SyncItemPriority.HIGH
        )
        
        self.assertIsNotNone(item_id)
        
        # Prüfen, ob das Item in der Queue ist
        item = self.framework.get_sync_item(item_id)
        self.assertIsNotNone(item)
        self.assertEqual(item.entity_type, "customer")
        self.assertEqual(item.entity_id, "12345")
        self.assertEqual(item.operation, "update")
        self.assertEqual(item.data["name"], "Max Mustermann")
        self.assertEqual(item.priority, SyncItemPriority.HIGH)
    
    def test_get_sync_stats(self):
        """Test der get_sync_stats-Methode."""
        # Element hinzufügen
        self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"}
        )
        
        # Statistiken abrufen
        stats = self.framework.get_sync_stats()
        
        self.assertIn("queue", stats)
        self.assertIn("network", stats)
        self.assertEqual(stats["queue"]["pending"], 1)
        self.assertEqual(stats["queue"]["total"], 1)
        self.assertEqual(stats["network"]["status"], "online")
    
    @patch('aiohttp.ClientSession')
    async def test_process_sync_item_success(self, mock_session):
        """Test der _process_sync_item-Methode bei erfolgreicher Verarbeitung."""
        # Mock für erfolgreiche Anfrage
        mock_response = MagicMock()
        mock_response.status = 200
        mock_session.return_value.__aenter__.return_value.request.return_value.__aenter__.return_value = mock_response
        
        # Element hinzufügen
        item_id = self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"}
        )
        
        # Element abrufen
        item = self.framework.get_sync_item(item_id)
        
        # Element verarbeiten
        result = await self.framework._process_sync_item(item)
        
        self.assertTrue(result)
    
    @patch('aiohttp.ClientSession')
    async def test_process_sync_item_failure(self, mock_session):
        """Test der _process_sync_item-Methode bei fehlgeschlagener Verarbeitung."""
        # Mock für fehlgeschlagene Anfrage
        mock_response = MagicMock()
        mock_response.status = 500
        mock_session.return_value.__aenter__.return_value.request.return_value.__aenter__.return_value = mock_response
        
        # Element hinzufügen
        item_id = self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"}
        )
        
        # Element abrufen
        item = self.framework.get_sync_item(item_id)
        
        # Element verarbeiten
        result = await self.framework._process_sync_item(item)
        
        self.assertFalse(result)
    
    @patch('aiohttp.ClientSession')
    async def test_process_sync_item_offline(self, mock_session):
        """Test der _process_sync_item-Methode im Offline-Modus."""
        # Framework offline setzen
        self.framework.offline_manager.set_network_status(NetworkStatus.OFFLINE)
        
        # Element hinzufügen
        item_id = self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"}
        )
        
        # Element abrufen
        item = self.framework.get_sync_item(item_id)
        
        # Element verarbeiten
        result = await self.framework._process_sync_item(item)
        
        # Sollte fehlschlagen, da offline
        self.assertFalse(result)
        
        # Mock sollte nicht aufgerufen worden sein
        mock_session.return_value.__aenter__.return_value.request.assert_not_called()
    
    @patch('aiohttp.ClientSession')
    async def test_start_and_stop(self, mock_session):
        """Test der start- und stop-Methoden."""
        # Mock für erfolgreiche Anfrage
        mock_response = MagicMock()
        mock_response.status = 200
        mock_session.return_value.__aenter__.return_value.get.return_value.__aenter__.return_value = mock_response
        
        # Framework starten
        await self.framework.start()
        
        # Prüfen, ob Hintergrundaufgaben gestartet wurden
        self.assertEqual(len(self.framework._background_tasks), 1)  # Connectivity-Monitor
        
        # Framework stoppen
        await self.framework.stop()
        
        # Prüfen, ob Hintergrundaufgaben gestoppt wurden
        self.assertEqual(len(self.framework._background_tasks), 0)
    
    def test_network_status_change_handler(self):
        """Test des Handlers für Netzwerkstatusänderungen."""
        # Manuell den Handler aufrufen
        with patch.object(self.framework, '_process_pending_sync_items') as mock_process:
            # Online-Status sollte Verarbeitung auslösen
            self.framework._handle_network_status_change(NetworkStatus.ONLINE)
            mock_process.assert_called_once()
            
            mock_process.reset_mock()
            
            # Offline-Status sollte keine Verarbeitung auslösen
            self.framework._handle_network_status_change(NetworkStatus.OFFLINE)
            mock_process.assert_not_called()
    
    def test_sync_item_added_handler(self):
        """Test des Handlers für hinzugefügte Synchronisationselemente."""
        # Element erstellen
        item_id = self.framework.add_sync_item(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann"}
        )
        
        item = self.framework.get_sync_item(item_id)
        
        # Manuell den Handler aufrufen
        with patch.object(self.framework, '_process_sync_item') as mock_process:
            # Im Online-Modus sollte das Element verarbeitet werden
            self.framework._handle_sync_item_added(item)
            mock_process.assert_called_once_with(item)
            
            mock_process.reset_mock()
            
            # Im Offline-Modus sollte das Element nicht verarbeitet werden
            self.framework.offline_manager.set_network_status(NetworkStatus.OFFLINE)
            self.framework._handle_sync_item_added(item)
            mock_process.assert_not_called()

if __name__ == '__main__':
    unittest.main() 