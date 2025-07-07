"""
Metriken für das Error Handling System
"""

import time
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import json
import os

@dataclass
class ErrorMetrics:
    """Erfasst Metriken für Fehler und Recovery-Versuche"""
    
    total_errors: int = 0
    recovery_attempts: int = 0
    successful_recoveries: int = 0
    failed_recoveries: int = 0
    
    error_types: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    strategy_usage: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    strategy_success: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    
    avg_recovery_time: float = 0.0
    total_recovery_time: float = 0.0
    
    def record_error(self, error_type: str):
        """Erfasst einen neuen Fehler"""
        self.total_errors += 1
        self.error_types[error_type] += 1
    
    def record_recovery_attempt(self, strategy: str, start_time: float):
        """Erfasst einen Recovery-Versuch"""
        self.recovery_attempts += 1
        self.strategy_usage[strategy] += 1
        
        recovery_time = time.time() - start_time
        self.total_recovery_time += recovery_time
        self.avg_recovery_time = self.total_recovery_time / self.recovery_attempts
    
    def record_recovery_result(self, strategy: str, success: bool):
        """Erfasst das Ergebnis eines Recovery-Versuchs"""
        if success:
            self.successful_recoveries += 1
            self.strategy_success[strategy] += 1
        else:
            self.failed_recoveries += 1
    
    def get_success_rate(self) -> float:
        """Berechnet die Erfolgsrate der Recovery-Versuche"""
        if self.recovery_attempts == 0:
            return 0.0
        return (self.successful_recoveries / self.recovery_attempts) * 100
    
    def get_strategy_success_rates(self) -> Dict[str, float]:
        """Berechnet die Erfolgsrate pro Strategie"""
        rates = {}
        for strategy in self.strategy_usage:
            attempts = self.strategy_usage[strategy]
            successes = self.strategy_success.get(strategy, 0)
            rates[strategy] = (successes / attempts * 100) if attempts > 0 else 0.0
        return rates
    
    def to_dict(self) -> Dict:
        """Konvertiert die Metriken in ein Dictionary"""
        return {
            "total_errors": self.total_errors,
            "recovery_attempts": self.recovery_attempts,
            "successful_recoveries": self.successful_recoveries,
            "failed_recoveries": self.failed_recoveries,
            "success_rate": self.get_success_rate(),
            "error_types": dict(self.error_types),
            "strategy_usage": dict(self.strategy_usage),
            "strategy_success_rates": self.get_strategy_success_rates(),
            "avg_recovery_time": self.avg_recovery_time
        }
    
    def save_to_file(self, filename: str = None):
        """Speichert die Metriken in eine Datei"""
        if filename is None:
            filename = f"logs/error_metrics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)

class MetricsCollector:
    """Zentrale Sammlung von Metriken"""
    
    def __init__(self):
        self.current_metrics = ErrorMetrics()
        self.historical_metrics: List[Dict] = []
        self.load_historical_metrics()
    
    def load_historical_metrics(self):
        """Lädt historische Metriken aus Dateien"""
        metrics_dir = "logs"
        if not os.path.exists(metrics_dir):
            return
        
        for file in os.listdir(metrics_dir):
            if file.startswith("error_metrics_") and file.endswith(".json"):
                try:
                    with open(os.path.join(metrics_dir, file), 'r', encoding='utf-8') as f:
                        self.historical_metrics.append(json.load(f))
                except Exception as e:
                    print(f"Fehler beim Laden der Metriken aus {file}: {e}")
    
    def get_trend_analysis(self) -> Dict:
        """Analysiert Trends in den Metriken"""
        if not self.historical_metrics:
            return {}
        
        total_metrics = len(self.historical_metrics)
        trend = {
            "success_rate_trend": sum(m.get("success_rate", 0) for m in self.historical_metrics) / total_metrics,
            "avg_recovery_time_trend": sum(m.get("avg_recovery_time", 0) for m in self.historical_metrics) / total_metrics,
            "most_common_errors": self._get_most_common_items(
                [error for m in self.historical_metrics for error, count in m.get("error_types", {}).items()]
            ),
            "most_successful_strategies": self._get_most_successful_strategies()
        }
        return trend
    
    def _get_most_common_items(self, items: List[str], limit: int = 5) -> List[str]:
        """Findet die häufigsten Items in einer Liste"""
        if not items:
            return []
        
        counts = defaultdict(int)
        for item in items:
            counts[item] += 1
        
        return sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    def _get_most_successful_strategies(self, limit: int = 5) -> List[Dict]:
        """Findet die erfolgreichsten Recovery-Strategien"""
        if not self.historical_metrics:
            return []
        
        strategy_success = defaultdict(list)
        for metrics in self.historical_metrics:
            for strategy, rate in metrics.get("strategy_success_rates", {}).items():
                strategy_success[strategy].append(rate)
        
        avg_success = {
            strategy: sum(rates) / len(rates)
            for strategy, rates in strategy_success.items()
        }
        
        return sorted(
            [{"strategy": k, "avg_success_rate": v} for k, v in avg_success.items()],
            key=lambda x: x["avg_success_rate"],
            reverse=True
        )[:limit] 