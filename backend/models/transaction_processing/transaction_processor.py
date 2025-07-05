"""
Transaktionsprozessor für die Verarbeitung von Transaktionen mit hohem Volumen.
Implementiert den Chunked Processing Ansatz mit Savepoints für optimale Performance
und Fehlertoleranz.
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db.database import get_db
from backend.models.transaction_processing.transaction import Transaction
from backend.models.transaction_processing.transaction_result import TransactionResult
from backend.models.transaction_processing.transaction_status import TransactionStatus

logger = logging.getLogger(__name__)

class TransactionProcessor:
    """
    Prozessor für die effiziente Verarbeitung von Transaktionen mit hohem Volumen.
    Verwendet Chunked Processing mit Savepoints für optimale Performance und Fehlertoleranz.
    """
    
    def __init__(self, db_session: Optional[Session] = None, chunk_size: int = 100):
        """
        Initialisiert den TransactionProcessor.
        
        Args:
            db_session: SQLAlchemy Datenbanksession. Falls None, wird eine neue Session erstellt.
            chunk_size: Größe der Chunks für die Verarbeitung (Standard: 100)
        """
        self.db = db_session or next(get_db())
        self.chunk_size = chunk_size
    
    def process_transactions(self, transactions: List[Transaction]) -> TransactionResult:
        """
        Verarbeitet eine Liste von Transaktionen in Chunks mit Savepoints.
        
        Args:
            transactions: Liste der zu verarbeitenden Transaktionen
            
        Returns:
            TransactionResult mit Informationen über erfolgreiche und fehlgeschlagene Transaktionen
        """
        result = TransactionResult(
            total=len(transactions),
            successful=0,
            failed=0,
            failed_transactions=[],
            processing_time=0,
            start_time=datetime.now()
        )
        
        if not transactions:
            logger.info("Keine Transaktionen zum Verarbeiten")
            return result
        
        logger.info(f"Starte Verarbeitung von {len(transactions)} Transaktionen in Chunks von {self.chunk_size}")
        
        # Transaktionen in Chunks aufteilen
        chunks = [transactions[i:i+self.chunk_size] for i in range(0, len(transactions), self.chunk_size)]
        
        try:
            # Haupttransaktion starten
            for i, chunk in enumerate(chunks):
                savepoint_name = f"chunk_{i}"
                logger.debug(f"Verarbeite Chunk {i+1}/{len(chunks)} mit {len(chunk)} Transaktionen")
                
                # Savepoint für diesen Chunk setzen
                self.db.execute(f"SAVEPOINT {savepoint_name}")
                
                chunk_failed = False
                failed_transaction = None
                error_message = ""
                
                # Zuerst alle Transaktionen im Chunk validieren
                for transaction in chunk:
                    try:
                        self._validate_transaction(transaction)
                    except Exception as e:
                        chunk_failed = True
                        failed_transaction = transaction
                        error_message = f"Validierungsfehler: {str(e)}"
                        logger.error(f"Validierungsfehler bei Transaktion {transaction.id}: {str(e)}")
                        break
                
                # Wenn Validierung erfolgreich war, Transaktionen verarbeiten
                if not chunk_failed:
                    for transaction in chunk:
                        try:
                            self._process_single_transaction(transaction)
                            result.successful += 1
                        except Exception as e:
                            chunk_failed = True
                            failed_transaction = transaction
                            error_message = f"Verarbeitungsfehler: {str(e)}"
                            logger.error(f"Fehler bei Verarbeitung von Transaktion {transaction.id}: {str(e)}")
                            break
                
                # Chunk-Ergebnis verarbeiten
                if chunk_failed:
                    # Zum Savepoint zurückrollen
                    self.db.execute(f"ROLLBACK TO SAVEPOINT {savepoint_name}")
                    logger.warning(f"Chunk {i+1} fehlgeschlagen, Rollback durchgeführt")
                    
                    # Fehlgeschlagene Transaktionen protokollieren
                    result.failed += len(chunk)
                    if failed_transaction:
                        result.failed_transactions.append({
                            "transaction_id": failed_transaction.id,
                            "error": error_message
                        })
                else:
                    # Savepoint freigeben
                    self.db.execute(f"RELEASE SAVEPOINT {savepoint_name}")
                    logger.info(f"Chunk {i+1} erfolgreich verarbeitet")
            
            # Commit der Haupttransaktion
            self.db.commit()
            logger.info(f"Transaktionsverarbeitung abgeschlossen: {result.successful} erfolgreich, {result.failed} fehlgeschlagen")
            
        except SQLAlchemyError as e:
            # Fehler bei der Datenbankverbindung
            self.db.rollback()
            logger.error(f"Datenbankfehler bei der Transaktionsverarbeitung: {str(e)}")
            result.failed = len(transactions)
            result.successful = 0
            result.failed_transactions.append({
                "transaction_id": "batch",
                "error": f"Datenbankfehler: {str(e)}"
            })
        
        # Verarbeitungszeit berechnen
        result.end_time = datetime.now()
        result.processing_time = (result.end_time - result.start_time).total_seconds()
        
        return result
    
    def _validate_transaction(self, transaction: Transaction) -> bool:
        """
        Validiert eine einzelne Transaktion.
        
        Args:
            transaction: Zu validierende Transaktion
            
        Returns:
            True wenn die Transaktion gültig ist
            
        Raises:
            ValueError: Wenn die Transaktion ungültig ist
        """
        # Prüfen, ob alle erforderlichen Felder vorhanden sind
        if not transaction.id:
            raise ValueError("Transaktion hat keine ID")
        
        if not transaction.type:
            raise ValueError(f"Transaktionstyp fehlt für Transaktion {transaction.id}")
        
        if transaction.amount <= 0:
            raise ValueError(f"Ungültiger Betrag für Transaktion {transaction.id}: {transaction.amount}")
        
        # Typ-spezifische Validierung
        if transaction.type == "inventory":
            if not transaction.article_id:
                raise ValueError(f"Artikel-ID fehlt für Inventartransaktion {transaction.id}")
        elif transaction.type == "financial":
            if not transaction.account_id:
                raise ValueError(f"Konto-ID fehlt für Finanztransaktion {transaction.id}")
        
        return True
    
    def _process_single_transaction(self, transaction: Transaction) -> None:
        """
        Verarbeitet eine einzelne Transaktion.
        
        Args:
            transaction: Zu verarbeitende Transaktion
            
        Raises:
            Exception: Bei Fehlern während der Verarbeitung
        """
        try:
            # Transaktion in der Datenbank speichern
            self.db.add(transaction)
            
            # Status aktualisieren
            transaction_status = TransactionStatus(
                transaction_id=transaction.id,
                status="processing",
                timestamp=datetime.now()
            )
            self.db.add(transaction_status)
            
            # Typ-spezifische Verarbeitung
            if transaction.type == "inventory":
                self._process_inventory_transaction(transaction)
            elif transaction.type == "financial":
                self._process_financial_transaction(transaction)
            elif transaction.type == "transfer":
                self._process_transfer_transaction(transaction)
            else:
                raise ValueError(f"Unbekannter Transaktionstyp: {transaction.type}")
            
            # Status auf 'completed' setzen
            transaction_status.status = "completed"
            transaction_status.completed_at = datetime.now()
            
        except Exception as e:
            # Status auf 'failed' setzen
            if transaction_status:
                transaction_status.status = "failed"
                transaction_status.error_message = str(e)
            
            # Exception weiterleiten
            raise
    
    def _process_inventory_transaction(self, transaction: Transaction) -> None:
        """
        Verarbeitet eine Inventartransaktion.
        
        Args:
            transaction: Zu verarbeitende Inventartransaktion
        """
        from backend.models.artikel import Artikel
        
        artikel = self.db.query(Artikel).filter(Artikel.id == transaction.article_id).first()
        if not artikel:
            raise ValueError(f"Artikel mit ID {transaction.article_id} nicht gefunden")
        
        if transaction.direction == "in":
            artikel.bestand += transaction.amount
        elif transaction.direction == "out":
            if artikel.bestand < transaction.amount:
                raise ValueError(f"Unzureichender Bestand für Artikel {artikel.id}: {artikel.bestand} < {transaction.amount}")
            artikel.bestand -= transaction.amount
        else:
            raise ValueError(f"Ungültige Richtung für Inventartransaktion: {transaction.direction}")
        
        # Letztes Update-Datum aktualisieren
        artikel.updated_at = datetime.now()
    
    def _process_financial_transaction(self, transaction: Transaction) -> None:
        """
        Verarbeitet eine Finanztransaktion.
        
        Args:
            transaction: Zu verarbeitende Finanztransaktion
        """
        from backend.models.finance import FinanzKonto
        
        konto = self.db.query(FinanzKonto).filter(FinanzKonto.id == transaction.account_id).first()
        if not konto:
            raise ValueError(f"Konto mit ID {transaction.account_id} nicht gefunden")
        
        if transaction.direction == "in":
            konto.saldo += transaction.amount
        elif transaction.direction == "out":
            konto.saldo -= transaction.amount
        else:
            raise ValueError(f"Ungültige Richtung für Finanztransaktion: {transaction.direction}")
        
        # Buchung erstellen
        from backend.models.finance import Buchung
        buchung = Buchung(
            konto_id=konto.id,
            betrag=transaction.amount * (1 if transaction.direction == "in" else -1),
            beschreibung=transaction.description or f"Transaktion {transaction.id}",
            datum=datetime.now(),
            beleg_nr=transaction.reference_id
        )
        self.db.add(buchung)
    
    def _process_transfer_transaction(self, transaction: Transaction) -> None:
        """
        Verarbeitet eine Transfertransaktion (zwischen Konten).
        
        Args:
            transaction: Zu verarbeitende Transfertransaktion
        """
        if not transaction.target_account_id:
            raise ValueError(f"Zielkonto fehlt für Transfertransaktion {transaction.id}")
        
        # Quellkonto belasten
        source_transaction = Transaction(
            id=f"{transaction.id}_source",
            type="financial",
            amount=transaction.amount,
            direction="out",
            account_id=transaction.account_id,
            description=f"Transfer zu Konto {transaction.target_account_id}: {transaction.description}",
            reference_id=transaction.id
        )
        self._process_financial_transaction(source_transaction)
        
        # Zielkonto gutschreiben
        target_transaction = Transaction(
            id=f"{transaction.id}_target",
            type="financial",
            amount=transaction.amount,
            direction="in",
            account_id=transaction.target_account_id,
            description=f"Transfer von Konto {transaction.account_id}: {transaction.description}",
            reference_id=transaction.id
        )
        self._process_financial_transaction(target_transaction) 