#!/usr/bin/env python3
"""
MCP UI/UX Metadata Server für VALEO NeuroERP
Bereitstellung von UI-Metadaten für Komponenten-Generierung
"""

import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VALEO NeuroERP UI Metadata MCP Server",
    description="Bereitstellung von UI/UX-Metadaten für Komponenten-Generierung",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models für UI-Metadaten
class UIFieldMetadata(BaseModel):
    field_name: str
    ui_component: str  # 'text', 'select', 'date', 'number', 'textarea', 'checkbox', 'radio'
    label: str
    placeholder: Optional[str] = None
    tooltip: Optional[str] = None
    order: int
    required: bool = True
    readonly: bool = False
    hidden: bool = False
    group: Optional[str] = None
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, Any]]] = None  # Für Select/Radio
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    step: Optional[float] = None
    rows: Optional[int] = None  # Für textarea
    max_length: Optional[int] = None
    pattern: Optional[str] = None  # Regex pattern
    icon: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None  # 'small', 'medium', 'large'

class UITableMetadata(BaseModel):
    table_name: str
    display_name: str
    description: str
    icon: str
    color: str
    fields: List[UIFieldMetadata]
    actions: List[str] = []  # 'create', 'read', 'update', 'delete', 'export', 'import'
    default_sort: Optional[str] = None
    default_order: Optional[str] = None
    page_size: int = 25
    enable_search: bool = True
    enable_filter: bool = True
    enable_pagination: bool = True
    enable_export: bool = True
    enable_bulk_actions: bool = False
    custom_columns: Optional[List[Dict[str, Any]]] = None

class UIFormMetadata(BaseModel):
    form_name: str
    display_name: str
    description: str
    layout: str = 'vertical'  # 'vertical', 'horizontal', 'grid', 'tabs', 'accordion'
    groups: Optional[List[Dict[str, Any]]] = None
    submit_button_text: str = "Speichern"
    cancel_button_text: str = "Abbrechen"
    show_progress: bool = True
    auto_save: bool = False
    validation_mode: str = 'onSubmit'  # 'onSubmit', 'onChange', 'onBlur'
    fields: List[UIFieldMetadata]

# UI-Metadaten für VALEO NeuroERP
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
                    label="Betrag",
                    placeholder="0.00",
                    tooltip="Rechnungsbetrag in Euro",
                    order=3,
                    required=True,
                    min_value=0.01,
                    step=0.01,
                    icon="euro",
                    validation_rules={
                        "positive": True,
                        "currency": "EUR"
                    }
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
                        {"value": "open", "label": "Offen", "color": "warning"},
                        {"value": "paid", "label": "Bezahlt", "color": "success"},
                        {"value": "overdue", "label": "Überfällig", "color": "error"}
                    ],
                    icon="assignment"
                ),
                UIFieldMetadata(
                    field_name="created_at",
                    ui_component="date",
                    label="Erstellt am",
                    order=5,
                    readonly=True,
                    icon="calendar_today"
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
                    label="Betrag *",
                    placeholder="0.00",
                    tooltip="Rechnungsbetrag in Euro",
                    order=2,
                    required=True,
                    group="basic_info",
                    min_value=0.01,
                    step=0.01,
                    icon="euro",
                    validation_rules={
                        "positive": True,
                        "currency": "EUR"
                    }
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
                        {"value": "open", "label": "Offen", "color": "warning"},
                        {"value": "paid", "label": "Bezahlt", "color": "success"},
                        {"value": "overdue", "label": "Überfällig", "color": "error"}
                    ],
                    icon="assignment"
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
    },
    
    "customers": {
        "table": UITableMetadata(
            table_name="customers",
            display_name="Kunden",
            description="Kundenverwaltung und -daten",
            icon="people",
            color="secondary",
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
                    tooltip="Vollständiger Name des Kunden",
                    order=2,
                    required=True,
                    max_length=100,
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="email",
                    ui_component="text",
                    label="E-Mail",
                    placeholder="email@example.com",
                    tooltip="E-Mail-Adresse des Kunden",
                    order=3,
                    required=True,
                    pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
                    icon="email"
                ),
                UIFieldMetadata(
                    field_name="phone",
                    ui_component="text",
                    label="Telefon",
                    placeholder="+49 123 456789",
                    tooltip="Telefonnummer des Kunden",
                    order=4,
                    required=False,
                    pattern=r"^[\+]?[0-9\s\-\(\)]+$",
                    icon="phone"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status",
                    placeholder="Status auswählen",
                    tooltip="Kundenstatus",
                    order=5,
                    required=True,
                    options=[
                        {"value": "active", "label": "Aktiv", "color": "success"},
                        {"value": "inactive", "label": "Inaktiv", "color": "default"},
                        {"value": "prospect", "label": "Interessent", "color": "warning"}
                    ],
                    icon="check_circle"
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
            layout="grid",
            submit_button_text="Kunde speichern",
            cancel_button_text="Abbrechen",
            show_progress=True,
            auto_save=True,
            validation_mode="onBlur",
            fields=[
                UIFieldMetadata(
                    field_name="name",
                    ui_component="text",
                    label="Name *",
                    placeholder="Kundenname eingeben",
                    tooltip="Vollständiger Name des Kunden",
                    order=1,
                    required=True,
                    group="contact_info",
                    max_length=100,
                    icon="person"
                ),
                UIFieldMetadata(
                    field_name="email",
                    ui_component="text",
                    label="E-Mail *",
                    placeholder="email@example.com",
                    tooltip="E-Mail-Adresse des Kunden",
                    order=2,
                    required=True,
                    group="contact_info",
                    pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
                    icon="email"
                ),
                UIFieldMetadata(
                    field_name="phone",
                    ui_component="text",
                    label="Telefon",
                    placeholder="+49 123 456789",
                    tooltip="Telefonnummer des Kunden",
                    order=3,
                    required=False,
                    group="contact_info",
                    pattern=r"^[\+]?[0-9\s\-\(\)]+$",
                    icon="phone"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status *",
                    placeholder="Status auswählen",
                    tooltip="Kundenstatus",
                    order=4,
                    required=True,
                    group="status_info",
                    options=[
                        {"value": "active", "label": "Aktiv", "color": "success"},
                        {"value": "inactive", "label": "Inaktiv", "color": "default"},
                        {"value": "prospect", "label": "Interessent", "color": "warning"}
                    ],
                    icon="check_circle"
                )
            ],
            groups=[
                {
                    "name": "contact_info",
                    "label": "Kontaktinformationen",
                    "icon": "contact_phone",
                    "collapsible": False
                },
                {
                    "name": "status_info",
                    "label": "Status & Einstellungen",
                    "icon": "settings",
                    "collapsible": True
                }
            ]
        )
    },

    "assets": {
        "table": UITableMetadata(
            table_name="assets",
            display_name="Assets",
            description="Verwaltung von Unternehmens-Assets und Anlagen",
            icon="build",
            color="info",
            fields=[
                UIFieldMetadata(
                    field_name="anlagennummer",
                    ui_component="text",
                    label="Anlagennummer",
                    order=1,
                    readonly=False,
                    icon="tag"
                ),
                UIFieldMetadata(
                    field_name="bezeichnung",
                    ui_component="text",
                    label="Bezeichnung",
                    order=2,
                    required=True,
                    icon="description"
                ),
                UIFieldMetadata(
                    field_name="kategoriename",
                    ui_component="select",
                    label="Kategorie",
                    order=3,
                    required=True,
                    options=[
                        {"value": "Maschinen", "label": "Maschinen"},
                        {"value": "Fahrzeug", "label": "Fahrzeug"},
                        {"value": "IT", "label": "IT-Equipment"},
                        {"value": "Möbel", "label": "Möbel & Einrichtung"}
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
                        {"value": "aktiv", "label": "Aktiv", "color": "success"},
                        {"value": "inaktiv", "label": "Inaktiv", "color": "default"},
                        {"value": "wartung", "label": "Wartung", "color": "warning"},
                        {"value": "defekt", "label": "Defekt", "color": "error"},
                        {"value": "verkauft", "label": "Verkauft", "color": "info"}
                    ],
                    icon="check_circle"
                ),
                UIFieldMetadata(
                    field_name="anschaffungswert",
                    ui_component="number",
                    label="Anschaffungswert",
                    order=5,
                    required=True,
                    min_value=0,
                    step=0.01,
                    icon="euro"
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
            display_name="Asset",
            description="Erstellen oder bearbeiten eines Assets",
            layout="tabs",
            submit_button_text="Asset speichern",
            cancel_button_text="Abbrechen",
            show_progress=True,
            auto_save=False,
            validation_mode="onSubmit",
            fields=[
                UIFieldMetadata(
                    field_name="anlagennummer",
                    ui_component="text",
                    label="Anlagennummer *",
                    placeholder="ANL-001",
                    tooltip="Eindeutige Anlagennummer",
                    order=1,
                    required=True,
                    group="basic_info",
                    pattern=r"^ANL-\d{3,}$",
                    icon="tag"
                ),
                UIFieldMetadata(
                    field_name="bezeichnung",
                    ui_component="text",
                    label="Bezeichnung *",
                    placeholder="Asset-Beschreibung",
                    tooltip="Beschreibung des Assets",
                    order=2,
                    required=True,
                    group="basic_info",
                    max_length=200,
                    icon="description"
                ),
                UIFieldMetadata(
                    field_name="kategoriename",
                    ui_component="select",
                    label="Kategorie *",
                    placeholder="Kategorie auswählen",
                    tooltip="Kategorie des Assets",
                    order=3,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "Maschinen", "label": "Maschinen"},
                        {"value": "Fahrzeug", "label": "Fahrzeug"},
                        {"value": "IT", "label": "IT-Equipment"},
                        {"value": "Möbel", "label": "Möbel & Einrichtung"}
                    ],
                    icon="category"
                ),
                UIFieldMetadata(
                    field_name="status",
                    ui_component="select",
                    label="Status *",
                    placeholder="Status auswählen",
                    tooltip="Aktueller Status des Assets",
                    order=4,
                    required=True,
                    group="basic_info",
                    options=[
                        {"value": "aktiv", "label": "Aktiv", "color": "success"},
                        {"value": "inaktiv", "label": "Inaktiv", "color": "default"},
                        {"value": "wartung", "label": "Wartung", "color": "warning"},
                        {"value": "defekt", "label": "Defekt", "color": "error"},
                        {"value": "verkauft", "label": "Verkauft", "color": "info"}
                    ],
                    icon="check_circle"
                ),
                UIFieldMetadata(
                    field_name="anschaffungswert",
                    ui_component="number",
                    label="Anschaffungswert *",
                    placeholder="0.00",
                    tooltip="Anschaffungswert in Euro",
                    order=5,
                    required=True,
                    group="financial_info",
                    min_value=0,
                    step=0.01,
                    icon="euro"
                ),
                UIFieldMetadata(
                    field_name="standort",
                    ui_component="text",
                    label="Standort *",
                    placeholder="Standort eingeben",
                    tooltip="Aktueller Standort des Assets",
                    order=6,
                    required=True,
                    group="location_info",
                    icon="location_on"
                ),
                UIFieldMetadata(
                    field_name="verantwortlicher_name",
                    ui_component="text",
                    label="Verantwortlicher *",
                    placeholder="Name des Verantwortlichen",
                    tooltip="Verantwortlicher für das Asset",
                    order=7,
                    required=True,
                    group="responsibility_info",
                    icon="person"
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
                    "name": "financial_info",
                    "label": "Finanzielle Daten",
                    "icon": "euro",
                    "collapsible": True
                },
                {
                    "name": "location_info",
                    "label": "Standort & Verantwortung",
                    "icon": "location_on",
                    "collapsible": True
                }
            ]
        )
    }
}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VALEO NeuroERP UI Metadata MCP Server",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ui-metadata-mcp-server"
    }

@app.get("/api/ui/tables")
async def get_available_tables():
    """Get list of available tables with UI metadata"""
    try:
        tables = []
        for table_name, metadata in UI_METADATA.items():
            if "table" in metadata:
                table_info = {
                    "table_name": table_name,
                    "display_name": metadata["table"].display_name,
                    "description": metadata["table"].description,
                    "icon": metadata["table"].icon,
                    "color": metadata["table"].color,
                    "has_form": "form" in metadata
                }
                tables.append(table_info)
        
        return {
            "success": True,
            "data": tables,
            "count": len(tables)
        }
    except Exception as e:
        logger.error(f"Error getting available tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ui/table/{table_name}")
async def get_table_metadata(table_name: str):
    """Get UI metadata for a specific table"""
    try:
        if table_name not in UI_METADATA or "table" not in UI_METADATA[table_name]:
            raise HTTPException(status_code=404, detail=f"Table metadata not found: {table_name}")
        
        table_metadata = UI_METADATA[table_name]["table"]
        return {
            "success": True,
            "data": table_metadata.dict(),
            "table_name": table_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting table metadata for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ui/form/{table_name}")
async def get_form_metadata(table_name: str):
    """Get UI metadata for a specific form"""
    try:
        if table_name not in UI_METADATA or "form" not in UI_METADATA[table_name]:
            raise HTTPException(status_code=404, detail=f"Form metadata not found: {table_name}")
        
        form_metadata = UI_METADATA[table_name]["form"]
        return {
            "success": True,
            "data": form_metadata.dict(),
            "table_name": table_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting form metadata for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ui/complete/{table_name}")
async def get_complete_metadata(table_name: str):
    """Get complete UI metadata (table + form) for a specific table"""
    try:
        if table_name not in UI_METADATA:
            raise HTTPException(status_code=404, detail=f"Metadata not found: {table_name}")
        
        metadata = UI_METADATA[table_name]
        result = {
            "table_name": table_name,
            "has_table": "table" in metadata,
            "has_form": "form" in metadata
        }
        
        if "table" in metadata:
            result["table"] = metadata["table"].dict()
        
        if "form" in metadata:
            result["form"] = metadata["form"].dict()
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting complete metadata for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ui/fields/{table_name}")
async def get_field_metadata(table_name: str):
    """Get field metadata for a specific table"""
    try:
        if table_name not in UI_METADATA:
            raise HTTPException(status_code=404, detail=f"Metadata not found: {table_name}")
        
        metadata = UI_METADATA[table_name]
        fields = {}
        
        if "table" in metadata:
            for field in metadata["table"].fields:
                fields[field.field_name] = field.dict()
        
        if "form" in metadata:
            for field in metadata["form"].fields:
                if field.field_name not in fields:
                    fields[field.field_name] = field.dict()
        
        return {
            "success": True,
            "data": fields,
            "table_name": table_name,
            "field_count": len(fields)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting field metadata for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ui/update/{table_name}")
async def update_ui_metadata(table_name: str, metadata: Dict[str, Any]):
    """Update UI metadata for a specific table (for future CMS integration)"""
    try:
        # In a real implementation, this would save to a database or CMS
        logger.info(f"Updating UI metadata for {table_name}: {metadata}")
        
        return {
            "success": True,
            "message": f"UI metadata updated for {table_name}",
            "table_name": table_name
        }
    except Exception as e:
        logger.error(f"Error updating UI metadata for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,  # Different port from schema server
        log_level="info"
    ) 