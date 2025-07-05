"""
Frontend-Integration für die Task-Queue-Infrastruktur.

Dieses Modul stellt Funktionen und Klassen bereit, die die Integration der Task-Queue
mit dem Frontend ermöglichen, einschließlich Fortschrittsanzeigen, Benachrichtigungen
und Task-Status-Updates.
"""

import json
import logging
from typing import Dict, Any, List, Optional, Union

from django.db import transaction
from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_http_methods

from backend.models.async_task import AsyncTask
from backend.services.task_queue import get_task_status, get_task_result, cancel_task

logger = logging.getLogger(__name__)


def get_task_info(task_id: str) -> Dict[str, Any]:
    """
    Ruft Informationen zu einem Task ab.
    
    Args:
        task_id: Die ID des Tasks
        
    Returns:
        Ein Dictionary mit Informationen zum Task
    """
    try:
        task = AsyncTask.objects.get(task_id=task_id)
        
        # Basis-Informationen zum Task
        task_info = {
            'task_id': task.task_id,
            'status': task.status,
            'name': task.name,
            'created_at': task.created_at.isoformat(),
            'progress': task.progress,
            'error_message': task.error_message,
        }
        
        # Zusätzliche Informationen, falls vorhanden
        if task.result:
            try:
                task_info['result'] = json.loads(task.result)
            except (json.JSONDecodeError, TypeError):
                task_info['result'] = task.result
        
        # Fortschritts-Informationen
        if task.progress_data:
            try:
                task_info['progress_data'] = json.loads(task.progress_data)
            except (json.JSONDecodeError, TypeError):
                task_info['progress_data'] = task.progress_data
                
        return task_info
    except AsyncTask.DoesNotExist:
        # Wenn der Task nicht in der Datenbank gefunden wird, versuche ihn direkt von Celery abzurufen
        status = get_task_status(task_id)
        result = get_task_result(task_id)
        
        return {
            'task_id': task_id,
            'status': status,
            'name': 'Unbekannt',
            'created_at': None,
            'progress': 0,
            'result': result,
            'error_message': None if status != 'FAILURE' else 'Task nicht in der Datenbank gefunden',
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen von Task-Informationen für {task_id}: {e}")
        return {
            'task_id': task_id,
            'status': 'ERROR',
            'name': 'Fehler',
            'created_at': None,
            'progress': 0,
            'error_message': f"Fehler beim Abrufen von Task-Informationen: {str(e)}",
        }


@require_http_methods(["GET"])
def task_status_api(request: HttpRequest, task_id: str) -> JsonResponse:
    """
    API-Endpunkt zum Abrufen des Task-Status.
    
    Args:
        request: Die HTTP-Anfrage
        task_id: Die ID des Tasks
        
    Returns:
        JsonResponse mit Informationen zum Task-Status
    """
    task_info = get_task_info(task_id)
    return JsonResponse(task_info)


@require_http_methods(["GET"])
def active_tasks_api(request: HttpRequest) -> JsonResponse:
    """
    API-Endpunkt zum Abrufen aller aktiven Tasks.
    
    Args:
        request: Die HTTP-Anfrage
        
    Returns:
        JsonResponse mit einer Liste aktiver Tasks
    """
    # Benutzer-ID aus der Anfrage extrahieren (abhängig von Ihrer Authentifizierungsmethode)
    user_id = request.user.id if hasattr(request, 'user') and hasattr(request.user, 'id') else None
    
    # Aktive Tasks abfragen
    active_tasks_query = AsyncTask.objects.filter(
        status__in=['PENDING', 'RECEIVED', 'STARTED', 'RUNNING']
    )
    
    # Wenn ein Benutzer angemeldet ist, filtere nach seinen Tasks
    if user_id:
        active_tasks_query = active_tasks_query.filter(user_id=user_id)
    
    # Tasks in eine Liste umwandeln
    active_tasks = [
        {
            'task_id': task.task_id,
            'name': task.name,
            'status': task.status,
            'progress': task.progress,
            'created_at': task.created_at.isoformat(),
        }
        for task in active_tasks_query.order_by('-created_at')[:100]  # Begrenze auf die 100 neuesten Tasks
    ]
    
    return JsonResponse({'tasks': active_tasks})


@require_http_methods(["POST"])
def cancel_task_api(request: HttpRequest, task_id: str) -> JsonResponse:
    """
    API-Endpunkt zum Abbrechen eines Tasks.
    
    Args:
        request: Die HTTP-Anfrage
        task_id: Die ID des Tasks
        
    Returns:
        JsonResponse mit dem Ergebnis des Abbruchs
    """
    try:
        # Überprüfe, ob der Benutzer berechtigt ist, den Task abzubrechen
        # (abhängig von Ihrer Berechtigungsstruktur)
        user_id = request.user.id if hasattr(request, 'user') and hasattr(request.user, 'id') else None
        
        with transaction.atomic():
            task = AsyncTask.objects.select_for_update().get(task_id=task_id)
            
            # Überprüfe Berechtigungen (optional)
            if user_id and task.user_id and task.user_id != user_id:
                return JsonResponse(
                    {'success': False, 'error': 'Keine Berechtigung zum Abbrechen dieses Tasks'},
                    status=403
                )
            
            # Task abbrechen
            success = cancel_task(task_id)
            
            if success:
                task.status = 'REVOKED'
                task.error_message = 'Task wurde vom Benutzer abgebrochen'
                task.save()
                
                return JsonResponse({'success': True, 'message': 'Task erfolgreich abgebrochen'})
            else:
                return JsonResponse(
                    {'success': False, 'error': 'Task konnte nicht abgebrochen werden'},
                    status=400
                )
                
    except AsyncTask.DoesNotExist:
        return JsonResponse(
            {'success': False, 'error': 'Task nicht gefunden'},
            status=404
        )
    except Exception as e:
        logger.error(f"Fehler beim Abbrechen des Tasks {task_id}: {e}")
        return JsonResponse(
            {'success': False, 'error': f"Fehler beim Abbrechen des Tasks: {str(e)}"},
            status=500
        )


# Frontend-Komponenten für die Task-Queue-Integration

def get_task_progress_component(task_id: str) -> Dict[str, Any]:
    """
    Erstellt eine Frontend-Komponente für die Fortschrittsanzeige eines Tasks.
    
    Args:
        task_id: Die ID des Tasks
        
    Returns:
        Ein Dictionary mit den Daten für die Frontend-Komponente
    """
    task_info = get_task_info(task_id)
    
    return {
        'component': 'TaskProgress',
        'props': {
            'taskId': task_id,
            'status': task_info['status'],
            'progress': task_info['progress'],
            'name': task_info['name'],
            'createdAt': task_info['created_at'],
            'errorMessage': task_info['error_message'],
            'showCancel': task_info['status'] in ['PENDING', 'RECEIVED', 'STARTED', 'RUNNING'],
        }
    }


def get_task_notification_data(task_id: str) -> Dict[str, Any]:
    """
    Erstellt Daten für eine Benachrichtigung über einen Task.
    
    Args:
        task_id: Die ID des Tasks
        
    Returns:
        Ein Dictionary mit den Daten für die Benachrichtigung
    """
    task_info = get_task_info(task_id)
    
    notification_type = 'success'
    if task_info['status'] == 'FAILURE':
        notification_type = 'error'
    elif task_info['status'] in ['PENDING', 'RECEIVED', 'STARTED', 'RUNNING']:
        notification_type = 'info'
    
    return {
        'type': notification_type,
        'title': f"Task: {task_info['name']}",
        'message': get_task_status_message(task_info),
        'taskId': task_id,
        'duration': 5000,  # Anzeigedauer in ms
        'showProgress': task_info['status'] in ['PENDING', 'RECEIVED', 'STARTED', 'RUNNING'],
        'progress': task_info['progress'],
    }


def get_task_status_message(task_info: Dict[str, Any]) -> str:
    """
    Erstellt eine benutzerfreundliche Statusmeldung für einen Task.
    
    Args:
        task_info: Informationen zum Task
        
    Returns:
        Eine benutzerfreundliche Statusmeldung
    """
    status = task_info['status']
    
    if status == 'SUCCESS':
        return 'Task erfolgreich abgeschlossen'
    elif status == 'FAILURE':
        error_msg = task_info.get('error_message', 'Unbekannter Fehler')
        return f"Fehler: {error_msg}"
    elif status == 'REVOKED':
        return 'Task wurde abgebrochen'
    elif status == 'RUNNING':
        progress = task_info.get('progress', 0)
        return f"Task wird ausgeführt ({progress}% abgeschlossen)"
    elif status == 'STARTED':
        return 'Task wurde gestartet'
    elif status == 'RECEIVED':
        return 'Task wurde vom Worker empfangen'
    elif status == 'PENDING':
        return 'Task wartet auf Verarbeitung'
    else:
        return f"Status: {status}" 