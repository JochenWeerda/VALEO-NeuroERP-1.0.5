from typing import List, Optional, Dict
from datetime import datetime

class DocumentManagementComponent:
    def __init__(self):
        self.documents_db = {}  # In Produktion durch echte Datenbank ersetzen

    def create_document(self, document: Dict) -> Dict:
        document_id = str(len(self.documents_db) + 1)
        document["id"] = document_id
        document["created_at"] = datetime.utcnow()
        document["updated_at"] = datetime.utcnow()
        self.documents_db[document_id] = document
        return document

    def get_document(self, document_id: str) -> Optional[Dict]:
        return self.documents_db.get(document_id)

    def get_documents(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        return list(self.documents_db.values())[skip : skip + limit]

    def update_document(self, document_id: str, document: Dict) -> Optional[Dict]:
        if document_id not in self.documents_db:
            return None
        document["id"] = document_id
        document["updated_at"] = datetime.utcnow()
        self.documents_db[document_id] = document
        return document

    def delete_document(self, document_id: str) -> bool:
        if document_id not in self.documents_db:
            return False
        del self.documents_db[document_id]
        return True

    def search_documents(self, query: str) -> List[Dict]:
        # In Produktion durch echte Volltextsuche ersetzen
        return [
            doc for doc in self.documents_db.values()
            if query.lower() in doc.get("content", "").lower()
        ]
            