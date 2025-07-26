#!/usr/bin/env python3
"""
VALEO NeuroERP - Einfacher AI-API-Test
Testet die AI-APIs direkt ohne Backend-Server
"""
import requests
import json
import time

def test_simple():
    """Einfacher Test der AI-APIs"""
    base_url = "http://localhost:8000"
    
    print("🧪 VALEO NeuroERP - Einfacher AI-API-Test")
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
    
    # Test 2: Barcode AI Health
    print("\n🔍 Teste Barcode AI Health...")
    try:
        response = requests.get(f"{base_url}/api/ai/barcode/health")
        if response.status_code == 200:
            print("✅ Barcode AI Health erfolgreich")
            print(f"   Antwort: {response.json()}")
        else:
            print(f"❌ Barcode AI Health fehlgeschlagen: {response.status_code}")
            print(f"   Antwort: {response.text}")
    except Exception as e:
        print(f"❌ Barcode AI Health Fehler: {e}")
    
    # Test 3: Barcode Suggestions
    print("\n📋 Teste Barcode Suggestions...")
    try:
        response = requests.get(f"{base_url}/api/ai/barcode/suggestions")
        if response.status_code == 200:
            print("✅ Barcode Suggestions erfolgreich")
            data = response.json()
            print(f"   Anzahl Vorschläge: {len(data.get('data', []))}")
            print(f"   Erste Vorschläge: {json.dumps(data.get('data', [])[:2], indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Barcode Suggestions fehlgeschlagen: {response.status_code}")
            print(f"   Antwort: {response.text}")
    except Exception as e:
        print(f"❌ Barcode Suggestions Fehler: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Einfacher AI-API-Test abgeschlossen")

if __name__ == "__main__":
    test_simple() 