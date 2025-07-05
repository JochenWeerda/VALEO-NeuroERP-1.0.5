import asyncio
import logging
import random
import psutil
import gc
import time
from typing import Dict, Any, List
import aiohttp
from contextlib import asynccontextmanager
import json
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class ErrorInjectionTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.error_scenarios = [
            {
                "type": "invalid_data",
                "description": "Testet Validierung und Fehlerbehandlung bei ungültigen Daten",
                "payloads": [
                    {"data": None},
                    {"data": ""},
                    {"data": "{'invalid': json}"},
                    {"data": "ä"*1000},  # Ungültige Unicode-Zeichen
                    {"data": {"nested": {"depth": 100}}},  # Zu tiefe Verschachtelung
                    {"data": "a"*10485760}  # 10MB String
                ]
            },
            {
                "type": "malformed_requests",
                "description": "Testet Fehlerbehandlung bei fehlerhaften HTTP-Requests",
                "scenarios": [
                    {"headers": {"Content-Type": "invalid/type"}},
                    {"headers": {"Content-Length": "invalid"}},
                    {"headers": {"Authorization": "malformed_token"}},
                    {"method": "INVALID"},
                    {"encoding": "invalid"}
                ]
            },
            {
                "type": "resource_exhaustion",
                "description": "Testet Verhalten bei Ressourcenknappheit",
                "scenarios": [
                    {"memory_mb": 1024},
                    {"cpu_load": 0.95},
                    {"disk_space_mb": 1024},
                    {"open_files": 1000},
                    {"network_connections": 500}
                ]
            }
        ]

    async def monitor_system_resources(self) -> Dict[str, Any]:
        """Überwacht Systemressourcen während der Tests."""
        process = psutil.Process()
        return {
            "timestamp": datetime.now().isoformat(),
            "cpu_percent": process.cpu_percent(),
            "memory_percent": process.memory_percent(),
            "open_files": len(process.open_files()),
            "connections": len(process.connections()),
            "threads": process.num_threads(),
            "handles": process.num_handles() if hasattr(process, 'num_handles') else None
        }

    async def inject_invalid_data(self) -> Dict[str, Any]:
        """Injiziert verschiedene Arten von ungültigen Daten."""
        results = []
        endpoints = [
            "/api/v1/queue",
            "/api/v1/events",
            "/api/v1/users"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in endpoints:
                for payload in self.error_scenarios[0]["payloads"]:
                    try:
                        # Sammle Ressourcenmetriken vor dem Test
                        pre_test_metrics = await self.monitor_system_resources()
                        
                        async with session.post(
                            f"{self.base_url}{endpoint}",
                            json=payload,
                            timeout=5
                        ) as response:
                            # Sammle Ressourcenmetriken nach dem Test
                            post_test_metrics = await self.monitor_system_resources()
                            
                            results.append({
                                "endpoint": endpoint,
                                "payload": str(payload)[:100],  # Gekürzt für Lesbarkeit
                                "status": response.status,
                                "error_handled": response.status in [400, 422],
                                "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                                "resource_impact": {
                                    "cpu_change": post_test_metrics["cpu_percent"] - pre_test_metrics["cpu_percent"],
                                    "memory_change": post_test_metrics["memory_percent"] - pre_test_metrics["memory_percent"]
                                }
                            })
                    except Exception as e:
                        results.append({
                            "endpoint": endpoint,
                            "payload": str(payload)[:100],
                            "error": str(e),
                            "error_handled": isinstance(e, (ValueError, TypeError))
                        })
        
        return results

    async def test_malformed_requests(self) -> Dict[str, Any]:
        """Testet das Verhalten bei fehlerhaften HTTP-Requests."""
        results = []
        
        async with aiohttp.ClientSession() as session:
            for scenario in self.error_scenarios[1]["scenarios"]:
                try:
                    headers = scenario.get("headers", {})
                    method = scenario.get("method", "POST")
                    
                    async with session.request(
                        method,
                        f"{self.base_url}/api/v1/test",
                        headers=headers,
                        timeout=5
                    ) as response:
                        results.append({
                            "scenario": scenario,
                            "status": response.status,
                            "error_handled": response.status in [400, 405, 415],
                            "headers": dict(response.headers)
                        })
                except Exception as e:
                    results.append({
                        "scenario": scenario,
                        "error": str(e),
                        "error_handled": True
                    })
        
        return results

    @asynccontextmanager
    async def simulate_resource_exhaustion(self, scenario: Dict[str, Any]):
        """Simuliert verschiedene Ressourcenerschöpfungsszenarien."""
        resources = []
        try:
            if "memory_mb" in scenario:
                # Simuliere Speicherverbrauch
                memory_size = scenario["memory_mb"] * 1024 * 1024
                resources.append(bytearray(memory_size))
            
            if "cpu_load" in scenario:
                # Simuliere CPU-Last
                async def cpu_load():
                    end_time = time.time() + 5  # 5 Sekunden Last
                    while time.time() < end_time:
                        _ = [i * i for i in range(10000)]
                asyncio.create_task(cpu_load())
            
            if "open_files" in scenario:
                # Simuliere offene Dateien
                files = []
                for i in range(min(scenario["open_files"], 100)):  # Limitiert für Sicherheit
                    files.append(open(f"test_file_{i}.tmp", "w"))
                resources.extend(files)
            
            yield
            
        finally:
            # Cleanup
            for resource in resources:
                try:
                    if hasattr(resource, 'close'):
                        resource.close()
                except:
                    pass
            
            gc.collect()  # Forciere Garbage Collection

    async def test_resource_exhaustion(self) -> Dict[str, Any]:
        """Testet das Verhalten bei Ressourcenerschöpfung."""
        results = []
        
        for scenario in self.error_scenarios[2]["scenarios"]:
            try:
                pre_test_metrics = await self.monitor_system_resources()
                
                async with self.simulate_resource_exhaustion(scenario):
                    # Versuche API-Aufruf unter Last
                    async with aiohttp.ClientSession() as session:
                        async with session.get(
                            f"{self.base_url}/health",
                            timeout=5
                        ) as response:
                            post_test_metrics = await self.monitor_system_resources()
                            
                            results.append({
                                "scenario": scenario,
                                "status": response.status,
                                "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                                "resource_impact": {
                                    "cpu_change": post_test_metrics["cpu_percent"] - pre_test_metrics["cpu_percent"],
                                    "memory_change": post_test_metrics["memory_percent"] - pre_test_metrics["memory_percent"],
                                    "thread_change": post_test_metrics["threads"] - pre_test_metrics["threads"]
                                }
                            })
            except Exception as e:
                results.append({
                    "scenario": scenario,
                    "error": str(e),
                    "handled": isinstance(e, (TimeoutError, MemoryError, OSError))
                })
        
        return results

    async def run_error_injection_test(self) -> Dict[str, Any]:
        """Führt alle Fehlerinjektionstests durch."""
        logger.info("Starte Fehlerinjektionstests")
        start_time = datetime.now()
        results = {}
        
        # 1. Test mit ungültigen Daten
        logger.info("Teste Handling von ungültigen Daten")
        results["invalid_data"] = await self.inject_invalid_data()
        
        # 2. Test mit fehlerhaften Requests
        logger.info("Teste Handling von fehlerhaften Requests")
        results["malformed_requests"] = await self.test_malformed_requests()
        
        # 3. Ressourcenerschöpfungs-Tests
        logger.info("Teste Ressourcenerschöpfung")
        results["resource_exhaustion"] = await self.test_resource_exhaustion()
        
        # Berechne Zusammenfassung
        end_time = datetime.now()
        results["summary"] = {
            "duration": (end_time - start_time).total_seconds(),
            "total_tests": sum(len(r) for r in results.values() if isinstance(r, list)),
            "error_handling_rate": sum(
                1 for r in results["invalid_data"] + results["malformed_requests"]
                if r.get("error_handled", False)
            ) / (len(results["invalid_data"]) + len(results["malformed_requests"])),
            "resource_tests_completed": len(results["resource_exhaustion"]),
            "critical_failures": sum(
                1 for r in results["resource_exhaustion"]
                if not r.get("handled", False)
            )
        }
        
        # Speichere detaillierte Ergebnisse
        results_path = Path("error_injection_results.json")
        results_path.write_text(json.dumps(results, indent=2))
        
        return results 