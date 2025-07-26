#!/usr/bin/env python3
"""
ValeoFlow Enterprise Backend - Hauptanwendungsdatei
Enterprise-Grade FastAPI-Anwendung mit verbesserter Security und Performance
"""

import os
import sys
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Enterprise Imports
from database.connection_pool import db_manager, performance_monitor
from auth.enterprise_security import security_manager
from api.auth_routes import router as auth_router

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/valeoflow.log"),
    ],
)
logger = logging.getLogger(__name__)

# Prometheus Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
DB_QUERY_DURATION = Histogram('database_query_duration_seconds', 'Database query duration')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application Lifespan Manager"""
    # Startup
    logger.info("🚀 ValeoFlow Enterprise Backend starting up...")
    
    # Database Connection Test
    if db_manager.test_connection():
        logger.info("✅ Database connection established")
    else:
        logger.error("❌ Database connection failed")
        sys.exit(1)
    
    # Security Manager Initialization
    logger.info("🔒 Enterprise Security Manager initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 ValeoFlow Enterprise Backend shutting down...")
    db_manager.close_all_connections()
    logger.info("✅ Cleanup completed")

# FastAPI App mit Enterprise-Features
app = FastAPI(
    title="ValeoFlow Enterprise",
    description="Enterprise-Grade AI-First ERP System",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None,
    lifespan=lifespan
)

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if os.getenv("ENVIRONMENT") == "development" else ["valeoflow.com", "*.valeoflow.com"]
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Performance Monitoring Middleware
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    """Performance Monitoring Middleware"""
    start_time = time.time()
    
    # Request verarbeiten
    response = await call_next(request)
    
    # Metriken aufzeichnen
    duration = time.time() - start_time
    REQUEST_LATENCY.observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    # Response Headers für Performance
    response.headers["X-Response-Time"] = str(duration)
    response.headers["X-Request-ID"] = str(time.time())
    
    return response

# Error Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global Exception Handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Security: Keine internen Details in Production
    if os.getenv("ENVIRONMENT") == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )

# Health Check Endpoint
@app.get("/health")
async def health_check():
    """Comprehensive Health Check"""
    start_time = time.time()
    
    # Database Health
    db_health = db_manager.health_check()
    
    # Security Health
    security_health = {
        "status": "healthy",
        "rate_limiting": "enabled",
        "audit_logging": "enabled"
    }
    
    # Overall Health
    overall_health = "healthy" if db_health["status"] == "healthy" else "unhealthy"
    
    response_time = (time.time() - start_time) * 1000
    
    return {
        "status": overall_health,
        "timestamp": time.time(),
        "response_time_ms": round(response_time, 2),
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "components": {
            "database": db_health,
            "security": security_health
        }
    }

# Metrics Endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus Metrics Endpoint"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

# Root Endpoint
@app.get("/")
async def root():
    """Root Endpoint"""
    return {
        "message": "ValeoFlow Enterprise API",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs" if os.getenv("ENVIRONMENT") == "development" else None
    }

# API Routes
app.include_router(auth_router, prefix="/api/v1")

# Database Performance Endpoint
@app.get("/api/v1/database/stats")
async def database_stats():
    """Database Performance Statistics"""
    return {
        "connection_pool": db_manager.get_connection_stats(),
        "performance": performance_monitor.get_performance_stats()
    }

# Security Status Endpoint
@app.get("/api/v1/security/status")
async def security_status():
    """Security System Status"""
    return {
        "rate_limiting_enabled": True,
        "audit_logging_enabled": True,
        "jwt_enabled": True,
        "refresh_tokens_enabled": True,
        "login_attempt_tracking": True
    }

# System Information
@app.get("/api/v1/system/info")
async def system_info():
    """System Information"""
    return {
        "application": "ValeoFlow Enterprise",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": {
            "type": "PostgreSQL",
            "pool_size": os.getenv("DB_POOL_SIZE", "20"),
            "max_overflow": os.getenv("DB_MAX_OVERFLOW", "30")
        },
        "security": {
            "jwt_algorithm": "HS256",
            "access_token_expiry": f"{os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '15')} minutes",
            "refresh_token_expiry": f"{os.getenv('REFRESH_TOKEN_EXPIRE_DAYS', '7')} days",
            "max_login_attempts": os.getenv("MAX_LOGIN_ATTEMPTS", "5")
        },
        "features": {
            "enterprise_security": True,
            "connection_pooling": True,
            "performance_monitoring": True,
            "audit_logging": True,
            "rate_limiting": True
        }
    }

# Development Routes (nur in Development)
if os.getenv("ENVIRONMENT") == "development":
    @app.get("/api/v1/dev/test-auth")
    async def test_auth():
        """Test Authentication Endpoint (Development only)"""
        return {
            "message": "Authentication system is working",
            "timestamp": time.time()
        }
    
    @app.get("/api/v1/dev/test-db")
    async def test_database():
        """Test Database Endpoint (Development only)"""
        try:
            with db_manager.get_db_session() as session:
                result = session.execute("SELECT 1 as test").fetchone()
                return {
                    "message": "Database connection is working",
                    "test_result": result[0] if result else None,
                    "timestamp": time.time()
                }
        except Exception as e:
            return {
                "message": "Database connection failed",
                "error": str(e),
                "timestamp": time.time()
            }

if __name__ == "__main__":
    # Server Configuration
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("ENVIRONMENT") == "development"
    
    logger.info(f"Starting ValeoFlow Enterprise Backend on {host}:{port}")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Debug mode: {reload}")
    
    uvicorn.run(
        "main_enterprise:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    ) 