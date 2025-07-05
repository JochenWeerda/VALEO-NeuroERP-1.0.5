from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import networkx as nx
import pandas as pd
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient

class RootCauseAnalyzer:
    """
    Analyzer Service für Root Cause Analysis.
    Teil der Diagnose Phase im APM Framework.
    """
    
    def __init__(self, mongodb_uri: str):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client.valeo_erp
        self.dependency_graph = nx.DiGraph()
        self._build_dependency_graph()

    def _build_dependency_graph(self):
        """Baut den Service-Abhängigkeitsgraphen auf."""
        # Frontend Services
        self.dependency_graph.add_edge("ui", "api_gateway")
        self.dependency_graph.add_edge("ui", "auth_service")
        
        # API Gateway
        self.dependency_graph.add_edge("api_gateway", "user_service")
        self.dependency_graph.add_edge("api_gateway", "product_service")
        self.dependency_graph.add_edge("api_gateway", "order_service")
        
        # Microservices
        self.dependency_graph.add_edge("user_service", "auth_service")
        self.dependency_graph.add_edge("user_service", "db_users")
        self.dependency_graph.add_edge("product_service", "db_products")
        self.dependency_graph.add_edge("order_service", "db_orders")
        self.dependency_graph.add_edge("order_service", "payment_service")
        
        # Externe Dienste
        self.dependency_graph.add_edge("payment_service", "external_payment")
        self.dependency_graph.add_edge("auth_service", "external_auth")

    async def analyze_root_cause(self, anomaly_data: Dict) -> Dict:
        """Führt eine Root Cause Analysis für die übergebenen Anomalien durch."""
        root_causes = []
        
        for anomaly in anomaly_data["anomalies"]:
            # Service identifizieren
            affected_service = self._identify_affected_service(anomaly)
            
            # Abhängige Services analysieren
            dependencies = self._analyze_dependencies(affected_service)
            
            # Metriken der abhängigen Services laden
            metrics = await self._load_service_metrics(dependencies)
            
            # Root Cause identifizieren
            cause = self._identify_root_cause(
                anomaly,
                affected_service,
                dependencies,
                metrics
            )
            
            if cause:
                root_causes.append(cause)
        
        return {
            "root_causes": root_causes,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }

    def _identify_affected_service(self, anomaly: Dict) -> str:
        """Identifiziert den von der Anomalie betroffenen Service."""
        if "endpoint" in anomaly:
            return self._map_endpoint_to_service(anomaly["endpoint"])
        elif "resource_type" in anomaly:
            return anomaly["resource_type"]
        else:
            return "unknown"

    def _analyze_dependencies(self, service: str) -> List[str]:
        """Analysiert die Service-Abhängigkeiten."""
        if service not in self.dependency_graph:
            return []
        
        # Upstream Dependencies
        predecessors = list(self.dependency_graph.predecessors(service))
        
        # Downstream Dependencies
        successors = list(self.dependency_graph.successors(service))
        
        return predecessors + [service] + successors

    async def _load_service_metrics(self, services: List[str]) -> Dict:
        """Lädt die Metriken für die angegebenen Services."""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=30)
        
        metrics = {}
        for service in services:
            service_metrics = await self.db.metrics.find({
                "service": service,
                "timestamp": {
                    "$gte": start_time,
                    "$lte": end_time
                }
            }).to_list(None)
            
            if service_metrics:
                metrics[service] = {
                    "response_times": [m["duration"] for m in service_metrics if "duration" in m],
                    "error_rates": [m["error_rate"] for m in service_metrics if "error_rate" in m],
                    "resource_usage": [m["usage"] for m in service_metrics if "usage" in m]
                }
        
        return metrics

    def _identify_root_cause(
        self,
        anomaly: Dict,
        affected_service: str,
        dependencies: List[str],
        metrics: Dict
    ) -> Optional[Dict]:
        """Identifiziert die Grundursache basierend auf Metriken und Abhängigkeiten."""
        # Zeitliche Korrelation prüfen
        temporal_correlation = self._analyze_temporal_correlation(metrics)
        
        # Performance-Bottlenecks identifizieren
        bottlenecks = self._identify_bottlenecks(metrics)
        
        # Error Propagation analysieren
        error_chain = self._analyze_error_propagation(metrics)
        
        # Root Cause bestimmen
        if temporal_correlation:
            return {
                "type": "temporal_correlation",
                "affected_service": affected_service,
                "root_service": temporal_correlation["service"],
                "correlation_type": temporal_correlation["type"],
                "confidence": temporal_correlation["confidence"]
            }
        elif bottlenecks:
            return {
                "type": "performance_bottleneck",
                "affected_service": affected_service,
                "bottleneck_service": bottlenecks[0]["service"],
                "bottleneck_type": bottlenecks[0]["type"],
                "severity": bottlenecks[0]["severity"]
            }
        elif error_chain:
            return {
                "type": "error_propagation",
                "affected_service": affected_service,
                "origin_service": error_chain["origin"],
                "propagation_path": error_chain["path"],
                "error_type": error_chain["type"]
            }
        
        return None

    def _analyze_temporal_correlation(self, metrics: Dict) -> Optional[Dict]:
        """Analysiert zeitliche Korrelationen zwischen Service-Metriken."""
        correlations = []
        
        for service1, metrics1 in metrics.items():
            for service2, metrics2 in metrics.items():
                if service1 != service2:
                    # Response Time Korrelation
                    if "response_times" in metrics1 and "response_times" in metrics2:
                        corr = np.corrcoef(
                            metrics1["response_times"],
                            metrics2["response_times"]
                        )[0, 1]
                        
                        if abs(corr) > 0.8:  # Starke Korrelation
                            correlations.append({
                                "service": service2,
                                "type": "response_time",
                                "correlation": corr,
                                "confidence": abs(corr)
                            })
        
        return max(correlations, key=lambda x: x["confidence"]) if correlations else None

    def _identify_bottlenecks(self, metrics: Dict) -> List[Dict]:
        """Identifiziert Performance-Bottlenecks in den Services."""
        bottlenecks = []
        
        for service, service_metrics in metrics.items():
            # CPU Bottlenecks
            if "resource_usage" in service_metrics:
                cpu_usage = np.mean(service_metrics["resource_usage"])
                if cpu_usage > 80:
                    bottlenecks.append({
                        "service": service,
                        "type": "cpu",
                        "value": cpu_usage,
                        "severity": "high" if cpu_usage > 90 else "medium"
                    })
            
            # Response Time Bottlenecks
            if "response_times" in service_metrics:
                avg_response = np.mean(service_metrics["response_times"])
                if avg_response > 1.0:  # 1 Sekunde
                    bottlenecks.append({
                        "service": service,
                        "type": "response_time",
                        "value": avg_response,
                        "severity": "high" if avg_response > 2.0 else "medium"
                    })
        
        return sorted(bottlenecks, key=lambda x: x["severity"] == "high", reverse=True)

    def _analyze_error_propagation(self, metrics: Dict) -> Optional[Dict]:
        """Analysiert die Fehlerausbreitung zwischen Services."""
        error_sequences = []
        
        for service, service_metrics in metrics.items():
            if "error_rates" in service_metrics:
                error_rate = np.mean(service_metrics["error_rates"])
                if error_rate > 0:
                    # Downstream Services prüfen
                    downstream = list(self.dependency_graph.successors(service))
                    propagation = []
                    
                    for ds in downstream:
                        if ds in metrics and "error_rates" in metrics[ds]:
                            ds_error_rate = np.mean(metrics[ds]["error_rates"])
                            if ds_error_rate > 0:
                                propagation.append(ds)
                    
                    if propagation:
                        error_sequences.append({
                            "origin": service,
                            "path": propagation,
                            "type": "error_propagation",
                            "error_rate": error_rate
                        })
        
        return max(error_sequences, key=lambda x: x["error_rate"]) if error_sequences else None

    async def prepare_handover(self, root_causes: List[Dict]) -> Dict:
        """
        Bereitet die Diagnose-Ergebnisse für das Handover zur Resolve Phase vor.
        """
        # Handlungsempfehlungen generieren
        recommendations = self._generate_recommendations(root_causes)
        
        # Maßnahmen priorisieren
        prioritized_actions = self._prioritize_actions(recommendations)
        
        # Impact-Bewertung
        impact = await self._assess_business_impact(root_causes)
        
        return {
            "root_causes": root_causes,
            "recommendations": recommendations,
            "prioritized_actions": prioritized_actions,
            "business_impact": impact,
            "handover_timestamp": datetime.utcnow().isoformat()
        }

    def _generate_recommendations(self, root_causes: List[Dict]) -> List[Dict]:
        """Generiert Handlungsempfehlungen basierend auf den Root Causes."""
        recommendations = []
        
        for cause in root_causes:
            if cause["type"] == "performance_bottleneck":
                if cause["bottleneck_type"] == "cpu":
                    recommendations.append({
                        "type": "scaling",
                        "service": cause["bottleneck_service"],
                        "action": "increase_capacity",
                        "details": "CPU Auslastung erhöhen"
                    })
                elif cause["bottleneck_type"] == "response_time":
                    recommendations.append({
                        "type": "optimization",
                        "service": cause["bottleneck_service"],
                        "action": "optimize_performance",
                        "details": "Response Time optimieren"
                    })
            elif cause["type"] == "error_propagation":
                recommendations.append({
                    "type": "resilience",
                    "service": cause["origin_service"],
                    "action": "implement_circuit_breaker",
                    "details": "Circuit Breaker implementieren"
                })
        
        return recommendations

    def _prioritize_actions(self, recommendations: List[Dict]) -> List[Dict]:
        """Priorisiert die empfohlenen Maßnahmen."""
        priority_scores = {
            "scaling": 3,
            "optimization": 2,
            "resilience": 1
        }
        
        for rec in recommendations:
            rec["priority_score"] = priority_scores.get(rec["type"], 0)
        
        return sorted(recommendations, key=lambda x: x["priority_score"], reverse=True)

    async def _assess_business_impact(self, root_causes: List[Dict]) -> Dict:
        """Bewertet den Business Impact der identifizierten Probleme."""
        impact = {
            "revenue": 0.0,
            "user_satisfaction": 0.0,
            "system_stability": 0.0
        }
        
        for cause in root_causes:
            if cause["type"] == "performance_bottleneck":
                impact["user_satisfaction"] -= 0.2
                impact["system_stability"] -= 0.3
            elif cause["type"] == "error_propagation":
                impact["revenue"] -= 0.3
                impact["user_satisfaction"] -= 0.4
                impact["system_stability"] -= 0.4
        
        # Werte auf 0-1 normalisieren
        for key in impact:
            impact[key] = max(0.0, 1.0 + impact[key])
        
        return impact 