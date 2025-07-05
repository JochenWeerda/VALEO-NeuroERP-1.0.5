"""
Geplante Berichte für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die Erstellung und Verteilung von geplanten Berichten.
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from celery import shared_task

# Lokale Imports
from backend.services.task_queue import update_task_progress
from .pdf_reports import generate_pdf_report
from .excel_exports import generate_excel_export
from .report_utils import validate_report_parameters

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def generate_scheduled_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generiert einen geplanten Bericht basierend auf der übergebenen Konfiguration.
    
    Args:
        report_config: Dictionary mit der Berichtskonfiguration
    
    Returns:
        Dict mit Informationen zum generierten Bericht
    """
    logger.info(f"Starte Generierung eines geplanten Berichts: {report_config.get('name', 'Unbenannt')}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Berichtskonfiguration wird validiert")
        
        # Parameter validieren
        validate_report_parameters(report_config, required_fields=['name', 'type', 'data_source'])
        
        # Konfiguration extrahieren
        report_name = report_config.get('name')
        report_type = report_config.get('type')
        data_source = report_config.get('data_source')
        report_format = report_config.get('format', 'pdf')
        recipients = report_config.get('recipients', [])
        
        # Ausgabepfad bestimmen
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_dir = os.path.join('reports', 'scheduled')
        os.makedirs(output_dir, exist_ok=True)
        
        if report_format == 'pdf':
            output_file = os.path.join(output_dir, f"{report_name.replace(' ', '_')}_{timestamp}.pdf")
        elif report_format == 'excel':
            output_file = os.path.join(output_dir, f"{report_name.replace(' ', '_')}_{timestamp}.xlsx")
        else:
            output_file = os.path.join(output_dir, f"{report_name.replace(' ', '_')}_{timestamp}.{report_format}")
        
        # Sicherstellen, dass das Ausgabeverzeichnis existiert
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        update_task_progress(self.request.id, 30, "Daten werden geladen")
        
        # Daten aus der Datenquelle laden
        try:
            from backend.db.database import SessionLocal
            from sqlalchemy import text
            
            # Datenbankverbindung herstellen
            db = SessionLocal()
            
            try:
                # Daten je nach Datenquelle laden
                report_data = {}
                
                if data_source.get('type') == 'sql':
                    # SQL-Abfrage ausführen
                    sql_query = data_source.get('query')
                    if not sql_query:
                        raise ValueError("Keine SQL-Abfrage in der Datenquelle angegeben")
                    
                    # Parameter für die Abfrage
                    query_params = data_source.get('params', {})
                    
                    # Abfrage ausführen
                    result = db.execute(text(sql_query), query_params)
                    
                    # Ergebnisse in ein Dictionary umwandeln
                    rows = [dict(row._mapping) for row in result]
                    
                    # Berichtsdaten basierend auf dem Berichtstyp erstellen
                    if report_type == 'financial':
                        report_data = {
                            "title": f"Finanzbericht: {report_name}",
                            "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                            "content": [
                                {
                                    "title": "Finanzübersicht",
                                    "content": "Dieser Bericht wurde automatisch generiert basierend auf den aktuellen Finanzdaten."
                                }
                            ],
                            "tables": [
                                {
                                    "title": "Finanzübersicht",
                                    "headers": list(rows[0].keys()) if rows else [],
                                    "rows": [[str(value) for value in row.values()] for row in rows]
                                }
                            ]
                        }
                        
                        # Diagramme hinzufügen, wenn Daten vorhanden sind
                        if rows:
                            # Beispiel: Balkendiagramm für die erste numerische Spalte
                            numeric_columns = [k for k, v in rows[0].items() if isinstance(v, (int, float))]
                            if numeric_columns:
                                chart_data = {}
                                for row in rows:
                                    # Erste Spalte als Schlüssel, erste numerische Spalte als Wert
                                    key = str(list(row.values())[0])
                                    value = row[numeric_columns[0]]
                                    chart_data[key] = value
                                
                                report_data["charts"] = [
                                    {
                                        "type": "bar",
                                        "title": f"Übersicht: {numeric_columns[0]}",
                                        "data": chart_data
                                    }
                                ]
                    
                    elif report_type == 'project':
                        report_data = {
                            "title": f"Projektbericht: {report_name}",
                            "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                            "content": [
                                {
                                    "title": "Projektstatus",
                                    "content": "Dieser Bericht wurde automatisch generiert basierend auf den aktuellen Projektdaten."
                                }
                            ],
                            "tables": [
                                {
                                    "title": "Projektübersicht",
                                    "headers": list(rows[0].keys()) if rows else [],
                                    "rows": [[str(value) for value in row.values()] for row in rows]
                                }
                            ]
                        }
                        
                        # Status-Diagramm hinzufügen, wenn eine Statusspalte vorhanden ist
                        status_column = next((k for k in (rows[0].keys() if rows else []) if 'status' in k.lower()), None)
                        if status_column:
                            # Status-Verteilung berechnen
                            status_counts = {}
                            for row in rows:
                                status = row[status_column]
                                status_counts[status] = status_counts.get(status, 0) + 1
                            
                            report_data["charts"] = [
                                {
                                    "type": "pie",
                                    "title": "Aufgabenstatus",
                                    "data": status_counts
                                }
                            ]
                
                elif data_source.get('type') == 'api':
                    # API-Endpunkt aufrufen
                    import requests
                    
                    api_url = data_source.get('url')
                    if not api_url:
                        raise ValueError("Keine API-URL in der Datenquelle angegeben")
                    
                    # Parameter für die API-Anfrage
                    api_params = data_source.get('params', {})
                    api_headers = data_source.get('headers', {})
                    
                    # API-Anfrage senden
                    response = requests.get(api_url, params=api_params, headers=api_headers)
                    response.raise_for_status()
                    
                    # JSON-Antwort verarbeiten
                    api_data = response.json()
                    
                    # Berichtsdaten basierend auf dem Berichtstyp erstellen
                    # Hier müsste die Logik an die spezifische API angepasst werden
                    report_data = {
                        "title": f"API-Bericht: {report_name}",
                        "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                        "content": [
                            {
                                "title": "API-Daten",
                                "content": "Dieser Bericht wurde automatisch generiert basierend auf API-Daten."
                            }
                        ],
                        "api_data": api_data
                    }
                
                else:
                    # Fallback für unbekannte Datenquellen
                    logger.warning(f"Unbekannter Datenquellentyp: {data_source.get('type')}")
                    
                    # Standarddaten für den Bericht
                    report_data = {
                        "title": f"Bericht: {report_name}",
                        "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                        "content": [
                            {
                                "title": "Übersicht",
                                "content": "Dies ist ein automatisch generierter Bericht."
                            }
                        ],
                        "charts": [],
                        "tables": []
                    }
            
            except Exception as db_error:
                logger.error(f"Fehler beim Laden der Daten aus der Datenbank: {str(db_error)}")
                raise
            finally:
                db.close()
                
        except ImportError:
            logger.warning("Datenbankmodule nicht verfügbar, verwende Beispieldaten")
            
            # Beispieldaten für den Bericht
            if report_type == 'financial':
                report_data = {
                    "title": f"Finanzbericht: {report_name}",
                    "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                    "content": [
                        {
                            "title": "Finanzübersicht",
                            "content": "Dies ist ein automatisch generierter Finanzbericht mit Beispieldaten."
                        }
                    ],
                    "charts": [
                        {
                            "type": "bar",
                            "title": "Umsatz nach Monat",
                            "data": {
                                "Januar": 12500,
                                "Februar": 15000,
                                "März": 18000,
                                "April": 16500,
                                "Mai": 19000
                            }
                        }
                    ],
                    "tables": [
                        {
                            "title": "Finanzübersicht",
                            "headers": ["Metrik", "Wert", "Vorjahr", "Veränderung"],
                            "rows": [
                                ["Umsatz", "45.000 €", "42.000 €", "+7.1%"],
                                ["Kosten", "30.000 €", "29.000 €", "+3.4%"],
                                ["Gewinn", "15.000 €", "13.000 €", "+15.4%"]
                            ]
                        }
                    ]
                }
            elif report_type == 'project':
                report_data = {
                    "title": f"Projektbericht: {report_name}",
                    "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                    "content": [
                        {
                            "title": "Projektstatus",
                            "content": "Dies ist ein automatisch generierter Projektbericht mit Beispieldaten."
                        }
                    ],
                    "charts": [
                        {
                            "type": "pie",
                            "title": "Aufgabenstatus",
                            "data": {
                                "Abgeschlossen": 25,
                                "In Bearbeitung": 15,
                                "Offen": 10
                            }
                        }
                    ],
                    "tables": [
                        {
                            "title": "Meilensteine",
                            "headers": ["Meilenstein", "Fälligkeit", "Status", "Verantwortlich"],
                            "rows": [
                                ["Anforderungsanalyse", "15.03.2023", "Abgeschlossen", "Max Mustermann"],
                                ["Entwicklung", "30.06.2023", "In Bearbeitung", "Erika Musterfrau"],
                                ["Tests", "15.08.2023", "Offen", "Max Mustermann"]
                            ]
                        }
                    ]
                }
            else:
                report_data = {
                    "title": f"Bericht: {report_name}",
                    "subtitle": f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}",
                    "content": [
                        {
                            "title": "Übersicht",
                            "content": "Dies ist ein automatisch generierter Bericht mit Beispieldaten."
                        }
                    ],
                    "charts": [],
                    "tables": []
                }
        
        update_task_progress(self.request.id, 50, "Bericht wird generiert")
        
        # Je nach Format unterschiedlichen Bericht generieren
        if report_format == 'pdf':
            result = generate_pdf_report.apply(
                args=[report_data, 'default', output_file],
                throw=True
            ).get()
        elif report_format == 'excel':
            # Daten für Excel-Export umwandeln
            excel_data = {
                "sheets": []
            }
            
            # Tabellen in Excel-Blätter umwandeln
            for i, table in enumerate(report_data.get("tables", [])):
                sheet_data = []
                headers = table.get("headers", [])
                rows = table.get("rows", [])
                
                for row in rows:
                    sheet_data.append({headers[j]: row[j] for j in range(len(headers))})
                
                excel_data["sheets"].append({
                    "name": table.get("title", f"Blatt {i+1}"),
                    "data": sheet_data
                })
            
            # Zusammenfassungsblatt hinzufügen
            excel_data["include_summary"] = True
            
            result = generate_excel_export.apply(
                args=[excel_data, output_file],
                throw=True
            ).get()
        else:
            raise ValueError(f"Nicht unterstütztes Berichtsformat: {report_format}")
        
        update_task_progress(self.request.id, 80, "Bericht wird gespeichert")
        
        # Metadaten zum Bericht speichern
        metadata = {
            "report_name": report_name,
            "report_type": report_type,
            "report_format": report_format,
            "generated_at": datetime.now().isoformat(),
            "output_file": output_file,
            "recipients": recipients
        }
        
        # Metadaten in eine JSON-Datei schreiben
        metadata_path = os.path.join(os.path.dirname(output_file), f"{os.path.basename(output_file)}.meta.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Wenn Empfänger angegeben sind, Bericht verteilen
        if recipients:
            update_task_progress(self.request.id, 90, "Bericht wird verteilt")
            
            distribution_result = distribute_report.apply(
                args=[output_file, recipients, report_name],
                throw=True
            ).get()
            
            # Verteilungsergebnis zu den Metadaten hinzufügen
            metadata["distribution_result"] = distribution_result
            
            # Aktualisierte Metadaten speichern
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        update_task_progress(self.request.id, 100, "Bericht erfolgreich generiert")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "report_name": report_name,
            "report_type": report_type,
            "report_format": report_format,
            "output_file": output_file,
            "recipients_count": len(recipients),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Generierung des geplanten Berichts: {str(e)}")
        raise

@shared_task(bind=True)
def distribute_report(self, report_file: str, recipients: List[str], 
                    report_name: str = "Bericht") -> Dict[str, Any]:
    """
    Verteilt einen Bericht an die angegebenen Empfänger.
    
    Args:
        report_file: Pfad zur Berichtsdatei
        recipients: Liste von E-Mail-Adressen der Empfänger
        report_name: Name des Berichts
    
    Returns:
        Dict mit Informationen zur Berichtsverteilung
    """
    logger.info(f"Starte Verteilung des Berichts {report_name} an {len(recipients)} Empfänger")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Berichtsverteilung wird vorbereitet")
        
        # Prüfen, ob die Berichtsdatei existiert
        if not os.path.exists(report_file):
            error_msg = f"Berichtsdatei nicht gefunden: {report_file}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
        
        update_task_progress(self.request.id, 30, "E-Mail wird vorbereitet")
        
        # E-Mail-Service für den Versand nutzen
        from backend.services.email_service import EmailService
        
        # E-Mail senden
        email_result = EmailService.send_report_email(
            recipients=recipients,
            report_name=report_name,
            report_file=report_file
        )
        
        # Datenbankaktualisierung (wenn verfügbar)
        try:
            from backend.db.database import SessionLocal
            from backend.models.reports import Report, ReportDistribution
            
            # Datenbankverbindung herstellen
            db = SessionLocal()
            
            try:
                # Bericht in der Datenbank suchen
                report = db.query(Report).filter(Report.name == report_name).first()
                
                # Wenn Bericht gefunden, Verteilungen speichern
                if report:
                    for recipient in recipients:
                        distribution = ReportDistribution(
                            report_id=report.id,
                            recipient_email=recipient,
                            sent_at=datetime.now(),
                            status="sent" if email_result.get('status') == 'success' else "failed",
                            error_message=email_result.get('error')
                        )
                        
                        db.add(distribution)
                    
                    db.commit()
                    logger.info(f"Berichtsverteilungen in Datenbank gespeichert für Bericht {report_name}")
            except Exception as db_error:
                logger.warning(f"Fehler beim Speichern der Berichtsverteilungen in der Datenbank: {str(db_error)}")
            finally:
                db.close()
        except ImportError:
            logger.warning("Datenbankmodule nicht verfügbar, Verteilungen werden nicht gespeichert")
        
        update_task_progress(self.request.id, 100, "Bericht erfolgreich verteilt")
        
        return {
            "status": "success",
            "report_name": report_name,
            "recipients_count": len(recipients),
            "sent_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Berichtsverteilung: {str(e)}")
        
        return {
            "status": "error",
            "error_message": str(e),
            "report_name": report_name,
            "recipients_count": len(recipients)
        }

@shared_task(bind=True)
def schedule_recurring_report(self, schedule_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Plant einen wiederkehrenden Bericht.
    
    Args:
        schedule_config: Dictionary mit der Planungskonfiguration
    
    Returns:
        Dict mit Informationen zur Berichtsplanung
    """
    logger.info(f"Starte Planung eines wiederkehrenden Berichts: {schedule_config.get('name', 'Unbenannt')}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Planungskonfiguration wird validiert")
        
        # Parameter validieren
        validate_report_parameters(schedule_config, required_fields=['name', 'report_config', 'schedule'])
        
        # Konfiguration extrahieren
        schedule_name = schedule_config.get('name')
        report_config = schedule_config.get('report_config')
        schedule = schedule_config.get('schedule')
        
        # Zeitplan validieren
        if 'frequency' not in schedule:
            raise ValueError("Keine Frequenz für den wiederkehrenden Bericht angegeben")
        
        frequency = schedule.get('frequency')
        valid_frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
        
        if frequency not in valid_frequencies:
            raise ValueError(f"Ungültige Frequenz: {frequency}")
        
        # In einer realen Anwendung würde hier der Zeitplan in der Datenbank gespeichert
        # und ein Celery-Beat-Eintrag erstellt werden
        # Da wir keine Datenbankanbindung haben, simulieren wir dies
        
        update_task_progress(self.request.id, 50, "Zeitplan wird erstellt")
        
        # Nächsten Ausführungszeitpunkt berechnen
        now = datetime.now()
        
        if frequency == 'daily':
            next_run = now + timedelta(days=1)
        elif frequency == 'weekly':
            next_run = now + timedelta(days=7)
        elif frequency == 'monthly':
            # Einfache Approximation für einen Monat
            next_run = now + timedelta(days=30)
        elif frequency == 'quarterly':
            # Einfache Approximation für ein Quartal
            next_run = now + timedelta(days=90)
        elif frequency == 'yearly':
            # Einfache Approximation für ein Jahr
            next_run = now + timedelta(days=365)
        
        # Simulierte Planungsdaten
        schedule_data = {
            "schedule_id": f"sched_{now.strftime('%Y%m%d%H%M%S')}",
            "name": schedule_name,
            "report_config": report_config,
            "schedule": schedule,
            "next_run": next_run.isoformat(),
            "created_at": now.isoformat(),
            "status": "active"
        }
        
        # Planungsdaten in eine JSON-Datei schreiben
        output_dir = os.path.join('schedules')
        os.makedirs(output_dir, exist_ok=True)
        schedule_file = os.path.join(output_dir, f"{schedule_name.replace(' ', '_')}.json")
        
        with open(schedule_file, 'w') as f:
            json.dump(schedule_data, f, indent=2)
        
        update_task_progress(self.request.id, 100, "Berichtsplanung abgeschlossen")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "schedule_id": schedule_data["schedule_id"],
            "name": schedule_name,
            "frequency": frequency,
            "next_run": next_run.isoformat(),
            "schedule_file": schedule_file,
            "created_at": now.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Planung des wiederkehrenden Berichts: {str(e)}")
        raise

@shared_task
def check_scheduled_reports() -> Dict[str, Any]:
    """
    Überprüft alle geplanten Berichte und führt sie aus, wenn sie fällig sind.
    
    Returns:
        Dict mit Informationen zu den ausgeführten Berichten
    """
    logger.info("Überprüfe geplante Berichte")
    
    try:
        # Datenbankverbindung herstellen
        from backend.db.database import SessionLocal
        from backend.models.reports import ReportSchedule
        from datetime import datetime, timedelta
        import croniter
        
        # Aktuelle Zeit
        now = datetime.now()
        
        # Datenbankverbindung herstellen
        db = SessionLocal()
        
        try:
            # Aktive Zeitpläne abrufen
            schedules = db.query(ReportSchedule).filter(ReportSchedule.is_active == True).all()
            
            logger.info(f"{len(schedules)} aktive Berichtszeitpläne gefunden")
            
            executed_reports = []
            
            # Jeden Zeitplan überprüfen
            for schedule in schedules:
                try:
                    # Wenn noch keine letzte Ausführung vorhanden ist, jetzt ausführen
                    if not schedule.last_run:
                        should_run = True
                        next_run = now
                    else:
                        # Cron-Ausdruck parsen
                        cron = croniter.croniter(schedule.cron_expression, schedule.last_run)
                        
                        # Nächste Ausführungszeit bestimmen
                        next_run = cron.get_next(datetime)
                        
                        # Prüfen, ob die nächste Ausführungszeit in der Vergangenheit liegt
                        should_run = next_run <= now
                    
                    # Zeitplan für die nächste Ausführung aktualisieren
                    if next_run != schedule.next_run:
                        schedule.next_run = next_run
                        db.commit()
                    
                    # Bericht ausführen, wenn er fällig ist
                    if should_run:
                        logger.info(f"Führe geplanten Bericht aus: {schedule.name} (ID: {schedule.id})")
                        
                        # Berichtsdaten vorbereiten
                        report_config = {
                            "name": schedule.report.name,
                            "type": schedule.report.report_type,
                            "data_source": schedule.parameters.get("data_source", {"type": "default"}),
                            "format": schedule.report.report_type,
                            "recipients": schedule.recipients
                        }
                        
                        # Bericht im Hintergrund generieren
                        result = generate_scheduled_report.delay(report_config).get()
                        
                        # Zeitplan aktualisieren
                        schedule.last_run = now
                        db.commit()
                        
                        executed_reports.append({
                            "schedule_id": schedule.id,
                            "report_id": schedule.report_id,
                            "name": schedule.name,
                            "result": result
                        })
                        
                except Exception as schedule_error:
                    logger.error(f"Fehler bei der Ausführung des geplanten Berichts {schedule.id}: {str(schedule_error)}")
            
            return {
                "status": "success",
                "executed_reports_count": len(executed_reports),
                "executed_reports": executed_reports,
                "checked_at": now.isoformat()
            }
            
        except Exception as db_error:
            logger.error(f"Datenbankfehler bei der Überprüfung geplanter Berichte: {str(db_error)}")
            raise
        finally:
            db.close()
            
    except ImportError:
        logger.warning("Datenbankmodule nicht verfügbar, geplante Berichte werden nicht überprüft")
        
        return {
            "status": "error",
            "error": "Datenbankmodule nicht verfügbar",
            "checked_at": datetime.now().isoformat()
        }

@shared_task
def cleanup_old_reports(days: int = 30) -> Dict[str, Any]:
    """
    Löscht alte Berichtsdateien, die älter als die angegebene Anzahl von Tagen sind.
    
    Args:
        days: Anzahl der Tage, nach denen Berichte gelöscht werden sollen
    
    Returns:
        Dict mit Informationen zu den gelöschten Berichten
    """
    logger.info(f"Lösche Berichte, die älter als {days} Tage sind")
    
    try:
        # Datenbankverbindung herstellen
        from backend.db.database import SessionLocal
        from backend.models.reports import Report
        from datetime import datetime, timedelta
        import os
        
        # Zeitpunkt berechnen, vor dem Berichte gelöscht werden sollen
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Datenbankverbindung herstellen
        db = SessionLocal()
        
        try:
            # Alte Berichte abrufen
            old_reports = db.query(Report).filter(Report.created_at < cutoff_date).all()
            
            logger.info(f"{len(old_reports)} alte Berichte gefunden")
            
            deleted_files = []
            not_found_files = []
            
            # Jeden Bericht überprüfen
            for report in old_reports:
                if report.file_path and os.path.exists(report.file_path):
                    try:
                        # Datei löschen
                        os.remove(report.file_path)
                        
                        # Datei als gelöscht markieren
                        deleted_files.append(report.file_path)
                        
                        # Dateipfad im Bericht zurücksetzen
                        report.file_path = None
                        
                        logger.info(f"Berichtsdatei gelöscht: {report.file_path}")
                    except Exception as file_error:
                        logger.error(f"Fehler beim Löschen der Berichtsdatei {report.file_path}: {str(file_error)}")
                elif report.file_path:
                    # Dateipfad im Bericht zurücksetzen, da die Datei nicht existiert
                    report.file_path = None
                    not_found_files.append(report.file_path)
            
            # Änderungen speichern
            db.commit()
            
            return {
                "status": "success",
                "deleted_files_count": len(deleted_files),
                "not_found_files_count": len(not_found_files),
                "cutoff_date": cutoff_date.isoformat(),
                "cleaned_at": datetime.now().isoformat()
            }
            
        except Exception as db_error:
            logger.error(f"Datenbankfehler beim Löschen alter Berichte: {str(db_error)}")
            raise
        finally:
            db.close()
            
    except ImportError:
        logger.warning("Datenbankmodule nicht verfügbar, alte Berichte werden nicht gelöscht")
        
        return {
            "status": "error",
            "error": "Datenbankmodule nicht verfügbar",
            "cleaned_at": datetime.now().isoformat()
        } 