"""
Ergebnismodell für die Transaktionsverarbeitung.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

class TransactionResult:
    """
    Repräsentiert das Ergebnis einer Transaktionsverarbeitung.
    Enthält Informationen über erfolgreiche und fehlgeschlagene Transaktionen.
    """
    
    def __init__(
        self,
        total: int = 0,
        successful: int = 0,
        failed: int = 0,
        failed_transactions: Optional[List[Dict[str, Any]]] = None,
        processing_time: float = 0.0,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ):
        """
        Initialisiert ein TransactionResult.
        
        Args:
            total: Gesamtzahl der verarbeiteten Transaktionen
            successful: Anzahl der erfolgreichen Transaktionen
            failed: Anzahl der fehlgeschlagenen Transaktionen
            failed_transactions: Liste der fehlgeschlagenen Transaktionen mit Fehlerinformationen
            processing_time: Verarbeitungszeit in Sekunden
            start_time: Startzeitpunkt der Verarbeitung
            end_time: Endzeitpunkt der Verarbeitung
        """
        self.total = total
        self.successful = successful
        self.failed = failed
        self.failed_transactions = failed_transactions or []
        self.processing_time = processing_time
        self.start_time = start_time or datetime.now()
        self.end_time = end_time
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Konvertiert das Ergebnis in ein Dictionary.
        
        Returns:
            Dictionary-Repräsentation des Ergebnisses
        """
        return {
            "total": self.total,
            "successful": self.successful,
            "failed": self.failed,
            "failed_transactions": self.failed_transactions,
            "processing_time": self.processing_time,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "success_rate": self._calculate_success_rate()
        }
    
    def _calculate_success_rate(self) -> float:
        """
        Berechnet die Erfolgsrate der Transaktionsverarbeitung.
        
        Returns:
            Erfolgsrate als Prozentsatz (0-100)
        """
        if self.total == 0:
            return 100.0
        return (self.successful / self.total) * 100.0
    
    def has_failures(self) -> bool:
        """
        Prüft, ob es fehlgeschlagene Transaktionen gibt.
        
        Returns:
            True, wenn es fehlgeschlagene Transaktionen gibt, sonst False
        """
        return self.failed > 0
    
    def add_failed_transaction(self, transaction_id: str, error: str) -> None:
        """
        Fügt eine fehlgeschlagene Transaktion hinzu.
        
        Args:
            transaction_id: ID der fehlgeschlagenen Transaktion
            error: Fehlermeldung
        """
        self.failed_transactions.append({
            "transaction_id": transaction_id,
            "error": error
        })
        self.failed += 1
    
    def __str__(self) -> str:
        """
        String-Repräsentation des Ergebnisses.
        
        Returns:
            String-Repräsentation des Ergebnisses
        """
        return (
            f"TransactionResult: {self.successful}/{self.total} erfolgreich "
            f"({self._calculate_success_rate():.1f}%), "
            f"{self.failed} fehlgeschlagen, "
            f"Verarbeitungszeit: {self.processing_time:.3f}s"
        )
    
    def __repr__(self) -> str:
        return self.__str__() 