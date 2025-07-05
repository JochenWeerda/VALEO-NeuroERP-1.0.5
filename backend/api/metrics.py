"""
API-Endpunkte für Transaktionsmetriken.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta

from backend.db.database import get_db
from backend.models.transaction_processing import Transaction
from backend.monitoring.prometheus_exporter import get_transaction_metrics

router = APIRouter(
    prefix="/api/metrics",
    tags=["metrics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/transactions/summary")
def get_transaction_summary(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = Query(None, description="Startdatum für die Filterung (ISO-Format)"),
    end_date: Optional[datetime] = Query(None, description="Enddatum für die Filterung (ISO-Format)"),
    transaction_type: Optional[str] = Query(None, description="Transaktionstyp für die Filterung")
):
    """
    Liefert eine Zusammenfassung der Transaktionsmetriken.
    """
    # Zeitraum für die Abfrage festlegen
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Basisabfrage erstellen
    query = db.query(Transaction)
    
    # Filter anwenden
    query = query.filter(Transaction.created_at.between(start_date, end_date))
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    # Gesamtzahl der Transaktionen
    total_count = query.count()
    
    # Nach Status gruppieren
    status_counts = (
        db.query(
            Transaction.status,
            func.count(Transaction.id).label('count')
        )
        .filter(Transaction.created_at.between(start_date, end_date))
        .group_by(Transaction.status)
    )
    
    if transaction_type:
        status_counts = status_counts.filter(Transaction.type == transaction_type)
    
    status_counts = {row.status: row.count for row in status_counts.all()}
    
    # Nach Typ gruppieren
    type_counts = (
        db.query(
            Transaction.type,
            func.count(Transaction.id).label('count')
        )
        .filter(Transaction.created_at.between(start_date, end_date))
        .group_by(Transaction.type)
    )
    
    if transaction_type:
        type_counts = type_counts.filter(Transaction.type == transaction_type)
    
    type_counts = {row.type: row.count for row in type_counts.all()}
    
    # Durchschnittliche Bearbeitungszeit
    avg_processing_time = (
        db.query(func.avg(Transaction.processing_time))
        .filter(
            Transaction.created_at.between(start_date, end_date),
            Transaction.processing_time.isnot(None)
        )
    )
    
    if transaction_type:
        avg_processing_time = avg_processing_time.filter(Transaction.type == transaction_type)
    
    avg_processing_time = avg_processing_time.scalar() or 0
    
    # Erfolgsrate berechnen
    success_count = status_counts.get('completed', 0)
    success_rate = (success_count / total_count * 100) if total_count > 0 else 0
    
    return {
        "total_transactions": total_count,
        "status_distribution": status_counts,
        "type_distribution": type_counts,
        "avg_processing_time": round(avg_processing_time, 3),
        "success_rate": round(success_rate, 2),
        "time_period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }

@router.get("/transactions/time-series")
def get_transaction_time_series(
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = Query(None, description="Startdatum für die Filterung (ISO-Format)"),
    end_date: Optional[datetime] = Query(None, description="Enddatum für die Filterung (ISO-Format)"),
    interval: str = Query("day", description="Zeitintervall für die Gruppierung (hour, day, week, month)"),
    transaction_type: Optional[str] = Query(None, description="Transaktionstyp für die Filterung")
):
    """
    Liefert Zeitreihendaten für Transaktionen.
    """
    # Zeitraum für die Abfrage festlegen
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # SQL-Datumsformat basierend auf dem Intervall
    date_format = {
        "hour": "YYYY-MM-DD HH24:00:00",
        "day": "YYYY-MM-DD",
        "week": "YYYY-WW",
        "month": "YYYY-MM"
    }.get(interval, "YYYY-MM-DD")
    
    # Zeitreihenabfrage erstellen
    query = (
        db.query(
            func.to_char(Transaction.created_at, date_format).label('time_period'),
            func.count(Transaction.id).label('count')
        )
        .filter(Transaction.created_at.between(start_date, end_date))
        .group_by(func.to_char(Transaction.created_at, date_format))
        .order_by(func.to_char(Transaction.created_at, date_format))
    )
    
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    time_series_data = [{"time_period": row.time_period, "count": row.count} for row in query.all()]
    
    return {
        "interval": interval,
        "data": time_series_data,
        "time_period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }

@router.get("/transactions/performance")
def get_transaction_performance():
    """
    Liefert Performance-Metriken für Transaktionen aus Prometheus.
    """
    metrics = get_transaction_metrics()
    
    return {
        "throughput": metrics.get("throughput", 0),
        "avg_response_time": metrics.get("avg_response_time", 0),
        "error_rate": metrics.get("error_rate", 0),
        "queue_size": metrics.get("queue_size", 0),
        "active_workers": metrics.get("active_workers", 0),
        "last_updated": datetime.now()
    }

@router.get("/transactions/top-errors")
def get_top_transaction_errors(
    db: Session = Depends(get_db),
    limit: int = Query(10, description="Maximale Anzahl der zurückgegebenen Fehler"),
    days: int = Query(7, description="Anzahl der Tage für die Filterung")
):
    """
    Liefert die häufigsten Fehler bei Transaktionen.
    """
    start_date = datetime.now() - timedelta(days=days)
    
    query = (
        db.query(
            Transaction.error_message,
            func.count(Transaction.id).label('count')
        )
        .filter(
            Transaction.status == 'failed',
            Transaction.error_message.isnot(None),
            Transaction.created_at >= start_date
        )
        .group_by(Transaction.error_message)
        .order_by(desc('count'))
        .limit(limit)
    )
    
    top_errors = [
        {"error_message": row.error_message, "count": row.count}
        for row in query.all()
    ]
    
    return {
        "top_errors": top_errors,
        "time_period": {
            "start_date": start_date,
            "end_date": datetime.now()
        }
    } 