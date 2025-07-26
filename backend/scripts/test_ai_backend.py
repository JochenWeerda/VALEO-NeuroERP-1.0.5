#!/usr/bin/env python3
"""
VALEO NeuroERP - Backend-Tests für KI-Module
Testet die echten API-Endpunkte mit generierten Testdaten
"""

import sys
import os
import requests
import json
import time
from typing import Dict, Any, List
import sqlite3

# Füge Backend-Verzeichnis zum Python-Pfad hinzu
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class AIBackendTester:
    """Tester für KI-Backend-APIs"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        
    def test_barcode_api(self) -> Dict[str, Any]:
        """Teste Barcode-KI-API-Endpunkte"""
        print("🧪 Teste Barcode-KI-API...")
        results = {"endpoint": "barcode", "tests": []}
        
        try:
            # Test 1: Vorschläge abrufen
            print("  📋 Teste /api/ai/barcode/suggestions")
            response = requests.get(f"{self.base_url}/api/ai/barcode/suggestions")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_suggestions",
                    "status": "PASS",
                    "data_count": len(data.get("data", [])),
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Vorschläge abgerufen: {len(data.get('data', []))} Einträge")
            else:
                results["tests"].append({
                    "test": "get_suggestions",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 2: Statistiken abrufen
            print("  📊 Teste /api/ai/barcode/stats")
            response = requests.get(f"{self.base_url}/api/ai/barcode/stats")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_stats",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Statistiken abgerufen")
            else:
                results["tests"].append({
                    "test": "get_stats",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 3: Modell neu trainieren
            print("  🔄 Teste /api/ai/barcode/retrain")
            response = requests.post(f"{self.base_url}/api/ai/barcode/retrain")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "retrain_model",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Modell neu trainiert")
            else:
                results["tests"].append({
                    "test": "retrain_model",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
        except Exception as e:
            results["tests"].append({
                "test": "api_connection",
                "status": "FAIL",
                "error": str(e)
            })
            print(f"    ❌ Verbindungsfehler: {e}")
        
        return results
    
    def test_inventory_api(self) -> Dict[str, Any]:
        """Teste Inventur-KI-API-Endpunkte"""
        print("🧪 Teste Inventur-KI-API...")
        results = {"endpoint": "inventory", "tests": []}
        
        try:
            # Test 1: Inventur-Vorschläge abrufen
            print("  📋 Teste /api/ai/inventory/suggestions")
            response = requests.get(f"{self.base_url}/api/ai/inventory/suggestions")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_suggestions",
                    "status": "PASS",
                    "data_count": len(data.get("data", [])),
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Vorschläge abgerufen: {len(data.get('data', []))} Einträge")
            else:
                results["tests"].append({
                    "test": "get_suggestions",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 2: Inventur-Analytics abrufen
            print("  📊 Teste /api/ai/inventory/analytics")
            response = requests.get(f"{self.base_url}/api/ai/inventory/analytics")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_analytics",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Analytics abgerufen")
            else:
                results["tests"].append({
                    "test": "get_analytics",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 3: Parameter optimieren
            print("  ⚙️ Teste /api/ai/inventory/optimize")
            response = requests.post(f"{self.base_url}/api/ai/inventory/optimize")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "optimize_parameters",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Parameter optimiert")
            else:
                results["tests"].append({
                    "test": "optimize_parameters",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
        except Exception as e:
            results["tests"].append({
                "test": "api_connection",
                "status": "FAIL",
                "error": str(e)
            })
            print(f"    ❌ Verbindungsfehler: {e}")
        
        return results
    
    def test_voucher_api(self) -> Dict[str, Any]:
        """Teste Voucher-KI-API-Endpunkte"""
        print("🧪 Teste Voucher-KI-API...")
        results = {"endpoint": "voucher", "tests": []}
        
        try:
            # Test 1: Voucher-Optimierungen abrufen
            print("  📋 Teste /api/ai/voucher/optimizations")
            response = requests.get(f"{self.base_url}/api/ai/voucher/optimizations")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_optimizations",
                    "status": "PASS",
                    "data_count": len(data.get("data", [])),
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Optimierungen abgerufen: {len(data.get('data', []))} Einträge")
            else:
                results["tests"].append({
                    "test": "get_optimizations",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 2: Voucher-Analytics abrufen
            print("  📊 Teste /api/ai/voucher/analytics")
            response = requests.get(f"{self.base_url}/api/ai/voucher/analytics")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_analytics",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Analytics abgerufen")
            else:
                results["tests"].append({
                    "test": "get_analytics",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
            # Test 3: Kunden-Segmente abrufen
            print("  👥 Teste /api/ai/voucher/segments")
            response = requests.get(f"{self.base_url}/api/ai/voucher/segments")
            if response.status_code == 200:
                data = response.json()
                results["tests"].append({
                    "test": "get_segments",
                    "status": "PASS",
                    "response_time": response.elapsed.total_seconds()
                })
                print(f"    ✅ Segmente abgerufen")
            else:
                results["tests"].append({
                    "test": "get_segments",
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
                print(f"    ❌ Fehler: HTTP {response.status_code}")
            
        except Exception as e:
            results["tests"].append({
                "test": "api_connection",
                "status": "FAIL",
                "error": str(e)
            })
            print(f"    ❌ Verbindungsfehler: {e}")
        
        return results
    
    def test_health_endpoints(self) -> Dict[str, Any]:
        """Teste Health-Check-Endpunkte"""
        print("🏥 Teste Health-Check-Endpunkte...")
        results = {"endpoint": "health", "tests": []}
        
        endpoints = [
            "/api/ai/barcode/health",
            "/api/ai/inventory/health", 
            "/api/ai/voucher/health"
        ]
        
        for endpoint in endpoints:
            try:
                print(f"  🔍 Teste {endpoint}")
                response = requests.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    results["tests"].append({
                        "test": f"health_{endpoint.split('/')[-2]}",
                        "status": "PASS",
                        "response_time": response.elapsed.total_seconds(),
                        "status_info": data.get("status", "unknown")
                    })
                    print(f"    ✅ Health-Check erfolgreich: {data.get('status', 'unknown')}")
                else:
                    results["tests"].append({
                        "test": f"health_{endpoint.split('/')[-2]}",
                        "status": "FAIL",
                        "error": f"HTTP {response.status_code}"
                    })
                    print(f"    ❌ Fehler: HTTP {response.status_code}")
            except Exception as e:
                results["tests"].append({
                    "test": f"health_{endpoint.split('/')[-2]}",
                    "status": "FAIL",
                    "error": str(e)
                })
                print(f"    ❌ Verbindungsfehler: {e}")
        
        return results
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Führe alle Tests aus"""
        print("🚀 Starte Backend-Tests für KI-Module...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Führe alle Tests aus
        test_results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": self.base_url,
            "results": []
        }
        
        test_results["results"].append(self.test_health_endpoints())
        test_results["results"].append(self.test_barcode_api())
        test_results["results"].append(self.test_inventory_api())
        test_results["results"].append(self.test_voucher_api())
        
        # Berechne Gesamtstatistiken
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        total_response_time = 0
        
        for result in test_results["results"]:
            for test in result["tests"]:
                total_tests += 1
                if test["status"] == "PASS":
                    passed_tests += 1
                else:
                    failed_tests += 1
                if "response_time" in test:
                    total_response_time += test["response_time"]
        
        test_results["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "total_time": time.time() - start_time,
            "avg_response_time": total_response_time / passed_tests if passed_tests > 0 else 0
        }
        
        # Zeige Ergebnisse
        print("\n" + "=" * 60)
        print("📊 TEST-ERGEBNISSE")
        print("=" * 60)
        print(f"Gesamt-Tests: {total_tests}")
        print(f"Erfolgreich: {passed_tests}")
        print(f"Fehlgeschlagen: {failed_tests}")
        print(f"Erfolgsrate: {test_results['summary']['success_rate']:.1f}%")
        print(f"Gesamtzeit: {test_results['summary']['total_time']:.2f}s")
        print(f"Durchschnittliche Antwortzeit: {test_results['summary']['avg_response_time']:.3f}s")
        
        # Zeige detaillierte Ergebnisse
        print("\n📋 DETAILLIERTE ERGEBNISSE:")
        for result in test_results["results"]:
            print(f"\n🔧 {result['endpoint'].upper()}:")
            for test in result["tests"]:
                status_icon = "✅" if test["status"] == "PASS" else "❌"
                print(f"  {status_icon} {test['test']}: {test['status']}")
                if "error" in test:
                    print(f"     Fehler: {test['error']}")
                if "data_count" in test:
                    print(f"     Daten: {test['data_count']} Einträge")
                if "response_time" in test:
                    print(f"     Zeit: {test['response_time']:.3f}s")
        
        return test_results
    
    def save_results(self, results: Dict[str, Any], filename: str = "ai_backend_test_results.json"):
        """Speichere Testergebnisse in JSON-Datei"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Ergebnisse gespeichert in: {filename}")
        except Exception as e:
            print(f"\n❌ Fehler beim Speichern der Ergebnisse: {e}")

def main():
    """Hauptfunktion für Backend-Tests"""
    print("VALEO NeuroERP - KI-Backend-Tester")
    print("=" * 50)
    
    # Prüfe ob Backend läuft
    base_url = "http://localhost:8000"
    
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code != 200:
            print(f"⚠️ Backend läuft, aber Health-Check fehlgeschlagen: HTTP {response.status_code}")
    except requests.exceptions.RequestException:
        print(f"⚠️ Backend nicht erreichbar unter {base_url}")
        print("   Stelle sicher, dass das Backend läuft: python main.py")
        return
    
    # Führe Tests aus
    tester = AIBackendTester(base_url)
    results = tester.run_all_tests()
    
    # Speichere Ergebnisse
    tester.save_results(results)
    
    # Exit-Code basierend auf Erfolgsrate
    success_rate = results["summary"]["success_rate"]
    if success_rate >= 80:
        print("\n🎉 Tests erfolgreich! (Erfolgsrate ≥ 80%)")
        sys.exit(0)
    elif success_rate >= 50:
        print("\n⚠️ Tests teilweise erfolgreich (Erfolgsrate ≥ 50%)")
        sys.exit(1)
    else:
        print("\n❌ Tests fehlgeschlagen (Erfolgsrate < 50%)")
        sys.exit(2)

if __name__ == "__main__":
    main() 