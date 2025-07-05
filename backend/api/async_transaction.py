"""
API-Endpunkte für die asynchrone Transaktionsverarbeitung.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
import uuid
import logging

from backend.db.database import get_db
from backend.models.transaction_processing import Transaction
from backend.models.transaction_processing.batch_processor import get_batch_processor
from backend.schemas.transaction import (
    TransactionCreate,
    TransactionBatchRequest,
    TransactionBatchResponse,
    AsyncBatchResponse,
    BatchStatusResponse
)

router = APIRouter(
    prefix="/api/transactions/async",
    tags=["async-transactions"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.post("/batch", response_model=AsyncBatchResponse)
async def create_async_transaction_batch(
    batch: TransactionBatchRequest,
    background_tasks: BackgroundTasks
):
    """
    Verarbeitet einen Batch von Transaktionen asynchron.
    Gibt sofort eine Batch-ID zurück, mit der der Status abgefragt werden kann.
    """
    logger.info(f"Neuer asynchroner Transaktions-Batch empfangen: {len(batch.transactions)} Transaktionen")
    
    # Transaktionen erstellen
    db_transactions = []
    for tx in batch.transactions:
        db_transaction = Transaction(
            id=str(uuid.uuid4()),
            type=tx.type,
            amount=tx.amount,
            direction=tx.direction,
            description=tx.description,
            reference_id=tx.reference_id,
            article_id=tx.article_id,
            account_id=tx.account_id,
            target_account_id=tx.target_account_id
        )
        db_transactions.append(db_transaction)
    
    # Batch-Processor abrufen
    batch_processor = get_batch_processor()
    
    # Batch asynchron verarbeiten
    batch_id = await batch_processor.process_batch_async(db_transactions)
    
    # Bereinigung alter Batches im Hintergrund ausführen
    background_tasks.add_task(batch_processor.cleanup_completed_batches)
    
    return AsyncBatchResponse(
        batch_id=batch_id,
        status="pending",
        total=len(db_transactions),
        message="Batch wurde zur Verarbeitung eingereicht"
    )

@router.get("/batch/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str):
    """
    Ruft den Status eines asynchronen Transaktions-Batches ab.
    """
    batch_processor = get_batch_processor()
    
    try:
        batch_status = batch_processor.get_batch_status(batch_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Batch mit ID {batch_id} nicht gefunden")
    
    return BatchStatusResponse(
        batch_id=batch_id,
        status=batch_status["status"],
        total=batch_status["total"],
        submitted_at=batch_status["submitted_at"],
        started_at=batch_status.get("started_at"),
        completed_at=batch_status.get("completed_at"),
        result=batch_status.get("result"),
        error=batch_status.get("error")
    )

@router.get("/batches", response_model=Dict[str, BatchStatusResponse])
async def get_all_batches(
    status: Optional[str] = Query(None, description="Filter nach Status (pending, processing, completed, failed)")
):
    """
    Ruft den Status aller asynchronen Transaktions-Batches ab.
    Optional gefiltert nach Status.
    """
    batch_processor = get_batch_processor()
    all_batches = batch_processor.get_all_batches()
    
    # Nach Status filtern, falls angegeben
    if status:
        filtered_batches = {
            batch_id: batch_info
            for batch_id, batch_info in all_batches.items()
            if batch_info["status"] == status
        }
    else:
        filtered_batches = all_batches
    
    # In BatchStatusResponse-Format umwandeln
    return {
        batch_id: BatchStatusResponse(
            batch_id=batch_id,
            status=batch_info["status"],
            total=batch_info["total"],
            submitted_at=batch_info["submitted_at"],
            started_at=batch_info.get("started_at"),
            completed_at=batch_info.get("completed_at"),
            result=batch_info.get("result"),
            error=batch_info.get("error")
        )
        for batch_id, batch_info in filtered_batches.items()
    }

@router.post("/cleanup")
async def cleanup_batches(
    max_age_hours: int = Query(24, description="Maximales Alter in Stunden", ge=1)
):
    """
    Bereinigt abgeschlossene Batches, die älter als die angegebene Zeit sind.
    """
    batch_processor = get_batch_processor()
    batch_processor.cleanup_completed_batches(max_age_hours=max_age_hours)
    
    return {"message": f"Bereinigung abgeschlossen. Batches älter als {max_age_hours} Stunden wurden entfernt."}

@router.post("/cancel/{batch_id}")
async def cancel_batch(batch_id: str):
    """
    Bricht einen ausstehenden Batch ab.
    Hinweis: Bereits gestartete Batches können nicht abgebrochen werden.
    """
    batch_processor = get_batch_processor()
    
    try:
        batch_status = batch_processor.get_batch_status(batch_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Batch mit ID {batch_id} nicht gefunden")
    
    if batch_status["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Batch kann nicht abgebrochen werden, da er sich im Status '{batch_status['status']}' befindet"
        )
    
    # Batch als abgebrochen markieren
    batch_processor.active_batches[batch_id]["status"] = "cancelled"
    
    return {"message": f"Batch {batch_id} wurde abgebrochen"}

@router.get("/metrics", response_model=Dict[str, Any])
async def get_async_batch_metrics():
    """
    Ruft Metriken zur asynchronen Batch-Verarbeitung ab.
    """
    batch_processor = get_batch_processor()
    all_batches = batch_processor.get_all_batches()
    
    # Metriken berechnen
    total_batches = len(all_batches)
    status_counts = {}
    total_transactions = 0
    completed_transactions = 0
    failed_transactions = 0
    
    for batch_info in all_batches.values():
        status = batch_info["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
        
        total_transactions += batch_info["total"]
        
        if "result" in batch_info and batch_info["result"]:
            result = batch_info["result"]
            completed_transactions += result.get("successful", 0)
            failed_transactions += result.get("failed", 0)
    
    return {
        "total_batches": total_batches,
        "status_distribution": status_counts,
        "total_transactions": total_transactions,
        "completed_transactions": completed_transactions,
        "failed_transactions": failed_transactions,
        "completion_rate": (completed_transactions / total_transactions * 100) if total_transactions > 0 else 0
    } 