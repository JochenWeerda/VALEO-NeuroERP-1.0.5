#!/usr/bin/env python
"""
ERP-System Performance-Monitor Dashboard
Visualisiert Leistungsdaten aus dem Observer-Service und Performance-Benchmark
"""

import os
import sys
import time
import json
import datetime
import argparse
import threading
import webbrowser
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from flask import Flask, render_template, jsonify, request

# Füge Verzeichnisse zum Python-Pfad hinzu
current_dir = Path(__file__).parent.absolute()
root_dir = current_dir.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(current_dir))

# Import des Observer-Service für Datenzugriff
try:
    from observer_service import ObserverService
    observer_available = True
except ImportError:
    print("Observer-Service nicht verfügbar, eingeschränkte Funktionalität")
    observer_available = False

# Globale Variablen
app = Flask(__name__)
DATA_DIR = current_dir / "performance_data"
REPORTS_DIR = current_dir / "reports"
DEFAULT_PORT = 5000

# Sicherstellen, dass Verzeichnisse existieren
DATA_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

# In-Memory-Daten
performance_data = {
    "cpu_usage": [],
    "memory_usage": [],
    "response_times": [],
    "requests_per_second": [],
    "error_rates": [],
    "timestamps": []
}

# Hilfsfunktion zum Laden der neuesten Daten
def load_latest_data():
    """Lädt die neuesten Performance-Daten"""
    if observer_available:
        try:
            # Versuche Daten vom Observer-Service zu laden
            observer = ObserverService()
            data = observer.get_latest_metrics()
            
            # Füge neue Datenpunkte hinzu
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            performance_data["timestamps"].append(now)
            performance_data["cpu_usage"].append(data.get("cpu_usage", 0))
            performance_data["memory_usage"].append(data.get("memory_usage", 0))
            performance_data["response_times"].append(data.get("avg_response_time", 0))
            performance_data["requests_per_second"].append(data.get("requests_per_second", 0))
            performance_data["error_rates"].append(data.get("error_rate", 0))
            
            return True
        except Exception as e:
            print(f"Fehler beim Laden der Observer-Daten: {e}")
    
    # Fallback: Versuche Daten aus Dateien zu laden
    try:
        files = sorted(list(DATA_DIR.glob("perf_*.json")), reverse=True)
        if files:
            with open(files[0], "r") as f:
                data = json.load(f)
                
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            performance_data["timestamps"].append(now)
            performance_data["cpu_usage"].append(data.get("cpu_usage", 0))
            performance_data["memory_usage"].append(data.get("memory_usage", 0))
            performance_data["response_times"].append(data.get("avg_response_time", 0))
            performance_data["requests_per_second"].append(data.get("requests_per_second", 0))
            performance_data["error_rates"].append(data.get("error_rate", 0))
            
            return True
    except Exception as e:
        print(f"Fehler beim Laden der Performance-Daten: {e}")
    
    return False

# Hilfsfunktion zum Laden von Benchmark-Ergebnissen
def load_benchmark_results():
    """Lädt die letzten Benchmark-Ergebnisse"""
    try:
        files = sorted(list(REPORTS_DIR.glob("benchmark_*.json")), reverse=True)
        if files:
            with open(files[0], "r") as f:
                return json.load(f)
    except Exception as e:
        print(f"Fehler beim Laden der Benchmark-Ergebnisse: {e}")
    
    return {}

# Datenerfasser-Thread
def data_collector_thread(interval=5):
    """Thread zur kontinuierlichen Datenerfassung"""
    while True:
        load_latest_data()
        time.sleep(interval)

# Flask-Routen
@app.route('/')
def index():
    """Hauptseite des Dashboards"""
    return render_template('dashboard.html')

@app.route('/api/metrics')
def get_metrics():
    """API-Endpunkt für aktuelle Metriken"""
    # Begrenze die Datenmenge auf maximal 100 Punkte
    limit = min(100, len(performance_data["timestamps"]))
    
    return jsonify({
        "timestamps": performance_data["timestamps"][-limit:],
        "cpu_usage": performance_data["cpu_usage"][-limit:],
        "memory_usage": performance_data["memory_usage"][-limit:],
        "response_times": performance_data["response_times"][-limit:],
        "requests_per_second": performance_data["requests_per_second"][-limit:],
        "error_rates": performance_data["error_rates"][-limit:]
    })

@app.route('/api/benchmarks')
def get_benchmarks():
    """API-Endpunkt für Benchmark-Ergebnisse"""
    return jsonify(load_benchmark_results())

@app.route('/api/summary')
def get_summary():
    """API-Endpunkt für zusammengefasste Daten"""
    # Wenn keine Daten vorhanden sind, zeige Standardwerte
    if not performance_data["cpu_usage"]:
        return jsonify({
            "cpu_usage_avg": 0,
            "memory_usage_avg": 0,
            "response_time_avg": 0,
            "requests_per_second_avg": 0,
            "error_rate_avg": 0,
            "cpu_usage_max": 0,
            "memory_usage_max": 0,
            "response_time_max": 0,
            "health_status": "Keine Daten verfügbar"
        })
    
    # Berechne Durchschnittswerte und Maxima
    cpu_avg = sum(performance_data["cpu_usage"]) / len(performance_data["cpu_usage"])
    memory_avg = sum(performance_data["memory_usage"]) / len(performance_data["memory_usage"])
    response_avg = sum(performance_data["response_times"]) / len(performance_data["response_times"])
    rps_avg = sum(performance_data["requests_per_second"]) / len(performance_data["requests_per_second"])
    error_avg = sum(performance_data["error_rates"]) / len(performance_data["error_rates"])
    
    cpu_max = max(performance_data["cpu_usage"]) if performance_data["cpu_usage"] else 0
    memory_max = max(performance_data["memory_usage"]) if performance_data["memory_usage"] else 0
    response_max = max(performance_data["response_times"]) if performance_data["response_times"] else 0
    
    # Bestimme Systemzustand
    health_status = "Gesund"
    if cpu_avg > 80 or memory_avg > 80:
        health_status = "Kritisch"
    elif cpu_avg > 60 or memory_avg > 60 or error_avg > 1:
        health_status = "Warnung"
    
    return jsonify({
        "cpu_usage_avg": round(cpu_avg, 2),
        "memory_usage_avg": round(memory_avg, 2),
        "response_time_avg": round(response_avg, 2),
        "requests_per_second_avg": round(rps_avg, 2),
        "error_rate_avg": round(error_avg, 4),
        "cpu_usage_max": round(cpu_max, 2),
        "memory_usage_max": round(memory_max, 2),
        "response_time_max": round(response_max, 2),
        "health_status": health_status
    })

# HTML-Template für Dashboard erstellen
@app.route('/generate_template')
def generate_template():
    """Generiert das Dashboard-Template falls nicht vorhanden"""
    templates_dir = current_dir / "templates"
    templates_dir.mkdir(exist_ok=True)
    
    template_path = templates_dir / "dashboard.html"
    
    if not template_path.exists():
        with open(template_path, "w", encoding="utf-8") as f:
            f.write("""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP Performance Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        h1, h2, h3 {
            margin: 0;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            min-height: 300px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        .summary-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 15px;
            text-align: center;
        }
        .summary-card h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #7f8c8d;
        }
        .summary-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
        }
        .status-healthy {
            background-color: #2ecc71;
            color: white;
        }
        .status-warning {
            background-color: #f39c12;
            color: white;
        }
        .status-critical {
            background-color: #e74c3c;
            color: white;
        }
        .chart-container {
            width: 100%;
            height: 280px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
            font-size: 14px;
        }
        .refresh-control {
            text-align: right;
            margin-bottom: 10px;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: #2980b9;
        }
        select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        @media (max-width: 768px) {
            .dashboard-grid, .summary-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header>
        <h1>ERP Performance Dashboard</h1>
        <p>Echtzeit-Überwachung der Systemleistung</p>
    </header>
    
    <div class="container">
        <div class="refresh-control">
            <select id="refreshInterval">
                <option value="5">Aktualisieren alle 5s</option>
                <option value="10">Aktualisieren alle 10s</option>
                <option value="30">Aktualisieren alle 30s</option>
                <option value="60">Aktualisieren alle 60s</option>
            </select>
            <button id="refreshButton">Jetzt aktualisieren</button>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card" id="cpuCard">
                <h3>CPU-Auslastung</h3>
                <div class="value" id="cpuValue">0%</div>
            </div>
            <div class="summary-card" id="memoryCard">
                <h3>Speichernutzung</h3>
                <div class="value" id="memoryValue">0%</div>
            </div>
            <div class="summary-card" id="responseCard">
                <h3>Antwortzeit</h3>
                <div class="value" id="responseValue">0 ms</div>
            </div>
            <div class="summary-card" id="statusCard">
                <h3>Systemstatus</h3>
                <div class="value" id="statusValue">Unbekannt</div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h2>CPU & Speicherauslastung</h2>
                <div class="chart-container">
                    <canvas id="resourceChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h2>Antwortzeiten</h2>
                <div class="chart-container">
                    <canvas id="responseChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h2>Anfragen pro Sekunde</h2>
                <div class="chart-container">
                    <canvas id="rpsChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h2>Fehlerrate</h2>
                <div class="chart-container">
                    <canvas id="errorChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>AI-Driven ERP Performance Monitor | Letzte Aktualisierung: <span id="lastUpdate">-</span></p>
    </div>
    
    <script>
        // Globale Chart-Variablen
        let resourceChart, responseChart, rpsChart, errorChart;
        let refreshInterval = 5; // Standard: 5 Sekunden
        let refreshTimer;
        
        // Formatierung des Datums
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleTimeString();
        }
        
        // Aktualisierungsfunktion
        function refreshData() {
            fetch('/api/metrics')
                .then(response => response.json())
                .then(data => {
                    updateCharts(data);
                    document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
                })
                .catch(error => console.error('Fehler beim Abrufen der Metriken:', error));
                
            fetch('/api/summary')
                .then(response => response.json())
                .then(data => {
                    updateSummary(data);
                })
                .catch(error => console.error('Fehler beim Abrufen der Zusammenfassung:', error));
        }
        
        // Chart-Aktualisierung
        function updateCharts(data) {
            // CPU & Speicher-Chart
            resourceChart.data.labels = data.timestamps.map(formatDate);
            resourceChart.data.datasets[0].data = data.cpu_usage;
            resourceChart.data.datasets[1].data = data.memory_usage;
            resourceChart.update();
            
            // Antwortzeit-Chart
            responseChart.data.labels = data.timestamps.map(formatDate);
            responseChart.data.datasets[0].data = data.response_times;
            responseChart.update();
            
            // RPS-Chart
            rpsChart.data.labels = data.timestamps.map(formatDate);
            rpsChart.data.datasets[0].data = data.requests_per_second;
            rpsChart.update();
            
            // Fehlerrate-Chart
            errorChart.data.labels = data.timestamps.map(formatDate);
            errorChart.data.datasets[0].data = data.error_rates.map(rate => rate * 100); // In Prozent umrechnen
            errorChart.update();
        }
        
        // Zusammenfassung aktualisieren
        function updateSummary(data) {
            document.getElementById('cpuValue').textContent = data.cpu_usage_avg + '%';
            document.getElementById('memoryValue').textContent = data.memory_usage_avg + '%';
            document.getElementById('responseValue').textContent = data.response_time_avg + ' ms';
            document.getElementById('statusValue').textContent = data.health_status;
            
            // Status-Styling
            const statusCard = document.getElementById('statusCard');
            statusCard.className = 'summary-card';
            
            if (data.health_status === 'Gesund') {
                statusCard.classList.add('status-healthy');
            } else if (data.health_status === 'Warnung') {
                statusCard.classList.add('status-warning');
            } else if (data.health_status === 'Kritisch') {
                statusCard.classList.add('status-critical');
            }
            
            // Farbkodierung für andere Metriken
            const cpuCard = document.getElementById('cpuCard');
            cpuCard.className = 'summary-card';
            if (data.cpu_usage_avg > 80) {
                cpuCard.classList.add('status-critical');
            } else if (data.cpu_usage_avg > 60) {
                cpuCard.classList.add('status-warning');
            }
            
            const memoryCard = document.getElementById('memoryCard');
            memoryCard.className = 'summary-card';
            if (data.memory_usage_avg > 80) {
                memoryCard.classList.add('status-critical');
            } else if (data.memory_usage_avg > 60) {
                memoryCard.classList.add('status-warning');
            }
        }
        
        // Aktualisierungsintervall einstellen
        function setRefreshInterval() {
            clearInterval(refreshTimer);
            refreshInterval = parseInt(document.getElementById('refreshInterval').value);
            refreshTimer = setInterval(refreshData, refreshInterval * 1000);
        }
        
        // Initialisieren der Charts
        function initCharts() {
            // CPU & Speicher-Chart
            resourceChart = new Chart(document.getElementById('resourceChart'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'CPU-Auslastung (%)',
                        data: [],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                        tension: 0.2
                    },
                    {
                        label: 'Speichernutzung (%)',
                        data: [],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Auslastung (%)'
                            }
                        }
                    }
                }
            });
            
            // Antwortzeit-Chart
            responseChart = new Chart(document.getElementById('responseChart'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Antwortzeit (ms)',
                        data: [],
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Zeit (ms)'
                            }
                        }
                    }
                }
            });
            
            // RPS-Chart
            rpsChart = new Chart(document.getElementById('rpsChart'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Anfragen pro Sekunde',
                        data: [],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'RPS'
                            }
                        }
                    }
                }
            });
            
            // Fehlerrate-Chart
            errorChart = new Chart(document.getElementById('errorChart'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Fehlerrate (%)',
                        data: [],
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            title: {
                                display: true,
                                text: 'Rate (%)'
                            }
                        }
                    }
                }
            });
        }
        
        // Event-Listener
        document.addEventListener('DOMContentLoaded', function() {
            initCharts();
            refreshData(); // Erste Daten laden
            
            // Aktualisierungsintervall einstellen
            document.getElementById('refreshInterval').addEventListener('change', setRefreshInterval);
            setRefreshInterval(); // Timer starten
            
            // Manuelles Aktualisieren
            document.getElementById('refreshButton').addEventListener('click', refreshData);
        });
    </script>
</body>
</html>""")
    
    return jsonify({"status": "success", "message": "Template erfolgreich generiert"})

def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(description="ERP Performance Dashboard")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, 
                        help=f"Port für das Dashboard (Standard: {DEFAULT_PORT})")
    parser.add_argument("--no-browser", action="store_true", 
                        help="Browser nicht automatisch öffnen")
    parser.add_argument("--interval", type=int, default=5,
                        help="Datenerfassungsintervall in Sekunden (Standard: 5)")
    
    args = parser.parse_args()
    
    # Dashboard-Template generieren
    app.test_client().get('/generate_template')
    
    # Datenerfasser-Thread starten
    collector = threading.Thread(target=data_collector_thread, args=(args.interval,))
    collector.daemon = True
    collector.start()
    
    # Dashboard-URL
    dashboard_url = f"http://localhost:{args.port}"
    print(f"ERP Performance Dashboard wird gestartet auf {dashboard_url}")
    
    # Browser öffnen, falls gewünscht
    if not args.no_browser:
        threading.Timer(1.5, lambda: webbrowser.open(dashboard_url)).start()
    
    # Flask-Server starten
    app.run(host="0.0.0.0", port=args.port, debug=False)

if __name__ == "__main__":
    main() 