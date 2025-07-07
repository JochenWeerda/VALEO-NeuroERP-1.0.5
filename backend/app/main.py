"""
FastAPI Hauptanwendung
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.v1.endpoints.optimized_endpoints import api_router as optimized_router
from backend.core.config import settings
from backend.cache_manager import cache_manager

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
async def startup_event():
    """Startup-Tasks ausführen"""
    # Redis-Verbindung herstellen
    await cache_manager.connect()
    
# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown-Tasks ausführen"""
    # Redis-Verbindung trennen
    await cache_manager.disconnect()
    
# Router einbinden
app.include_router(optimized_router)

# Root Endpoint
@app.get("/")
async def root():
    """Root Endpoint"""
    return {
        "message": "VALERO-NeuroERP API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    } 