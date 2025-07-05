# -*- coding: utf-8 -*-
"""
Monitoring-Komponente für das VALEO-NeuroERP Multi-Agent-System.
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import prometheus_client as prom
from prometheus_client import Counter, Gauge, Histogram
import psutil
import os

class SystemMonitor:
    """Monitoring-Komponente für das Multi-Agent-System."""
    
    def __init__(self):
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.valeo_neuro_erp
        
        # Prometheus Metriken
        self.active_agents = Gauge(
            "valeo_active_agents",
            "Anzahl aktiver Agenten"
        )
        self.active_workflows = Gauge(
            "valeo_active_workflows",
            "Anzahl aktiver Workflows"
        )
        self.workflow_duration = Histogram(
            "valeo_workflow_duration_seconds",
            "Ausführungsdauer der Workflows",
            buckets=[10, 30, 60, 120, 300, 600]
        )
        self.test_executions = Counter(
            "valeo_test_executions_total",
            "Gesamtzahl der Testausführungen"
        )
        self.test_failures = Counter(
            "valeo_test_failures_total",
            "Gesamtzahl der fehlgeschlagenen Tests"
        )
        
        # System Metriken
        self.cpu_usage = Gauge(
            "valeo_cpu_usage_percent",
            "CPU-Auslastung in Prozent"
        )
        self.memory_usage = Gauge(
            "valeo_memory_usage_bytes",
            "Speicherverbrauch in Bytes"
        )
        self.disk_usage = Gauge(
            "valeo_disk_usage_percent",
            "Festplattennutzung in Prozent"
        )
        
        # Logging
        self.logger = logging.getLogger("valeo_monitor")
        self.setup_logging()
        
    def setup_logging(self):
        """Konfiguriert das Logging-System."""
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        
        # File Handler
        fh = logging.FileHandler("logs/monitor.log", encoding="utf-8")
        fh.setLevel(logging.INFO)
        fh.setFormatter(formatter)
        self.logger.addHandler(fh)
        
        # Console Handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)
        
    async def start_monitoring(self):
        """Startet das Monitoring-System."""
        self.logger.info("Starte System-Monitoring...")
        
        # Starte Prometheus HTTP Server
        prom.start_http_server(9090)
        
        while True:
            try:
                await self.collect_metrics()
                await asyncio.sleep(15)  # Sammle Metriken alle 15 Sekunden
            except Exception as e:
                self.logger.error(f"Fehler beim Sammeln der Metriken: {e}")
                await asyncio.sleep(5)  # Warte bei Fehler kürzer
                
    async def collect_metrics(self):
        """Sammelt System- und Anwendungsmetriken."""
        # System Metriken
        self.cpu_usage.set(psutil.cpu_percent())
        memory = psutil.virtual_memory()
        self.memory_usage.set(memory.used)
        disk = psutil.disk_usage("/")
        self.disk_usage.set(disk.percent)
        
        # Anwendungsmetriken
        await self.collect_agent_metrics()
        await self.collect_workflow_metrics()
        await self.collect_test_metrics()
        
        # Speichere Metriken in MongoDB
        await self.store_metrics()
        
    async def collect_agent_metrics(self):
        """Sammelt Agenten-Metriken."""
        active_count = await self.db.agents.count_documents({
            "status": "active",
            "last_heartbeat": {
                "$gt": datetime.utcnow().timestamp() - 300  # 5 Minuten Timeout
            }
        })
        self.active_agents.set(active_count)
        
    async def collect_workflow_metrics(self):
        """Sammelt Workflow-Metriken."""
        active_count = await self.db.workflows.count_documents({
            "status": "running"
        })
        self.active_workflows.set(active_count)
        
        # Berechne Workflow-Dauer
        completed_workflows = await self.db.workflows.find({
            "status": "completed",
            "completion_time": {
                "$gt": datetime.utcnow().timestamp() - 3600  # Letzte Stunde
            }
        }).to_list(length=None)
        
        for workflow in completed_workflows:
            duration = workflow["completion_time"] - workflow["start_time"]
            self.workflow_duration.observe(duration)
            
    async def collect_test_metrics(self):
        """Sammelt Test-Metriken."""
        test_results = await self.db.test_results.find({
            "timestamp": {
                "$gt": datetime.utcnow().timestamp() - 3600  # Letzte Stunde
            }
        }).to_list(length=None)
        
        for result in test_results:
            self.test_executions.inc()
            if not result["results"].get("passed", False):
                self.test_failures.inc()
                
    async def store_metrics(self):
        """Speichert die gesammelten Metriken in MongoDB."""
        metrics = {
            "timestamp": datetime.utcnow(),
            "system": {
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().used,
                "disk_usage": psutil.disk_usage("/").percent
            },
            "application": {
                "active_agents": self.active_agents._value.get(),
                "active_workflows": self.active_workflows._value.get(),
                "test_executions": self.test_executions._value.get(),
                "test_failures": self.test_failures._value.get()
            }
        }
        
        await self.db.metrics.insert_one(metrics)
        
    async def get_system_health(self) -> Dict[str, Any]:
        """
        Überprüft den Systemzustand.
        
        Returns:
            Dict mit Gesundheitsstatus
        """
        try:
            # Prüfe Systemressourcen
            cpu_healthy = psutil.cpu_percent() < 80
            memory = psutil.virtual_memory()
            memory_healthy = memory.percent < 80
            disk = psutil.disk_usage("/")
            disk_healthy = disk.percent < 80
            
            # Prüfe Anwendungsmetriken
            agent_healthy = self.active_agents._value.get() > 0
            workflow_healthy = True  # TODO: Implementiere Workflow-Gesundheitsprüfung
            
            # Prüfe Datenbankverbindung
            db_healthy = await self.check_database_connection()
            
            health_status = {
                "status": "healthy" if all([
                    cpu_healthy,
                    memory_healthy,
                    disk_healthy,
                    agent_healthy,
                    workflow_healthy,
                    db_healthy
                ]) else "unhealthy",
                "checks": {
                    "cpu": {
                        "status": "healthy" if cpu_healthy else "warning",
                        "value": psutil.cpu_percent()
                    },
                    "memory": {
                        "status": "healthy" if memory_healthy else "warning",
                        "value": memory.percent
                    },
                    "disk": {
                        "status": "healthy" if disk_healthy else "warning",
                        "value": disk.percent
                    },
                    "agents": {
                        "status": "healthy" if agent_healthy else "warning",
                        "value": self.active_agents._value.get()
                    },
                    "database": {
                        "status": "healthy" if db_healthy else "error"
                    }
                },
                "timestamp": datetime.utcnow()
            }
            
            return health_status
            
        except Exception as e:
            self.logger.error(f"Fehler bei der Gesundheitsprüfung: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow()
            }
            
    async def check_database_connection(self) -> bool:
        """Prüft die Datenbankverbindung."""
        try:
            await self.db.command("ping")
            return True
        except Exception as e:
            self.logger.error(f"Datenbankverbindungsfehler: {e}")
            return False
            
    async def generate_health_report(self) -> Dict[str, Any]:
        """
        Generiert einen detaillierten Gesundheitsbericht.
        
        Returns:
            Dict mit Gesundheitsbericht
        """
        health_status = await self.get_system_health()
        
        # Sammle historische Metriken
        historical_metrics = await self.db.metrics.find({
            "timestamp": {
                "$gt": datetime.utcnow().timestamp() - 86400  # Letzte 24 Stunden
            }
        }).sort("timestamp", -1).to_list(length=None)
        
        # Analysiere Trends
        trends = self.analyze_trends(historical_metrics)
        
        report = {
            "current_status": health_status,
            "trends": trends,
            "recommendations": self.generate_recommendations(health_status, trends),
            "timestamp": datetime.utcnow()
        }
        
        return report
        
    def analyze_trends(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analysiert Trends in den Metriken."""
        if not metrics:
            return {}
            
        trends = {
            "cpu_usage": [],
            "memory_usage": [],
            "active_agents": [],
            "test_failures": []
        }
        
        for metric in metrics:
            trends["cpu_usage"].append(metric["system"]["cpu_usage"])
            trends["memory_usage"].append(metric["system"]["memory_usage"])
            trends["active_agents"].append(metric["application"]["active_agents"])
            trends["test_failures"].append(metric["application"]["test_failures"])
            
        return {
            key: {
                "mean": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
                "trend": "increasing" if values[-1] > values[0] else "decreasing"
            }
            for key, values in trends.items()
        }
        
    def generate_recommendations(
        self,
        health_status: Dict[str, Any],
        trends: Dict[str, Any]
    ) -> List[str]:
        """Generiert Handlungsempfehlungen basierend auf Status und Trends."""
        recommendations = []
        
        # CPU-Empfehlungen
        if health_status["checks"]["cpu"]["value"] > 70:
            recommendations.append(
                "Hohe CPU-Auslastung: Überprüfen Sie die Workflow-Verteilung"
            )
            
        # Speicher-Empfehlungen
        if health_status["checks"]["memory"]["value"] > 70:
            recommendations.append(
                "Hohe Speicherauslastung: Überprüfen Sie Memory Leaks"
            )
            
        # Agenten-Empfehlungen
        if trends["active_agents"]["trend"] == "decreasing":
            recommendations.append(
                "Abnehmende Agentenzahl: Überprüfen Sie die Agent-Stabilität"
            )
            
        # Test-Empfehlungen
        if trends["test_failures"]["trend"] == "increasing":
            recommendations.append(
                "Zunehmende Testfehler: Code-Review und Test-Analyse empfohlen"
            )
            
        return recommendations
