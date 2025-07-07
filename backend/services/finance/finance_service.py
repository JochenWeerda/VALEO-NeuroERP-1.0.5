"""
Finance Microservice für VALERO-NeuroERP
"""
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from backend.db.session import get_session
from backend.models.finance import Buchung, Konto, Periode
from backend.cache_manager import cache_manager
from backend.db.query_optimizer import QueryOptimizer

# Logger
logger = logging.getLogger("finance-service")

# FastAPI App
app = FastAPI(
    title="Finance Service",
    description="Finance Microservice für VALERO-NeuroERP",
    version="1.0.0"
)

class FinanceService:
    """Finance Service Implementation"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.optimizer = QueryOptimizer(session)
        self.cache = cache_manager
        
    async def create_buchung(self, buchung_data: Dict[str, Any]) -> Buchung:
        """Neue Buchung erstellen"""
        try:
            # Buchung erstellen
            buchung = Buchung(**buchung_data)
            self.session.add(buchung)
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete(f"buchungen_list:{buchung.periode_id}")
            
            return buchung
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Buchung: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_buchungen(
        self,
        periode_id: Optional[int] = None,
        konto_id: Optional[int] = None,
        von: Optional[datetime] = None,
        bis: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Buchung]:
        """Buchungen abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"buchungen:{periode_id}:{konto_id}:{von}:{bis}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Buchung)
            
            # Filter
            if periode_id:
                query = query.filter(Buchung.periode_id == periode_id)
            if konto_id:
                query = query.filter(
                    (Buchung.soll_konto_id == konto_id) |
                    (Buchung.haben_konto_id == konto_id)
                )
            if von:
                query = query.filter(Buchung.datum >= von)
            if bis:
                query = query.filter(Buchung.datum <= bis)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            buchungen = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, buchungen, ttl=300)
            
            return buchungen
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Buchungen: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def create_konto(self, konto_data: Dict[str, Any]) -> Konto:
        """Neues Konto erstellen"""
        try:
            # Konto erstellen
            konto = Konto(**konto_data)
            self.session.add(konto)
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete("konten_list")
            
            return konto
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Kontos: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_konten(
        self,
        kontenart: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Konto]:
        """Konten abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"konten:{kontenart}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Konto)
            
            # Filter
            if kontenart:
                query = query.filter(Konto.art == kontenart)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            konten = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, konten, ttl=300)
            
            return konten
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Konten: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def create_periode(self, periode_data: Dict[str, Any]) -> Periode:
        """Neue Periode erstellen"""
        try:
            # Periode erstellen
            periode = Periode(**periode_data)
            self.session.add(periode)
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete("perioden_list")
            
            return periode
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Periode: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_perioden(
        self,
        jahr: Optional[int] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Periode]:
        """Perioden abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"perioden:{jahr}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Periode)
            
            # Filter
            if jahr:
                query = query.filter(Periode.jahr == jahr)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            perioden = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, perioden, ttl=300)
            
            return perioden
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Perioden: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
# Service Instance
async def get_finance_service(
    session: AsyncSession = Depends(get_session)
) -> FinanceService:
    return FinanceService(session)
    
# Routes
@app.post("/buchungen", response_model=Dict[str, Any])
async def create_buchung(
    buchung_data: Dict[str, Any],
    service: FinanceService = Depends(get_finance_service)
):
    """Neue Buchung erstellen"""
    return await service.create_buchung(buchung_data)
    
@app.get("/buchungen", response_model=List[Dict[str, Any]])
async def get_buchungen(
    periode_id: Optional[int] = None,
    konto_id: Optional[int] = None,
    von: Optional[datetime] = None,
    bis: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    service: FinanceService = Depends(get_finance_service)
):
    """Buchungen abfragen"""
    return await service.get_buchungen(
        periode_id=periode_id,
        konto_id=konto_id,
        von=von,
        bis=bis,
        limit=limit,
        offset=offset
    )
    
@app.post("/konten", response_model=Dict[str, Any])
async def create_konto(
    konto_data: Dict[str, Any],
    service: FinanceService = Depends(get_finance_service)
):
    """Neues Konto erstellen"""
    return await service.create_konto(konto_data)
    
@app.get("/konten", response_model=List[Dict[str, Any]])
async def get_konten(
    kontenart: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    service: FinanceService = Depends(get_finance_service)
):
    """Konten abfragen"""
    return await service.get_konten(
        kontenart=kontenart,
        limit=limit,
        offset=offset
    )
    
@app.post("/perioden", response_model=Dict[str, Any])
async def create_periode(
    periode_data: Dict[str, Any],
    service: FinanceService = Depends(get_finance_service)
):
    """Neue Periode erstellen"""
    return await service.create_periode(periode_data)
    
@app.get("/perioden", response_model=List[Dict[str, Any]])
async def get_perioden(
    jahr: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    service: FinanceService = Depends(get_finance_service)
):
    """Perioden abfragen"""
    return await service.get_perioden(
        jahr=jahr,
        limit=limit,
        offset=offset
    ) 