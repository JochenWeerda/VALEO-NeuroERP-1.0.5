#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Unit-Tests für den Offline-Manager.
"""

import asyncio
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

from ..offline_manager import OfflineManager, NetworkStatus

class TestOfflineManager(unittest.TestCase):
    """Test-Klasse für den Offline-Manager."""

    def setUp(self):
        """Setup für Tests."""
        self.config = {
            "max_reconnect_attempts": 3,
            "reconnect_interval": 1
        }
        self.manager = OfflineManager(self.config)
    
    def test_init(self):
        """Test der Initialisierung."""
        self.assertEqual(self.manager.network_status, NetworkStatus.ONLINE)
        self.assertEqual(self.manager.max_reconnect_attempts, 3)
        self.assertEqual(self.manager.reconnect_interval, 1)
        self.assertEqual(self.manager.reconnect_attempts, 0)
    
    def test_is_online(self):
        """Test der is_online-Methode."""
        self.manager.set_network_status(NetworkStatus.ONLINE)
        self.assertTrue(self.manager.is_online())
        self.assertFalse(self.manager.is_offline())
        
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        self.assertFalse(self.manager.is_online())
        self.assertTrue(self.manager.is_offline())
    
    def test_status_listener(self):
        """Test der Status-Listener."""
        status_changes = []
        
        def listener(status):
            status_changes.append(status)
        
        self.manager.register_status_listener(listener)
        
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        self.manager.set_network_status(NetworkStatus.RECONNECTING)
        self.manager.set_network_status(NetworkStatus.ONLINE)
        
        self.assertEqual(len(status_changes), 3)
        self.assertEqual(status_changes[0], NetworkStatus.OFFLINE)
        self.assertEqual(status_changes[1], NetworkStatus.RECONNECTING)
        self.assertEqual(status_changes[2], NetworkStatus.ONLINE)
    
    def test_get_offline_duration(self):
        """Test der get_offline_duration-Methode."""
        # Im Online-Zustand sollte die Dauer 0 sein
        self.manager.set_network_status(NetworkStatus.ONLINE)
        self.assertEqual(self.manager.get_offline_duration(), 0)
        
        # Im Offline-Zustand sollte die Dauer größer als 0 sein
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        self.manager.last_online_timestamp = datetime.now() - timedelta(seconds=10)
        self.assertGreater(self.manager.get_offline_duration(), 9)
    
    def test_get_status_info(self):
        """Test der get_status_info-Methode."""
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        info = self.manager.get_status_info()
        
        self.assertEqual(info["status"], "offline")
        self.assertEqual(info["reconnect_attempts"], 0)
        self.assertEqual(info["max_reconnect_attempts"], 3)
    
    @patch('aiohttp.ClientSession')
    async def test_check_network_connectivity_success(self, mock_session):
        """Test der check_network_connectivity-Methode bei erfolgreicher Verbindung."""
        # Mock für erfolgreiche Verbindung
        mock_response = MagicMock()
        mock_response.status = 200
        mock_session.return_value.__aenter__.return_value.get.return_value.__aenter__.return_value = mock_response
        
        result = await self.manager.check_network_connectivity("https://example.com")
        
        self.assertTrue(result)
        self.assertEqual(self.manager.network_status, NetworkStatus.ONLINE)
    
    @patch('aiohttp.ClientSession')
    async def test_check_network_connectivity_failure(self, mock_session):
        """Test der check_network_connectivity-Methode bei fehlgeschlagener Verbindung."""
        # Mock für fehlgeschlagene Verbindung
        mock_session.return_value.__aenter__.return_value.get.side_effect = asyncio.TimeoutError()
        
        self.manager.set_network_status(NetworkStatus.ONLINE)
        result = await self.manager.check_network_connectivity("https://example.com")
        
        self.assertFalse(result)
        self.assertEqual(self.manager.network_status, NetworkStatus.UNSTABLE)
    
    @patch('aiohttp.ClientSession')
    async def test_reconnect_success(self, mock_session):
        """Test der reconnect-Methode bei erfolgreicher Wiederverbindung."""
        # Mock für erfolgreiche Verbindung
        mock_response = MagicMock()
        mock_response.status = 200
        mock_session.return_value.__aenter__.return_value.get.return_value.__aenter__.return_value = mock_response
        
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        result = await self.manager.reconnect("https://example.com")
        
        self.assertTrue(result)
        self.assertEqual(self.manager.network_status, NetworkStatus.ONLINE)
        self.assertEqual(self.manager.reconnect_attempts, 1)
    
    @patch('aiohttp.ClientSession')
    async def test_reconnect_failure(self, mock_session):
        """Test der reconnect-Methode bei fehlgeschlagener Wiederverbindung."""
        # Mock für fehlgeschlagene Verbindung
        mock_session.return_value.__aenter__.return_value.get.side_effect = asyncio.TimeoutError()
        
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        result = await self.manager.reconnect("https://example.com")
        
        self.assertFalse(result)
        self.assertEqual(self.manager.reconnect_attempts, 1)
    
    @patch('aiohttp.ClientSession')
    async def test_max_reconnect_attempts(self, mock_session):
        """Test der maximalen Wiederverbindungsversuche."""
        # Mock für fehlgeschlagene Verbindung
        mock_session.return_value.__aenter__.return_value.get.side_effect = asyncio.TimeoutError()
        
        self.manager.set_network_status(NetworkStatus.OFFLINE)
        self.manager.reconnect_attempts = 3  # Maximale Anzahl erreicht
        
        result = await self.manager.reconnect("https://example.com")
        
        self.assertFalse(result)
        self.assertEqual(self.manager.reconnect_attempts, 3)  # Sollte nicht erhöht werden

if __name__ == '__main__':
    unittest.main() 