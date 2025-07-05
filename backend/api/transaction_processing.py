"""
API-Endpunkte für die Transaktionsverarbeitung.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import uuid
import logging

from backend.db.database import get_db
from backend.models.transaction_processing import (
    Transaction, 
    TransactionProcessor, 
    TransactionResult
)
from backend.schemas.transaction import (
    TransactionCreate, 
    TransactionResponse, 
    TransactionBatchRequest, 
    TransactionBatchResponse
)

router = APIRouter(
    prefix="/api/transactions",
    tags=["transactions"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt eine einzelne Transaktion.
    """
    logger.info(f"Neue Transaktion empfangen: {transaction.type}")
    
    # Transaktion erstellen
    db_transaction = Transaction(
        id=str(uuid.uuid4()),
        type=transaction.type,
        amount=transaction.amount,
        direction=transaction.direction,
        description=transaction.description,
        reference_id=transaction.reference_id,
        article_id=transaction.article_id,
        account_id=transaction.account_id,
        target_account_id=transaction.target_account_id
    )
    
    # Transaktionsprozessor initialisieren
    processor = TransactionProcessor(db_session=db)
    
    # Transaktion verarbeiten
    result = processor.process_transactions([db_transaction])
    
    if result.has_failures():
        error_msg = result.failed_transactions[0]["error"] if result.failed_transactions else "Unbekannter Fehler"
        raise HTTPException(status_code=400, detail=f"Transaktion fehlgeschlagen: {error_msg}")
    
    return TransactionResponse(
        id=db_transaction.id,
        type=db_transaction.type,
        amount=db_transaction.amount,
        direction=db_transaction.direction,
        description=db_transaction.description,
        reference_id=db_transaction.reference_id,
        article_id=db_transaction.article_id,
        account_id=db_transaction.account_id,
        target_account_id=db_transaction.target_account_id,
        created_at=db_transaction.created_at,
        updated_at=db_transaction.updated_at,
        status="completed"
    )

@router.post("/batch", response_model=TransactionBatchResponse)
def create_transaction_batch(
    batch: TransactionBatchRequest,
    chunk_size: Optional[int] = Query(100, description="Größe der Verarbeitungs-Chunks"),
    db: Session = Depends(get_db)
):
    """
    Verarbeitet einen Batch von Transaktionen.
    """
    logger.info(f"Neuer Transaktions-Batch empfangen: {len(batch.transactions)} Transaktionen")
    
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
    
    # Transaktionsprozessor initialisieren
    processor = TransactionProcessor(db_session=db, chunk_size=chunk_size)
    
    # Transaktionen verarbeiten
    result = processor.process_transactions(db_transactions)
    
    # Ergebnis zurückgeben
    return TransactionBatchResponse(
        total=result.total,
        successful=result.successful,
        failed=result.failed,
        failed_transactions=result.failed_transactions,
        processing_time=result.processing_time,
        success_rate=result._calculate_success_rate()
    )

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Ruft eine Transaktion anhand ihrer ID ab.
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    
    # Status aus der letzten Statusänderung abrufen
    from backend.models.transaction_processing import TransactionStatus
    latest_status = (
        db.query(TransactionStatus)
        .filter(TransactionStatus.transaction_id == transaction_id)
        .order_by(TransactionStatus.timestamp.desc())
        .first()
    )
    
    status = latest_status.status if latest_status else "unknown"
    
    return TransactionResponse(
        id=transaction.id,
        type=transaction.type,
        amount=transaction.amount,
        direction=transaction.direction,
        description=transaction.description,
        reference_id=transaction.reference_id,
        article_id=transaction.article_id,
        account_id=transaction.account_id,
        target_account_id=transaction.target_account_id,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at,
        status=status
    )

@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Listet Transaktionen auf, optional gefiltert nach Typ.
    """
    query = db.query(Transaction)
    
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    transactions = query.offset(skip).limit(limit).all()
    
    # Status für jede Transaktion abrufen
    from backend.models.transaction_processing import TransactionStatus
    transaction_responses = []
    
    for transaction in transactions:
        latest_status = (
            db.query(TransactionStatus)
            .filter(TransactionStatus.transaction_id == transaction.id)
            .order_by(TransactionStatus.timestamp.desc())
            .first()
        )
        
        status = latest_status.status if latest_status else "unknown"
        
        transaction_responses.append(
            TransactionResponse(
                id=transaction.id,
                type=transaction.type,
                amount=transaction.amount,
                direction=transaction.direction,
                description=transaction.description,
                reference_id=transaction.reference_id,
                article_id=transaction.article_id,
                account_id=transaction.account_id,
                target_account_id=transaction.target_account_id,
                created_at=transaction.created_at,
                updated_at=transaction.updated_at,
                status=status
            )
        )
    
    return transaction_responses 