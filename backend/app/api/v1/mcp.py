from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from backend.app.core.mcp.models import MCPRequest, MCPResponse, MCPEvent
from backend.app.core.mcp.service import MCPService
from backend.app.dependencies import get_mcp_service
import uuid

router = APIRouter(prefix="/mcp", tags=["mcp"])

@router.post("/request", response_model=MCPResponse)
async def process_mcp_request(
    request: MCPRequest,
    mcp_service: MCPService = Depends(get_mcp_service)
) -> MCPResponse:
    """
    Verarbeitet eine MCP-Anfrage.
    Unterstützt verschiedene Befehlstypen: QUERY, COMMAND, STATUS
    """
    if not request.request_id:
        request.request_id = str(uuid.uuid4())
    
    return await mcp_service.process_request(request)

@router.post("/event")
async def emit_mcp_event(
    event: MCPEvent,
    mcp_service: MCPService = Depends(get_mcp_service)
) -> Dict[str, Any]:
    """
    Sendet ein MCP-Event an registrierte Handler.
    """
    if not event.event_id:
        event.event_id = str(uuid.uuid4())
    
    await mcp_service.emit_event(event)
    return {"status": "success", "event_id": event.event_id}

@router.get("/status/{target}")
async def get_mcp_status(
    target: str,
    mcp_service: MCPService = Depends(get_mcp_service)
) -> Dict[str, Any]:
    """
    Ruft den Status eines MCP-Targets ab.
    """
    request = MCPRequest(
        command_type="status",
        target=target,
        request_id=str(uuid.uuid4())
    )
    response = await mcp_service.process_request(request)
    return response.dict() 