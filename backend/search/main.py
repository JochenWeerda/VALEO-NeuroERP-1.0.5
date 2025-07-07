"""
VALEO-NeuroERP Search Module Main Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import structlog
from .database import db
from .config import config

# Logger konfigurieren
logger = structlog.get_logger(__name__)

# FastAPI App erstellen
app = FastAPI(
    title="VALEO-NeuroERP Search API",
    description="Advanced Search API for VALEO-NeuroERP",
    version="1.0.0"
)

# CORS Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion anpassen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Wird beim Start der Anwendung ausgeführt"""
    try:
        # Datenbankverbindung herstellen
        await db.connect()
        
        # Indizes erstellen
        await db.create_index(
            {"text": "text"},
            default_language="german"
        )
        await db.create_index(
            {"vector": 1},
            sparse=True
        )
        
        logger.info("Application startup complete")
        
    except Exception as e:
        logger.error("Startup failed", error=str(e))
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Wird beim Beenden der Anwendung ausgeführt"""
    try:
        await db.disconnect()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error("Shutdown failed", error=str(e))
        raise

@app.get("/health")
async def health_check():
    """Endpoint für Health Checks"""
    try:
        # Datenbankverbindung testen
        await db.client.admin.command("ping")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="Service unavailable"
        )

@app.get("/")
async def root():
    """Root Endpoint"""
    return {
        "message": "VALEO-NeuroERP Search API",
        "version": "1.0.0",
        "status": "running"
    } 