from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from core.models.user import User
from core.services.transaction_service import TransactionService
from core.db.postgresql import get_db
from apps.api.middleware.auth import get_current_user

router = APIRouter()

@router.post("/transactions/", response_model=Transaction)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Neue Transaktion erstellen"""
    # Prüfen ob Referenz bereits existiert
    db_transaction = TransactionService.get_transaction_by_reference(
        db,
        transaction.reference
    )
    if db_transaction:
        raise HTTPException(
            status_code=400,
            detail="Referenz bereits verwendet"
        )
    
    return TransactionService.create_transaction(
        db,
        transaction,
        current_user.id
    )

@router.get("/transactions/", response_model=List[Transaction])
async def get_transactions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste aller Transaktionen abrufen"""
    return TransactionService.get_user_transactions(
        db,
        current_user.id,
        skip=skip,
        limit=limit
    )

@router.get("/transactions/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Einzelne Transaktion abrufen"""
    db_transaction = TransactionService.get_transaction(db, transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if db_transaction.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung für diese Transaktion"
        )
        
    return db_transaction

@router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transaktion aktualisieren"""
    # Prüfen ob Transaktion existiert
    db_transaction = TransactionService.get_transaction(db, transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if db_transaction.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Ändern dieser Transaktion"
        )
        
    return TransactionService.update_transaction(
        db,
        transaction_id,
        transaction_update
    )

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transaktion löschen"""
    # Prüfen ob Transaktion existiert
    db_transaction = TransactionService.get_transaction(db, transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if db_transaction.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Löschen dieser Transaktion"
        )
        
    TransactionService.delete_transaction(db, transaction_id)
    return {"message": "Transaktion erfolgreich gelöscht"}

@router.post("/transactions/{transaction_id}/process")
async def process_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transaktion verarbeiten"""
    # Prüfen ob Transaktion existiert
    db_transaction = TransactionService.get_transaction(db, transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if db_transaction.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Verarbeiten dieser Transaktion"
        )
        
    try:
        processed_transaction = TransactionService.process_transaction(
            db,
            transaction_id
        )
        return {
            "message": "Transaktion erfolgreich verarbeitet",
            "transaction": processed_transaction
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Transaktionsverarbeitung: {str(e)}"
        ) 