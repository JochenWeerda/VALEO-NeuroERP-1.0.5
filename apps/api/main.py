from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import make_asgi_app

# Import routes
from routes import auth, users, documents, workflows, transactions

# Import middleware
from middleware.logging import LoggingMiddleware
from middleware.auth import AuthMiddleware
from middleware.metrics import MetricsMiddleware

# Create FastAPI app
app = FastAPI(
    title="VALEO-NeuroERP API",
    description="REST API für das VALEO-NeuroERP System",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(MetricsMiddleware)

# Add Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(workflows.router, prefix="/api/v1", tags=["workflows"])
app.include_router(transactions.router, prefix="/api/v1", tags=["transactions"])

@app.get("/")
async def root():
    return {
        "message": "Willkommen bei der VALEO-NeuroERP API",
        "version": "2.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.datetime.now().isoformat()
    } 