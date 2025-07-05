"""
VALEO-NeuroERP Compliance Engine

Dieses Modul implementiert die Compliance-Engine für das VALEO-NeuroERP System.
Es enthält Komponenten für:
- Chargenvalidierung
- GMP-Konformität
- EU-Regularien
- Qualitätssicherung
- Monitoring und Alerting
"""

from .models import *
from .validators import *
from .engine import ComplianceEngine
from .monitoring import ComplianceMonitor

__version__ = "1.0.1" 