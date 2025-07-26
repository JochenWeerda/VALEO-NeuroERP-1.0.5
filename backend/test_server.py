#!/usr/bin/env python3
"""
Einfacher Test-Server für VALEO NeuroERP MCP Integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# FastAPI App erstellen
app = FastAPI(
    title="VALEO NeuroERP Test Server",
    description="Test-Server für MCP Integration",
    version="1.0.0"
)

# CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root-Endpunkt"""
    return {
        "message": "VALEO NeuroERP Test Server",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health-Check"""
    return {
        "status": "healthy",
        "service": "VALEO NeuroERP Test Server"
    }

@app.get("/api/tables")
async def list_tables():
    """Mock-Tabellen auflisten"""
    return {
        "tables": [
            "invoices",
            "customers", 
            "assets",
            "maintenance"
        ]
    }

@app.get("/api/schema/{table_name}")
async def get_table_schema(table_name: str):
    """Mock-Schema für eine Tabelle"""
    if table_name == "invoices":
        return {
            "table": "invoices",
            "columns": [
                {
                    "name": "id",
                    "type": "uuid",
                    "primary": True,
                    "not_null": True,
                    "default": "gen_random_uuid()"
                },
                {
                    "name": "customer_id",
                    "type": "uuid",
                    "primary": False,
                    "not_null": True,
                    "foreign_key": "customers.id"
                },
                {
                    "name": "amount",
                    "type": "numeric",
                    "primary": False,
                    "not_null": True
                },
                {
                    "name": "status",
                    "type": "enum",
                    "primary": False,
                    "not_null": True,
                    "enum_values": ["open", "paid", "overdue"]
                },
                {
                    "name": "notes",
                    "type": "text",
                    "primary": False,
                    "not_null": False
                },
                {
                    "name": "created_at",
                    "type": "timestamp",
                    "primary": False,
                    "not_null": True,
                    "default": "now()"
                }
            ],
            "rls": {
                "select": True,
                "insert": True,
                "update": True,
                "delete": False
            }
        }
    elif table_name == "customers":
        return {
            "table": "customers",
            "columns": [
                {
                    "name": "id",
                    "type": "uuid",
                    "primary": True,
                    "not_null": True,
                    "default": "gen_random_uuid()"
                },
                {
                    "name": "name",
                    "type": "text",
                    "primary": False,
                    "not_null": True
                },
                {
                    "name": "email",
                    "type": "text",
                    "primary": False,
                    "not_null": True
                },
                {
                    "name": "phone",
                    "type": "text",
                    "primary": False,
                    "not_null": False
                }
            ],
            "rls": {
                "select": True,
                "insert": True,
                "update": True,
                "delete": True
            }
        }
    else:
        return {
            "table": table_name,
            "columns": [],
            "rls": {
                "select": True,
                "insert": True,
                "update": True,
                "delete": True
            }
        }

if __name__ == "__main__":
    print("🚀 Starte VALEO NeuroERP Test Server...")
    print("📋 Verfügbare Endpunkte:")
    print("   - GET /api/health")
    print("   - GET /api/tables")
    print("   - GET /api/schema/{table_name}")
    print("🌐 Server läuft auf: http://localhost:8000")
    
    uvicorn.run(app, host="0.0.0.0", port=8000) 