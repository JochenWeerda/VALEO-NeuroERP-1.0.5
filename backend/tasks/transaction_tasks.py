"""
Transaktions-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Verarbeitung von Transaktionen,
einschließlich Zahlungsverarbeitung, Rechnungsstellung und Finanzdatenanalyse.
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import decimal
from decimal import Decimal
from celery import shared_task

# Lokale Imports
from backend.services.task_queue import update_task_progress

logger = logging.getLogger(__name__)

# Hilfsfunktion für JSON-Serialisierung von Decimal-Werten
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

@shared_task(bind=True)
def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Verarbeitet eine Zahlungstransaktion.
    
    Args:
        payment_data: Dictionary mit Zahlungsinformationen
            - amount: Zahlungsbetrag
            - currency: Währung
            - payment_method: Zahlungsmethode (z.B. 'credit_card', 'bank_transfer')
            - customer_id: Kunden-ID
            - reference: Referenznummer
            - metadata: Zusätzliche Metadaten
    
    Returns:
        Dict mit Informationen zur verarbeiteten Zahlung
    """
    logger.info(f"Starte Zahlungsverarbeitung für Referenz {payment_data.get('reference', 'unbekannt')}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Zahlungsdaten werden validiert")
        
        # Erforderliche Felder prüfen
        required_fields = ['amount', 'currency', 'payment_method', 'customer_id']
        missing_fields = [field for field in required_fields if field not in payment_data]
        
        if missing_fields:
            raise ValueError(f"Fehlende Pflichtfelder in den Zahlungsdaten: {', '.join(missing_fields)}")
        
        # Zahlungsdaten extrahieren
        amount = Decimal(str(payment_data['amount']))
        currency = payment_data['currency']
        payment_method = payment_data['payment_method']
        customer_id = payment_data['customer_id']
        reference = payment_data.get('reference', f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}")
        metadata = payment_data.get('metadata', {})
        
        # Zahlungsmethode validieren
        valid_payment_methods = ['credit_card', 'bank_transfer', 'paypal', 'sepa', 'crypto']
        if payment_method not in valid_payment_methods:
            raise ValueError(f"Ungültige Zahlungsmethode: {payment_method}")
        
        # Zahlungsverarbeitung simulieren
        update_task_progress(self.request.id, 30, "Zahlung wird verarbeitet")
        
        # In einer realen Anwendung würde hier die Integration mit einem Zahlungsdienstleister erfolgen
        # Beispiel: Stripe, PayPal, etc.
        
        # Wir simulieren eine erfolgreiche Zahlung
        transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{hash(reference) % 10000:04d}"
        
        # Transaktion in der Datenbank speichern (simuliert)
        update_task_progress(self.request.id, 70, "Transaktion wird gespeichert")
        
        # Erfolgreiche Verarbeitung simulieren
        processing_time = 2.5  # Sekunden
        
        update_task_progress(self.request.id, 100, "Zahlungsverarbeitung abgeschlossen")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "transaction_id": transaction_id,
            "reference": reference,
            "amount": float(amount),
            "currency": currency,
            "payment_method": payment_method,
            "customer_id": customer_id,
            "processed_at": datetime.now().isoformat(),
            "processing_time": processing_time,
            "metadata": metadata
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Zahlungsverarbeitung: {str(e)}")
        raise

@shared_task(bind=True)
def generate_invoice(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generiert eine Rechnung basierend auf den übergebenen Daten.
    
    Args:
        invoice_data: Dictionary mit Rechnungsinformationen
            - customer_id: Kunden-ID
            - items: Liste von Rechnungsposten
            - due_date: Fälligkeitsdatum (optional)
            - notes: Notizen (optional)
            - tax_rate: Steuersatz in Prozent (optional)
    
    Returns:
        Dict mit Informationen zur generierten Rechnung
    """
    logger.info(f"Starte Rechnungserstellung für Kunde {invoice_data.get('customer_id', 'unbekannt')}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Rechnungsdaten werden validiert")
        
        # Erforderliche Felder prüfen
        required_fields = ['customer_id', 'items']
        missing_fields = [field for field in required_fields if field not in invoice_data]
        
        if missing_fields:
            raise ValueError(f"Fehlende Pflichtfelder in den Rechnungsdaten: {', '.join(missing_fields)}")
        
        # Rechnungsdaten extrahieren
        customer_id = invoice_data['customer_id']
        items = invoice_data['items']
        due_date = invoice_data.get('due_date', (datetime.now() + timedelta(days=30)).isoformat())
        notes = invoice_data.get('notes', '')
        tax_rate = Decimal(str(invoice_data.get('tax_rate', 19)))  # Standardsteuersatz 19%
        
        # Rechnungsposten validieren
        if not items or not isinstance(items, list):
            raise ValueError("Keine gültigen Rechnungsposten angegeben")
        
        for item in items:
            if not all(key in item for key in ['description', 'quantity', 'unit_price']):
                raise ValueError("Rechnungsposten müssen Beschreibung, Menge und Einzelpreis enthalten")
        
        # Rechnungsnummer generieren
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{hash(customer_id) % 10000:04d}"
        
        # Rechnungsbeträge berechnen
        update_task_progress(self.request.id, 30, "Rechnungsbeträge werden berechnet")
        
        # Einzelposten mit Beträgen berechnen
        calculated_items = []
        subtotal = Decimal('0.00')
        
        for item in items:
            quantity = Decimal(str(item['quantity']))
            unit_price = Decimal(str(item['unit_price']))
            item_total = quantity * unit_price
            
            calculated_items.append({
                "description": item['description'],
                "quantity": float(quantity),
                "unit_price": float(unit_price),
                "total": float(item_total)
            })
            
            subtotal += item_total
        
        # Steuer berechnen
        tax_amount = subtotal * (tax_rate / Decimal('100'))
        total_amount = subtotal + tax_amount
        
        # Rechnungsdokument generieren (simuliert)
        update_task_progress(self.request.id, 60, "Rechnungsdokument wird erstellt")
        
        # In einer realen Anwendung würde hier ein PDF-Dokument generiert werden
        invoice_file_path = f"/invoices/{invoice_number}.pdf"
        
        # Rechnung in der Datenbank speichern (simuliert)
        update_task_progress(self.request.id, 80, "Rechnung wird gespeichert")
        
        update_task_progress(self.request.id, 100, "Rechnungserstellung abgeschlossen")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "invoice_number": invoice_number,
            "customer_id": customer_id,
            "issue_date": datetime.now().isoformat(),
            "due_date": due_date,
            "items": calculated_items,
            "subtotal": float(subtotal),
            "tax_rate": float(tax_rate),
            "tax_amount": float(tax_amount),
            "total_amount": float(total_amount),
            "notes": notes,
            "invoice_file_path": invoice_file_path
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Rechnungserstellung: {str(e)}")
        raise

@shared_task(bind=True)
def reconcile_transactions(self, start_date: str, end_date: str, 
                         account_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Führt einen Abgleich von Transaktionen für einen bestimmten Zeitraum durch.
    
    Args:
        start_date: Startdatum für den Abgleich (ISO-Format)
        end_date: Enddatum für den Abgleich (ISO-Format)
        account_id: Konto-ID (optional, falls nicht angegeben werden alle Konten abgeglichen)
    
    Returns:
        Dict mit Informationen zum Transaktionsabgleich
    """
    logger.info(f"Starte Transaktionsabgleich für Zeitraum {start_date} bis {end_date}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Transaktionsdaten werden geladen")
        
        # Datumsformate validieren
        try:
            start_date_obj = datetime.fromisoformat(start_date)
            end_date_obj = datetime.fromisoformat(end_date)
        except ValueError:
            raise ValueError("Ungültiges Datumsformat. Bitte ISO-Format verwenden (YYYY-MM-DD).")
        
        if start_date_obj > end_date_obj:
            raise ValueError("Startdatum muss vor dem Enddatum liegen")
        
        # In einer realen Anwendung würden hier Transaktionen aus der Datenbank geladen
        # und mit externen Datenquellen (z.B. Bankauszügen) abgeglichen werden
        
        # Simulierte Transaktionsdaten
        account_filter = f" für Konto {account_id}" if account_id else ""
        update_task_progress(self.request.id, 30, f"Transaktionen{account_filter} werden abgeglichen")
        
        # Simulierte Ergebnisse des Abgleichs
        reconciliation_results = {
            "total_transactions": 120,
            "matched_transactions": 115,
            "unmatched_transactions": 5,
            "duplicate_transactions": 2,
            "missing_transactions": 3,
            "accounts_processed": [account_id] if account_id else ["ACC-001", "ACC-002", "ACC-003"],
            "unmatched_details": [
                {
                    "transaction_id": "TXN-20230405-1234",
                    "date": "2023-04-05T14:30:00",
                    "amount": 150.75,
                    "description": "Unbekannte Zahlung",
                    "status": "unmatched"
                },
                # Weitere nicht abgeglichene Transaktionen...
            ]
        }
        
        # Abgleichsbericht erstellen (simuliert)
        update_task_progress(self.request.id, 70, "Abgleichsbericht wird erstellt")
        
        # In einer realen Anwendung würde hier ein Bericht generiert werden
        report_file_path = f"/reports/reconciliation_{start_date.replace('-', '')}_{end_date.replace('-', '')}.pdf"
        
        update_task_progress(self.request.id, 100, "Transaktionsabgleich abgeschlossen")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "start_date": start_date,
            "end_date": end_date,
            "account_id": account_id,
            "reconciliation_results": reconciliation_results,
            "report_file_path": report_file_path,
            "completed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Transaktionsabgleich: {str(e)}")
        raise

@shared_task(bind=True)
def analyze_financial_data(self, data_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Führt eine Analyse von Finanzdaten durch.
    
    Args:
        data_params: Parameter für die Datenanalyse
            - time_period: Zeitraum für die Analyse (z.B. 'last_month', 'last_quarter', 'last_year')
            - metrics: Liste der zu analysierenden Metriken (z.B. 'revenue', 'expenses', 'profit')
            - grouping: Gruppierung der Daten (z.B. 'daily', 'weekly', 'monthly')
            - filters: Filter für die Daten (optional)
    
    Returns:
        Dict mit Analyseergebnissen
    """
    logger.info(f"Starte Finanzdatenanalyse für Zeitraum {data_params.get('time_period', 'unbekannt')}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Analyseparameter werden validiert")
        
        # Parameter extrahieren
        time_period = data_params.get('time_period', 'last_month')
        metrics = data_params.get('metrics', ['revenue', 'expenses', 'profit'])
        grouping = data_params.get('grouping', 'daily')
        filters = data_params.get('filters', {})
        
        # Zeitraum validieren
        valid_time_periods = ['last_week', 'last_month', 'last_quarter', 'last_year', 'ytd', 'custom']
        if time_period not in valid_time_periods:
            raise ValueError(f"Ungültiger Zeitraum: {time_period}")
        
        # Metriken validieren
        valid_metrics = ['revenue', 'expenses', 'profit', 'cash_flow', 'accounts_receivable', 'accounts_payable']
        invalid_metrics = [m for m in metrics if m not in valid_metrics]
        if invalid_metrics:
            raise ValueError(f"Ungültige Metriken: {', '.join(invalid_metrics)}")
        
        # Gruppierung validieren
        valid_groupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
        if grouping not in valid_groupings:
            raise ValueError(f"Ungültige Gruppierung: {grouping}")
        
        # Zeitraum berechnen
        now = datetime.now()
        if time_period == 'last_week':
            start_date = now - timedelta(days=7)
            end_date = now
        elif time_period == 'last_month':
            start_date = now - timedelta(days=30)
            end_date = now
        elif time_period == 'last_quarter':
            start_date = now - timedelta(days=90)
            end_date = now
        elif time_period == 'last_year':
            start_date = now - timedelta(days=365)
            end_date = now
        elif time_period == 'ytd':
            start_date = datetime(now.year, 1, 1)
            end_date = now
        elif time_period == 'custom':
            # Bei benutzerdefinierten Zeiträumen müssen Start- und Enddatum angegeben sein
            if 'start_date' not in filters or 'end_date' not in filters:
                raise ValueError("Bei benutzerdefinierten Zeiträumen müssen Start- und Enddatum angegeben werden")
            
            try:
                start_date = datetime.fromisoformat(filters['start_date'])
                end_date = datetime.fromisoformat(filters['end_date'])
            except ValueError:
                raise ValueError("Ungültiges Datumsformat für Start- oder Enddatum")
        
        # Daten laden (simuliert)
        update_task_progress(self.request.id, 30, "Finanzdaten werden geladen")
        
        # In einer realen Anwendung würden hier Daten aus der Datenbank geladen werden
        
        # Datenanalyse durchführen (simuliert)
        update_task_progress(self.request.id, 50, "Datenanalyse wird durchgeführt")
        
        # Simulierte Analyseergebnisse
        analysis_results = {}
        
        # Für jede Metrik simulierte Daten generieren
        for metric in metrics:
            # Zeitreihe basierend auf der Gruppierung erstellen
            if grouping == 'daily':
                data_points = (end_date - start_date).days
                date_format = '%Y-%m-%d'
            elif grouping == 'weekly':
                data_points = (end_date - start_date).days // 7
                date_format = '%Y-W%W'
            elif grouping == 'monthly':
                data_points = ((end_date.year - start_date.year) * 12 + 
                              end_date.month - start_date.month)
                date_format = '%Y-%m'
            elif grouping == 'quarterly':
                data_points = ((end_date.year - start_date.year) * 4 + 
                              (end_date.month - 1) // 3 - (start_date.month - 1) // 3)
                date_format = '%Y-Q%q'
            else:  # yearly
                data_points = end_date.year - start_date.year + 1
                date_format = '%Y'
            
            # Mindestens einen Datenpunkt sicherstellen
            data_points = max(1, data_points)
            
            # Simulierte Daten für die Metrik generieren
            import random
            
            if metric == 'revenue':
                base_value = 10000
                variation = 2000
            elif metric == 'expenses':
                base_value = 8000
                variation = 1500
            elif metric == 'profit':
                base_value = 2000
                variation = 1000
            else:
                base_value = 5000
                variation = 1000
            
            # Zeitreihe mit simulierten Werten erstellen
            time_series = []
            current_date = start_date
            
            for _ in range(data_points):
                if grouping == 'daily':
                    date_str = current_date.strftime(date_format)
                    current_date += timedelta(days=1)
                elif grouping == 'weekly':
                    date_str = current_date.strftime(date_format)
                    current_date += timedelta(days=7)
                elif grouping == 'monthly':
                    date_str = current_date.strftime(date_format)
                    # Zum nächsten Monat
                    if current_date.month == 12:
                        current_date = datetime(current_date.year + 1, 1, 1)
                    else:
                        current_date = datetime(current_date.year, current_date.month + 1, 1)
                elif grouping == 'quarterly':
                    quarter = (current_date.month - 1) // 3 + 1
                    date_str = f"{current_date.year}-Q{quarter}"
                    # Zum nächsten Quartal
                    if current_date.month >= 10:
                        current_date = datetime(current_date.year + 1, 1, 1)
                    else:
                        current_date = datetime(current_date.year, 3 * quarter + 1, 1)
                else:  # yearly
                    date_str = current_date.strftime(date_format)
                    current_date = datetime(current_date.year + 1, 1, 1)
                
                value = base_value + random.uniform(-variation, variation)
                time_series.append({
                    "date": date_str,
                    "value": round(value, 2)
                })
            
            # Statistiken berechnen
            values = [point["value"] for point in time_series]
            total = sum(values)
            average = total / len(values) if values else 0
            minimum = min(values) if values else 0
            maximum = max(values) if values else 0
            
            # Ergebnisse für diese Metrik speichern
            analysis_results[metric] = {
                "time_series": time_series,
                "statistics": {
                    "total": round(total, 2),
                    "average": round(average, 2),
                    "min": round(minimum, 2),
                    "max": round(maximum, 2)
                }
            }
        
        # Visualisierungen erstellen (simuliert)
        update_task_progress(self.request.id, 80, "Visualisierungen werden erstellt")
        
        # In einer realen Anwendung würden hier Diagramme und Grafiken erstellt werden
        visualization_paths = {
            "charts": f"/reports/financial_analysis_{datetime.now().strftime('%Y%m%d')}_charts.pdf",
            "dashboard": f"/reports/financial_analysis_{datetime.now().strftime('%Y%m%d')}_dashboard.html"
        }
        
        update_task_progress(self.request.id, 100, "Finanzdatenanalyse abgeschlossen")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "time_period": time_period,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "metrics": metrics,
            "grouping": grouping,
            "filters": filters,
            "analysis_results": analysis_results,
            "visualization_paths": visualization_paths,
            "completed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Finanzdatenanalyse: {str(e)}")
        raise

@shared_task(bind=True)
def process_batch_payments(self, payment_batch: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Verarbeitet einen Stapel von Zahlungen.
    
    Args:
        payment_batch: Liste von Zahlungsdaten
    
    Returns:
        Dict mit Informationen zur Stapelverarbeitung
    """
    logger.info(f"Starte Stapelverarbeitung von {len(payment_batch)} Zahlungen")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 0, "Stapelverarbeitung wird vorbereitet")
        
        if not payment_batch:
            raise ValueError("Keine Zahlungen zur Verarbeitung angegeben")
        
        # Ergebnisse initialisieren
        results = {
            "total_payments": len(payment_batch),
            "successful_payments": 0,
            "failed_payments": 0,
            "total_amount": Decimal('0.00'),
            "payment_results": []
        }
        
        # Zahlungen einzeln verarbeiten
        for i, payment_data in enumerate(payment_batch):
            progress = int(100 * i / len(payment_batch))
            update_task_progress(self.request.id, progress, f"Verarbeite Zahlung {i+1}/{len(payment_batch)}")
            
            try:
                # Zahlung verarbeiten
                payment_result = process_payment.apply(
                    args=[payment_data],
                    throw=True
                ).get()
                
                # Erfolgreiche Zahlung zählen
                results["successful_payments"] += 1
                results["total_amount"] += Decimal(str(payment_result["amount"]))
                
                # Ergebnis speichern
                results["payment_results"].append({
                    "status": "success",
                    "transaction_id": payment_result["transaction_id"],
                    "amount": payment_result["amount"],
                    "currency": payment_result["currency"]
                })
                
            except Exception as e:
                logger.error(f"Fehler bei der Verarbeitung von Zahlung {i+1}: {str(e)}")
                
                # Fehlgeschlagene Zahlung zählen
                results["failed_payments"] += 1
                
                # Fehlermeldung speichern
                results["payment_results"].append({
                    "status": "error",
                    "payment_data": payment_data,
                    "error": str(e)
                })
        
        update_task_progress(self.request.id, 100, "Stapelverarbeitung abgeschlossen")
        
        # Erfolgsrate berechnen
        success_rate = (results["successful_payments"] / results["total_payments"]) * 100 if results["total_payments"] > 0 else 0
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "total_payments": results["total_payments"],
            "successful_payments": results["successful_payments"],
            "failed_payments": results["failed_payments"],
            "success_rate": round(success_rate, 2),
            "total_amount": float(results["total_amount"]),
            "payment_results": results["payment_results"],
            "completed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Stapelverarbeitung von Zahlungen: {str(e)}")
        raise
