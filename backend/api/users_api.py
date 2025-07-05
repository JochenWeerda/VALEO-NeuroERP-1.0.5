"""
API für Benutzerverwaltung im AI-gestützten ERP-System.

Diese API bietet CRUD-Operationen für Benutzer und spezielle Funktionen für Vertriebsberater.
"""

from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

# Schemas
from backend.schemas.user import (
    User, UserCreate, UserUpdate, Role, RoleCreate, SalesRepCodeGeneration
)

# Datenbankzugriff
from backend.db.database import get_db
from backend.models.user import User as UserModel
from backend.models.user import Role as RoleModel

# Logger einrichten
logger = logging.getLogger(__name__)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Router erstellen
router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"],
    responses={404: {"description": "Nicht gefunden"}},
)


# Hilfsfunktionen
def hash_password(password: str) -> str:
    """Hasht ein Passwort mit bcrypt."""
    return pwd_context.hash(password)


def generate_sales_rep_code(first_name: str, last_name: str, db: Session) -> str:
    """
    Generiert ein Kürzel für Vertriebsberater aus den Initialen.
    Wenn das Kürzel bereits existiert, wird eine Nummer angehängt.
    """
    # Initialen nehmen (erster Buchstabe des Vornamens + erster Buchstabe des Nachnamens)
    code = (first_name[0] + last_name[0]).upper()
    
    # Prüfen, ob das Kürzel bereits existiert
    existing_code = db.query(UserModel).filter(UserModel.sales_rep_code == code).first()
    
    if not existing_code:
        return code
    
    # Wenn Kürzel existiert, dritten Buchstaben aus Nachnamen hinzufügen
    if len(last_name) > 1:
        code = (first_name[0] + last_name[0] + last_name[1]).upper()
        existing_code = db.query(UserModel).filter(UserModel.sales_rep_code == code).first()
        
        if not existing_code:
            return code
    
    # Wenn immer noch existiert, Zähler hinzufügen
    counter = 1
    while True:
        new_code = code + str(counter)
        existing_code = db.query(UserModel).filter(UserModel.sales_rep_code == new_code).first()
        
        if not existing_code:
            return new_code
        
        counter += 1


# Benutzer-Endpoints
@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Erstellt einen neuen Benutzer im System.
    """
    try:
        # Prüfen, ob Benutzername oder E-Mail bereits existiert
        existing_user = db.query(UserModel).filter(
            (UserModel.username == user_data.username) | 
            (UserModel.email == user_data.email)
        ).first()
        
        if existing_user:
            if existing_user.username == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Benutzername existiert bereits"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="E-Mail existiert bereits"
                )
        
        # Generiere sales_rep_code für Vertriebsberater
        sales_rep_code = None
        if user_data.is_sales_rep:
            # Splitte full_name in Vor- und Nachname
            name_parts = user_data.full_name.split()
            if len(name_parts) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Für Vertriebsberater wird ein vollständiger Name (Vor- und Nachname) benötigt"
                )
            
            first_name = name_parts[0]
            last_name = name_parts[-1]
            
            sales_rep_code = generate_sales_rep_code(first_name, last_name, db)
        
        # Passwort hashen
        hashed_password = hash_password(user_data.password)
        
        # Benutzer erstellen
        db_user = UserModel(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            department=user_data.department,
            position=user_data.position,
            hashed_password=hashed_password,
            is_active=user_data.is_active,
            is_superuser=user_data.is_superuser,
            is_sales_rep=user_data.is_sales_rep,
            sales_rep_code=sales_rep_code
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity Error beim Erstellen des Benutzers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Datenbankfehler: Möglicherweise existiert der Benutzer bereits"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen des Benutzers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


@router.get("/", response_model=List[User])
def get_users(
    skip: int = 0, 
    limit: int = 100, 
    is_active: Optional[bool] = None,
    is_sales_rep: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Benutzern zurück, optional gefiltert.
    """
    try:
        query = db.query(UserModel)
        
        if is_active is not None:
            query = query.filter(UserModel.is_active == is_active)
            
        if is_sales_rep is not None:
            query = query.filter(UserModel.is_sales_rep == is_sales_rep)
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (UserModel.username.ilike(search_term)) |
                (UserModel.email.ilike(search_term)) |
                (UserModel.full_name.ilike(search_term))
            )
            
        users = query.offset(skip).limit(limit).all()
        return users
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benutzer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Benutzer: {str(e)}"
        )


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Gibt einen einzelnen Benutzer anhand seiner ID zurück.
    """
    try:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden"
            )
            
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Benutzers mit ID {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen des Benutzers: {str(e)}"
        )


@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """
    Aktualisiert einen bestehenden Benutzer.
    """
    try:
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden"
            )
        
        # Daten für Update vorbereiten
        update_data = user_update.dict(exclude_unset=True)
        
        # Wenn Passwort aktualisiert wird, hashen
        if "password" in update_data:
            update_data["hashed_password"] = hash_password(update_data.pop("password"))
        
        # Wenn is_sales_rep auf False gesetzt wird, sales_rep_code zurücksetzen
        if "is_sales_rep" in update_data and update_data["is_sales_rep"] is False:
            update_data["sales_rep_code"] = None
        
        # Wenn sales_rep_code manuell gesetzt wird, prüfen ob unique
        if "sales_rep_code" in update_data and update_data["sales_rep_code"]:
            existing_code = db.query(UserModel).filter(
                (UserModel.sales_rep_code == update_data["sales_rep_code"]) &
                (UserModel.id != user_id)
            ).first()
            
            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Vertriebsberater-Kürzel '{update_data['sales_rep_code']}' wird bereits verwendet"
                )
        
        # Felder aktualisieren
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity Error beim Aktualisieren des Benutzers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Datenbankfehler: Möglicherweise existiert ein Benutzer mit den gleichen Daten"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Aktualisieren des Benutzers mit ID {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Löscht einen Benutzer.
    """
    try:
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden"
            )
        
        db.delete(db_user)
        db.commit()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Löschen des Benutzers mit ID {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


@router.post("/generate-sales-rep-code", response_model=dict)
def create_sales_rep_code(data: SalesRepCodeGeneration, db: Session = Depends(get_db)):
    """
    Generiert ein Vertriebsberater-Kürzel aus Vor- und Nachname.
    """
    try:
        code = generate_sales_rep_code(data.first_name, data.last_name, db)
        return {"sales_rep_code": code}
        
    except Exception as e:
        logger.error(f"Fehler bei der Generierung des Vertriebsberater-Kürzels: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler bei der Generierung des Kürzels: {str(e)}"
        )


# Rollen-Endpoints
@router.post("/roles/", response_model=Role, status_code=status.HTTP_201_CREATED)
def create_role(role_data: RoleCreate, db: Session = Depends(get_db)):
    """
    Erstellt eine neue Rolle im System.
    """
    try:
        # Prüfen, ob Rolle bereits existiert
        existing_role = db.query(RoleModel).filter(RoleModel.name == role_data.name).first()
        
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rollenname existiert bereits"
            )
        
        # Rolle erstellen
        db_role = RoleModel(**role_data.dict())
        
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        
        return db_role
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity Error beim Erstellen der Rolle: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Datenbankfehler: Möglicherweise existiert die Rolle bereits"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen der Rolle: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


@router.get("/roles/", response_model=List[Role])
def get_roles(db: Session = Depends(get_db)):
    """
    Gibt eine Liste aller Rollen zurück.
    """
    try:
        roles = db.query(RoleModel).all()
        return roles
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Rollen: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Rollen: {str(e)}"
        )


@router.post("/{user_id}/roles/{role_id}", response_model=User)
def assign_role_to_user(user_id: int, role_id: int, db: Session = Depends(get_db)):
    """
    Weist einem Benutzer eine Rolle zu.
    """
    try:
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden"
            )
            
        db_role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
        
        if db_role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rolle nicht gefunden"
            )
            
        # Prüfen, ob Benutzer die Rolle bereits hat
        if db_role in db_user.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Benutzer hat diese Rolle bereits"
            )
            
        db_user.roles.append(db_role)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Zuweisen der Rolle {role_id} zum Benutzer {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


@router.delete("/{user_id}/roles/{role_id}", response_model=User)
def remove_role_from_user(user_id: int, role_id: int, db: Session = Depends(get_db)):
    """
    Entfernt eine Rolle von einem Benutzer.
    """
    try:
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Benutzer nicht gefunden"
            )
            
        db_role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
        
        if db_role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rolle nicht gefunden"
            )
            
        # Prüfen, ob Benutzer die Rolle hat
        if db_role not in db_user.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Benutzer hat diese Rolle nicht"
            )
            
        db_user.roles.remove(db_role)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Entfernen der Rolle {role_id} vom Benutzer {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interner Serverfehler: {str(e)}"
        )


def register_user_routes(app):
    """
    Registriert die Benutzer-Routen in der Starlette-App.
    """
    from starlette.routing import Mount
    app.routes.append(Mount("/api/v1/users", router))
    return app 