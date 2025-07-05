"""
API-Modul-Initialisierung für das modulare ERP-System.
Dieses Modul definiert Router und API-Endpunkte für verschiedene Funktionsbereiche.
"""

from fastapi import APIRouter

from backend.api.partner import router as partner_router
from backend.api.artikel import router as artikel_router
from backend.api.auth import router as auth_router
from backend.api.emergency import router as emergency_router
from backend.api.notification import router as notification_router
from backend.api.transaction import router as transaction_router
from backend.api.async_transaction import router as async_transaction_router
from backend.api.monitoring import router as monitoring_router
from backend.api.health import router as health_router
from backend.api.metrics import router as metrics_router
from backend.api.admin import router as admin_router
from backend.api.users import router as users_router
from backend.api.search import router as search_router
from backend.api.finance import router as finance_router
from backend.api.articles import router as articles_router
from backend.api.documents import router as documents_router
from backend.api.notifications import router as notifications_router
from backend.api.v1.reports import router as reports_router
from backend.api.v1.rag_endpoints import router as rag_router

# Haupt-Router für alle API-Endpunkte
api_router = APIRouter()

# Router für Batch-Operationen und Performance-Monitoring
try:
    from .batch_api import router as batch_router
    api_router.include_router(batch_router, prefix="/batch", tags=["Batch"])
    print("Batch-API erfolgreich registriert")
except ImportError as e:
    print(f"Batch-API konnte nicht importiert werden: {e}")

try:
    from .performance_api import router as performance_router
    api_router.include_router(performance_router, prefix="/performance", tags=["Performance"])
    print("Performance-API erfolgreich registriert")
except ImportError as e:
    print(f"Performance-API konnte nicht importiert werden: {e}")

api_router.include_router(auth_router)
api_router.include_router(partner_router)
api_router.include_router(artikel_router)
api_router.include_router(emergency_router)
api_router.include_router(notification_router)
api_router.include_router(transaction_router)
api_router.include_router(async_transaction_router)
api_router.include_router(monitoring_router)
api_router.include_router(health_router)
api_router.include_router(metrics_router)
api_router.include_router(admin_router)
api_router.include_router(users_router)
api_router.include_router(search_router)
api_router.include_router(finance_router)
api_router.include_router(articles_router)
api_router.include_router(documents_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_router)
api_router.include_router(rag_router)

# Status-API für Health-Checks und Monitoring
@api_router.get("/status", tags=["System"])
async def status():
    """Grundlegender Statusendpunkt für Health-Checks"""
    return {"status": "online"}

__all__ = ["api_router"]
