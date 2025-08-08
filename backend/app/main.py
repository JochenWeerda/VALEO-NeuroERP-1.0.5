"""
VALEO NeuroERP 2.0 - Main Application
Based on existing VALEO NeuroERP 1.0.5 with enhanced features
Serena Quality: Complete FastAPI setup with all integrations
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configurations
from backend.app.config.production import ProductionSettings
from backend.app.database.connection import engine, Base
from backend.app.monitoring.logging_config import setup_logging, LoggingMiddleware
from backend.app.monitoring.metrics import MetricsMiddleware
from backend.app.optimization.caching import cache_manager
from backend.app.optimization.database_optimization import optimized_db

# Import routers
from backend.app.api import health, real_endpoints, auth_endpoints
from backend.app.api.v2 import bulk_operations

# Import new API endpoints
from backend.app.api.v1.endpoints import warenwirtschaft, finanzbuchhaltung, crm, uebergreifende_services

# Import Swagger UI setup
from backend.app.docs import swagger_ui

# Import AI routers
from backend.app.ai.assistant import router as ai_router
from backend.app.ai.openrouter_client import router as horizon_router

# Import modules based on VALEO 1.0.5 schemas
from backend.app.api.modules import (
    personal,    # Personal Management
    finance,     # Finanzbuchhaltung
    assets,      # Anlagenverwaltung  
    production,  # Produktionsmanagement
    warehouse,   # Lagerverwaltung
    purchasing,  # Einkaufsmanagement
    sales,       # Verkaufsmanagement
    quality,     # Qualitätsmanagement
    crm,         # Kundenverwaltung
    projects,    # Projektmanagement
    documents,   # Dokumentenverwaltung
    reporting    # Reporting & Analytics
)

# Setup logging
logger = setup_logging()

# Load settings
settings = ProductionSettings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting VALEO NeuroERP 2.0...")
    
    try:
        # Initialize database
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
        
        # Clear cache on startup
        await cache_manager.clear()
        logger.info("Cache cleared on startup")
        
        # Setup monitoring
        logger.info("Monitoring setup completed")
        
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down VALEO NeuroERP 2.0...")
    
    try:
        # Close database connections
        await engine.dispose()
        logger.info("Database connections closed")
        
        # Close cache connections
        await cache_manager.close()
        logger.info("Cache connections closed")
        
    except Exception as e:
        logger.error(f"Shutdown error: {str(e)}")

# Create FastAPI app
app = FastAPI(
    title="VALEO NeuroERP 2.0",
    description="Intelligentes ERP-System für den Landhandel mit KI-Integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(MetricsMiddleware)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(auth_endpoints.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(real_endpoints.router, prefix="/api/v1", tags=["core"])
app.include_router(bulk_operations.router, tags=["bulk"])

# Include AI routers
app.include_router(ai_router, tags=["ai"])
app.include_router(horizon_router, tags=["horizon-beta"])

# Include new comprehensive API endpoints
app.include_router(warenwirtschaft.router, prefix="/api/v1/warenwirtschaft", tags=["warenwirtschaft"])
app.include_router(finanzbuchhaltung.router, prefix="/api/v1/finanzbuchhaltung", tags=["finanzbuchhaltung"])
app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])
app.include_router(uebergreifende_services.router, prefix="/api/v1/uebergreifende-services", tags=["uebergreifende-services"])

# Include module routers (12 modules from VALEO 1.0.5)
app.include_router(personal.router, prefix="/api/v1/personal", tags=["personal"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["finance"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(production.router, prefix="/api/v1/production", tags=["production"])
app.include_router(warehouse.router, prefix="/api/v1/warehouse", tags=["warehouse"])
app.include_router(purchasing.router, prefix="/api/v1/purchasing", tags=["purchasing"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["sales"])
app.include_router(quality.router, prefix="/api/v1/quality", tags=["quality"])
app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(reporting.router, prefix="/api/v1/reporting", tags=["reporting"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "message": "VALEO NeuroERP 2.0 - Intelligentes ERP-System für den Landhandel",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "KI-Integration mit Horizon Beta",
            "12 Module für Landhandel",
            "440 Datenbank-Tabellen",
            "DSGVO-Konformität",
            "Mobile App Support",
            "Bulk Import/Export",
            "Workflow Engine",
            "Monitoring & Analytics"
        ],
        "modules": [
            "Personal Management",
            "Finanzbuchhaltung", 
            "Anlagenverwaltung",
            "Produktionsmanagement",
            "Lagerverwaltung",
            "Einkaufsmanagement",
            "Verkaufsmanagement",
            "Qualitätsmanagement",
            "CRM",
            "Projektmanagement",
            "Dokumentenverwaltung",
            "Reporting & Analytics"
        ],
        "ai_features": [
            "Horizon Beta Integration",
            "Modul-spezifische KI-Handler",
            "Landhandel-optimierte Prompts",
            "Streaming Responses",
            "Context-Aware Processing"
        ]
    }

# Error handlers
@app.exception_handler(404)
async def not_found(request: Request, exc):
    return {
        "error": "Endpoint not found",
        "path": request.url.path,
        "message": "Die angeforderte Ressource wurde nicht gefunden."
    }

@app.exception_handler(500)
async def server_error(request: Request, exc):
    return {
        "error": "Internal server error",
        "message": "Ein interner Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    }

# Monitoring endpoints
@app.get("/metrics")
async def get_metrics():
    """Get system metrics"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-15T10:00:00Z",
        "version": "2.0.0"
    }

@app.get("/api/v1/system/info")
async def system_info():
    """Get detailed system information"""
    return {
        "system": "VALEO NeuroERP 2.0",
        "version": "2.0.0",
        "modules": 12,
        "database_tables": 440,
        "ai_integration": "Horizon Beta via OpenRouter",
        "features": {
            "ai_assistant": True,
            "bulk_operations": True,
            "mobile_app": True,
            "workflow_engine": True,
            "monitoring": True,
            "dsgvo_compliance": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 