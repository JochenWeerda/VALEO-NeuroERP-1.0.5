"""
Bulk Operation Processor für VALEO-NeuroERP
"""
from typing import List, Dict, Any, Optional, Callable, TypeVar, Generic
import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import Table, select, update, delete
from backend.monitoring.metrics import metrics
from backend.core.config import settings

# Type Variables
T = TypeVar('T')
Model = TypeVar('Model')

logger = logging.getLogger(__name__)

class BulkProcessor(Generic[Model]):
    def __init__(
        self,
        db: AsyncSession,
        model: Model,
        batch_size: int = 1000,
        flush_interval: int = 30,
        retry_attempts: int = 3
    ):
        """
        Initialisiert den Bulk Processor
        
        Args:
            db: Datenbankverbindung
            model: SQLAlchemy Model
            batch_size: Maximale Batch-Größe
            flush_interval: Automatisches Flush-Interval in Sekunden
            retry_attempts: Anzahl Wiederholungsversuche bei Fehlern
        """
        self.db = db
        self.model = model
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.retry_attempts = retry_attempts
        
        # Batch-Speicher
        self.inserts: List[Dict] = []
        self.updates: List[Dict] = []
        self.deletes: List[Any] = []
        
        # Metriken
        self.operation_start = datetime.now()
        
        # Background Task
        self.flush_task: Optional[asyncio.Task] = None
        
    async def start(self):
        """Startet den Bulk Processor"""
        if not self.flush_task:
            self.flush_task = asyncio.create_task(self._auto_flush())
            logger.info(f"Bulk Processor für {self.model.__name__} gestartet")
            
    async def stop(self):
        """Stoppt den Bulk Processor"""
        if self.flush_task:
            self.flush_task.cancel()
            try:
                await self.flush_task
            except asyncio.CancelledError:
                pass
            self.flush_task = None
            
        # Verbleibende Operationen ausführen
        await self.flush()
        logger.info(f"Bulk Processor für {self.model.__name__} gestoppt")
        
    async def _auto_flush(self):
        """Automatisches Flush in Intervallen"""
        while True:
            await asyncio.sleep(self.flush_interval)
            await self.flush()
            
    async def add_insert(self, data: Dict[str, Any]):
        """
        Fügt Insert-Operation hinzu
        
        Args:
            data: Einzufügende Daten
        """
        self.inserts.append(data)
        
        if len(self.inserts) >= self.batch_size:
            await self.flush_inserts()
            
    async def add_update(self, data: Dict[str, Any]):
        """
        Fügt Update-Operation hinzu
        
        Args:
            data: Zu aktualisierende Daten
        """
        self.updates.append(data)
        
        if len(self.updates) >= self.batch_size:
            await self.flush_updates()
            
    async def add_delete(self, id: Any):
        """
        Fügt Delete-Operation hinzu
        
        Args:
            id: ID des zu löschenden Eintrags
        """
        self.deletes.append(id)
        
        if len(self.deletes) >= self.batch_size:
            await self.flush_deletes()
            
    async def flush(self):
        """Führt alle ausstehenden Operationen aus"""
        await self.flush_inserts()
        await self.flush_updates()
        await self.flush_deletes()
        
    async def flush_inserts(self):
        """Führt ausstehende Insert-Operationen aus"""
        if not self.inserts:
            return
            
        try:
            # Bulk Insert mit ON CONFLICT DO NOTHING
            stmt = insert(self.model.__table__).values(self.inserts)
            stmt = stmt.on_conflict_do_nothing()
            
            await self._execute_with_retry(stmt)
            
            # Metriken aktualisieren
            duration = (datetime.now() - self.operation_start).total_seconds()
            metrics.track_transaction(
                transaction_type="bulk_insert",
                duration=duration,
                status="success"
            )
            
            logger.info(
                f"Bulk Insert: {len(self.inserts)} Einträge für {self.model.__name__}"
            )
            
        except Exception as e:
            logger.error(f"Fehler bei Bulk Insert: {str(e)}")
            metrics.track_transaction(
                transaction_type="bulk_insert",
                duration=0,
                status="error"
            )
            
        finally:
            self.inserts = []
            self.operation_start = datetime.now()
            
    async def flush_updates(self):
        """Führt ausstehende Update-Operationen aus"""
        if not self.updates:
            return
            
        try:
            # Updates in Batches ausführen
            for batch in self._chunk_list(self.updates, self.batch_size):
                stmt = update(self.model.__table__)
                stmt = stmt.where(
                    self.model.id.in_([item["id"] for item in batch])
                )
                stmt = stmt.values({
                    k: v for k, v in batch[0].items() if k != "id"
                })
                
                await self._execute_with_retry(stmt)
                
            # Metriken aktualisieren
            duration = (datetime.now() - self.operation_start).total_seconds()
            metrics.track_transaction(
                transaction_type="bulk_update",
                duration=duration,
                status="success"
            )
            
            logger.info(
                f"Bulk Update: {len(self.updates)} Einträge für {self.model.__name__}"
            )
            
        except Exception as e:
            logger.error(f"Fehler bei Bulk Update: {str(e)}")
            metrics.track_transaction(
                transaction_type="bulk_update",
                duration=0,
                status="error"
            )
            
        finally:
            self.updates = []
            self.operation_start = datetime.now()
            
    async def flush_deletes(self):
        """Führt ausstehende Delete-Operationen aus"""
        if not self.deletes:
            return
            
        try:
            # Deletes in Batches ausführen
            for batch in self._chunk_list(self.deletes, self.batch_size):
                stmt = delete(self.model.__table__).where(
                    self.model.id.in_(batch)
                )
                
                await self._execute_with_retry(stmt)
                
            # Metriken aktualisieren
            duration = (datetime.now() - self.operation_start).total_seconds()
            metrics.track_transaction(
                transaction_type="bulk_delete",
                duration=duration,
                status="success"
            )
            
            logger.info(
                f"Bulk Delete: {len(self.deletes)} Einträge für {self.model.__name__}"
            )
            
        except Exception as e:
            logger.error(f"Fehler bei Bulk Delete: {str(e)}")
            metrics.track_transaction(
                transaction_type="bulk_delete",
                duration=0,
                status="error"
            )
            
        finally:
            self.deletes = []
            self.operation_start = datetime.now()
            
    async def _execute_with_retry(self, stmt, attempt: int = 1):
        """
        Führt Statement mit Retry-Logik aus
        
        Args:
            stmt: SQL Statement
            attempt: Aktueller Versuch
        """
        try:
            await self.db.execute(stmt)
            await self.db.commit()
            
        except Exception as e:
            if attempt < self.retry_attempts:
                # Exponentielles Backoff
                wait_time = 2 ** attempt
                logger.warning(
                    f"Retry {attempt} nach {wait_time}s für {self.model.__name__}"
                )
                await asyncio.sleep(wait_time)
                await self._execute_with_retry(stmt, attempt + 1)
            else:
                raise
                
    @staticmethod
    def _chunk_list(lst: List[T], chunk_size: int) -> List[List[T]]:
        """Liste in Chunks aufteilen"""
        return [
            lst[i:i + chunk_size]
            for i in range(0, len(lst), chunk_size)
        ] 