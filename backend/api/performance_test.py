"""
Performance-Tests für die Transaktionsverarbeitung.
"""

import time
import uuid
import random
import argparse
import logging
from typing import List, Dict, Any
import statistics

from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.models.transaction_processing import (
    Transaction,
    TransactionProcessor
)

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_random_transaction() -> Transaction:
    """
    Generiert eine zufällige Transaktion für Tests.
    
    Returns:
        Eine zufällige Transaktion
    """
    transaction_types = ["inventory", "financial", "transfer"]
    directions = ["in", "out"]
    
    transaction_type = random.choice(transaction_types)
    direction = random.choice(directions)
    amount = round(random.uniform(1.0, 1000.0), 2)
    
    # Typ-spezifische Felder
    article_id = None
    account_id = None
    target_account_id = None
    
    if transaction_type == "inventory":
        article_id = f"artikel-{random.randint(1, 100)}"
    elif transaction_type == "financial":
        account_id = f"konto-{random.randint(1, 20)}"
    elif transaction_type == "transfer":
        account_id = f"konto-{random.randint(1, 20)}"
        target_account_id = f"konto-{random.randint(1, 20)}"
        # Sicherstellen, dass Quell- und Zielkonto unterschiedlich sind
        while target_account_id == account_id:
            target_account_id = f"konto-{random.randint(1, 20)}"
    
    return Transaction(
        id=str(uuid.uuid4()),
        type=transaction_type,
        amount=amount,
        direction=direction,
        description=f"Test-Transaktion {uuid.uuid4()}",
        reference_id=f"ref-{uuid.uuid4()}"[:10],
        article_id=article_id,
        account_id=account_id,
        target_account_id=target_account_id
    )

def generate_transaction_batch(size: int) -> List[Transaction]:
    """
    Generiert einen Batch von Transaktionen für Tests.
    
    Args:
        size: Anzahl der zu generierenden Transaktionen
        
    Returns:
        Liste von zufälligen Transaktionen
    """
    return [generate_random_transaction() for _ in range(size)]

def run_performance_test(
    batch_size: int,
    chunk_sizes: List[int],
    iterations: int = 3,
    db_session: Session = None
) -> Dict[int, Dict[str, Any]]:
    """
    Führt Performance-Tests für verschiedene Chunk-Größen durch.
    
    Args:
        batch_size: Größe des Transaktions-Batches
        chunk_sizes: Liste der zu testenden Chunk-Größen
        iterations: Anzahl der Testwiederholungen pro Chunk-Größe
        db_session: SQLAlchemy-Datenbanksession
        
    Returns:
        Dictionary mit Testergebnissen pro Chunk-Größe
    """
    if db_session is None:
        db_session = next(get_db())
    
    results = {}
    
    for chunk_size in chunk_sizes:
        logger.info(f"Teste Chunk-Größe: {chunk_size}")
        processing_times = []
        success_rates = []
        
        for i in range(iterations):
            logger.info(f"  Iteration {i+1}/{iterations}")
            
            # Transaktionen generieren
            transactions = generate_transaction_batch(batch_size)
            
            # Prozessor mit aktueller Chunk-Größe initialisieren
            processor = TransactionProcessor(db_session=db_session, chunk_size=chunk_size)
            
            # Zeit messen
            start_time = time.time()
            result = processor.process_transactions(transactions)
            end_time = time.time()
            
            # Ergebnisse sammeln
            processing_time = end_time - start_time
            processing_times.append(processing_time)
            success_rates.append(result._calculate_success_rate())
            
            logger.info(f"    Verarbeitungszeit: {processing_time:.3f}s, Erfolgsrate: {result._calculate_success_rate():.1f}%")
            
            # Rollback für den nächsten Test
            db_session.rollback()
        
        # Durchschnittliche Ergebnisse berechnen
        avg_processing_time = statistics.mean(processing_times)
        avg_success_rate = statistics.mean(success_rates)
        
        # Standardabweichung berechnen
        if len(processing_times) > 1:
            stdev_processing_time = statistics.stdev(processing_times)
        else:
            stdev_processing_time = 0
        
        results[chunk_size] = {
            "avg_processing_time": avg_processing_time,
            "stdev_processing_time": stdev_processing_time,
            "avg_success_rate": avg_success_rate,
            "transactions_per_second": batch_size / avg_processing_time
        }
        
        logger.info(f"Ergebnisse für Chunk-Größe {chunk_size}:")
        logger.info(f"  Durchschnittliche Verarbeitungszeit: {avg_processing_time:.3f}s ± {stdev_processing_time:.3f}s")
        logger.info(f"  Durchschnittliche Erfolgsrate: {avg_success_rate:.1f}%")
        logger.info(f"  Transaktionen pro Sekunde: {batch_size / avg_processing_time:.1f}")
    
    return results

def find_optimal_chunk_size(results: Dict[int, Dict[str, Any]]) -> int:
    """
    Ermittelt die optimale Chunk-Größe basierend auf den Testergebnissen.
    
    Args:
        results: Dictionary mit Testergebnissen pro Chunk-Größe
        
    Returns:
        Optimale Chunk-Größe
    """
    # Nach Transaktionen pro Sekunde sortieren
    sorted_results = sorted(
        results.items(),
        key=lambda x: x[1]["transactions_per_second"],
        reverse=True
    )
    
    optimal_chunk_size = sorted_results[0][0]
    optimal_tps = sorted_results[0][1]["transactions_per_second"]
    
    logger.info(f"Optimale Chunk-Größe: {optimal_chunk_size} mit {optimal_tps:.1f} Transaktionen pro Sekunde")
    
    return optimal_chunk_size

def main():
    """Hauptfunktion für die Performance-Tests."""
    parser = argparse.ArgumentParser(description="Performance-Tests für die Transaktionsverarbeitung")
    parser.add_argument("--batch-size", type=int, default=1000, help="Größe des Transaktions-Batches")
    parser.add_argument("--iterations", type=int, default=3, help="Anzahl der Testwiederholungen pro Chunk-Größe")
    parser.add_argument("--chunk-sizes", type=int, nargs="+", default=[50, 100, 200, 500, 1000], help="Zu testende Chunk-Größen")
    args = parser.parse_args()
    
    logger.info("Starte Performance-Tests für die Transaktionsverarbeitung")
    logger.info(f"Batch-Größe: {args.batch_size}")
    logger.info(f"Chunk-Größen: {args.chunk_sizes}")
    logger.info(f"Iterationen: {args.iterations}")
    
    # Tests durchführen
    results = run_performance_test(
        batch_size=args.batch_size,
        chunk_sizes=args.chunk_sizes,
        iterations=args.iterations
    )
    
    # Optimale Chunk-Größe ermitteln
    optimal_chunk_size = find_optimal_chunk_size(results)
    
    # Ergebnisse ausgeben
    logger.info("Performance-Test-Ergebnisse:")
    for chunk_size, result in sorted(results.items()):
        logger.info(f"Chunk-Größe {chunk_size}:")
        logger.info(f"  Durchschnittliche Verarbeitungszeit: {result['avg_processing_time']:.3f}s ± {result['stdev_processing_time']:.3f}s")
        logger.info(f"  Durchschnittliche Erfolgsrate: {result['avg_success_rate']:.1f}%")
        logger.info(f"  Transaktionen pro Sekunde: {result['transactions_per_second']:.1f}")
    
    logger.info(f"Empfohlene Chunk-Größe: {optimal_chunk_size}")

if __name__ == "__main__":
    main() 