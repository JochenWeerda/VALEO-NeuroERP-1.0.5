"""
API-Paketinitialisierung.

Hinweis: Diese Datei wurde vereinfacht, um harte Importabhängigkeiten zu vermeiden,
die das Laden des Pakets verhindern könnten. Einzelne Router werden an anderer Stelle
gezielt importiert und zur FastAPI-App hinzugefügt.
"""

from fastapi import APIRouter

# Optionaler, leerer Sammelrouter. Weitere Includes können anrufseitig erfolgen.
api_router = APIRouter()

__all__ = ["api_router"]
