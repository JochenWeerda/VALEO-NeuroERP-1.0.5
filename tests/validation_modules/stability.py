import asyncio
import logging
import time
import psutil
from pathlib import Path
from typing import Dict, Any, List
import json
import aiohttp
from datetime import datetime, timedelta
import statistics
import numpy as np
from collections import deque

logger = logging.getLogger(__name__)

class StabilityTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_duration = timedelta(days=7)
        self.check_interval = 300  # 5 Minuten
        self.metrics_file = Path("stability_metrics.json")
        self.alert_thresholds = {
            "cpu_percent": 80,
            "memory_percent": 85,
            "response_time": 2.0,  # Sekunden
            "error_rate": 0.05  # 5%
        }
        self.metrics_history: List[Dict[str, Any]] = []
        self.alerts_history: List[Dict[str, Any]] = []
        self.performance_window = deque(maxlen=100)  # Letzte 100 Messungen für Trendanalyse

    async def collect_detailed_metrics(self) -> Dict[str, Any]:
        """Sammelt detaillierte System- und Anwendungsmetriken."""
        process = psutil.Process()
        
        # System-Metriken
        cpu_times = process.cpu_times()
        memory_info = process.memory_info()
        disk_io = psutil.disk_io_counters()
        net_io = psutil.net_io_counters()
        
        # CPU-Details pro Kern
        cpu_freq = psutil.cpu_freq(percpu=True) if hasattr(psutil, 'cpu_freq') else None
        cpu_stats = psutil.cpu_stats() if hasattr(psutil, 'cpu_stats') else None
        
        return {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu": {
                    "total_percent": psutil.cpu_percent(),
                    "per_cpu": psutil.cpu_percent(percpu=True),
                    "frequency": [
                        {"current": freq.current, "min": freq.min, "max": freq.max}
                        for freq in cpu_freq
                    ] if cpu_freq else None,
                    "stats": cpu_stats._asdict() if cpu_stats else None
                },
                "memory": {
                    "total": psutil.virtual_memory().total,
                    "available": psutil.virtual_memory().available,
                    "percent": psutil.virtual_memory().percent,
                    "swap_percent": psutil.swap_memory().percent
                },
                "disk": {
                    "io_counters": disk_io._asdict(),
                    "usage": {
                        path: psutil.disk_usage(path)._asdict()
                        for path in ["/", "C:\\"] if Path(path).exists()
                    }
                },
                "network": {
                    "io_counters": net_io._asdict(),
                    "connections": len(psutil.net_connections())
                }
            },
            "process": {
                "cpu": {
                    "percent": process.cpu_percent(),
                    "times": cpu_times._asdict()
                },
                "memory": {
                    "rss": memory_info.rss,
                    "vms": memory_info.vms,
                    "percent": process.memory_percent(),
                    "page_faults": memory_info.num_page_faults if hasattr(memory_info, 'num_page_faults') else None
                },
                "io": {
                    "counters": process.io_counters()._asdict() if hasattr(process, 'io_counters') else None
                },
                "threads": process.num_threads(),
                "handles": process.num_handles() if hasattr(process, 'num_handles') else None,
                "connections": len(process.connections())
            }
        }

    async def check_service_health(self) -> Dict[str, Any]:
        """Überprüft den Gesundheitszustand des Services mit erweiterten Metriken."""
        async with aiohttp.ClientSession() as session:
            try:
                start_time = time.time()
                async with session.get(f"{self.base_url}/health", timeout=5) as response:
                    response_time = time.time() - start_time
                    self.performance_window.append(response_time)
                    
                    return {
                        "status": response.status,
                        "response_time": response_time,
                        "healthy": response.status == 200,
                        "performance_trend": self.analyze_performance_trend()
                    }
            except Exception as e:
                return {
                    "status": 0,
                    "error": str(e),
                    "healthy": False,
                    "performance_trend": None
                }

    def analyze_performance_trend(self) -> Dict[str, Any]:
        """Analysiert Trends in der Performance."""
        if len(self.performance_window) < 2:
            return None
            
        response_times = list(self.performance_window)
        return {
            "mean": statistics.mean(response_times),
            "median": statistics.median(response_times),
            "std_dev": statistics.stdev(response_times) if len(response_times) > 1 else 0,
            "trend": "degrading" if self.is_degrading(response_times) else "stable",
            "percentiles": {
                "p50": np.percentile(response_times, 50),
                "p90": np.percentile(response_times, 90),
                "p95": np.percentile(response_times, 95),
                "p99": np.percentile(response_times, 99)
            }
        }

    def is_degrading(self, values: List[float], window_size: int = 10) -> bool:
        """Überprüft, ob die Performance sich verschlechtert."""
        if len(values) < window_size * 2:
            return False
            
        recent = values[-window_size:]
        previous = values[-window_size*2:-window_size]
        return statistics.mean(recent) > statistics.mean(previous) * 1.1  # 10% Verschlechterung

    async def check_queue_status(self) -> Dict[str, Any]:
        """Überprüft den Status der Queue mit detaillierten Metriken."""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{self.base_url}/api/v1/queue/status") as response:
                    data = await response.json()
                    return {
                        "queue_length": data.get("length", 0),
                        "processing_rate": data.get("processing_rate", 0),
                        "error_rate": data.get("error_rate", 0),
                        "avg_processing_time": data.get("avg_processing_time", 0),
                        "queue_growth_rate": self.calculate_queue_growth_rate(data.get("length", 0))
                    }
            except Exception as e:
                return {"error": str(e)}

    def calculate_queue_growth_rate(self, current_length: int) -> float:
        """Berechnet die Wachstumsrate der Queue."""
        if not self.metrics_history:
            return 0.0
            
        previous_length = self.metrics_history[-1].get("queue", {}).get("queue_length", current_length)
        time_diff = self.check_interval
        return (current_length - previous_length) / time_diff if time_diff > 0 else 0

    def check_for_anomalies(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Überprüft die Metriken auf Anomalien."""
        anomalies = []
        
        # CPU-Auslastung
        if metrics["system"]["cpu"]["total_percent"] > self.alert_thresholds["cpu_percent"]:
            anomalies.append({
                "type": "high_cpu",
                "value": metrics["system"]["cpu"]["total_percent"],
                "threshold": self.alert_thresholds["cpu_percent"]
            })
        
        # Speicherauslastung
        if metrics["system"]["memory"]["percent"] > self.alert_thresholds["memory_percent"]:
            anomalies.append({
                "type": "high_memory",
                "value": metrics["system"]["memory"]["percent"],
                "threshold": self.alert_thresholds["memory_percent"]
            })
        
        # Disk I/O
        disk_io = metrics["system"]["disk"]["io_counters"]
        if disk_io["read_bytes"] + disk_io["write_bytes"] > 1e9:  # 1GB
            anomalies.append({
                "type": "high_disk_io",
                "value": disk_io["read_bytes"] + disk_io["write_bytes"]
            })
        
        return anomalies

    async def run_stability_test(self) -> Dict[str, Any]:
        """Führt den Langzeit-Stabilitätstest durch."""
        logger.info("Starte Langzeit-Stabilitätstest")
        self.start_time = datetime.now()
        end_time = self.start_time + self.test_duration
        
        try:
            while datetime.now() < end_time:
                # Sammle Metriken
                system_metrics = await self.collect_detailed_metrics()
                health_status = await self.check_service_health()
                queue_status = await self.check_queue_status()
                
                metrics = {
                    "timestamp": datetime.now().isoformat(),
                    "system_metrics": system_metrics,
                    "health": health_status,
                    "queue": queue_status
                }
                
                # Überprüfe auf Anomalien
                anomalies = self.check_for_anomalies(system_metrics)
                if anomalies:
                    metrics["anomalies"] = anomalies
                    self.alerts_history.extend(anomalies)
                
                self.metrics_history.append(metrics)
                
                # Speichere Metriken periodisch
                if len(self.metrics_history) % 12 == 0:  # Alle Stunde
                    self.save_metrics()
                
                # Warte bis zum nächsten Check
                await asyncio.sleep(self.check_interval)
            
            # Erstelle finalen Report
            return self.generate_final_report()
            
        except Exception as e:
            logger.error(f"Fehler während des Stabilitätstests: {e}")
            return {"error": str(e)}

    def save_metrics(self):
        """Speichert die gesammelten Metriken."""
        metrics_data = {
            "start_time": self.start_time.isoformat(),
            "metrics": self.metrics_history,
            "alerts": self.alerts_history
        }
        self.metrics_file.write_text(json.dumps(metrics_data, indent=2))

    def generate_final_report(self) -> Dict[str, Any]:
        """Generiert einen detaillierten Abschlussbericht."""
        if not self.metrics_history:
            return {"error": "Keine Metriken gesammelt"}
            
        # Extrahiere relevante Metriken
        cpu_usage = [m["system_metrics"]["system"]["cpu"]["total_percent"] for m in self.metrics_history]
        memory_usage = [m["system_metrics"]["system"]["memory"]["percent"] for m in self.metrics_history]
        response_times = [m["health"]["response_time"] for m in self.metrics_history if "response_time" in m["health"]]
        
        # Berechne Statistiken
        report = {
            "duration": str(datetime.now() - self.start_time),
            "total_checks": len(self.metrics_history),
            "system_stability": {
                "cpu": {
                    "avg": statistics.mean(cpu_usage),
                    "max": max(cpu_usage),
                    "min": min(cpu_usage),
                    "std_dev": statistics.stdev(cpu_usage) if len(cpu_usage) > 1 else 0
                },
                "memory": {
                    "avg": statistics.mean(memory_usage),
                    "max": max(memory_usage),
                    "min": min(memory_usage),
                    "std_dev": statistics.stdev(memory_usage) if len(memory_usage) > 1 else 0
                }
            },
            "service_health": {
                "response_times": {
                    "avg": statistics.mean(response_times) if response_times else None,
                    "p95": np.percentile(response_times, 95) if response_times else None,
                    "p99": np.percentile(response_times, 99) if response_times else None
                },
                "availability": sum(1 for m in self.metrics_history if m["health"]["healthy"]) / len(self.metrics_history)
            },
            "anomalies": {
                "total": len(self.alerts_history),
                "by_type": {}
            },
            "recommendations": self.generate_recommendations()
        }
        
        # Kategorisiere Anomalien
        for alert in self.alerts_history:
            alert_type = alert["type"]
            if alert_type not in report["anomalies"]["by_type"]:
                report["anomalies"]["by_type"][alert_type] = 0
            report["anomalies"]["by_type"][alert_type] += 1
        
        return report

    def generate_recommendations(self) -> List[str]:
        """Generiert Empfehlungen basierend auf den Testergebnissen."""
        recommendations = []
        
        # Analysiere CPU-Nutzung
        cpu_stats = [m["system_metrics"]["system"]["cpu"]["total_percent"] for m in self.metrics_history]
        if statistics.mean(cpu_stats) > 70:
            recommendations.append("Hohe durchschnittliche CPU-Auslastung. Skalierung der Ressourcen empfohlen.")
        
        # Analysiere Speichernutzung
        memory_stats = [m["system_metrics"]["system"]["memory"]["percent"] for m in self.metrics_history]
        if statistics.mean(memory_stats) > 80:
            recommendations.append("Hohe Speicherauslastung. Memory-Optimierung oder Upgrade empfohlen.")
        
        # Analysiere Response-Zeiten
        response_times = [m["health"]["response_time"] for m in self.metrics_history if "response_time" in m["health"]]
        if response_times and np.percentile(response_times, 95) > 1.0:
            recommendations.append("95% der Response-Zeiten über 1 Sekunde. Performance-Optimierung empfohlen.")
        
        # Analysiere Queue-Wachstum
        queue_lengths = [m["queue"]["queue_length"] for m in self.metrics_history if "queue_length" in m["queue"]]
        if queue_lengths and statistics.mean(queue_lengths) > 1000:
            recommendations.append("Hohe durchschnittliche Queue-Länge. Erhöhung der Worker empfohlen.")
        
        return recommendations 