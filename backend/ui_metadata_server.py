#!/usr/bin/env python3
"""
UI Metadata Server für VALEO NeuroERP Dual-MCP-Architektur
Bietet UI/UX-Metadaten für React-Komponenten
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

# FastAPI App erstellen
app = FastAPI(
    title="VALEO NeuroERP UI Metadata Server",
    description="UI/UX Metadata Provider für Dual-MCP-Architektur",
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

# Pydantic Models
class UIFieldMetadata(BaseModel):
    """UI-Feld-Metadaten"""
    field_name: str
    ui_component: str  # text, textarea, select, number, date, etc.
    label: str
    placeholder: Optional[str] = None
    tooltip: Optional[str] = None
    order: int = 999
    required: bool = False
    readonly: bool = False
    hidden: bool = False
    group: Optional[str] = None
    icon: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None

class UITableMetadata(BaseModel):
    """UI-Tabellen-Metadaten"""
    table_name: str
    display_name: str
    description: str
    icon: str
    color: str
    fields: List[UIFieldMetadata]
    actions: List[str]  # create, read, update, delete, export
    default_sort: str
    default_order: str
    page_size: int
    enable_search: bool
    enable_filter: bool
    enable_pagination: bool
    enable_export: bool
    enable_bulk_actions: bool

class UIFormMetadata(BaseModel):
    """UI-Formular-Metadaten"""
    form_name: str
    display_name: str
    description: str
    layout: str  # vertical, horizontal, grid
    submit_button_text: str
    cancel_button_text: str
    show_progress: bool
    auto_save: bool
    validation_mode: str  # onSubmit, onChange, onBlur
    fields: List[UIFieldMetadata]
    groups: Optional[List[Dict[str, Any]]] = None

class CompleteMetadata(BaseModel):
    """Vollständige UI-Metadaten"""
    table_name: str
    table: UITableMetadata
    form: UIFormMetadata

# UI-Metadaten für verschiedene Tabellen
UI_METADATA = {
    "invoices": {
        "table": UITableMetadata(
            table_name="invoices",
            display_name="Rechnungen",
            description="Verwaltung von Kundenrechnungen und Zahlungseingängen",
            icon="receipt",
            color="primary",
            fields=[
                UIFieldMetadata(
                    field_name="id",
                    ui_component="text",
                    label="ID",
                    order=1,
                    readonly=True,
                    hidden=True
                ),
                UIFieldMetadata(
                    field_name="customer_id",
                    ui_component="select",
                    label="Kunde",
                    placeholder="Kunde auswählen",
                    tooltip="Wählen Sie den Kunden für diese Rechnung",
                    order=2,
                    required=True,
                    options=[
                        {"value": "1", "label": "Max Mustermann", "email": "max@example.com"},
                        {"value": "2", "label": "Firma GmbH", "email": "info@firma.de"},
                        {"value": "3", "label": "Test Kunde", "email": "test@example.com"}
                    ],
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="amount",
                    ui_component="number",
                    label="Betrag (€)",
                    placeholder="0.00",
                    tooltip="Rechnungsbetrag in Euro",
                    order=3,
                    required=True,
                    icon="euro"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status",
                    placeholder="Status auswählen",
                    tooltip="Aktueller Status der Rechnung",
                    order=4,
                    required=True,
                    options=[
                        {"value": "open", "label": "Offen", "color": "orange"},
                        {"value": "paid", "label": "Bezahlt", "color": "green"},
                        {"value": "overdue", "label": "Überfällig", "color": "red"}
                    ],
                    icon="status"
                ),
                UIFieldMetadata(
                    field_name="notes",
                    ui_component="textarea",
                    label="Notizen",
                    placeholder="Zusätzliche Informationen...",
                    tooltip="Optionale Notizen zur Rechnung",
                    order=5,
                    required=False,
                    icon="note"
                ),
                UIFieldMetadata(
                    field_name="created_at",
                    ui_component="datetime",
                    label="Erstellt am",
                    order=6,
                    readonly=True,
                    icon="calendar"
                )
            ],
            actions=["create", "read", "update", "delete", "export"],
            default_sort="created_at",
            default_order="desc",
            page_size=20,
            enable_search=True,
            enable_filter=True,
            enable_pagination=True,
            enable_export=True,
            enable_bulk_actions=True
        ),
        "form": UIFormMetadata(
            form_name="invoice_form",
            display_name="Rechnung",
            description="Erstellen oder bearbeiten einer Rechnung",
            layout="vertical",
            submit_button_text="Rechnung speichern",
            cancel_button_text="Abbrechen",
            show_progress=True,
            auto_save=False,
            validation_mode="onSubmit",
            fields=[
                UIFieldMetadata(
                    field_name="customer_id",
                    ui_component="select",
                    label="Kunde *",
                    placeholder="Kunde auswählen",
                    tooltip="Wählen Sie den Kunden für diese Rechnung",
                    order=1,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "1", "label": "Max Mustermann", "email": "max@example.com"},
                        {"value": "2", "label": "Firma GmbH", "email": "info@firma.de"},
                        {"value": "3", "label": "Test Kunde", "email": "test@example.com"}
                    ],
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="amount",
                    ui_component="number",
                    label="Betrag (€) *",
                    placeholder="0.00",
                    tooltip="Rechnungsbetrag in Euro",
                    order=2,
                    required=True,
                    group="basic_info",
                    icon="euro"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status *",
                    placeholder="Status auswählen",
                    tooltip="Aktueller Status der Rechnung",
                    order=3,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "open", "label": "Offen", "color": "orange"},
                        {"value": "paid", "label": "Bezahlt", "color": "green"},
                        {"value": "overdue", "label": "Überfällig", "color": "red"}
                    ],
                    icon="status"
                ),
                UIFieldMetadata(
                    field_name="notes",
                    ui_component="textarea",
                    label="Notizen",
                    placeholder="Zusätzliche Informationen...",
                    tooltip="Optionale Notizen zur Rechnung",
                    order=4,
                    required=False,
                    group="additional_info",
                    icon="note"
                )
            ],
            groups=[
                {
                    "name": "basic_info",
                    "label": "Grundinformationen",
                    "icon": "info",
                    "collapsible": False
                },
                {
                    "name": "additional_info",
                    "label": "Zusätzliche Informationen",
                    "icon": "note",
                    "collapsible": True
                }
            ]
        )
    },
    "customers": {
        "table": UITableMetadata(
            table_name="customers",
            display_name="Kunden",
            description="Kundenverwaltung und Kontaktdaten",
            icon="people",
            color="blue",
            fields=[
                UIFieldMetadata(
                    field_name="id",
                    ui_component="text",
                    label="ID",
                    order=1,
                    readonly=True,
                    hidden=True
                ),
                UIFieldMetadata(
                    field_name="name",
                    ui_component="text",
                    label="Name",
                    placeholder="Kundenname eingeben",
                    order=2,
                    required=True,
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="email",
                    ui_component="email",
                    label="E-Mail",
                    placeholder="email@example.com",
                    order=3,
                    required=True,
                    icon="email"
                ),
                UIFieldMetadata(
                    field_name="phone",
                    ui_component="tel",
                    label="Telefon",
                    placeholder="+49 123 456789",
                    order=4,
                    required=False,
                    icon="phone"
                )
            ],
            actions=["create", "read", "update", "delete", "export"],
            default_sort="name",
            default_order="asc",
            page_size=25,
            enable_search=True,
            enable_filter=True,
            enable_pagination=True,
            enable_export=True,
            enable_bulk_actions=True
        ),
        "form": UIFormMetadata(
            form_name="customer_form",
            display_name="Kunde",
            description="Erstellen oder bearbeiten eines Kunden",
            layout="vertical",
            submit_button_text="Kunde speichern",
            cancel_button_text="Abbrechen",
            show_progress=True,
            auto_save=False,
            validation_mode="onSubmit",
            fields=[
                UIFieldMetadata(
                    field_name="name",
                    ui_component="text",
                    label="Name *",
                    placeholder="Kundenname eingeben",
                    order=1,
                    required=True,
                    group="basic_info",
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="email",
                    ui_component="email",
                    label="E-Mail *",
                    placeholder="email@example.com",
                    order=2,
                    required=True,
                    group="basic_info",
                    icon="email"
                ),
                UIFieldMetadata(
                    field_name="phone",
                    ui_component="tel",
                    label="Telefon",
                    placeholder="+49 123 456789",
                    order=3,
                    required=False,
                    group="contact_info",
                    icon="phone"
                )
            ],
            groups=[
                {
                    "name": "basic_info",
                    "label": "Grundinformationen",
                    "icon": "info",
                    "collapsible": False
                },
                {
                    "name": "contact_info",
                    "label": "Kontaktinformationen",
                    "icon": "contact",
                    "collapsible": True
                }
            ]
        )
    },
    "assets": {
        "table": UITableMetadata(
            table_name="assets",
            display_name="Anlagen",
            description="Anlagenverwaltung und Asset-Tracking",
            icon="build",
            color="green",
            fields=[
                UIFieldMetadata(
                    field_name="anlagennummer",
                    ui_component="text",
                    label="Anlagennummer",
                    order=1,
                    required=True,
                    icon="tag"
                ),
                UIFieldMetadata(
                    field_name="bezeichnung",
                    ui_component="text",
                    label="Bezeichnung",
                    order=2,
                    required=True,
                    icon="label"
                ),
                UIFieldMetadata(
                    field_name="kategoriename",
                    ui_component="select",
                    label="Kategorie",
                    order=3,
                    required=True,
                    options=[
                        {"value": "fahrzeug", "label": "Fahrzeug"},
                        {"value": "maschine", "label": "Maschine"},
                        {"value": "computer", "label": "Computer"},
                        {"value": "möbel", "label": "Möbel"}
                    ],
                    icon="category"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status",
                    order=4,
                    required=True,
                    options=[
                        {"value": "aktiv", "label": "Aktiv", "color": "green"},
                        {"value": "inaktiv", "label": "Inaktiv", "color": "gray"},
                        {"value": "wartung", "label": "Wartung", "color": "orange"},
                        {"value": "defekt", "label": "Defekt", "color": "red"}
                    ],
                    icon="status"
                )
            ],
            actions=["create", "read", "update", "delete", "export"],
            default_sort="anlagennummer",
            default_order="asc",
            page_size=20,
            enable_search=True,
            enable_filter=True,
            enable_pagination=True,
            enable_export=True,
            enable_bulk_actions=True
        ),
        "form": UIFormMetadata(
            form_name="asset_form",
            display_name="Anlage",
            description="Erstellen oder bearbeiten einer Anlage",
            layout="vertical",
            submit_button_text="Anlage speichern",
            cancel_button_text="Abbrechen",
            show_progress=True,
            auto_save=False,
            validation_mode="onSubmit",
            fields=[
                UIFieldMetadata(
                    field_name="anlagennummer",
                    ui_component="text",
                    label="Anlagennummer *",
                    placeholder="AN-2024-001",
                    order=1,
                    required=True,
                    group="basic_info",
                    icon="tag"
                ),
                UIFieldMetadata(
                    field_name="bezeichnung",
                    ui_component="text",
                    label="Bezeichnung *",
                    placeholder="Anlagenbezeichnung",
                    order=2,
                    required=True,
                    group="basic_info",
                    icon="label"
                ),
                UIFieldMetadata(
                    field_name="kategoriename",
                    ui_component="select",
                    label="Kategorie *",
                    placeholder="Kategorie auswählen",
                    order=3,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "fahrzeug", "label": "Fahrzeug"},
                        {"value": "maschine", "label": "Maschine"},
                        {"value": "computer", "label": "Computer"},
                        {"value": "möbel", "label": "Möbel"}
                    ],
                    icon="category"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status *",
                    placeholder="Status auswählen",
                    order=4,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "aktiv", "label": "Aktiv", "color": "green"},
                        {"value": "inaktiv", "label": "Inaktiv", "color": "gray"},
                        {"value": "wartung", "label": "Wartung", "color": "orange"},
                        {"value": "defekt", "label": "Defekt", "color": "red"}
                    ],
                    icon="status"
                )
            ],
            groups=[
                {
                    "name": "basic_info",
                    "label": "Grundinformationen",
                    "icon": "info",
                    "collapsible": False
                }
            ]
        )
    }
}

# API-Endpunkte
@app.get("/")
async def root():
    """Root-Endpunkt"""
    return {
        "message": "VALEO NeuroERP UI Metadata Server",
        "version": "1.0.0",
        "status": "running",
        "available_tables": list(UI_METADATA.keys())
    }

@app.get("/api/health")
async def health_check():
    """Health-Check"""
    return {
        "status": "healthy",
        "service": "VALEO NeuroERP UI Metadata Server",
        "available_tables": len(UI_METADATA)
    }

@app.get("/ui/tables")
async def list_tables():
    """Alle verfügbaren Tabellen auflisten"""
    return {
        "tables": list(UI_METADATA.keys()),
        "count": len(UI_METADATA)
    }

@app.get("/ui/{table_name}")
async def get_table_metadata(table_name: str):
    """UI-Metadaten für eine Tabelle abrufen"""
    if table_name not in UI_METADATA:
        raise HTTPException(status_code=404, detail=f"Tabelle '{table_name}' nicht gefunden")
    
    return UI_METADATA[table_name]

@app.get("/ui/{table_name}/table")
async def get_table_ui_metadata(table_name: str):
    """Tabellen-UI-Metadaten abrufen"""
    if table_name not in UI_METADATA:
        raise HTTPException(status_code=404, detail=f"Tabelle '{table_name}' nicht gefunden")
    
    return UI_METADATA[table_name]["table"]

@app.get("/ui/{table_name}/form")
async def get_form_ui_metadata(table_name: str):
    """Formular-UI-Metadaten abrufen"""
    if table_name not in UI_METADATA:
        raise HTTPException(status_code=404, detail=f"Tabelle '{table_name}' nicht gefunden")
    
    return UI_METADATA[table_name]["form"]

@app.get("/ui/{table_name}/complete")
async def get_complete_metadata(table_name: str):
    """Vollständige UI-Metadaten abrufen"""
    if table_name not in UI_METADATA:
        raise HTTPException(status_code=404, detail=f"Tabelle '{table_name}' nicht gefunden")
    
    return CompleteMetadata(
        table_name=table_name,
        table=UI_METADATA[table_name]["table"],
        form=UI_METADATA[table_name]["form"]
    )

if __name__ == "__main__":
    print("🚀 Starte VALEO NeuroERP UI Metadata Server...")
    print("📋 Verfügbare Endpunkte:")
    print("   - GET /api/health")
    print("   - GET /ui/tables")
    print("   - GET /ui/{table_name}")
    print("   - GET /ui/{table_name}/table")
    print("   - GET /ui/{table_name}/form")
    print("   - GET /ui/{table_name}/complete")
    print("🌐 Server läuft auf: http://localhost:8001")
    
    uvicorn.run(app, host="0.0.0.0", port=8001) 