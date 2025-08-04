"""
Zentraler Datenbank-Service für VALEO NeuroERP
Verwaltet alle Datenbankoperationen mit Fehlerbehandlung und Validierung
"""

import logging
from typing import List, Optional, Dict, Any, TypeVar, Generic
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import and_, or_, func
from contextlib import contextmanager

# Type Variable für generische Operationen
T = TypeVar('T')

logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    """Basis-Exception für Datenbank-Fehler"""
    pass

class NotFoundError(DatabaseError):
    """Resource nicht gefunden"""
    pass

class ValidationError(DatabaseError):
    """Validierungsfehler"""
    pass

class DatabaseService(Generic[T]):
    """
    Generischer Datenbank-Service mit CRUD-Operationen
    """
    
    def __init__(self, model: T):
        self.model = model
        self.logger = logging.getLogger(f"{__name__}.{model.__name__}")
    
    def create(self, db: Session, **kwargs) -> T:
        """
        Erstellt einen neuen Datensatz
        
        Args:
            db: Datenbank-Session
            **kwargs: Feldwerte für den neuen Datensatz
            
        Returns:
            Erstellter Datensatz
            
        Raises:
            ValidationError: Bei Validierungsfehlern
            DatabaseError: Bei Datenbankfehlern
        """
        try:
            # Validierung
            self._validate_create(db, **kwargs)
            
            # Datensatz erstellen
            db_obj = self.model(**kwargs)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
            self.logger.info(f"Created {self.model.__name__} with ID: {db_obj.id}")
            return db_obj
            
        except IntegrityError as e:
            db.rollback()
            self.logger.error(f"Integrity error creating {self.model.__name__}: {str(e)}")
            raise ValidationError(f"Daten-Integrität verletzt: {str(e)}")
        except SQLAlchemyError as e:
            db.rollback()
            self.logger.error(f"Database error creating {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Datenbankfehler: {str(e)}")
    
    def get(self, db: Session, id: int) -> Optional[T]:
        """
        Holt einen Datensatz anhand der ID
        
        Args:
            db: Datenbank-Session
            id: Datensatz-ID
            
        Returns:
            Datensatz oder None
        """
        try:
            return db.query(self.model).filter(self.model.id == id).first()
        except SQLAlchemyError as e:
            self.logger.error(f"Error getting {self.model.__name__} with ID {id}: {str(e)}")
            raise DatabaseError(f"Fehler beim Abrufen: {str(e)}")
    
    def get_or_404(self, db: Session, id: int) -> T:
        """
        Holt einen Datensatz oder wirft NotFoundError
        
        Args:
            db: Datenbank-Session
            id: Datensatz-ID
            
        Returns:
            Datensatz
            
        Raises:
            NotFoundError: Wenn Datensatz nicht gefunden
        """
        obj = self.get(db, id)
        if not obj:
            raise NotFoundError(f"{self.model.__name__} mit ID {id} nicht gefunden")
        return obj
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None
    ) -> List[T]:
        """
        Holt mehrere Datensätze mit Pagination und Filterung
        
        Args:
            db: Datenbank-Session
            skip: Anzahl zu überspringender Datensätze
            limit: Maximale Anzahl zurückzugebender Datensätze
            filters: Filter-Dictionary
            order_by: Sortierfeld
            
        Returns:
            Liste von Datensätzen
        """
        try:
            query = db.query(self.model)
            
            # Filter anwenden
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        if isinstance(value, list):
                            query = query.filter(getattr(self.model, field).in_(value))
                        else:
                            query = query.filter(getattr(self.model, field) == value)
            
            # Sortierung
            if order_by:
                if order_by.startswith('-'):
                    query = query.order_by(getattr(self.model, order_by[1:]).desc())
                else:
                    query = query.order_by(getattr(self.model, order_by))
            
            return query.offset(skip).limit(limit).all()
            
        except SQLAlchemyError as e:
            self.logger.error(f"Error getting multiple {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Fehler beim Abrufen: {str(e)}")
    
    def update(self, db: Session, id: int, **kwargs) -> T:
        """
        Aktualisiert einen Datensatz
        
        Args:
            db: Datenbank-Session
            id: Datensatz-ID
            **kwargs: Zu aktualisierende Felder
            
        Returns:
            Aktualisierter Datensatz
            
        Raises:
            NotFoundError: Wenn Datensatz nicht gefunden
            ValidationError: Bei Validierungsfehlern
        """
        try:
            # Datensatz holen
            db_obj = self.get_or_404(db, id)
            
            # Validierung
            self._validate_update(db, db_obj, **kwargs)
            
            # Felder aktualisieren
            for field, value in kwargs.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            # Timestamp aktualisieren
            if hasattr(db_obj, 'updated_at'):
                db_obj.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(db_obj)
            
            self.logger.info(f"Updated {self.model.__name__} with ID: {id}")
            return db_obj
            
        except IntegrityError as e:
            db.rollback()
            self.logger.error(f"Integrity error updating {self.model.__name__}: {str(e)}")
            raise ValidationError(f"Daten-Integrität verletzt: {str(e)}")
        except SQLAlchemyError as e:
            db.rollback()
            self.logger.error(f"Database error updating {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Datenbankfehler: {str(e)}")
    
    def delete(self, db: Session, id: int) -> bool:
        """
        Löscht einen Datensatz
        
        Args:
            db: Datenbank-Session
            id: Datensatz-ID
            
        Returns:
            True wenn erfolgreich
            
        Raises:
            NotFoundError: Wenn Datensatz nicht gefunden
        """
        try:
            db_obj = self.get_or_404(db, id)
            
            # Soft Delete wenn möglich
            if hasattr(db_obj, 'deleted_at'):
                db_obj.deleted_at = datetime.utcnow()
                db.commit()
            else:
                # Hard Delete
                db.delete(db_obj)
                db.commit()
            
            self.logger.info(f"Deleted {self.model.__name__} with ID: {id}")
            return True
            
        except SQLAlchemyError as e:
            db.rollback()
            self.logger.error(f"Error deleting {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Fehler beim Löschen: {str(e)}")
    
    def count(self, db: Session, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Zählt Datensätze
        
        Args:
            db: Datenbank-Session
            filters: Filter-Dictionary
            
        Returns:
            Anzahl der Datensätze
        """
        try:
            query = db.query(func.count(self.model.id))
            
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        query = query.filter(getattr(self.model, field) == value)
            
            return query.scalar()
            
        except SQLAlchemyError as e:
            self.logger.error(f"Error counting {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Fehler beim Zählen: {str(e)}")
    
    def search(
        self, 
        db: Session, 
        search_term: str, 
        search_fields: List[str],
        skip: int = 0,
        limit: int = 100
    ) -> List[T]:
        """
        Sucht in bestimmten Feldern
        
        Args:
            db: Datenbank-Session
            search_term: Suchbegriff
            search_fields: Liste der zu durchsuchenden Felder
            skip: Anzahl zu überspringender Datensätze
            limit: Maximale Anzahl zurückzugebender Datensätze
            
        Returns:
            Liste von Datensätzen
        """
        try:
            query = db.query(self.model)
            
            # OR-Suche über alle Suchfelder
            conditions = []
            for field in search_fields:
                if hasattr(self.model, field):
                    conditions.append(
                        getattr(self.model, field).ilike(f"%{search_term}%")
                    )
            
            if conditions:
                query = query.filter(or_(*conditions))
            
            return query.offset(skip).limit(limit).all()
            
        except SQLAlchemyError as e:
            self.logger.error(f"Error searching {self.model.__name__}: {str(e)}")
            raise DatabaseError(f"Fehler bei der Suche: {str(e)}")
    
    def _validate_create(self, db: Session, **kwargs):
        """
        Validiert Daten vor dem Erstellen
        Kann in Subklassen überschrieben werden
        """
        pass
    
    def _validate_update(self, db: Session, db_obj: T, **kwargs):
        """
        Validiert Daten vor dem Update
        Kann in Subklassen überschrieben werden
        """
        pass


class TransactionService:
    """
    Service für Datenbank-Transaktionen
    """
    
    @staticmethod
    @contextmanager
    def transaction(db: Session):
        """
        Context Manager für Transaktionen
        
        Usage:
            with TransactionService.transaction(db) as trans:
                # Operationen
                trans.commit()
        """
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
    
    @staticmethod
    def bulk_create(db: Session, model: T, items: List[Dict[str, Any]]) -> List[T]:
        """
        Erstellt mehrere Datensätze in einer Transaktion
        
        Args:
            db: Datenbank-Session
            model: Model-Klasse
            items: Liste von Dictionaries mit Feldwerten
            
        Returns:
            Liste der erstellten Datensätze
        """
        try:
            db_objects = []
            for item in items:
                db_obj = model(**item)
                db.add(db_obj)
                db_objects.append(db_obj)
            
            db.commit()
            
            # Refresh all objects
            for obj in db_objects:
                db.refresh(obj)
            
            logger.info(f"Bulk created {len(db_objects)} {model.__name__} records")
            return db_objects
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error in bulk create: {str(e)}")
            raise DatabaseError(f"Fehler beim Bulk-Create: {str(e)}")


# Utility Functions
def paginate(query, page: int = 1, per_page: int = 20):
    """
    Paginiert eine SQLAlchemy Query
    
    Args:
        query: SQLAlchemy Query
        page: Seitennummer (1-basiert)
        per_page: Elemente pro Seite
        
    Returns:
        Paginiertes Query-Ergebnis
    """
    return query.limit(per_page).offset((page - 1) * per_page)