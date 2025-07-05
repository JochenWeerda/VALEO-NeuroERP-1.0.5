"""
Tests für die Transaktionsverarbeitung.
"""

import unittest
from unittest.mock import MagicMock, patch
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from backend.models.transaction_processing import (
    Transaction,
    TransactionProcessor,
    TransactionResult,
    TransactionStatus
)

class TestTransactionProcessor(unittest.TestCase):
    """Tests für den TransactionProcessor."""

    def setUp(self):
        """Initialisiert die Test-Umgebung."""
        self.db_mock = MagicMock(spec=Session)
        self.processor = TransactionProcessor(db_session=self.db_mock, chunk_size=2)

    def test_process_empty_transactions(self):
        """Testet die Verarbeitung einer leeren Transaktionsliste."""
        result = self.processor.process_transactions([])
        
        self.assertEqual(result.total, 0)
        self.assertEqual(result.successful, 0)
        self.assertEqual(result.failed, 0)
        self.assertEqual(len(result.failed_transactions), 0)
        self.assertFalse(result.has_failures())

    @patch('backend.models.transaction_processing.transaction_processor.Transaction')
    def test_process_single_valid_transaction(self, transaction_mock):
        """Testet die Verarbeitung einer einzelnen gültigen Transaktion."""
        # Mock-Transaktion erstellen
        transaction = MagicMock(spec=Transaction)
        transaction.id = str(uuid.uuid4())
        transaction.type = "inventory"
        transaction.amount = 100.0
        transaction.direction = "in"
        transaction.article_id = "artikel-1"
        
        # Mock für die Artikel-Abfrage
        artikel_mock = MagicMock()
        artikel_mock.id = "artikel-1"
        artikel_mock.bestand = 50
        self.db_mock.query().filter().first.return_value = artikel_mock
        
        # Transaktion verarbeiten
        result = self.processor.process_transactions([transaction])
        
        # Assertions
        self.assertEqual(result.total, 1)
        self.assertEqual(result.successful, 1)
        self.assertEqual(result.failed, 0)
        self.assertFalse(result.has_failures())
        
        # Überprüfen, ob die Transaktion korrekt verarbeitet wurde
        self.db_mock.add.assert_called()
        self.db_mock.commit.assert_called_once()
        
        # Überprüfen, ob der Artikel-Bestand aktualisiert wurde
        self.assertEqual(artikel_mock.bestand, 150)

    @patch('backend.models.transaction_processing.transaction_processor.Transaction')
    def test_process_invalid_transaction(self, transaction_mock):
        """Testet die Verarbeitung einer ungültigen Transaktion."""
        # Mock-Transaktion mit ungültigen Daten erstellen
        transaction = MagicMock(spec=Transaction)
        transaction.id = str(uuid.uuid4())
        transaction.type = "inventory"
        transaction.amount = -50.0  # Ungültiger Betrag
        transaction.direction = "in"
        transaction.article_id = "artikel-1"
        
        # Transaktion verarbeiten
        result = self.processor.process_transactions([transaction])
        
        # Assertions
        self.assertEqual(result.total, 1)
        self.assertEqual(result.successful, 0)
        self.assertEqual(result.failed, 1)
        self.assertTrue(result.has_failures())
        self.assertEqual(len(result.failed_transactions), 1)
        
        # Überprüfen, ob die Transaktion nicht gespeichert wurde
        self.db_mock.rollback.assert_called()

    @patch('backend.models.transaction_processing.transaction_processor.Transaction')
    def test_process_transaction_batch_with_chunks(self, transaction_mock):
        """Testet die Verarbeitung eines Batches von Transaktionen in Chunks."""
        # Mock-Transaktionen erstellen
        transactions = []
        for i in range(5):
            transaction = MagicMock(spec=Transaction)
            transaction.id = f"tx-{i}"
            transaction.type = "inventory"
            transaction.amount = 100.0
            transaction.direction = "in"
            transaction.article_id = f"artikel-{i}"
            transactions.append(transaction)
        
        # Mock für die Artikel-Abfrage
        def get_artikel(artikel_id):
            artikel_mock = MagicMock()
            artikel_mock.id = artikel_id
            artikel_mock.bestand = 50
            return artikel_mock
        
        self.db_mock.query().filter().first.side_effect = lambda: get_artikel("artikel-1")
        
        # Patch für _validate_transaction und _process_single_transaction
        with patch.object(self.processor, '_validate_transaction', return_value=True) as validate_mock:
            with patch.object(self.processor, '_process_single_transaction') as process_mock:
                # Transaktionen verarbeiten
                result = self.processor.process_transactions(transactions)
                
                # Assertions
                self.assertEqual(result.total, 5)
                self.assertEqual(result.successful, 5)
                self.assertEqual(result.failed, 0)
                
                # Überprüfen, ob die Chunks korrekt verarbeitet wurden
                self.assertEqual(validate_mock.call_count, 5)
                self.assertEqual(process_mock.call_count, 5)
                
                # Überprüfen, ob die Savepoints korrekt verwendet wurden
                self.assertEqual(self.db_mock.execute.call_count, 6)  # 3 Chunks * 2 (SAVEPOINT + RELEASE)

    @patch('backend.models.transaction_processing.transaction_processor.Transaction')
    def test_process_transaction_with_error_in_chunk(self, transaction_mock):
        """Testet die Verarbeitung eines Batches mit einem Fehler in einem Chunk."""
        # Mock-Transaktionen erstellen
        transactions = []
        for i in range(4):
            transaction = MagicMock(spec=Transaction)
            transaction.id = f"tx-{i}"
            transaction.type = "inventory"
            transaction.amount = 100.0
            transaction.direction = "in"
            transaction.article_id = f"artikel-{i}"
            transactions.append(transaction)
        
        # Patch für _validate_transaction und _process_single_transaction
        def validate_mock(transaction):
            if transaction.id == "tx-2":
                raise ValueError("Ungültige Transaktion")
            return True
        
        with patch.object(self.processor, '_validate_transaction', side_effect=validate_mock):
            with patch.object(self.processor, '_process_single_transaction'):
                # Transaktionen verarbeiten
                result = self.processor.process_transactions(transactions)
                
                # Assertions
                self.assertEqual(result.total, 4)
                self.assertEqual(result.successful, 2)  # Nur der erste Chunk war erfolgreich
                self.assertEqual(result.failed, 2)  # Der zweite Chunk ist fehlgeschlagen
                self.assertTrue(result.has_failures())
                
                # Überprüfen, ob der Rollback für den fehlgeschlagenen Chunk durchgeführt wurde
                self.db_mock.execute.assert_any_call("ROLLBACK TO SAVEPOINT chunk_1")

if __name__ == '__main__':
    unittest.main() 