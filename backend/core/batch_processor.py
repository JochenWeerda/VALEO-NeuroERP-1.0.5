from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import asyncio
from pydantic import BaseModel

from .logging import logger
from .error_handling import ErrorHandler, ErrorCode, ErrorSeverity
from backend.schemas.transaction import TransactionCreate, TransactionBatchResponse

class BatchProcessor:
    """Optimierter Batch-Processor für Transaktionen."""

    def __init__(self, chunk_size: int = 100, max_workers: int = 4):
        self.chunk_size = chunk_size
        self.max_workers = max_workers
        self.cache = {}  # Simple In-Memory Cache

    def _chunk_transactions(
        self,
        transactions: List[TransactionCreate]
    ) -> List[List[TransactionCreate]]:
        """Teilt Transaktionen in Chunks auf."""
        return [
            transactions[i:i + self.chunk_size]
            for i in range(0, len(transactions), self.chunk_size)
        ]

    async def _process_chunk(
        self,
        chunk: List[TransactionCreate]
    ) -> Dict[str, Any]:
        """Verarbeitet einen Chunk von Transaktionen."""
        results = {
            "successful": 0,
            "failed": 0,
            "failed_transactions": []
        }

        for transaction in chunk:
            try:
                # Hier würde die eigentliche Transaktionsverarbeitung stattfinden
                # Beispiel für die Struktur:
                success = await self._process_single_transaction(transaction)
                
                if success:
                    results["successful"] += 1
                else:
                    results["failed"] += 1
                    results["failed_transactions"].append({
                        "transaction": transaction.dict(),
                        "error": "Processing failed"
                    })
            
            except Exception as e:
                results["failed"] += 1
                results["failed_transactions"].append({
                    "transaction": transaction.dict(),
                    "error": str(e)
                })

        return results

    async def _process_single_transaction(
        self,
        transaction: TransactionCreate
    ) -> bool:
        """Verarbeitet eine einzelne Transaktion."""
        # Hier würde die tatsächliche Transaktionslogik implementiert
        # Dies ist nur ein Platzhalter
        await asyncio.sleep(0.1)  # Simuliert Verarbeitungszeit
        return True

    def _merge_results(
        self,
        chunk_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Führt die Ergebnisse der Chunk-Verarbeitung zusammen."""
        merged = {
            "successful": 0,
            "failed": 0,
            "failed_transactions": [],
            "processing_time": 0.0
        }

        for result in chunk_results:
            merged["successful"] += result["successful"]
            merged["failed"] += result["failed"]
            merged["failed_transactions"].extend(result["failed_transactions"])

        total = merged["successful"] + merged["failed"]
        merged["success_rate"] = (merged["successful"] / total * 100) if total > 0 else 0.0

        return merged

    async def process_batch(
        self,
        transactions: List[TransactionCreate]
    ) -> TransactionBatchResponse:
        """Verarbeitet einen Batch von Transaktionen parallel."""
        start_time = datetime.utcnow()
        
        try:
            # Chunking
            chunks = self._chunk_transactions(transactions)
            chunk_results = []

            # Parallele Verarbeitung der Chunks
            tasks = [self._process_chunk(chunk) for chunk in chunks]
            chunk_results = await asyncio.gather(*tasks)

            # Ergebnisse zusammenführen
            results = self._merge_results(chunk_results)
            results["processing_time"] = (
                datetime.utcnow() - start_time
            ).total_seconds()

            # Logging
            logger.log_batch_operation(
                batch_id=str(start_time.timestamp()),
                operation="process",
                status="completed",
                details=results
            )

            return TransactionBatchResponse(
                total=len(transactions),
                **results
            )

        except Exception as e:
            error = ErrorHandler.handle_batch_error(str(e))
            logger.error(
                "Batch processing failed",
                error=error,
                context={"batch_size": len(transactions)}
            )
            raise

    def invalidate_cache(self, key: str):
        """Invalidiert einen Cache-Eintrag."""
        if key in self.cache:
            del self.cache[key]

    def clear_cache(self):
        """Leert den gesamten Cache."""
        self.cache.clear()

# Globale Batch-Processor-Instanz
batch_processor = BatchProcessor() 