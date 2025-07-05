from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn
import logging
from backend.services.service_layer import ServiceLayer
from backend.services.service_config import get_endpoint_config

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App erstellen
app = FastAPI(
    title="VALEO-NeuroERP API",
    description="REST API für das VALEO-NeuroERP System mit GENXAIS-Framework Integration",
    version="1.0.1"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Service Layer Instanz
service = ServiceLayer()

# Dependency für Endpoint-Konfiguration
def get_config(endpoint: str):
    config = get_endpoint_config(endpoint)
    if not config:
        raise HTTPException(status_code=404, detail="Endpoint nicht konfiguriert")
    return config

@app.get("/api/v1/users")
async def get_users(config: Dict[str, Any] = Depends(get_config)):
    """
    Benutzer abrufen
    """
    try:
        result = service.handle_request("/api/v1/users", "GET", {})
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benutzer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/users")
async def create_user(user: Dict[str, Any], config: Dict[str, Any] = Depends(get_config)):
    """
    Neuen Benutzer erstellen
    """
    try:
        result = service.handle_request("/api/v1/users", "POST", user)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Benutzers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/products")
async def get_products(config: Dict[str, Any] = Depends(get_config)):
    """
    Produkte abrufen
    """
    try:
        result = service.handle_request("/api/v1/products", "GET", {})
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Produkte: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/products")
async def create_product(product: Dict[str, Any], config: Dict[str, Any] = Depends(get_config)):
    """
    Neues Produkt erstellen
    """
    try:
        result = service.handle_request("/api/v1/products", "POST", product)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Produkts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/orders")
async def get_orders(config: Dict[str, Any] = Depends(get_config)):
    """
    Bestellungen abrufen
    """
    try:
        result = service.handle_request("/api/v1/orders", "GET", {})
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Bestellungen: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/orders")
async def create_order(order: Dict[str, Any], config: Dict[str, Any] = Depends(get_config)):
    """
    Neue Bestellung erstellen
    """
    try:
        result = service.handle_request("/api/v1/orders", "POST", order)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["error"])
        return result["data"]
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Bestellung: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    """
    Gesundheitscheck für die API
    """
    return {
        "status": "healthy",
        "service_layer": "active",
        "genxais": {
            "core": "active",
            "rag": "active",
            "apm": "active",
            "agents": "active"
        }
    }

@app.get("/api/v1/metrics")
async def get_metrics():
    """
    Performance-Metriken abrufen
    """
    try:
        result = service.optimize_performance()
        return result
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Metriken: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Server starten
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4
    ) 