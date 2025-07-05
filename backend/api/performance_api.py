"""
API-Endpunkte für die Datenbankperformance-Überwachung.

Dieses Modul stellt API-Endpunkte für den Zugriff auf Performance-Metriken,
Slow-Query-Informationen und Dashboard-Daten bereit.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel

# Performance-Monitor importieren
from backend.db.performance_monitor import monitor, get_performance_dashboard_data

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router erstellen
router = APIRouter()

# Pydantic-Modelle für Antworten
class QueryStat(BaseModel):
    query_name: str
    count: int
    avg_duration: float
    max_duration: float
    slow_count: int

class QueryStatsResponse(BaseModel):
    period_hours: int
    total_queries: int
    total_slow_queries: int
    queries: List[QueryStat]

class SlowQuery(BaseModel):
    timestamp: str
    query_name: str
    duration: float
    params: Optional[Dict[str, Any]] = None

class SlowQueriesResponse(BaseModel):
    queries: List[SlowQuery]
    count: int
    period_hours: int

class DailySummary(BaseModel):
    date: str
    total_queries: int
    avg_duration: float
    slow_queries: int
    details: Optional[Dict[str, Any]] = None

class DashboardData(BaseModel):
    current_stats: Dict[str, Any]
    slow_queries: List[Dict[str, Any]]
    today_summary: Dict[str, Any]
    daily_summaries: List[Dict[str, Any]]

# API-Endpunkte
@router.get("/performance/stats", response_model=QueryStatsResponse, tags=["Performance"])
async def get_query_stats(hours: int = Query(24, description="Zeitraum in Stunden")):
    """
    Gibt Performance-Statistiken für alle Datenbankabfragen zurück.
    """
    try:
        stats = monitor.get_query_stats(hours=hours)
        return stats
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Abfragestatistiken: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Statistiken: {str(e)}")

@router.get("/performance/query/{query_name}", tags=["Performance"])
async def get_single_query_stats(query_name: str, hours: int = Query(24, description="Zeitraum in Stunden")):
    """
    Gibt detaillierte Performance-Statistiken für eine bestimmte Abfrage zurück.
    """
    try:
        stats = monitor.get_query_stats(query_name=query_name, hours=hours)
        return stats
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Statistiken für Abfrage {query_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Statistiken: {str(e)}")

@router.get("/performance/slow-queries", response_model=SlowQueriesResponse, tags=["Performance"])
async def get_slow_queries(
    hours: int = Query(24, description="Zeitraum in Stunden"),
    limit: int = Query(100, description="Maximale Anzahl der zurückzugebenden Abfragen")
):
    """
    Gibt eine Liste der langsamsten Datenbankabfragen zurück.
    """
    try:
        queries = monitor.get_slow_queries(hours=hours, limit=limit)
        return {
            "queries": queries,
            "count": len(queries),
            "period_hours": hours
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der langsamen Abfragen: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der langsamen Abfragen: {str(e)}")

@router.get("/performance/daily-summary/{date}", response_model=DailySummary, tags=["Performance"])
async def get_daily_summary(date: Optional[str] = None):
    """
    Gibt die tägliche Zusammenfassung für ein bestimmtes Datum zurück.
    Das Datum muss im Format YYYY-MM-DD angegeben werden.
    """
    try:
        if date:
            # Datum aus dem String parsen
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        else:
            # Aktuelles Datum verwenden
            date_obj = datetime.now()
        
        summary = monitor.get_daily_summary(date=date_obj)
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültiges Datumsformat. Verwende YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der täglichen Zusammenfassung: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der täglichen Zusammenfassung: {str(e)}")

@router.get("/performance/dashboard", response_model=DashboardData, tags=["Performance"])
async def get_dashboard():
    """
    Gibt umfassende Daten für das Performance-Dashboard zurück.
    """
    try:
        dashboard_data = get_performance_dashboard_data()
        return dashboard_data
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Dashboard-Daten: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Dashboard-Daten: {str(e)}")

@router.post("/performance/generate-summary", tags=["Performance"])
async def generate_summary(date: Optional[str] = None):
    """
    Generiert manuell eine tägliche Zusammenfassung für ein bestimmtes Datum.
    Das Datum muss im Format YYYY-MM-DD angegeben werden.
    """
    try:
        if date:
            # Datum aus dem String parsen
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        else:
            # Aktuelles Datum verwenden
            date_obj = datetime.now()
        
        monitor.generate_daily_summary(date=date_obj)
        return {"status": "success", "message": f"Zusammenfassung für {date_obj.strftime('%Y-%m-%d')} generiert"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültiges Datumsformat. Verwende YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Fehler bei der Generierung der täglichen Zusammenfassung: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler bei der Generierung der Zusammenfassung: {str(e)}")

@router.post("/performance/clear-old-data", tags=["Performance"])
async def clear_old_data(days: int = Query(90, description="Daten älter als diese Anzahl von Tagen werden gelöscht")):
    """
    Löscht ältere Performance-Daten aus der Datenbank.
    """
    try:
        monitor.clear_old_data(days=days)
        return {"status": "success", "message": f"Daten älter als {days} Tage wurden gelöscht"}
    except Exception as e:
        logger.error(f"Fehler beim Löschen alter Performance-Daten: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen alter Daten: {str(e)}") 