"""
API für Partner-Stammdatenverwaltung im AI-gestützten ERP-System.

Diese API bietet CRUD-Operationen für Partner (Kunden, Lieferanten, etc.).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

# Schemas
from backend.schemas.partner import (
    Partner, PartnerCreate, PartnerUpdate, Tag, TagCreate,
    Adresse, AdresseCreate, Kontakt, KontaktCreate, Bankverbindung, BankverbindungCreate
)

# Datenbankzugriff
from backend.db.base import get_db
from backend.models.partner import Partner as PartnerModel
from backend.models.partner import Tag as TagModel
from backend.models.partner import Adresse as AdresseModel
from backend.models.partner import Kontakt as KontaktModel
from backend.models.partner import Bankverbindung as BankverbindungModel
from backend.models.partner import PartnerTyp

# Logger einrichten
logger = logging.getLogger(__name__)

# Router erstellen
router = APIRouter(
    prefix="/api/v1/partner",
    tags=["partner"],
    responses={404: {"description": "Nicht gefunden"}},
)


# Partner-Endpoints
@router.post("/", response_model=Partner)
def create_partner(partner: PartnerCreate, db: Session = Depends(get_db)):
    """
    Erstellt einen neuen Partner im System.
    """
    try:
        # Partner-Hauptdaten
        db_partner = PartnerModel(
            typ=partner.typ,
            name=partner.name,
            firmenname=partner.firmenname,
            rechtsform=partner.rechtsform,
            steuernummer=partner.steuernummer,
            ust_id=partner.ust_id,
            sprache=partner.sprache,
            waehrung=partner.waehrung,
            zahlungsbedingungen=partner.zahlungsbedingungen,
            kreditlimit=partner.kreditlimit,
            website=partner.website,
            notizen=partner.notizen
        )
        
        # In Datenbank speichern (um ID zu generieren)
        db.add(db_partner)
        db.flush()
        
        # Adressen verarbeiten
        if partner.adressen:
            for adresse_data in partner.adressen:
                db_adresse = AdresseModel(**adresse_data.dict(), partner_id=db_partner.id)
                db.add(db_adresse)
        
        # Kontakte verarbeiten
        if partner.kontakte:
            for kontakt_data in partner.kontakte:
                db_kontakt = KontaktModel(**kontakt_data.dict(), partner_id=db_partner.id)
                db.add(db_kontakt)
        
        # Bankverbindungen verarbeiten
        if partner.bankverbindungen:
            for bank_data in partner.bankverbindungen:
                db_bank = BankverbindungModel(**bank_data.dict(), partner_id=db_partner.id)
                db.add(db_bank)
        
        # Tags verarbeiten
        if partner.tags:
            for tag_id in partner.tags:
                tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
                if tag:
                    db_partner.tags.append(tag)
        
        # Änderungen in der Datenbank speichern
        db.commit()
        db.refresh(db_partner)
        
        return db_partner
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen des Partners: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/", response_model=List[Partner])
def read_partners(
    skip: int = 0, 
    limit: int = 100,
    typ: Optional[PartnerTyp] = None,
    suche: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Partnern zurück, optional gefiltert nach Typ und/oder Suchbegriff.
    """
    try:
        # Basisquery erstellen
        query = db.query(PartnerModel)
        
        # Nach Typ filtern, wenn angegeben
        if typ:
            query = query.filter(PartnerModel.typ == typ)
        
        # Nach Suchbegriff filtern, wenn angegeben
        if suche:
            search_term = f"%{suche}%"
            query = query.filter(
                (PartnerModel.name.ilike(search_term)) |
                (PartnerModel.firmenname.ilike(search_term))
            )
        
        # Pagination anwenden und Ergebnisse zurückgeben
        partners = query.offset(skip).limit(limit).all()
        return partners
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Partner: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/{partner_id}", response_model=Partner)
def read_partner(partner_id: int, db: Session = Depends(get_db)):
    """
    Gibt einen einzelnen Partner anhand seiner ID zurück.
    """
    try:
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        return partner
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Partners mit ID {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.put("/{partner_id}", response_model=Partner)
def update_partner(partner_id: int, partner_update: PartnerUpdate, db: Session = Depends(get_db)):
    """
    Aktualisiert einen bestehenden Partner.
    """
    try:
        # Partner abrufen
        db_partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if db_partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Nur die angegebenen Felder aktualisieren
        partner_data = partner_update.dict(exclude_unset=True)
        
        # Tags separat behandeln, falls vorhanden
        tags = None
        if "tags" in partner_data:
            tags = partner_data.pop("tags")
        
        # Alle anderen Felder aktualisieren
        for key, value in partner_data.items():
            setattr(db_partner, key, value)
        
        # Tags aktualisieren, falls angegeben
        if tags is not None:
            # Aktuelle Tags entfernen
            db_partner.tags = []
            
            # Neue Tags hinzufügen
            for tag_id in tags:
                tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
                if tag:
                    db_partner.tags.append(tag)
        
        # Änderungen speichern
        db.commit()
        db.refresh(db_partner)
        
        return db_partner
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Aktualisieren des Partners mit ID {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.delete("/{partner_id}")
def delete_partner(partner_id: int, db: Session = Depends(get_db)):
    """
    Löscht einen Partner aus dem System.
    """
    try:
        # Partner abrufen
        db_partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if db_partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Partner löschen
        db.delete(db_partner)
        db.commit()
        
        return {"message": f"Partner mit ID {partner_id} erfolgreich gelöscht"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Löschen des Partners mit ID {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


# Tag-Endpoints
@router.post("/tags/", response_model=Tag)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """
    Erstellt ein neues Tag für Partner.
    """
    try:
        db_tag = TagModel(**tag.dict())
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        return db_tag
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen des Tags: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/tags/", response_model=List[Tag])
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Gibt eine Liste aller Tags zurück.
    """
    try:
        tags = db.query(TagModel).offset(skip).limit(limit).all()
        return tags
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Tags: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


# Adresse-Endpoints
@router.post("/{partner_id}/adressen/", response_model=Adresse)
def create_adresse(partner_id: int, adresse: AdresseCreate, db: Session = Depends(get_db)):
    """
    Fügt einem Partner eine neue Adresse hinzu.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Adresse erstellen
        db_adresse = AdresseModel(**adresse.dict(), partner_id=partner_id)
        db.add(db_adresse)
        db.commit()
        db.refresh(db_adresse)
        
        return db_adresse
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen der Adresse für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/{partner_id}/adressen/", response_model=List[Adresse])
def read_adressen(partner_id: int, db: Session = Depends(get_db)):
    """
    Gibt alle Adressen eines Partners zurück.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Adressen abrufen
        adressen = db.query(AdresseModel).filter(AdresseModel.partner_id == partner_id).all()
        return adressen
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Adressen für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


# Kontakt-Endpoints
@router.post("/{partner_id}/kontakte/", response_model=Kontakt)
def create_kontakt(partner_id: int, kontakt: KontaktCreate, db: Session = Depends(get_db)):
    """
    Fügt einem Partner einen neuen Kontakt hinzu.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Kontakt erstellen
        db_kontakt = KontaktModel(**kontakt.dict(), partner_id=partner_id)
        db.add(db_kontakt)
        db.commit()
        db.refresh(db_kontakt)
        
        return db_kontakt
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen des Kontakts für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/{partner_id}/kontakte/", response_model=List[Kontakt])
def read_kontakte(partner_id: int, db: Session = Depends(get_db)):
    """
    Gibt alle Kontakte eines Partners zurück.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Kontakte abrufen
        kontakte = db.query(KontaktModel).filter(KontaktModel.partner_id == partner_id).all()
        return kontakte
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Kontakte für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


# Bankverbindung-Endpoints
@router.post("/{partner_id}/bankverbindungen/", response_model=Bankverbindung)
def create_bankverbindung(partner_id: int, bankverbindung: BankverbindungCreate, db: Session = Depends(get_db)):
    """
    Fügt einem Partner eine neue Bankverbindung hinzu.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Bankverbindung erstellen
        db_bankverbindung = BankverbindungModel(**bankverbindung.dict(), partner_id=partner_id)
        db.add(db_bankverbindung)
        db.commit()
        db.refresh(db_bankverbindung)
        
        return db_bankverbindung
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Fehler beim Erstellen der Bankverbindung für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@router.get("/{partner_id}/bankverbindungen/", response_model=List[Bankverbindung])
def read_bankverbindungen(partner_id: int, db: Session = Depends(get_db)):
    """
    Gibt alle Bankverbindungen eines Partners zurück.
    """
    try:
        # Partner überprüfen
        partner = db.query(PartnerModel).filter(PartnerModel.id == partner_id).first()
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner nicht gefunden")
        
        # Bankverbindungen abrufen
        bankverbindungen = db.query(BankverbindungModel).filter(BankverbindungModel.partner_id == partner_id).all()
        return bankverbindungen
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Bankverbindungen für Partner {partner_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}") 