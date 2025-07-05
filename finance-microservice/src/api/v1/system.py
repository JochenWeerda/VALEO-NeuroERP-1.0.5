from fastapi import APIRouter, Query, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import PlainTextResponse, FileResponse, JSONResponse
import prometheus_client
import tempfile
import os
from datetime import datetime
from typing import Optional, List, Dict, Any

router = APIRouter()

@router.get("/health", summary="Health-Check", tags=["System"])
def health_check():
    # Hier können weitere Checks (DB, Cache, externe Services) ergänzt werden
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "service": "finance-module"}

@router.get("/metrics", summary="Prometheus-Metriken", tags=["Monitoring"])
def metrics():
    data = prometheus_client.generate_latest()
    return PlainTextResponse(data, media_type="text/plain")

# --- Konten-API ---
@router.get("/accounts", summary="Kontenliste abrufen", tags=["Konten"])
def get_accounts(
    active_only: bool = Query(True, description="Nur aktive Konten anzeigen"),
    category: Optional[str] = Query(None, description="Kontenkategorie filtern")
):
    """Gibt eine Liste aller Konten zurück, optional gefiltert nach Kategorie."""
    # Dummy-Daten für Demonstrationszwecke
    accounts = [
        {"id": "1000", "name": "Kasse", "category": "asset", "active": True},
        {"id": "1200", "name": "Bank", "category": "asset", "active": True},
        {"id": "1400", "name": "Forderungen", "category": "asset", "active": True},
        {"id": "1600", "name": "Anlagevermögen", "category": "asset", "active": True},
        {"id": "3000", "name": "Verbindlichkeiten", "category": "liability", "active": True},
        {"id": "4000", "name": "Umsatzerlöse", "category": "revenue", "active": True},
        {"id": "5000", "name": "Materialaufwand", "category": "expense", "active": True},
        {"id": "6000", "name": "Personalaufwand", "category": "expense", "active": True},
        {"id": "9999", "name": "Altkonto (inaktiv)", "category": "expense", "active": False}
    ]
    
    # Filterung anwenden
    if active_only:
        accounts = [acc for acc in accounts if acc["active"]]
    
    if category:
        accounts = [acc for acc in accounts if acc["category"] == category]
        
    return {"accounts": accounts, "count": len(accounts)}

@router.get("/accounts/{account_id}", summary="Kontodetails abrufen", tags=["Konten"])
def get_account(account_id: str):
    """Gibt die Details eines einzelnen Kontos zurück."""
    # Dummy-Daten
    account = {
        "id": account_id,
        "name": f"Konto {account_id}",
        "category": "asset" if int(account_id) < 2000 else "expense",
        "active": True,
        "balance": 1250.00,
        "created_at": "2024-01-01T00:00:00Z",
        "last_transaction": "2025-05-15T14:30:00Z"
    }
    return account

# --- Transaktionen-API ---
@router.get("/transactions", summary="Transaktionsliste abrufen", tags=["Transaktionen"])
def get_transactions(
    start_date: Optional[str] = Query(None, description="Startdatum (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Enddatum (YYYY-MM-DD)"),
    account_id: Optional[str] = Query(None, description="Konto-ID")
):
    """Gibt eine Liste von Transaktionen zurück, optional gefiltert nach Datum und Konto."""
    # Dummy-Daten
    transactions = [
        {
            "id": "tx1001",
            "date": "2025-05-01",
            "description": "Warenverkauf",
            "amount": 1200.00,
            "debit_account": "1200",
            "credit_account": "4000"
        },
        {
            "id": "tx1002",
            "date": "2025-05-15",
            "description": "Materialeinkauf",
            "amount": 500.00,
            "debit_account": "5000",
            "credit_account": "1200"
        },
        {
            "id": "tx1003",
            "date": "2025-05-20",
            "description": "Mietzahlung",
            "amount": 800.00,
            "debit_account": "6000",
            "credit_account": "1200"
        }
    ]
    
    # Filterung
    if account_id:
        transactions = [tx for tx in transactions if tx["debit_account"] == account_id or tx["credit_account"] == account_id]
    
    return {"transactions": transactions, "count": len(transactions)}

# --- Dokumente-API ---
@router.get("/documents", summary="Dokumentenliste abrufen", tags=["Dokumente"])
def get_documents(
    document_type: Optional[str] = Query(None, description="Dokumententyp")
):
    """Gibt eine Liste von Dokumenten zurück, optional gefiltert nach Typ."""
    # Dummy-Daten
    documents = [
        {
            "id": "doc1001",
            "type": "invoice",
            "date": "2025-05-01",
            "description": "Ausgangsrechnung 2025-001",
            "filename": "RE_2025_001.pdf"
        },
        {
            "id": "doc1002",
            "type": "receipt",
            "date": "2025-05-15",
            "description": "Quittung Materialeinkauf",
            "filename": "Quittung_20250515.pdf"
        }
    ]
    
    # Filterung
    if document_type:
        documents = [doc for doc in documents if doc["type"] == document_type]
    
    return {"documents": documents, "count": len(documents)}

# --- DATEV-Export ---
@router.get("/api/datev/export", summary="DATEV-Export", tags=["DATEV"])
def datev_export(
    start_date: str = Query(..., description="Startdatum (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Enddatum (YYYY-MM-DD)"),
    mandant: str = Query("Hauptmandant", description="Mandantenname"),
    export_type: str = Query("Buchungen", description="Exporttyp (Buchungen, Stammdaten, etc.)")
):
    # Dummy-Exportdatei erzeugen (CSV im DATEV-Stil)
    content = f"Buchungsstapel;Mandant:{mandant};Zeitraum:{start_date} bis {end_date}\n"
    content += "Belegdatum;Buchungstext;Betrag;Sollkonto;Habenkonto\n"
    content += f"{start_date};Testbuchung;100,00;1200;1000\n"
    content += f"{end_date};Testbuchung2;200,00;1200;1000\n"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    tmp.write(content.encode("utf-8"))
    tmp.close()
    filename = f"DATEV_Export_{mandant}_{start_date}_{end_date}.csv"
    return FileResponse(tmp.name, filename=filename, media_type="text/csv")

# --- ELSTER-Übermittlung (ECHT mit ECTElster) ---
@router.post("/api/elster/send", summary="ELSTER-Übermittlung (ECHT)", tags=["ELSTER"])
def elster_send(
    steuerart: str = Form(..., description="Steuerart (UStVA, EÜR, etc.)"),
    jahr: int = Form(..., description="Jahr"),
    zeitraum: str = Form(..., description="Zeitraum (z.B. 01-03)"),
    zertifikat: UploadFile = File(..., description="Elster-Zertifikat (pfx)"),
    pin: str = Form(..., description="Zertifikat-PIN"),
    data: str = Form(..., description="Steuerdaten als JSON-String")
):
    try:
        import json
        from ECTElster import Elster
        # Zertifikat temporär speichern
        cert_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pfx")
        cert_temp.write(zertifikat.file.read())
        cert_temp.close()
        # Steuerdaten laden
        steuerdaten = json.loads(data)
        # ECTElster-Objekt initialisieren
        elster = Elster(
            pfx_path=cert_temp.name,
            pin=pin,
            debug=True
        )
        # Übermittlung je nach Steuerart
        if steuerart.upper() == "USTVA":
            response = elster.send_ustva(
                jahr=jahr,
                zeitraum=zeitraum,
                ustva_data=steuerdaten
            )
        elif steuerart.upper() == "EÜR":
            response = elster.send_euer(
                jahr=jahr,
                euer_data=steuerdaten
            )
        elif steuerart.upper() == "ZM":
            response = elster.send_zm(
                jahr=jahr,
                zm_data=steuerdaten
            )
        else:
            return JSONResponse(status_code=400, content={"status": "error", "meldung": f"Steuerart {steuerart} nicht unterstützt."})
        # Quittung/Status zurückgeben
        return JSONResponse(content={
            "status": "erfolgreich",
            "elster_response": response
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "meldung": str(e)})
    finally:
        try:
            os.unlink(cert_temp.name)
        except Exception:
            pass

# --- Berichte-API ---
@router.get("/reports/balance-sheet", summary="Bilanz generieren", tags=["Berichte"])
def generate_balance_sheet(
    date: str = Query(..., description="Stichtag (YYYY-MM-DD)")
):
    """Generiert eine Bilanz zum angegebenen Stichtag."""
    # Dummy-Daten
    balance_sheet = {
        "date": date,
        "generated_at": datetime.now().isoformat(),
        "assets": {
            "current_assets": {
                "cash": 5000.00,
                "bank": 25000.00,
                "receivables": 15000.00,
                "total": 45000.00
            },
            "fixed_assets": {
                "equipment": 20000.00,
                "vehicles": 30000.00,
                "buildings": 150000.00,
                "total": 200000.00
            },
            "total": 245000.00
        },
        "liabilities": {
            "current_liabilities": {
                "payables": 10000.00,
                "taxes": 5000.00,
                "total": 15000.00
            },
            "long_term_liabilities": {
                "loans": 100000.00,
                "total": 100000.00
            },
            "equity": {
                "capital": 100000.00,
                "retained_earnings": 30000.00,
                "total": 130000.00
            },
            "total": 245000.00
        }
    }
    return balance_sheet

@router.get("/reports/income-statement", summary="Gewinn- und Verlustrechnung", tags=["Berichte"])
def generate_income_statement(
    start_date: str = Query(..., description="Startdatum (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Enddatum (YYYY-MM-DD)")
):
    """Generiert eine GuV für den angegebenen Zeitraum."""
    # Dummy-Daten
    income_statement = {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "generated_at": datetime.now().isoformat(),
        "revenue": {
            "sales": 120000.00,
            "other_income": 5000.00,
            "total": 125000.00
        },
        "expenses": {
            "cost_of_goods_sold": 50000.00,
            "personnel": 30000.00,
            "rent": 10000.00,
            "utilities": 5000.00,
            "depreciation": 10000.00,
            "other_expenses": 5000.00,
            "total": 110000.00
        },
        "profit_before_tax": 15000.00,
        "taxes": 3000.00,
        "net_profit": 12000.00
    }
    return income_statement 