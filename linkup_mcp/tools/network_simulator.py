"""
Network Simulator für Edge-System-Tests

Diese Klasse simuliert verschiedene Netzwerkbedingungen für Tests des Edge-Systems,
einschließlich Paketverlust, Latenz und periodischer Unterbrechungen.
"""

import asyncio
import random
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class NetworkSimulator:
    """
    Simuliert verschiedene Netzwerkbedingungen für Edge-System-Tests.
    """
    
    def __init__(self):
        """
        Initialisiert den NetworkSimulator.
        """
        self.current_conditions = {
            "packet_loss": 0,  # Prozentsatz (0-100)
            "latency": 0,      # Millisekunden
            "duration": 0,     # Sekunden
            "interval": None,  # Sekunden (für periodische Unterbrechungen)
            "jitter": 0        # Millisekunden
        }
        self.simulation_active = False
        self.simulation_task = None
    
    def configure(self, **kwargs) -> None:
        """
        Konfiguriert die Netzwerkbedingungen für die Simulation.
        
        Args:
            **kwargs: Schlüsselwortargumente für die Netzwerkbedingungen:
                - packet_loss: Prozentsatz des Paketverlusts (0-100)
                - latency: Basislatenz in Millisekunden
                - duration: Dauer der Simulation in Sekunden
                - interval: Intervall für periodische Unterbrechungen in Sekunden (optional)
                - jitter: Zufällige Variation der Latenz in Millisekunden (optional)
        """
        for key, value in kwargs.items():
            if key in self.current_conditions:
                self.current_conditions[key] = value
        
        logger.info(f"Netzwerksimulator konfiguriert: {self.current_conditions}")
    
    async def start_simulation(self) -> None:
        """
        Startet die Netzwerksimulation mit den konfigurierten Bedingungen.
        """
        if self.simulation_active:
            logger.warning("Simulation läuft bereits, stoppe zuerst die aktuelle Simulation")
            return
        
        self.simulation_active = True
        
        # Starte die Simulation als Hintergrundaufgabe
        if self.current_conditions.get("interval"):
            # Periodische Unterbrechungen
            self.simulation_task = asyncio.create_task(self._run_periodic_simulation())
        else:
            # Kontinuierliche Simulation
            self.simulation_task = asyncio.create_task(self._run_continuous_simulation())
        
        logger.info("Netzwerksimulation gestartet")
    
    async def stop_simulation(self) -> None:
        """
        Stoppt die laufende Netzwerksimulation.
        """
        if not self.simulation_active:
            logger.warning("Keine aktive Simulation zum Stoppen")
            return
        
        self.simulation_active = False
        
        if self.simulation_task:
            self.simulation_task.cancel()
            try:
                await self.simulation_task
            except asyncio.CancelledError:
                pass
            self.simulation_task = None
        
        # Zurücksetzen auf normale Netzwerkbedingungen
        self.current_conditions["packet_loss"] = 0
        self.current_conditions["latency"] = 0
        
        logger.info("Netzwerksimulation gestoppt")
    
    async def restore_connection(self) -> None:
        """
        Stellt die Netzwerkverbindung wieder her (setzt Paketverlust auf 0).
        """
        await self.stop_simulation()
        logger.info("Netzwerkverbindung wiederhergestellt")
    
    def get_current_conditions(self) -> Dict[str, Any]:
        """
        Gibt die aktuellen Netzwerkbedingungen zurück.
        
        Returns:
            Dictionary mit den aktuellen Netzwerkbedingungen
        """
        return self.current_conditions.copy()
    
    def should_drop_packet(self) -> bool:
        """
        Bestimmt basierend auf der konfigurierten Paketverlustrate, ob ein Paket verworfen werden soll.
        
        Returns:
            True, wenn das Paket verworfen werden soll, sonst False
        """
        return random.random() * 100 < self.current_conditions["packet_loss"]
    
    async def simulate_latency(self) -> int:
        """
        Simuliert Netzwerklatenz basierend auf den konfigurierten Bedingungen.
        
        Returns:
            Die tatsächlich angewendete Latenz in Millisekunden
        """
        base_latency = self.current_conditions["latency"]
        jitter = self.current_conditions.get("jitter", 0)
        
        # Latenz mit Jitter berechnen
        if jitter > 0:
            actual_latency = max(0, base_latency + random.uniform(-jitter, jitter))
        else:
            actual_latency = base_latency
        
        # Latenz simulieren
        if actual_latency > 0:
            await asyncio.sleep(actual_latency / 1000)  # Konvertiere ms in Sekunden
        
        return actual_latency
    
    async def _run_continuous_simulation(self) -> None:
        """
        Führt eine kontinuierliche Netzwerksimulation für die konfigurierte Dauer aus.
        """
        duration = self.current_conditions["duration"]
        
        try:
            if duration > 0:
                await asyncio.sleep(duration)
                await self.stop_simulation()
            else:
                # Unendliche Simulation bis zum manuellen Stopp
                while self.simulation_active:
                    await asyncio.sleep(1)
        except asyncio.CancelledError:
            logger.debug("Kontinuierliche Simulation abgebrochen")
            raise
    
    async def _run_periodic_simulation(self) -> None:
        """
        Führt eine periodische Netzwerksimulation mit Unterbrechungen aus.
        """
        duration = self.current_conditions["duration"]
        interval = self.current_conditions["interval"]
        start_time = asyncio.get_event_loop().time()
        
        try:
            while self.simulation_active:
                current_time = asyncio.get_event_loop().time()
                elapsed = current_time - start_time
                
                if duration > 0 and elapsed >= duration:
                    await self.stop_simulation()
                    break
                
                # Wechsle zwischen hohem Paketverlust und normalem Betrieb
                cycle_position = elapsed % (interval * 2)
                
                if cycle_position < interval:
                    # Schlechte Verbindung
                    original_packet_loss = self.current_conditions["packet_loss"]
                    self.current_conditions["packet_loss"] = 100  # Kompletter Verbindungsverlust
                    logger.debug(f"Periodische Unterbrechung aktiv (Paketverlust: 100%)")
                else:
                    # Normale Verbindung
                    original_packet_loss = self.current_conditions["packet_loss"]
                    logger.debug(f"Periodische Unterbrechung inaktiv (Paketverlust: {original_packet_loss}%)")
                
                await asyncio.sleep(1)
        
        except asyncio.CancelledError:
            logger.debug("Periodische Simulation abgebrochen")
            raise 