"""
LinkUP MCP (Model-Controller-Pipeline) Framework für VALEO-NeuroERP

Dieses Framework stellt die Grundlage für die Pipeline-basierte Verarbeitung
im VALEO-NeuroERP-System bereit.
"""

__version__ = "1.8.1"
__author__ = "VALEO-NeuroERP Team"

# Importiere wichtige Komponenten für einfachen Zugriff
from linkup_mcp.apm_framework.pipeline import Pipeline, PipelineStage, PipelineContext

from .langgraph_integration import LangGraphIntegration, AgentType

__all__ = ["LangGraphIntegration", "AgentType"] 