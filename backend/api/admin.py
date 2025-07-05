"""
Admin-API-Endpunkte für die Transaktionsverarbeitung.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text, desc
import logging
from datetime import datetime, timedelta
import concurrent.futures
import sys

from backend.db.database import get_db
from backend.models.transaction_processing import Transaction
from backend.models.transaction_processing.batch_processor import get_batch_processor
from backend.core.config import settings

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.post("/transaction-processor/config")
def update_transaction_processor_config(
    max_workers: Optional[int] = Query(None, description="Maximale Anzahl paralleler Worker-Threads"),
    chunk_size: Optional[int] = Query(None, description="Größe der Chunks für die Verarbeitung")
):
    """
    Aktualisiert die Konfiguration des TransactionProcessors.
    """
    batch_processor = get_batch_processor()
    
    changes = {}
    
    if max_workers is not None:
        if max_workers < 1:
            raise HTTPException(status_code=400, detail="max_workers muss mindestens 1 sein")
        
        old_max_workers = batch_processor.max_workers
        batch_processor.max_workers = max_workers
        
        # Executor neu erstellen
        batch_processor.executor.shutdown(wait=False)
        batch_processor.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)
        
        changes["max_workers"] = {"old": old_max_workers, "new": max_workers}
    
    if chunk_size is not None:
        if chunk_size < 1:
            raise HTTPException(status_code=400, detail="chunk_size muss mindestens 1 sein")
        
        old_chunk_size = batch_processor.chunk_size
        batch_processor.chunk_size = chunk_size
        changes["chunk_size"] = {"old": old_chunk_size, "new": chunk_size}
    
    if not changes:
        return {"message": "Keine Änderungen vorgenommen"}
    
    logger.info(f"TransactionProcessor-Konfiguration aktualisiert: {changes}")
    
    return {
        "message": "Konfiguration aktualisiert",
        "changes": changes
    }

@router.post("/transaction-processor/shutdown")
def shutdown_transaction_processor(background_tasks: BackgroundTasks):
    """
    Fährt den TransactionProcessor herunter.
    """
    batch_processor = get_batch_processor()
    
    # Prüfen, ob noch Batches in Bearbeitung sind
    all_batches = batch_processor.get_all_batches()
    active_batches = [
        batch_id for batch_id, info in all_batches.items()
        if info["status"] in ["pending", "processing"]
    ]
    
    if active_batches:
        raise HTTPException(
            status_code=400,
            detail=f"Es sind noch {len(active_batches)} Batches in Bearbeitung. Bitte warten Sie, bis diese abgeschlossen sind."
        )
    
    # Herunterfahren im Hintergrund
    background_tasks.add_task(batch_processor.shutdown)
    
    return {"message": "TransactionProcessor wird heruntergefahren"}

@router.post("/transaction-processor/restart")
def restart_transaction_processor(background_tasks: BackgroundTasks):
    """
    Startet den TransactionProcessor neu.
    """
    # Globale Variable für den BatchProcessor zurücksetzen
    global _batch_processor_instance
    
    # Alten BatchProcessor herunterfahren
    batch_processor = get_batch_processor()
    
    # Prüfen, ob noch Batches in Bearbeitung sind
    all_batches = batch_processor.get_all_batches()
    active_batches = [
        batch_id for batch_id, info in all_batches.items()
        if info["status"] in ["pending", "processing"]
    ]
    
    if active_batches:
        raise HTTPException(
            status_code=400,
            detail=f"Es sind noch {len(active_batches)} Batches in Bearbeitung. Bitte warten Sie, bis diese abgeschlossen sind."
        )
    
    # Herunterfahren und neue Instanz erstellen
    background_tasks.add_task(lambda: (
        batch_processor.shutdown(),
        setattr(sys.modules[__name__], '_batch_processor_instance', None)
    ))
    
    return {"message": "TransactionProcessor wird neu gestartet"}

@router.post("/transactions/cleanup")
def cleanup_old_transactions(
    db: Session = Depends(get_db),
    days: int = Query(30, description="Alter in Tagen", ge=1),
    status: Optional[str] = Query(None, description="Status der zu löschenden Transaktionen"),
    dry_run: bool = Query(False, description="Nur Anzahl der betroffenen Transaktionen zurückgeben, ohne zu löschen")
):
    """
    Bereinigt alte Transaktionen aus der Datenbank.
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Abfrage erstellen
    query = db.query(Transaction).filter(Transaction.created_at < cutoff_date)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    # Anzahl der betroffenen Transaktionen zählen
    count = query.count()
    
    if dry_run:
        return {
            "message": f"{count} Transaktionen würden gelöscht werden",
            "affected_transactions": count,
            "dry_run": True
        }
    
    # Transaktionen löschen
    deleted = query.delete(synchronize_session=False)
    db.commit()
    
    logger.info(f"{deleted} alte Transaktionen gelöscht (älter als {days} Tage)")
    
    return {
        "message": f"{deleted} Transaktionen wurden gelöscht",
        "affected_transactions": deleted,
        "dry_run": False
    }

@router.post("/transactions/{transaction_id}/retry")
def retry_failed_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Versucht, eine fehlgeschlagene Transaktion erneut zu verarbeiten.
    """
    # Transaktion abrufen
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    
    if transaction.status != "failed":
        raise HTTPException(
            status_code=400,
            detail=f"Nur fehlgeschlagene Transaktionen können wiederholt werden. Aktueller Status: {transaction.status}"
        )
    
    # Status zurücksetzen
    transaction.status = "pending"
    transaction.error_message = None
    transaction.retry_count = (transaction.retry_count or 0) + 1
    transaction.updated_at = datetime.now()
    db.commit()
    
    # Transaktion erneut verarbeiten
    processor = TransactionProcessor(db_session=db)
    result = processor.process_transaction(transaction)
    
    if not result.successful:
        error_message = result.failed_transactions[0]["error"] if result.failed_transactions else "Unbekannter Fehler"
        return {
            "message": f"Wiederholungsversuch fehlgeschlagen: {error_message}",
            "status": "failed",
            "transaction_id": transaction_id
        }
    
    return {
        "message": "Transaktion erfolgreich wiederholt",
        "status": "completed",
        "transaction_id": transaction_id
    }

@router.get("/transactions/failed", response_model=List[Dict[str, Any]])
def get_failed_transactions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    days: int = Query(7, description="Maximales Alter in Tagen")
):
    """
    Ruft fehlgeschlagene Transaktionen ab.
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    
    failed_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.status == "failed",
            Transaction.created_at >= cutoff_date
        )
        .order_by(desc(Transaction.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": tx.id,
            "type": tx.type,
            "amount": tx.amount,
            "created_at": tx.created_at,
            "error_message": tx.error_message,
            "retry_count": tx.retry_count or 0
        }
        for tx in failed_transactions
    ]

@router.post("/database/optimize")
def optimize_database(db: Session = Depends(get_db)):
    """
    Führt Datenbankoptimierungen durch (VACUUM, ANALYZE).
    """
    try:
        # VACUUM ANALYZE für die Transaktionstabellen
        db.execute(text("VACUUM ANALYZE transaction"))
        db.execute(text("VACUUM ANALYZE transaction_status"))
        
        # Statistiken aktualisieren
        db.execute(text("ANALYZE"))
        
        return {"message": "Datenbankoptimierung erfolgreich durchgeführt"}
    except Exception as e:
        logger.error(f"Fehler bei der Datenbankoptimierung: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Datenbankoptimierung: {str(e)}"
        ) 