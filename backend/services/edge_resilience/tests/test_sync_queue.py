#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Unit-Tests für die Synchronisations-Queue.
"""

import asyncio
import os
import unittest
import tempfile
from datetime import datetime, timedelta

from ..sync_queue import SyncQueue, SyncItem, SyncItemStatus, SyncItemPriority

class TestSyncQueue(unittest.TestCase):
    """Test-Klasse für die Synchronisations-Queue."""

    def setUp(self):
        """Setup für Tests."""
        # Temporäre Datenbank für Tests
        self.temp_db = tempfile.NamedTemporaryFile(delete=False).name
        self.queue = SyncQueue(self.temp_db)
        
        # Test-Items erstellen
        self.test_item = SyncItem(
            entity_type="customer",
            entity_id="12345",
            operation="update",
            data={"name": "Max Mustermann", "email": "max@example.com"},
            priority=SyncItemPriority.HIGH
        )
    
    def tearDown(self):
        """Aufräumen nach Tests."""
        # Temporäre Datenbank löschen
        if os.path.exists(self.temp_db):
            os.unlink(self.temp_db)
    
    def test_add_item(self):
        """Test der add_item-Methode."""
        item_id = self.queue.add_item(self.test_item)
        self.assertIsNotNone(item_id)
        
        # Prüfen, ob das Item in der Queue ist
        retrieved_item = self.queue.get_item(item_id)
        self.assertIsNotNone(retrieved_item)
        self.assertEqual(retrieved_item.entity_type, "customer")
        self.assertEqual(retrieved_item.entity_id, "12345")
        self.assertEqual(retrieved_item.operation, "update")
        self.assertEqual(retrieved_item.data["name"], "Max Mustermann")
        self.assertEqual(retrieved_item.priority, SyncItemPriority.HIGH)
        self.assertEqual(retrieved_item.status, SyncItemStatus.PENDING)
    
    def test_update_item(self):
        """Test der update_item-Methode."""
        item_id = self.queue.add_item(self.test_item)
        
        # Item ändern
        retrieved_item = self.queue.get_item(item_id)
        retrieved_item.data["name"] = "Erika Musterfrau"
        retrieved_item.update_status(SyncItemStatus.PROCESSING)
        
        # Item aktualisieren
        self.queue.update_item(retrieved_item)
        
        # Prüfen, ob die Änderungen gespeichert wurden
        updated_item = self.queue.get_item(item_id)
        self.assertEqual(updated_item.data["name"], "Erika Musterfrau")
        self.assertEqual(updated_item.status, SyncItemStatus.PROCESSING)
    
    def test_delete_item(self):
        """Test der delete_item-Methode."""
        item_id = self.queue.add_item(self.test_item)
        
        # Prüfen, ob das Item existiert
        self.assertIsNotNone(self.queue.get_item(item_id))
        
        # Item löschen
        result = self.queue.delete_item(item_id)
        self.assertTrue(result)
        
        # Prüfen, ob das Item gelöscht wurde
        self.assertIsNone(self.queue.get_item(item_id))
    
    def test_get_next_item(self):
        """Test der get_next_item-Methode."""
        # Mehrere Items mit unterschiedlichen Prioritäten hinzufügen
        low_priority_item = SyncItem(
            entity_type="product",
            entity_id="P1",
            operation="create",
            data={"name": "Produkt 1"},
            priority=SyncItemPriority.LOW
        )
        
        high_priority_item = SyncItem(
            entity_type="product",
            entity_id="P2",
            operation="create",
            data={"name": "Produkt 2"},
            priority=SyncItemPriority.HIGH
        )
        
        self.queue.add_item(low_priority_item)
        high_priority_id = self.queue.add_item(high_priority_item)
        
        # Das nächste Item sollte das mit höherer Priorität sein
        next_item = self.queue.get_next_item()
        self.assertEqual(next_item.item_id, high_priority_id)
    
    def test_mark_as_methods(self):
        """Test der mark_as_*-Methoden."""
        item_id = self.queue.add_item(self.test_item)
        
        # Als in Bearbeitung markieren
        self.queue.mark_as_processing(item_id)
        self.assertEqual(self.queue.get_item(item_id).status, SyncItemStatus.PROCESSING)
        
        # Als abgeschlossen markieren
        self.queue.mark_as_completed(item_id)
        self.assertEqual(self.queue.get_item(item_id).status, SyncItemStatus.COMPLETED)
        
        # Als fehlgeschlagen markieren
        self.queue.mark_as_failed(item_id)
        self.assertEqual(self.queue.get_item(item_id).status, SyncItemStatus.FAILED)
        
        # Als im Konflikt markieren
        self.queue.mark_as_conflict(item_id)
        self.assertEqual(self.queue.get_item(item_id).status, SyncItemStatus.CONFLICT)
    
    def test_retry_item(self):
        """Test der retry_item-Methode."""
        item_id = self.queue.add_item(self.test_item)
        
        # Als fehlgeschlagen markieren
        self.queue.mark_as_failed(item_id)
        
        # Erneut versuchen
        result = self.queue.retry_item(item_id)
        self.assertTrue(result)
        
        # Prüfen, ob der Status auf PENDING zurückgesetzt wurde
        item = self.queue.get_item(item_id)
        self.assertEqual(item.status, SyncItemStatus.PENDING)
        self.assertEqual(item.retry_count, 1)
        
        # Maximale Anzahl an Wiederholungsversuchen erreichen
        item.retry_count = item.max_retries
        self.queue.update_item(item)
        self.queue.mark_as_failed(item_id)
        
        # Erneut versuchen sollte fehlschlagen
        result = self.queue.retry_item(item_id)
        self.assertFalse(result)
    
    def test_get_queue_stats(self):
        """Test der get_queue_stats-Methode."""
        # Items mit verschiedenen Status hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="create")
        item2 = SyncItem(entity_type="customer", entity_id="2", operation="update")
        item3 = SyncItem(entity_type="customer", entity_id="3", operation="delete")
        
        id1 = self.queue.add_item(item1)
        id2 = self.queue.add_item(item2)
        id3 = self.queue.add_item(item3)
        
        self.queue.mark_as_completed(id1)
        self.queue.mark_as_failed(id2)
        
        # Statistiken abrufen
        stats = self.queue.get_queue_stats()
        
        self.assertEqual(stats["pending"], 1)
        self.assertEqual(stats["completed"], 1)
        self.assertEqual(stats["failed"], 1)
        self.assertEqual(stats["total"], 3)
    
    def test_get_items_by_status(self):
        """Test der get_items_by_status-Methode."""
        # Items mit verschiedenen Status hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="create")
        item2 = SyncItem(entity_type="customer", entity_id="2", operation="update")
        item3 = SyncItem(entity_type="customer", entity_id="3", operation="delete")
        
        id1 = self.queue.add_item(item1)
        id2 = self.queue.add_item(item2)
        id3 = self.queue.add_item(item3)
        
        self.queue.mark_as_failed(id1)
        self.queue.mark_as_failed(id2)
        
        # Items nach Status abrufen
        failed_items = self.queue.get_items_by_status(SyncItemStatus.FAILED)
        pending_items = self.queue.get_items_by_status(SyncItemStatus.PENDING)
        
        self.assertEqual(len(failed_items), 2)
        self.assertEqual(len(pending_items), 1)
    
    def test_get_items_by_entity(self):
        """Test der get_items_by_entity-Methode."""
        # Items für verschiedene Entitäten hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="create")
        item2 = SyncItem(entity_type="customer", entity_id="1", operation="update")
        item3 = SyncItem(entity_type="product", entity_id="1", operation="create")
        
        self.queue.add_item(item1)
        self.queue.add_item(item2)
        self.queue.add_item(item3)
        
        # Items nach Entität abrufen
        customer_items = self.queue.get_items_by_entity("customer", "1")
        product_items = self.queue.get_items_by_entity("product", "1")
        
        self.assertEqual(len(customer_items), 2)
        self.assertEqual(len(product_items), 1)
    
    def test_clear_completed_items(self):
        """Test der clear_completed_items-Methode."""
        # Items mit verschiedenen Status hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="create")
        item2 = SyncItem(entity_type="customer", entity_id="2", operation="update")
        item3 = SyncItem(entity_type="customer", entity_id="3", operation="delete")
        
        id1 = self.queue.add_item(item1)
        id2 = self.queue.add_item(item2)
        id3 = self.queue.add_item(item3)
        
        self.queue.mark_as_completed(id1)
        self.queue.mark_as_completed(id2)
        
        # Abgeschlossene Items löschen
        deleted_count = self.queue.clear_completed_items()
        
        self.assertEqual(deleted_count, 2)
        self.assertIsNone(self.queue.get_item(id1))
        self.assertIsNone(self.queue.get_item(id2))
        self.assertIsNotNone(self.queue.get_item(id3))
    
    def test_detect_conflicts(self):
        """Test der detect_conflicts-Methode."""
        # Items mit potenziellen Konflikten hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="update", 
                         data={"name": "Version 1"})
        item2 = SyncItem(entity_type="customer", entity_id="1", operation="update", 
                         data={"name": "Version 2"})
        item3 = SyncItem(entity_type="customer", entity_id="1", operation="delete")
        
        self.queue.add_item(item1)
        self.queue.add_item(item2)
        self.queue.add_item(item3)
        
        # Konflikte erkennen
        conflicts = self.queue.detect_conflicts("customer", "1")
        
        # Es sollten 2 Konflikte erkannt werden (das zweite Update und das Delete)
        self.assertEqual(len(conflicts), 2)
    
    async def test_process_queue(self):
        """Test der process_queue-Methode."""
        # Items hinzufügen
        item1 = SyncItem(entity_type="customer", entity_id="1", operation="create")
        item2 = SyncItem(entity_type="customer", entity_id="2", operation="update")
        
        self.queue.add_item(item1)
        self.queue.add_item(item2)
        
        # Zähler für verarbeitete Items
        processed_items = []
        
        # Processor-Funktion
        def processor(item):
            processed_items.append(item.item_id)
            return True
        
        # Queue verarbeiten (mit Timeout)
        task = asyncio.create_task(self.queue.process_queue(processor))
        
        # Kurz warten und dann abbrechen
        await asyncio.sleep(0.5)
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            pass
        
        # Es sollten beide Items verarbeitet worden sein
        self.assertEqual(len(processed_items), 2)
        
        # Prüfen, ob die Items als abgeschlossen markiert wurden
        stats = self.queue.get_queue_stats()
        self.assertEqual(stats["completed"], 2)

if __name__ == '__main__':
    unittest.main() 