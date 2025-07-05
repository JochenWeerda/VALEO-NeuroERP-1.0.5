"""
Modul für asynchrone Berichtserstellung mit Celery.

Dieses Modul enthält Celery-Tasks für die Erstellung
verschiedener Berichte im ERP-System.
"""

import os
import logging
import time
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Union

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Konstanten
REPORTS_DIR = os.getenv("REPORTS_DIR", os.path.join(os.getcwd(), "reports"))

# Sicherstellen, dass das Berichte-Verzeichnis existiert
os.makedirs(REPORTS_DIR, exist_ok=True)

def format_date(date_str: Optional[str] = None) -> str:
    """
    Formatiert ein Datum für die Verwendung in Berichten.
    
    Args:
        date_str: Datumsstring (Format: YYYY-MM-DD)
        
    Returns:
        str: Formatiertes Datum (DD.MM.YYYY)
    """
    if not date_str:
        return datetime.now().strftime("%d.%m.%Y")
    
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d.%m.%Y")
    except ValueError:
        logger.warning(f"Ungültiges Datumsformat: {date_str}, verwende aktuelles Datum")
        return datetime.now().strftime("%d.%m.%Y")

def get_report_filename(report_type: str, format: str, parameters: Optional[Dict[str, Any]] = None) -> str:
    """
    Generiert einen Dateinamen für einen Bericht.
    
    Args:
        report_type: Typ des Berichts (z.B. "financial", "inventory")
        format: Ausgabeformat (z.B. "pdf", "excel", "csv")
        parameters: Optionale Parameter für den Dateinamen
        
    Returns:
        str: Der generierte Dateiname
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Extraparameter für den Dateinamen
    extra = ""
    if parameters and "title" in parameters:
        extra = f"_{parameters['title'].replace(' ', '_')}"
    
    return f"{report_type}{extra}_{timestamp}.{format}"

def generate_financial_report_content(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generiert den Inhalt eines Finanzberichts.
    
    Args:
        start_date: Startdatum (Format: YYYY-MM-DD)
        end_date: Enddatum (Format: YYYY-MM-DD)
        parameters: Zusätzliche Parameter für den Bericht
        
    Returns:
        Dict: Der generierte Berichtsinhalt
    """
    # In einer realen Anwendung würden hier Daten aus der Datenbank abgefragt
    
    # Standardwerte setzen, wenn nicht angegeben
    if not start_date:
        start_date_obj = datetime.now() - timedelta(days=30)
        start_date = start_date_obj.strftime("%Y-%m-%d")
    
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    # Formatierte Daten für die Ausgabe
    start_date_formatted = format_date(start_date)
    end_date_formatted = format_date(end_date)
    
    # Demo-Daten für den Bericht
    report_data = {
        "title": parameters.get("title", "Finanzbericht") if parameters else "Finanzbericht",
        "period": f"{start_date_formatted} - {end_date_formatted}",
        "generated_at": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        "summary": {
            "total_revenue": 1250000.00,
            "total_expenses": 980000.00,
            "net_profit": 270000.00,
            "profit_margin": 21.6
        },
        "revenue_by_category": [
            {"category": "Produkt A", "amount": 520000.00},
            {"category": "Produkt B", "amount": 380000.00},
            {"category": "Dienstleistungen", "amount": 350000.00}
        ],
        "expenses_by_category": [
            {"category": "Personal", "amount": 450000.00},
            {"category": "Material", "amount": 280000.00},
            {"category": "Betriebskosten", "amount": 150000.00},
            {"category": "Sonstiges", "amount": 100000.00}
        ],
        "monthly_data": [
            {"month": "Januar", "revenue": 120000.00, "expenses": 90000.00},
            {"month": "Februar", "revenue": 130000.00, "expenses": 95000.00},
            {"month": "März", "revenue": 140000.00, "expenses": 100000.00},
            {"month": "April", "revenue": 150000.00, "expenses": 110000.00},
            {"month": "Mai", "revenue": 160000.00, "expenses": 120000.00},
            {"month": "Juni", "revenue": 170000.00, "expenses": 125000.00}
        ]
    }
    
    return report_data

def generate_inventory_report_content(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generiert den Inhalt eines Lagerberichts.
    
    Args:
        start_date: Startdatum (Format: YYYY-MM-DD)
        end_date: Enddatum (Format: YYYY-MM-DD)
        parameters: Zusätzliche Parameter für den Bericht
        
    Returns:
        Dict: Der generierte Berichtsinhalt
    """
    # In einer realen Anwendung würden hier Daten aus der Datenbank abgefragt
    
    # Standardwerte setzen, wenn nicht angegeben
    if not start_date:
        start_date_obj = datetime.now() - timedelta(days=30)
        start_date = start_date_obj.strftime("%Y-%m-%d")
    
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    # Formatierte Daten für die Ausgabe
    start_date_formatted = format_date(start_date)
    end_date_formatted = format_date(end_date)
    
    # Demo-Daten für den Bericht
    report_data = {
        "title": parameters.get("title", "Lagerbericht") if parameters else "Lagerbericht",
        "period": f"{start_date_formatted} - {end_date_formatted}",
        "generated_at": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        "summary": {
            "total_items": 1250,
            "total_value": 450000.00,
            "low_stock_items": 15,
            "out_of_stock_items": 3
        },
        "inventory_by_category": [
            {"category": "Rohstoffe", "items": 450, "value": 180000.00},
            {"category": "Halbfertige Waren", "items": 300, "value": 120000.00},
            {"category": "Fertigprodukte", "items": 500, "value": 150000.00}
        ],
        "inventory_movement": {
            "items_received": 320,
            "items_shipped": 280,
            "items_adjusted": 15,
            "net_change": 25
        },
        "low_stock_items": [
            {"item_id": "R001", "name": "Rohstoff A", "current_stock": 5, "min_stock": 10},
            {"item_id": "R002", "name": "Rohstoff B", "current_stock": 8, "min_stock": 15},
            {"item_id": "P003", "name": "Produkt C", "current_stock": 2, "min_stock": 5}
        ]
    }
    
    return report_data

def save_report(report_data: Dict[str, Any], filename: str, format: str) -> str:
    """
    Speichert einen Bericht in der angegebenen Datei.
    
    Args:
        report_data: Die Berichtsdaten
        filename: Der Dateiname
        format: Das Format (pdf, excel, csv, json)
        
    Returns:
        str: Der Pfad zur gespeicherten Datei
    """
    file_path = os.path.join(REPORTS_DIR, filename)
    
    if format.lower() == "json":
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
    else:
        # In einer realen Anwendung würden hier verschiedene Formate unterstützt
        # Für dieses Beispiel speichern wir alles als JSON
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Bericht gespeichert: {file_path}")
    return file_path

# Celery-Tasks für Berichte

from celery import shared_task

@shared_task(name="backend.tasks.reports.generate_financial_report")
def generate_financial_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    format: str = "pdf",
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Celery-Task für die Erstellung eines Finanzberichts.
    
    Args:
        start_date: Startdatum (Format: YYYY-MM-DD)
        end_date: Enddatum (Format: YYYY-MM-DD)
        format: Ausgabeformat (z.B. "pdf", "excel", "csv")
        parameters: Zusätzliche Parameter für den Bericht
        
    Returns:
        Dict: Informationen über den erstellten Bericht
    """
    logger.info(f"Generiere Finanzbericht: {start_date} bis {end_date}, Format: {format}")
    
    # Simuliere längere Verarbeitung
    time.sleep(2)
    
    # Berichtsinhalt generieren
    report_data = generate_financial_report_content(start_date, end_date, parameters)
    
    # Dateinamen generieren und Bericht speichern
    filename = get_report_filename("financial", format, parameters)
    file_path = save_report(report_data, filename, format)
    
    return {
        "status": "success",
        "report_type": "financial",
        "filename": filename,
        "file_path": file_path,
        "format": format,
        "generated_at": datetime.now().isoformat(),
        "parameters": {
            "start_date": start_date,
            "end_date": end_date,
            "custom_parameters": parameters
        }
    }

@shared_task(name="backend.tasks.reports.generate_inventory_report")
def generate_inventory_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    format: str = "pdf",
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Celery-Task für die Erstellung eines Lagerberichts.
    
    Args:
        start_date: Startdatum (Format: YYYY-MM-DD)
        end_date: Enddatum (Format: YYYY-MM-DD)
        format: Ausgabeformat (z.B. "pdf", "excel", "csv")
        parameters: Zusätzliche Parameter für den Bericht
        
    Returns:
        Dict: Informationen über den erstellten Bericht
    """
    logger.info(f"Generiere Lagerbericht: {start_date} bis {end_date}, Format: {format}")
    
    # Simuliere längere Verarbeitung
    time.sleep(3)
    
    # Berichtsinhalt generieren
    report_data = generate_inventory_report_content(start_date, end_date, parameters)
    
    # Dateinamen generieren und Bericht speichern
    filename = get_report_filename("inventory", format, parameters)
    file_path = save_report(report_data, filename, format)
    
    return {
        "status": "success",
        "report_type": "inventory",
        "filename": filename,
        "file_path": file_path,
        "format": format,
        "generated_at": datetime.now().isoformat(),
        "parameters": {
            "start_date": start_date,
            "end_date": end_date,
            "custom_parameters": parameters
        }
    }

@shared_task(name="backend.tasks.reports.refresh_materialized_views")
def refresh_materialized_views() -> Dict[str, Any]:
    """
    Aktualisiert materialisierte Ansichten in der Datenbank.
    
    Returns:
        Dict: Status der Aktualisierung
    """
    logger.info("Aktualisiere materialisierte Ansichten")
    
    # In einer realen Anwendung würden hier die materialisierten Ansichten aktualisiert
    # Für dieses Beispiel simulieren wir nur die Verarbeitung
    views = [
        "financial_summary",
        "inventory_summary",
        "sales_by_product",
        "purchases_by_supplier"
    ]
    
    results = {}
    
    for view in views:
        # Simuliere Verarbeitung
        time.sleep(0.5)
        results[view] = {
            "status": "success",
            "updated_at": datetime.now().isoformat(),
            "rows_affected": 100 + hash(view) % 900  # Zufällige Anzahl von Zeilen
        }
    
    return {
        "status": "success",
        "views_updated": len(views),
        "details": results,
        "completed_at": datetime.now().isoformat()
    } 