"""
Report-Service für das VALEO-NeuroERP-System.

Dieses Modul stellt Funktionen für die Verwaltung und Verteilung von Berichten bereit.
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from sqlalchemy.orm import Session
from celery import Celery

from backend.models.reports import Report, ReportDistribution, ReportSchedule, ReportFile
from backend.services.email_service import EmailService
from backend.tasks.report_tasks import (
    generate_pdf_report,
    generate_excel_export,
    create_visualization
)
from backend.schemas.reports import ReportCreate, ReportUpdate, ReportScheduleCreate

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Celery-Konfiguration
celery_app = Celery('report_tasks')
celery_app.config_from_object('backend.config.celery_config')

class ReportService:
    """
    Service für die Verwaltung und Verteilung von Berichten.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_report(self, report_data: ReportCreate) -> Report:
        """
        Erstellt einen neuen Bericht.
        
        Args:
            report_data: Die Daten für den neuen Bericht
            
        Returns:
            Der erstellte Bericht
        """
        report = Report(
            name=report_data.name,
            report_type=report_data.report_type,
            description=report_data.description,
            query=report_data.query,
            parameters=report_data.parameters,
            created_by=report_data.created_by
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        logger.info(f"Bericht erstellt: {report.name} (ID: {report.id})")
        
        return report
    
    def get_report(self, report_id: int) -> Optional[Report]:
        """
        Ruft einen Bericht anhand seiner ID ab.
        
        Args:
            report_id: Die ID des abzurufenden Berichts
            
        Returns:
            Der abgerufene Bericht oder None, wenn kein Bericht gefunden wurde
        """
        report = self.db.query(Report).filter(Report.id == report_id).first()
        return report
    
    def get_reports(self, skip: int = 0, limit: int = 100) -> List[Report]:
        """
        Ruft eine Liste von Berichten ab.
        
        Args:
            skip: Die Anzahl der zu überspringenden Berichte
            limit: Die maximale Anzahl der zurückzugebenden Berichte
            
        Returns:
            Eine Liste von Berichten
        """
        return self.db.query(Report).offset(skip).limit(limit).all()
    
    def update_report(self, report_id: int, report_data: ReportUpdate) -> Optional[Report]:
        """
        Aktualisiert einen Bericht.
        
        Args:
            report_id: Die ID des zu aktualisierenden Berichts
            report_data: Die neuen Daten für den Bericht
            
        Returns:
            Der aktualisierte Bericht oder None, wenn kein Bericht gefunden wurde
        """
        report = self.get_report(report_id)
        if not report:
            return None
        
        # Aktualisiere die Felder, wenn sie im report_data vorhanden sind
        if report_data.name is not None:
            report.name = report_data.name
        if report_data.report_type is not None:
            report.report_type = report_data.report_type
        if report_data.description is not None:
            report.description = report_data.description
        if report_data.query is not None:
            report.query = report_data.query
        if report_data.parameters is not None:
            report.parameters = report_data.parameters
        
        report.updated_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(report)
        
        logger.info(f"Bericht aktualisiert: {report.name} (ID: {report.id})")
        
        return report
    
    def delete_report(self, report_id: int) -> bool:
        """
        Löscht einen Bericht.
        
        Args:
            report_id: Die ID des zu löschenden Berichts
            
        Returns:
            True, wenn der Bericht gelöscht wurde, False sonst
        """
        report = self.get_report(report_id)
        if not report:
            return False
        
        self.db.delete(report)
        self.db.commit()
        
        logger.info(f"Bericht gelöscht: {report.name} (ID: {report.id})")
        
        return True
    
    def create_schedule(self, schedule_data: ReportScheduleCreate) -> Optional[ReportSchedule]:
        """
        Erstellt einen neuen Zeitplan für einen Bericht.
        
        Args:
            schedule_data: Die Daten für den neuen Zeitplan
            
        Returns:
            Der erstellte Zeitplan oder None, wenn der Bericht nicht gefunden wurde
        """
        report = self.get_report(schedule_data.report_id)
        if not report:
            return None
        
        schedule = ReportSchedule(
            report_id=schedule_data.report_id,
            schedule_type=schedule_data.schedule_type,
            cron_expression=schedule_data.cron_expression,
            is_active=schedule_data.is_active
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        logger.info(f"Zeitplan erstellt für Bericht: {report.name} (ID: {report.id})")
        
        return schedule
    
    def generate_report(self, report_id: int, parameters: Optional[Dict[str, Any]] = None) -> str:
        """
        Generiert einen Bericht asynchron.
        
        Args:
            report_id: Die ID des zu generierenden Berichts
            parameters: Optionale Parameter für die Berichtsgenerierung
            
        Returns:
            Die ID des Celery-Tasks
            
        Raises:
            ValueError: Wenn der Bericht nicht gefunden wurde
        """
        report = self.get_report(report_id)
        if not report:
            raise ValueError(f"Bericht mit ID {report_id} nicht gefunden")
        
        # Kombiniere die gespeicherten Parameter mit den übergebenen
        merged_params = {}
        if report.parameters:
            merged_params.update(report.parameters)
        if parameters:
            merged_params.update(parameters)
        
        # Starte den Celery-Task zur Berichtsgenerierung
        task = celery_app.send_task(
            'backend.tasks.generate_report',
            args=[report_id, merged_params],
            kwargs={}
        )
        
        logger.info(f"Berichtsgenerierung gestartet: {report.name} (ID: {report.id}, Task-ID: {task.id})")
        
        return task.id
    
    def save_report_file(self, report_id: int, file_path: str, file_name: str, file_size: int, file_type: str) -> ReportFile:
        """
        Speichert eine Berichtsdatei.
        
        Args:
            report_id: Die ID des Berichts
            file_path: Der Pfad zur Datei
            file_name: Der Name der Datei
            file_size: Die Größe der Datei in Bytes
            file_type: Der Typ der Datei
            
        Returns:
            Die gespeicherte Berichtsdatei
            
        Raises:
            ValueError: Wenn der Bericht nicht gefunden wurde
        """
        report = self.get_report(report_id)
        if not report:
            raise ValueError(f"Bericht mit ID {report_id} nicht gefunden")
        
        report_file = ReportFile(
            report_id=report_id,
            file_path=file_path,
            file_name=file_name,
            file_size=file_size,
            file_type=file_type
        )
        
        self.db.add(report_file)
        self.db.commit()
        self.db.refresh(report_file)
        
        logger.info(f"Berichtsdatei gespeichert: {file_name} für Bericht {report.name} (ID: {report.id})")
        
        return report_file
    
    def get_report_files(self, report_id: int) -> List[ReportFile]:
        """
        Ruft alle Dateien für einen Bericht ab.
        
        Args:
            report_id: Die ID des Berichts
            
        Returns:
            Eine Liste von Berichtsdateien
        """
        return self.db.query(ReportFile).filter(ReportFile.report_id == report_id).all()
    
    @staticmethod
    def distribute_report(
        db: Session,
        report_id: int,
        recipients: List[str],
        message: Optional[str] = None,
        cc: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Verteilt einen Bericht an die angegebenen Empfänger.
        
        Args:
            db: Datenbankverbindung
            report_id: ID des Berichts
            recipients: Liste der E-Mail-Adressen der Empfänger
            message: Zusätzliche Nachricht (optional)
            cc: Liste der E-Mail-Adressen für CC (optional)
            
        Returns:
            Dict mit Informationen zur Berichtsverteilung
        """
        report = ReportService.get_report(db, report_id)
        if not report:
            raise ValueError(f"Bericht mit ID {report_id} nicht gefunden")
        
        if not report.file_path or not os.path.exists(report.file_path):
            raise ValueError(f"Berichtsdatei nicht gefunden: {report.file_path}")
        
        # E-Mail senden
        email_result = EmailService.send_report_email(
            recipients=recipients,
            report_name=report.name,
            report_file=report.file_path,
            message=message,
            cc=cc
        )
        
        # Verteilungen in der Datenbank speichern
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
        
        logger.info(f"Bericht verteilt: {report.name} (ID: {report.id}) an {len(recipients)} Empfänger")
        
        return email_result
    
    @staticmethod
    def schedule_report(
        db: Session,
        report_id: int,
        name: str,
        cron_expression: str,
        recipients: List[str],
        parameters: Optional[Dict[str, Any]] = None,
        is_active: bool = True
    ) -> ReportSchedule:
        """
        Plant einen wiederkehrenden Bericht.
        
        Args:
            db: Datenbankverbindung
            report_id: ID des Berichts
            name: Name des Zeitplans
            cron_expression: Cron-Ausdruck für die Planung
            recipients: Liste der E-Mail-Adressen der Empfänger
            parameters: Parameter für den Bericht (optional)
            is_active: Ob der Zeitplan aktiv ist
            
        Returns:
            Das erstellte ReportSchedule-Objekt
        """
        report = ReportService.get_report(db, report_id)
        if not report:
            raise ValueError(f"Bericht mit ID {report_id} nicht gefunden")
        
        # Zeitplan erstellen
        schedule = ReportSchedule(
            report_id=report.id,
            name=name,
            cron_expression=cron_expression,
            is_active=is_active,
            recipients=recipients,
            parameters=parameters
        )
        
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
        
        logger.info(f"Berichtszeitplan erstellt: {schedule.name} (ID: {schedule.id}) für Bericht {report.name}")
        
        return schedule 