from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient

class AnomalyDetector:
    """
    Detector Service für Anomalieerkennung.
    Teil der Detect Phase im APM Framework.
    """
    
    def __init__(self, mongodb_uri: str):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client.valeo_erp
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42
        )

    async def detect_performance_anomalies(self, metrics: Dict) -> Dict:
        """Erkennt Performance-Anomalien in den übergebenen Metriken."""
        anomalies = {
            "response_time": [],
            "resource_usage": [],
            "error_rate": []
        }
        
        # Response Time Anomalien
        if "response_time" in metrics:
            response_times = np.array(metrics["response_time"]).reshape(-1, 1)
            scaled_times = self.scaler.fit_transform(response_times)
            predictions = self.isolation_forest.fit_predict(scaled_times)
            
            anomalies["response_time"] = [
                {"timestamp": ts, "value": val, "severity": "high"}
                for ts, val, pred in zip(
                    metrics["timestamps"],
                    metrics["response_time"],
                    predictions
                )
                if pred == -1
            ]

        # Resource Usage Anomalien
        if "resource_usage" in metrics:
            for resource_type, usage_data in metrics["resource_usage"].items():
                usage_values = np.array(usage_data).reshape(-1, 1)
                scaled_usage = self.scaler.fit_transform(usage_values)
                predictions = self.isolation_forest.fit_predict(scaled_usage)
                
                anomalies["resource_usage"].extend([
                    {
                        "timestamp": ts,
                        "resource_type": resource_type,
                        "value": val,
                        "severity": "high"
                    }
                    for ts, val, pred in zip(
                        metrics["timestamps"],
                        usage_data,
                        predictions
                    )
                    if pred == -1
                ])

        return anomalies

    async def detect_error_patterns(self, error_data: Dict) -> Dict:
        """Erkennt Muster in Fehlerereignissen."""
        error_patterns = []
        
        # Fehler nach Typ gruppieren
        error_groups = {}
        for error in error_data["errors"]:
            error_type = error["type"]
            if error_type not in error_groups:
                error_groups[error_type] = []
            error_groups[error_type].append(error)
        
        # Muster in jedem Fehlertyp erkennen
        for error_type, errors in error_groups.items():
            if len(errors) >= 3:  # Mindestens 3 Fehler für ein Muster
                timestamps = [e["timestamp"] for e in errors]
                time_diffs = np.diff([ts.timestamp() for ts in timestamps])
                
                # Regelmäßige Zeitabstände erkennen
                if np.std(time_diffs) < np.mean(time_diffs) * 0.2:
                    error_patterns.append({
                        "type": error_type,
                        "pattern": "periodic",
                        "frequency": np.mean(time_diffs),
                        "count": len(errors),
                        "severity": "medium"
                    })
                
                # Burst-Muster erkennen
                elif np.max(time_diffs) > np.mean(time_diffs) * 5:
                    error_patterns.append({
                        "type": error_type,
                        "pattern": "burst",
                        "max_frequency": np.min(time_diffs),
                        "count": len(errors),
                        "severity": "high"
                    })

        return {"patterns": error_patterns}

    async def detect_business_rule_violations(self, transaction_data: Dict) -> Dict:
        """Erkennt Verletzungen von Geschäftsregeln."""
        violations = []
        
        # Transaktionslimits prüfen
        for transaction in transaction_data["transactions"]:
            amount = transaction.get("amount", 0)
            
            if amount > transaction_data["limits"]["max_amount"]:
                violations.append({
                    "type": "amount_limit_exceeded",
                    "transaction_id": transaction["id"],
                    "amount": amount,
                    "limit": transaction_data["limits"]["max_amount"],
                    "severity": "high"
                })
            
            # Weitere Geschäftsregeln prüfen...

        return {"violations": violations}

    async def prepare_handover(self, anomalies: Dict) -> Dict:
        """
        Bereitet erkannte Anomalien für das Handover zur Diagnose Phase vor.
        Klassifiziert und priositiert die Anomalien.
        """
        # Anomalien klassifizieren
        classified_anomalies = self._classify_anomalies(anomalies)
        
        # Impact bewerten
        impact_assessment = await self._assess_impact(classified_anomalies)
        
        # Kontext sammeln
        context = await self._gather_context(classified_anomalies)
        
        return {
            "anomalies": classified_anomalies,
            "impact_assessment": impact_assessment,
            "context": context,
            "handover_timestamp": datetime.utcnow().isoformat(),
            "priority_levels": {
                "high": len([a for a in classified_anomalies if a["priority"] == "high"]),
                "medium": len([a for a in classified_anomalies if a["priority"] == "medium"]),
                "low": len([a for a in classified_anomalies if a["priority"] == "low"])
            }
        }

    def _classify_anomalies(self, anomalies: Dict) -> List[Dict]:
        """Klassifiziert Anomalien nach Typ und Schweregrad."""
        classified = []
        
        for anomaly_type, items in anomalies.items():
            for item in items:
                severity = item.get("severity", "medium")
                
                # Priorität basierend auf Typ und Schweregrad
                priority = "high" if severity == "high" else \
                          "medium" if severity == "medium" else "low"
                
                classified.append({
                    "type": anomaly_type,
                    "details": item,
                    "severity": severity,
                    "priority": priority,
                    "timestamp": item.get("timestamp", datetime.utcnow().isoformat())
                })
        
        return sorted(classified, key=lambda x: x["priority"])

    async def _assess_impact(self, anomalies: List[Dict]) -> Dict:
        """Bewertet den Impact der erkannten Anomalien."""
        impact = {
            "system_health": 1.0,
            "user_experience": 1.0,
            "business_metrics": 1.0
        }
        
        for anomaly in anomalies:
            severity_factor = {
                "high": 0.3,
                "medium": 0.2,
                "low": 0.1
            }.get(anomaly["severity"], 0.1)
            
            if anomaly["type"] == "response_time":
                impact["user_experience"] -= severity_factor
            elif anomaly["type"] == "resource_usage":
                impact["system_health"] -= severity_factor
            elif anomaly["type"] == "error_rate":
                impact["system_health"] -= severity_factor
                impact["user_experience"] -= severity_factor
        
        # Werte auf 0-1 begrenzen
        for key in impact:
            impact[key] = max(0.0, min(1.0, impact[key]))
        
        return impact

    async def _gather_context(self, anomalies: List[Dict]) -> Dict:
        """Sammelt Kontext-Informationen für die erkannten Anomalien."""
        # Zeitfenster für Kontext
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=1)
        
        # System-Metriken
        system_metrics = await self.db.metrics.find({
            "timestamp": {
                "$gte": start_time,
                "$lte": end_time
            }
        }).to_list(None)
        
        # Aktive Benutzer
        active_users = await self.db.sessions.count_documents({
            "last_activity": {
                "$gte": start_time,
                "$lte": end_time
            }
        })
        
        return {
            "system_metrics": system_metrics,
            "active_users": active_users,
            "time_window": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat()
            }
        } 