"""
Synchronization Analyzer für Edge-System-Tests

Diese Klasse analysiert das Synchronisationsverhalten von Edge-Knoten nach
Netzwerkunterbrechungen oder anderen Störungen.
"""

import asyncio
import logging
import random
import time
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class SynchronizationAnalyzer:
    """
    Analysiert das Synchronisationsverhalten von Edge-Knoten.
    """
    
    def __init__(self):
        """
        Initialisiert den SynchronizationAnalyzer.
        """
        self.sync_history = []
        self.conflict_resolution_strategies = {
            "timestamp_based": self._resolve_timestamp_based,
            "version_based": self._resolve_version_based,
            "merge_based": self._resolve_merge_based,
            "priority_based": self._resolve_priority_based
        }
    
    async def analyze_synchronization(self, offline_data: int, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analysiert die Synchronisation nach einem Offline-Szenario.
        
        Args:
            offline_data: Anzahl der offline gespeicherten Datenelemente
            scenario: Das Netzwerkszenario, das simuliert wurde
            
        Returns:
            Dictionary mit Analyseergebnissen
        """
        logger.info(f"Analysiere Synchronisation für {offline_data} offline gespeicherte Datenelemente nach Szenario '{scenario['name']}'")
        
        # Simuliere die Synchronisation basierend auf dem Szenario
        sync_start_time = time.time()
        
        # Berechne die erwartete Synchronisationszeit basierend auf der Datenmenge und Netzwerkbedingungen
        base_sync_time_per_item = 0.05  # 50ms pro Element als Basis
        latency_factor = 1 + (scenario.get("latency", 0) / 1000)  # Latenz in Sekunden
        
        # Simuliere die Synchronisation
        total_items = offline_data
        successful_items = 0
        failed_items = 0
        conflicts = 0
        conflicts_resolved = 0
        bandwidth_usage = 0
        
        # Simuliere die Synchronisation jedes Elements
        for _ in range(total_items):
            # Simuliere Synchronisationserfolg basierend auf Netzwerkbedingungen
            if random.random() > (scenario.get("packet_loss", 0) / 200):  # Weniger streng als bei der Offline-Operation
                successful_items += 1
                
                # Simuliere Konflikte
                if random.random() < self._calculate_conflict_probability(scenario):
                    conflicts += 1
                    
                    # Versuche, den Konflikt zu lösen
                    if await self._resolve_conflict():
                        conflicts_resolved += 1
                
                # Berechne Bandbreitennutzung (simuliert)
                bandwidth_usage += random.uniform(2, 10)  # 2-10 KB pro Element
            else:
                failed_items += 1
        
        # Berechne die tatsächliche Synchronisationszeit
        sync_duration = time.time() - sync_start_time
        
        # Erstelle das Analyseergebnis
        result = {
            "scenario": scenario["name"],
            "items_synced": successful_items,
            "items_failed": failed_items,
            "conflicts": conflicts,
            "conflicts_resolved": conflicts_resolved,
            "sync_duration": sync_duration,
            "bandwidth_usage": bandwidth_usage,
            "errors": self._generate_sync_errors(failed_items, scenario),
            "performance_metrics": {
                "items_per_second": successful_items / sync_duration if sync_duration > 0 else 0,
                "conflict_rate": conflicts / total_items if total_items > 0 else 0,
                "resolution_success_rate": conflicts_resolved / conflicts if conflicts > 0 else 1.0
            }
        }
        
        # Speichere das Ergebnis im Verlauf
        self.sync_history.append({
            "timestamp": time.time(),
            "scenario": scenario["name"],
            "result": result
        })
        
        logger.info(f"Synchronisationsanalyse abgeschlossen: {successful_items}/{total_items} Elemente synchronisiert, "
                   f"{conflicts} Konflikte erkannt, {conflicts_resolved} Konflikte gelöst")
        
        return result
    
    def get_sync_history(self) -> List[Dict[str, Any]]:
        """
        Gibt den Synchronisationsverlauf zurück.
        
        Returns:
            Liste von Synchronisationsergebnissen
        """
        return self.sync_history
    
    async def analyze_conflict_resolution_strategies(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analysiert verschiedene Konfliktlösungsstrategien für ein gegebenes Szenario.
        
        Args:
            scenario: Das Netzwerkszenario
            
        Returns:
            Dictionary mit Bewertungen der Konfliktlösungsstrategien
        """
        logger.info(f"Analysiere Konfliktlösungsstrategien für Szenario '{scenario['name']}'")
        
        results = {}
        
        # Simuliere 100 Konflikte für jede Strategie
        num_conflicts = 100
        
        for strategy_name, resolver_func in self.conflict_resolution_strategies.items():
            resolved = 0
            resolution_time = 0
            
            for _ in range(num_conflicts):
                start_time = time.time()
                if await resolver_func():
                    resolved += 1
                resolution_time += time.time() - start_time
            
            avg_resolution_time = resolution_time / num_conflicts
            success_rate = resolved / num_conflicts
            
            results[strategy_name] = {
                "success_rate": success_rate,
                "avg_resolution_time": avg_resolution_time,
                "score": success_rate / (avg_resolution_time + 0.001)  # Höhere Erfolgsrate und niedrigere Zeit = bessere Bewertung
            }
        
        # Beste Strategie ermitteln
        best_strategy = max(results.items(), key=lambda x: x[1]["score"])
        
        logger.info(f"Beste Konfliktlösungsstrategie für '{scenario['name']}': {best_strategy[0]} "
                   f"(Erfolgsrate: {best_strategy[1]['success_rate']:.2f}, Zeit: {best_strategy[1]['avg_resolution_time']:.4f}s)")
        
        return {
            "strategies": results,
            "best_strategy": best_strategy[0]
        }
    
    def _calculate_conflict_probability(self, scenario: Dict[str, Any]) -> float:
        """
        Berechnet die Wahrscheinlichkeit eines Konflikts basierend auf dem Szenario.
        
        Args:
            scenario: Das Netzwerkszenario
            
        Returns:
            Konfliktwahrscheinlichkeit als Float zwischen 0 und 1
        """
        # Basis-Konfliktwahrscheinlichkeit
        base_probability = 0.05  # 5% Basiswahrscheinlichkeit
        
        # Faktoren, die die Konfliktwahrscheinlichkeit erhöhen
        factors = {
            "duration": 0.001 * scenario.get("duration", 0),  # Längere Dauer = mehr Konflikte
            "packet_loss": 0.002 * scenario.get("packet_loss", 0),  # Höherer Paketverlust = mehr Konflikte
            "latency": 0.0005 * scenario.get("latency", 0)  # Höhere Latenz = mehr Konflikte
        }
        
        # Gesamtwahrscheinlichkeit berechnen (begrenzt auf 0.5 oder 50%)
        probability = min(0.5, base_probability + sum(factors.values()))
        
        return probability
    
    async def _resolve_conflict(self) -> bool:
        """
        Simuliert die Auflösung eines Konflikts.
        
        Returns:
            True, wenn der Konflikt erfolgreich aufgelöst wurde, sonst False
        """
        # Simuliere eine Erfolgswahrscheinlichkeit von 80%
        return random.random() < 0.8
    
    async def _resolve_timestamp_based(self) -> bool:
        """
        Simuliert die zeitstempelbasierte Konfliktlösung.
        
        Returns:
            True, wenn der Konflikt erfolgreich aufgelöst wurde, sonst False
        """
        # Zeitstempelbasierte Lösung hat eine Erfolgswahrscheinlichkeit von 90%
        await asyncio.sleep(0.002)  # Simuliere Verarbeitungszeit
        return random.random() < 0.9
    
    async def _resolve_version_based(self) -> bool:
        """
        Simuliert die versionsbasierte Konfliktlösung.
        
        Returns:
            True, wenn der Konflikt erfolgreich aufgelöst wurde, sonst False
        """
        # Versionsbasierte Lösung hat eine Erfolgswahrscheinlichkeit von 95%
        await asyncio.sleep(0.005)  # Simuliere Verarbeitungszeit
        return random.random() < 0.95
    
    async def _resolve_merge_based(self) -> bool:
        """
        Simuliert die zusammenführungsbasierte Konfliktlösung.
        
        Returns:
            True, wenn der Konflikt erfolgreich aufgelöst wurde, sonst False
        """
        # Zusammenführungsbasierte Lösung hat eine Erfolgswahrscheinlichkeit von 75%
        await asyncio.sleep(0.01)  # Simuliere Verarbeitungszeit
        return random.random() < 0.75
    
    async def _resolve_priority_based(self) -> bool:
        """
        Simuliert die prioritätsbasierte Konfliktlösung.
        
        Returns:
            True, wenn der Konflikt erfolgreich aufgelöst wurde, sonst False
        """
        # Prioritätsbasierte Lösung hat eine Erfolgswahrscheinlichkeit von 85%
        await asyncio.sleep(0.003)  # Simuliere Verarbeitungszeit
        return random.random() < 0.85
    
    def _generate_sync_errors(self, failed_items: int, scenario: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generiert simulierte Synchronisationsfehler.
        
        Args:
            failed_items: Anzahl der fehlgeschlagenen Elemente
            scenario: Das Netzwerkszenario
            
        Returns:
            Liste von Fehlerdictionaries
        """
        errors = []
        
        error_types = [
            {"type": "connection_timeout", "message": "Verbindungs-Timeout während der Synchronisation"},
            {"type": "data_corruption", "message": "Daten wurden während der Übertragung beschädigt"},
            {"type": "authentication_failure", "message": "Authentifizierungsfehler während der Synchronisation"},
            {"type": "server_error", "message": "Serverfehler während der Synchronisationsanfrage"},
            {"type": "version_conflict", "message": "Versionskonflikt konnte nicht automatisch gelöst werden"}
        ]
        
        # Generiere zufällige Fehler basierend auf der Anzahl fehlgeschlagener Elemente
        for _ in range(min(failed_items, 10)):  # Maximal 10 Fehler generieren
            error = random.choice(error_types)
            errors.append({
                "type": error["type"],
                "message": error["message"],
                "timestamp": time.time(),
                "recoverable": random.random() > 0.3  # 70% der Fehler sind wiederherstellbar
            })
        
        return errors