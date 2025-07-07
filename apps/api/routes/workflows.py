from typing import List
from fastapi import APIRouter, Depends, HTTPException
from core.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from core.models.user import User
from core.services.workflow_service import WorkflowService
from middleware.auth import get_current_user

router = APIRouter()

@router.post("/workflows/", response_model=Workflow)
async def create_workflow(
    workflow: WorkflowCreate,
    current_user: User = Depends(get_current_user)
):
    """Neuen Workflow erstellen"""
    return await WorkflowService.create_workflow(workflow, current_user.id)

@router.get("/workflows/", response_model=List[Workflow])
async def get_workflows(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Liste aller Workflows abrufen"""
    return await WorkflowService.get_workflows(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

@router.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Einzelnen Workflow abrufen"""
    workflow = await WorkflowService.get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if workflow.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung für diesen Workflow"
        )
        
    return workflow

@router.put("/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_update: WorkflowUpdate,
    current_user: User = Depends(get_current_user)
):
    """Workflow aktualisieren"""
    # Prüfen ob Workflow existiert
    workflow = await WorkflowService.get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if workflow.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Ändern dieses Workflows"
        )
        
    return await WorkflowService.update_workflow(workflow_id, workflow_update)

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Workflow löschen"""
    # Prüfen ob Workflow existiert
    workflow = await WorkflowService.get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if workflow.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Löschen dieses Workflows"
        )
        
    await WorkflowService.delete_workflow(workflow_id)
    return {"message": "Workflow erfolgreich gelöscht"}

@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Workflow ausführen"""
    # Prüfen ob Workflow existiert
    workflow = await WorkflowService.get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if workflow.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Ausführen dieses Workflows"
        )
        
    try:
        result = await WorkflowService.execute_workflow(workflow_id)
        return {
            "message": "Workflow erfolgreich ausgeführt",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Workflow-Ausführung: {str(e)}"
        ) 