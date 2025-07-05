from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import logging

from ..database import get_db
from ..models.safety import SafetyTraining, SafetyDocument, TrainingSchedule, SafetyNotification, TrainingType, DocumentType
from ..models.user import User
from ..schemas.safety import (
    SafetyTrainingCreate, SafetyTraining as SafetyTrainingSchema,
    SafetyDocumentCreate, SafetyDocument as SafetyDocumentSchema,
    TrainingScheduleCreate, TrainingSchedule as TrainingScheduleSchema,
    SafetyNotificationCreate, SafetyNotification as SafetyNotificationSchema,
    UserSafetyTrainingCreate
)
from ..dependencies import get_current_active_user, get_current_superuser

router = APIRouter()
logger = logging.getLogger(__name__)

# SafetyTraining Endpunkte
@router.post("/trainings/", response_model=SafetyTrainingSchema, status_code=status.HTTP_201_CREATED, tags=["safety"])
def create_safety_training(
    training: SafetyTrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Erstellt eine neue Arbeitsschutz-Unterweisung (nur Admin)"""
    db_training = SafetyTraining(**training.dict())
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@router.get("/trainings/", response_model=List[SafetyTrainingSchema], tags=["safety"])
def read_safety_trainings(
    skip: int = 0,
    limit: int = 100,
    training_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste aller Arbeitsschutz-Unterweisungen"""
    query = db.query(SafetyTraining)
    if training_type:
        try:
            training_type_enum = TrainingType(training_type)
            query = query.filter(SafetyTraining.training_type == training_type_enum)
        except ValueError:
            pass  # Ignorieren, wenn training_type kein gültiger Enum-Wert ist
    return query.offset(skip).limit(limit).all()

@router.get("/trainings/{training_id}", response_model=SafetyTrainingSchema, tags=["safety"])
def read_safety_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Details einer bestimmten Arbeitsschutz-Unterweisung"""
    db_training = db.query(SafetyTraining).filter(SafetyTraining.id == training_id).first()
    if db_training is None:
        raise HTTPException(status_code=404, detail="Training nicht gefunden")
    return db_training

@router.put("/trainings/{training_id}", response_model=SafetyTrainingSchema, tags=["safety"])
def update_safety_training(
    training_id: int,
    training: SafetyTrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Aktualisiert eine Arbeitsschutz-Unterweisung (nur Admin)"""
    db_training = db.query(SafetyTraining).filter(SafetyTraining.id == training_id).first()
    if db_training is None:
        raise HTTPException(status_code=404, detail="Training nicht gefunden")
    
    for key, value in training.dict().items():
        setattr(db_training, key, value)
    
    db_training.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_training)
    return db_training

@router.delete("/trainings/{training_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["safety"])
def delete_safety_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Löscht eine Arbeitsschutz-Unterweisung (nur Admin)"""
    db_training = db.query(SafetyTraining).filter(SafetyTraining.id == training_id).first()
    if db_training is None:
        raise HTTPException(status_code=404, detail="Training nicht gefunden")
    
    db.delete(db_training)
    db.commit()
    return {"detail": "Training erfolgreich gelöscht"}

# SafetyDocument Endpunkte
@router.post("/documents/", response_model=SafetyDocumentSchema, status_code=status.HTTP_201_CREATED, tags=["safety"])
def create_safety_document(
    document: SafetyDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Erstellt ein neues Arbeitsschutz-Dokument"""
    # Prüfen, ob der Benutzer das Dokument für sich selbst oder für einen anderen Benutzer erstellt
    if document.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Berechtigung, Dokumente für andere Benutzer zu erstellen"
        )
    
    db_document = SafetyDocument(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.post("/documents/upload", response_model=SafetyDocumentSchema, tags=["safety"])
async def upload_safety_document(
    user_id: int,
    document_type: str,
    title: str,
    training_id: Optional[int] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lädt ein Dokument hoch und erstellt einen Eintrag in der Datenbank"""
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Berechtigung, Dokumente für andere Benutzer hochzuladen"
        )
    
    try:
        doc_type = DocumentType(document_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Ungültiger Dokumenttyp: {document_type}")
    
    # Datei speichern
    UPLOAD_DIR = "uploads/safety_documents"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Dokument in der Datenbank speichern
    db_document = SafetyDocument(
        title=title,
        document_type=doc_type,
        file_path=file_path,
        user_id=user_id,
        training_id=training_id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("/documents/", response_model=List[SafetyDocumentSchema], tags=["safety"])
def read_safety_documents(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    document_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste aller Arbeitsschutz-Dokumente"""
    query = db.query(SafetyDocument)
    
    # Wenn nicht Admin, dann nur eigene Dokumente anzeigen
    if not current_user.is_superuser:
        query = query.filter(SafetyDocument.user_id == current_user.id)
    # Wenn Admin und user_id angegeben, dann nur Dokumente dieses Benutzers anzeigen
    elif user_id:
        query = query.filter(SafetyDocument.user_id == user_id)
    
    if document_type:
        try:
            doc_type = DocumentType(document_type)
            query = query.filter(SafetyDocument.document_type == doc_type)
        except ValueError:
            pass  # Ignorieren, wenn document_type kein gültiger Enum-Wert ist
    
    return query.offset(skip).limit(limit).all()

@router.get("/documents/{document_id}", response_model=SafetyDocumentSchema, tags=["safety"])
def read_safety_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Details eines bestimmten Arbeitsschutz-Dokuments"""
    db_document = db.query(SafetyDocument).filter(SafetyDocument.id == document_id).first()
    if db_document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    # Berechtigungsprüfung: Nur Admin oder der Eigentümer darf das Dokument sehen
    if not current_user.is_superuser and db_document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Berechtigung, dieses Dokument anzusehen"
        )
    
    return db_document

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["safety"])
def delete_safety_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Löscht ein Arbeitsschutz-Dokument"""
    db_document = db.query(SafetyDocument).filter(SafetyDocument.id == document_id).first()
    if db_document is None:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    # Berechtigungsprüfung: Nur Admin oder der Eigentümer darf das Dokument löschen
    if not current_user.is_superuser and db_document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Berechtigung, dieses Dokument zu löschen"
        )
    
    # Datei löschen, wenn vorhanden
    if db_document.file_path and os.path.exists(db_document.file_path):
        try:
            os.remove(db_document.file_path)
        except OSError:
            # Fehler beim Löschen der Datei ignorieren, aber in einem echten System loggen
            pass
    
    db.delete(db_document)
    db.commit()
    return {"detail": "Dokument erfolgreich gelöscht"}

# UserSafetyTraining Endpunkte
@router.post("/user-trainings/", status_code=status.HTTP_201_CREATED, tags=["safety"])
def assign_training_to_user(
    user_training: UserSafetyTrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Weist einem Benutzer eine Arbeitsschutz-Unterweisung zu (nur Admin)"""
    # Prüfen, ob Benutzer und Training existieren
    user = db.query(User).filter(User.id == user_training.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    training = db.query(SafetyTraining).filter(SafetyTraining.id == user_training.safety_training_id).first()
    if not training:
        raise HTTPException(status_code=404, detail="Training nicht gefunden")
    
    # Benutzer dem Training zuweisen
    # Da wir eine Many-to-Many-Beziehung haben, fügen wir das Training zur Liste der Trainings des Benutzers hinzu
    if training not in user.safety_trainings:
        user.safety_trainings.append(training)
        db.commit()
        return {"detail": "Training erfolgreich zugewiesen"}
    else:
        return {"detail": "Benutzer hat dieses Training bereits absolviert"}

@router.get("/expiring-certificates/", tags=["safety"])
def get_expiring_certificates(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Gibt eine Liste von Benutzern mit bald ablaufenden Zertifikaten zurück (nur Admin)"""
    expiry_date = datetime.utcnow() + timedelta(days=days)
    
    # Liste der Benutzer mit bald ablaufenden Zertifikaten
    users_with_expiring_certs = []
    
    # Benutzer mit bald ablaufenden Pflanzenschutz-Sachkundenachweis
    pflanzenschutz_query = db.query(User).filter(
        User.sachkundenachweis_pflanzenschutz == True,
        User.sachkundenachweis_pflanzenschutz_gueltig_bis <= expiry_date
    ).all()
    
    for user in pflanzenschutz_query:
        users_with_expiring_certs.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "certificate_type": "Sachkundenachweis Pflanzenschutz",
            "expiry_date": user.sachkundenachweis_pflanzenschutz_gueltig_bis
        })
    
    # Benutzer mit bald ablaufenden Gabelstapler-Schein
    gabelstapler_query = db.query(User).filter(
        User.gabelstapler_schein == True,
        User.gabelstapler_schein_gueltig_bis <= expiry_date
    ).all()
    
    for user in gabelstapler_query:
        users_with_expiring_certs.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "certificate_type": "Flurförderfahrzeug-Schein",
            "expiry_date": user.gabelstapler_schein_gueltig_bis
        })
    
    # Benutzer mit bald ablaufenden ADR-Schein
    adr_query = db.query(User).filter(
        User.adr_schein == True,
        User.adr_schein_gueltig_bis <= expiry_date
    ).all()
    
    for user in adr_query:
        users_with_expiring_certs.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "certificate_type": "ADR-Schein",
            "expiry_date": user.adr_schein_gueltig_bis
        })
    
    # Benutzer mit bald ablaufenden Berufskraftfahrer-Weiterbildung
    berufskraftfahrer_query = db.query(User).filter(
        User.berufskraftfahrer_weiterbildung == True,
        User.berufskraftfahrer_weiterbildung_gueltig_bis <= expiry_date
    ).all()
    
    for user in berufskraftfahrer_query:
        users_with_expiring_certs.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "certificate_type": "Berufskraftfahrer-Weiterbildung",
            "expiry_date": user.berufskraftfahrer_weiterbildung_gueltig_bis
        })
    
    return users_with_expiring_certs 