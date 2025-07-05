"""
Performance-Optimizer für das AI-gesteuerte ERP-System
Analysiert Metriken und gibt Optimierungsvorschläge
"""

import os
import sys
import json
import time
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('optimizer.log')
    ]
)
logger = logging.getLogger("optimizer")

@dataclass
class OptimizationRecommendation:
    service_id: str
    service_name: str
    recommendation_type: str  # 'cpu', 'memory', 'latency', 'scaling'
    priority: int  # 1 (niedrig) bis 5 (kritisch)
    description: str
    suggested_action: str
    current_value: float
    target_value: float
    timestamp: float = time.time()

class PerformanceOptimizer:
    def __init__(self, metrics_file="observer_metrics.json", config_file="observer_config.json"):
        self.metrics_file = metrics_file
        self.config_file = config_file
        self.metrics = []
        self.services = {}
        self.recommendations = []
        self.load_config()
    
    def load_config(self):
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                self.services = config.get("services", {})
                logger.info(f"Konfiguration geladen: {len(self.services)} Services gefunden")
        except Exception as e:
            logger.error(f"Fehler beim Laden der Konfiguration: {e}")
            self.services = {}
    
    def load_metrics(self):
        try:
            if os.path.exists(self.metrics_file):
                with open(self.metrics_file, 'r') as f:
                    self.metrics = json.load(f)
                logger.info(f"Metriken geladen: {len(self.metrics)} Einträge gefunden")
            else:
                logger.warning(f"Metrikdatei {self.metrics_file} nicht gefunden.")
                self.metrics = []
        except Exception as e:
            logger.error(f"Fehler beim Laden der Metriken: {e}")
            self.metrics = []
    
    def get_service_metrics(self, service_name):
        """Filtert die Metriken für einen bestimmten Service"""
        return [m for m in self.metrics if m.get("service_name") == service_name]
    
    def analyze_cpu_usage(self, service_id):
        """Analysiert CPU-Nutzung und gibt Optimierungsempfehlungen"""
        service_info = self.services.get(service_id)
        if not service_info:
            return []
        
        service_name = service_info.get("name", service_id)
        service_metrics = self.get_service_metrics(service_name)
        
        if not service_metrics:
            return []
        
        # CPU-Nutzung analysieren
        cpu_values = [m.get("cpu_percent", 0) for m in service_metrics if "cpu_percent" in m]
        if not cpu_values:
            return []
        
        avg_cpu = np.mean(cpu_values)
        max_cpu = np.max(cpu_values)
        p95_cpu = np.percentile(cpu_values, 95)
        
        recommendations = []
        threshold = service_info.get("threshold_cpu", 80)
        
        # Hohe Durchschnittsauslastung
        if avg_cpu > threshold * 0.8:  # 80% des Schwellwerts
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="cpu",
                priority=4 if avg_cpu > threshold else 3,
                description=f"Hohe durchschnittliche CPU-Auslastung: {avg_cpu:.1f}%",
                suggested_action="Service horizontal skalieren oder Code optimieren",
                current_value=avg_cpu,
                target_value=threshold * 0.6  # 60% des Schwellwerts als Ziel
            ))
        
        # Spitzen in der CPU-Auslastung
        if max_cpu > threshold:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="cpu",
                priority=3,
                description=f"CPU-Spitzen erkannt: {max_cpu:.1f}%",
                suggested_action="CPU-intensive Operationen prüfen und optimieren",
                current_value=max_cpu,
                target_value=threshold
            ))
        
        return recommendations
    
    def analyze_memory_usage(self, service_id):
        """Analysiert Speichernutzung und gibt Optimierungsempfehlungen"""
        service_info = self.services.get(service_id)
        if not service_info:
            return []
        
        service_name = service_info.get("name", service_id)
        service_metrics = self.get_service_metrics(service_name)
        
        if not service_metrics:
            return []
        
        # RAM-Nutzung analysieren
        memory_values = [m.get("memory_percent", 0) for m in service_metrics if "memory_percent" in m]
        if not memory_values:
            return []
        
        avg_memory = np.mean(memory_values)
        max_memory = np.max(memory_values)
        trend = np.polyfit(range(len(memory_values)), memory_values, 1)[0]  # Linearer Trend
        
        recommendations = []
        threshold = service_info.get("threshold_memory", 80)
        
        # Hohe Speichernutzung
        if avg_memory > threshold * 0.8:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="memory",
                priority=4 if avg_memory > threshold else 3,
                description=f"Hohe durchschnittliche Speichernutzung: {avg_memory:.1f}%",
                suggested_action="Memory-Leaks prüfen oder Speicherlimits erhöhen",
                current_value=avg_memory,
                target_value=threshold * 0.6
            ))
        
        # Memory Leak erkennen (stetig steigender Trend)
        if trend > 0.5 and len(memory_values) > 10:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="memory",
                priority=5,
                description=f"Möglicher Memory-Leak erkannt (Trend: +{trend:.2f}% pro Messung)",
                suggested_action="Code auf Memory-Leaks prüfen, insbesondere bei Objekten, die nicht freigegeben werden",
                current_value=avg_memory,
                target_value=avg_memory * 0.7
            ))
        
        return recommendations
    
    def analyze_response_times(self, service_id):
        """Analysiert Antwortzeiten und gibt Optimierungsempfehlungen"""
        service_info = self.services.get(service_id)
        if not service_info:
            return []
        
        service_name = service_info.get("name", service_id)
        service_metrics = self.get_service_metrics(service_name)
        
        if not service_metrics:
            return []
        
        # Antwortzeiten analysieren
        response_times = [m.get("response_time", 0) for m in service_metrics 
                           if "response_time" in m and m.get("status") == "online"]
        if not response_times:
            return []
        
        avg_response = np.mean(response_times)
        max_response = np.max(response_times)
        p95_response = np.percentile(response_times, 95)
        
        recommendations = []
        threshold = service_info.get("threshold_response", 1.0)
        
        # Langsame Antwortzeiten
        if avg_response > threshold * 0.8:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="latency",
                priority=4 if avg_response > threshold else 3,
                description=f"Hohe durchschnittliche Antwortzeit: {avg_response*1000:.0f}ms",
                suggested_action="Datenbank-Queries optimieren oder Caching implementieren",
                current_value=avg_response,
                target_value=threshold * 0.5
            ))
        
        # 95. Perzentil über Schwellwert
        if p95_response > threshold:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="latency",
                priority=3,
                description=f"95% der Antwortzeiten über {p95_response*1000:.0f}ms",
                suggested_action="Lastspitzen analysieren und optimieren",
                current_value=p95_response,
                target_value=threshold * 0.8
            ))
        
        return recommendations
    
    def analyze_scaling_needs(self, service_id):
        """Analysiert, ob ein Service skaliert werden sollte"""
        service_info = self.services.get(service_id)
        if not service_info:
            return []
        
        service_name = service_info.get("name", service_id)
        service_metrics = self.get_service_metrics(service_name)
        
        if not service_metrics:
            return []
        
        # Metriken für Skalierungsanalyse
        cpu_values = [m.get("cpu_percent", 0) for m in service_metrics if "cpu_percent" in m]
        response_times = [m.get("response_time", 0) for m in service_metrics 
                          if "response_time" in m and m.get("status") == "online"]
        
        if not cpu_values or not response_times:
            return []
        
        avg_cpu = np.mean(cpu_values)
        avg_response = np.mean(response_times)
        cpu_threshold = service_info.get("threshold_cpu", 80)
        response_threshold = service_info.get("threshold_response", 1.0)
        
        recommendations = []
        
        # Horizontale Skalierung empfehlen
        if avg_cpu > cpu_threshold * 0.7 and avg_response > response_threshold * 0.7:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="scaling",
                priority=4 if avg_cpu > cpu_threshold * 0.9 else 3,
                description=f"Hohe Auslastung und Antwortzeiten: CPU {avg_cpu:.1f}%, Latenz {avg_response*1000:.0f}ms",
                suggested_action="Horizontale Skalierung empfohlen: Mehr Instanzen hinzufügen",
                current_value=avg_cpu,
                target_value=cpu_threshold * 0.5
            ))
        
        # Vertikale Skalierung empfehlen
        if avg_cpu > cpu_threshold * 0.9:
            recommendations.append(OptimizationRecommendation(
                service_id=service_id,
                service_name=service_name,
                recommendation_type="scaling",
                priority=3,
                description=f"CPU-Auslastung nahe am Limit: {avg_cpu:.1f}%",
                suggested_action="Vertikale Skalierung erwägen: Mehr Ressourcen pro Instanz",
                current_value=avg_cpu,
                target_value=cpu_threshold * 0.6
            ))
        
        return recommendations
    
    def analyze_all_services(self):
        """Analysiert alle Services und sammelt Optimierungsempfehlungen"""
        self.load_metrics()
        all_recommendations = []
        
        for service_id in self.services.keys():
            # CPU-Analyse
            cpu_recommendations = self.analyze_cpu_usage(service_id)
            all_recommendations.extend(cpu_recommendations)
            
            # Speicher-Analyse
            memory_recommendations = self.analyze_memory_usage(service_id)
            all_recommendations.extend(memory_recommendations)
            
            # Latenz-Analyse
            latency_recommendations = self.analyze_response_times(service_id)
            all_recommendations.extend(latency_recommendations)
            
            # Skalierungs-Analyse
            scaling_recommendations = self.analyze_scaling_needs(service_id)
            all_recommendations.extend(scaling_recommendations)
        
        # Nach Priorität sortieren (höchste zuerst)
        self.recommendations = sorted(all_recommendations, key=lambda x: x.priority, reverse=True)
        return self.recommendations
    
    def generate_report(self, output_file="optimization_report.md"):
        """Generiert einen Markdown-Bericht mit Optimierungsempfehlungen"""
        if not self.recommendations:
            self.analyze_all_services()
        
        report = "# Microservice-Optimierungsbericht\n\n"
        report += f"Erstellungsdatum: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        if not self.recommendations:
            report += "Keine Optimierungsempfehlungen identifiziert.\n"
            return report
        
        # Kritische Empfehlungen (Priorität 5)
        critical = [r for r in self.recommendations if r.priority == 5]
        if critical:
            report += "## ⚠️ Kritische Probleme\n\n"
            for rec in critical:
                report += f"### {rec.service_name}: {rec.description}\n"
                report += f"- **Typ:** {rec.recommendation_type.title()}\n"
                report += f"- **Empfehlung:** {rec.suggested_action}\n"
                report += f"- **Aktueller Wert:** {rec.current_value:.2f} (Ziel: {rec.target_value:.2f})\n\n"
        
        # Wichtige Empfehlungen (Priorität 4)
        important = [r for r in self.recommendations if r.priority == 4]
        if important:
            report += "## ⚠️ Wichtige Optimierungen\n\n"
            for rec in important:
                report += f"### {rec.service_name}: {rec.description}\n"
                report += f"- **Typ:** {rec.recommendation_type.title()}\n"
                report += f"- **Empfehlung:** {rec.suggested_action}\n"
                report += f"- **Aktueller Wert:** {rec.current_value:.2f} (Ziel: {rec.target_value:.2f})\n\n"
        
        # Mittlere Empfehlungen (Priorität 3)
        medium = [r for r in self.recommendations if r.priority == 3]
        if medium:
            report += "## Empfohlene Optimierungen\n\n"
            for rec in medium:
                report += f"### {rec.service_name}: {rec.description}\n"
                report += f"- **Typ:** {rec.recommendation_type.title()}\n"
                report += f"- **Empfehlung:** {rec.suggested_action}\n"
                report += f"- **Aktueller Wert:** {rec.current_value:.2f} (Ziel: {rec.target_value:.2f})\n\n"
        
        # Niedrige Empfehlungen (Priorität 1-2)
        low = [r for r in self.recommendations if r.priority < 3]
        if low:
            report += "## Mögliche Optimierungen\n\n"
            for rec in low:
                report += f"### {rec.service_name}: {rec.description}\n"
                report += f"- **Typ:** {rec.recommendation_type.title()}\n"
                report += f"- **Empfehlung:** {rec.suggested_action}\n"
                report += f"- **Aktueller Wert:** {rec.current_value:.2f} (Ziel: {rec.target_value:.2f})\n\n"
        
        # Bericht speichern
        with open(output_file, 'w') as f:
            f.write(report)
        
        logger.info(f"Optimierungsbericht wurde in {output_file} gespeichert")
        return report

if __name__ == "__main__":
    optimizer = PerformanceOptimizer()
    optimizer.analyze_all_services()
    optimizer.generate_report() 