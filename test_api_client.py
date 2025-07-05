"""
Testclient für den minimalen Server mit Python 3.11
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8005"

def test_health():
    """Test des Health-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health-Status: {response.status_code}")
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Fehler beim Health-Check: {e}")
        return False

def test_artikel():
    """Test des Artikel-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/artikel")
        print(f"\nArtikel-API: {response.status_code}")
        if response.status_code == 200:
            artikel = response.json()
            print(f"Anzahl Artikel: {len(artikel)}")
            if artikel:
                print(f"Erster Artikel: {json.dumps(artikel[0], indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Fehler beim Artikel-API-Test: {e}")
        return False

def test_kunden():
    """Test des Kunden-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/kunden")
        print(f"\nKunden-API: {response.status_code}")
        if response.status_code == 200:
            kunden = response.json()
            print(f"Anzahl Kunden: {len(kunden)}")
            if kunden:
                print(f"Erster Kunde: {json.dumps(kunden[0], indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Fehler beim Kunden-API-Test: {e}")
        return False

def test_dashboard():
    """Test des Dashboard-Endpunkts"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/dashboard")
        print(f"\nDashboard-API: {response.status_code}")
        if response.status_code == 200:
            dashboard = response.json()
            print(f"Dashboard-Daten: {len(dashboard.keys())} Schlüssel")
            print(f"Verfügbare Metriken: {', '.join(dashboard.keys())}")
        return response.status_code == 200
    except Exception as e:
        print(f"Fehler beim Dashboard-API-Test: {e}")
        return False

def run_tests():
    """Führt alle Tests aus und gibt einen Statusbericht zurück"""
    print(f"=== API-Tests für {BASE_URL} ===")
    print(f"Zeitstempel: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = {
        "Health-Check": test_health(),
        "Artikel-API": test_artikel(),
        "Kunden-API": test_kunden(),
        "Dashboard-API": test_dashboard()
    }
    
    print("\n=== Testergebnisse ===")
    all_passed = True
    for name, result in tests.items():
        status = "BESTANDEN" if result else "FEHLGESCHLAGEN"
        if not result:
            all_passed = False
        print(f"{name}: {status}")
    
    print(f"\nGesamtergebnis: {'ALLE TESTS BESTANDEN' if all_passed else 'EINIGE TESTS FEHLGESCHLAGEN'}")
    return all_passed

if __name__ == "__main__":
    run_tests() 