"""
VALEO-NeuroERP Backend

Dieses Paket enthält die Backend-Implementierung des VALEO-NeuroERP-Systems.
"""

__version__ = "1.0.0"

# Initialisierungsdatei für das Backend-Paket
from .celery import app as celery_app

from .core import logger, ErrorHandler, ErrorCode
from .workflow import workflow_manager

__all__ = ('celery_app', "logger", "ErrorHandler", "ErrorCode", "workflow_manager") 