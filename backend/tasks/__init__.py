"""
Task-Module für das VALEO-NeuroERP-System.

Dieses Paket enthält alle asynchronen Tasks für die Hintergrundverarbeitung.
"""

from backend.tasks.celery_app import app
from backend.tasks.data_import_tasks import *
from backend.tasks.report_tasks import *
from backend.tasks.email_tasks import *
from backend.tasks.transaction_tasks import *
from backend.tasks.periodic_tasks import *
from backend.tasks.data_analysis_tasks import *
from backend.tasks.media_processing_tasks import *

__all__ = ["app"] 