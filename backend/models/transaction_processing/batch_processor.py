"""
Erweiterter Batch-Prozessor für die asynchrone Verarbeitung von Transaktionen.
"""

import asyncio
import logging
import uuid
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
import concurrent.futures
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.models.transaction_processing.transaction import Transaction
from backend.models.transaction_processing.transaction_result import TransactionResult
from backend.models.transaction_processing.transaction_processor import TransactionProcessor
from backend.core.config import settings

logger = logging.getLogger(__name__)

class BatchProcessor:
    """
    Erweiterter Batch-Prozessor für die asynchrone Verarbeitung von Transaktionen.
    Ermöglicht die parallele Verarbeitung mehrerer Batches und asynchrone Callbacks.
    """
    
    def __init__(
        self,
        max_workers: int = 4,
        chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
        db_session: Optional[Session] = None
    ):
        """
        Initialisiert den BatchProcessor.
        
        Args:
            max_workers: Maximale Anzahl paralleler Worker-Threads
            chunk_size: Größe der Chunks für die Verarbeitung
            db_session: SQLAlchemy Datenbanksession
        """
        self.max_workers = max_workers
        self.chunk_size = chunk_size
        self.db = db_session or next(get_db())
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)
        self.active_batches: Dict[str, Dict[str, Any]] = {}
    
    async def process_batch_async(
        self,
        transactions: List[Transaction],
        callback: Optional[Callable[[str, TransactionResult], None]] = None
    ) -> str:
        """
        Verarbeitet einen Batch von Transaktionen asynchron.
        
        Args:
            transactions: Liste der zu verarbeitenden Transaktionen
            callback: Optionale Callback-Funktion, die nach Abschluss aufgerufen wird
            
        Returns:
            Batch-ID für die Nachverfolgung
        """
        batch_id = str(uuid.uuid4())
        
        # Batch registrieren
        self.active_batches[batch_id] = {
            "status": "pending",
            "total": len(transactions),
            "submitted_at": datetime.now(),
            "result": None
        }
        
        # Batch-Verarbeitung im Executor starten
        loop = asyncio.get_event_loop()
        future = loop.run_in_executor(
            self.executor,
            self._process_batch,
            batch_id,
            transactions,
            callback
        )
        
        # Future für Fehlerbehandlung verknüpfen
        future.add_done_callback(
            lambda f: self._handle_future_result(f, batch_id)
        )
        
        return batch_id
    
    def _process_batch(
        self,
        batch_id: str,
        transactions: List[Transaction],
        callback: Optional[Callable[[str, TransactionResult], None]]
    ) -> TransactionResult:
        """
        Verarbeitet einen Batch von Transaktionen im Worker-Thread.
        
        Args:
            batch_id: ID des Batches
            transactions: Liste der zu verarbeitenden Transaktionen
            callback: Optionale Callback-Funktion
            
        Returns:
            Ergebnis der Transaktionsverarbeitung
        """
        logger.info(f"Starte Verarbeitung von Batch {batch_id} mit {len(transactions)} Transaktionen")
        
        # Status aktualisieren
        self.active_batches[batch_id]["status"] = "processing"
        self.active_batches[batch_id]["started_at"] = datetime.now()
        
        # Neue Session für diesen Thread erstellen
        with Session(self.db.bind) as session:
            processor = TransactionProcessor(db_session=session, chunk_size=self.chunk_size)
            result = processor.process_transactions(transactions)
        
        # Status aktualisieren
        self.active_batches[batch_id]["status"] = "completed"
        self.active_batches[batch_id]["completed_at"] = datetime.now()
        self.active_batches[batch_id]["result"] = result
        
        # Callback aufrufen, falls vorhanden
        if callback:
            try:
                callback(batch_id, result)
            except Exception as e:
                logger.error(f"Fehler im Callback für Batch {batch_id}: {str(e)}")
        
        logger.info(f"Batch {batch_id} abgeschlossen: {result.successful}/{result.total} erfolgreich, "
                   f"{result.failed} fehlgeschlagen, {result.processing_time:.3f}s")
        
        return result
    
    def _handle_future_result(self, future, batch_id: str):
        """
        Behandelt das Ergebnis einer Future.
        
        Args:
            future: Future-Objekt
            batch_id: ID des Batches
        """
        try:
            future.result()  # Exceptions abrufen
        except Exception as e:
            logger.error(f"Unbehandelte Exception in Batch {batch_id}: {str(e)}")
            self.active_batches[batch_id]["status"] = "failed"
            self.active_batches[batch_id]["error"] = str(e)
    
    def get_batch_status(self, batch_id: str) -> Dict[str, Any]:
        """
        Ruft den Status eines Batches ab.
        
        Args:
            batch_id: ID des Batches
            
        Returns:
            Status-Informationen zum Batch
            
        Raises:
            KeyError: Wenn die Batch-ID nicht gefunden wurde
        """
        if batch_id not in self.active_batches:
            raise KeyError(f"Batch-ID {batch_id} nicht gefunden")
        
        batch_info = self.active_batches[batch_id].copy()
        
        # TransactionResult in serialisierbares Format umwandeln
        if batch_info.get("result"):
            result = batch_info["result"]
            batch_info["result"] = {
                "total": result.total,
                "successful": result.successful,
                "failed": result.failed,
                "processing_time": result.processing_time,
                "success_rate": result._calculate_success_rate(),
                "failed_transactions": result.failed_transactions
            }
        
        return batch_info
    
    def get_all_batches(self) -> Dict[str, Dict[str, Any]]:
        """
        Ruft den Status aller Batches ab.
        
        Returns:
            Dictionary mit Batch-IDs als Schlüssel und Status-Informationen als Werte
        """
        return {
            batch_id: self.get_batch_status(batch_id)
            for batch_id in self.active_batches
        }
    
    def cleanup_completed_batches(self, max_age_hours: int = 24):
        """
        Bereinigt abgeschlossene Batches, die älter als die angegebene Zeit sind.
        
        Args:
            max_age_hours: Maximales Alter in Stunden
        """
        now = datetime.now()
        batches_to_remove = []
        
        for batch_id, batch_info in self.active_batches.items():
            if batch_info["status"] in ["completed", "failed"]:
                completed_at = batch_info.get("completed_at")
                if completed_at and (now - completed_at).total_seconds() > max_age_hours * 3600:
                    batches_to_remove.append(batch_id)
        
        for batch_id in batches_to_remove:
            del self.active_batches[batch_id]
            
        logger.info(f"{len(batches_to_remove)} abgeschlossene Batches bereinigt")
    
    def shutdown(self):
        """
        Fährt den BatchProcessor herunter und wartet auf den Abschluss aller laufenden Aufgaben.
        """
        logger.info("Fahre BatchProcessor herunter...")
        self.executor.shutdown(wait=True)
        logger.info("BatchProcessor heruntergefahren")

# Singleton-Instanz des BatchProcessors
_batch_processor_instance = None

def get_batch_processor() -> BatchProcessor:
    """
    Gibt die Singleton-Instanz des BatchProcessors zurück.
    
    Returns:
        BatchProcessor-Instanz
    """
    global _batch_processor_instance
    if _batch_processor_instance is None:
        _batch_processor_instance = BatchProcessor()
    return _batch_processor_instance 