"""
Periodische Tasks für das VALEO-NeuroERP-System.

Diese Datei enthält periodische Tasks, die mit Celery Beat in regelmäßigen
Abständen ausgeführt werden. Diese Tasks dienen unter anderem der Konsolidierung
von Daten, der Überprüfung auf verlorene Tasks und der Durchführung von Wartungsarbeiten.
"""

import logging
import os
import shutil
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union

from celery import shared_task
from celery.schedules import crontab
from django.db import connection, transaction
from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from backend.services.task_queue import ensure_tasks_executed, update_task_progress, retry_task_with_exponential_backoff
from backend.models.async_task import AsyncTask, PeriodicTask
from backend.celery_app import app

logger = logging.getLogger(__name__)


@shared_task
def cleanup_old_task_records():
    """
    Bereinigt alte Task-Datensätze aus der Datenbank.
    
    Entfernt abgeschlossene Tasks, die älter als 30 Tage sind,
    um die Datenbankgröße zu kontrollieren.
    """
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Abgeschlossene Tasks finden
    completed_tasks = AsyncTask.objects.filter(
        Q(status='SUCCESS') | Q(status='FAILURE') | Q(status='REVOKED'),
        completed_at__lt=thirty_days_ago
    )
    
    count = completed_tasks.count()
    if count > 0:
        logger.info(f"Lösche {count} alte Task-Datensätze")
        completed_tasks.delete()
    
    return count


@shared_task
def detect_stalled_tasks():
    """
    Erkennt hängengebliebene Tasks und markiert sie als fehlgeschlagen.
    
    Ein Task gilt als hängengeblieben, wenn er sich seit mehr als 3 Stunden
    im Status 'RUNNING' oder 'STARTED' befindet.
    """
    three_hours_ago = timezone.now() - timedelta(hours=3)
    
    # Hängengebliebene Tasks finden
    stalled_tasks = AsyncTask.objects.filter(
        Q(status='RUNNING') | Q(status='STARTED'),
        started_at__lt=three_hours_ago
    )
    
    count = stalled_tasks.count()
    if count > 0:
        logger.warning(f"Gefunden: {count} hängengebliebene Tasks")
        
        for task in stalled_tasks:
            logger.warning(f"Task {task.task_name}[{task.task_id}] hängt seit {timezone.now() - task.started_at}")
            
            # Task als fehlgeschlagen markieren
            task.status = 'FAILURE'
            task.error = 'Task wurde automatisch als fehlgeschlagen markiert, da er hängengeblieben ist'
            task.save()
    
    return count


@shared_task
def retry_failed_tasks():
    """
    Versucht fehlgeschlagene Tasks erneut auszuführen, wenn sie weniger als
    die maximale Anzahl an Wiederholungsversuchen erreicht haben.
    """
    # Fehlgeschlagene Tasks finden, die noch nicht die maximale Anzahl an Wiederholungen erreicht haben
    failed_tasks = AsyncTask.objects.filter(
        status='FAILURE',
        retries__lt=models.F('max_retries')
    )
    
    count = failed_tasks.count()
    if count > 0:
        logger.info(f"Versuche {count} fehlgeschlagene Tasks erneut auszuführen")
        
        from backend.services.task_queue import app
        
        for task in failed_tasks:
            try:
                # Task-Funktion finden
                task_func = app.tasks.get(task.task_name)
                
                if task_func:
                    # Task erneut ausführen
                    logger.info(f"Führe Task {task.task_name}[{task.task_id}] erneut aus (Versuch {task.retries + 1}/{task.max_retries})")
                    
                    # Neuen Task erstellen
                    new_task = task_func.apply_async(
                        args=task.args,
                        kwargs=task.kwargs,
                        countdown=60 * (2 ** task.retries)  # Exponentielles Backoff
                    )
                    
                    # Alten Task aktualisieren
                    task.retries += 1
                    task.save()
                else:
                    logger.error(f"Task-Funktion {task.task_name} nicht gefunden")
            except Exception as e:
                logger.error(f"Fehler beim erneuten Ausführen von Task {task.task_name}[{task.task_id}]: {e}")
    
    return count


@shared_task
def execute_dynamic_periodic_tasks():
    """
    Führt dynamisch konfigurierte periodische Tasks aus.
    
    Diese Funktion liest die Konfiguration aus der Datenbank und führt
    Tasks aus, die gemäß ihrem Zeitplan fällig sind.
    """
    from backend.services.task_queue import app
    
    # Aktivierte periodische Tasks finden
    periodic_tasks = PeriodicTask.objects.filter(enabled=True)
    now = timezone.now()
    executed_count = 0
    
    for ptask in periodic_tasks:
        try:
            # Prüfen, ob der Task ausgeführt werden soll
            should_run = False
            
            # Wenn der Task noch nie ausgeführt wurde, sofort ausführen
            if not ptask.last_run_at:
                should_run = True
            # Sonst Intervall prüfen
            elif ptask.interval_type and ptask.interval_value:
                if ptask.interval_type == 'minutely':
                    next_run = ptask.last_run_at + timedelta(minutes=ptask.interval_value)
                elif ptask.interval_type == 'hourly':
                    next_run = ptask.last_run_at + timedelta(hours=ptask.interval_value)
                elif ptask.interval_type == 'daily':
                    next_run = ptask.last_run_at + timedelta(days=ptask.interval_value)
                elif ptask.interval_type == 'weekly':
                    next_run = ptask.last_run_at + timedelta(weeks=ptask.interval_value)
                elif ptask.interval_type == 'monthly':
                    # Ungefähre Berechnung für Monate
                    next_run = ptask.last_run_at + timedelta(days=30 * ptask.interval_value)
                
                should_run = now >= next_run
            
            # Cron-Ausdrücke werden hier nicht unterstützt, da sie komplexer sind
            # und eine zusätzliche Bibliothek wie python-crontab erfordern würden
            
            if should_run:
                # Task-Funktion finden
                task_func = app.tasks.get(ptask.task_name)
                
                if task_func:
                    # Task ausführen
                    logger.info(f"Führe periodischen Task {ptask.name} aus")
                    task_func.apply_async(args=ptask.args, kwargs=ptask.kwargs)
                    
                    # Task-Metadaten aktualisieren
                    ptask.last_run_at = now
                    ptask.total_run_count += 1
                    ptask.save()
                    
                    executed_count += 1
                else:
                    logger.error(f"Task-Funktion {ptask.task_name} für periodischen Task {ptask.name} nicht gefunden")
        except Exception as e:
            logger.error(f"Fehler beim Ausführen des periodischen Tasks {ptask.name}: {e}")
    
    return executed_count


@shared_task
def ensure_transaction_processing():
    """
    Stellt sicher, dass alle Transaktionen verarbeitet werden.
    
    Diese Funktion überprüft, ob es Transaktionen gibt, die noch nicht
    verarbeitet wurden, und reiht entsprechende Tasks ein.
    """
    from backend.models.transaction import Transaction
    from backend.tasks.transaction_tasks import process_transaction
    
    # Nicht verarbeitete Transaktionen finden
    unprocessed = Transaction.objects.filter(processed=False)
    
    count = unprocessed.count()
    if count > 0:
        logger.info(f"Gefunden: {count} nicht verarbeitete Transaktionen")
        
        for transaction in unprocessed:
            logger.info(f"Stelle sicher, dass Transaktion {transaction.id} verarbeitet wird")
            process_transaction.delay(transaction.id)
    
    return count


@shared_task
def monitor_system_health():
    """
    Überwacht die Systemgesundheit und sendet Warnungen bei Problemen.
    
    Diese Funktion überprüft verschiedene Systemmetriken und sendet
    Warnungen, wenn Schwellenwerte überschritten werden.
    """
    from django.db import connection
    
    # Datenbankverbindung prüfen
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        logger.critical(f"Datenbankverbindung fehlgeschlagen: {e}")
        # Hier könnte eine Benachrichtigung gesendet werden
    
    # Anzahl der ausstehenden Tasks prüfen
    pending_tasks = AsyncTask.objects.filter(
        Q(status='PENDING') | Q(status='RECEIVED')
    ).count()
    
    if pending_tasks > 1000:  # Schwellenwert
        logger.warning(f"Hohe Anzahl ausstehender Tasks: {pending_tasks}")
        # Hier könnte eine Benachrichtigung gesendet werden
    
    # Anzahl der fehlgeschlagenen Tasks prüfen
    failed_tasks = AsyncTask.objects.filter(
        status='FAILURE',
        created_at__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    if failed_tasks > 50:  # Schwellenwert
        logger.critical(f"Hohe Anzahl fehlgeschlagener Tasks in der letzten Stunde: {failed_tasks}")
        # Hier könnte eine Benachrichtigung gesendet werden
    
    return {
        'pending_tasks': pending_tasks,
        'failed_tasks': failed_tasks
    }


# Beispiel für einen Task, der sicherstellt, dass alle E-Mails gesendet wurden
@shared_task
def ensure_emails_sent():
    """
    Stellt sicher, dass alle E-Mails gesendet wurden.
    
    Diese Funktion überprüft, ob es Benutzer gibt, die ihre Aktivierungs-E-Mail
    noch nicht erhalten haben, und sendet diese erneut.
    """
    from backend.models.user import User
    from backend.tasks.notification_tasks import send_activation_email
    
    ensure_tasks_executed(
        User,
        {'is_activation_email_sent': False},
        send_activation_email
    )
    
    return "E-Mail-Überprüfung abgeschlossen"


@shared_task(bind=True)
def cleanup_old_tasks(self, days: int = 30) -> Dict[str, Any]:
    """
    Bereinigt alte Task-Einträge aus der Datenbank.
    
    Args:
        days: Anzahl der Tage, nach denen Tasks als alt gelten
        
    Returns:
        Dictionary mit Informationen zur Bereinigung
    """
    try:
        # Datum berechnen, vor dem Tasks als alt gelten
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, f"Bereinigung von Tasks älter als {days} Tage gestartet")
        
        # Alte Tasks finden
        update_task_progress(self.request.id, 20, "Alte Tasks werden identifiziert")
        old_tasks = AsyncTask.objects.filter(created_at__lt=cutoff_date, status__in=['completed', 'failed', 'cancelled'])
        
        # Anzahl der zu löschenden Tasks
        count = old_tasks.count()
        
        if count == 0:
            update_task_progress(self.request.id, 100, "Keine alten Tasks zum Bereinigen gefunden")
            return {
                "status": "success",
                "message": "Keine alten Tasks zum Bereinigen gefunden",
                "deleted_count": 0
            }
        
        # Tasks löschen
        update_task_progress(self.request.id, 50, f"{count} alte Tasks werden gelöscht")
        old_tasks.delete()
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, f"{count} alte Tasks wurden erfolgreich bereinigt")
        
        return {
            "status": "success",
            "deleted_count": count,
            "cutoff_date": cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Bereinigung alter Tasks: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@shared_task(bind=True)
def create_database_backup(self, backup_dir: Optional[str] = None) -> Dict[str, Any]:
    """
    Erstellt ein Backup der Datenbank.
    
    Args:
        backup_dir: Verzeichnis für das Backup (optional)
        
    Returns:
        Dictionary mit Informationen zum Backup
    """
    try:
        # Standardwert für das Backup-Verzeichnis
        if backup_dir is None:
            backup_dir = os.path.join(settings.BASE_DIR, 'backups', 'database')
        
        # Sicherstellen, dass das Backup-Verzeichnis existiert
        os.makedirs(backup_dir, exist_ok=True)
        
        # Zeitstempel für den Dateinamen
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"db_backup_{timestamp}.sql"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Datenbank-Backup wird erstellt")
        
        # Datenbankeinstellungen aus den Django-Einstellungen holen
        db_settings = settings.DATABASES['default']
        db_engine = db_settings['ENGINE']
        
        # Je nach Datenbanktyp unterschiedliche Backup-Methode verwenden
        if 'postgresql' in db_engine:
            update_task_progress(self.request.id, 10, "PostgreSQL-Backup wird erstellt")
            _create_postgresql_backup(db_settings, backup_path)
        elif 'mysql' in db_engine:
            update_task_progress(self.request.id, 10, "MySQL-Backup wird erstellt")
            _create_mysql_backup(db_settings, backup_path)
        elif 'sqlite3' in db_engine:
            update_task_progress(self.request.id, 10, "SQLite-Backup wird erstellt")
            _create_sqlite_backup(db_settings, backup_path)
        else:
            raise ValueError(f"Nicht unterstützter Datenbanktyp: {db_engine}")
        
        # Backup-Größe ermitteln
        backup_size = os.path.getsize(backup_path)
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, f"Datenbank-Backup wurde erfolgreich erstellt: {backup_filename}")
        
        return {
            "status": "success",
            "backup_path": backup_path,
            "backup_size": backup_size,
            "timestamp": timestamp
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Erstellung des Datenbank-Backups: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@shared_task(bind=True)
def cleanup_temporary_files(self, days: int = 7) -> Dict[str, Any]:
    """
    Bereinigt temporäre Dateien, die älter als die angegebene Anzahl von Tagen sind.
    
    Args:
        days: Anzahl der Tage, nach denen temporäre Dateien gelöscht werden sollen
        
    Returns:
        Dictionary mit Informationen zur Bereinigung
    """
    try:
        # Datum berechnen, vor dem Dateien als alt gelten
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Temporäre Verzeichnisse
        temp_dirs = [
            os.path.join(settings.MEDIA_ROOT, 'temp'),
            os.path.join(settings.MEDIA_ROOT, 'uploads', 'temp'),
            os.path.join(settings.MEDIA_ROOT, 'exports', 'temp')
        ]
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, f"Bereinigung von temporären Dateien älter als {days} Tage gestartet")
        
        total_deleted = 0
        total_size = 0
        
        # Jedes temporäre Verzeichnis durchsuchen
        for i, temp_dir in enumerate(temp_dirs):
            if not os.path.exists(temp_dir):
                continue
            
            # Fortschritt aktualisieren
            progress = int((i / len(temp_dirs)) * 90) + 5
            update_task_progress(self.request.id, progress, f"Verzeichnis wird durchsucht: {temp_dir}")
            
            # Dateien im Verzeichnis durchsuchen
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    
                    # Dateiinformationen abrufen
                    try:
                        file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                        
                        # Prüfen, ob die Datei älter als das Cutoff-Datum ist
                        if file_time < cutoff_date:
                            # Dateigröße ermitteln
                            file_size = os.path.getsize(file_path)
                            total_size += file_size
                            
                            # Datei löschen
                            os.remove(file_path)
                            total_deleted += 1
                    except (FileNotFoundError, PermissionError) as e:
                        logger.warning(f"Fehler beim Zugriff auf Datei {file_path}: {str(e)}")
                        continue
        
        # Abschließenden Fortschritt melden
        update_task_progress(
            self.request.id, 
            100, 
            f"{total_deleted} temporäre Dateien ({_format_size(total_size)}) wurden erfolgreich bereinigt"
        )
        
        return {
            "status": "success",
            "deleted_count": total_deleted,
            "deleted_size": total_size,
            "formatted_size": _format_size(total_size),
            "cutoff_date": cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Bereinigung temporärer Dateien: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@shared_task(bind=True)
def optimize_database(self) -> Dict[str, Any]:
    """
    Optimiert die Datenbank durch Ausführung von Wartungsoperationen.
    
    Returns:
        Dictionary mit Informationen zur Optimierung
    """
    try:
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Datenbankoptimierung gestartet")
        
        # Datenbankeinstellungen aus den Django-Einstellungen holen
        db_settings = settings.DATABASES['default']
        db_engine = db_settings['ENGINE']
        
        # Je nach Datenbanktyp unterschiedliche Optimierungsoperationen ausführen
        if 'postgresql' in db_engine:
            update_task_progress(self.request.id, 10, "PostgreSQL-Optimierung wird durchgeführt")
            operations = _optimize_postgresql()
        elif 'mysql' in db_engine:
            update_task_progress(self.request.id, 10, "MySQL-Optimierung wird durchgeführt")
            operations = _optimize_mysql()
        elif 'sqlite3' in db_engine:
            update_task_progress(self.request.id, 10, "SQLite-Optimierung wird durchgeführt")
            operations = _optimize_sqlite()
        else:
            raise ValueError(f"Nicht unterstützter Datenbanktyp: {db_engine}")
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, "Datenbankoptimierung erfolgreich abgeschlossen")
        
        return {
            "status": "success",
            "operations": operations,
            "database_type": db_engine
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Datenbankoptimierung: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@shared_task(bind=True)
def generate_system_report(self) -> Dict[str, Any]:
    """
    Generiert einen Systembericht mit Informationen über den Zustand des Systems.
    
    Returns:
        Dictionary mit dem Systembericht
    """
    try:
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Systembericht wird generiert")
        
        # Aktuelle Zeit
        now = datetime.now()
        
        # Systemstatistiken sammeln
        update_task_progress(self.request.id, 10, "Systemstatistiken werden gesammelt")
        system_stats = _collect_system_stats()
        
        # Datenbankstatistiken sammeln
        update_task_progress(self.request.id, 30, "Datenbankstatistiken werden gesammelt")
        db_stats = _collect_database_stats()
        
        # Anwendungsstatistiken sammeln
        update_task_progress(self.request.id, 50, "Anwendungsstatistiken werden gesammelt")
        app_stats = _collect_application_stats()
        
        # Task-Queue-Statistiken sammeln
        update_task_progress(self.request.id, 70, "Task-Queue-Statistiken werden gesammelt")
        queue_stats = _collect_task_queue_stats()
        
        # Bericht zusammenstellen
        update_task_progress(self.request.id, 90, "Bericht wird zusammengestellt")
        report = {
            "timestamp": now.isoformat(),
            "system": system_stats,
            "database": db_stats,
            "application": app_stats,
            "task_queue": queue_stats
        }
        
        # Bericht speichern
        report_dir = os.path.join(settings.BASE_DIR, 'reports', 'system')
        os.makedirs(report_dir, exist_ok=True)
        
        report_filename = f"system_report_{now.strftime('%Y%m%d_%H%M%S')}.json"
        report_path = os.path.join(report_dir, report_filename)
        
        import json
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, "Systembericht erfolgreich generiert")
        
        return {
            "status": "success",
            "report": report,
            "report_path": report_path
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Generierung des Systemberichts: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@shared_task(bind=True)
def rotate_log_files(self, max_logs: int = 10) -> Dict[str, Any]:
    """
    Rotiert Logdateien und behält nur die angegebene Anzahl von Dateien.
    
    Args:
        max_logs: Maximale Anzahl von Logdateien, die behalten werden sollen
        
    Returns:
        Dictionary mit Informationen zur Rotation
    """
    try:
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Logdatei-Rotation gestartet")
        
        # Log-Verzeichnis aus den Django-Einstellungen holen
        log_dir = getattr(settings, 'LOG_DIR', os.path.join(settings.BASE_DIR, 'logs'))
        
        # Sicherstellen, dass das Log-Verzeichnis existiert
        if not os.path.exists(log_dir):
            update_task_progress(self.request.id, 100, "Kein Log-Verzeichnis gefunden")
            return {
                "status": "success",
                "message": "Kein Log-Verzeichnis gefunden",
                "rotated_count": 0
            }
        
        # Logdateien im Verzeichnis finden
        update_task_progress(self.request.id, 20, "Logdateien werden gesucht")
        log_files = []
        
        for filename in os.listdir(log_dir):
            if filename.endswith('.log'):
                file_path = os.path.join(log_dir, filename)
                if os.path.isfile(file_path):
                    # Dateiinformationen sammeln
                    stat = os.stat(file_path)
                    log_files.append({
                        'path': file_path,
                        'filename': filename,
                        'size': stat.st_size,
                        'mtime': stat.st_mtime
                    })
        
        # Keine Logdateien gefunden
        if not log_files:
            update_task_progress(self.request.id, 100, "Keine Logdateien gefunden")
            return {
                "status": "success",
                "message": "Keine Logdateien gefunden",
                "rotated_count": 0
            }
        
        # Logdateien nach Änderungsdatum sortieren (neueste zuerst)
        log_files.sort(key=lambda x: x['mtime'], reverse=True)
        
        # Zu viele Logdateien? Alte löschen
        update_task_progress(self.request.id, 50, "Alte Logdateien werden rotiert")
        
        rotated_count = 0
        total_size = 0
        
        if len(log_files) > max_logs:
            for log_file in log_files[max_logs:]:
                # Datei löschen
                os.remove(log_file['path'])
                rotated_count += 1
                total_size += log_file['size']
        
        # Abschließenden Fortschritt melden
        update_task_progress(
            self.request.id, 
            100, 
            f"{rotated_count} Logdateien ({_format_size(total_size)}) wurden rotiert"
        )
        
        return {
            "status": "success",
            "rotated_count": rotated_count,
            "rotated_size": total_size,
            "formatted_size": _format_size(total_size),
            "remaining_logs": min(len(log_files), max_logs)
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Rotation von Logdateien: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


def _create_postgresql_backup(db_settings: Dict[str, Any], backup_path: str) -> None:
    """
    Erstellt ein Backup einer PostgreSQL-Datenbank.
    
    Args:
        db_settings: Datenbankeinstellungen
        backup_path: Pfad für die Backup-Datei
    """
    import subprocess
    
    # PostgreSQL-Verbindungsparameter
    host = db_settings.get('HOST', 'localhost')
    port = db_settings.get('PORT', '5432')
    name = db_settings.get('NAME', '')
    user = db_settings.get('USER', '')
    password = db_settings.get('PASSWORD', '')
    
    # Umgebungsvariablen für das Passwort
    env = os.environ.copy()
    env['PGPASSWORD'] = password
    
    # pg_dump-Befehl ausführen
    cmd = [
        'pg_dump',
        f'--host={host}',
        f'--port={port}',
        f'--username={user}',
        '--format=plain',
        '--no-owner',
        '--no-acl',
        f'--file={backup_path}',
        name
    ]
    
    subprocess.run(cmd, env=env, check=True)


def _create_mysql_backup(db_settings: Dict[str, Any], backup_path: str) -> None:
    """
    Erstellt ein Backup einer MySQL-Datenbank.
    
    Args:
        db_settings: Datenbankeinstellungen
        backup_path: Pfad für die Backup-Datei
    """
    import subprocess
    
    # MySQL-Verbindungsparameter
    host = db_settings.get('HOST', 'localhost')
    port = db_settings.get('PORT', '3306')
    name = db_settings.get('NAME', '')
    user = db_settings.get('USER', '')
    password = db_settings.get('PASSWORD', '')
    
    # mysqldump-Befehl ausführen
    cmd = [
        'mysqldump',
        f'--host={host}',
        f'--port={port}',
        f'--user={user}',
        f'--password={password}',
        '--single-transaction',
        '--routines',
        '--triggers',
        '--events',
        name
    ]
    
    with open(backup_path, 'w') as f:
        subprocess.run(cmd, stdout=f, check=True)


def _create_sqlite_backup(db_settings: Dict[str, Any], backup_path: str) -> None:
    """
    Erstellt ein Backup einer SQLite-Datenbank.
    
    Args:
        db_settings: Datenbankeinstellungen
        backup_path: Pfad für die Backup-Datei
    """
    # SQLite-Datenbankdatei
    db_file = db_settings.get('NAME', '')
    
    # Datei kopieren
    shutil.copy2(db_file, backup_path)


def _optimize_postgresql() -> List[Dict[str, Any]]:
    """
    Führt Optimierungsoperationen für eine PostgreSQL-Datenbank durch.
    
    Returns:
        Liste von durchgeführten Operationen
    """
    operations = []
    
    with connection.cursor() as cursor:
        # VACUUM ANALYZE für alle Tabellen
        cursor.execute("VACUUM ANALYZE")
        operations.append({
            "operation": "VACUUM ANALYZE",
            "description": "Aktualisiert Statistiken und bereinigt tote Tupel"
        })
        
        # REINDEX für alle Indizes
        cursor.execute("REINDEX DATABASE CURRENT_DATABASE")
        operations.append({
            "operation": "REINDEX DATABASE",
            "description": "Indizes neu erstellen"
        })
    
    return operations


def _optimize_mysql() -> List[Dict[str, Any]]:
    """
    Führt Optimierungsoperationen für eine MySQL-Datenbank durch.
    
    Returns:
        Liste von durchgeführten Operationen
    """
    operations = []
    
    with connection.cursor() as cursor:
        # Tabellen optimieren
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]
        
        for table in tables:
            cursor.execute(f"OPTIMIZE TABLE `{table}`")
            operations.append({
                "operation": f"OPTIMIZE TABLE {table}",
                "description": f"Tabelle {table} optimiert"
            })
    
    return operations


def _optimize_sqlite() -> List[Dict[str, Any]]:
    """
    Führt Optimierungsoperationen für eine SQLite-Datenbank durch.
    
    Returns:
        Liste von durchgeführten Operationen
    """
    operations = []
    
    with connection.cursor() as cursor:
        # VACUUM
        cursor.execute("VACUUM")
        operations.append({
            "operation": "VACUUM",
            "description": "Datenbank komprimiert und defragmentiert"
        })
        
        # ANALYZE
        cursor.execute("ANALYZE")
        operations.append({
            "operation": "ANALYZE",
            "description": "Statistiken für den Query-Planer aktualisiert"
        })
    
    return operations


def _collect_system_stats() -> Dict[str, Any]:
    """
    Sammelt Systemstatistiken.
    
    Returns:
        Dictionary mit Systemstatistiken
    """
    import platform
    import psutil
    
    # Systemstatistiken
    system_stats = {
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "cpu_usage": psutil.cpu_percent(interval=1),
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
        "memory_used": psutil.virtual_memory().used,
        "memory_percent": psutil.virtual_memory().percent,
        "disk_usage": {
            "total": psutil.disk_usage('/').total,
            "used": psutil.disk_usage('/').used,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent
        }
    }
    
    return system_stats


def _collect_database_stats() -> Dict[str, Any]:
    """
    Sammelt Datenbankstatistiken.
    
    Returns:
        Dictionary mit Datenbankstatistiken
    """
    from django.apps import apps
    
    # Datenbankstatistiken
    db_stats = {
        "engine": settings.DATABASES['default']['ENGINE'],
        "tables": {}
    }
    
    # Für jedes Modell die Anzahl der Datensätze zählen
    for model in apps.get_models():
        try:
            count = model.objects.count()
            db_stats["tables"][model._meta.db_table] = {
                "model": f"{model._meta.app_label}.{model._meta.model_name}",
                "count": count
            }
        except:
            # Einige Modelle können nicht gezählt werden (z.B. Proxy-Modelle)
            pass
    
    return db_stats


def _collect_application_stats() -> Dict[str, Any]:
    """
    Sammelt Anwendungsstatistiken.
    
    Returns:
        Dictionary mit Anwendungsstatistiken
    """
    from django.apps import apps
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Anwendungsstatistiken
    app_stats = {
        "installed_apps": settings.INSTALLED_APPS,
        "user_count": User.objects.count(),
        "active_user_count": User.objects.filter(is_active=True).count(),
        "staff_user_count": User.objects.filter(is_staff=True).count(),
        "superuser_count": User.objects.filter(is_superuser=True).count()
    }
    
    return app_stats


def _collect_task_queue_stats() -> Dict[str, Any]:
    """
    Sammelt Task-Queue-Statistiken.
    
    Returns:
        Dictionary mit Task-Queue-Statistiken
    """
    from celery.app.control import Control
    from backend.celery import app
    
    control = Control(app)
    
    # Task-Queue-Statistiken
    queue_stats = {
        "active_tasks": [],
        "scheduled_tasks": [],
        "reserved_tasks": []
    }
    
    # Aktive Tasks
    active = control.inspect().active()
    if active:
        for worker, tasks in active.items():
            for task in tasks:
                queue_stats["active_tasks"].append({
                    "id": task.get('id'),
                    "name": task.get('name'),
                    "worker": worker,
                    "time_start": task.get('time_start')
                })
    
    # Geplante Tasks
    scheduled = control.inspect().scheduled()
    if scheduled:
        for worker, tasks in scheduled.items():
            for task in tasks:
                queue_stats["scheduled_tasks"].append({
                    "id": task.get('request', {}).get('id'),
                    "name": task.get('request', {}).get('name'),
                    "worker": worker,
                    "eta": task.get('eta')
                })
    
    # Reservierte Tasks
    reserved = control.inspect().reserved()
    if reserved:
        for worker, tasks in reserved.items():
            for task in tasks:
                queue_stats["reserved_tasks"].append({
                    "id": task.get('id'),
                    "name": task.get('name'),
                    "worker": worker
                })
    
    return queue_stats


def _format_size(size_bytes: int) -> str:
    """
    Formatiert eine Größe in Bytes in eine menschenlesbare Form.
    
    Args:
        size_bytes: Größe in Bytes
        
    Returns:
        Formatierte Größe
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    i = 0
    
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}" 