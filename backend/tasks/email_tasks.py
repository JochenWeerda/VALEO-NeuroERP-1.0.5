"""
E-Mail-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für das asynchrone Versenden von E-Mails,
einschließlich Newsletter, Benachrichtigungen und Berichte.
"""

import os
import logging
import json
import time
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from celery import shared_task

# E-Mail-Bibliotheken
import smtplib
from jinja2 import Template, Environment, FileSystemLoader

# Lokale Imports
from backend.services.task_queue import update_task_progress
from backend.core.config import get_settings

logger = logging.getLogger(__name__)

# Konfiguration laden
settings = get_settings()

# Jinja2-Templates für E-Mails
try:
    template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates', 'emails')
    email_env = Environment(loader=FileSystemLoader(template_dir))
except Exception as e:
    logger.error(f"Fehler beim Laden der E-Mail-Templates: {str(e)}")
    email_env = None

def get_smtp_connection():
    """
    Erstellt eine SMTP-Verbindung basierend auf den Konfigurationseinstellungen.
    
    Returns:
        SMTP-Verbindungsobjekt
    """
    try:
        # SMTP-Konfiguration aus den Einstellungen laden
        smtp_host = settings.SMTP_HOST
        smtp_port = settings.SMTP_PORT
        smtp_user = settings.SMTP_USER
        smtp_password = settings.SMTP_PASSWORD
        use_tls = settings.SMTP_USE_TLS
        
        # SMTP-Verbindung herstellen
        if use_tls:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
        
        # Anmeldung, falls Benutzer und Passwort angegeben sind
        if smtp_user and smtp_password:
            server.login(smtp_user, smtp_password)
            
        return server
    except Exception as e:
        logger.error(f"Fehler beim Herstellen der SMTP-Verbindung: {str(e)}")
        raise

@shared_task(bind=True)
def send_email(self, recipient: str, subject: str, body: str, 
              html_body: Optional[str] = None,
              attachments: Optional[List[str]] = None,
              cc: Optional[List[str]] = None,
              bcc: Optional[List[str]] = None,
              reply_to: Optional[str] = None,
              sender: Optional[str] = None) -> Dict[str, Any]:
    """
    Sendet eine E-Mail an einen Empfänger.
    
    Args:
        recipient: E-Mail-Adresse des Empfängers
        subject: Betreff der E-Mail
        body: Textkörper der E-Mail
        html_body: HTML-Version des E-Mail-Körpers (optional)
        attachments: Liste von Dateipfaden, die als Anhänge hinzugefügt werden sollen
        cc: Liste von E-Mail-Adressen für CC
        bcc: Liste von E-Mail-Adressen für BCC
        reply_to: Antwort-an E-Mail-Adresse
        sender: Absender-E-Mail-Adresse (falls nicht angegeben, wird die Standardadresse verwendet)
    
    Returns:
        Dict mit Informationen zum E-Mail-Versand
    """
    logger.info(f"Starte E-Mail-Versand an {recipient}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "E-Mail wird vorbereitet")
        
        # Standardwerte
        attachments = attachments or []
        cc = cc or []
        bcc = bcc or []
        sender = sender or settings.DEFAULT_FROM_EMAIL
        
        # E-Mail-Nachricht erstellen
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = recipient
        
        if cc:
            msg['Cc'] = ", ".join(cc)
        if reply_to:
            msg['Reply-To'] = reply_to
        
        # Textversion hinzufügen
        part1 = MIMEText(body, 'plain')
        msg.attach(part1)
        
        # HTML-Version hinzufügen, falls vorhanden
        if html_body:
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
        
        # Anhänge hinzufügen
        if attachments:
            update_task_progress(self.request.id, 30, "Anhänge werden hinzugefügt")
            
            for attachment_path in attachments:
                if os.path.exists(attachment_path):
                    with open(attachment_path, 'rb') as f:
                        part = MIMEApplication(f.read(), Name=os.path.basename(attachment_path))
                    
                    part['Content-Disposition'] = f'attachment; filename="{os.path.basename(attachment_path)}"'
                    msg.attach(part)
                else:
                    logger.warning(f"Anhang nicht gefunden: {attachment_path}")
        
        # Empfängerliste erstellen
        all_recipients = [recipient] + cc + bcc
        
        # SMTP-Verbindung herstellen und E-Mail senden
        update_task_progress(self.request.id, 60, "E-Mail wird gesendet")
        
        server = get_smtp_connection()
        server.sendmail(sender, all_recipients, msg.as_string())
        server.quit()
        
        update_task_progress(self.request.id, 100, "E-Mail erfolgreich gesendet")
        
        return {
            "status": "success",
            "recipient": recipient,
            "subject": subject,
            "cc_count": len(cc),
            "bcc_count": len(bcc),
            "attachments_count": len(attachments),
            "sent_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Senden der E-Mail: {str(e)}")
        raise

@shared_task(bind=True)
def send_bulk_email(self, recipients: List[str], subject: str, body: str,
                   html_body: Optional[str] = None,
                   attachments: Optional[List[str]] = None,
                   sender: Optional[str] = None,
                   batch_size: int = 50,
                   delay_between_batches: int = 5) -> Dict[str, Any]:
    """
    Sendet eine E-Mail an mehrere Empfänger in Batches.
    
    Args:
        recipients: Liste von E-Mail-Adressen der Empfänger
        subject: Betreff der E-Mail
        body: Textkörper der E-Mail
        html_body: HTML-Version des E-Mail-Körpers (optional)
        attachments: Liste von Dateipfaden, die als Anhänge hinzugefügt werden sollen
        sender: Absender-E-Mail-Adresse (falls nicht angegeben, wird die Standardadresse verwendet)
        batch_size: Anzahl der E-Mails pro Batch
        delay_between_batches: Verzögerung zwischen Batches in Sekunden
    
    Returns:
        Dict mit Informationen zum Massen-E-Mail-Versand
    """
    logger.info(f"Starte Massen-E-Mail-Versand an {len(recipients)} Empfänger")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 0, "Massen-E-Mail wird vorbereitet")
        
        # Standardwerte
        attachments = attachments or []
        sender = sender or settings.DEFAULT_FROM_EMAIL
        
        # Empfänger in Batches aufteilen
        batches = [recipients[i:i + batch_size] for i in range(0, len(recipients), batch_size)]
        total_batches = len(batches)
        
        # Ergebnisse initialisieren
        results = {
            "total_recipients": len(recipients),
            "successful_sends": 0,
            "failed_sends": 0,
            "failures": []
        }
        
        # E-Mails in Batches senden
        for i, batch in enumerate(batches):
            batch_progress = int(100 * i / total_batches)
            update_task_progress(self.request.id, batch_progress, 
                               f"Batch {i+1}/{total_batches} wird gesendet")
            
            try:
                # SMTP-Verbindung für jeden Batch neu herstellen
                server = get_smtp_connection()
                
                # E-Mail für jeden Empfänger im Batch senden
                for recipient in batch:
                    try:
                        # E-Mail-Nachricht erstellen
                        msg = MIMEMultipart('alternative')
                        msg['Subject'] = subject
                        msg['From'] = sender
                        msg['To'] = recipient
                        
                        # Textversion hinzufügen
                        part1 = MIMEText(body, 'plain')
                        msg.attach(part1)
                        
                        # HTML-Version hinzufügen, falls vorhanden
                        if html_body:
                            part2 = MIMEText(html_body, 'html')
                            msg.attach(part2)
                        
                        # Anhänge hinzufügen
                        for attachment_path in attachments:
                            if os.path.exists(attachment_path):
                                with open(attachment_path, 'rb') as f:
                                    part = MIMEApplication(f.read(), Name=os.path.basename(attachment_path))
                                
                                part['Content-Disposition'] = f'attachment; filename="{os.path.basename(attachment_path)}"'
                                msg.attach(part)
                        
                        # E-Mail senden
                        server.sendmail(sender, recipient, msg.as_string())
                        results["successful_sends"] += 1
                        
                    except Exception as e:
                        logger.error(f"Fehler beim Senden der E-Mail an {recipient}: {str(e)}")
                        results["failed_sends"] += 1
                        results["failures"].append({
                            "recipient": recipient,
                            "error": str(e)
                        })
                
                # SMTP-Verbindung schließen
                server.quit()
                
                # Verzögerung zwischen Batches, um Rate-Limiting zu vermeiden
                if i < total_batches - 1:
                    time.sleep(delay_between_batches)
                    
            except Exception as e:
                logger.error(f"Fehler beim Senden von Batch {i+1}: {str(e)}")
                # Bei Batch-Fehler alle Empfänger als fehlgeschlagen markieren
                for recipient in batch:
                    results["failed_sends"] += 1
                    results["failures"].append({
                        "recipient": recipient,
                        "error": f"Batch-Fehler: {str(e)}"
                    })
        
        update_task_progress(self.request.id, 100, "Massen-E-Mail-Versand abgeschlossen")
        
        # Erfolgsrate berechnen
        success_rate = (results["successful_sends"] / results["total_recipients"]) * 100 if results["total_recipients"] > 0 else 0
        
        results["success_rate"] = round(success_rate, 2)
        results["completed_at"] = datetime.now().isoformat()
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler beim Massen-E-Mail-Versand: {str(e)}")
        raise

@shared_task(bind=True)
def send_template_email(self, recipient: str, template_name: str, context: Dict[str, Any],
                       subject: str,
                       attachments: Optional[List[str]] = None,
                       cc: Optional[List[str]] = None,
                       bcc: Optional[List[str]] = None,
                       reply_to: Optional[str] = None,
                       sender: Optional[str] = None) -> Dict[str, Any]:
    """
    Sendet eine E-Mail mit einem Jinja2-Template.
    
    Args:
        recipient: E-Mail-Adresse des Empfängers
        template_name: Name der Template-Datei (ohne Pfad)
        context: Dictionary mit Variablen für das Template
        subject: Betreff der E-Mail
        attachments: Liste von Dateipfaden, die als Anhänge hinzugefügt werden sollen
        cc: Liste von E-Mail-Adressen für CC
        bcc: Liste von E-Mail-Adressen für BCC
        reply_to: Antwort-an E-Mail-Adresse
        sender: Absender-E-Mail-Adresse (falls nicht angegeben, wird die Standardadresse verwendet)
    
    Returns:
        Dict mit Informationen zum E-Mail-Versand
    """
    logger.info(f"Starte Template-E-Mail-Versand an {recipient} mit Template {template_name}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "E-Mail-Template wird geladen")
        
        if not email_env:
            raise ValueError("E-Mail-Templates sind nicht konfiguriert")
        
        # Template laden und rendern
        try:
            template = email_env.get_template(template_name)
            html_content = template.render(**context)
            
            # Einfache Textversion aus HTML erstellen (sehr vereinfacht)
            text_content = html_content.replace('<br>', '\n').replace('</p>', '\n\n')
            # HTML-Tags entfernen (sehr vereinfacht)
            import re
            text_content = re.sub(r'<[^>]*>', '', text_content)
            
        except Exception as e:
            logger.error(f"Fehler beim Rendern des Templates {template_name}: {str(e)}")
            raise
        
        update_task_progress(self.request.id, 30, "E-Mail wird vorbereitet")
        
        # E-Mail senden mit dem gerenderten Template
        result = send_email.apply(
            args=[recipient, subject, text_content],
            kwargs={
                'html_body': html_content,
                'attachments': attachments,
                'cc': cc,
                'bcc': bcc,
                'reply_to': reply_to,
                'sender': sender
            },
            throw=True
        ).get()
        
        # Zusätzliche Informationen zum Template hinzufügen
        result["template_name"] = template_name
        result["context_keys"] = list(context.keys())
        
        update_task_progress(self.request.id, 100, "Template-E-Mail erfolgreich gesendet")
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler beim Senden der Template-E-Mail: {str(e)}")
        raise

@shared_task(bind=True)
def send_scheduled_newsletter(self, newsletter_id: str, 
                            test_mode: bool = False) -> Dict[str, Any]:
    """
    Sendet einen geplanten Newsletter an alle Abonnenten.
    
    Args:
        newsletter_id: ID des Newsletters in der Datenbank
        test_mode: Wenn True, wird der Newsletter nur an Test-E-Mail-Adressen gesendet
    
    Returns:
        Dict mit Informationen zum Newsletter-Versand
    """
    logger.info(f"Starte Versand des Newsletters {newsletter_id}, Test-Modus: {test_mode}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Newsletter-Daten werden geladen")
        
        # Hier würde normalerweise der Newsletter aus der Datenbank geladen werden
        # Da wir keine Datenbankanbindung haben, simulieren wir dies
        
        # Simulierte Newsletter-Daten
        newsletter_data = {
            "id": newsletter_id,
            "subject": "VALEO-NeuroERP Newsletter",
            "template_name": "newsletter_template.html",
            "content": {
                "headline": "Neuigkeiten aus dem VALEO-NeuroERP-Projekt",
                "intro": "Willkommen zum neuesten Newsletter des VALEO-NeuroERP-Projekts.",
                "articles": [
                    {
                        "title": "Version 1.0.3 veröffentlicht",
                        "content": "Wir freuen uns, die Veröffentlichung von Version 1.0.3 bekannt zu geben."
                    },
                    {
                        "title": "Neue Funktionen",
                        "content": "In dieser Version wurden zahlreiche neue Funktionen hinzugefügt."
                    }
                ],
                "footer": "Sie erhalten diesen Newsletter, weil Sie sich für Updates zum VALEO-NeuroERP-Projekt angemeldet haben."
            },
            "sender": settings.DEFAULT_FROM_EMAIL,
            "scheduled_date": datetime.now().isoformat()
        }
        
        # Empfängerliste laden
        # In einer realen Anwendung würden die Abonnenten aus der Datenbank geladen
        if test_mode:
            recipients = ["test@example.com", "developer@example.com"]
        else:
            # Simulierte Abonnentenliste
            recipients = [
                "subscriber1@example.com",
                "subscriber2@example.com",
                "subscriber3@example.com",
                # ... weitere Abonnenten
            ]
        
        update_task_progress(self.request.id, 30, f"Newsletter wird an {len(recipients)} Empfänger vorbereitet")
        
        # Template-Kontext erstellen
        context = newsletter_data["content"]
        context["unsubscribe_url"] = "https://example.com/unsubscribe"
        context["view_in_browser_url"] = f"https://example.com/newsletters/{newsletter_id}"
        
        # Massen-E-Mail senden
        result = send_bulk_email.apply(
            args=[
                recipients, 
                newsletter_data["subject"], 
                "Dieser Newsletter wird am besten in HTML angezeigt."
            ],
            kwargs={
                'html_body': "<h1>Newsletter-Inhalt</h1><p>Dieser Newsletter sollte als HTML angezeigt werden.</p>",
                'sender': newsletter_data["sender"],
                'batch_size': 20,
                'delay_between_batches': 10
            },
            throw=True
        ).get()
        
        # Newsletter-Statistiken aktualisieren
        # In einer realen Anwendung würden diese in der Datenbank gespeichert
        
        update_task_progress(self.request.id, 100, "Newsletter-Versand abgeschlossen")
        
        # Ergebnis mit Newsletter-Informationen anreichern
        result["newsletter_id"] = newsletter_id
        result["test_mode"] = test_mode
        result["scheduled_date"] = newsletter_data["scheduled_date"]
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler beim Senden des Newsletters: {str(e)}")
        raise

@shared_task(bind=True)
def send_notification_email(self, user_id: str, notification_type: str, 
                          context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sendet eine Benachrichtigungs-E-Mail an einen Benutzer.
    
    Args:
        user_id: ID des Benutzers in der Datenbank
        notification_type: Art der Benachrichtigung (z.B. 'password_reset', 'account_activation')
        context: Dictionary mit Variablen für das Template
    
    Returns:
        Dict mit Informationen zum E-Mail-Versand
    """
    logger.info(f"Starte Benachrichtigungs-E-Mail vom Typ {notification_type} an Benutzer {user_id}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Benutzerdaten werden geladen")
        
        # Hier würden normalerweise die Benutzerdaten aus der Datenbank geladen werden
        # Da wir keine Datenbankanbindung haben, simulieren wir dies
        
        # Simulierte Benutzerdaten
        user_data = {
            "id": user_id,
            "email": f"user_{user_id}@example.com",
            "first_name": "Max",
            "last_name": "Mustermann",
            "language": "de"
        }
        
        # Benachrichtigungstyp-spezifische Informationen
        notification_settings = {
            "password_reset": {
                "template": "password_reset.html",
                "subject": "Zurücksetzen Ihres Passworts",
                "include_token": True
            },
            "account_activation": {
                "template": "account_activation.html",
                "subject": "Aktivieren Sie Ihr Konto",
                "include_token": True
            },
            "data_import_complete": {
                "template": "data_import_complete.html",
                "subject": "Datenimport abgeschlossen",
                "include_token": False
            },
            "report_ready": {
                "template": "report_ready.html",
                "subject": "Ihr Bericht ist verfügbar",
                "include_token": False
            }
        }
        
        if notification_type not in notification_settings:
            raise ValueError(f"Unbekannter Benachrichtigungstyp: {notification_type}")
        
        settings_for_type = notification_settings[notification_type]
        
        # Token generieren, falls erforderlich
        if settings_for_type["include_token"]:
            import uuid
            token = str(uuid.uuid4())
            context["token"] = token
            # In einer realen Anwendung würde das Token in der Datenbank gespeichert
        
        # Kontext mit Benutzerdaten anreichern
        context["user"] = user_data
        context["app_name"] = "VALEO-NeuroERP"
        context["current_year"] = datetime.now().year
        
        update_task_progress(self.request.id, 50, "Benachrichtigung wird gesendet")
        
        # Template-E-Mail senden
        result = send_template_email.apply(
            args=[
                user_data["email"],
                settings_for_type["template"],
                context,
                settings_for_type["subject"]
            ],
            throw=True
        ).get()
        
        update_task_progress(self.request.id, 100, "Benachrichtigung erfolgreich gesendet")
        
        # Ergebnis mit Benachrichtigungsinformationen anreichern
        result["notification_type"] = notification_type
        result["user_id"] = user_id
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler beim Senden der Benachrichtigung: {str(e)}")
        raise
