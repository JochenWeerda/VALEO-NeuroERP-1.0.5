"""
API-Schnittstelle für den IP-Manager-Service.
Bietet HTTP-Endpunkte zur Verwaltung von IP-Adressen und Ports für Microservices.
"""

import os
import sys
import json
import uvicorn
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Query, Depends
from pydantic import BaseModel, Field

# Eigene Module importieren
from ip_manager import get_ip_manager, IPManagerService

app = FastAPI(
    title="IP-Manager-API",
    description="API für die zentrale Verwaltung von IP-Adressen und Ports für Microservices",
    version="0.1.0"
)

# Datenmodelle für die API
class ServiceRegistrationRequest(BaseModel):
    """Anfrage zur Registrierung eines Services"""
    service_id: str = Field(..., description="Eindeutige ID des Services")
    service_name: str = Field(..., description="Name des Services")
    service_type: str = Field("generic", description="Typ des Services")
    preferred_port: Optional[int] = Field(None, description="Bevorzugter Port")
    host: Optional[str] = Field(None, description="Bevorzugte IP-Adresse")
    additional_info: Optional[Dict[str, Any]] = Field(None, description="Zusätzliche Informationen")

class ServiceRegistrationResponse(BaseModel):
    """Antwort auf eine Service-Registrierung"""
    ip: str = Field(..., description="Zugewiesene IP-Adresse")
    port: int = Field(..., description="Zugewiesener Port")
    status: str = Field(..., description="Registrierungsstatus")
    message: Optional[str] = Field(None, description="Zusätzliche Informationen")

class ServiceDeregistrationRequest(BaseModel):
    """Anfrage zur Abmeldung eines Services"""
    service_id: str = Field(..., description="ID des abzumeldenden Services")

class ServiceDeregistrationResponse(BaseModel):
    """Antwort auf eine Service-Abmeldung"""
    success: bool = Field(..., description="Erfolg der Abmeldung")
    message: str = Field(..., description="Meldung zur Abmeldung")

class HeartbeatRequest(BaseModel):
    """Anfrage zur Aktualisierung des Heartbeats eines Services"""
    service_id: str = Field(..., description="ID des Services")

class HeartbeatResponse(BaseModel):
    """Antwort auf eine Heartbeat-Aktualisierung"""
    success: bool = Field(..., description="Erfolg der Aktualisierung")
    message: str = Field(..., description="Meldung zur Aktualisierung")

class ServiceInfo(BaseModel):
    """Informationen zu einem Service"""
    service_name: str
    service_type: str
    ip: str
    port: int
    status: str
    registered_at: str
    last_heartbeat: Optional[str] = None
    environment: str
    additional_info: Optional[Dict[str, Any]] = None

class ServiceEndpointResponse(BaseModel):
    """Antwort mit dem Endpunkt eines Services"""
    endpoint: Optional[str] = Field(None, description="URL des Service-Endpunkts")
    exists: bool = Field(..., description="Gibt an, ob der Service existiert")

# Abhängigkeit zur Bereitstellung des IP-Manager-Services
def get_ip_manager_service():
    """Gibt die Instanz des IP-Manager-Services zurück"""
    return get_ip_manager()

# API-Endpunkte
@app.get("/")
async def root():
    """Basisendpunkt der API"""
    return {
        "message": "IP-Manager-API ist aktiv",
        "version": app.version,
        "description": app.description
    }

@app.post("/register", response_model=ServiceRegistrationResponse)
async def register_service(
    request: ServiceRegistrationRequest,
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Registriert einen Service und weist eine IP-Adresse und einen Port zu"""
    additional_params = {}
    if request.additional_info:
        additional_params = request.additional_info
    
    result = ip_manager.register_service(
        service_id=request.service_id,
        service_name=request.service_name,
        service_type=request.service_type,
        preferred_port=request.preferred_port,
        host=request.host,
        **additional_params
    )
    
    if "error" in result.get("status", ""):
        return ServiceRegistrationResponse(
            ip=result.get("ip", "0.0.0.0"),
            port=result.get("port", 0),
            status="error",
            message=result.get("message", "Unbekannter Fehler")
        )
    
    return ServiceRegistrationResponse(
        ip=result.get("ip", "0.0.0.0"),
        port=result.get("port", 0),
        status=result.get("status", "unknown"),
        message=result.get("message", None)
    )

@app.post("/deregister", response_model=ServiceDeregistrationResponse)
async def deregister_service(
    request: ServiceDeregistrationRequest,
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Meldet einen Service ab und gibt seinen Port frei"""
    success = ip_manager.deregister_service(request.service_id)
    
    if success:
        return ServiceDeregistrationResponse(
            success=True,
            message=f"Service {request.service_id} erfolgreich abgemeldet"
        )
    
    return ServiceDeregistrationResponse(
        success=False,
        message=f"Service {request.service_id} konnte nicht abgemeldet werden"
    )

@app.post("/heartbeat", response_model=HeartbeatResponse)
async def update_heartbeat(
    request: HeartbeatRequest,
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Aktualisiert den Heartbeat eines Services"""
    success = ip_manager.heartbeat(request.service_id)
    
    if success:
        return HeartbeatResponse(
            success=True,
            message=f"Heartbeat für Service {request.service_id} aktualisiert"
        )
    
    return HeartbeatResponse(
        success=False,
        message=f"Service {request.service_id} nicht gefunden"
    )

@app.get("/services", response_model=List[ServiceInfo])
async def list_services(
    service_type: Optional[str] = Query(None, description="Filter nach Service-Typ"),
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Gibt eine Liste aller registrierten Services zurück"""
    services = ip_manager.list_services(service_type)
    return services

@app.get("/services/{service_id}", response_model=ServiceInfo)
async def get_service(
    service_id: str,
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Gibt Informationen zu einem bestimmten Service zurück"""
    service_info = ip_manager.get_service_info(service_id)
    
    if service_info is None:
        raise HTTPException(status_code=404, detail=f"Service {service_id} nicht gefunden")
    
    return service_info

@app.get("/endpoint/{service_id}", response_model=ServiceEndpointResponse)
async def get_service_endpoint(
    service_id: str,
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Gibt den Endpunkt eines Services zurück"""
    endpoint = ip_manager.get_service_endpoint(service_id)
    
    if endpoint is None:
        return ServiceEndpointResponse(
            endpoint=None,
            exists=False
        )
    
    return ServiceEndpointResponse(
        endpoint=endpoint,
        exists=True
    )

@app.get("/cleanup", response_model=Dict[str, Any])
async def cleanup_stale_services(
    timeout_minutes: int = Query(30, description="Timeout in Minuten seit dem letzten Heartbeat"),
    ip_manager: IPManagerService = Depends(get_ip_manager_service)
):
    """Bereinigt inaktive Services"""
    count = ip_manager.cleanup_stale_services(timeout_minutes)
    
    return {
        "success": True,
        "cleaned_services_count": count,
        "message": f"{count} inaktive Services wurden bereinigt"
    }

@app.get("/health")
async def health_check():
    """Gesundheitscheck für den IP-Manager-Service"""
    return {
        "status": "healthy",
        "message": "IP-Manager-Service ist aktiv"
    }

def start():
    """Startet den IP-Manager-Service mit der API"""
    host = os.environ.get("IP_MANAGER_HOST", "0.0.0.0")
    port = int(os.environ.get("IP_MANAGER_PORT", "8020"))
    
    print(f"IP-Manager-API wird gestartet auf http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    start() 