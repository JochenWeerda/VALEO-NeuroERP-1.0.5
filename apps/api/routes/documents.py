from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from core.models.document import Document, DocumentCreate, DocumentUpdate
from core.models.user import User
from core.services.document_service import DocumentService
from apps.api.middleware.auth import get_current_user

router = APIRouter()

@router.post("/documents/", response_model=Document)
async def create_document(
    document: DocumentCreate,
    current_user: User = Depends(get_current_user)
):
    """Neues Dokument erstellen"""
    return await DocumentService.create_document(document, current_user.id)

@router.get("/documents/", response_model=List[Document])
async def get_documents(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Liste aller Dokumente abrufen"""
    return await DocumentService.get_documents(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

@router.get("/documents/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Einzelnes Dokument abrufen"""
    document = await DocumentService.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if document.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung für dieses Dokument"
        )
        
    return document

@router.put("/documents/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Dokument aktualisieren"""
    # Prüfen ob Dokument existiert
    document = await DocumentService.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if document.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Ändern dieses Dokuments"
        )
        
    return await DocumentService.update_document(document_id, document_update)

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Dokument löschen"""
    # Prüfen ob Dokument existiert
    document = await DocumentService.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
        
    # Prüfen ob Benutzer Zugriff hat
    if document.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Löschen dieses Dokuments"
        )
        
    await DocumentService.delete_document(document_id)
    return {"message": "Dokument erfolgreich gelöscht"}

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(None),
    current_user: User = Depends(get_current_user)
):
    """Dokument hochladen"""
    try:
        document = await DocumentService.upload_document(file, current_user.id, session_id)
        return document
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Fehler beim Hochladen: {str(e)}"
        )

@router.get("/documents/{document_id}/ocr")
async def get_document_ocr(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """OCR-Status und -Ergebnis für ein Dokument abrufen"""
    document = await DocumentService.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    if document.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Keine Berechtigung für dieses Dokument")
    return {
        "ocr_status": document.ocr_status,
        "ocr_task_id": document.ocr_task_id,
        "ocr_text": document.ocr_text,
        "ocr_data": document.ocr_data
    }

@router.get("/documents/by-session/{session_id}", response_model=Document)
async def get_document_by_session_id(session_id: str):
    """Dokument anhand Session-ID abrufen (z.B. für mobilen Upload)"""
    document = await DocumentService.get_document_by_session_id(session_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Kein Dokument mit dieser Session-ID gefunden")
    return document 