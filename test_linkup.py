import os
import requests
import json
import time

def test_linkup_search():
    # API-Schlüssel setzen
    os.environ["LINKUP_API_KEY"] = "aca0b877-88dd-4423-a35b-97de39012db9"
    
    # Warten, bis der Server gestartet ist
    print("Warte 3 Sekunden, bis der Server gestartet ist...")
    time.sleep(3)
    
    # Anfrage an den lokalen MCP-Server (mcp-search-linkup läuft standardmäßig auf Port 8000)
    url = "http://localhost:8000/mcp/tool"
    headers = {"Content-Type": "application/json"}
    data = {
        "name": "search",  # Der Name des Tools ist "search" im offiziellen Paket
        "parameters": {
            "query": "Was ist der aktuelle Kurs von Bitcoin?"
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        # Antwort ausgeben
        result = response.json()
        print("Linkup-Suche Ergebnis:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except requests.exceptions.RequestException as e:
        print(f"Fehler bei der Anfrage: {e}")

if __name__ == "__main__":
    test_linkup_search() 