"""
LinkUP MCP (Model-Controller-Pipeline) Framework für VALEO-NeuroERP

Dieses Framework stellt die Grundlage für die Pipeline-basierte Verarbeitung
im VALEO-NeuroERP-System bereit.
"""

__version__ = "1.8.1"
__author__ = "VALEO-NeuroERP Team"

# Leichte, stabile Exporte
from .langgraph_integration import LangGraphIntegration, AgentType
from .pipelines.valero_full_analysis import run_valero_full_analysis

__all__ = [
    "LangGraphIntegration",
    "AgentType",
    "run_valero_full_analysis",
] 