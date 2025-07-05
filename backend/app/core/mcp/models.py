from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MCPCommandType(str, Enum):
    QUERY = "query"
    COMMAND = "command"
    STATUS = "status"
    EVENT = "event"

class MCPRequest(BaseModel):
    command_type: MCPCommandType
    target: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: str = Field(..., description="Eindeutige Anfrage-ID")

class MCPResponse(BaseModel):
    request_id: str
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MCPEvent(BaseModel):
    event_type: str
    source: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_id: str = Field(..., description="Eindeutige Event-ID") 