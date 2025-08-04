"""
Testclient für den minimalen Server mit Python 3.11
"""
import requests
import json
from datetime import datetime
import sys
import traceback
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:8005"

def test_health() -> bool:
    """Test des Health-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Health-Status: {response.status_code}")
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"❌ Verbindungsfehler: Server läuft nicht auf {BASE_URL}")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Server antwortet nicht innerhalb von 5 Sekunden")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request-Fehler beim Health-Check: {type(e).__name__}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler beim Health-Check: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

def test_artikel() -> bool:
    """Test des Artikel-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/artikel", timeout=5)
        print(f"\nArtikel-API: {response.status_code}")
        
        if response.status_code == 200:
            try:
                artikel = response.json()
                print(f"Anzahl Artikel: {len(artikel)}")
                if artikel:
                    print(f"Erster Artikel: {json.dumps(artikel[0], indent=2)}")
            except json.JSONDecodeError:
                print("❌ Fehlerhafte JSON-Antwort vom Server")
                return False
        else:
            print(f"❌ Server antwortete mit Status: {response.status_code}")
            return False
            
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"❌ Verbindungsfehler: Artikel-API nicht erreichbar")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Artikel-API antwortet nicht")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request-Fehler beim Artikel-API-Test: {type(e).__name__}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler beim Artikel-API-Test: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

def test_kunden() -> bool:
    """Test des Kunden-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/kunden", timeout=5)
        print(f"\nKunden-API: {response.status_code}")
        
        if response.status_code == 200:
            try:
                kunden = response.json()
                print(f"Anzahl Kunden: {len(kunden)}")
                if kunden:
                    print(f"Erster Kunde: {json.dumps(kunden[0], indent=2)}")
            except json.JSONDecodeError:
                print("❌ Fehlerhafte JSON-Antwort vom Server")
                return False
        else:
            print(f"❌ Server antwortete mit Status: {response.status_code}")
            return False
            
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"❌ Verbindungsfehler: Kunden-API nicht erreichbar")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Kunden-API antwortet nicht")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request-Fehler beim Kunden-API-Test: {type(e).__name__}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler beim Kunden-API-Test: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

def test_dashboard() -> bool:
    """Test des Dashboard-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/dashboard", timeout=5)
        print(f"\nDashboard-API: {response.status_code}")
        
        if response.status_code == 200:
            try:
                dashboard = response.json()
                if isinstance(dashboard, dict):
                    print(f"Dashboard-Daten: {len(dashboard.keys())} Schlüssel")
                    print(f"Verfügbare Metriken: {', '.join(dashboard.keys())}")
                else:
                    print("❌ Unerwartetes Antwortformat (kein Dictionary)")
                    return False
            except json.JSONDecodeError:
                print("❌ Fehlerhafte JSON-Antwort vom Server")
                return False
        else:
            print(f"❌ Server antwortete mit Status: {response.status_code}")
            return False
            
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"❌ Verbindungsfehler: Dashboard-API nicht erreichbar")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Dashboard-API antwortet nicht")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request-Fehler beim Dashboard-API-Test: {type(e).__name__}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler beim Dashboard-API-Test: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

def run_tests() -> bool:
    """Führt alle Tests aus und gibt einen Statusbericht zurück"""
    print(f"=== API-Tests für {BASE_URL} ===")
    print(f"Zeitstempel: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Erst Health-Check durchführen
    if not test_health():
        print("\n⚠️  Server ist nicht erreichbar. Beende Tests.")
        return False
    
    # Weitere Tests nur wenn Server läuft
    tests = {
        "Artikel-API": test_artikel(),
        "Kunden-API": test_kunden(),
        "Dashboard-API": test_dashboard()
    }
    
    print("\n=== Testergebnisse ===")
    all_passed = True
    for name, result in tests.items():
        status = "✅ BESTANDEN" if result else "❌ FEHLGESCHLAGEN"
        if not result:
            all_passed = False
        print(f"{name}: {status}")
    
    print(f"\nGesamtergebnis: {'✅ ALLE TESTS BESTANDEN' if all_passed else '❌ EINIGE TESTS FEHLGESCHLAGEN'}")
    return all_passed

if __name__ == "__main__":
    try:
        success = run_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests durch Benutzer abgebrochen")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Kritischer Fehler: {type(e).__name__}: {e}")
        traceback.print_exc()
        sys.exit(1) 