from typing import Optional
from fastapi import Depends
from backend.app.core.mcp.service import MCPService
from backend.app.core.llm.service import LLMService, LLMConfig

# Singleton-Instanzen
_mcp_service: Optional[MCPService] = None
_llm_service: Optional[LLMService] = None

def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        config = LLMConfig()  # Hier könnte die Konfiguration aus Umgebungsvariablen geladen werden
        _llm_service = LLMService(config)
    return _llm_service

def get_mcp_service() -> MCPService:
    global _mcp_service
    if _mcp_service is None:
        llm_service = get_llm_service()
        _mcp_service = MCPService(llm_service)
    return _mcp_service

async def shutdown_services():
    global _mcp_service, _llm_service
    if _mcp_service:
        await _mcp_service.close()
        _mcp_service = None
    if _llm_service:
        await _llm_service.close()
        _llm_service = None 