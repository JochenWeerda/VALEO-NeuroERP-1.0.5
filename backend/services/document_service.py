"""
Dokumentenverwaltungs-Service für das AI-Driven ERP-System
Bietet Schnittstellen für die Arbeit mit Dokumenten
"""

import os
import shutil
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple

from backend.models.document import Document, Folder, Tag, DocumentType, DocumentStatus
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
import prometheus_client

router = APIRouter()

@router.get("/health", summary="Health-Check", tags=["System"])
def health_check():
    return {"status": "ok", "details": {}}

@router.get("/metrics", summary="Prometheus-Metriken", tags=["Monitoring"])
def metrics():
    data = prometheus_client.generate_latest()
    return PlainTextResponse(data, media_type="text/plain")

class DocumentService:
    """
    Service-Klasse für die Verwaltung von Dokumenten
    """
    def __init__(self, storage_path: str):
        """
        Initialisiert den Dokumentenservice mit dem angegebenen Speicherpfad
        
        Args:
            storage_path: Pfad zum Speichern der hochgeladenen Dokumente
        """
        self.storage_path = storage_path
        # Erstelle Speicherverzeichnis, falls es nicht existiert
        os.makedirs(storage_path, exist_ok=True)
        
        # Speichert Dokumente, Ordner und Tags im Speicher (später Datenbank)
        self.documents = {}  # document_id -> Document
        self.folders = {}    # folder_id -> Folder
        self.tags = {}       # tag_id -> Tag

    def create_document(
        self,
        name: str,
        file_path: str,
        document_type: DocumentType,
        owner_id: int,
        description: str = "",
        tags: List[str] = None,
        folder_id: Optional[str] = None,
    ) -> Document:
        """
        Erstellt ein neues Dokument
        
        Args:
            name: Name des Dokuments
            file_path: Temporärer Pfad der hochgeladenen Datei
            document_type: Typ des Dokuments
            owner_id: ID des Besitzers
            description: Beschreibung des Dokuments
            tags: Liste von Tag-IDs
            folder_id: ID des übergeordneten Ordners
            
        Returns:
            Das erstellte Dokument-Objekt
        """
        # Erstelle ein eindeutiges Verzeichnis für das Dokument
        document = Document(
            name=name,
            file_path="",  # Vorübergehend leer, wird später aktualisiert
            document_type=document_type,
            owner_id=owner_id,
            description=description,
            tags=tags or [],
            folder_id=folder_id
        )
        
        # Erstelle Dokumentenverzeichnis
        document_dir = os.path.join(self.storage_path, document.id)
        os.makedirs(document_dir, exist_ok=True)
        
        # Speichere die Datei in das Dokumentenverzeichnis
        file_name = os.path.basename(file_path)
        dest_path = os.path.join(document_dir, f"v1_{file_name}")
        shutil.copy2(file_path, dest_path)
        
        # Aktualisiere den Dateipfad im Dokument
        document.file_path = dest_path
        document.size = document._get_file_size()
        
        # Speichere das Dokument
        self.documents[document.id] = document
        
        # Füge das Dokument zum Ordner hinzu, falls angegeben
        if folder_id and folder_id in self.folders:
            self.folders[folder_id].add_document(document.id)
            
        # Füge das Dokument zu den Tags hinzu, falls angegeben
        if tags:
            for tag_id in tags:
                if tag_id in self.tags:
                    self.tags[tag_id].add_document(document.id)
        
        return document

    def get_document(self, document_id: str) -> Optional[Document]:
        """
        Holt ein Dokument anhand seiner ID
        
        Args:
            document_id: ID des zu holenden Dokuments
            
        Returns:
            Das Dokument-Objekt oder None, falls nicht gefunden
        """
        return self.documents.get(document_id)

    def update_document(
        self,
        document_id: str,
        name: Optional[str] = None,
        file_path: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        folder_id: Optional[str] = None,
    ) -> Optional[Document]:
        """
        Aktualisiert ein bestehendes Dokument
        
        Args:
            document_id: ID des zu aktualisierenden Dokuments
            name: Neuer Name des Dokuments
            file_path: Pfad zur neuen Dateiversion
            description: Neue Beschreibung
            tags: Neue Liste von Tag-IDs
            folder_id: Neue Ordner-ID
            
        Returns:
            Das aktualisierte Dokument oder None, falls nicht gefunden
        """
        document = self.documents.get(document_id)
        if not document:
            return None
            
        # Wenn eine neue Datei hochgeladen wurde
        if file_path:
            # Erstelle Verzeichnis, falls es nicht existiert
            document_dir = os.path.join(self.storage_path, document_id)
            os.makedirs(document_dir, exist_ok=True)
            
            # Speichere die neue Dateiversion
            file_name = os.path.basename(file_path)
            new_version = document.version + 1
            dest_path = os.path.join(document_dir, f"v{new_version}_{file_name}")
            shutil.copy2(file_path, dest_path)
            file_path = dest_path
        
        # Aktualisiere das Dokument
        document.update(
            name=name,
            file_path=file_path,
            description=description,
            tags=tags,
            folder_id=folder_id
        )
        
        # Aktualisiere Ordner-Zuordnung, falls geändert
        if folder_id and folder_id != document.folder_id:
            # Entferne aus altem Ordner
            if document.folder_id and document.folder_id in self.folders:
                self.folders[document.folder_id].remove_document(document_id)
            
            # Füge zu neuem Ordner hinzu
            if folder_id in self.folders:
                self.folders[folder_id].add_document(document_id)
                document.folder_id = folder_id
        
        # Aktualisiere Tag-Zuordnungen, falls geändert
        if tags:
            # Entferne das Dokument aus allen bisherigen Tags
            for tag_id, tag in self.tags.items():
                if document_id in tag.documents:
                    tag.remove_document(document_id)
            
            # Füge das Dokument zu den neuen Tags hinzu
            for tag_id in tags:
                if tag_id in self.tags:
                    self.tags[tag_id].add_document(document_id)
        
        return document

    def delete_document(self, document_id: str) -> bool:
        """
        Löscht ein Dokument
        
        Args:
            document_id: ID des zu löschenden Dokuments
            
        Returns:
            True, wenn das Dokument gelöscht wurde, False sonst
        """
        document = self.documents.get(document_id)
        if not document:
            return False
        
        # Setze Status auf "gelöscht" statt physisches Löschen (Soft Delete)
        document.change_status(DocumentStatus.DELETED)
        
        # Entferne das Dokument aus seinem Ordner
        if document.folder_id and document.folder_id in self.folders:
            self.folders[document.folder_id].remove_document(document_id)
        
        # Entferne das Dokument aus allen Tags
        for tag_id, tag in self.tags.items():
            if document_id in tag.documents:
                tag.remove_document(document_id)
        
        return True

    def create_folder(
        self,
        name: str,
        owner_id: int,
        parent_id: Optional[str] = None,
        description: str = ""
    ) -> Folder:
        """
        Erstellt einen neuen Ordner
        
        Args:
            name: Name des Ordners
            owner_id: ID des Besitzers
            parent_id: ID des übergeordneten Ordners
            description: Beschreibung des Ordners
            
        Returns:
            Das erstellte Ordner-Objekt
        """
        folder = Folder(
            name=name,
            owner_id=owner_id,
            parent_id=parent_id,
            description=description
        )
        
        # Speichere den Ordner
        self.folders[folder.id] = folder
        
        # Füge den Ordner zum übergeordneten Ordner hinzu, falls angegeben
        if parent_id and parent_id in self.folders:
            self.folders[parent_id].add_subfolder(folder.id)
        
        return folder

    def get_folder(self, folder_id: str) -> Optional[Folder]:
        """
        Holt einen Ordner anhand seiner ID
        
        Args:
            folder_id: ID des zu holenden Ordners
            
        Returns:
            Das Ordner-Objekt oder None, falls nicht gefunden
        """
        return self.folders.get(folder_id)

    def update_folder(
        self,
        folder_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        parent_id: Optional[str] = None
    ) -> Optional[Folder]:
        """
        Aktualisiert einen bestehenden Ordner
        
        Args:
            folder_id: ID des zu aktualisierenden Ordners
            name: Neuer Name des Ordners
            description: Neue Beschreibung
            parent_id: Neue übergeordnete Ordner-ID
            
        Returns:
            Der aktualisierte Ordner oder None, falls nicht gefunden
        """
        folder = self.folders.get(folder_id)
        if not folder:
            return None
        
        if name:
            folder.name = name
        if description:
            folder.description = description
        
        # Aktualisiere übergeordneten Ordner, falls geändert
        if parent_id and parent_id != folder.parent_id:
            # Entferne aus altem übergeordneten Ordner
            if folder.parent_id and folder.parent_id in self.folders:
                self.folders[folder.parent_id].remove_subfolder(folder_id)
            
            # Füge zu neuem übergeordneten Ordner hinzu
            if parent_id in self.folders:
                self.folders[parent_id].add_subfolder(folder_id)
                folder.parent_id = parent_id
        
        folder.updated_at = datetime.now()
        return folder

    def delete_folder(self, folder_id: str) -> bool:
        """
        Löscht einen Ordner
        
        Args:
            folder_id: ID des zu löschenden Ordners
            
        Returns:
            True, wenn der Ordner gelöscht wurde, False sonst
        """
        folder = self.folders.get(folder_id)
        if not folder:
            return False
        
        # Entferne den Ordner aus dem übergeordneten Ordner
        if folder.parent_id and folder.parent_id in self.folders:
            self.folders[folder.parent_id].remove_subfolder(folder_id)
        
        # Setze den Status aller Dokumente im Ordner auf "gelöscht"
        for document_id in folder.documents:
            if document_id in self.documents:
                self.documents[document_id].change_status(DocumentStatus.DELETED)
        
        # Lösche alle Unterordner rekursiv
        for subfolder_id in folder.subfolders:
            self.delete_folder(subfolder_id)
        
        # Entferne den Ordner aus der Sammlung
        del self.folders[folder_id]
        
        return True

    def create_tag(self, name: str, color: str = "#FFFFFF") -> Tag:
        """
        Erstellt einen neuen Tag
        
        Args:
            name: Name des Tags
            color: Farbe des Tags im Hex-Format
            
        Returns:
            Das erstellte Tag-Objekt
        """
        tag = Tag(name=name, color=color)
        self.tags[tag.id] = tag
        return tag

    def get_tag(self, tag_id: str) -> Optional[Tag]:
        """
        Holt einen Tag anhand seiner ID
        
        Args:
            tag_id: ID des zu holenden Tags
            
        Returns:
            Das Tag-Objekt oder None, falls nicht gefunden
        """
        return self.tags.get(tag_id)

    def update_tag(
        self,
        tag_id: str,
        name: Optional[str] = None,
        color: Optional[str] = None
    ) -> Optional[Tag]:
        """
        Aktualisiert einen bestehenden Tag
        
        Args:
            tag_id: ID des zu aktualisierenden Tags
            name: Neuer Name des Tags
            color: Neue Farbe des Tags
            
        Returns:
            Der aktualisierte Tag oder None, falls nicht gefunden
        """
        tag = self.tags.get(tag_id)
        if not tag:
            return None
        
        if name:
            tag.name = name
        if color:
            tag.color = color
        
        return tag

    def delete_tag(self, tag_id: str) -> bool:
        """
        Löscht einen Tag
        
        Args:
            tag_id: ID des zu löschenden Tags
            
        Returns:
            True, wenn der Tag gelöscht wurde, False sonst
        """
        if tag_id not in self.tags:
            return False
        
        # Entferne den Tag aus der Sammlung
        del self.tags[tag_id]
        
        # Entferne den Tag aus allen Dokumenten
        for document_id, document in self.documents.items():
            if tag_id in document.tags:
                document.tags.remove(tag_id)
        
        return True

    def search_documents(
        self,
        query: str = "",
        document_type: Optional[DocumentType] = None,
        folder_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
        owner_id: Optional[int] = None,
        status: Optional[DocumentStatus] = None
    ) -> List[Document]:
        """
        Sucht nach Dokumenten basierend auf verschiedenen Kriterien
        
        Args:
            query: Suchbegriff für Namen und Beschreibung
            document_type: Zu filternder Dokumenttyp
            folder_id: Zu filternde Ordner-ID
            tags: Liste von Tag-IDs für die Filterung
            owner_id: Zu filternde Besitzer-ID
            status: Zu filternder Status
            
        Returns:
            Liste der gefundenen Dokumente
        """
        results = []
        
        for document_id, document in self.documents.items():
            # Überspringe gelöschte Dokumente, es sei denn, es wird explizit danach gesucht
            if document.status == DocumentStatus.DELETED and status != DocumentStatus.DELETED:
                continue
                
            # Filtere nach Suchbegriff
            if query and query.lower() not in document.name.lower() and query.lower() not in document.description.lower():
                continue
                
            # Filtere nach Dokumenttyp
            if document_type and document.document_type != document_type:
                continue
                
            # Filtere nach Ordner
            if folder_id and document.folder_id != folder_id:
                continue
                
            # Filtere nach Tags
            if tags and not all(tag_id in document.tags for tag_id in tags):
                continue
                
            # Filtere nach Besitzer
            if owner_id and document.owner_id != owner_id:
                continue
                
            # Filtere nach Status
            if status and document.status != status:
                continue
                
            results.append(document)
        
        return results

    def get_folder_contents(self, folder_id: Optional[str] = None) -> Tuple[List[Folder], List[Document]]:
        """
        Holt den Inhalt eines Ordners
        
        Args:
            folder_id: ID des Ordners oder None für Stammverzeichnis
            
        Returns:
            Tupel aus (Unterordner, Dokumente) im angegebenen Ordner
        """
        subfolders = []
        documents = []
        
        # Hole alle Unterordner des angegebenen Ordners
        for subfolder_id, subfolder in self.folders.items():
            if subfolder.parent_id == folder_id:
                subfolders.append(subfolder)
        
        # Hole alle Dokumente im angegebenen Ordner
        for document_id, document in self.documents.items():
            if document.folder_id == folder_id and document.status != DocumentStatus.DELETED:
                documents.append(document)
        
        return subfolders, documents 