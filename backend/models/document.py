"""
Dokumentenmanagement-Modul für das AI-Driven ERP-System
Integriert Odoo-Dokument-Funktionalitäten in unser System
"""

from datetime import datetime
from enum import Enum
import os
from typing import List, Optional
import uuid

class DocumentType(str, Enum):
    PDF = "pdf"
    WORD = "word"
    EXCEL = "excel"
    IMAGE = "image"
    TEXT = "text"
    OTHER = "other"

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"

class Document:
    """
    Hauptklasse für das Dokumentenmanagement
    """
    def __init__(
        self,
        name: str,
        file_path: str,
        document_type: DocumentType,
        owner_id: int,
        description: str = "",
        tags: List[str] = None,
        folder_id: Optional[int] = None,
        parent_id: Optional[int] = None,
    ):
        self.id = str(uuid.uuid4())
        self.name = name
        self.file_path = file_path
        self.document_type = document_type
        self.owner_id = owner_id
        self.description = description
        self.tags = tags or []
        self.folder_id = folder_id
        self.parent_id = parent_id
        self.status = DocumentStatus.DRAFT
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.version = 1
        self.size = self._get_file_size()
        self.versions = []  # Speichert Versionshistorie
        self.shared_with = []  # Liste von Benutzer-IDs, mit denen geteilt

    def _get_file_size(self) -> int:
        """Ermittelt die Dateigröße in Bytes"""
        try:
            return os.path.getsize(self.file_path)
        except (FileNotFoundError, OSError):
            return 0

    def update(
        self,
        name: Optional[str] = None,
        file_path: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        folder_id: Optional[int] = None,
    ) -> None:
        """Aktualisiert Dokumenteninformationen und erstellt eine neue Version"""
        # Speichere aktuelle Version in der Historie
        self.versions.append({
            "version": self.version,
            "file_path": self.file_path,
            "updated_at": self.updated_at,
            "updated_by": self.owner_id  # Hier sollte der aktuelle Benutzer verwendet werden
        })
        
        # Aktualisiere die Attribute
        if name:
            self.name = name
        if file_path:
            self.file_path = file_path
            self.size = self._get_file_size()
        if description:
            self.description = description
        if tags:
            self.tags = tags
        if folder_id:
            self.folder_id = folder_id
            
        # Erhöhe Versionsnummer und aktualisiere Zeitstempel
        self.version += 1
        self.updated_at = datetime.now()

    def change_status(self, new_status: DocumentStatus) -> None:
        """Ändert den Status des Dokuments"""
        self.status = new_status
        self.updated_at = datetime.now()

    def share_with_user(self, user_id: int) -> None:
        """Teilt das Dokument mit einem Benutzer"""
        if user_id not in self.shared_with:
            self.shared_with.append(user_id)
            self.updated_at = datetime.now()

    def unshare_with_user(self, user_id: int) -> None:
        """Entfernt die Freigabe für einen Benutzer"""
        if user_id in self.shared_with:
            self.shared_with.remove(user_id)
            self.updated_at = datetime.now()

    def get_version_history(self) -> List[dict]:
        """Gibt die Versionshistorie des Dokuments zurück"""
        # Aktuelle Version hinzufügen
        current = {
            "version": self.version,
            "file_path": self.file_path,
            "updated_at": self.updated_at,
            "updated_by": self.owner_id
        }
        return self.versions + [current]

    def revert_to_version(self, version: int) -> bool:
        """Setzt das Dokument auf eine frühere Version zurück"""
        if version < 1 or version > self.version:
            return False
            
        # Aktuelle Version zur Historie hinzufügen
        self.versions.append({
            "version": self.version,
            "file_path": self.file_path,
            "updated_at": self.updated_at,
            "updated_by": self.owner_id
        })
        
        # Wenn es Version 1 ist (keine Historie vorhanden)
        if version == 1 and len(self.versions) > 0:
            oldest = self.versions[0]
            self.file_path = oldest["file_path"]
        else:
            # Finde die angeforderte Version
            for v in self.versions:
                if v["version"] == version:
                    self.file_path = v["file_path"]
                    break
        
        # Aktualisiere Metadaten
        self.version += 1
        self.updated_at = datetime.now()
        self.size = self._get_file_size()
        return True

class Folder:
    """
    Ordner-Klasse für die Organisation von Dokumenten
    """
    def __init__(
        self,
        name: str,
        owner_id: int,
        parent_id: Optional[int] = None,
        description: str = ""
    ):
        self.id = str(uuid.uuid4())
        self.name = name
        self.owner_id = owner_id
        self.parent_id = parent_id
        self.description = description
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.documents = []  # Liste von Dokument-IDs in diesem Ordner
        self.subfolders = []  # Liste von Unterordner-IDs
        self.shared_with = []  # Liste von Benutzer-IDs, mit denen geteilt

    def add_document(self, document_id: str) -> None:
        """Fügt ein Dokument zum Ordner hinzu"""
        if document_id not in self.documents:
            self.documents.append(document_id)
            self.updated_at = datetime.now()

    def remove_document(self, document_id: str) -> None:
        """Entfernt ein Dokument aus dem Ordner"""
        if document_id in self.documents:
            self.documents.remove(document_id)
            self.updated_at = datetime.now()

    def add_subfolder(self, folder_id: str) -> None:
        """Fügt einen Unterordner hinzu"""
        if folder_id not in self.subfolders:
            self.subfolders.append(folder_id)
            self.updated_at = datetime.now()

    def remove_subfolder(self, folder_id: str) -> None:
        """Entfernt einen Unterordner"""
        if folder_id in self.subfolders:
            self.subfolders.remove(folder_id)
            self.updated_at = datetime.now()

    def share_with_user(self, user_id: int) -> None:
        """Teilt den Ordner mit einem Benutzer"""
        if user_id not in self.shared_with:
            self.shared_with.append(user_id)
            self.updated_at = datetime.now()

    def unshare_with_user(self, user_id: int) -> None:
        """Entfernt die Freigabe für einen Benutzer"""
        if user_id in self.shared_with:
            self.shared_with.remove(user_id)
            self.updated_at = datetime.now()

class Tag:
    """
    Tag-Klasse für die Kategorisierung von Dokumenten
    """
    def __init__(self, name: str, color: str = "#FFFFFF"):
        self.id = str(uuid.uuid4())
        self.name = name
        self.color = color
        self.created_at = datetime.now()
        self.documents = []  # Liste von Dokumenten mit diesem Tag

    def add_document(self, document_id: str) -> None:
        """Fügt ein Dokument zum Tag hinzu"""
        if document_id not in self.documents:
            self.documents.append(document_id)

    def remove_document(self, document_id: str) -> None:
        """Entfernt ein Dokument vom Tag"""
        if document_id in self.documents:
            self.documents.remove(document_id) 