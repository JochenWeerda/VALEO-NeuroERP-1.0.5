from typing import List, Optional
from sqlalchemy.orm import Session
from core.models.transaction import TransactionDB, TransactionCreate, TransactionUpdate, Transaction
from datetime import datetime

class TransactionService:
    @staticmethod
    def get_transaction(db: Session, transaction_id: int) -> Optional[TransactionDB]:
        """Transaktion anhand ID abrufen"""
        return db.query(TransactionDB).filter(TransactionDB.id == transaction_id).first()

    @staticmethod
    def get_transaction_by_reference(db: Session, reference: str) -> Optional[TransactionDB]:
        """Transaktion anhand Referenz abrufen"""
        return db.query(TransactionDB).filter(TransactionDB.reference == reference).first()

    @staticmethod
    def get_user_transactions(
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[TransactionDB]:
        """Transaktionen eines Benutzers abrufen"""
        return (
            db.query(TransactionDB)
            .filter(TransactionDB.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create_transaction(
        db: Session,
        transaction: TransactionCreate,
        user_id: str
    ) -> TransactionDB:
        """Neue Transaktion erstellen"""
        db_transaction = TransactionDB(
            **transaction.dict(),
            user_id=user_id,
            status="pending"
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction

    @staticmethod
    def update_transaction(
        db: Session,
        transaction_id: int,
        transaction_update: TransactionUpdate
    ) -> Optional[TransactionDB]:
        """Transaktion aktualisieren"""
        db_transaction = TransactionService.get_transaction(db, transaction_id)
        if not db_transaction:
            return None
            
        # Update fields
        update_data = transaction_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transaction, field, value)
            
        db_transaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_transaction)
        return db_transaction

    @staticmethod
    def delete_transaction(db: Session, transaction_id: int) -> bool:
        """Transaktion löschen"""
        db_transaction = TransactionService.get_transaction(db, transaction_id)
        if not db_transaction:
            return False
            
        db.delete(db_transaction)
        db.commit()
        return True

    @staticmethod
    def process_transaction(db: Session, transaction_id: int) -> Optional[TransactionDB]:
        """Transaktion verarbeiten"""
        db_transaction = TransactionService.get_transaction(db, transaction_id)
        if not db_transaction:
            return None
            
        try:
            # Hier würde die eigentliche Transaktionsverarbeitung stattfinden
            # z.B. Zahlungsabwicklung, Buchungen, etc.
            
            # Update status
            db_transaction.status = "completed"
            db_transaction.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_transaction)
            return db_transaction
            
        except Exception as e:
            db_transaction.status = "failed"
            db_transaction.updated_at = datetime.utcnow()
            db.commit()
            raise 