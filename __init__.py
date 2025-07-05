# -*- coding: utf-8 -*-
"""
🚀 GENXAIS Framework - GENerative eXplainable Artificial Intelligence System
"Build the Future from the Beginning"

Main package initialization for GENXAIS Framework.
"""

__version__ = "1.0.1"
__author__ = "GENXAIS Team"
__description__ = "Generalized modular framework for AI-driven development"

# Make the core framework available at package level
try:
    from .core.framework import GENXAIS_Framework
    from .core.config import Config
    from .core.rag_system import RAGSystem
    from .core.apm_phases import APMPhases
except ImportError:
    # Fallback for direct script execution
    import sys
    import os
    sys.path.insert(0, os.path.dirname(__file__))
    
    from core.framework import GENXAIS_Framework
    from core.config import Config
    from core.rag_system import RAGSystem
    from core.apm_phases import APMPhases

__all__ = ['GENXAIS_Framework', 'Config', 'RAGSystem', 'APMPhases'] 