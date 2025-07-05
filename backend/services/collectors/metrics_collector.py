from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import numpy as np
from prometheus_client import Counter, Histogram, Gauge

class MetricsCollector:
    """
    Collector Service für System- und Performance-Metriken.
    Teil der Collect Phase im APM Framework.
    """
    
    def __init__(self, mongodb_uri: str):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client.valeo_erp
        
        # Prometheus Metriken
        self.response_time = Histogram(
            'response_time_seconds',
            'Response time in seconds',
            ['endpoint', 'method']
        )
        
        self.error_counter = Counter(
            'error_total',
            'Total number of errors',
            ['type', 'severity']
        )
        
        self.transaction_counter = Counter(
            'transactions_total',
            'Total number of transactions',
            ['type', 'status']
        )
        
        self.resource_usage = Gauge(
            'resource_usage',
            'Current resource usage',
            ['resource_type', 'instance']
        )

    async def collect_response_times(self, endpoint: str, method: str, duration: float):
        """Erfasst Response-Zeiten für Endpoints."""
        self.response_time.labels(endpoint=endpoint, method=method).observe(duration)
        
        await self.db.metrics.insert_one({
            "type": "response_time",
            "endpoint": endpoint,
            "method": method,
            "duration": duration,
            "timestamp": datetime.utcnow()
        })

    async def collect_errors(self, error_type: str, severity: str, details: Dict):
        """Erfasst Fehler und deren Details."""
        self.error_counter.labels(type=error_type, severity=severity).inc()
        
        await self.db.metrics.insert_one({
            "type": "error",
            "error_type": error_type,
            "severity": severity,
            "details": details,
            "timestamp": datetime.utcnow()
        })

    async def collect_transactions(self, trans_type: str, status: str, details: Dict):
        """Erfasst Transaktionsmetriken."""
        self.transaction_counter.labels(type=trans_type, status=status).inc()
        
        await self.db.metrics.insert_one({
            "type": "transaction",
            "transaction_type": trans_type,
            "status": status,
            "details": details,
            "timestamp": datetime.utcnow()
        })

    async def collect_resource_usage(self, resource_type: str, instance: str, usage: float):
        """Erfasst Ressourcennutzung."""
        self.resource_usage.labels(
            resource_type=resource_type,
            instance=instance
        ).set(usage)
        
        await self.db.metrics.insert_one({
            "type": "resource_usage",
            "resource_type": resource_type,
            "instance": instance,
            "usage": usage,
            "timestamp": datetime.utcnow()
        })

    async def get_metrics_summary(self, start_time: datetime, end_time: datetime) -> Dict:
        """Erstellt eine Zusammenfassung der gesammelten Metriken."""
        pipeline = [
            {
                "$match": {
                    "timestamp": {
                        "$gte": start_time,
                        "$lte": end_time
                    }
                }
            },
            {
                "$group": {
                    "_id": "$type",
                    "count": {"$sum": 1},
                    "avg_value": {
                        "$avg": {
                            "$cond": [
                                {"$in": ["$type", ["response_time", "resource_usage"]]},
                                {"$ifNull": ["$duration", "$usage"]},
                                0
                            ]
                        }
                    }
                }
            }
        ]
        
        results = await self.db.metrics.aggregate(pipeline).to_list(None)
        
        return {
            "summary": results,
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        }

    async def prepare_handover(self) -> Dict:
        """
        Bereitet Metriken für das Handover zur Detect Phase vor.
        Standardisiert das Format und validiert die Datenqualität.
        """
        current_time = datetime.utcnow()
        one_hour_ago = current_time - timedelta(hours=1)
        
        # Aktuelle Metriken sammeln
        metrics_summary = await self.get_metrics_summary(one_hour_ago, current_time)
        
        # Datenqualität prüfen
        data_quality = await self._validate_data_quality(one_hour_ago, current_time)
        
        # Schwellwerte berechnen
        thresholds = await self._calculate_thresholds(one_hour_ago, current_time)
        
        return {
            "metrics_summary": metrics_summary,
            "data_quality": data_quality,
            "thresholds": thresholds,
            "sampling_rates": {
                "response_time": "1s",
                "errors": "real-time",
                "transactions": "real-time",
                "resource_usage": "5s"
            },
            "handover_timestamp": current_time.isoformat()
        }

    async def _validate_data_quality(self, start_time: datetime, end_time: datetime) -> Dict:
        """Prüft die Qualität der gesammelten Daten."""
        metrics = await self.db.metrics.find({
            "timestamp": {
                "$gte": start_time,
                "$lte": end_time
            }
        }).to_list(None)
        
        total_metrics = len(metrics)
        if total_metrics == 0:
            return {"quality_score": 0, "issues": ["Keine Daten verfügbar"]}
        
        missing_values = sum(1 for m in metrics if not all(m.values()))
        duplicates = len(metrics) - len({m["timestamp"].isoformat() for m in metrics})
        
        quality_score = 1.0 - (missing_values + duplicates) / total_metrics
        
        return {
            "quality_score": quality_score,
            "total_metrics": total_metrics,
            "missing_values": missing_values,
            "duplicates": duplicates,
            "issues": []
        }

    async def _calculate_thresholds(self, start_time: datetime, end_time: datetime) -> Dict:
        """Berechnet dynamische Schwellwerte basierend auf historischen Daten."""
        metrics = await self.db.metrics.find({
            "timestamp": {
                "$gte": start_time,
                "$lte": end_time
            }
        }).to_list(None)
        
        thresholds = {}
        for metric_type in ["response_time", "resource_usage"]:
            values = [m.get("duration", m.get("usage", 0)) 
                     for m in metrics if m["type"] == metric_type]
            
            if values:
                mean = np.mean(values)
                std = np.std(values)
                thresholds[metric_type] = {
                    "warning": mean + 2 * std,
                    "critical": mean + 3 * std,
                    "baseline": mean
                }
        
        return thresholds 