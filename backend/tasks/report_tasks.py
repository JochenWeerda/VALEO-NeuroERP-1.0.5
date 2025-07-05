��"""
Berichtsgenerierungs-Tasks f�r das VALEO-NeuroERP-System.

Dieses Modul enth�lt Celery-Tasks f�r die asynchrone Generierung von Berichten,
einschlie�lich PDF-, Excel- und CSV-Berichten.
"""

import os
import csv
import logging
import tempfile
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple

import pandas as pd
from celery import shared_task
from django.db import connection
from django.conf import settings
from django.template.loader import render_to_string
from django.core.files.storage import default_storage
from django.core.mail import EmailMessage

from backend.models.async_task import AsyncTask
from backend.services.task_queue import update_task_progress, retry_task_with_exponential_backoff

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_excel_report(self, report_name: str, query: str, params: Optional[Dict[str, Any]] = None,
                         output_path: Optional[str] = None, email_to: Optional[List[str]] = None,
                         options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generiert einen Excel-Bericht basierend auf einer SQL-Abfrage.
    
    Args:
        report_name: Name des Berichts
        query: SQL-Abfrage f�r die Daten
        params: Parameter f�r die SQL-Abfrage
        output_path: Pfad f�r die Ausgabedatei
        email_to: Liste von E-Mail-Adressen f�r den Versand
        options: Zus�tzliche Optionen f�r die Berichtsgenerierung
        
    Returns:
        Dictionary mit Informationen zum generierten Bericht
    """
    try:
        # Standardwerte f�r Optionen
        options = options or {}
        params = params or {}
        sheet_name = options.get('sheet_name', 'Bericht')
        include_timestamp = options.get('include_timestamp', True)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Berichtsgenerierung gestartet")
        
        # SQL-Abfrage ausf�hren
        update_task_progress(self.request.id, 10, "Daten werden abgefragt")
        
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        
        # DataFrame erstellen
        update_task_progress(self.request.id, 30, f"{len(rows)} Datens�tze abgefragt")
        df = pd.DataFrame(rows, columns=columns)
        
        # Ausgabepfad bestimmen
        if not output_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S') if include_timestamp else ''
            filename = f"{report_name}_{timestamp}.xlsx" if include_timestamp else f"{report_name}.xlsx"
            output_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
            
            # Verzeichnis erstellen, falls es nicht existiert
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Excel-Datei erstellen
        update_task_progress(self.request.id, 50, "Excel-Datei wird erstellt")
        
        # Excel-Writer mit Formatierungsoptionen erstellen
        writer = pd.ExcelWriter(output_path, engine='xlsxwriter')
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        # Formatierung hinzuf�gen
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]
        
        # Kopfzeile formatieren
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#D7E4BC',
            'border': 1
        })
        
        # Kopfzeile formatieren
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            # Spaltenbreite automatisch anpassen
            worksheet.set_column(col_num, col_num, max(len(str(value)) + 2, 10))
        
        # Berichtsinfos hinzuf�gen
        info_sheet = workbook.add_worksheet('Info')
        info_sheet.write(0, 0, 'Bericht:', workbook.add_format({'bold': True}))
        info_sheet.write(0, 1, report_name)
        info_sheet.write(1, 0, 'Erstellt am:', workbook.add_format({'bold': True}))
        info_sheet.write(1, 1, datetime.now().strftime('%d.%m.%Y %H:%M:%S'))
        info_sheet.write(2, 0, 'Anzahl Datens�tze:', workbook.add_format({'bold': True}))
        info_sheet.write(2, 1, len(df))
        
        # Excel-Datei speichern
        update_task_progress(self.request.id, 80, "Excel-Datei wird gespeichert")
        writer.close()
        
        # Bei Bedarf per E-Mail versenden
        if email_to:
            update_task_progress(self.request.id, 90, "Bericht wird per E-Mail versendet")
            _send_report_email(
                email_to=email_to,
                subject=f"Bericht: {report_name}",
                body=f"Anbei der angeforderte Bericht '{report_name}'.",
                attachment_path=output_path,
                attachment_name=os.path.basename(output_path)
            )
        
        # Abschlie�enden Fortschritt melden
        update_task_progress(self.request.id, 100, "Berichtsgenerierung abgeschlossen")
        
        return {
            "status": "success",
            "report_name": report_name,
            "output_path": output_path,
            "row_count": len(df),
            "emailed_to": email_to
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Excel-Berichtsgenerierung: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_csv_report(self, report_name: str, query: str, params: Optional[Dict[str, Any]] = None,
                       output_path: Optional[str] = None, email_to: Optional[List[str]] = None,
                       options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generiert einen CSV-Bericht basierend auf einer SQL-Abfrage.
    
    Args:
        report_name: Name des Berichts
        query: SQL-Abfrage f�r die Daten
        params: Parameter f�r die SQL-Abfrage
        output_path: Pfad f�r die Ausgabedatei
        email_to: Liste von E-Mail-Adressen f�r den Versand
        options: Zus�tzliche Optionen f�r die Berichtsgenerierung
        
    Returns:
        Dictionary mit Informationen zum generierten Bericht
    """
    try:
        # Standardwerte f�r Optionen
        options = options or {}
        params = params or {}
        delimiter = options.get('delimiter', ';')
        encoding = options.get('encoding', 'utf-8')
        include_timestamp = options.get('include_timestamp', True)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Berichtsgenerierung gestartet")
        
        # SQL-Abfrage ausf�hren
        update_task_progress(self.request.id, 10, "Daten werden abgefragt")
        
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        
        update_task_progress(self.request.id, 30, f"{len(rows)} Datens�tze abgefragt")
        
        # Ausgabepfad bestimmen
        if not output_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S') if include_timestamp else ''
            filename = f"{report_name}_{timestamp}.csv" if include_timestamp else f"{report_name}.csv"
            output_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
            
            # Verzeichnis erstellen, falls es nicht existiert
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # CSV-Datei erstellen
        update_task_progress(self.request.id, 50, "CSV-Datei wird erstellt")
        
        with open(output_path, 'w', newline='', encoding=encoding) as csvfile:
            writer = csv.writer(csvfile, delimiter=delimiter)
            
            # Kopfzeile schreiben
            writer.writerow(columns)
            
            # Daten schreiben
            total_rows = len(rows)
            for i, row in enumerate(rows):
                writer.writerow(row)
                
                # Fortschritt alle 1000 Zeilen aktualisieren
                if i % 1000 == 0:
                    progress = 50 + int((i / total_rows) * 30)
                    update_task_progress(self.request.id, progress, 
                                        f"{i}/{total_rows} Zeilen geschrieben")
        
        # Bei Bedarf per E-Mail versenden
        if email_to:
            update_task_progress(self.request.id, 90, "Bericht wird per E-Mail versendet")
            _send_report_email(
                email_to=email_to,
                subject=f"Bericht: {report_name}",
                body=f"Anbei der angeforderte Bericht '{report_name}'.",
                attachment_path=output_path,
                attachment_name=os.path.basename(output_path)
            )
        
        # Abschlie�enden Fortschritt melden
        update_task_progress(self.request.id, 100, "Berichtsgenerierung abgeschlossen")
        
        return {
            "status": "success",
            "report_name": report_name,
            "output_path": output_path,
            "row_count": len(rows),
            "emailed_to": email_to
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der CSV-Berichtsgenerierung: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_pdf_report(self, report_name: str, template_name: str, context: Dict[str, Any],
                       output_path: Optional[str] = None, email_to: Optional[List[str]] = None,
                       options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generiert einen PDF-Bericht basierend auf einer HTML-Vorlage.
    
    Args:
        report_name: Name des Berichts
        template_name: Name der HTML-Vorlage
        context: Kontext f�r die Vorlage
        output_path: Pfad f�r die Ausgabedatei
        email_to: Liste von E-Mail-Adressen f�r den Versand
        options: Zus�tzliche Optionen f�r die Berichtsgenerierung
        
    Returns:
        Dictionary mit Informationen zum generierten Bericht
    """
    try:
        # Standardwerte f�r Optionen
        options = options or {}
        include_timestamp = options.get('include_timestamp', True)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "PDF-Berichtsgenerierung gestartet")
        
        # Daten f�r den Bericht vorbereiten
        update_task_progress(self.request.id, 10, "Daten werden vorbereitet")
        
        # Kontext erweitern
        context['report_name'] = report_name
        context['generated_at'] = datetime.now().strftime('%d.%m.%Y %H:%M:%S')
        
        # HTML-Vorlage rendern
        update_task_progress(self.request.id, 30, "HTML-Vorlage wird gerendert")
        html_content = render_to_string(template_name, context)
        
        # Ausgabepfad bestimmen
        if not output_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S') if include_timestamp else ''
            filename = f"{report_name}_{timestamp}.pdf" if include_timestamp else f"{report_name}.pdf"
            output_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
            
            # Verzeichnis erstellen, falls es nicht existiert
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # PDF erstellen mit WeasyPrint oder einer anderen PDF-Bibliothek
        update_task_progress(self.request.id, 50, "PDF wird erstellt")
        
        try:
            from weasyprint import HTML
            HTML(string=html_content).write_pdf(output_path)
        except ImportError:
            # Fallback, wenn WeasyPrint nicht verf�gbar ist
            try:
                import pdfkit
                pdfkit.from_string(html_content, output_path)
            except ImportError:
                raise ImportError("Weder WeasyPrint noch pdfkit ist installiert. Bitte installieren Sie eine dieser Bibliotheken.")
        
        # Bei Bedarf per E-Mail versenden
        if email_to:
            update_task_progress(self.request.id, 90, "Bericht wird per E-Mail versendet")
            _send_report_email(
                email_to=email_to,
                subject=f"Bericht: {report_name}",
                body=f"Anbei der angeforderte Bericht '{report_name}'.",
                attachment_path=output_path,
                attachment_name=os.path.basename(output_path)
            )
        
        # Abschlie�enden Fortschritt melden
        update_task_progress(self.request.id, 100, "PDF-Berichtsgenerierung abgeschlossen")
        
        return {
            "status": "success",
            "report_name": report_name,
            "output_path": output_path,
            "emailed_to": email_to
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der PDF-Berichtsgenerierung: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True, max_retries=3)
def generate_scheduled_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generiert einen geplanten Bericht basierend auf der Konfiguration.
    
    Args:
        report_config: Konfiguration f�r den Bericht
        
    Returns:
        Dictionary mit Informationen zum generierten Bericht
    """
    try:
        report_type = report_config.get('type', 'excel')
        report_name = report_config.get('name', 'Geplanter Bericht')
        
        update_task_progress(self.request.id, 0, f"Geplanter Bericht '{report_name}' wird generiert")
        
        # Je nach Berichtstyp die entsprechende Funktion aufrufen
        if report_type == 'excel':
            return generate_excel_report.apply(
                kwargs={
                    'report_name': report_name,
                    'query': report_config.get('query'),
                    'params': report_config.get('params'),
                    'output_path': report_config.get('output_path'),
                    'email_to': report_config.get('email_to'),
                    'options': report_config.get('options')
                }
            ).get()
            
        elif report_type == 'csv':
            return generate_csv_report.apply(
                kwargs={
                    'report_name': report_name,
                    'query': report_config.get('query'),
                    'params': report_config.get('params'),
                    'output_path': report_config.get('output_path'),
                    'email_to': report_config.get('email_to'),
                    'options': report_config.get('options')
                }
            ).get()
            
        elif report_type == 'pdf':
            return generate_pdf_report.apply(
                kwargs={
                    'report_name': report_name,
                    'template_name': report_config.get('template_name'),
                    'context': report_config.get('context', {}),
                    'output_path': report_config.get('output_path'),
                    'email_to': report_config.get('email_to'),
                    'options': report_config.get('options')
                }
            ).get()
            
        else:
            raise ValueError(f"Nicht unterst�tzter Berichtstyp: {report_type}")
            
    except Exception as e:
        logger.error(f"Fehler bei der Generierung des geplanten Berichts: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True)
def generate_dashboard_data(self, dashboard_id: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generiert Daten f�r ein Dashboard.
    
    Args:
        dashboard_id: ID des Dashboards
        filters: Filter f�r die Daten
        
    Returns:
        Dictionary mit den generierten Dashboard-Daten
    """
    try:
        filters = filters or {}
        
        update_task_progress(self.request.id, 0, "Dashboard-Daten werden generiert")
        
        # Dashboard-Konfiguration laden
        # In einer realen Implementierung w�rde hier die Konfiguration aus der Datenbank geladen
        dashboard_config = {
            'id': dashboard_id,
            'name': 'Demo-Dashboard',
            'widgets': [
                {
                    'id': 'widget1',
                    'type': 'chart',
                    'query': 'SELECT date_trunc(\'day\', created_at) as date, COUNT(*) as count FROM orders GROUP BY date ORDER BY date',
                    'chart_type': 'line'
                },
                {
                    'id': 'widget2',
                    'type': 'table',
                    'query': 'SELECT product_name, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue FROM order_items JOIN products ON order_items.product_id = products.id GROUP BY product_name ORDER BY total_revenue DESC LIMIT 10'
                }
            ]
        }
        
        # Ergebnisse f�r jedes Widget generieren
        results = {}
        total_widgets = len(dashboard_config['widgets'])
        
        for i, widget in enumerate(dashboard_config['widgets']):
            update_task_progress(
                self.request.id, 
                int((i / total_widgets) * 90) + 5,
                f"Widget {i+1}/{total_widgets} wird generiert"
            )
            
            # Widget-Daten generieren
            widget_data = _generate_widget_data(widget, filters)
            results[widget['id']] = widget_data
        
        update_task_progress(self.request.id, 100, "Dashboard-Daten erfolgreich generiert")
        
        return {
            'dashboard_id': dashboard_id,
            'dashboard_name': dashboard_config['name'],
            'generated_at': datetime.now().isoformat(),
            'widgets': results
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Generierung der Dashboard-Daten: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


def _generate_widget_data(widget: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generiert Daten f�r ein einzelnes Dashboard-Widget.
    
    Args:
        widget: Widget-Konfiguration
        filters: Filter f�r die Daten
        
    Returns:
        Dictionary mit den generierten Widget-Daten
    """
    # In einer realen Implementierung w�rde hier die Abfrage mit den Filtern ausgef�hrt
    # Hier wird ein Beispiel-Ergebnis zur�ckgegeben
    
    if widget['type'] == 'chart':
        # Beispieldaten f�r ein Diagramm
        return {
            'type': widget['chart_type'],
            'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
            'datasets': [
                {
                    'label': 'Verk�ufe',
                    'data': [12, 19, 3, 5, 2, 3]
                }
            ]
        }
    elif widget['type'] == 'table':
        # Beispieldaten f�r eine Tabelle
        return {
            'headers': ['Produkt', 'Menge', 'Umsatz'],
            'rows': [
                ['Produkt A', 120, 1200],
                ['Produkt B', 80, 960],
                ['Produkt C', 60, 840],
                ['Produkt D', 40, 600],
                ['Produkt E', 30, 450]
            ]
        }
    else:
        return {
            'error': f"Nicht unterst�tzter Widget-Typ: {widget['type']}"
        }


def _send_report_email(email_to: List[str], subject: str, body: str, 
                     attachment_path: str, attachment_name: Optional[str] = None) -> bool:
    """
    Sendet eine E-Mail mit einem Bericht als Anhang.
    
    Args:
        email_to: Liste von E-Mail-Adressen
        subject: Betreff der E-Mail
        body: Text der E-Mail
        attachment_path: Pfad zur Anhangsdatei
        attachment_name: Name des Anhangs (optional)
        
    Returns:
        True, wenn die E-Mail erfolgreich gesendet wurde, sonst False
    """
    try:
        attachment_name = attachment_name or os.path.basename(attachment_path)
        
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=email_to
        )
        
        with open(attachment_path, 'rb') as f:
            email.attach(attachment_name, f.read(), _get_mimetype(attachment_path))
        
        email.send(fail_silently=False)
        return True
        
    except Exception as e:
        logger.error(f"Fehler beim Senden der E-Mail: {str(e)}")
        return False


def _get_mimetype(file_path: str) -> str:
    """
    Ermittelt den MIME-Typ einer Datei anhand der Dateiendung.
    
    Args:
        file_path: Pfad zur Datei
        
    Returns:
        MIME-Typ der Datei
    """
    import mimetypes
    
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type is None:
        # Standardwerte f�r h�ufige Dateitypen
        extension = os.path.splitext(file_path)[1].lower()
        
        if extension == '.xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        elif extension == '.csv':
            return 'text/csv'
        elif extension == '.pdf':
            return 'application/pdf'
        else:
            return 'application/octet-stream'
    
    return mime_type
