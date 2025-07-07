"""
Inventory Microservice für VALERO-NeuroERP
"""
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from backend.db.session import get_session
from backend.models.inventory import Artikel, Lager, Bewegung
from backend.cache_manager import cache_manager
from backend.db.query_optimizer import QueryOptimizer

# Logger
logger = logging.getLogger("inventory-service")

# FastAPI App
app = FastAPI(
    title="Inventory Service",
    description="Inventory Microservice für VALERO-NeuroERP",
    version="1.0.0"
)

class InventoryService:
    """Inventory Service Implementation"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.optimizer = QueryOptimizer(session)
        self.cache = cache_manager
        
    async def create_artikel(self, artikel_data: Dict[str, Any]) -> Artikel:
        """Neuen Artikel erstellen"""
        try:
            # Artikel erstellen
            artikel = Artikel(**artikel_data)
            self.session.add(artikel)
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete("artikel_list")
            
            return artikel
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Artikels: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_artikel(
        self,
        kategorie: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Artikel]:
        """Artikel abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"artikel:{kategorie}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Artikel)
            
            # Filter
            if kategorie:
                query = query.filter(Artikel.kategorie == kategorie)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            artikel = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, artikel, ttl=300)
            
            return artikel
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Artikel: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def create_lager(self, lager_data: Dict[str, Any]) -> Lager:
        """Neues Lager erstellen"""
        try:
            # Lager erstellen
            lager = Lager(**lager_data)
            self.session.add(lager)
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete("lager_list")
            
            return lager
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Lagers: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_lager(
        self,
        typ: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Lager]:
        """Lager abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"lager:{typ}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Lager)
            
            # Filter
            if typ:
                query = query.filter(Lager.typ == typ)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            lager = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, lager, ttl=300)
            
            return lager
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Lager: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def create_bewegung(self, bewegung_data: Dict[str, Any]) -> Bewegung:
        """Neue Lagerbewegung erstellen"""
        try:
            # Bewegung erstellen
            bewegung = Bewegung(**bewegung_data)
            self.session.add(bewegung)
            
            # Bestand aktualisieren
            artikel = await self.session.get(Artikel, bewegung.artikel_id)
            if bewegung.typ == "EINGANG":
                artikel.bestand += bewegung.menge
            else:
                artikel.bestand -= bewegung.menge
                
            await self.session.commit()
            
            # Cache invalidieren
            await self.cache.delete(f"bewegungen:{bewegung.artikel_id}")
            await self.cache.delete(f"artikel:{artikel.id}")
            
            return bewegung
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Bewegung: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def get_bewegungen(
        self,
        artikel_id: Optional[int] = None,
        lager_id: Optional[int] = None,
        von: Optional[datetime] = None,
        bis: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Bewegung]:
        """Lagerbewegungen abfragen"""
        try:
            # Cache-Key erstellen
            cache_key = f"bewegungen:{artikel_id}:{lager_id}:{von}:{bis}:{limit}:{offset}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Query erstellen
            query = select(Bewegung)
            
            # Filter
            if artikel_id:
                query = query.filter(Bewegung.artikel_id == artikel_id)
            if lager_id:
                query = query.filter(Bewegung.lager_id == lager_id)
            if von:
                query = query.filter(Bewegung.datum >= von)
            if bis:
                query = query.filter(Bewegung.datum <= bis)
                
            # Pagination
            query = query.offset(offset).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            bewegungen = result.scalars().all()
            
            # In Cache schreiben
            await self.cache.set(cache_key, bewegungen, ttl=300)
            
            return bewegungen
            
        except Exception as e:
            logger.error(f"Fehler beim Abfragen der Bewegungen: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
# Service Instance
async def get_inventory_service(
    session: AsyncSession = Depends(get_session)
) -> InventoryService:
    return InventoryService(session)
    
# Routes
@app.post("/artikel", response_model=Dict[str, Any])
async def create_artikel(
    artikel_data: Dict[str, Any],
    service: InventoryService = Depends(get_inventory_service)
):
    """Neuen Artikel erstellen"""
    return await service.create_artikel(artikel_data)
    
@app.get("/artikel", response_model=List[Dict[str, Any]])
async def get_artikel(
    kategorie: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    service: InventoryService = Depends(get_inventory_service)
):
    """Artikel abfragen"""
    return await service.get_artikel(
        kategorie=kategorie,
        limit=limit,
        offset=offset
    )
    
@app.post("/lager", response_model=Dict[str, Any])
async def create_lager(
    lager_data: Dict[str, Any],
    service: InventoryService = Depends(get_inventory_service)
):
    """Neues Lager erstellen"""
    return await service.create_lager(lager_data)
    
@app.get("/lager", response_model=List[Dict[str, Any]])
async def get_lager(
    typ: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    service: InventoryService = Depends(get_inventory_service)
):
    """Lager abfragen"""
    return await service.get_lager(
        typ=typ,
        limit=limit,
        offset=offset
    )
    
@app.post("/bewegungen", response_model=Dict[str, Any])
async def create_bewegung(
    bewegung_data: Dict[str, Any],
    service: InventoryService = Depends(get_inventory_service)
):
    """Neue Lagerbewegung erstellen"""
    return await service.create_bewegung(bewegung_data)
    
@app.get("/bewegungen", response_model=List[Dict[str, Any]])
async def get_bewegungen(
    artikel_id: Optional[int] = None,
    lager_id: Optional[int] = None,
    von: Optional[datetime] = None,
    bis: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    service: InventoryService = Depends(get_inventory_service)
):
    """Lagerbewegungen abfragen"""
    return await service.get_bewegungen(
        artikel_id=artikel_id,
        lager_id=lager_id,
        von=von,
        bis=bis,
        limit=limit,
        offset=offset
    ) 