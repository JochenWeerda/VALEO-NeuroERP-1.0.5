"""
VALEO-NeuroERP Backend

Dieses Paket enthält die Backend-Implementierung des VALEO-NeuroERP-Systems.
"""

__version__ = "1.0.0"

# Initialisierungsdatei für das Backend-Paket
from .core import logger, ErrorHandler, ErrorCode
from .workflow import workflow_manager

__all__ = ("logger", "ErrorHandler", "ErrorCode", "workflow_manager") 