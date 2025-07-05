"""
Server-Modul für das AI-gesteuerte ERP-System
"""

import os
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import uvicorn

# Import der API-Endpunkte aus documents.py
import backend.api.v1.endpoints.documents as documents_module

# Root-Endpunkt für die API
async def root(request):
    """Root-Endpunkt für die API"""
    return JSONResponse({
        "message": "Willkommen zur AI-gesteuerten ERP-API",
        "version": "1.0.0",
        "documentation": "/docs"
    })

# Gesundheitscheck
async def health_check(request):
    """Gesundheitsprüfung für die API"""
    return JSONResponse({
        "status": "ok",
        "message": "Der Server läuft"
    })

# Inventur-Endpunkte als Beispiel
async def get_inventuren(request):
    """Liefert eine Beispiel-Inventur zurück"""
    return JSONResponse({
        "inventuren": [
            {
                "id": 1,
                "bezeichnung": "Jahresinventur 2023",
                "status": "abgeschlossen"
            }
        ]
    })

# Routing für die Starlette-Anwendung
routes = [
    Route("/", root),
    Route("/health", health_check),
    Route("/api/v1/inventuren", get_inventuren),
    
    # Dokument-Routen hinzufügen
    Route("/api/v1/documents/test", documents_module.get_tags),
]

# Middleware für CORS
middleware = [
    Middleware(CORSMiddleware,
               allow_origins=["*"],
               allow_credentials=True,
               allow_methods=["*"],
               allow_headers=["*"])
]

# Starlette-Anwendung mit Routen und Middleware
app = Starlette(
    debug=True,
    routes=routes,
    middleware=middleware
)

# Server starten, wenn die Datei direkt ausgeführt wird
if __name__ == "__main__":
    print("Starte Server auf http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000) 