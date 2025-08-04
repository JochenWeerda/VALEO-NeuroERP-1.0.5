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
    """
    Manage application lifecycle
    """
    # Startup
    logger.info("Starting VALEO NeuroERP 2.0...")
    
    # Initialize database
    logger.info("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    # Initialize cache
    logger.info("Initializing cache...")
    cache_manager.clear_all()
    
    # Initialize monitoring
    logger.info("Setting up monitoring...")
    
    logger.info("VALEO NeuroERP 2.0 started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down VALEO NeuroERP 2.0...")
    
    # Close database connections
    optimized_db.close_all_connections()
    
    # Close cache connections
    cache_manager.close()
    
    logger.info("VALEO NeuroERP 2.0 shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="VALEO NeuroERP 2.0",
    description="Intelligentes ERP-System mit KI-Integration - Based on VALEO 1.0.5",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts
)

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
    return {
        "name": "VALEO NeuroERP 2.0",
        "version": "2.0.0",
        "status": "operational",
        "modules": {
            "total": 12,
            "implemented": 12,
            "coverage": "100%"
        },
        "features": {
            "landhandel_specific": True,
            "dsgvo_compliant": True,
            "ki_integration": True,
            "mobile_app": True
        },
        "api_docs": "/api/docs",
        "health_check": "/health"
    }

# Error handlers
@app.exception_handler(404)
async def not_found(request: Request, exc):
    return {
        "error": "Not Found",
        "message": f"The requested URL {request.url.path} was not found.",
        "status_code": 404
    }

@app.exception_handler(500)
async def server_error(request: Request, exc):
    logger.error(f"Internal server error: {exc}")
    return {
        "error": "Internal Server Error",
        "message": "An internal server error occurred. Please try again later.",
        "status_code": 500
    }

# Monitoring endpoints
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi.responses import Response
    
    metrics_data = generate_latest()
    return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)

@app.get("/api/v1/system/info")
async def system_info():
    """Get system information"""
    import platform
    import psutil
    
    return {
        "system": {
            "platform": platform.system(),
            "version": platform.version(),
            "processor": platform.processor(),
            "python_version": platform.python_version()
        },
        "resources": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        },
        "application": {
            "name": "VALEO NeuroERP",
            "version": "2.0.0",
            "environment": settings.environment
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    ) 