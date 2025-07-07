from typing import List
from fastapi import APIRouter, Depends, HTTPException
from core.models.user import User, UserUpdate
from core.services.user_service import UserService
from middleware.auth import get_current_user

router = APIRouter()

@router.get("/users/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Liste aller Benutzer abrufen"""
    return await UserService.get_users(skip=skip, limit=limit)

@router.get("/users/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Einzelnen Benutzer abrufen"""
    user = await UserService.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return user

@router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Benutzer aktualisieren"""
    # Prüfen ob Benutzer existiert
    user = await UserService.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        
    # Prüfen ob aktueller Benutzer berechtigt ist
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Keine Berechtigung zum Ändern dieses Benutzers"
        )
        
    return await UserService.update_user(user_id, user_update)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Benutzer löschen"""
    # Nur Admins dürfen Benutzer löschen
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Nur Administratoren dürfen Benutzer löschen"
        )
        
    # Prüfen ob Benutzer existiert
    user = await UserService.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        
    await UserService.delete_user(user_id)
    return {"message": "Benutzer erfolgreich gelöscht"} 