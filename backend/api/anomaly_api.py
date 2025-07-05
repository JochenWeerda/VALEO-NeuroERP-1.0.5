from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, File, UploadFile
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import logging

from ..services.anomaly_detection_service import AnomalyDetectionService
from ..db.database import get_db

router = APIRouter(
    prefix="/api/v1/anomaly",
    tags=["Anomaly Detection"]
)

# Hilfsfunktion zum Abrufen der Anomaly-Service-Instanz
def get_anomaly_service(db: Session = Depends(get_db)) -> AnomalyDetectionService:
    return AnomalyDetectionService()

@router.post("/train")
async def train_model(
    module: str = Query(..., description="Modul, für das das Modell trainiert werden soll (inventory, production, quality, etc.)"),
    data_type: str = Query(..., description="Art der Daten (time_series, categorical, numerical, etc.)"),
    parameters: Optional[Dict[str, Any]] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Trainiert ein neues Anomalieerkennungsmodell für ein bestimmtes Modul und Datentyp
    """
    try:
        result = service.train_model(module, data_type, parameters)
        return {
            "status": "success",
            "message": f"Modell für {module}/{data_type} erfolgreich trainiert",
            "model_info": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Training des Modells: {str(e)}"
        )

@router.post("/detect")
async def detect_anomalies(
    module: str = Query(..., description="Modul, für das Anomalien erkannt werden sollen"),
    data_type: str = Query(..., description="Art der Daten"),
    data: Dict[str, Any] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Erkennt Anomalien in den übergebenen Daten
    """
    try:
        result = service.detect_anomalies(module, data_type, data)
        return {
            "status": "success",
            "anomalies": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler bei der Anomalieerkennung: {str(e)}"
        )

@router.post("/batch-detect")
async def batch_detect_anomalies(
    module: str = Query(..., description="Modul, für das Anomalien erkannt werden sollen"),
    data_type: str = Query(..., description="Art der Daten"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Führt eine Batch-Erkennung von Anomalien für einen bestimmten Zeitraum durch
    """
    try:
        # Standardzeitraum: letzte 7 Tage
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=7)
        if not end_date:
            end_date = datetime.utcnow()
            
        result = service.batch_detect_anomalies(module, data_type, start_date, end_date)
        return {
            "status": "success",
            "time_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "anomalies_count": len(result),
            "anomalies": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler bei der Batch-Anomalieerkennung: {str(e)}"
        )

@router.get("/models")
async def list_models(
    module: Optional[str] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Listet alle verfügbaren Anomalieerkennungsmodelle auf
    """
    try:
        models = service.list_models(module)
        return {
            "status": "success",
            "models": models
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Modelle: {str(e)}"
        )

@router.delete("/models/{module}/{data_type}")
async def delete_model(
    module: str = Path(..., description="Modul des zu löschenden Modells"),
    data_type: str = Path(..., description="Datentyp des zu löschenden Modells"),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Löscht ein Anomalieerkennungsmodell
    """
    try:
        success = service.delete_model(module, data_type)
        if success:
            return {
                "status": "success",
                "message": f"Modell für {module}/{data_type} erfolgreich gelöscht"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Modell für {module}/{data_type} nicht gefunden"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Löschen des Modells: {str(e)}"
        )

@router.post("/upload-data")
async def upload_training_data(
    module: str = Query(..., description="Modul, für das die Daten hochgeladen werden"),
    data_type: str = Query(..., description="Art der Daten"),
    file: UploadFile = File(...),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Lädt Trainingsdaten für die Anomalieerkennung hoch
    """
    try:
        contents = await file.read()
        result = service.save_training_data(module, data_type, contents, file.filename)
        return {
            "status": "success",
            "message": f"Trainingsdaten für {module}/{data_type} erfolgreich hochgeladen",
            "details": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Hochladen der Trainingsdaten: {str(e)}"
        )

@router.get("/history")
async def get_anomaly_history(
    module: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, description="Maximale Anzahl von Ergebnissen"),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Ruft den Verlauf erkannter Anomalien ab
    """
    try:
        # Standardzeitraum: letzte 30 Tage
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
            
        history = service.get_anomaly_history(module, start_date, end_date, limit)
        return {
            "status": "success",
            "time_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "history_count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen des Anomalieverlaufs: {str(e)}"
        )

@router.get("/stats")
async def get_anomaly_stats(
    module: Optional[str] = None,
    days: int = Query(30, description="Zeitraum in Tagen"),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Ruft Statistiken zu erkannten Anomalien ab
    """
    try:
        stats = service.get_statistics(module, days)
        return {
            "status": "success",
            "time_period_days": days,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Anomaliestatistiken: {str(e)}"
        )

@router.post("/analyze-root-cause")
async def analyze_root_cause(
    anomaly_id: str = Query(..., description="ID der Anomalie"),
    additional_data: Optional[Dict[str, Any]] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Analysiert die Grundursache einer erkannten Anomalie
    """
    try:
        analysis = service.analyze_root_cause(anomaly_id, additional_data)
        return {
            "status": "success",
            "anomaly_id": anomaly_id,
            "root_cause_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler bei der Ursachenanalyse: {str(e)}"
        )

@router.post("/set-threshold")
async def set_detection_threshold(
    module: str = Query(..., description="Modul, für das der Schwellenwert gesetzt werden soll"),
    data_type: str = Query(..., description="Art der Daten"),
    threshold: float = Query(..., description="Neuer Schwellenwert für die Anomalieerkennung"),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Setzt den Schwellenwert für die Anomalieerkennung
    """
    try:
        result = service.set_threshold(module, data_type, threshold)
        return {
            "status": "success",
            "message": f"Schwellenwert für {module}/{data_type} erfolgreich gesetzt",
            "new_threshold": threshold,
            "model_info": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Setzen des Schwellenwerts: {str(e)}"
        )

@router.get("/module-config/{module}")
async def get_module_config(
    module: str = Path(..., description="Modul, dessen Konfiguration abgerufen werden soll"),
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Ruft die Konfiguration für die Anomalieerkennung eines Moduls ab
    """
    try:
        config = service.get_module_config(module)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Konfiguration für Modul {module} nicht gefunden"
            )
        return {
            "status": "success",
            "module": module,
            "config": config
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Modulkonfiguration: {str(e)}"
        )

@router.post("/module-config/{module}")
async def set_module_config(
    module: str = Path(..., description="Modul, dessen Konfiguration gesetzt werden soll"),
    config: Dict[str, Any] = None,
    service: AnomalyDetectionService = Depends(get_anomaly_service)
):
    """
    Setzt die Konfiguration für die Anomalieerkennung eines Moduls
    """
    try:
        result = service.set_module_config(module, config)
        return {
            "status": "success",
            "message": f"Konfiguration für Modul {module} erfolgreich gesetzt",
            "module": module,
            "config": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Setzen der Modulkonfiguration: {str(e)}"
        ) 