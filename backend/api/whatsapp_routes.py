"""
WhatsApp Web API Routes
Rechtssichere FastAPI-Endpunkte für WhatsApp Integration
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
import logging

from ..services.whatsapp_service import WhatsAppWebService, WhatsAppConfig, WhatsAppAPI

# Router erstellen
router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Integration"])

# Security
security = HTTPBearer()

# Logger
logger = logging.getLogger(__name__)

# Pydantic Models für API
class SendMessageRequest(BaseModel):
    phone_number: str
    message: str
    customer_id: Optional[str] = None
    
    @validator('phone_number')
    def validate_phone_number(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Telefonnummer ist erforderlich')
        # Entferne Leerzeichen und prüfe Format
        v = v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not v.startswith('+'):
            v = '+49' + v.lstrip('0')  # Deutsche Nummer als Standard
        return v
    
    @validator('message')
    def validate_message(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Nachricht ist erforderlich')
        if len(v) > 4096:
            raise ValueError('Nachricht zu lang (max. 4096 Zeichen)')
        return v.strip()

class ConsentRequest(BaseModel):
    customer_id: str
    phone_number: str
    consent_method: str = "web"
    
    @validator('customer_id')
    def validate_customer_id(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Kunden-ID ist erforderlich')
        return v.strip()

class TemplateRequest(BaseModel):
    name: str
    message: str
    category: str
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Template-Name ist erforderlich')
        return v.strip()
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['greeting', 'order', 'support', 'custom']
        if v not in allowed_categories:
            raise ValueError(f'Kategorie muss einer von {allowed_categories} sein')
        return v

class MessageResponse(BaseModel):
    id: str
    phone_number: str
    message: str
    timestamp: str
    status: str
    consent_given: bool

class SendMessageResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None
    timestamp: str

class HistoryResponse(BaseModel):
    success: bool
    messages: List[MessageResponse]
    count: int
    error: Optional[str] = None

class ConsentResponse(BaseModel):
    success: bool
    message: str
    timestamp: str
    error: Optional[str] = None

class TemplateResponse(BaseModel):
    id: str
    name: str
    message: str
    category: str

class ConnectionStatusResponse(BaseModel):
    connected: bool
    last_check: str
    browser_available: bool

# Dependency für WhatsApp Service
async def get_whatsapp_service():
    """Dependency für WhatsApp Service"""
    config = WhatsAppConfig(
        data_retention_days=90,
        consent_required=True,
        rate_limit_per_hour=50
    )
    service = WhatsAppWebService(config)
    try:
        yield service
    finally:
        await service.close()

# API Endpunkte

@router.get("/status", response_model=ConnectionStatusResponse)
async def get_connection_status(
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Prüft den Verbindungsstatus von WhatsApp Web"""
    try:
        return ConnectionStatusResponse(
            connected=service.is_connected,
            last_check=datetime.now().isoformat(),
            browser_available=hasattr(service, 'browser') and service.browser is not None
        )
    except Exception as e:
        logger.error(f"Fehler beim Prüfen des Status: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Prüfen des Status")

@router.post("/connect")
async def connect_whatsapp_web(
    background_tasks: BackgroundTasks,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Verbindet mit WhatsApp Web"""
    try:
        # Browser initialisieren
        await service.initialize_browser()
        
        # Verbindung herstellen
        connected = await service.connect_whatsapp_web()
        
        if connected:
            return {
                "success": True,
                "message": "WhatsApp Web erfolgreich verbunden",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail="Verbindung zu WhatsApp Web fehlgeschlagen"
            )
            
    except Exception as e:
        logger.error(f"Fehler beim Verbinden: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Verbindungsfehler: {str(e)}"
        )

@router.post("/send", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Sendet eine WhatsApp-Nachricht"""
    try:
        # Rechtssichere Prüfungen
        if request.customer_id:
            if not service.db.check_consent(request.customer_id):
                raise HTTPException(
                    status_code=403,
                    detail="Keine Einwilligung für WhatsApp-Nachrichten vorhanden"
                )
        
        # Nachricht senden
        success = await service.send_message(
            request.phone_number,
            request.message,
            request.customer_id
        )
        
        if success:
            return SendMessageResponse(
                success=True,
                message_id=service._generate_message_id(),
                timestamp=datetime.now().isoformat()
            )
        else:
            return SendMessageResponse(
                success=False,
                error="Fehler beim Senden der Nachricht",
                timestamp=datetime.now().isoformat()
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Senden: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Senden: {str(e)}"
        )

@router.get("/history/{customer_id}", response_model=HistoryResponse)
async def get_message_history(
    customer_id: str,
    limit: int = 50,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Holt den Nachrichtenverlauf eines Kunden"""
    try:
        messages = await service.get_message_history(customer_id, limit)
        
        return HistoryResponse(
            success=True,
            messages=[
                MessageResponse(
                    id=msg['id'],
                    phone_number=msg['phone_number'],
                    message=msg['message'],
                    timestamp=msg['timestamp'],
                    status=msg['status'],
                    consent_given=msg['consent_given']
                )
                for msg in messages
            ],
            count=len(messages)
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Verlaufs: {e}")
        return HistoryResponse(
            success=False,
            messages=[],
            count=0,
            error=str(e)
        )

@router.post("/consent", response_model=ConsentResponse)
async def save_consent(
    request: ConsentRequest,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Speichert Kunden-Einwilligung für WhatsApp-Nachrichten"""
    try:
        service.db.save_consent(
            request.customer_id,
            request.phone_number,
            request.consent_method
        )
        
        return ConsentResponse(
            success=True,
            message="Einwilligung erfolgreich gespeichert",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Speichern der Einwilligung: {e}")
        return ConsentResponse(
            success=False,
            message="Fehler beim Speichern der Einwilligung",
            timestamp=datetime.now().isoformat(),
            error=str(e)
        )

@router.get("/consent/{customer_id}")
async def check_consent(
    customer_id: str,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Prüft ob ein Kunde eingewilligt hat"""
    try:
        has_consent = service.db.check_consent(customer_id)
        
        return {
            "success": True,
            "customer_id": customer_id,
            "consent_given": has_consent,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Prüfen der Einwilligung: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Prüfen der Einwilligung: {str(e)}"
        )

@router.post("/templates", response_model=TemplateResponse)
async def save_template(
    request: TemplateRequest,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Speichert ein Nachrichten-Template"""
    try:
        template_id = service.save_template(
            request.name,
            request.message,
            request.category
        )
        
        return TemplateResponse(
            id=template_id,
            name=request.name,
            message=request.message,
            category=request.category
        )
        
    except Exception as e:
        logger.error(f"Fehler beim Speichern des Templates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Speichern des Templates: {str(e)}"
        )

@router.get("/templates", response_model=List[TemplateResponse])
async def get_templates(
    category: Optional[str] = None,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Holt alle Nachrichten-Templates"""
    try:
        templates = service.get_templates(category)
        
        return [
            TemplateResponse(
                id=template['id'],
                name=template['name'],
                message=template['message'],
                category=template['category']
            )
            for template in templates
        ]
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Templates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen der Templates: {str(e)}"
        )

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Löscht ein Nachrichten-Template"""
    try:
        with service.db.db.connect(service.db.db_path) as conn:
            deleted = conn.execute("""
                DELETE FROM message_templates 
                WHERE id = ?
            """, (template_id,)).rowcount
        
        if deleted > 0:
            return {
                "success": True,
                "message": "Template erfolgreich gelöscht",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Template nicht gefunden"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Templates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Löschen des Templates: {str(e)}"
        )

@router.post("/cleanup")
async def cleanup_old_messages(
    background_tasks: BackgroundTasks,
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Löscht alte Nachrichten (DSGVO-konform)"""
    try:
        # Führe Cleanup im Hintergrund aus
        background_tasks.add_task(service.cleanup_old_messages)
        
        return {
            "success": True,
            "message": "Cleanup gestartet",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Starten des Cleanups: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Starten des Cleanups: {str(e)}"
        )

@router.get("/stats")
async def get_whatsapp_stats(
    service: WhatsAppWebService = Depends(get_whatsapp_service)
):
    """Holt WhatsApp-Statistiken"""
    try:
        with service.db.db.connect(service.db.db_path) as conn:
            # Gesamte Nachrichten
            total_messages = conn.execute("""
                SELECT COUNT(*) FROM whatsapp_messages
            """).fetchone()[0]
            
            # Nachrichten heute
            today_messages = conn.execute("""
                SELECT COUNT(*) FROM whatsapp_messages 
                WHERE DATE(timestamp) = DATE('now')
            """).fetchone()[0]
            
            # Erfolgreiche Nachrichten
            successful_messages = conn.execute("""
                SELECT COUNT(*) FROM whatsapp_messages 
                WHERE status = 'sent'
            """).fetchone()[0]
            
            # Kunden mit Einwilligung
            customers_with_consent = conn.execute("""
                SELECT COUNT(*) FROM customer_consents 
                WHERE consent_given = TRUE
            """).fetchone()[0]
            
            # Templates
            total_templates = conn.execute("""
                SELECT COUNT(*) FROM message_templates 
                WHERE is_active = TRUE
            """).fetchone()[0]
        
        return {
            "success": True,
            "stats": {
                "total_messages": total_messages,
                "today_messages": today_messages,
                "successful_messages": successful_messages,
                "success_rate": (successful_messages / total_messages * 100) if total_messages > 0 else 0,
                "customers_with_consent": customers_with_consent,
                "total_templates": total_templates,
                "rate_limit_remaining": service.config.rate_limit_per_hour - service.rate_limit_counter
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Statistiken: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen der Statistiken: {str(e)}"
        )

# Rechtssichere Middleware
@router.middleware("http")
async def add_security_headers(request, call_next):
    """Fügt rechtssichere HTTP-Header hinzu"""
    response = await call_next(request)
    
    # DSGVO-konforme Header
    response.headers["X-Data-Protection"] = "DSGVO-konform"
    response.headers["X-Consent-Required"] = "true"
    response.headers["X-Opt-Out-Enabled"] = "true"
    
    return response 