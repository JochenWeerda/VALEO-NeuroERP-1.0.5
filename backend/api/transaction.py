"""
API-Endpunkte für die synchrone Transaktionsverarbeitung.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
import uuid
import logging

from backend.db.database import get_db
from backend.models.transaction_processing import Transaction
from backend.models.transaction_processing.transaction_processor import TransactionProcessor
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

@router.post("", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt und verarbeitet eine einzelne Transaktion.
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
    
    # Transaktion verarbeiten
    processor = TransactionProcessor(db_session=db)
    result = processor.process_transaction(db_transaction)
    
    if not result.successful:
        error_message = result.failed_transactions[0]["error"] if result.failed_transactions else "Unbekannter Fehler"
        raise HTTPException(
            status_code=400,
            detail=f"Fehler bei der Verarbeitung der Transaktion: {error_message}"
        )
    
    # Transaktion aus der Datenbank abrufen (mit aktualisiertem Status)
    db_transaction = db.query(Transaction).filter(Transaction.id == db_transaction.id).first()
    
    return db_transaction

@router.post("/batch", response_model=TransactionBatchResponse)
def create_transaction_batch(
    batch: TransactionBatchRequest,
    db: Session = Depends(get_db)
):
    """
    Verarbeitet einen Batch von Transaktionen synchron.
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
    
    # Batch verarbeiten
    processor = TransactionProcessor(db_session=db)
    result = processor.process_transactions(db_transactions)
    
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
    
    return transaction

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Ruft eine Liste von Transaktionen ab, optional gefiltert nach Typ und Status.
    """
    query = db.query(Transaction)
    
    if type:
        query = query.filter(Transaction.type == type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    transactions = query.offset(skip).limit(limit).all()
    
    return transactions

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Löscht eine Transaktion anhand ihrer ID.
    Hinweis: Dies sollte nur für Testzwecke verwendet werden.
    """
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
    
    db.delete(transaction)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT) 