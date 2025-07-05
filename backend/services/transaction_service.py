"""
Transaktionsservice mit Bulk Processing Integration
"""
from typing import List, Dict, Optional
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.circuit_breaker import CircuitBreaker
from backend.services.bulk_processor import BulkProcessor
from backend.core.config import settings
from backend.models.transaction import Transaction
from backend.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionBulkCreate

logger = logging.getLogger(__name__)

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
        # Circuit Breaker
        self.circuit_breaker = CircuitBreaker(
            service_name="transaction_service",
            failure_threshold=settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
            recovery_timeout=settings.CIRCUIT_BREAKER_RECOVERY_TIMEOUT
        )
        
        # Bulk Processor
        self.bulk_processor = BulkProcessor(
            db=db,
            model=Transaction,
            batch_size=settings.BULK_BATCH_SIZE,
            flush_interval=settings.BULK_FLUSH_INTERVAL
        )
        
    async def start(self):
        """Service starten"""
        await self.bulk_processor.start()
        
    async def stop(self):
        """Service stoppen"""
        await self.bulk_processor.stop()
        
    @property
    async def is_healthy(self) -> bool:
        """Prüft ob Service gesund ist"""
        try:
            state = await self.circuit_breaker.get_state()
            return state == "CLOSED"
        except Exception as e:
            logger.error(f"Fehler bei Gesundheitsprüfung: {str(e)}")
            return False
            
    async def create_transaction(
        self,
        transaction: TransactionCreate
    ) -> Transaction:
        """
        Erstellt eine neue Transaktion
        
        Args:
            transaction: Transaktionsdaten
            
        Returns:
            Erstellte Transaktion
        """
        @self.circuit_breaker.protect
        async def _create_transaction(transaction: TransactionCreate) -> Transaction:
            db_transaction = Transaction(**transaction.dict())
            self.db.add(db_transaction)
            await self.db.commit()
            await self.db.refresh(db_transaction)
            return db_transaction
            
        return await _create_transaction(transaction)
        
    async def create_transactions_bulk(
        self,
        transactions: List[TransactionBulkCreate]
    ) -> int:
        """
        Erstellt mehrere Transaktionen im Bulk-Modus
        
        Args:
            transactions: Liste von Transaktionen
            
        Returns:
            Anzahl erstellter Transaktionen
        """
        @self.circuit_breaker.protect
        async def _create_transactions_bulk(
            transactions: List[TransactionBulkCreate]
        ) -> int:
            # Transaktionen zum Batch hinzufügen
            for transaction in transactions:
                await self.bulk_processor.add_insert(transaction.dict())
                
            # Sofortiges Flush erzwingen
            await self.bulk_processor.flush_inserts()
            
            return len(transactions)
            
        return await _create_transactions_bulk(transactions)
        
    async def get_transaction(
        self,
        transaction_id: int
    ) -> Optional[Transaction]:
        """
        Liest eine Transaktion
        
        Args:
            transaction_id: ID der Transaktion
            
        Returns:
            Transaktion oder None
        """
        @self.circuit_breaker.protect
        async def _get_transaction(transaction_id: int) -> Optional[Transaction]:
            return await self.db.get(Transaction, transaction_id)
            
        return await _get_transaction(transaction_id)
        
    async def update_transaction(
        self,
        transaction_id: int,
        transaction: TransactionUpdate
    ) -> Optional[Transaction]:
        """
        Aktualisiert eine Transaktion
        
        Args:
            transaction_id: ID der Transaktion
            transaction: Neue Transaktionsdaten
            
        Returns:
            Aktualisierte Transaktion oder None
        """
        @self.circuit_breaker.protect
        async def _update_transaction(
            transaction_id: int,
            transaction: TransactionUpdate
        ) -> Optional[Transaction]:
            db_transaction = await self.db.get(Transaction, transaction_id)
            if not db_transaction:
                return None
                
            update_data = transaction.dict(exclude_unset=True)
            update_data["id"] = transaction_id
            
            # Update zum Batch hinzufügen
            await self.bulk_processor.add_update(update_data)
            
            # Sofortiges Flush erzwingen
            await self.bulk_processor.flush_updates()
            
            return await self.get_transaction(transaction_id)
            
        return await _update_transaction(transaction_id, transaction)
        
    async def update_transactions_bulk(
        self,
        transactions: List[TransactionUpdate]
    ) -> int:
        """
        Aktualisiert mehrere Transaktionen im Bulk-Modus
        
        Args:
            transactions: Liste von Transaktionen
            
        Returns:
            Anzahl aktualisierter Transaktionen
        """
        @self.circuit_breaker.protect
        async def _update_transactions_bulk(
            transactions: List[TransactionUpdate]
        ) -> int:
            # Updates zum Batch hinzufügen
            for transaction in transactions:
                update_data = transaction.dict(exclude_unset=True)
                await self.bulk_processor.add_update(update_data)
                
            # Sofortiges Flush erzwingen
            await self.bulk_processor.flush_updates()
            
            return len(transactions)
            
        return await _update_transactions_bulk(transactions)
        
    async def delete_transaction(self, transaction_id: int) -> bool:
        """
        Löscht eine Transaktion
        
        Args:
            transaction_id: ID der Transaktion
            
        Returns:
            True wenn erfolgreich, sonst False
        """
        @self.circuit_breaker.protect
        async def _delete_transaction(transaction_id: int) -> bool:
            db_transaction = await self.db.get(Transaction, transaction_id)
            if not db_transaction:
                return False
                
            # Delete zum Batch hinzufügen
            await self.bulk_processor.add_delete(transaction_id)
            
            # Sofortiges Flush erzwingen
            await self.bulk_processor.flush_deletes()
            
            return True
            
        return await _delete_transaction(transaction_id)
        
    async def delete_transactions_bulk(
        self,
        transaction_ids: List[int]
    ) -> int:
        """
        Löscht mehrere Transaktionen im Bulk-Modus
        
        Args:
            transaction_ids: Liste von Transaktions-IDs
            
        Returns:
            Anzahl gelöschter Transaktionen
        """
        @self.circuit_breaker.protect
        async def _delete_transactions_bulk(
            transaction_ids: List[int]
        ) -> int:
            # Deletes zum Batch hinzufügen
            for transaction_id in transaction_ids:
                await self.bulk_processor.add_delete(transaction_id)
                
            # Sofortiges Flush erzwingen
            await self.bulk_processor.flush_deletes()
            
            return len(transaction_ids)
            
        return await _delete_transactions_bulk(transaction_ids)
        
    async def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """
        Liest mehrere Transaktionen
        
        Args:
            skip: Anzahl zu überspringender Einträge
            limit: Maximale Anzahl Einträge
            
        Returns:
            Liste von Transaktionen
        """
        @self.circuit_breaker.protect
        async def _get_transactions(skip: int, limit: int) -> List[Transaction]:
            return await self.db.query(Transaction)\
                .offset(skip)\
                .limit(limit)\
                .all()
                
        return await _get_transactions(skip, limit) 