# -*- coding: utf-8 -*-
"""
🎨 GENXAIS Framework Templates
"Build the Future from the Beginning"

Pre-built templates for rapid project initialization.
Each template follows GENXAIS APM Framework methodology.
"""

from typing import Dict, Any, Type
from .web_app import WebAppTemplate

# Available templates registry
TEMPLATES: Dict[str, Type] = {
    "web_app": WebAppTemplate,
    # "api_service": APIServiceTemplate,
    # "ml_pipeline": MLPipelineTemplate, 
    # "desktop_app": DesktopAppTemplate,
    # "mobile_app": MobileAppTemplate,
    # "general": GeneralTemplate
}

def get_template(template_name: str):
    """Get template class by name."""
    
    if template_name not in TEMPLATES:
        raise ValueError(f"Template '{template_name}' not found. Available: {list(TEMPLATES.keys())}")
    
    return TEMPLATES[template_name]

def list_templates() -> Dict[str, str]:
    """List all available templates with descriptions."""
    
    descriptions = {
        "web_app": "🌐 Modern web application with FastAPI + React",
        "api_service": "🔌 REST API service with FastAPI",
        "ml_pipeline": "🤖 Machine Learning pipeline with MLflow",
        "desktop_app": "💻 Desktop application with PyQt/Tkinter",
        "mobile_app": "📱 Mobile app with React Native",
        "general": "🏗️ General-purpose project template"
    }
    
    return {name: descriptions.get(name, "Description not available") 
            for name in TEMPLATES.keys()}

__all__ = ["TEMPLATES", "get_template", "list_templates", "WebAppTemplate"] 