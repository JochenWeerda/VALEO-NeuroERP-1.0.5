"""
Datenimport-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Verarbeitung von Datenimporten,
einschließlich CSV-, Excel- und JSON-Dateien.
"""

import os
import csv
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

import pandas as pd
from celery import shared_task
from django.db import transaction
from django.conf import settings

from backend.models.async_task import AsyncTask
from backend.services.task_queue import update_task_progress, retry_task_with_exponential_backoff

logger = logging.getLogger(__name__)

# Maximale Anzahl an Zeilen pro Batch für die Verarbeitung
MAX_BATCH_SIZE = 1000

@shared_task(bind=True, max_retries=3)
def import_csv_file(self, file_path: str, model_name: str, mapping: Dict[str, str], 
                   options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Importiert Daten aus einer CSV-Datei in ein Django-Modell.
    
    Args:
        file_path: Pfad zur CSV-Datei
        model_name: Name des Django-Modells
        mapping: Zuordnung von CSV-Spalten zu Modellfeldern
        options: Zusätzliche Optionen für den Import
        
    Returns:
        Dictionary mit Informationen zum Import-Ergebnis
    """
    try:
        # Standardwerte für Optionen
        options = options or {}
        delimiter = options.get('delimiter', ',')
        encoding = options.get('encoding', 'utf-8')
        skip_header = options.get('skip_header', True)
        
        # Modell dynamisch laden
        from django.apps import apps
        model = apps.get_model(model_name)
        
        # Datei öffnen und Zeilen zählen
        with open(file_path, 'r', encoding=encoding) as f:
            total_rows = sum(1 for _ in f)
        
        if skip_header:
            total_rows -= 1
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, f"Import von {total_rows} Zeilen gestartet")
        
        # Datei erneut öffnen und verarbeiten
        with open(file_path, 'r', encoding=encoding) as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            
            batch = []
            processed_rows = 0
            error_rows = 0
            
            for row_num, row in enumerate(reader):
                try:
                    # Daten gemäß Mapping transformieren
                    transformed_data = {}
                    for csv_field, model_field in mapping.items():
                        if csv_field in row:
                            transformed_data[model_field] = row[csv_field]
                    
                    # Batch für Bulk-Create sammeln
                    batch.append(model(**transformed_data))
                    
                    # Batch verarbeiten, wenn MAX_BATCH_SIZE erreicht ist
                    if len(batch) >= MAX_BATCH_SIZE:
                        with transaction.atomic():
                            model.objects.bulk_create(batch)
                        processed_rows += len(batch)
                        batch = []
                        
                        # Fortschritt aktualisieren
                        progress = int((processed_rows / total_rows) * 100)
                        update_task_progress(self.request.id, progress, 
                                            f"{processed_rows}/{total_rows} Zeilen verarbeitet")
                
                except Exception as e:
                    error_rows += 1
                    logger.error(f"Fehler beim Import von Zeile {row_num + 1}: {str(e)}")
                    continue
            
            # Restliche Batch-Daten verarbeiten
            if batch:
                with transaction.atomic():
                    model.objects.bulk_create(batch)
                processed_rows += len(batch)
            
            # Abschließenden Fortschritt melden
            update_task_progress(self.request.id, 100, 
                               f"Import abgeschlossen: {processed_rows} Zeilen erfolgreich, {error_rows} Fehler")
            
            return {
                "status": "success",
                "processed_rows": processed_rows,
                "error_rows": error_rows,
                "total_rows": total_rows,
                "file_path": file_path,
                "model_name": model_name
            }
            
    except Exception as e:
        logger.error(f"Fehler beim CSV-Import: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True, max_retries=3)
def import_excel_file(self, file_path: str, model_name: str, mapping: Dict[str, str], 
                     options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Importiert Daten aus einer Excel-Datei in ein Django-Modell.
    
    Args:
        file_path: Pfad zur Excel-Datei
        model_name: Name des Django-Modells
        mapping: Zuordnung von Excel-Spalten zu Modellfeldern
        options: Zusätzliche Optionen für den Import
        
    Returns:
        Dictionary mit Informationen zum Import-Ergebnis
    """
    try:
        # Standardwerte für Optionen
        options = options or {}
        sheet_name = options.get('sheet_name', 0)
        
        # Modell dynamisch laden
        from django.apps import apps
        model = apps.get_model(model_name)
        
        # Excel-Datei lesen
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        total_rows = len(df)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, f"Import von {total_rows} Zeilen gestartet")
        
        processed_rows = 0
        error_rows = 0
        batch = []
        
        # Daten verarbeiten
        for index, row in df.iterrows():
            try:
                # Daten gemäß Mapping transformieren
                transformed_data = {}
                for excel_field, model_field in mapping.items():
                    if excel_field in df.columns:
                        value = row[excel_field]
                        # NaN-Werte behandeln
                        if pd.isna(value):
                            value = None
                        transformed_data[model_field] = value
                
                # Batch für Bulk-Create sammeln
                batch.append(model(**transformed_data))
                
                # Batch verarbeiten, wenn MAX_BATCH_SIZE erreicht ist
                if len(batch) >= MAX_BATCH_SIZE:
                    with transaction.atomic():
                        model.objects.bulk_create(batch)
                    processed_rows += len(batch)
                    batch = []
                    
                    # Fortschritt aktualisieren
                    progress = int((processed_rows / total_rows) * 100)
                    update_task_progress(self.request.id, progress, 
                                        f"{processed_rows}/{total_rows} Zeilen verarbeitet")
            
            except Exception as e:
                error_rows += 1
                logger.error(f"Fehler beim Import von Zeile {index + 1}: {str(e)}")
                continue
        
        # Restliche Batch-Daten verarbeiten
        if batch:
            with transaction.atomic():
                model.objects.bulk_create(batch)
            processed_rows += len(batch)
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, 
                           f"Import abgeschlossen: {processed_rows} Zeilen erfolgreich, {error_rows} Fehler")
        
        return {
            "status": "success",
            "processed_rows": processed_rows,
            "error_rows": error_rows,
            "total_rows": total_rows,
            "file_path": file_path,
            "model_name": model_name
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Excel-Import: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True, max_retries=3)
def import_json_file(self, file_path: str, model_name: str, mapping: Dict[str, str], 
                    options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Importiert Daten aus einer JSON-Datei in ein Django-Modell.
    
    Args:
        file_path: Pfad zur JSON-Datei
        model_name: Name des Django-Modells
        mapping: Zuordnung von JSON-Feldern zu Modellfeldern
        options: Zusätzliche Optionen für den Import
        
    Returns:
        Dictionary mit Informationen zum Import-Ergebnis
    """
    try:
        # Standardwerte für Optionen
        options = options or {}
        root_element = options.get('root_element', None)
        
        # Modell dynamisch laden
        from django.apps import apps
        model = apps.get_model(model_name)
        
        # JSON-Datei lesen
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Falls die Daten in einem bestimmten Element der JSON-Struktur liegen
        if root_element:
            for key in root_element.split('.'):
                data = data[key]
        
        # Sicherstellen, dass data eine Liste ist
        if not isinstance(data, list):
            data = [data]
        
        total_rows = len(data)
        
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, f"Import von {total_rows} Elementen gestartet")
        
        processed_rows = 0
        error_rows = 0
        batch = []
        
        # Daten verarbeiten
        for index, item in enumerate(data):
            try:
                # Daten gemäß Mapping transformieren
                transformed_data = {}
                for json_field, model_field in mapping.items():
                    # Unterstützung für verschachtelte Felder mit Punktnotation
                    value = item
                    for key in json_field.split('.'):
                        if key in value:
                            value = value[key]
                        else:
                            value = None
                            break
                    
                    if value is not None:
                        transformed_data[model_field] = value
                
                # Batch für Bulk-Create sammeln
                batch.append(model(**transformed_data))
                
                # Batch verarbeiten, wenn MAX_BATCH_SIZE erreicht ist
                if len(batch) >= MAX_BATCH_SIZE:
                    with transaction.atomic():
                        model.objects.bulk_create(batch)
                    processed_rows += len(batch)
                    batch = []
                    
                    # Fortschritt aktualisieren
                    progress = int((processed_rows / total_rows) * 100)
                    update_task_progress(self.request.id, progress, 
                                        f"{processed_rows}/{total_rows} Elemente verarbeitet")
            
            except Exception as e:
                error_rows += 1
                logger.error(f"Fehler beim Import von Element {index + 1}: {str(e)}")
                continue
        
        # Restliche Batch-Daten verarbeiten
        if batch:
            with transaction.atomic():
                model.objects.bulk_create(batch)
            processed_rows += len(batch)
        
        # Abschließenden Fortschritt melden
        update_task_progress(self.request.id, 100, 
                           f"Import abgeschlossen: {processed_rows} Elemente erfolgreich, {error_rows} Fehler")
        
        return {
            "status": "success",
            "processed_rows": processed_rows,
            "error_rows": error_rows,
            "total_rows": total_rows,
            "file_path": file_path,
            "model_name": model_name
        }
        
    except Exception as e:
        logger.error(f"Fehler beim JSON-Import: {str(e)}")
        return retry_task_with_exponential_backoff(self, exc=e)


@shared_task(bind=True)
def validate_import_file(self, file_path: str, file_type: str, 
                        options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Validiert eine Importdatei und gibt Informationen über die Struktur zurück.
    
    Args:
        file_path: Pfad zur Importdatei
        file_type: Typ der Datei (csv, excel, json)
        options: Zusätzliche Optionen für die Validierung
        
    Returns:
        Dictionary mit Informationen zur Dateistruktur
    """
    options = options or {}
    
    try:
        if file_type.lower() == 'csv':
            delimiter = options.get('delimiter', ',')
            encoding = options.get('encoding', 'utf-8')
            
            with open(file_path, 'r', encoding=encoding) as f:
                reader = csv.reader(f, delimiter=delimiter)
                headers = next(reader)
                
                # Stichprobe von Zeilen lesen
                sample_rows = []
                for _ in range(min(5, sum(1 for _ in reader))):
                    sample_rows.append(next(reader))
                
                return {
                    "status": "success",
                    "file_type": "csv",
                    "headers": headers,
                    "sample_rows": sample_rows,
                    "total_rows": sum(1 for _ in open(file_path, 'r', encoding=encoding)) - 1
                }
                
        elif file_type.lower() == 'excel':
            sheet_name = options.get('sheet_name', 0)
            
            df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=6)
            
            return {
                "status": "success",
                "file_type": "excel",
                "headers": df.columns.tolist(),
                "sample_rows": df.head(5).values.tolist(),
                "total_rows": len(pd.read_excel(file_path, sheet_name=sheet_name))
            }
            
        elif file_type.lower() == 'json':
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            root_element = options.get('root_element', None)
            
            # Falls die Daten in einem bestimmten Element der JSON-Struktur liegen
            if root_element:
                for key in root_element.split('.'):
                    data = data[key]
            
            # Sicherstellen, dass data eine Liste ist
            if not isinstance(data, list):
                data = [data]
            
            # Struktur des ersten Elements analysieren
            sample = data[0] if data else {}
            
            return {
                "status": "success",
                "file_type": "json",
                "structure": _analyze_json_structure(sample),
                "sample": data[:5] if len(data) >= 5 else data,
                "total_items": len(data)
            }
            
        else:
            return {
                "status": "error",
                "message": f"Nicht unterstützter Dateityp: {file_type}"
            }
            
    except Exception as e:
        logger.error(f"Fehler bei der Validierung der Importdatei: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


def _analyze_json_structure(data: Dict[str, Any], prefix: str = "") -> Dict[str, str]:
    """
    Analysiert die Struktur eines JSON-Objekts rekursiv.
    
    Args:
        data: JSON-Objekt
        prefix: Präfix für verschachtelte Felder
        
    Returns:
        Dictionary mit Feldnamen und Typen
    """
    result = {}
    
    for key, value in data.items():
        full_key = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, dict):
            # Rekursiv für verschachtelte Objekte
            nested_structure = _analyze_json_structure(value, full_key)
            result.update(nested_structure)
        elif isinstance(value, list) and value and isinstance(value[0], dict):
            # Für Listen von Objekten nur das erste Element analysieren
            nested_structure = _analyze_json_structure(value[0], f"{full_key}[]")
            result.update(nested_structure)
        else:
            # Einfache Werte
            result[full_key] = type(value).__name__ if value is not None else "null"
    
    return result 