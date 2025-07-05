#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Lasttest-Skript für den Finance-Microservice
Testet verschiedene Endpunkte mit unterschiedlichen Lastkonfigurationen
"""

import time
import argparse
import concurrent.futures
import statistics
import requests
import json
from datetime import datetime
import random
from typing import Dict, List, Any, Tuple

# Standard-Konfiguration
DEFAULT_HOST = "http://localhost:8000"
DEFAULT_ROUNDS = 3
DEFAULT_CONCURRENT = 10
DEFAULT_REQUESTS = 100
DEFAULT_DELAY = 0.05

# Endpunkte für Tests
ENDPOINTS = {
    "health": "/health",
    "konten": "/api/v1/accounts",
    "llm_suggest": "/api/v1/llm/suggest_transaction",
    "llm_kontenrahmen": "/api/v1/llm/suggest_chart_of_accounts",
}

# Klasse für die Messung von Requests
class RequestMetrics:
    def __init__(self):
        self.latencies = []
        self.errors = 0
        self.success = 0
    
    def add_latency(self, latency: float):
        self.latencies.append(latency)
        self.success += 1
    
    def add_error(self):
        self.errors += 1
    
    def get_statistics(self) -> Dict[str, float]:
        if not self.latencies:
            return {
                "min": 0,
                "max": 0,
                "mean": 0,
                "median": 0,
                "p95": 0,
                "p99": 0,
                "success_rate": 0,
                "requests": self.errors
            }
        
        sorted_latencies = sorted(self.latencies)
        total_requests = len(self.latencies) + self.errors
        
        return {
            "min": min(self.latencies) * 1000,  # ms
            "max": max(self.latencies) * 1000,  # ms
            "mean": statistics.mean(self.latencies) * 1000,  # ms
            "median": statistics.median(self.latencies) * 1000,  # ms
            "p95": sorted_latencies[int(len(sorted_latencies) * 0.95)] * 1000,  # ms
            "p99": sorted_latencies[int(len(sorted_latencies) * 0.99)] * 1000,  # ms
            "success_rate": (self.success / total_requests) * 100,
            "requests": total_requests
        }

# Eine einzelne Anfrage durchführen
def make_request(url: str, endpoint_name: str) -> Tuple[float, bool]:
    start_time = time.time()
    try:
        response = requests.get(url, timeout=30)
        duration = time.time() - start_time
        if response.status_code != 200:
            print(f"Fehler: Endpunkt {endpoint_name} - Status {response.status_code}")
            return duration, False
        return duration, True
    except Exception as e:
        duration = time.time() - start_time
        print(f"Exception bei {endpoint_name}: {str(e)}")
        return duration, False

# Lasttest für einen Endpunkt durchführen
def run_load_test(host: str, endpoint: str, endpoint_name: str, 
                  num_requests: int, concurrent: int, delay: float) -> RequestMetrics:
    url = f"{host}{endpoint}"
    metrics = RequestMetrics()
    
    print(f"\nTeste Endpunkt: {endpoint_name} ({url})")
    print(f"Konfiguration: {num_requests} Anfragen, {concurrent} parallel, {delay}s Verzögerung")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent) as executor:
        futures = []
        for _ in range(num_requests):
            futures.append(executor.submit(make_request, url, endpoint_name))
            time.sleep(delay)  # Verzögerung zwischen Anfragen
        
        for future in concurrent.futures.as_completed(futures):
            latency, success = future.result()
            if success:
                metrics.add_latency(latency)
            else:
                metrics.add_error()
    
    return metrics

def print_results(results: Dict[str, RequestMetrics]):
    print("\n===== TESTERGEBNISSE =====")
    for endpoint_name, metrics in results.items():
        stats = metrics.get_statistics()
        print(f"\n--- {endpoint_name.upper()} ---")
        print(f"Anfragen: {stats['requests']}")
        print(f"Erfolgsrate: {stats['success_rate']:.2f}%")
        print(f"Min Latenz: {stats['min']:.2f} ms")
        print(f"Max Latenz: {stats['max']:.2f} ms")
        print(f"Durchschnitt: {stats['mean']:.2f} ms")
        print(f"Median: {stats['median']:.2f} ms")
        print(f"95. Perzentil: {stats['p95']:.2f} ms")
        print(f"99. Perzentil: {stats['p99']:.2f} ms")

def save_results(results: Dict[str, RequestMetrics], filename: str = None):
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"loadtest_results_{timestamp}.json"
    
    output = {}
    for endpoint_name, metrics in results.items():
        output[endpoint_name] = metrics.get_statistics()
    
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nErgebnisse gespeichert in: {filename}")

def main():
    parser = argparse.ArgumentParser(description="Lasttest für Finance-Microservice")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host-URL (Standard: http://localhost:8000)")
    parser.add_argument("--rounds", type=int, default=DEFAULT_ROUNDS, help=f"Anzahl der Test-Runden (Standard: {DEFAULT_ROUNDS})")
    parser.add_argument("--requests", type=int, default=DEFAULT_REQUESTS, help=f"Anzahl der Anfragen pro Endpunkt (Standard: {DEFAULT_REQUESTS})")
    parser.add_argument("--concurrent", type=int, default=DEFAULT_CONCURRENT, help=f"Anzahl paralleler Anfragen (Standard: {DEFAULT_CONCURRENT})")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY, help=f"Verzögerung zwischen Anfragen in Sekunden (Standard: {DEFAULT_DELAY})")
    parser.add_argument("--endpoint", choices=list(ENDPOINTS.keys()) + ["all"], default="all", help="Zu testender Endpunkt (Standard: all)")
    parser.add_argument("--output", help="Ausgabedatei (Standard: loadtest_results_<timestamp>.json)")
    
    args = parser.parse_args()
    
    endpoints_to_test = ENDPOINTS if args.endpoint == "all" else {args.endpoint: ENDPOINTS[args.endpoint]}
    results = {name: RequestMetrics() for name in endpoints_to_test}
    
    start_time = time.time()
    print(f"Lasttest gestartet: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Host: {args.host}")
    print(f"Runden: {args.rounds}")
    
    for round_num in range(1, args.rounds + 1):
        print(f"\n=== RUNDE {round_num}/{args.rounds} ===")
        for name, endpoint in endpoints_to_test.items():
            round_metrics = run_load_test(
                args.host, endpoint, name, 
                args.requests, args.concurrent, args.delay
            )
            # Ergebnisse dieser Runde zu den Gesamtergebnissen hinzufügen
            results[name].latencies.extend(round_metrics.latencies)
            results[name].errors += round_metrics.errors
            results[name].success += round_metrics.success
    
    end_time = time.time()
    print(f"\nLasttest abgeschlossen in {end_time - start_time:.2f} Sekunden")
    
    # Ergebnisse ausgeben und speichern
    print_results(results)
    save_results(results, args.output)

if __name__ == "__main__":
    main() 