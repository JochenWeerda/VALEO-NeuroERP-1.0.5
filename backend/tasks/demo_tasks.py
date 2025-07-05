"""
Demo-Skript für die Task-Queue-Funktionalität im VALEO-NeuroERP-System.

Dieses Skript demonstriert die Verwendung der verschiedenen Task-Module
und kann zur Überprüfung der Funktionalität verwendet werden.
"""

import os
import logging
import argparse
import time
from datetime import datetime
from typing import Dict, Any

from django.conf import settings

from backend.tasks.data_import_tasks import import_csv_file, import_excel_file, import_json_file
from backend.tasks.report_tasks import generate_excel_report, generate_csv_report, generate_pdf_report
from backend.tasks.email_tasks import send_mass_email, send_newsletter, send_transactional_email
from backend.tasks.transaction_tasks import process_transactions, process_accounting_entries
from backend.tasks.periodic_tasks import cleanup_old_tasks, database_backup
from backend.tasks.data_analysis_tasks import (
    analyze_time_series, cluster_analysis, anomaly_detection, predictive_modeling
)
from backend.tasks.media_processing_tasks import (
    process_image, extract_text_from_image, process_pdf, batch_document_processing
)

logger = logging.getLogger(__name__)

def run_data_import_demo():
    """Demonstriert die Datenimport-Tasks."""
    print("\n=== Datenimport-Demo ===")
    
    # CSV-Import
    csv_task = import_csv_file.delay(
        file_path="demo_data/customers.csv",
        model_name="backend.Customer",
        mapping={
            "name": "name",
            "email": "email",
            "phone": "phone"
        }
    )
    print(f"CSV-Import-Task gestartet: {csv_task.id}")
    
    # Excel-Import
    excel_task = import_excel_file.delay(
        file_path="demo_data/products.xlsx",
        model_name="backend.Product",
        mapping={
            "name": "name",
            "price": "price",
            "stock": "stock"
        }
    )
    print(f"Excel-Import-Task gestartet: {excel_task.id}")
    
    # JSON-Import
    json_task = import_json_file.delay(
        file_path="demo_data/orders.json",
        model_name="backend.Order",
        mapping={
            "order_id": "order_number",
            "customer.id": "customer_id",
            "items": "items_json"
        },
        options={"root_element": "orders"}
    )
    print(f"JSON-Import-Task gestartet: {json_task.id}")


def run_report_demo():
    """Demonstriert die Berichtsgenerungs-Tasks."""
    print("\n=== Berichtsgenerierung-Demo ===")
    
    # Excel-Bericht
    excel_task = generate_excel_report.delay(
        query="SELECT * FROM backend_customer",
        report_name="Kundenbericht",
        email_to=["admin@example.com"],
        options={
            "sheet_name": "Kunden",
            "include_headers": True
        }
    )
    print(f"Excel-Bericht-Task gestartet: {excel_task.id}")
    
    # CSV-Bericht
    csv_task = generate_csv_report.delay(
        query="SELECT * FROM backend_product",
        report_name="Produktbericht",
        email_to=["admin@example.com"],
        options={
            "delimiter": ";",
            "encoding": "utf-8"
        }
    )
    print(f"CSV-Bericht-Task gestartet: {csv_task.id}")
    
    # PDF-Bericht
    pdf_task = generate_pdf_report.delay(
        query="SELECT * FROM backend_order LIMIT 10",
        report_name="Bestellbericht",
        email_to=["admin@example.com"],
        template_name="reports/order_report.html",
        options={
            "paper_size": "A4",
            "orientation": "portrait"
        }
    )
    print(f"PDF-Bericht-Task gestartet: {pdf_task.id}")


def run_email_demo():
    """Demonstriert die E-Mail-Tasks."""
    print("\n=== E-Mail-Demo ===")
    
    # Massen-E-Mail
    mass_email_task = send_mass_email.delay(
        subject="Wichtige Ankündigung",
        template_name="emails/announcement.html",
        recipients=["user1@example.com", "user2@example.com"],
        context={
            "announcement": "Neue Funktionen verfügbar!",
            "date": datetime.now().strftime("%d.%m.%Y")
        }
    )
    print(f"Massen-E-Mail-Task gestartet: {mass_email_task.id}")
    
    # Newsletter
    newsletter_task = send_newsletter.delay(
        newsletter_id="monthly-update",
        subject="Monatlicher Newsletter",
        context={
            "month": datetime.now().strftime("%B %Y"),
            "highlights": ["Neue Produkte", "Sonderangebote", "Events"]
        }
    )
    print(f"Newsletter-Task gestartet: {newsletter_task.id}")
    
    # Transaktionale E-Mail
    transactional_task = send_transactional_email.delay(
        email_type="order_confirmation",
        recipient="customer@example.com",
        context={
            "order_id": "ORD-12345",
            "order_date": datetime.now().strftime("%d.%m.%Y"),
            "total": "€ 99,99"
        }
    )
    print(f"Transaktionale E-Mail-Task gestartet: {transactional_task.id}")


def run_transaction_demo():
    """Demonstriert die Transaktions-Tasks."""
    print("\n=== Transaktions-Demo ===")
    
    # Transaktionsverarbeitung
    transaction_task = process_transactions.delay(
        transaction_ids=[1001, 1002, 1003],
        options={
            "validate": True,
            "auto_correct": False
        }
    )
    print(f"Transaktionsverarbeitungs-Task gestartet: {transaction_task.id}")
    
    # Buchungseinträge
    accounting_task = process_accounting_entries.delay(
        entry_ids=[2001, 2002],
        options={
            "reconcile": True,
            "period_id": 202201
        }
    )
    print(f"Buchungseinträge-Task gestartet: {accounting_task.id}")


def run_periodic_demo():
    """Demonstriert die periodischen Tasks."""
    print("\n=== Periodische Tasks-Demo ===")
    
    # Alte Tasks bereinigen
    cleanup_task = cleanup_old_tasks.delay(days=30)
    print(f"Task-Bereinigung gestartet: {cleanup_task.id}")
    
    # Datenbank-Backup
    backup_task = database_backup.delay()
    print(f"Datenbank-Backup gestartet: {backup_task.id}")


def run_data_analysis_demo():
    """Demonstriert die Datenanalyse-Tasks."""
    print("\n=== Datenanalyse-Demo ===")
    
    # Zeitreihenanalyse
    time_series_task = analyze_time_series.delay(
        data_source="demo_data/sales_data.csv",
        target_column="sales",
        time_column="date",
        params={
            "p": 1,
            "d": 1,
            "q": 1,
            "forecast_steps": 10
        }
    )
    print(f"Zeitreihenanalyse-Task gestartet: {time_series_task.id}")
    
    # Cluster-Analyse
    cluster_task = cluster_analysis.delay(
        data_source="demo_data/customer_segments.csv",
        feature_columns=["age", "income", "spending_score", "loyalty_points"],
        algorithm="kmeans",
        params={
            "n_clusters": 5
        }
    )
    print(f"Cluster-Analyse-Task gestartet: {cluster_task.id}")
    
    # Anomalieerkennung
    anomaly_task = anomaly_detection.delay(
        data_source="demo_data/transactions.csv",
        feature_columns=["amount", "frequency", "recency", "time_of_day"],
        method="isolation_forest",
        params={
            "contamination": 0.05
        }
    )
    print(f"Anomalieerkennung-Task gestartet: {anomaly_task.id}")
    
    # Prädiktive Modellierung
    predictive_task = predictive_modeling.delay(
        data_source="demo_data/customer_churn.csv",
        target_column="churn",
        feature_columns=["tenure", "monthly_charges", "total_charges", "contract_type", "payment_method"],
        model_type="random_forest",
        params={
            "n_estimators": 100,
            "test_size": 0.2
        }
    )
    print(f"Prädiktive Modellierung-Task gestartet: {predictive_task.id}")


def run_media_processing_demo():
    """Demonstriert die Medienverarbeitungs-Tasks."""
    print("\n=== Medienverarbeitung-Demo ===")
    
    # Bildverarbeitung
    image_task = process_image.delay(
        image_path="demo_data/sample_image.jpg",
        operations=[
            {"type": "resize", "width": 800},
            {"type": "filter", "filter": "sharpen"},
            {"type": "adjust", "adjust": "brightness", "factor": 1.2}
        ],
        output_format="JPEG",
        quality=90
    )
    print(f"Bildverarbeitungs-Task gestartet: {image_task.id}")
    
    # OCR-Textextraktion
    ocr_task = extract_text_from_image.delay(
        image_path="demo_data/document_scan.png",
        language="deu",
        preprocess=True
    )
    print(f"OCR-Task gestartet: {ocr_task.id}")
    
    # PDF-Verarbeitung
    pdf_task = process_pdf.delay(
        pdf_path="demo_data/sample_document.pdf",
        operations=[
            {"type": "extract_text"},
            {"type": "extract_images"}
        ]
    )
    print(f"PDF-Verarbeitungs-Task gestartet: {pdf_task.id}")
    
    # Batch-Dokumentenverarbeitung
    batch_task = batch_document_processing.delay(
        file_paths=[
            "demo_data/image1.jpg",
            "demo_data/image2.jpg",
            "demo_data/image3.jpg"
        ],
        process_type="image_resize",
        params={
            "width": 1024,
            "output_format": "PNG"
        }
    )
    print(f"Batch-Verarbeitungs-Task gestartet: {batch_task.id}")


def main():
    """Hauptfunktion für die Demo."""
    parser = argparse.ArgumentParser(description="Demo für Task-Queue-Funktionalität")
    parser.add_argument("--all", action="store_true", help="Alle Demos ausführen")
    parser.add_argument("--import", dest="run_import", action="store_true", help="Datenimport-Demo ausführen")
    parser.add_argument("--report", action="store_true", help="Berichtsgenerungs-Demo ausführen")
    parser.add_argument("--email", action="store_true", help="E-Mail-Demo ausführen")
    parser.add_argument("--transaction", action="store_true", help="Transaktions-Demo ausführen")
    parser.add_argument("--periodic", action="store_true", help="Periodische Tasks-Demo ausführen")
    parser.add_argument("--analysis", action="store_true", help="Datenanalyse-Demo ausführen")
    parser.add_argument("--media", action="store_true", help="Medienverarbeitungs-Demo ausführen")
    
    args = parser.parse_args()
    
    # Wenn keine spezifischen Optionen angegeben wurden, alle ausführen
    if not any(vars(args).values()):
        args.all = True
    
    print("=== VALEO-NeuroERP Task-Queue-Demo ===")
    print(f"Zeitpunkt: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    
    if args.all or args.run_import:
        run_data_import_demo()
    
    if args.all or args.report:
        run_report_demo()
    
    if args.all or args.email:
        run_email_demo()
    
    if args.all or args.transaction:
        run_transaction_demo()
    
    if args.all or args.periodic:
        run_periodic_demo()
    
    if args.all or args.analysis:
        run_data_analysis_demo()
    
    if args.all or args.media:
        run_media_processing_demo()
    
    print("\n=== Demo abgeschlossen ===")
    print("Überprüfen Sie die Task-Status im Admin-Interface oder in der Flower-Oberfläche.")


if __name__ == "__main__":
    main() 