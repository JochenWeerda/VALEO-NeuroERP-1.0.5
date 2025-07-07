import os
import aiofiles
from fastapi import UploadFile
from datetime import datetime
import uuid

UPLOAD_DIR = "./data/uploads"

async def save_file(file: UploadFile) -> str:
    """Speichert eine hochgeladene Datei"""
    # Create upload directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{timestamp}_{unique_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
        
    return file_path

async def delete_file(file_path: str) -> bool:
    """Löscht eine Datei"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False

def get_file_size(file_path: str) -> int:
    """Gibt die Dateigröße zurück"""
    try:
        return os.path.getsize(file_path)
    except Exception:
        return 0

def get_file_mime_type(filename: str) -> str:
    """Bestimmt den MIME-Typ einer Datei"""
    import mimetypes
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or "application/octet-stream" 