from typing import List, Optional, Dict
from datetime import datetime

class InventoryManagementComponent:
    def __init__(self):
        self.inventory_db = {}  # In Produktion durch echte Datenbank ersetzen

    def create_item(self, item: Dict) -> Dict:
        item_id = str(len(self.inventory_db) + 1)
        item["id"] = item_id
        item["created_at"] = datetime.utcnow()
        item["updated_at"] = datetime.utcnow()
        self.inventory_db[item_id] = item
        return item

    def get_item(self, item_id: str) -> Optional[Dict]:
        return self.inventory_db.get(item_id)

    def get_items(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        return list(self.inventory_db.values())[skip : skip + limit]

    def update_item(self, item_id: str, item: Dict) -> Optional[Dict]:
        if item_id not in self.inventory_db:
            return None
        item["id"] = item_id
        item["updated_at"] = datetime.utcnow()
        self.inventory_db[item_id] = item
        return item

    def delete_item(self, item_id: str) -> bool:
        if item_id not in self.inventory_db:
            return False
        del self.inventory_db[item_id]
        return True

    def adjust_quantity(self, item_id: str, quantity_change: int) -> Optional[Dict]:
        item = self.get_item(item_id)
        if not item:
            return None
        item["quantity"] += quantity_change
        item["updated_at"] = datetime.utcnow()
        return item
            