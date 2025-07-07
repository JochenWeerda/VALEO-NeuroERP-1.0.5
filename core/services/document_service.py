from typing import List, Optional
from fastapi import UploadFile
import aiofiles
import os
from datetime import datetime
from core.models.document import Document, DocumentCreate, DocumentUpdate
from core.db.mongodb import get_database
from core.utils.storage import save_file, delete_file
import sys
sys.path.append('./backend/tasks')
from backend.tasks.media_processing_tasks import extract_text_ocr
import asyncio

class DocumentService:
    @staticmethod
    async def get_document(document_id: str) -> Optional[Document]:
        """Dokument anhand ID abrufen"""
        db = await get_database()
        doc_dict = await db.documents.find_one({"_id": document_id})
        if doc_dict:
            return Document(**doc_dict)
        return None

    @staticmethod
    async def get_documents(
        user_id: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Document]:
        """Liste von Dokumenten abrufen"""
        db = await get_database()
        documents = []
        cursor = db.documents.find({"user_id": user_id}).skip(skip).limit(limit)
        async for doc_dict in cursor:
            documents.append(Document(**doc_dict))
        return documents

    @staticmethod
    async def create_document(
        document: DocumentCreate,
        user_id: str
    ) -> Document:
        """Neues Dokument erstellen"""
        db = await get_database()
        
        # Create document dict
        doc_dict = document.dict()
        doc_dict["user_id"] = user_id
        doc_dict["created_at"] = datetime.utcnow()
        doc_dict["updated_at"] = datetime.utcnow()
        
        # Insert into database
        result = await db.documents.insert_one(doc_dict)
        doc_dict["id"] = str(result.inserted_id)
        
        return Document(**doc_dict)

    @staticmethod
    async def update_document(
        document_id: str,
        document_update: DocumentUpdate
    ) -> Optional[Document]:
        """Dokument aktualisieren"""
        db = await get_database()
        
        # Get update data
        update_data = document_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in database
        await db.documents.update_one(
            {"_id": document_id},
            {"$set": update_data}
        )
        
        return await DocumentService.get_document(document_id)

    @staticmethod
    async def delete_document(document_id: str) -> bool:
        """Dokument löschen"""
        db = await get_database()
        
        # Get document to delete file
        document = await DocumentService.get_document(document_id)
        if document and document.file_path:
            await delete_file(document.file_path)
            
        # Delete from database
        result = await db.documents.delete_one({"_id": document_id})
        return result.deleted_count > 0

    @staticmethod
    async def upload_document(file: UploadFile, user_id: str, session_id: str = None) -> Document:
        """Dokument hochladen und OCR-Task anstoßen"""
        # Save file
        file_path = await save_file(file)
        
        # Create document
        document = DocumentCreate(
            name=file.filename,
            file_path=file_path,
            mime_type=file.content_type,
            session_id=session_id
        )
        
        doc = await DocumentService.create_document(document, user_id)
        
        # OCR-Task asynchron starten (nur für Bilder/PDFs)
        if file.content_type in ["image/png", "image/jpeg", "image/jpg", "application/pdf"]:
            # Für PDF ggf. PDF-zu-Bild-Konvertierung im Task
            task = extract_text_ocr.delay(file_path, 'deu', True, doc.id)
            # Optional: Task-ID im Dokument speichern
            db = await get_database()
            await db.documents.update_one({"_id": doc.id}, {"$set": {"ocr_status": "processing", "ocr_task_id": task.id}})
        
        return doc

    @staticmethod
    async def get_document_by_session_id(session_id: str) -> Optional[Document]:
        """Dokument anhand Session-ID abrufen (z.B. für mobilen Upload)"""
        db = await get_database()
        doc_dict = await db.documents.find_one({"session_id": session_id}, sort=[("created_at", -1)])
        if doc_dict:
            return Document(**doc_dict)
        return None 