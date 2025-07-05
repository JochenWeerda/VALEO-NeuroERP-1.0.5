from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Dict, Optional
from ..services.analytics_service import AnalyticsService
from ..core.config import get_settings

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

async def get_analytics_service() -> AnalyticsService:
    settings = get_settings()
    return AnalyticsService(settings.MONGODB_URI)

@router.get("/sales")
async def get_sales_analytics(
    start_date: datetime,
    end_date: datetime,
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """
    Liefert Verkaufsanalysen für den angegebenen Zeitraum.
    """
    try:
        return await service.get_sales_analytics(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-segments")
async def get_customer_segments(
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """
    Führt eine Kundenanalyse durch und liefert Kundensegmente.
    """
    try:
        return await service.analyze_customer_segments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inventory-optimization")
async def get_inventory_optimization(
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """
    Liefert Empfehlungen zur Lagerbestandsoptimierung.
    """
    try:
        return await service.get_inventory_optimization()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sales-prediction/{product_id}")
async def predict_sales(
    product_id: str,
    forecast_periods: Optional[int] = 12,
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Prognostiziert Verkaufszahlen für ein Produkt."""
    try:
        return await service.predict_sales(product_id, forecast_periods)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer-feedback")
async def analyze_feedback(
    feedback_text: str,
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Analysiert Kundenfeedback mit NLP."""
    try:
        return await service.analyze_customer_feedback(feedback_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies/{data_type}")
async def detect_anomalies(
    data_type: str,
    threshold: Optional[float] = 2.0,
    service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Erkennt Anomalien in verschiedenen Datensätzen."""
    try:
        return await service.detect_anomalies(data_type, threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 