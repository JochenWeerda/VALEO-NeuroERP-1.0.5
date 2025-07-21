"""
AI API Routes für VALEO NeuroERP
KI-basierte Endpunkte für Predictive Analytics
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

from ..services.ai_service import ai_service
from ..auth.auth_bearer import JWTBearer
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI & Analytics"])
auth_scheme = JWTBearer()

# Pydantic Models
class TransactionData(BaseModel):
    date: str
    amount: float
    type: str
    description: str

class InventoryData(BaseModel):
    id: str
    name: str
    quantity: int
    unit_price: float
    category: str

class DemandHistory(BaseModel):
    date: str
    quantity: int
    item_id: str

class UserBehaviorData(BaseModel):
    user_id: str
    login_count: int
    last_login: str
    features_used: List[str] = []

class InsightRequest(BaseModel):
    data_types: List[str] = ["transactions", "inventory", "performance"]
    time_range: str = "30d"  # 7d, 30d, 90d

@router.get("/health")
async def get_ai_health():
    """Gibt den Gesundheitsstatus des AI-Services zurück"""
    try:
        status = await ai_service.get_ai_health_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        logger.error(f"Fehler beim AI Health Check: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/transactions")
async def predict_transaction_trends(
    historical_data: List[TransactionData],
    current_user: User = Depends(auth_scheme)
):
    """Vorhersage von Transaktionsentwicklungen"""
    try:
        if len(historical_data) < 30:
            raise HTTPException(
                status_code=400, 
                detail="Mindestens 30 Transaktionen für Vorhersage erforderlich"
            )
        
        # Daten konvertieren
        data = [item.dict() for item in historical_data]
        
        # Vorhersage durchführen
        result = await ai_service.predict_transaction_trends(data)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": "Transaktionsvorhersage erfolgreich erstellt"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler bei Transaktionsvorhersage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/anomalies")
async def detect_anomalies(
    data: List[Dict[str, Any]],
    data_type: str = "transactions",
    current_user: User = Depends(auth_scheme)
):
    """Erkennt Anomalien in den Daten"""
    try:
        if not data:
            raise HTTPException(
                status_code=400,
                detail="Daten für Anomalie-Erkennung erforderlich"
            )
        
        # Anomalien erkennen
        result = await ai_service.detect_anomalies(data, data_type)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": f"Anomalie-Erkennung für {data_type} abgeschlossen"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler bei Anomalie-Erkennung: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize/inventory")
async def optimize_inventory(
    inventory_data: List[InventoryData],
    demand_history: List[DemandHistory],
    current_user: User = Depends(auth_scheme)
):
    """Optimiert Inventar basierend auf Nachfragevorhersage"""
    try:
        if not inventory_data or not demand_history:
            raise HTTPException(
                status_code=400,
                detail="Inventar- und Nachfragedaten erforderlich"
            )
        
        # Daten konvertieren
        inventory = [item.dict() for item in inventory_data]
        demand = [item.dict() for item in demand_history]
        
        # Inventar optimieren
        result = await ai_service.optimize_inventory(inventory, demand)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": "Inventar-Optimierung abgeschlossen"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler bei Inventar-Optimierung: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/user-behavior")
async def analyze_user_behavior(
    user_data: List[UserBehaviorData],
    current_user: User = Depends(auth_scheme)
):
    """Analysiert Benutzerverhalten für Personalisierung"""
    try:
        if not user_data:
            raise HTTPException(
                status_code=400,
                detail="Benutzerdaten für Analyse erforderlich"
            )
        
        # Daten konvertieren
        data = [item.dict() for item in user_data]
        
        # Benutzerverhalten analysieren
        result = await ai_service.analyze_user_behavior(data)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            "success": True,
            "data": result,
            "message": "Benutzerverhaltensanalyse abgeschlossen"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler bei Benutzerverhaltensanalyse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insights/generate")
async def generate_insights(
    request: InsightRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(auth_scheme)
):
    """Generiert intelligente Insights aus Systemdaten"""
    try:
        # Hier würden die tatsächlichen Daten aus der Datenbank geladen
        # Für Demo-Zwecke verwenden wir Mock-Daten
        
        mock_data = {
            "transactions": [
                {"amount": 1000.0, "date": "2024-01-01"},
                {"amount": 1500.0, "date": "2024-01-02"},
                {"amount": 800.0, "date": "2024-01-03"}
            ],
            "inventory": [
                {"name": "Laptop", "quantity": 5, "unit_price": 999.99},
                {"name": "Monitor", "quantity": 15, "unit_price": 299.99},
                {"name": "Tastatur", "quantity": 3, "unit_price": 89.99}
            ],
            "performance": {
                "response_time": 1.5,
                "error_rate": 0.02
            }
        }
        
        # Insights generieren
        insights = await ai_service.generate_insights(mock_data)
        
        return {
            "success": True,
            "data": {
                "insights": insights,
                "generated_at": datetime.now().isoformat(),
                "data_types": request.data_types
            },
            "message": f"{len(insights)} Insights generiert"
        }
        
    except Exception as e:
        logger.error(f"Fehler bei Insight-Generierung: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/status")
async def get_models_status(current_user: User = Depends(auth_scheme)):
    """Gibt den Status aller AI-Modelle zurück"""
    try:
        status = await ai_service.get_ai_health_status()
        
        return {
            "success": True,
            "data": {
                "models": {
                    "transaction_forecast": "ready" if ai_service.is_initialized else "initializing",
                    "inventory_optimization": "ready" if ai_service.is_initialized else "initializing",
                    "anomaly_detection": "ready" if ai_service.anomaly_detector else "initializing"
                },
                "overall_status": status['status'],
                "last_update": status['last_update']
            }
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Modell-Status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/retrain")
async def retrain_models(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(auth_scheme)
):
    """Startet das Neuladen der AI-Modelle im Hintergrund"""
    try:
        # Neuladen im Hintergrund starten
        background_tasks.add_task(ai_service.initialize)
        
        return {
            "success": True,
            "message": "Modell-Neuladen gestartet",
            "data": {
                "status": "retraining",
                "started_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Modell-Neuladen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/dashboard")
async def get_ai_analytics_dashboard(current_user: User = Depends(auth_scheme)):
    """Gibt AI-Analytics Dashboard-Daten zurück"""
    try:
        # Mock-Daten für Dashboard
        dashboard_data = {
            "ai_health": await ai_service.get_ai_health_status(),
            "recent_predictions": {
                "transaction_accuracy": 0.87,
                "inventory_optimization_score": 0.92,
                "anomaly_detection_rate": 0.95
            },
            "active_models": [
                "transaction_forecast",
                "inventory_optimization", 
                "anomaly_detection"
            ],
            "last_insights": [
                {
                    "type": "performance",
                    "title": "System-Optimierung",
                    "description": "AI-Modelle zeigen gute Performance",
                    "severity": "info",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }
        
        return {
            "success": True,
            "data": dashboard_data
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der AI-Analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 