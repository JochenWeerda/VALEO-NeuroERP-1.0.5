# Finance-Service Tester

Diese Anleitung zeigt Ihnen, wie Sie den Finance-Service-Tester verwenden können, um die Funktionalität des Finance-Microservice ohne Docker zu testen.

## Voraussetzungen

- Python 3.8 oder höher
- Die folgenden Python-Bibliotheken:
  - fastapi
  - uvicorn
  - pydantic

## Installation der Abhängigkeiten

Führen Sie den folgenden Befehl aus, um die benötigten Abhängigkeiten zu installieren:

```powershell
pip install fastapi uvicorn pydantic
```

## Tester starten

1. Navigieren Sie zum Verzeichnis mit dem Tester:

```powershell
cd C:\AI_driven_ERP\AI_driven_ERP
```

2. Starten Sie den Tester:

```powershell
python finance_service_tester.py
```

Der Server startet auf Port 8005 und ist unter http://localhost:8005 erreichbar.

## Verfügbare Endpunkte

Sie können die folgenden Endpunkte testen:

- **API-Dokumentation**: http://localhost:8005/docs
- **Gesundheitsstatus**: http://localhost:8005/health
- **Konten**: http://localhost:8005/api/v1/accounts
- **Transaktionen**: http://localhost:8005/api/v1/transactions
- **Dokumente**: http://localhost:8005/api/v1/documents
- **Dashboard**: http://localhost:8005/api/v1/dashboard
- **LLM-Transaktionsvorschlag**: http://localhost:8005/api/v1/llm/suggest_transaction

## Verwendung in einem Browser

1. Öffnen Sie einen Webbrowser
2. Navigieren Sie zu einem der oben genannten Endpunkte
3. Der Server liefert die Daten im JSON-Format zurück

## Verwendung mit Swagger UI

1. Öffnen Sie einen Webbrowser
2. Navigieren Sie zur API-Dokumentation: http://localhost:8005/docs
3. Die Swagger UI zeigt alle verfügbaren Endpunkte mit Dokumentation an
4. Sie können Endpunkte direkt über die Swagger UI testen

## Beenden des Testers

Um den Tester zu beenden, drücken Sie STRG+C in der Konsole, in der der Server läuft. 