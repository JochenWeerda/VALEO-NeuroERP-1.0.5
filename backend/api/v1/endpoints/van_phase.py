"""
VALEO-NeuroERP VAN Phase API
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import structlog
from ....core.van_phase_manager import van_phase_manager, VANState

router = APIRouter(prefix="/api/v1/van")
logger = structlog.get_logger(__name__)

class StartVANCycleRequest(BaseModel):
    """Request zum Starten eines VAN Zyklus"""
    cycle_id: str

class StartVANCycleResponse(BaseModel):
    """Response zum Starten eines VAN Zyklus"""
    cycle_id: str
    state: VANState

@router.post("/cycles", response_model=StartVANCycleResponse)
async def start_cycle(request: StartVANCycleRequest):
    """Startet einen neuen VAN Zyklus"""
    try:
        cycle_id = await van_phase_manager.start_cycle(request.cycle_id)
        state = await van_phase_manager.get_cycle_status(cycle_id)
        
        return StartVANCycleResponse(
            cycle_id=cycle_id,
            state=state
        )
        
    except Exception as e:
        logger.error("Failed to start VAN cycle", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/cycles/{cycle_id}", response_model=VANState)
async def get_cycle_status(cycle_id: str):
    """Gibt den Status eines VAN Zyklus zurück"""
    try:
        return await van_phase_manager.get_cycle_status(cycle_id)
        
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
        
    except Exception as e:
        logger.error("Failed to get VAN cycle status", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/cycles", response_model=List[VANState])
async def list_cycles():
    """Listet alle aktiven VAN Zyklen auf"""
    try:
        return await van_phase_manager.list_active_cycles()
        
    except Exception as e:
        logger.error("Failed to list VAN cycles", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 