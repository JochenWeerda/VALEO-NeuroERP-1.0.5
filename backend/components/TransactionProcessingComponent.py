from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel

class TransactionProcessingComponent:
    def __init__(self):
        self.transactions_db = {}  # In Produktion durch echte Datenbank ersetzen

    def create_transaction(self, transaction: Dict) -> Dict:
        transaction_id = str(len(self.transactions_db) + 1)
        transaction["id"] = transaction_id
        self.transactions_db[transaction_id] = transaction
        return transaction

    def get_transaction(self, transaction_id: str) -> Optional[Dict]:
        return self.transactions_db.get(transaction_id)

    def get_transactions(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        return list(self.transactions_db.values())[skip : skip + limit]

    def update_transaction(self, transaction_id: str, transaction: Dict) -> Optional[Dict]:
        if transaction_id not in self.transactions_db:
            return None
        transaction["id"] = transaction_id
        self.transactions_db[transaction_id] = transaction
        return transaction

    def delete_transaction(self, transaction_id: str) -> bool:
        if transaction_id not in self.transactions_db:
            return False
        del self.transactions_db[transaction_id]
        return True
            