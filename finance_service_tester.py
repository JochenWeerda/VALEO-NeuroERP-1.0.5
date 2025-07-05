#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Finance-Microservice Tester
Diese Anwendung testet die Funktionalität des Finance-Microservice ohne Docker.
"""

import os
import sys
import json
import time
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Erstelle FastAPI-Anwendung
app = FastAPI(
    title="Finance-Microservice Tester",
    description="Einfacher Tester für den Finance-Microservice",
    version="1.0.0"
)

# CORS-Konfiguration hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Beispieldaten
ACCOUNTS = [
    {"id": 1, "name": "Bank", "account_type": "Asset", "balance": 10000.00},
    {"id": 2, "name": "Kasse", "account_type": "Asset", "balance": 500.00},
    {"id": 3, "name": "Umsatzerlöse", "account_type": "Revenue", "balance": 0.00},
    {"id": 4, "name": "Büromaterial", "account_type": "Expense", "balance": 0.00},
]

TRANSACTIONS = [
    {
        "id": 1,
        "date": "2023-10-15",
        "description": "Büromaterial Einkauf",
        "entries": [
            {"account_id": 4, "debit": 150.00, "credit": 0.00},
            {"account_id": 1, "debit": 0.00, "credit": 150.00}
        ]
    },
    {
        "id": 2,
        "date": "2023-10-20",
        "description": "Verkauf an Kunde XYZ",
        "entries": [
            {"account_id": 1, "debit": 1000.00, "credit": 0.00},
            {"account_id": 3, "debit": 0.00, "credit": 1000.00}
        ]
    }
]

DOCUMENTS = [
    {
        "id": 1,
        "filename": "rechnung_001.pdf",
        "date": "2023-10-15",
        "document_type": "invoice",
        "related_transaction_id": 2,
        "metadata": {
            "customer": "Kunde XYZ",
            "amount": 1000.00,
            "tax": 190.00
        }
    },
    {
        "id": 2,
        "filename": "quittung_001.pdf",
        "date": "2023-10-15",
        "document_type": "receipt",
        "related_transaction_id": 1,
        "metadata": {
            "vendor": "Bürobedarf GmbH",
            "amount": 150.00,
            "tax": 28.50
        }
    }
]

# API-Endpunkte
@app.get("/health")
async def health_check():
    """Endpunkt zur Überprüfung der Dienstverfügbarkeit"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "finance-microservice-tester",
        "version": "1.0.0"
    }

@app.get("/api/v1/accounts")
async def get_accounts():
    """Alle Konten abrufen"""
    return ACCOUNTS

@app.get("/api/v1/accounts/{account_id}")
async def get_account(account_id: int):
    """Ein bestimmtes Konto abrufen"""
    for account in ACCOUNTS:
        if account["id"] == account_id:
            return account
    raise HTTPException(status_code=404, detail="Konto nicht gefunden")

@app.get("/api/v1/transactions")
async def get_transactions():
    """Alle Transaktionen abrufen"""
    return TRANSACTIONS

@app.get("/api/v1/transactions/{transaction_id}")
async def get_transaction(transaction_id: int):
    """Eine bestimmte Transaktion abrufen"""
    for transaction in TRANSACTIONS:
        if transaction["id"] == transaction_id:
            return transaction
    raise HTTPException(status_code=404, detail="Transaktion nicht gefunden")

@app.get("/api/v1/documents")
async def get_documents():
    """Alle Dokumente abrufen"""
    return DOCUMENTS

@app.get("/api/v1/documents/{document_id}")
async def get_document(document_id: int):
    """Ein bestimmtes Dokument abrufen"""
    for document in DOCUMENTS:
        if document["id"] == document_id:
            return document
    raise HTTPException(status_code=404, detail="Dokument nicht gefunden")

@app.get("/api/v1/dashboard")
async def get_dashboard():
    """Dashboard-Daten abrufen"""
    return {
        "recent_transactions": TRANSACTIONS[:5],
        "account_summary": [
            {"type": "Asset", "total": 10500.00},
            {"type": "Liability", "total": 0.00},
            {"type": "Equity", "total": 9500.00},
            {"type": "Revenue", "total": 1000.00},
            {"type": "Expense", "total": 150.00}
        ],
        "cash_flow": {
            "inflow": 1000.00,
            "outflow": 150.00,
            "net": 850.00
        }
    }

@app.get("/api/v1/llm/suggest_transaction")
async def suggest_transaction():
    """LLM-basierter Vorschlag für eine Transaktion"""
    return {
        "suggestion": {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "description": "Monatliches Hosting für Firmenwebsite",
            "entries": [
                {"account_name": "Hosting-Kosten", "account_type": "Expense", "debit": 29.99, "credit": 0.00},
                {"account_name": "Bank", "account_type": "Asset", "debit": 0.00, "credit": 29.99}
            ]
        },
        "confidence_score": 0.92,
        "explanation": "Basierend auf Ihrem wiederkehrenden Zahlungsmuster für Hosting-Dienste."
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    print(f"Minimaler Server wird gestartet...")
    print(f"Server läuft auf http://localhost:{port}")
    print(f"API-Dokumentation verfügbar unter: http://localhost:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port) 