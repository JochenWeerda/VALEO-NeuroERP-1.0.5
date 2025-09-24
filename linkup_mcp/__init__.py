# -*- coding: utf-8 -*-
"""VALERO linkup_mcp package initializer."""

__version__ = "1.8.1"
__author__ = "VALEO-NeuroERP Team"

# Importiere wichtige Komponenten für einfachen Zugriff
from linkup_mcp.apm_framework.pipeline import Pipeline, PipelineStage, PipelineContext

from .langgraph_integration import LangGraphIntegration, AgentType

__all__ = ["LangGraphIntegration", "AgentType"] 