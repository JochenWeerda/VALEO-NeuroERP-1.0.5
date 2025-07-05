#!/usr/bin/env python
"""
Automatisierter Performance-Test für die CI/CD-Pipeline
Überprüft, ob Microservices die definierten Performance-Schwellwerte einhalten
"""

import os
import sys
import json
import time
import logging
import requests
import argparse
import statistics
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('performance_test.log')
    ]
)
logger = logging.getLogger("performance_test")

class PerformanceTest:
    def __init__(self, config_file="observer_config.json"):
        self.config_file = config_file
        self.services = {}
        self.load_config()
        self.test_results = {}
        
    def load_config(self):
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                self.services = config.get("services", {})
                logger.info(f"Konfiguration geladen: {len(self.services)} Services gefunden")
            else:
                logger.error(f"Konfigurationsdatei {self.config_file} nicht gefunden.")
                sys.exit(1)
        except Exception as e:
            logger.error(f"Fehler beim Laden der Konfiguration: {e}")
            sys.exit(1)
    
    def test_service_health(self, service_id, service_info):
        """Testet den Health-Endpunkt eines Services"""
        url = service_info.get("url")
        if not url:
            logger.warning(f"Keine URL für Service {service_id} definiert")
            return False
        
        service_name = service_info.get("name", service_id)
        logger.info(f"Teste Health-Endpunkt von {service_name} ({url})...")
        
        # Metriken für den Test
        response_times = []
        status_codes = []
        metrics_data = []
        
        # 10 Anfragen senden für valide Statistik
        num_requests = 10
        for i in range(num_requests):
            try:
                start_time = time.time()
                response = requests.get(url, timeout=5)
                response_time = time.time() - start_time
                
                status_codes.append(response.status_code)
                response_times.append(response_time)
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        metrics_data.append(data)
                    except ValueError:
                        logger.warning(f"Health-Endpunkt von {service_id} liefert kein valides JSON")
                
                # Kurze Pause zwischen den Anfragen
                time.sleep(0.5)
            except requests.RequestException as e:
                logger.error(f"Fehler bei der Verbindung zu {url}: {e}")
                return False
        
        # Ergebnisse auswerten
        avg_response_time = statistics.mean(response_times) if response_times else 0
        success_rate = (status_codes.count(200) / len(status_codes)) if status_codes else 0
        
        # CPU und RAM aus den Health-Daten extrahieren (falls vorhanden)
        cpu_values = []
        memory_values = []
        for data in metrics_data:
            if "metrics" in data and isinstance(data["metrics"], dict):
                metrics = data["metrics"]
                if "cpu_usage_percent" in metrics:
                    cpu_values.append(metrics["cpu_usage_percent"])
                if "memory_usage_percent" in metrics:
                    memory_values.append(metrics["memory_usage_percent"])
        
        avg_cpu = statistics.mean(cpu_values) if cpu_values else 0
        avg_memory = statistics.mean(memory_values) if memory_values else 0
        
        # Schwellwerte prüfen
        threshold_cpu = service_info.get("threshold_cpu", 70)
        threshold_memory = service_info.get("threshold_memory", 75)
        threshold_response = service_info.get("threshold_response", 0.3)
        
        # Warnungs- und kritische Schwellwerte
        warning_response = threshold_response
        critical_response = threshold_response * 1.5
        
        # Testergebnisse speichern
        self.test_results[service_id] = {
            "service_name": service_name,
            "url": url,
            "success_rate": success_rate,
            "avg_response_time": avg_response_time,
            "avg_cpu": avg_cpu,
            "avg_memory": avg_memory,
            "threshold_cpu": threshold_cpu,
            "threshold_memory": threshold_memory,
            "threshold_response": threshold_response,
            "tests": {
                "health_endpoint_available": success_rate > 0.9,
                "response_time_acceptable": avg_response_time < critical_response,
                "cpu_below_threshold": avg_cpu < threshold_cpu,
                "memory_below_threshold": avg_memory < threshold_memory
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Ausgabe der Testergebnisse
        logger.info(f"Testergebnisse für {service_name}:")
        logger.info(f"  Erfolgsrate: {success_rate * 100:.1f}%")
        logger.info(f"  Ø Antwortzeit: {avg_response_time * 1000:.2f}ms (Schwellwert: {threshold_response * 1000:.0f}ms)")
        logger.info(f"  Ø CPU: {avg_cpu:.2f}% (Schwellwert: {threshold_cpu}%)")
        logger.info(f"  Ø RAM: {avg_memory:.2f}% (Schwellwert: {threshold_memory}%)")
        
        # Status basierend auf Tests
        all_tests_passed = all(self.test_results[service_id]["tests"].values())
        logger.info(f"  Status: {'BESTANDEN' if all_tests_passed else 'FEHLGESCHLAGEN'}")
        
        return all_tests_passed
    
    def run_all_tests(self):
        """Führt Tests für alle konfigurierten Services durch"""
        all_passed = True
        for service_id, service_info in self.services.items():
            passed = self.test_service_health(service_id, service_info)
            if not passed:
                all_passed = False
        
        return all_passed
    
    def generate_report(self, output_file="performance_test_report.json"):
        """Generiert einen Bericht über die Testergebnisse"""
        try:
            with open(output_file, 'w') as f:
                json.dump({
                    "timestamp": datetime.now().isoformat(),
                    "services_tested": len(self.test_results),
                    "results": self.test_results
                }, f, indent=2)
            logger.info(f"Testbericht gespeichert in {output_file}")
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Testberichts: {e}")
    
    def check_thresholds(self):
        """Prüft, ob alle Services die Schwellwerte einhalten"""
        failed_services = []
        
        for service_id, result in self.test_results.items():
            tests = result["tests"]
            if not all(tests.values()):
                failed_tests = [test for test, passed in tests.items() if not passed]
                failed_services.append({
                    "service_id": service_id,
                    "service_name": result["service_name"],
                    "failed_tests": failed_tests
                })
        
        if failed_services:
            logger.error("Die folgenden Services haben die Performance-Tests nicht bestanden:")
            for failure in failed_services:
                logger.error(f"  {failure['service_name']}: {', '.join(failure['failed_tests'])}")
            return False
        
        logger.info("Alle Services haben die Performance-Tests bestanden!")
        return True

def main():
    parser = argparse.ArgumentParser(description="Performance-Tests für die CI/CD-Pipeline")
    parser.add_argument("--config", type=str, default="observer_config.json",
                     help="Pfad zur Konfigurationsdatei (Standard: observer_config.json)")
    parser.add_argument("--report", type=str, default="performance_test_report.json",
                     help="Pfad für den Testbericht (Standard: performance_test_report.json)")
    parser.add_argument("--ci", action="store_true",
                     help="CI-Modus (Exit-Code 1 bei Fehler)")
    
    args = parser.parse_args()
    
    logger.info("Performance-Tests werden gestartet...")
    
    tester = PerformanceTest(config_file=args.config)
    all_passed = tester.run_all_tests()
    tester.generate_report(output_file=args.report)
    thresholds_met = tester.check_thresholds()
    
    if args.ci and not (all_passed and thresholds_met):
        logger.error("Performance-Tests fehlgeschlagen. CI-Pipeline wird abgebrochen.")
        sys.exit(1)
    
    logger.info("Performance-Tests abgeschlossen.")

if __name__ == "__main__":
    main() 