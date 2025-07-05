from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime, date
import uvicorn
import json
import uuid
import logging
from enum import Enum

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App erstellen
app = FastAPI(
    title="Finance Microservice",
    description="Finance Microservice mit LLM-Integration für das AI-gesteuerte ERP-System",
    version="1.0.0",
)

# CORS Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Datenmodelle ---

class Steuersatz(BaseModel):
    id: str
    bezeichnung: str
    prozentsatz: float
    gueltig_ab: date
    gueltig_bis: Optional[date] = None

class Konto(BaseModel):
    id: str
    kontonummer: str
    bezeichnung: str
    kontenart: str
    steuerrelevant: bool
    steuersatz_id: Optional[str] = None
    parent_konto_id: Optional[str] = None
    saldo: float = 0.0
    created_at: datetime
    updated_at: datetime

class BuchungArt(str, Enum):
    EINNAHME = "EINNAHME"
    AUSGABE = "AUSGABE"
    UMBUCHUNG = "UMBUCHUNG"

class Buchung(BaseModel):
    id: str
    buchungsnummer: str
    buchungstext: str
    buchungsdatum: date
    buchungsart: BuchungArt
    betrag: float
    quell_konto_id: str
    ziel_konto_id: str
    beleg_id: Optional[str] = None
    steuersatz_id: Optional[str] = None
    steueranteil: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class Beleg(BaseModel):
    id: str
    belegnummer: str
    belegdatum: date
    beschreibung: str
    betrag: float
    datei_pfad: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class LLMRequest(BaseModel):
    prompt: str
    options: Optional[Dict[str, Any]] = None

class LLMResponse(BaseModel):
    result: Any
    processing_time: float
    model_used: str
    token_count: Optional[int] = None

# --- Demo-Daten ---

# Demo Steuersätze
steuersaetze = [
    Steuersatz(
        id="st-1",
        bezeichnung="Normaler Steuersatz",
        prozentsatz=19.0,
        gueltig_ab=date(2020, 1, 1)
    ),
    Steuersatz(
        id="st-2",
        bezeichnung="Reduzierter Steuersatz",
        prozentsatz=7.0,
        gueltig_ab=date(2020, 1, 1)
    ),
    Steuersatz(
        id="st-3",
        bezeichnung="Keine Steuer",
        prozentsatz=0.0,
        gueltig_ab=date(2020, 1, 1)
    )
]

# Demo Konten
konten = [
    Konto(
        id="k-1",
        kontonummer="1000",
        bezeichnung="Bankkonto",
        kontenart="Aktivkonto",
        steuerrelevant=False,
        saldo=10000.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Konto(
        id="k-2",
        kontonummer="4000",
        bezeichnung="Umsatzerlöse 19%",
        kontenart="Ertragskonto",
        steuerrelevant=True,
        steuersatz_id="st-1",
        saldo=0.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Konto(
        id="k-3",
        kontonummer="4100",
        bezeichnung="Umsatzerlöse 7%",
        kontenart="Ertragskonto",
        steuerrelevant=True,
        steuersatz_id="st-2",
        saldo=0.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Konto(
        id="k-4",
        kontonummer="5000",
        bezeichnung="Materialaufwand",
        kontenart="Aufwandskonto",
        steuerrelevant=True,
        steuersatz_id="st-1",
        saldo=0.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
]

# Demo Belege
belege = [
    Beleg(
        id="b-1",
        belegnummer="B-2023-001",
        belegdatum=date(2023, 1, 15),
        beschreibung="Rechnung Büromaterial",
        betrag=119.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Beleg(
        id="b-2",
        belegnummer="B-2023-002",
        belegdatum=date(2023, 2, 20),
        beschreibung="Kundenrechnung XYZ GmbH",
        betrag=595.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
]

# Demo Buchungen
buchungen = [
    Buchung(
        id="bu-1",
        buchungsnummer="BU-2023-001",
        buchungstext="Einkauf Büromaterial",
        buchungsdatum=date(2023, 1, 15),
        buchungsart=BuchungArt.AUSGABE,
        betrag=100.0,
        quell_konto_id="k-1",
        ziel_konto_id="k-4",
        beleg_id="b-1",
        steuersatz_id="st-1",
        steueranteil=19.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    ),
    Buchung(
        id="bu-2",
        buchungsnummer="BU-2023-002",
        buchungstext="Verkauf an XYZ GmbH",
        buchungsdatum=date(2023, 2, 20),
        buchungsart=BuchungArt.EINNAHME,
        betrag=500.0,
        quell_konto_id="k-2",
        ziel_konto_id="k-1",
        beleg_id="b-2",
        steuersatz_id="st-1",
        steueranteil=95.0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
]

# --- API-Routen ---

@app.get("/health")
async def health_check():
    """Gesundheitscheck für den Service"""
    return {
        "status": "ok",
        "service": "finance-microservice",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/konten", response_model=List[Konto])
async def get_konten():
    """Alle Konten abrufen"""
    return konten

@app.get("/api/v1/konten/{konto_id}", response_model=Konto)
async def get_konto(konto_id: str):
    """Ein Konto basierend auf ID abrufen"""
    for konto in konten:
        if konto.id == konto_id:
            return konto
    raise HTTPException(status_code=404, detail="Konto nicht gefunden")

@app.get("/api/v1/buchungen", response_model=List[Buchung])
async def get_buchungen():
    """Alle Buchungen abrufen"""
    return buchungen

@app.get("/api/v1/buchungen/{buchung_id}", response_model=Buchung)
async def get_buchung(buchung_id: str):
    """Eine Buchung basierend auf ID abrufen"""
    for buchung in buchungen:
        if buchung.id == buchung_id:
            return buchung
    raise HTTPException(status_code=404, detail="Buchung nicht gefunden")

@app.get("/api/v1/belege", response_model=List[Beleg])
async def get_belege():
    """Alle Belege abrufen"""
    return belege

@app.get("/api/v1/belege/{beleg_id}", response_model=Beleg)
async def get_beleg(beleg_id: str):
    """Einen Beleg basierend auf ID abrufen"""
    for beleg in belege:
        if beleg.id == beleg_id:
            return beleg
    raise HTTPException(status_code=404, detail="Beleg nicht gefunden")

@app.get("/api/v1/steuersaetze", response_model=List[Steuersatz])
async def get_steuersaetze():
    """Alle Steuersätze abrufen"""
    return steuersaetze

@app.get("/api/v1/steuersaetze/{steuersatz_id}", response_model=Steuersatz)
async def get_steuersatz(steuersatz_id: str):
    """Einen Steuersatz basierend auf ID abrufen"""
    for steuersatz in steuersaetze:
        if steuersatz.id == steuersatz_id:
            return steuersatz
    raise HTTPException(status_code=404, detail="Steuersatz nicht gefunden")

# --- LLM-Integration ---

@app.post("/api/v1/llm/buchungsvorschlag", response_model=LLMResponse)
async def generate_buchungsvorschlag(request: LLMRequest):
    """Generiert einen Buchungsvorschlag basierend auf einer Belegbeschreibung"""
    # Hier würde normalerweise der LLM-Aufruf stattfinden
    # In dieser Demo wird ein Mock-Ergebnis zurückgegeben
    import time
    import random
    
    # Simuliere Verarbeitungszeit
    time.sleep(0.5)
    
    # Kategorien für Vorschläge basierend auf Schlüsselwörtern im Prompt
    prompt_lower = request.prompt.lower()
    
    if "büro" in prompt_lower or "material" in prompt_lower:
        vorgeschlagenes_konto = "k-4"  # Materialaufwand
        vorgeschlagene_buchungsart = BuchungArt.AUSGABE
    elif "verkauf" in prompt_lower or "kunde" in prompt_lower or "rechnung" in prompt_lower:
        vorgeschlagenes_konto = "k-2"  # Umsatzerlöse 19%
        vorgeschlagene_buchungsart = BuchungArt.EINNAHME
    else:
        # Fallback
        vorgeschlagenes_konto = random.choice(["k-2", "k-3", "k-4"])
        vorgeschlagene_buchungsart = random.choice([BuchungArt.EINNAHME, BuchungArt.AUSGABE])
    
    # Zugehöriges Konto finden
    vorgeschlagenes_konto_details = next((k for k in konten if k.id == vorgeschlagenes_konto), None)
    
    result = {
        "vorgeschlagene_buchung": {
            "buchungstext": f"Auto-generiert: {request.prompt}",
            "buchungsart": vorgeschlagene_buchungsart,
            "vorgeschlagenes_konto": {
                "id": vorgeschlagenes_konto,
                "kontonummer": vorgeschlagenes_konto_details.kontonummer if vorgeschlagenes_konto_details else "unbekannt",
                "bezeichnung": vorgeschlagenes_konto_details.bezeichnung if vorgeschlagenes_konto_details else "unbekannt"
            },
            "confidence_score": random.uniform(0.75, 0.98)
        }
    }
    
    return LLMResponse(
        result=result,
        processing_time=0.5,
        model_used="finance-llm-mock",
        token_count=random.randint(50, 150)
    )

@app.post("/api/v1/llm/beleganalyse", response_model=LLMResponse)
async def analyse_beleg(request: LLMRequest):
    """Analysiert einen Beleg und extrahiert relevante Informationen"""
    # Mock-Implementierung für die Demo
    import time
    import random
    
    # Simuliere Verarbeitungszeit
    time.sleep(0.8)
    
    # Zufällige Werte für die Demo
    betrag = round(random.uniform(50, 1000), 2)
    
    # Datum zwischen 2023-01-01 und heute
    heute = date.today()
    tage_seit_jahresanfang = (heute - date(2023, 1, 1)).days
    zufaelliger_tag = random.randint(0, tage_seit_jahresanfang)
    belegdatum = date(2023, 1, 1) + datetime.timedelta(days=zufaelliger_tag)
    
    # Extrahiere den Verkäufer/Käufer aus dem Prompt, falls vorhanden
    prompt_lower = request.prompt.lower()
    haendler = None
    
    if "von" in prompt_lower:
        teile = prompt_lower.split("von")
        if len(teile) > 1:
            haendler = teile[1].strip().split()[0].capitalize()
    
    if not haendler and "für" in prompt_lower:
        teile = prompt_lower.split("für")
        if len(teile) > 1:
            haendler = teile[1].strip().split()[0].capitalize()
    
    if not haendler:
        haendler = random.choice(["Muster GmbH", "TechCorp", "Büromarkt", "IT-Service"])
    
    # Erstelle ein Analyse-Ergebnis
    result = {
        "extrahierte_daten": {
            "haendler": haendler,
            "datum": belegdatum.isoformat(),
            "betrag": betrag,
            "mwst_betrag": round(betrag * 0.19, 2),
            "mwst_prozent": 19,
            "waehrung": "EUR",
            "enthaltene_posten": [
                {
                    "bezeichnung": f"Posten {i+1}",
                    "einzelpreis": round(random.uniform(10, 100), 2),
                    "anzahl": random.randint(1, 5)
                } for i in range(random.randint(1, 3))
            ]
        },
        "confidence_score": random.uniform(0.70, 0.95)
    }
    
    return LLMResponse(
        result=result,
        processing_time=0.8,
        model_used="document-analysis-mock",
        token_count=random.randint(100, 300)
    )

@app.post("/api/v1/llm/anomalieerkennung", response_model=LLMResponse)
async def erkennung_anomalien(request: LLMRequest):
    """Erkennt Anomalien in Finanzdaten"""
    # Mock-Implementierung für die Demo
    import time
    import random
    
    # Simuliere Verarbeitungszeit
    time.sleep(1.2)
    
    # Generiere zufällige "Anomalien" für die Demo
    anzahl_anomalien = random.randint(0, 3)
    anomalien = []
    
    anomalie_arten = [
        "Ungewöhnlich hoher Betrag für diese Kontokategorie",
        "Abweichung vom historischen Durchschnitt",
        "Verdächtige Buchungsfrequenz",
        "Rundbeträge (potenzielle manuelle Buchung)",
        "Buchung an unüblichem Wochentag/Uhrzeit"
    ]
    
    kontexte = [
        "in den letzten Einkäufen",
        "verglichen mit ähnlichen Unternehmen",
        "im Jahresvergleich",
        "bezogen auf den Branchendurchschnitt",
        "im Kontext saisonaler Schwankungen"
    ]
    
    for _ in range(anzahl_anomalien):
        anomalien.append({
            "beschreibung": random.choice(anomalie_arten),
            "kontext": random.choice(kontexte),
            "severity": random.choice(["niedrig", "mittel", "hoch"]),
            "confidence_score": round(random.uniform(0.6, 0.95), 2)
        })
    
    result = {
        "gefundene_anomalien": anomalien,
        "gesamtbewertung": "normal" if not anomalien else (
            "verdächtig" if any(a["severity"] == "hoch" for a in anomalien) else "auffällig"
        )
    }
    
    return LLMResponse(
        result=result,
        processing_time=1.2,
        model_used="anomaly-detection-mock",
        token_count=random.randint(200, 500)
    )

@app.get("/api/v1/dashboard")
async def get_dashboard():
    """Dashboard-Daten für den Finance-Microservice"""
    import random
    
    # Aktueller Monat und Jahr
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Zufällige Finanzdaten für das Dashboard
    monthly_revenue = [round(random.uniform(5000, 15000), 2) for _ in range(6)]
    monthly_expenses = [round(random.uniform(3000, 10000), 2) for _ in range(6)]
    
    # Die letzten 6 Monate
    months = []
    for i in range(5, -1, -1):
        month_num = ((current_month - i - 1) % 12) + 1
        year = current_year if month_num <= current_month else current_year - 1
        month_name = [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"
        ][month_num - 1]
        months.append(f"{month_name} {year}")
    
    return {
        "uebersicht": {
            "gesamtumsatz_jahr": sum(monthly_revenue),
            "gesamtausgaben_jahr": sum(monthly_expenses),
            "gewinn_jahr": sum(monthly_revenue) - sum(monthly_expenses),
            "offene_rechnungen": random.randint(3, 10),
            "zahlungsrueckstaende": round(random.uniform(1000, 5000), 2)
        },
        "monatstrend": {
            "monate": months,
            "umsaetze": monthly_revenue,
            "ausgaben": monthly_expenses
        },
        "top_konten_nach_umsatz": [
            {"konto": konten[1].bezeichnung, "betrag": round(random.uniform(2000, 8000), 2)},
            {"konto": konten[2].bezeichnung, "betrag": round(random.uniform(1000, 4000), 2)},
            {"konto": "Dienstleistungen", "betrag": round(random.uniform(500, 3000), 2)}
        ],
        "top_konten_nach_ausgaben": [
            {"konto": konten[3].bezeichnung, "betrag": round(random.uniform(1500, 5000), 2)},
            {"konto": "Personalkosten", "betrag": round(random.uniform(3000, 7000), 2)},
            {"konto": "Miete und Nebenkosten", "betrag": round(random.uniform(800, 2000), 2)}
        ],
        "steuern": {
            "umsatzsteuer_laufendes_quartal": round(random.uniform(800, 3000), 2),
            "vorsteuer_laufendes_quartal": round(random.uniform(500, 2000), 2),
            "zu_zahlende_ust": round(random.uniform(300, 1000), 2)
        },
        "letzte_aktivitaeten": [
            {
                "datum": (datetime.now() - datetime.timedelta(days=random.randint(0, 14))).strftime("%Y-%m-%d"),
                "beschreibung": f"Buchung: {b.buchungstext}",
                "betrag": b.betrag
            } for b in buchungen
        ] + [
            {
                "datum": (datetime.now() - datetime.timedelta(days=random.randint(0, 14))).strftime("%Y-%m-%d"),
                "beschreibung": f"Neuer Beleg: {be.beschreibung}",
                "betrag": be.betrag
            } for be in belege
        ]
    }

# --- Server starten ---
if __name__ == "__main__":
    port = 8005
    print(f"Finance-Microservice wird auf Port {port} gestartet...")
    print(f"API verfügbar unter: http://localhost:{port}")
    print(f"API-Dokumentation: http://localhost:{port}/docs")
    print(f"Health-Endpoint: http://localhost:{port}/health")
    uvicorn.run(app, host="0.0.0.0", port=port) 