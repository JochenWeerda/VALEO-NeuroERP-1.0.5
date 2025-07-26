#!/usr/bin/env python3
"""
VALEO NeuroERP - Direkte AI-API-Tests
Testet die AI-APIs direkt ohne Backend-Server
"""
import requests
import json
import time

def test_ai_apis():
    """Teste alle AI-APIs direkt"""
    base_url = "http://localhost:8000"
    
    print("🧪 VALEO NeuroERP - AI-API-Tests")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n🏥 Teste Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health Check erfolgreich")
            print(f"   Antwort: {response.json()}")
        else:
            print(f"❌ Health Check fehlgeschlagen: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check Fehler: {e}")
    
    # Test 2: Barcode AI APIs
    print("\n🔍 Teste Barcode AI APIs...")
    barcode_endpoints = [
        "/api/ai/barcode/health",
        "/api/ai/barcode/suggestions",
        "/api/ai/barcode/stats"
    ]
    
    for endpoint in barcode_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {endpoint} erfolgreich")
                data = response.json()
                print(f"   Daten: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ {endpoint} fehlgeschlagen: {response.status_code}")
                print(f"   Antwort: {response.text}")
        except Exception as e:
            print(f"❌ {endpoint} Fehler: {e}")
    
    # Test 3: Inventory AI APIs
    print("\n📦 Teste Inventory AI APIs...")
    inventory_endpoints = [
        "/api/ai/inventory/health",
        "/api/ai/inventory/suggestions",
        "/api/ai/inventory/analytics"
    ]
    
    for endpoint in inventory_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {endpoint} erfolgreich")
                data = response.json()
                print(f"   Daten: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ {endpoint} fehlgeschlagen: {response.status_code}")
                print(f"   Antwort: {response.text}")
        except Exception as e:
            print(f"❌ {endpoint} Fehler: {e}")
    
    # Test 4: Voucher AI APIs
    print("\n🎫 Teste Voucher AI APIs...")
    voucher_endpoints = [
        "/api/ai/voucher/health",
        "/api/ai/voucher/optimizations",
        "/api/ai/voucher/analytics",
        "/api/ai/voucher/segments"
    ]
    
    for endpoint in voucher_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {endpoint} erfolgreich")
                data = response.json()
                print(f"   Daten: {json.dumps(data, indent=2, ensure_ascii=False)}")
            else:
                print(f"❌ {endpoint} fehlgeschlagen: {response.status_code}")
                print(f"   Antwort: {response.text}")
        except Exception as e:
            print(f"❌ {endpoint} Fehler: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 AI-API-Tests abgeschlossen")

if __name__ == "__main__":
    test_ai_apis() 