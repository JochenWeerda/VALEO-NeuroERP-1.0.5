"""
Optimierte API-Endpoints mit Caching und Query-Optimierung
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.query_optimizer import QueryOptimizer
from backend.cache_manager import cache_manager
from backend.db.session import get_session
from backend.core.config import settings
from backend.models import *  # Modelle importieren
from backend.services.faiss_metadata_manager import FaissWithMetadataManager
from pydantic import BaseModel

router = APIRouter()

# Initialisiere den Manager (z. B. global, in echt ggf. als Dependency)
faiss_manager = FaissWithMetadataManager(dim=1536)

class SemanticSearchRequest(BaseModel):
    embedding: list
    k: int = 5

class OptimizedEndpoints:
    """
    Optimierte API-Endpoints mit Caching und Query-Optimierung
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.optimizer = QueryOptimizer(session)
        self.cache = cache_manager
        
    @router.get("/artikel", response_model=List[Dict[str, Any]])
    @cache_manager.cached("artikel_list", ttl=300)
    async def get_artikel_list(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = Query(None, regex="^(asc|desc)$")
    ) -> List[Dict[str, Any]]:
        """
        Optimierte Artikel-Liste mit Caching und Query-Optimierung
        """
        try:
            # Query erstellen
            query = select(Artikel)
            
            # Suche
            if search:
                query = query.filter(
                    Artikel.bezeichnung.ilike(f"%{search}%")
                )
                
            # Sortierung
            if sort_by:
                sort_col = getattr(Artikel, sort_by, None)
                if sort_col:
                    query = query.order_by(
                        sort_col.desc() if sort_order == "desc" else sort_col
                    )
                    
            # Pagination
            query = query.offset(skip).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            artikel = result.scalars().all()
            
            return [item.to_dict() for item in artikel]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Datenbankfehler: {str(e)}"
            )
            
    @router.get("/kunden", response_model=List[Dict[str, Any]])
    @cache_manager.cached("kunden_list", ttl=300)
    async def get_kunden_list(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = Query(None, regex="^(asc|desc)$")
    ) -> List[Dict[str, Any]]:
        """
        Optimierte Kunden-Liste mit Caching und Query-Optimierung
        """
        try:
            # Query erstellen
            query = select(Kunde)
            
            # Suche
            if search:
                query = query.filter(
                    Kunde.name.ilike(f"%{search}%")
                )
                
            # Sortierung
            if sort_by:
                sort_col = getattr(Kunde, sort_by, None)
                if sort_col:
                    query = query.order_by(
                        sort_col.desc() if sort_order == "desc" else sort_col
                    )
                    
            # Pagination
            query = query.offset(skip).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            kunden = result.scalars().all()
            
            return [item.to_dict() for item in kunden]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Datenbankfehler: {str(e)}"
            )
            
    @router.get("/belege", response_model=List[Dict[str, Any]])
    @cache_manager.cached("belege_list", ttl=300)
    async def get_belege_list(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = Query(None, regex="^(asc|desc)$"),
        belegtyp: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Optimierte Belege-Liste mit Caching und Query-Optimierung
        """
        try:
            # Query erstellen
            query = select(Beleg)
            
            # Suche
            if search:
                query = query.filter(
                    Beleg.nummer.ilike(f"%{search}%")
                )
                
            # Belegtyp Filter
            if belegtyp:
                query = query.filter(Beleg.typ == belegtyp)
                
            # Sortierung
            if sort_by:
                sort_col = getattr(Beleg, sort_by, None)
                if sort_col:
                    query = query.order_by(
                        sort_col.desc() if sort_order == "desc" else sort_col
                    )
                    
            # Pagination
            query = query.offset(skip).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            belege = result.scalars().all()
            
            return [item.to_dict() for item in belege]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Datenbankfehler: {str(e)}"
            )
            
    @router.get("/buchungen", response_model=List[Dict[str, Any]])
    @cache_manager.cached("buchungen_list", ttl=300)
    async def get_buchungen_list(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = Query(None, regex="^(asc|desc)$"),
        konto: Optional[str] = None,
        datum_von: Optional[str] = None,
        datum_bis: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Optimierte Buchungen-Liste mit Caching und Query-Optimierung
        """
        try:
            # Query erstellen
            query = select(Buchung)
            
            # Suche
            if search:
                query = query.filter(
                    Buchung.buchungstext.ilike(f"%{search}%")
                )
                
            # Konto Filter
            if konto:
                query = query.filter(
                    (Buchung.soll_konto == konto) |
                    (Buchung.haben_konto == konto)
                )
                
            # Datum Filter
            if datum_von:
                query = query.filter(Buchung.datum >= datum_von)
            if datum_bis:
                query = query.filter(Buchung.datum <= datum_bis)
                
            # Sortierung
            if sort_by:
                sort_col = getattr(Buchung, sort_by, None)
                if sort_col:
                    query = query.order_by(
                        sort_col.desc() if sort_order == "desc" else sort_col
                    )
                    
            # Pagination
            query = query.offset(skip).limit(limit)
            
            # Query optimieren
            optimized = await self.optimizer.optimize_query(query)
            
            # Ausführen
            result = await self.session.execute(optimized)
            buchungen = result.scalars().all()
            
            return [item.to_dict() for item in buchungen]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Datenbankfehler: {str(e)}"
            )
            
    @router.post("/api/v1/search/semantic")
    async def semantic_search(self, request: SemanticSearchRequest):
        results = faiss_manager.search(request.embedding, request.k)
        return [
            {
                "_id": str(doc.get("_id")),
                "titel": doc.get("titel"),
                "kunde": doc.get("kunde"),
                "typ": doc.get("typ"),
                "datum": doc.get("datum"),
                "score": None  # Optional: Score aus FAISS ergänzen
            }
            for doc in results
        ]

# Dependency
async def get_optimized_endpoints(
    session: AsyncSession = Depends(get_session)
) -> OptimizedEndpoints:
    return OptimizedEndpoints(session)
    
# Router mit Endpoints registrieren
api_router = APIRouter()
api_router.include_router(
    router,
    prefix="/api/v1",
    tags=["optimized"]
) 