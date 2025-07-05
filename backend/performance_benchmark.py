#!/usr/bin/env python
"""
Performance-Benchmark für das AI-gesteuerte ERP-System
Misst Latenz, Durchsatz und andere Performance-Metriken
"""

import argparse
import asyncio
import time
import statistics
import json
from datetime import datetime
import httpx
import sys
import os
from pathlib import Path
import platform
import aiohttp
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any

# Konstanten
DEFAULT_URL = "http://localhost:8003"
DEFAULT_ENDPOINTS = [
    "/health",
    "/api/v1/artikel",
    "/api/v1/kunden",
    "/api/v1/dashboard"
]
DEFAULT_CONCURRENCY = 10
DEFAULT_REQUESTS = 100
DEFAULT_WARMUP = 10

class BenchmarkResults:
    """Speichert und analysiert die Benchmark-Ergebnisse"""
    
    def __init__(self):
        """Initialisiert die Benchmark-Ergebnisse"""
        self.start_time = None
        self.end_time = None
        self.total_duration = None
        self.results = {}
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.percentiles = {}
        
    def start(self):
        """Startet die Zeitmessung"""
        self.start_time = time.time()
        
    def stop(self):
        """Stoppt die Zeitmessung und berechnet die Gesamtdauer"""
        self.end_time = time.time()
        self.total_duration = self.end_time - self.start_time
        
    def add_result(self, endpoint: str, status_code: int, latency: float):
        """
        Fügt ein Testergebnis hinzu
        
        Args:
            endpoint: Der getestete API-Endpunkt
            status_code: HTTP-Statuscode der Antwort
            latency: Latenz in Millisekunden
        """
        if endpoint not in self.results:
            self.results[endpoint] = {
                "latencies": [],
                "status_codes": [],
                "success_count": 0,
                "error_count": 0
            }
            
        self.results[endpoint]["latencies"].append(latency)
        self.results[endpoint]["status_codes"].append(status_code)
        
        self.total_requests += 1
        
        # Erfolgreiche Anfragen (2xx Status-Codes)
        if 200 <= status_code < 300:
            self.results[endpoint]["success_count"] += 1
            self.successful_requests += 1
        else:
            self.results[endpoint]["error_count"] += 1
            self.failed_requests += 1
    
    def generate_report(self) -> Dict[str, Any]:
        """
        Generiert einen Benchmark-Bericht
        
        Returns:
            Ein Dictionary mit den Benchmark-Ergebnissen
        """
        if not self.total_duration:
            self.stop()
            
        report = {
            "summary": {
                "start_time": datetime.fromtimestamp(self.start_time).isoformat(),
                "end_time": datetime.fromtimestamp(self.end_time).isoformat(),
                "duration_seconds": round(self.total_duration, 2),
                "total_requests": self.total_requests,
                "successful_requests": self.successful_requests,
                "failed_requests": self.failed_requests,
                "success_rate": round(self.successful_requests / self.total_requests * 100, 2) if self.total_requests > 0 else 0,
                "requests_per_second": round(self.total_requests / self.total_duration, 2) if self.total_duration > 0 else 0
            },
            "endpoints": {}
        }
        
        for endpoint, data in self.results.items():
            latencies = data["latencies"]
            
            if not latencies:
                continue
                
            # Berechne Statistiken
            avg_latency = statistics.mean(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            median_latency = statistics.median(latencies)
            
            # Perzentile berechnen
            latencies_sorted = sorted(latencies)
            p95 = latencies_sorted[int(len(latencies_sorted) * 0.95)]
            p99 = latencies_sorted[int(len(latencies_sorted) * 0.99)]
            
            report["endpoints"][endpoint] = {
                "requests": len(latencies),
                "success_count": data["success_count"],
                "error_count": data["error_count"],
                "success_rate": round(data["success_count"] / len(latencies) * 100, 2) if latencies else 0,
                "latency": {
                    "min_ms": round(min_latency, 2),
                    "max_ms": round(max_latency, 2),
                    "avg_ms": round(avg_latency, 2),
                    "median_ms": round(median_latency, 2),
                    "p95_ms": round(p95, 2),
                    "p99_ms": round(p99, 2)
                }
            }
            
        return report
    
    def save_report(self, filepath: str):
        """Speichert den Benchmark-Bericht als JSON-Datei"""
        report = self.generate_report()
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Benchmark-Bericht gespeichert in: {filepath}")
    
    def save_results_json(self, filepath: str):
        """
        Speichert die vollständigen Rohdaten für spätere Vergleiche
        
        Args:
            filepath: Pfad zur JSON-Datei
        """
        results_data = {
            "metadata": {
                "start_time": self.start_time,
                "end_time": self.end_time,
                "total_duration": self.total_duration,
                "total_requests": self.total_requests,
                "timestamp": datetime.now().isoformat()
            },
            "results": {}
        }
        
        for endpoint, data in self.results.items():
            results_data["results"][endpoint] = {
                "latencies": data["latencies"],
                "status_codes": data["status_codes"],
                "success_count": data["success_count"],
                "error_count": data["error_count"]
            }
            
        with open(filepath, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        print(f"Detaillierte Benchmark-Ergebnisse gespeichert in: {filepath}")
        
    def generate_charts(self, output_dir: str):
        """
        Generiert Diagramme aus den Benchmark-Ergebnissen
        
        Args:
            output_dir: Verzeichnis für die generierten Diagramme
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Latenz-Diagramm nach Endpunkt
        plt.figure(figsize=(12, 8))
        
        endpoint_names = []
        avg_latencies = []
        p95_latencies = []
        
        for endpoint, data in self.results.items():
            latencies = data["latencies"]
            if not latencies:
                continue
                
            endpoint_names.append(endpoint)
            avg_latencies.append(statistics.mean(latencies))
            
            # 95. Perzentil
            latencies_sorted = sorted(latencies)
            p95 = latencies_sorted[int(len(latencies_sorted) * 0.95)]
            p95_latencies.append(p95)
        
        # Indizes für die Balken
        x = range(len(endpoint_names))
        width = 0.35
        
        plt.bar([i - width/2 for i in x], avg_latencies, width, label='Durchschnitt')
        plt.bar([i + width/2 for i in x], p95_latencies, width, label='95%-Perzentil')
        
        plt.xlabel('Endpunkt')
        plt.ylabel('Latenz (ms)')
        plt.title('Latenz nach Endpunkt')
        plt.xticks(x, endpoint_names, rotation=45, ha='right')
        plt.legend()
        plt.tight_layout()
        
        chart_path = os.path.join(output_dir, 'latency_by_endpoint.png')
        plt.savefig(chart_path)
        plt.close()
        
        print(f"Latenz-Diagramm gespeichert in: {chart_path}")

async def send_request(client, url, endpoint, results):
    """
    Sendet eine HTTP-Anfrage und misst die Latenz
    
    Args:
        client: aiohttp Client-Session
        url: Basis-URL des Servers
        endpoint: API-Endpunkt
        results: BenchmarkResults-Objekt für die Ergebnisse
    """
    start_time = time.time()
    try:
        async with client.get(f"{url}{endpoint}") as response:
            await response.text()  # Antwortkörper lesen, um die vollständige Anfrage abzuschließen
            latency = (time.time() - start_time) * 1000  # in Millisekunden
            results.add_result(endpoint, response.status, latency)
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        # Für Fehler verwenden wir Status-Code 599
        results.add_result(endpoint, 599, latency)
        print(f"Fehler bei Anfrage an {endpoint}: {str(e)}")

async def run_benchmark(url, endpoints, total_requests, concurrency, warmup=0):
    """
    Führt den Benchmark mit den angegebenen Parametern aus
    
    Args:
        url: Basis-URL des Servers
        endpoints: Liste der zu testenden API-Endpunkte
        total_requests: Gesamtzahl der Anfragen für jeden Endpunkt
        concurrency: Anzahl gleichzeitiger Anfragen
        warmup: Anzahl der Warmup-Anfragen (optional)
        
    Returns:
        BenchmarkResults-Objekt mit den Testergebnissen
    """
    results = BenchmarkResults()
    
    # Konfiguration für aiohttp
    conn = aiohttp.TCPConnector(limit=concurrency, force_close=True)
    timeout = aiohttp.ClientTimeout(total=30)  # 30 Sekunden Timeout
    
    async with aiohttp.ClientSession(connector=conn, timeout=timeout) as client:
        # Warmup-Phase
        if warmup > 0:
            print(f"Starte Warmup mit {warmup} Anfragen pro Endpunkt...")
            warmup_tasks = []
            for endpoint in endpoints:
                for _ in range(warmup):
                    warmup_tasks.append(send_request(client, url, endpoint, results))
            await asyncio.gather(*warmup_tasks)
            
            # Ergebnisse zurücksetzen nach Warmup
            results = BenchmarkResults()
            print("Warmup abgeschlossen.")
        
        # Benchmark starten
        print(f"Starte Benchmark mit {total_requests} Anfragen pro Endpunkt, Parallelität: {concurrency}")
        results.start()
        
        tasks = []
        for endpoint in endpoints:
            for _ in range(total_requests):
                tasks.append(send_request(client, url, endpoint, results))
        
        await asyncio.gather(*tasks)
        
        results.stop()
        
    return results

async def compare_with_previous(current_results, previous_json_path):
    """
    Vergleicht aktuelle Benchmark-Ergebnisse mit früheren Ergebnissen
    
    Args:
        current_results: Aktuelles BenchmarkResults-Objekt
        previous_json_path: Pfad zur JSON-Datei mit früheren Ergebnissen
        
    Returns:
        Dictionary mit Vergleichsdaten
    """
    if not os.path.exists(previous_json_path):
        print(f"Keine früheren Ergebnisse gefunden unter: {previous_json_path}")
        return None
    
    try:
        with open(previous_json_path, 'r') as f:
            previous_data = json.load(f)
    except Exception as e:
        print(f"Fehler beim Laden früherer Ergebnisse: {str(e)}")
        return None
    
    current_report = current_results.generate_report()
    
    comparison = {
        "summary": {
            "previous_timestamp": previous_data.get("metadata", {}).get("timestamp", "Unbekannt"),
            "current_timestamp": datetime.now().isoformat(),
            "throughput_change_percent": 0,
            "avg_latency_change_percent": {}
        },
        "endpoints": {}
    }
    
    # Gesamtdurchsatz vergleichen
    prev_rps = previous_data["metadata"]["total_requests"] / previous_data["metadata"]["total_duration"] if previous_data["metadata"]["total_duration"] > 0 else 0
    curr_rps = current_report["summary"]["requests_per_second"]
    
    if prev_rps > 0:
        throughput_change = ((curr_rps - prev_rps) / prev_rps) * 100
        comparison["summary"]["throughput_change_percent"] = round(throughput_change, 2)
    
    # Endpunkt-spezifische Vergleiche
    for endpoint, curr_data in current_report["endpoints"].items():
        if endpoint in previous_data["results"]:
            prev_latencies = previous_data["results"][endpoint]["latencies"]
            
            if prev_latencies:
                prev_avg_latency = sum(prev_latencies) / len(prev_latencies)
                curr_avg_latency = curr_data["latency"]["avg_ms"]
                
                if prev_avg_latency > 0:
                    latency_change = ((curr_avg_latency - prev_avg_latency) / prev_avg_latency) * 100
                    comparison["endpoints"][endpoint] = {
                        "previous_avg_latency_ms": round(prev_avg_latency, 2),
                        "current_avg_latency_ms": curr_avg_latency,
                        "latency_change_percent": round(latency_change, 2),
                        "improved": latency_change < 0  # Negative Änderung = Verbesserung
                    }
                    
                    # Zusammenfassung der Latenzen
                    comparison["summary"]["avg_latency_change_percent"][endpoint] = round(latency_change, 2)
    
    return comparison

def main():
    """Hauptfunktion für den Benchmark-Test"""
    parser = argparse.ArgumentParser(description="Performance-Benchmark für das AI-gesteuerte ERP-System")
    parser.add_argument("--url", default="http://localhost:8000", help="Basis-URL des Servers")
    parser.add_argument("--endpoints", nargs="+", default=DEFAULT_ENDPOINTS, help="API-Endpunkte für Tests")
    parser.add_argument("--requests", type=int, default=100, help="Anzahl der Anfragen pro Endpunkt")
    parser.add_argument("--concurrency", type=int, default=10, help="Anzahl gleichzeitiger Anfragen")
    parser.add_argument("--warmup", type=int, default=10, help="Anzahl Warmup-Anfragen (0 = deaktivieren)")
    parser.add_argument("--output", default="benchmark_results", help="Ausgabeverzeichnis für Ergebnisse")
    parser.add_argument("--compare", help="Vergleich mit früheren Ergebnissen (JSON-Datei)")
    
    args = parser.parse_args()
    
    # Ausgabeverzeichnis erstellen
    os.makedirs(args.output, exist_ok=True)
    
    # Zeitstempel für Dateinamen
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Asyncio Event-Loop erstellen und Benchmark ausführen
    try:
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(
            run_benchmark(args.url, args.endpoints, args.requests, args.concurrency, args.warmup)
        )
        
        # Ergebnisse speichern
        report_path = os.path.join(args.output, f"benchmark_report_{timestamp}.json")
        results_path = os.path.join(args.output, f"benchmark_results_{timestamp}.json")
        
        results.save_report(report_path)
        results.save_results_json(results_path)
        
        # Diagramme erstellen
        charts_dir = os.path.join(args.output, f"charts_{timestamp}")
        results.generate_charts(charts_dir)
        
        # Vergleich mit früheren Ergebnissen
        if args.compare:
            comparison = loop.run_until_complete(compare_with_previous(results, args.compare))
            if comparison:
                comparison_path = os.path.join(args.output, f"benchmark_comparison_{timestamp}.json")
                with open(comparison_path, 'w') as f:
                    json.dump(comparison, f, indent=2)
                print(f"Vergleich gespeichert in: {comparison_path}")
                
                # Vorher-Nachher-Vergleich ausgeben
                print("\n=== Performance-Vergleich ===")
                print(f"Durchsatz-Änderung: {comparison['summary']['throughput_change_percent']}%")
                print("Latenz-Änderungen:")
                for endpoint, change in comparison["summary"]["avg_latency_change_percent"].items():
                    improvement = "verbessert" if change < 0 else "verschlechtert"
                    print(f"  {endpoint}: {abs(change)}% {improvement}")
        
        # Zusammenfassung ausgeben
        report = results.generate_report()
        print("\n=== Benchmark-Zusammenfassung ===")
        print(f"Dauer: {report['summary']['duration_seconds']} Sekunden")
        print(f"Anfragen gesamt: {report['summary']['total_requests']}")
        print(f"Erfolgsrate: {report['summary']['success_rate']}%")
        print(f"Anfragen pro Sekunde: {report['summary']['requests_per_second']}")
        
        print("\nEndpunkt-Latenzen (Durchschnitt):")
        for endpoint, data in report["endpoints"].items():
            print(f"  {endpoint}: {data['latency']['avg_ms']} ms")
        
    except KeyboardInterrupt:
        print("Benchmark abgebrochen.")
    except Exception as e:
        print(f"Fehler beim Ausführen des Benchmarks: {str(e)}")

if __name__ == "__main__":
    main() 