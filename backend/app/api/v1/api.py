from fastapi import APIRouter
from app.api.v1.endpoints import auth
from app.api.odata_router import router as odata_router
from app.api.v1.endpoints.wws import router as wws_router
from app.api.v1.endpoints.tse import router as tse_router
from app.api.v1.endpoints.waage import router as waage_router
from app.api.v1.endpoints.status import router as status_router
from app.api.v1.endpoints.inventory import router as inventory_router
from app.api.v1.endpoints.finanzen import router as finanzen_router
from app.api.v1.endpoints.artikel_stammdaten import router as artikel_stammdaten_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(odata_router, prefix="/odata", tags=["odata"])
api_router.include_router(wws_router, prefix="/wws", tags=["wws"])
api_router.include_router(tse_router, prefix="/tse", tags=["tse"])
api_router.include_router(waage_router, prefix="/waage", tags=["waage"])
api_router.include_router(status_router, prefix="/system", tags=["system"])
api_router.include_router(inventory_router, prefix="/inventur", tags=["inventur"])
api_router.include_router(finanzen_router, prefix="/finanzen", tags=["finanzen"])
api_router.include_router(artikel_stammdaten_router, prefix="/artikel-stammdaten", tags=["artikel-stammdaten"]) 