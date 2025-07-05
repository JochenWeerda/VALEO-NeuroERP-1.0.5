import asyncio
import logging
import time
import psutil
import statistics
from typing import Dict, Any, List
import aiohttp
from datetime import datetime

logger = logging.getLogger(__name__)

class PerformanceTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.queue_size = 1000
        self.concurrent_operations = 50
        self.metrics_interval = 1  # Sekunden
        self.warmup_time = 5  # Sekunden

    async def generate_test_data(self) -> List[Dict[str, Any]]:
        """Generiert Testdaten für die Queue mit verschiedenen Größen."""
        return [
            {
                "id": i,
                "data": "X" * (100 + (i % 10) * 100),  # Variierende Datengröße
                "timestamp": time.time(),
                "priority": i % 3  # Verschiedene Prioritäten
            }
            for i in range(self.queue_size)
        ]

    async def collect_system_metrics(self) -> Dict[str, float]:
        """Sammelt detaillierte System-Metriken."""
        process = psutil.Process()
        
        # CPU-Metriken
        cpu_times = process.cpu_times()
        cpu_percent = process.cpu_percent(interval=0.1)
        
        # Memory-Metriken
        memory_info = process.memory_info()
        
        # I/O-Metriken
        io_counters = process.io_counters()
        
        # System-Load
        load_avg = psutil.getloadavg()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "percent": cpu_percent,
                "user_time": cpu_times.user,
                "system_time": cpu_times.system,
                "cores_used": len(psutil.Process().cpu_affinity())
            },
            "memory": {
                "rss": memory_info.rss,
                "vms": memory_info.vms,
                "percent": process.memory_percent(),
                "page_faults": memory_info.num_page_faults if hasattr(memory_info, 'num_page_faults') else None
            },
            "io": {
                "read_bytes": io_counters.read_bytes,
                "write_bytes": io_counters.write_bytes,
                "read_count": io_counters.read_count,
                "write_count": io_counters.write_count
            },
            "system_load": {
                "1min": load_avg[0],
                "5min": load_avg[1],
                "15min": load_avg[2]
            }
        }

    async def monitor_metrics(self, duration: int) -> List[Dict[str, Any]]:
        """Überwacht System-Metriken über einen Zeitraum."""
        metrics_history = []
        end_time = time.time() + duration
        
        while time.time() < end_time:
            metrics = await self.collect_system_metrics()
            metrics_history.append(metrics)
            await asyncio.sleep(self.metrics_interval)
        
        return metrics_history

    async def perform_concurrent_operations(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Führt gleichzeitige Operationen durch mit verbessertem Monitoring."""
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            # Warmup-Phase
            logger.info("Starte Warmup-Phase")
            warmup_data = data[:50]  # Nutze einen kleinen Teil der Daten
            warmup_tasks = [
                self.process_single_item(session, item)
                for item in warmup_data
            ]
            await asyncio.gather(*warmup_tasks)
            await asyncio.sleep(self.warmup_time)
            
            # Haupttest
            logger.info("Starte Haupttest")
            
            # Teile Daten in Batches
            batch_size = len(data) // self.concurrent_operations
            batches = [data[i:i + batch_size] for i in range(0, len(data), batch_size)]
            
            # Starte Monitoring
            monitoring_task = asyncio.create_task(
                self.monitor_metrics(duration=len(data) / 10)  # Geschätzte Testdauer
            )
            
            # Verarbeite Batches
            batch_results = []
            for batch in batches:
                batch_start = time.time()
                tasks = [self.process_single_item(session, item) for item in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                batch_end = time.time()
                
                batch_results.append({
                    "size": len(batch),
                    "duration": batch_end - batch_start,
                    "success_rate": sum(1 for r in results if not isinstance(r, Exception)) / len(results)
                })
            
            end_time = time.time()
            metrics_history = await monitoring_task
            
            # Analysiere Ergebnisse
            durations = [r["duration"] for r in batch_results]
            success_rates = [r["success_rate"] for r in batch_results]
            
            return {
                "total_time": end_time - start_time,
                "operations_per_second": len(data) / (end_time - start_time),
                "batch_statistics": {
                    "avg_duration": statistics.mean(durations),
                    "max_duration": max(durations),
                    "min_duration": min(durations),
                    "std_dev_duration": statistics.stdev(durations) if len(durations) > 1 else 0,
                    "avg_success_rate": statistics.mean(success_rates),
                    "total_batches": len(batch_results)
                },
                "metrics_history": metrics_history
            }

    async def process_single_item(self, session: aiohttp.ClientSession, item: Dict[str, Any]) -> Dict[str, Any]:
        """Verarbeitet ein einzelnes Item mit Fehlerbehandlung."""
        try:
            async with session.post(
                f"{self.base_url}/queue/item",
                json=item,
                timeout=30
            ) as response:
                return {
                    "status": response.status,
                    "item_id": item["id"],
                    "processing_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None
                }
        except Exception as e:
            logger.error(f"Fehler bei Verarbeitung von Item {item['id']}: {e}")
            raise

    async def run_performance_test(self) -> Dict[str, Any]:
        """Führt den vollständigen Performance-Test durch."""
        logger.info("Starte Performance-Test")
        results = {}

        # 1. Generiere Testdaten
        test_data = await self.generate_test_data()
        
        # 2. Baseline-Metriken
        logger.info("Sammle Baseline-Metriken")
        results["baseline_metrics"] = await self.collect_system_metrics()
        
        # 3. Durchführung der Last-Tests
        logger.info(f"Führe {self.queue_size} Operationen mit {self.concurrent_operations} gleichzeitigen Prozessen durch")
        operation_results = await self.perform_concurrent_operations(test_data)
        results["operation_metrics"] = operation_results
        
        # 4. System-Metriken unter Last
        results["load_metrics"] = await self.collect_system_metrics()
        
        # 5. Berechne Performance-Statistiken
        results["performance_stats"] = {
            "avg_response_time": operation_results["total_time"] / self.queue_size,
            "throughput": operation_results["operations_per_second"],
            "cpu_usage_increase": results["load_metrics"]["cpu"]["percent"] - results["baseline_metrics"]["cpu"]["percent"],
            "memory_usage_increase": (
                results["load_metrics"]["memory"]["percent"] - 
                results["baseline_metrics"]["memory"]["percent"]
            )
        }
        
        # 6. Füge Empfehlungen hinzu
        results["recommendations"] = self.generate_recommendations(results)
        
        return results

    def generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generiert Empfehlungen basierend auf den Testergebnissen."""
        recommendations = []
        
        # Analysiere Durchsatz
        if results["performance_stats"]["throughput"] < 100:  # Beispiel-Schwellenwert
            recommendations.append("Durchsatz ist niedrig. Erhöhen Sie die Anzahl der Worker-Prozesse.")
        
        # Analysiere CPU-Nutzung
        if results["performance_stats"]["cpu_usage_increase"] > 50:
            recommendations.append("Hohe CPU-Auslastung. Überprüfen Sie CPU-intensive Operationen.")
        
        # Analysiere Speichernutzung
        if results["performance_stats"]["memory_usage_increase"] > 30:
            recommendations.append("Signifikanter Speicheranstieg. Überprüfen Sie auf Memory-Leaks.")
        
        # Analysiere Batch-Verarbeitung
        batch_stats = results["operation_metrics"]["batch_statistics"]
        if batch_stats["std_dev_duration"] > batch_stats["avg_duration"] * 0.5:
            recommendations.append("Hohe Varianz in der Batch-Verarbeitung. Optimieren Sie die Batch-Größe.")
        
        return recommendations 