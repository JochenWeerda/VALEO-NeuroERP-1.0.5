# Einfacher Finance-Server

Diese Anleitung zeigt Ihnen, wie Sie den einfachen Finance-Server verwenden können, um die Funktionalität des Finance-Microservice ohne Docker oder FastAPI zu testen.

## Voraussetzungen

- Python 3.6 oder höher
- Standardbibliotheken von Python (keine externen Abhängigkeiten erforderlich)

## Server starten

1. Navigieren Sie zum Verzeichnis mit dem Server:

```powershell
cd C:\AI_driven_ERP\AI_driven_ERP
```

2. Starten Sie den Server:

```powershell
python simple_finance_server.py
```

Der Server startet auf Port 8005 und ist unter http://localhost:8005 erreichbar.

## Verfügbare Endpunkte

Sie können die folgenden Endpunkte im Browser testen:

- **Gesundheitsstatus**: http://localhost:8005/health
- **Konten**: http://localhost:8005/api/v1/accounts
- **Konto mit ID 1**: http://localhost:8005/api/v1/accounts/1
- **Transaktionen**: http://localhost:8005/api/v1/transactions
- **Transaktion mit ID 1**: http://localhost:8005/api/v1/transactions/1
- **Dokumente**: http://localhost:8005/api/v1/documents
- **Dokument mit ID 1**: http://localhost:8005/api/v1/documents/1
- **Dashboard**: http://localhost:8005/api/v1/dashboard
- **LLM-Transaktionsvorschlag**: http://localhost:8005/api/v1/llm/suggest_transaction

## Verwendung in einem Browser

1. Öffnen Sie einen Webbrowser
2. Navigieren Sie zu einem der oben genannten Endpunkte
3. Der Server liefert die Daten im JSON-Format zurück

## Beenden des Servers

Um den Server zu beenden, drücken Sie STRG+C in der Konsole, in der der Server läuft. 