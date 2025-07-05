import asyncio
import logging
from typing import Dict, Any
import aiohttp
from contextlib import asynccontextmanager
import socket
import time

logger = logging.getLogger(__name__)

class NetworkStressTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.max_retries = 3
        self.retry_delay = 1  # Sekunden
        
    async def wait_for_service(self, timeout: int = 30) -> bool:
        """Wartet, bis der Service verfügbar ist."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.base_url}/health",
                        timeout=2
                    ) as response:
                        if response.status == 200:
                            return True
            except Exception:
                pass
            await asyncio.sleep(1)
        return False

    @asynccontextmanager
    async def simulate_network_condition(self, condition: Dict[str, Any]):
        """Simuliert verschiedene Netzwerkbedingungen."""
        logger.info(f"Simuliere Netzwerkbedingung: {condition['type']}")
        try:
            if condition["type"] == "complete_outage":
                # Simuliere kompletten Netzwerkausfall durch Blockierung des Ports
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.bind(('localhost', 0))  # Temporärer Port
                await asyncio.sleep(condition["duration"])
                s.close()
            elif condition["type"] == "intermittent":
                # Simuliere intermittierende Verbindung
                for _ in range(5):
                    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    s.bind(('localhost', 0))
                    await asyncio.sleep(condition["interval"])
                    s.close()
                    await asyncio.sleep(condition["interval"])
            elif condition["type"] == "high_latency":
                # Simuliere hohe Latenz
                await asyncio.sleep(condition["latency"] / 1000)
            yield
        except Exception as e:
            logger.error(f"Fehler bei Netzwerksimulation: {e}")
            raise
        finally:
            # Stelle sicher, dass alle Ressourcen freigegeben werden
            await self.wait_for_service(timeout=10)

    async def test_connection_recovery(self) -> Dict[str, Any]:
        """Testet die Wiederherstellung der Verbindung mit Retry-Logik."""
        for retry in range(self.max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    start_time = time.time()
                    async with session.get(
                        f"{self.base_url}/health",
                        timeout=5
                    ) as response:
                        response_time = time.time() - start_time
                        return {
                            "status": "recovered",
                            "response_time": response_time,
                            "retry_count": retry
                        }
            except Exception as e:
                logger.warning(f"Verbindungsversuch {retry + 1} fehlgeschlagen: {e}")
                if retry < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (retry + 1))
                else:
                    return {
                        "status": "failed",
                        "error": str(e),
                        "retry_count": retry + 1
                    }

    async def measure_latency(self) -> float:
        """Misst die aktuelle Netzwerklatenz."""
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get(f"{self.base_url}/health") as response:
                    return time.time() - start_time
        except Exception:
            return float('inf')

    async def run_stress_test(self) -> Dict[str, Any]:
        """Führt den vollständigen Netzwerk-Stresstest durch."""
        scenarios = [
            {"type": "complete_outage", "duration": 30},  # Reduziert auf 30 Sekunden für Tests
            {"type": "intermittent", "interval": 5},      # 5 Sekunden Intervall
            {"type": "high_latency", "latency": 2000},    # 2000ms Latenz
            {"type": "packet_loss", "loss_rate": 0.05}    # 5% Paketverlust
        ]
        
        results = {}
        for scenario in scenarios:
            logger.info(f"Starte Netzwerk-Stresstest: {scenario['type']}")
            
            # Messe Baseline-Latenz
            baseline_latency = await self.measure_latency()
            
            try:
                async with self.simulate_network_condition(scenario):
                    # Warte kurz, bis die Netzwerkbedingung aktiv ist
                    await asyncio.sleep(1)
                    
                    # Teste Wiederherstellung
                    recovery_result = await self.test_connection_recovery()
                    
                    # Messe Latenz nach Wiederherstellung
                    post_recovery_latency = await self.measure_latency()
                    
                    results[scenario['type']] = {
                        "scenario": scenario,
                        "baseline_latency": baseline_latency,
                        "recovery": recovery_result,
                        "post_recovery_latency": post_recovery_latency,
                        "latency_increase": post_recovery_latency - baseline_latency
                    }
            except Exception as e:
                logger.error(f"Fehler bei Szenario {scenario['type']}: {e}")
                results[scenario['type']] = {
                    "scenario": scenario,
                    "error": str(e)
                }
            
            # Warte zwischen Szenarien
            await asyncio.sleep(5)
        
        return results 