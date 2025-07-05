#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Synchronisations-Queue für das Edge Network Resilience Framework.

Dieses Modul implementiert eine persistente Warteschlange für ausstehende Synchronisationen.
"""

import asyncio
import json
import logging
import os
import sqlite3
import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Union

# Logging konfigurieren
logger = logging.getLogger("edge_resilience.sync_queue")

class SyncItemStatus(Enum):
    """Status eines Synchronisationselements."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CONFLICT = "conflict"

class SyncItemPriority(Enum):
    """Priorität eines Synchronisationselements."""
    LOW = 0
    NORMAL = 1
    HIGH = 2
    CRITICAL = 3

class SyncItem:
    """
    Ein Element in der Synchronisationswarteschlange.
    """
    
    def __init__(
        self,
        item_id: Optional[str] = None,
        entity_type: str = "",
        entity_id: str = "",
        operation: str = "",
        data: Dict[str, Any] = None,
        status: SyncItemStatus = SyncItemStatus.PENDING,
        priority: SyncItemPriority = SyncItemPriority.NORMAL,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        retry_count: int = 0,
        max_retries: int = 3,
        metadata: Dict[str, Any] = None
    ):
        """
        Initialisiert ein Synchronisationselement.
        
        Args:
            item_id: ID des Elements (wird automatisch generiert, wenn nicht angegeben)
            entity_type: Typ der Entität (z.B. "customer", "order")
            entity_id: ID der Entität
            operation: Operation (z.B. "create", "update", "delete")
            data: Zu synchronisierende Daten
            status: Status des Elements
            priority: Priorität des Elements
            created_at: Erstellungszeitpunkt
            updated_at: Letzter Aktualisierungszeitpunkt
            retry_count: Anzahl der Wiederholungsversuche
            max_retries: Maximale Anzahl an Wiederholungsversuchen
            metadata: Zusätzliche Metadaten
        """
        self.item_id = item_id or str(uuid.uuid4())
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.operation = operation
        self.data = data or {}
        self.status = status
        self.priority = priority
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.retry_count = retry_count
        self.max_retries = max_retries
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Konvertiert das Element in ein Dictionary.
        
        Returns:
            Dictionary-Repräsentation des Elements
        """
        return {
            "item_id": self.item_id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "operation": self.operation,
            "data": self.data,
            "status": self.status.value,
            "priority": self.priority.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SyncItem':
        """
        Erstellt ein Element aus einem Dictionary.
        
        Args:
            data: Dictionary-Repräsentation des Elements
            
        Returns:
            Erstelltes SyncItem
        """
        return cls(
            item_id=data.get("item_id"),
            entity_type=data.get("entity_type", ""),
            entity_id=data.get("entity_id", ""),
            operation=data.get("operation", ""),
            data=data.get("data", {}),
            status=SyncItemStatus(data.get("status", "pending")),
            priority=SyncItemPriority(data.get("priority", 1)),
            created_at=datetime.fromisoformat(data.get("created_at")) if data.get("created_at") else None,
            updated_at=datetime.fromisoformat(data.get("updated_at")) if data.get("updated_at") else None,
            retry_count=data.get("retry_count", 0),
            max_retries=data.get("max_retries", 3),
            metadata=data.get("metadata", {})
        )
    
    def increment_retry_count(self):
        """Erhöht den Wiederholungszähler."""
        self.retry_count += 1
        self.updated_at = datetime.now()
    
    def update_status(self, status: SyncItemStatus):
        """
        Aktualisiert den Status des Elements.
        
        Args:
            status: Neuer Status
        """
        self.status = status
        self.updated_at = datetime.now()
    
    def can_retry(self) -> bool:
        """
        Prüft, ob das Element erneut versucht werden kann.
        
        Returns:
            True, wenn das Element erneut versucht werden kann, sonst False
        """
        return self.retry_count < self.max_retries

class SyncQueue:
    """
    Eine persistente Warteschlange für ausstehende Synchronisationen.
    """
    
    def __init__(self, db_path: str = "sync_queue.db"):
        """
        Initialisiert die Synchronisationswarteschlange.
        
        Args:
            db_path: Pfad zur SQLite-Datenbank
        """
        self.db_path = db_path
        self.listeners: Dict[str, List[Callable[[SyncItem], None]]] = {
            "added": [],
            "updated": [],
            "completed": [],
            "failed": [],
            "conflict": []
        }
        
        # Konfiguriere Logger
        self._setup_logging()
        
        # Initialisiere Datenbank
        self._init_db()
        
        logger.info(f"Synchronisations-Queue initialisiert: {db_path}")
    
    def _setup_logging(self):
        """Konfiguriert das Logging für die Synchronisations-Queue."""
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    def _init_db(self):
        """Initialisiert die SQLite-Datenbank."""
        # Stelle sicher, dass das Verzeichnis existiert
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Erstelle Tabelle für Synchronisationselemente
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sync_items (
            item_id TEXT PRIMARY KEY,
            entity_type TEXT,
            entity_id TEXT,
            operation TEXT,
            data TEXT,
            status TEXT,
            priority INTEGER,
            created_at TEXT,
            updated_at TEXT,
            retry_count INTEGER,
            max_retries INTEGER,
            metadata TEXT
        )
        """)
        
        # Erstelle Indizes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON sync_items (status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_priority ON sync_items (priority)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity ON sync_items (entity_type, entity_id)")
        
        conn.commit()
        conn.close()
    
    def register_listener(self, event_type: str, listener: Callable[[SyncItem], None]):
        """
        Registriert einen Listener für ein bestimmtes Ereignis.
        
        Args:
            event_type: Typ des Ereignisses ("added", "updated", "completed", "failed", "conflict")
            listener: Funktion, die bei dem Ereignis aufgerufen wird
        """
        if event_type in self.listeners:
            self.listeners[event_type].append(listener)
            logger.debug(f"Listener für {event_type} registriert: {listener}")
    
    def _notify_listeners(self, event_type: str, item: SyncItem):
        """
        Benachrichtigt alle registrierten Listener über ein Ereignis.
        
        Args:
            event_type: Typ des Ereignisses
            item: Betroffenes Synchronisationselement
        """
        if event_type in self.listeners:
            for listener in self.listeners[event_type]:
                try:
                    listener(item)
                except Exception as e:
                    logger.error(f"Fehler beim Benachrichtigen des Listeners: {e}")
    
    def add_item(self, item: SyncItem) -> str:
        """
        Fügt ein Element zur Warteschlange hinzu.
        
        Args:
            item: Hinzuzufügendes Synchronisationselement
            
        Returns:
            ID des hinzugefügten Elements
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Konvertiere Daten in JSON
        item_dict = item.to_dict()
        item_dict["data"] = json.dumps(item_dict["data"])
        item_dict["metadata"] = json.dumps(item_dict["metadata"])
        
        # Füge Element hinzu
        cursor.execute("""
        INSERT INTO sync_items (
            item_id, entity_type, entity_id, operation, data, status, priority,
            created_at, updated_at, retry_count, max_retries, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_dict["item_id"], item_dict["entity_type"], item_dict["entity_id"],
            item_dict["operation"], item_dict["data"], item_dict["status"],
            item_dict["priority"], item_dict["created_at"], item_dict["updated_at"],
            item_dict["retry_count"], item_dict["max_retries"], item_dict["metadata"]
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Element zur Queue hinzugefügt: {item.item_id} ({item.entity_type}/{item.entity_id})")
        self._notify_listeners("added", item)
        
        return item.item_id
    
    def get_item(self, item_id: str) -> Optional[SyncItem]:
        """
        Holt ein Element aus der Warteschlange.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            Das gefundene Element oder None, wenn nicht gefunden
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM sync_items WHERE item_id = ?", (item_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            # Konvertiere Zeile in Dictionary
            item_dict = dict(row)
            item_dict["data"] = json.loads(item_dict["data"])
            item_dict["metadata"] = json.loads(item_dict["metadata"])
            
            return SyncItem.from_dict(item_dict)
        
        return None
    
    def update_item(self, item: SyncItem) -> bool:
        """
        Aktualisiert ein Element in der Warteschlange.
        
        Args:
            item: Zu aktualisierendes Element
            
        Returns:
            True, wenn das Element aktualisiert wurde, sonst False
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Konvertiere Daten in JSON
        item_dict = item.to_dict()
        item_dict["data"] = json.dumps(item_dict["data"])
        item_dict["metadata"] = json.dumps(item_dict["metadata"])
        
        # Aktualisiere Element
        cursor.execute("""
        UPDATE sync_items SET
            entity_type = ?, entity_id = ?, operation = ?, data = ?,
            status = ?, priority = ?, updated_at = ?, retry_count = ?,
            max_retries = ?, metadata = ?
        WHERE item_id = ?
        """, (
            item_dict["entity_type"], item_dict["entity_id"], item_dict["operation"],
            item_dict["data"], item_dict["status"], item_dict["priority"],
            item_dict["updated_at"], item_dict["retry_count"], item_dict["max_retries"],
            item_dict["metadata"], item_dict["item_id"]
        ))
        
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if updated:
            logger.info(f"Element aktualisiert: {item.item_id} (Status: {item.status.value})")
            self._notify_listeners("updated", item)
            
            # Zusätzliche Benachrichtigungen für bestimmte Status
            if item.status == SyncItemStatus.COMPLETED:
                self._notify_listeners("completed", item)
            elif item.status == SyncItemStatus.FAILED:
                self._notify_listeners("failed", item)
            elif item.status == SyncItemStatus.CONFLICT:
                self._notify_listeners("conflict", item)
        
        return updated
    
    def delete_item(self, item_id: str) -> bool:
        """
        Löscht ein Element aus der Warteschlange.
        
        Args:
            item_id: ID des zu löschenden Elements
            
        Returns:
            True, wenn das Element gelöscht wurde, sonst False
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM sync_items WHERE item_id = ?", (item_id,))
        
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        if deleted:
            logger.info(f"Element gelöscht: {item_id}")
        
        return deleted
    
    def get_next_item(self) -> Optional[SyncItem]:
        """
        Holt das nächste zu synchronisierende Element aus der Warteschlange.
        
        Returns:
            Das nächste Element oder None, wenn die Warteschlange leer ist
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Hole das nächste Element nach Priorität und Erstellungszeitpunkt
        cursor.execute("""
        SELECT * FROM sync_items
        WHERE status = ?
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
        """, (SyncItemStatus.PENDING.value,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            # Konvertiere Zeile in Dictionary
            item_dict = dict(row)
            item_dict["data"] = json.loads(item_dict["data"])
            item_dict["metadata"] = json.loads(item_dict["metadata"])
            
            return SyncItem.from_dict(item_dict)
        
        return None
    
    def mark_as_processing(self, item_id: str) -> bool:
        """
        Markiert ein Element als in Bearbeitung.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            True, wenn das Element aktualisiert wurde, sonst False
        """
        item = self.get_item(item_id)
        if item:
            item.update_status(SyncItemStatus.PROCESSING)
            return self.update_item(item)
        return False
    
    def mark_as_completed(self, item_id: str) -> bool:
        """
        Markiert ein Element als abgeschlossen.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            True, wenn das Element aktualisiert wurde, sonst False
        """
        item = self.get_item(item_id)
        if item:
            item.update_status(SyncItemStatus.COMPLETED)
            return self.update_item(item)
        return False
    
    def mark_as_failed(self, item_id: str) -> bool:
        """
        Markiert ein Element als fehlgeschlagen.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            True, wenn das Element aktualisiert wurde, sonst False
        """
        item = self.get_item(item_id)
        if item:
            item.update_status(SyncItemStatus.FAILED)
            return self.update_item(item)
        return False
    
    def mark_as_conflict(self, item_id: str) -> bool:
        """
        Markiert ein Element als im Konflikt.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            True, wenn das Element aktualisiert wurde, sonst False
        """
        item = self.get_item(item_id)
        if item:
            item.update_status(SyncItemStatus.CONFLICT)
            return self.update_item(item)
        return False
    
    def retry_item(self, item_id: str) -> bool:
        """
        Versucht ein fehlgeschlagenes Element erneut.
        
        Args:
            item_id: ID des Elements
            
        Returns:
            True, wenn das Element für einen erneuten Versuch markiert wurde, sonst False
        """
        item = self.get_item(item_id)
        if item and (item.status == SyncItemStatus.FAILED or item.status == SyncItemStatus.CONFLICT):
            if item.can_retry():
                item.increment_retry_count()
                item.update_status(SyncItemStatus.PENDING)
                return self.update_item(item)
            else:
                logger.warning(f"Maximale Anzahl an Wiederholungsversuchen erreicht für {item_id}")
        return False
    
    def get_queue_stats(self) -> Dict[str, int]:
        """
        Gibt Statistiken zur Warteschlange zurück.
        
        Returns:
            Dictionary mit Statistiken
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Zähle Elemente nach Status
        cursor.execute("""
        SELECT status, COUNT(*) as count
        FROM sync_items
        GROUP BY status
        """)
        
        stats = {
            "pending": 0,
            "processing": 0,
            "completed": 0,
            "failed": 0,
            "conflict": 0,
            "total": 0
        }
        
        for row in cursor.fetchall():
            status, count = row
            stats[status] = count
            stats["total"] += count
        
        conn.close()
        
        return stats
    
    def get_items_by_status(self, status: SyncItemStatus, limit: int = 100) -> List[SyncItem]:
        """
        Holt Elemente mit einem bestimmten Status.
        
        Args:
            status: Status der Elemente
            limit: Maximale Anzahl der zurückzugebenden Elemente
            
        Returns:
            Liste von Elementen mit dem angegebenen Status
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT * FROM sync_items
        WHERE status = ?
        ORDER BY priority DESC, created_at ASC
        LIMIT ?
        """, (status.value, limit))
        
        items = []
        for row in cursor.fetchall():
            # Konvertiere Zeile in Dictionary
            item_dict = dict(row)
            item_dict["data"] = json.loads(item_dict["data"])
            item_dict["metadata"] = json.loads(item_dict["metadata"])
            
            items.append(SyncItem.from_dict(item_dict))
        
        conn.close()
        
        return items
    
    def get_items_by_entity(self, entity_type: str, entity_id: str) -> List[SyncItem]:
        """
        Holt Elemente für eine bestimmte Entität.
        
        Args:
            entity_type: Typ der Entität
            entity_id: ID der Entität
            
        Returns:
            Liste von Elementen für die angegebene Entität
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT * FROM sync_items
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY created_at ASC
        """, (entity_type, entity_id))
        
        items = []
        for row in cursor.fetchall():
            # Konvertiere Zeile in Dictionary
            item_dict = dict(row)
            item_dict["data"] = json.loads(item_dict["data"])
            item_dict["metadata"] = json.loads(item_dict["metadata"])
            
            items.append(SyncItem.from_dict(item_dict))
        
        conn.close()
        
        return items
    
    def clear_completed_items(self, older_than: Optional[datetime] = None) -> int:
        """
        Löscht abgeschlossene Elemente aus der Warteschlange.
        
        Args:
            older_than: Optional, nur Elemente löschen, die älter als dieser Zeitpunkt sind
            
        Returns:
            Anzahl der gelöschten Elemente
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if older_than:
            cursor.execute("""
            DELETE FROM sync_items
            WHERE status = ? AND updated_at < ?
            """, (SyncItemStatus.COMPLETED.value, older_than.isoformat()))
        else:
            cursor.execute("""
            DELETE FROM sync_items
            WHERE status = ?
            """, (SyncItemStatus.COMPLETED.value,))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        logger.info(f"{deleted_count} abgeschlossene Elemente gelöscht")
        
        return deleted_count
    
    def detect_conflicts(self, entity_type: str, entity_id: str) -> List[SyncItem]:
        """
        Erkennt Konflikte für eine bestimmte Entität.
        
        Args:
            entity_type: Typ der Entität
            entity_id: ID der Entität
            
        Returns:
            Liste von Elementen, die in Konflikt stehen
        """
        items = self.get_items_by_entity(entity_type, entity_id)
        
        # Gruppiere Elemente nach Operation
        operations = {}
        for item in items:
            if item.status in [SyncItemStatus.PENDING, SyncItemStatus.PROCESSING]:
                if item.operation not in operations:
                    operations[item.operation] = []
                operations[item.operation].append(item)
        
        # Erkenne Konflikte
        conflicts = []
        
        # Beispiel: Wenn es mehrere ausstehende Updates für dieselbe Entität gibt
        if "update" in operations and len(operations["update"]) > 1:
            for item in operations["update"][1:]:  # Alle außer dem ersten
                item.update_status(SyncItemStatus.CONFLICT)
                self.update_item(item)
                conflicts.append(item)
        
        # Beispiel: Wenn es ein austehendes Update und ein austehendes Delete gibt
        if "update" in operations and "delete" in operations:
            for item in operations["update"]:
                item.update_status(SyncItemStatus.CONFLICT)
                self.update_item(item)
                conflicts.append(item)
        
        return conflicts
    
    async def process_queue(self, processor: Callable[[SyncItem], Union[bool, asyncio.Future]]):
        """
        Verarbeitet die Warteschlange asynchron.
        
        Args:
            processor: Funktion zur Verarbeitung eines Elements
        """
        logger.info("Starte Verarbeitung der Warteschlange")
        
        while True:
            # Hole das nächste Element
            item = self.get_next_item()
            if not item:
                logger.debug("Keine ausstehenden Elemente in der Warteschlange")
                await asyncio.sleep(1)
                continue
            
            # Markiere als in Bearbeitung
            self.mark_as_processing(item.item_id)
            
            try:
                # Verarbeite das Element
                logger.info(f"Verarbeite Element: {item.item_id} ({item.entity_type}/{item.entity_id})")
                result = processor(item)
                
                # Wenn das Ergebnis ein Future ist, warte darauf
                if asyncio.isfuture(result) or isinstance(result, asyncio.Future):
                    result = await result
                
                # Markiere als abgeschlossen oder fehlgeschlagen
                if result:
                    self.mark_as_completed(item.item_id)
                else:
                    self.mark_as_failed(item.item_id)
                    
                    # Versuche erneut, falls möglich
                    if item.can_retry():
                        self.retry_item(item.item_id)
            
            except Exception as e:
                logger.error(f"Fehler bei der Verarbeitung von {item.item_id}: {e}")
                self.mark_as_failed(item.item_id)
                
                # Versuche erneut, falls möglich
                if item.can_retry():
                    self.retry_item(item.item_id)
            
            # Warte kurz, um die CPU nicht zu überlasten
            await asyncio.sleep(0.1)

# Beispielverwendung
async def main():
    """Hauptfunktion für Beispielverwendung."""
    # Synchronisations-Queue erstellen
    queue = SyncQueue("sync_queue.db")
    
    # Element hinzufügen
    item = SyncItem(
        entity_type="customer",
        entity_id="12345",
        operation="update",
        data={"name": "Max Mustermann", "email": "max@example.com"},
        priority=SyncItemPriority.HIGH
    )
    item_id = queue.add_item(item)
    
    # Element abrufen
    retrieved_item = queue.get_item(item_id)
    print(f"Abgerufenes Element: {retrieved_item.to_dict()}")
    
    # Status-Listener registrieren
    def status_listener(item):
        print(f"Status geändert: {item.item_id} -> {item.status}")
    
    queue.register_listener("updated", status_listener)
    
    # Element als abgeschlossen markieren
    queue.mark_as_completed(item_id)
    
    # Statistiken abrufen
    stats = queue.get_queue_stats()
    print(f"Queue-Statistiken: {stats}")
    
    # Warteschlange verarbeiten
    async def process_item(item):
        print(f"Verarbeite {item.entity_type}/{item.entity_id}: {item.operation}")
        await asyncio.sleep(1)  # Simuliere Verarbeitung
        return True
    
    # Füge weitere Elemente hinzu
    for i in range(5):
        queue.add_item(SyncItem(
            entity_type="product",
            entity_id=f"P{i}",
            operation="create",
            data={"name": f"Produkt {i}", "price": 10 + i}
        ))
    
    # Starte Verarbeitung im Hintergrund
    asyncio.create_task(queue.process_queue(process_item))
    
    # Warte auf Verarbeitung
    await asyncio.sleep(10)

if __name__ == "__main__":
    asyncio.run(main()) 