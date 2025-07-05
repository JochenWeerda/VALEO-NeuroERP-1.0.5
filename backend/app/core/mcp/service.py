from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import logging
from backend.app.core.mcp.models import MCPRequest, MCPResponse, MCPEvent, MCPCommandType
from backend.app.core.llm.service import LLMService, LLMConfig

logger = logging.getLogger(__name__)

class MCPService:
    def __init__(self, llm_service: Optional[LLMService] = None):
        self.llm_service = llm_service or LLMService()
        self._event_handlers: Dict[str, List[callable]] = {}
        self._command_handlers: Dict[str, callable] = {}

    async def process_request(self, request: MCPRequest) -> MCPResponse:
        try:
            if request.command_type == MCPCommandType.QUERY:
                return await self._handle_query(request)
            elif request.command_type == MCPCommandType.COMMAND:
                return await self._handle_command(request)
            elif request.command_type == MCPCommandType.STATUS:
                return await self._handle_status(request)
            else:
                raise ValueError(f"Unbekannter Befehlstyp: {request.command_type}")
        except Exception as e:
            logger.error(f"Fehler bei der Verarbeitung der MCP-Anfrage: {str(e)}")
            return MCPResponse(
                request_id=request.request_id,
                status="error",
                error=str(e)
            )

    async def _handle_query(self, request: MCPRequest) -> MCPResponse:
        # Beispiel für eine LLM-gestützte Abfrage
        try:
            prompt = f"Verarbeite die folgende Abfrage für {request.target}: {request.parameters.get('query', '')}"
            result = await self.llm_service.generate(prompt)
            
            return MCPResponse(
                request_id=request.request_id,
                status="success",
                data={"result": result}
            )
        except Exception as e:
            logger.error(f"Fehler bei der Abfrageverarbeitung: {str(e)}")
            raise

    async def _handle_command(self, request: MCPRequest) -> MCPResponse:
        handler = self._command_handlers.get(request.target)
        if not handler:
            raise ValueError(f"Kein Handler für Befehl {request.target} registriert")
        
        try:
            result = await handler(request.parameters)
            return MCPResponse(
                request_id=request.request_id,
                status="success",
                data=result
            )
        except Exception as e:
            logger.error(f"Fehler bei der Befehlsausführung: {str(e)}")
            raise

    async def _handle_status(self, request: MCPRequest) -> MCPResponse:
        # Beispiel für Statusabfrage
        status_info = {
            "timestamp": datetime.utcnow(),
            "target": request.target,
            "status": "active",
            "details": request.parameters
        }
        
        return MCPResponse(
            request_id=request.request_id,
            status="success",
            data=status_info
        )

    def register_event_handler(self, event_type: str, handler: callable):
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)

    def register_command_handler(self, command: str, handler: callable):
        self._command_handlers[command] = handler

    async def emit_event(self, event: MCPEvent):
        handlers = self._event_handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Fehler im Event-Handler: {str(e)}")

    async def close(self):
        await self.llm_service.close() 