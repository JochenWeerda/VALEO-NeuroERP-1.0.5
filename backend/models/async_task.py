"""
Datenbankmodell für die Verfolgung von asynchronen Tasks im VALEO-NeuroERP-System.

Dieses Modell dient als "Quelle der Wahrheit" für den Status von asynchronen Tasks
und ermöglicht die Wiederherstellung von verlorenen Tasks bei Systemausfällen.
"""

import uuid
import json
from django.db import models
from django.utils import timezone


class AsyncTask(models.Model):
    """
    Modell zur Verfolgung von asynchronen Tasks im System.
    
    Dieses Modell speichert Informationen über Tasks, die an die Celery-Queue gesendet wurden,
    und ermöglicht die Verfolgung ihres Status sowie die Wiederherstellung bei Systemausfällen.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Ausstehend'),
        ('RECEIVED', 'Empfangen'),
        ('STARTED', 'Gestartet'),
        ('RUNNING', 'Wird ausgeführt'),
        ('SUCCESS', 'Erfolgreich'),
        ('FAILURE', 'Fehlgeschlagen'),
        ('REVOKED', 'Zurückgezogen'),
        ('RETRY', 'Wird wiederholt'),
    ]
    
    PRIORITY_CHOICES = [
        (0, 'Hoch'),
        (3, 'Normal'),
        (6, 'Niedrig'),
    ]
    
    # Primärschlüssel und Identifikation
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task_id = models.CharField(max_length=255, unique=True, db_index=True, 
                              help_text="Celery-Task-ID")
    task_name = models.CharField(max_length=255, db_index=True,
                                help_text="Name der Task-Funktion")
    
    # Status und Zeitstempel
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING',
                             db_index=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3,
                                  help_text="Priorität des Tasks")
    created_at = models.DateTimeField(default=timezone.now)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Argumente und Ergebnisse
    args = models.JSONField(default=list, blank=True,
                          help_text="Positionsargumente für den Task")
    kwargs = models.JSONField(default=dict, blank=True,
                            help_text="Schlüsselwortargumente für den Task")
    result = models.JSONField(null=True, blank=True,
                            help_text="Ergebnis des Tasks (falls erfolgreich)")
    error = models.TextField(null=True, blank=True,
                           help_text="Fehlermeldung (falls fehlgeschlagen)")
    
    # Wiederholungsversuche
    retries = models.IntegerField(default=0,
                                help_text="Anzahl der Wiederholungsversuche")
    max_retries = models.IntegerField(default=3,
                                    help_text="Maximale Anzahl an Wiederholungsversuchen")
    
    # Metadaten
    queue = models.CharField(max_length=255, null=True, blank=True,
                           help_text="Name der Celery-Queue")
    worker = models.CharField(max_length=255, null=True, blank=True,
                            help_text="Name des Celery-Workers")
    
    class Meta:
        verbose_name = "Asynchroner Task"
        verbose_name_plural = "Asynchrone Tasks"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['task_name', 'status']),
        ]
    
    def __str__(self):
        return f"{self.task_name} ({self.task_id})"
    
    def save(self, *args, **kwargs):
        """Überschriebene save-Methode für automatische Zeitstempel-Aktualisierung"""
        if self.status == 'RUNNING' and not self.started_at:
            self.started_at = timezone.now()
        
        if self.status in ['SUCCESS', 'FAILURE', 'REVOKED'] and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    @property
    def execution_time(self):
        """Berechnet die Ausführungszeit des Tasks in Sekunden"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    @property
    def waiting_time(self):
        """Berechnet die Wartezeit des Tasks in Sekunden"""
        if self.started_at:
            return (self.started_at - self.created_at).total_seconds()
        return None
    
    @property
    def is_finished(self):
        """Überprüft, ob der Task abgeschlossen ist (erfolgreich oder fehlgeschlagen)"""
        return self.status in ['SUCCESS', 'FAILURE', 'REVOKED']
    
    @property
    def is_pending(self):
        """Überprüft, ob der Task noch ausstehend ist"""
        return self.status in ['PENDING', 'RECEIVED']
    
    @property
    def is_running(self):
        """Überprüft, ob der Task gerade ausgeführt wird"""
        return self.status in ['STARTED', 'RUNNING']
    
    @property
    def formatted_args(self):
        """Gibt die Argumente in einem lesbaren Format zurück"""
        try:
            return json.dumps(self.args, indent=2, ensure_ascii=False)
        except:
            return str(self.args)
    
    @property
    def formatted_kwargs(self):
        """Gibt die Schlüsselwortargumente in einem lesbaren Format zurück"""
        try:
            return json.dumps(self.kwargs, indent=2, ensure_ascii=False)
        except:
            return str(self.kwargs)
    
    @property
    def formatted_result(self):
        """Gibt das Ergebnis in einem lesbaren Format zurück"""
        if not self.result:
            return None
        
        try:
            return json.dumps(self.result, indent=2, ensure_ascii=False)
        except:
            return str(self.result)


class PeriodicTask(models.Model):
    """
    Modell zur Konfiguration von periodischen Tasks.
    
    Dieses Modell ermöglicht die dynamische Konfiguration von periodischen Tasks,
    die in regelmäßigen Abständen ausgeführt werden sollen.
    """
    
    INTERVAL_CHOICES = [
        ('minutely', 'Minütlich'),
        ('hourly', 'Stündlich'),
        ('daily', 'Täglich'),
        ('weekly', 'Wöchentlich'),
        ('monthly', 'Monatlich'),
    ]
    
    name = models.CharField(max_length=255, unique=True,
                          help_text="Name des periodischen Tasks")
    task_name = models.CharField(max_length=255,
                               help_text="Name der auszuführenden Task-Funktion")
    
    # Zeitplanung
    cron_expression = models.CharField(max_length=100, null=True, blank=True,
                                     help_text="Cron-Ausdruck für die Zeitplanung")
    interval_type = models.CharField(max_length=20, choices=INTERVAL_CHOICES, null=True, blank=True,
                                   help_text="Art des Intervalls")
    interval_value = models.PositiveIntegerField(null=True, blank=True,
                                              help_text="Wert des Intervalls")
    
    # Argumente
    args = models.JSONField(default=list, blank=True,
                          help_text="Positionsargumente für den Task")
    kwargs = models.JSONField(default=dict, blank=True,
                            help_text="Schlüsselwortargumente für den Task")
    
    # Status
    enabled = models.BooleanField(default=True,
                                help_text="Gibt an, ob der Task aktiviert ist")
    
    # Metadaten
    description = models.TextField(null=True, blank=True,
                                 help_text="Beschreibung des Tasks")
    created_at = models.DateTimeField(default=timezone.now)
    last_run_at = models.DateTimeField(null=True, blank=True,
                                     help_text="Zeitpunkt der letzten Ausführung")
    total_run_count = models.PositiveIntegerField(default=0,
                                                help_text="Anzahl der Ausführungen")
    
    class Meta:
        verbose_name = "Periodischer Task"
        verbose_name_plural = "Periodische Tasks"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def schedule_description(self):
        """Gibt eine lesbare Beschreibung des Zeitplans zurück"""
        if self.cron_expression:
            return f"Cron: {self.cron_expression}"
        elif self.interval_type and self.interval_value:
            return f"{self.interval_value} {self.get_interval_type_display()}"
        return "Kein Zeitplan definiert" 