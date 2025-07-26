"""
🧠 FastAPI Charge Management API
KI-first Chargenverwaltung für Landhandel-ERP-Systeme
Integration mit n8n Workflows für Automatisierung
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
import logging
from enum import Enum

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="VALEO NeuroERP Charge Management API",
    description="KI-first Chargenverwaltung für Landhandel-ERP-Systeme",
    version="1.0.0"
)

# CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class QualityStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    QUARANTINE = "quarantine"

class VlogGmoStatus(str, Enum):
    VLOG = "VLOG"
    GMO = "GMO"
    UNKNOWN = "unknown"

class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class StorageConditions(str, Enum):
    AMBIENT = "ambient"
    COOLED = "cooled"
    FROZEN = "frozen"
    CONTROLLED = "controlled"

# Pydantic Models
class KiAnalysis(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Risiko-Score (0-100)")
    quality_prediction: str = Field(..., description="Qualitätsvorhersage")
    shelf_life_prediction: int = Field(..., ge=0, description="Haltbarkeitsvorhersage in Tagen")
    price_optimization_suggestion: Optional[float] = Field(None, description="Preisoptimierungsvorschlag")
    anomaly_detection: bool = Field(False, description="Anomalie erkannt")
    trend_analysis: Optional[str] = Field(None, description="Trend-Analyse")
    recommendations: List[str] = Field(default_factory=list, description="KI-Empfehlungen")

class WorkflowStep(BaseModel):
    step: str = Field(..., description="Workflow-Schritt")
    status: str = Field(..., description="Status des Schritts")
    completed_by: Optional[str] = Field(None, description="Ausgeführt von")
    completed_at: Optional[str] = Field(None, description="Ausgeführt am")
    notes: Optional[str] = Field(None, description="Notizen")

class Certificate(BaseModel):
    id: str = Field(..., description="Zertifikat-ID")
    type: str = Field(..., description="Zertifikat-Typ")
    filename: str = Field(..., description="Dateiname")
    upload_date: str = Field(..., description="Upload-Datum")
    valid_until: Optional[str] = Field(None, description="Gültig bis")

class ChargeCreate(BaseModel):
    charge_number: Optional[str] = Field(None, description="Chargennummer (wird automatisch generiert)")
    article_number: str = Field(..., description="Artikelnummer")
    article_name: str = Field(..., description="Artikelname")
    supplier_number: str = Field(..., description="Lieferantennummer")
    supplier_name: str = Field(..., description="Lieferantenname")
    production_date: str = Field(..., description="Produktionsdatum (ISO-Format)")
    expiry_date: str = Field(..., description="Verfallsdatum (ISO-Format)")
    batch_size: float = Field(..., ge=0, description="Chargengröße")
    unit: str = Field(..., description="Einheit")
    quality_status: QualityStatus = Field(QualityStatus.PENDING, description="Qualitätsstatus")
    qs_milk_relevant: bool = Field(False, description="QS Milch relevant")
    vlog_gmo_status: VlogGmoStatus = Field(VlogGmoStatus.UNKNOWN, description="VLOG/GMO Status")
    eudr_compliant: bool = Field(False, description="EUDR konform")
    sustainability_rapeseed: bool = Field(False, description="Nachhaltiger Raps")
    protein_content: Optional[float] = Field(None, ge=0, le=100, description="Proteingehalt (%)")
    fat_content: Optional[float] = Field(None, ge=0, le=100, description="Fettgehalt (%)")
    moisture_content: Optional[float] = Field(None, ge=0, le=100, description="Feuchtigkeitsgehalt (%)")
    ash_content: Optional[float] = Field(None, ge=0, le=100, description="Aschegehalt (%)")
    purchase_price: float = Field(0.0, ge=0, description="Einkaufspreis")
    currency: str = Field("EUR", description="Währung")
    warehouse_location: str = Field(..., description="Lagerort")
    storage_conditions: StorageConditions = Field(StorageConditions.AMBIENT, description="Lagerbedingungen")
    notes: Optional[str] = Field(None, description="Notizen")

class ChargeUpdate(BaseModel):
    article_name: Optional[str] = None
    quality_status: Optional[QualityStatus] = None
    qs_milk_relevant: Optional[bool] = None
    vlog_gmo_status: Optional[VlogGmoStatus] = None
    eudr_compliant: Optional[bool] = None
    sustainability_rapeseed: Optional[bool] = None
    protein_content: Optional[float] = None
    fat_content: Optional[float] = None
    moisture_content: Optional[float] = None
    ash_content: Optional[float] = None
    purchase_price: Optional[float] = None
    warehouse_location: Optional[str] = None
    storage_conditions: Optional[StorageConditions] = None
    workflow_status: Optional[WorkflowStatus] = None
    notes: Optional[str] = None

class ChargeResponse(BaseModel):
    charge_number: str
    article_number: str
    article_name: str
    supplier_number: str
    supplier_name: str
    production_date: str
    expiry_date: str
    batch_size: float
    unit: str
    quality_status: QualityStatus
    qs_milk_relevant: bool
    vlog_gmo_status: VlogGmoStatus
    eudr_compliant: bool
    sustainability_rapeseed: bool
    protein_content: Optional[float]
    fat_content: Optional[float]
    moisture_content: Optional[float]
    ash_content: Optional[float]
    purchase_price: float
    currency: str
    warehouse_location: str
    storage_conditions: StorageConditions
    workflow_status: WorkflowStatus
    ki_analysis: Optional[KiAnalysis]
    workflow_steps: List[WorkflowStep]
    certificates: List[Certificate]
    created_by: str
    created_at: str
    updated_by: Optional[str]
    updated_at: Optional[str]
    notes: Optional[str]

# In-Memory Storage (in Produktion durch Datenbank ersetzen)
charges_db: Dict[str, Dict[str, Any]] = {}

# n8n Integration
class N8nIntegration:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_auth = ("admin", "valeo2024")
    
    async def trigger_workflow(self, workflow_name: str, data: Dict[str, Any]) -> bool:
        """n8n Workflow auslösen"""
        try:
            async with aiohttp.ClientSession() as session:
                webhook_url = f"{self.n8n_url}/webhook/{workflow_name}"
                
                async with session.post(
                    webhook_url,
                    json=data,
                    auth=aiohttp.BasicAuth(*self.n8n_auth),
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        logger.info(f"✅ n8n Workflow {workflow_name} erfolgreich ausgelöst")
                        return True
                    else:
                        logger.warning(f"⚠️ n8n Workflow {workflow_name} fehlgeschlagen: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"❌ Fehler beim Auslösen des n8n Workflows {workflow_name}: {e}")
            return False

n8n_integration = N8nIntegration()

# KI-Analyse Service
class KiAnalysisService:
    @staticmethod
    def calculate_risk_score(charge_data: Dict[str, Any]) -> int:
        """Risiko-Score berechnen"""
        risk_score = 50  # Basis-Score
        
        # Qualitätsfaktoren bewerten
        if charge_data.get("quality_status") == "approved":
            risk_score -= 20
        elif charge_data.get("quality_status") == "rejected":
            risk_score += 30
        elif charge_data.get("quality_status") == "quarantine":
            risk_score += 40
        
        # VLOG/GMO Status bewerten
        if charge_data.get("vlog_gmo_status") == "VLOG":
            risk_score -= 10
        elif charge_data.get("vlog_gmo_status") == "GMO":
            risk_score += 25
        
        # Analysedaten bewerten
        if charge_data.get("protein_content", 0) > 20:
            risk_score -= 5
        
        if charge_data.get("moisture_content", 0) > 15:
            risk_score += 10
        
        # Haltbarkeit bewerten
        if charge_data.get("expiry_date"):
            try:
                expiry = datetime.fromisoformat(charge_data["expiry_date"])
                days_until_expiry = (expiry - datetime.now()).days
                if days_until_expiry < 30:
                    risk_score += 20
                elif days_until_expiry < 90:
                    risk_score += 10
            except:
                pass
        
        return max(0, min(100, risk_score))
    
    @staticmethod
    def predict_quality(risk_score: int) -> str:
        """Qualitätsvorhersage basierend auf Risiko-Score"""
        if risk_score < 30:
            return "excellent"
        elif risk_score < 60:
            return "good"
        elif risk_score < 80:
            return "average"
        else:
            return "poor"
    
    @staticmethod
    def predict_shelf_life(charge_data: Dict[str, Any]) -> int:
        """Haltbarkeitsvorhersage"""
        if charge_data.get("production_date") and charge_data.get("expiry_date"):
            try:
                production = datetime.fromisoformat(charge_data["production_date"])
                expiry = datetime.fromisoformat(charge_data["expiry_date"])
                return (expiry - production).days
            except:
                pass
        return 365  # Standard-Haltbarkeit
    
    @staticmethod
    def detect_anomalies(charge_data: Dict[str, Any]) -> bool:
        """Anomalien erkennen"""
        anomalies = []
        
        # Preis-Anomalie
        if charge_data.get("purchase_price", 0) > 1000:
            anomalies.append("Hoher Einkaufspreis")
        
        # Chargengröße-Anomalie
        if charge_data.get("batch_size", 0) > 10000:
            anomalies.append("Sehr große Charge")
        
        # Qualitäts-Anomalie
        if charge_data.get("quality_status") == "rejected":
            anomalies.append("Qualität abgelehnt")
        
        # VLOG/GMO-Anomalie
        if charge_data.get("vlog_gmo_status") == "GMO":
            anomalies.append("GVO-haltig")
        
        return len(anomalies) > 0
    
    @staticmethod
    def generate_recommendations(charge_data: Dict[str, Any], risk_score: int) -> List[str]:
        """Empfehlungen generieren"""
        recommendations = []
        
        if risk_score > 70:
            recommendations.append("Dringende Qualitätsprüfung erforderlich")
            recommendations.append("Quarantäne-Lagerung empfehlenswert")
        
        if charge_data.get("vlog_gmo_status") == "unknown":
            recommendations.append("VLOG/GMO-Status klären")
        
        if charge_data.get("protein_content", 0) < 15:
            recommendations.append("Proteingehalt unter Standard")
        
        if charge_data.get("moisture_content", 0) > 15:
            recommendations.append("Feuchtigkeitsgehalt zu hoch")
        
        if not charge_data.get("eudr_compliant", False):
            recommendations.append("EUDR-Compliance prüfen")
        
        return recommendations

ki_service = KiAnalysisService()

# Utility Functions
def generate_charge_number() -> str:
    """Chargennummer generieren"""
    date = datetime.now()
    year = date.year
    month = f"{date.month:02d}"
    day = f"{date.day:02d}"
    random_suffix = f"{hash(datetime.now()) % 1000:03d}"
    return f"CH{year}{month}{day}-{random_suffix}"

def create_workflow_steps() -> List[Dict[str, Any]]:
    """Standard-Workflow-Schritte erstellen"""
    return [
        {
            "step": "Datenvalidierung",
            "status": "completed",
            "completed_by": "System",
            "completed_at": datetime.now().isoformat(),
            "notes": "Grunddaten validiert"
        },
        {
            "step": "KI-Analyse",
            "status": "completed",
            "completed_by": "KI-System",
            "completed_at": datetime.now().isoformat(),
            "notes": "KI-Analyse durchgeführt"
        },
        {
            "step": "Qualitätsprüfung",
            "status": "pending",
            "completed_by": None,
            "completed_at": None,
            "notes": "Wartet auf Qualitätsprüfung"
        },
        {
            "step": "Freigabe",
            "status": "pending",
            "completed_by": None,
            "completed_at": None,
            "notes": "Wartet auf Freigabe"
        }
    ]

async def perform_ki_analysis(charge_data: Dict[str, Any]) -> KiAnalysis:
    """KI-Analyse durchführen"""
    risk_score = ki_service.calculate_risk_score(charge_data)
    quality_prediction = ki_service.predict_quality(risk_score)
    shelf_life_prediction = ki_service.predict_shelf_life(charge_data)
    anomaly_detection = ki_service.detect_anomalies(charge_data)
    recommendations = ki_service.generate_recommendations(charge_data, risk_score)
    
    return KiAnalysis(
        risk_score=risk_score,
        quality_prediction=quality_prediction,
        shelf_life_prediction=shelf_life_prediction,
        price_optimization_suggestion=charge_data.get("purchase_price", 0) * (0.9 + 0.2 * (risk_score / 100)),
        anomaly_detection=anomaly_detection,
        trend_analysis=f"Risiko-Score: {risk_score}/100, Qualität: {quality_prediction}",
        recommendations=recommendations
    )

# API Endpoints
@app.post("/api/charges", response_model=ChargeResponse)
async def create_charge(charge_data: ChargeCreate, background_tasks: BackgroundTasks):
    """Neue Charge erstellen"""
    try:
        # Chargennummer generieren falls nicht vorhanden
        if not charge_data.charge_number:
            charge_data.charge_number = generate_charge_number()
        
        # Grunddaten erstellen
        charge_dict = charge_data.dict()
        charge_dict["created_at"] = datetime.now().isoformat()
        charge_dict["created_by"] = "API"
        charge_dict["workflow_status"] = WorkflowStatus.DRAFT
        charge_dict["workflow_steps"] = create_workflow_steps()
        charge_dict["certificates"] = []
        
        # KI-Analyse durchführen
        ki_analysis = await perform_ki_analysis(charge_dict)
        charge_dict["ki_analysis"] = ki_analysis.dict()
        
        # Charge speichern
        charges_db[charge_data.charge_number] = charge_dict
        
        # n8n Workflow im Hintergrund auslösen
        background_tasks.add_task(
            n8n_integration.trigger_workflow,
            "charge-processing",
            charge_dict
        )
        
        logger.info(f"✅ Charge {charge_data.charge_number} erstellt")
        return ChargeResponse(**charge_dict)
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Erstellen der Charge: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/charges", response_model=List[ChargeResponse])
async def list_charges(
    quality_status: Optional[QualityStatus] = None,
    vlog_gmo_status: Optional[VlogGmoStatus] = None,
    workflow_status: Optional[WorkflowStatus] = None
):
    """Chargen auflisten"""
    try:
        charges = list(charges_db.values())
        
        # Filter anwenden
        if quality_status:
            charges = [c for c in charges if c.get("quality_status") == quality_status]
        
        if vlog_gmo_status:
            charges = [c for c in charges if c.get("vlog_gmo_status") == vlog_gmo_status]
        
        if workflow_status:
            charges = [c for c in charges if c.get("workflow_status") == workflow_status]
        
        return [ChargeResponse(**charge) for charge in charges]
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Auflisten der Chargen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/charges/{charge_number}", response_model=ChargeResponse)
async def get_charge(charge_number: str):
    """Charge abrufen"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        charge_data = charges_db[charge_number]
        
        # KI-Analyse aktualisieren
        ki_analysis = await perform_ki_analysis(charge_data)
        charge_data["ki_analysis"] = ki_analysis.dict()
        
        return ChargeResponse(**charge_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Abrufen der Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/charges/{charge_number}", response_model=ChargeResponse)
async def update_charge(charge_number: str, updates: ChargeUpdate, background_tasks: BackgroundTasks):
    """Charge aktualisieren"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        charge_data = charges_db[charge_number]
        
        # Updates anwenden
        update_dict = updates.dict(exclude_unset=True)
        charge_data.update(update_dict)
        charge_data["updated_at"] = datetime.now().isoformat()
        charge_data["updated_by"] = "API"
        
        # KI-Analyse aktualisieren
        ki_analysis = await perform_ki_analysis(charge_data)
        charge_data["ki_analysis"] = ki_analysis.dict()
        
        # n8n Workflow im Hintergrund auslösen
        background_tasks.add_task(
            n8n_integration.trigger_workflow,
            "charge-update",
            {"charge_number": charge_number, "updates": update_dict}
        )
        
        logger.info(f"✅ Charge {charge_number} aktualisiert")
        return ChargeResponse(**charge_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Aktualisieren der Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/charges/{charge_number}")
async def delete_charge(charge_number: str, background_tasks: BackgroundTasks):
    """Charge löschen"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        del charges_db[charge_number]
        
        # n8n Workflow im Hintergrund auslösen
        background_tasks.add_task(
            n8n_integration.trigger_workflow,
            "charge-delete",
            {"charge_number": charge_number}
        )
        
        logger.info(f"✅ Charge {charge_number} gelöscht")
        return {"message": f"Charge {charge_number} erfolgreich gelöscht"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Löschen der Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/charges/{charge_number}/approve")
async def approve_charge(charge_number: str, background_tasks: BackgroundTasks):
    """Charge freigeben"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        charge_data = charges_db[charge_number]
        charge_data["workflow_status"] = WorkflowStatus.APPROVED
        charge_data["quality_status"] = QualityStatus.APPROVED
        charge_data["updated_at"] = datetime.now().isoformat()
        charge_data["updated_by"] = "API"
        
        # Workflow-Schritte aktualisieren
        for step in charge_data["workflow_steps"]:
            if step["step"] == "Freigabe":
                step["status"] = "completed"
                step["completed_by"] = "API"
                step["completed_at"] = datetime.now().isoformat()
                step["notes"] = "Charge freigegeben"
        
        # n8n Workflow im Hintergrund auslösen
        background_tasks.add_task(
            n8n_integration.trigger_workflow,
            "charge-approve",
            {"charge_number": charge_number}
        )
        
        logger.info(f"✅ Charge {charge_number} freigegeben")
        return {"message": f"Charge {charge_number} erfolgreich freigegeben"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Freigeben der Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/charges/{charge_number}/quarantine")
async def quarantine_charge(charge_number: str, reason: str, background_tasks: BackgroundTasks):
    """Charge in Quarantäne setzen"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        charge_data = charges_db[charge_number]
        charge_data["workflow_status"] = WorkflowStatus.IN_REVIEW
        charge_data["quality_status"] = QualityStatus.QUARANTINE
        charge_data["updated_at"] = datetime.now().isoformat()
        charge_data["updated_by"] = "API"
        
        # Workflow-Schritte aktualisieren
        for step in charge_data["workflow_steps"]:
            if step["step"] == "Qualitätsprüfung":
                step["status"] = "completed"
                step["completed_by"] = "API"
                step["completed_at"] = datetime.now().isoformat()
                step["notes"] = f"Quarantäne: {reason}"
        
        # n8n Workflow im Hintergrund auslösen
        background_tasks.add_task(
            n8n_integration.trigger_workflow,
            "charge-quarantine",
            {"charge_number": charge_number, "reason": reason}
        )
        
        logger.info(f"✅ Charge {charge_number} in Quarantäne gesetzt")
        return {"message": f"Charge {charge_number} in Quarantäne gesetzt: {reason}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Quarantäne-Setzen der Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/charges/{charge_number}/ki-analysis")
async def get_ki_analysis(charge_number: str):
    """KI-Analyse für Charge abrufen"""
    try:
        if charge_number not in charges_db:
            raise HTTPException(status_code=404, detail=f"Charge {charge_number} nicht gefunden")
        
        charge_data = charges_db[charge_number]
        ki_analysis = await perform_ki_analysis(charge_data)
        
        return ki_analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler bei KI-Analyse für Charge {charge_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/charges/stats/overview")
async def get_charge_statistics():
    """Chargen-Statistiken abrufen"""
    try:
        total_charges = len(charges_db)
        
        # Status-Verteilung
        status_counts = {}
        quality_counts = {}
        vlog_counts = {}
        
        for charge in charges_db.values():
            # Workflow-Status
            status = charge.get("workflow_status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Qualitätsstatus
            quality = charge.get("quality_status", "unknown")
            quality_counts[quality] = quality_counts.get(quality, 0) + 1
            
            # VLOG/GMO Status
            vlog = charge.get("vlog_gmo_status", "unknown")
            vlog_counts[vlog] = vlog_counts.get(vlog, 0) + 1
        
        # Durchschnittlicher Risiko-Score
        risk_scores = []
        for charge in charges_db.values():
            if "ki_analysis" in charge and charge["ki_analysis"]:
                risk_scores.append(charge["ki_analysis"].get("risk_score", 50))
        
        avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 50
        
        return {
            "total_charges": total_charges,
            "status_distribution": status_counts,
            "quality_distribution": quality_counts,
            "vlog_gmo_distribution": vlog_counts,
            "average_risk_score": round(avg_risk_score, 2),
            "high_risk_charges": len([s for s in risk_scores if s > 70]),
            "low_risk_charges": len([s for s in risk_scores if s < 30])
        }
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Abrufen der Statistiken: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health Check
@app.get("/health")
async def health_check():
    """Health Check Endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "VALEO NeuroERP Charge Management API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 