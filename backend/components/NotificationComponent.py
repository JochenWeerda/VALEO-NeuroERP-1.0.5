from typing import List, Optional, Dict
from datetime import datetime

class NotificationComponent:
    def __init__(self):
        self.notifications_db = {}  # In Produktion durch echte Datenbank ersetzen

    def create_notification(self, notification: Dict) -> Dict:
        notification_id = str(len(self.notifications_db) + 1)
        notification["id"] = notification_id
        notification["created_at"] = datetime.utcnow()
        notification["read"] = False
        self.notifications_db[notification_id] = notification
        return notification

    def get_notification(self, notification_id: str) -> Optional[Dict]:
        return self.notifications_db.get(notification_id)

    def get_notifications(self, recipient_id: str, skip: int = 0, limit: int = 100) -> List[Dict]:
        notifications = [
            n for n in self.notifications_db.values()
            if n.get("recipient_id") == recipient_id
        ]
        return notifications[skip : skip + limit]

    def mark_as_read(self, notification_id: str) -> Optional[Dict]:
        notification = self.get_notification(notification_id)
        if not notification:
            return None
        notification["read"] = True
        notification["read_at"] = datetime.utcnow()
        return notification

    def delete_notification(self, notification_id: str) -> bool:
        if notification_id not in self.notifications_db:
            return False
        del self.notifications_db[notification_id]
        return True

    def get_unread_count(self, recipient_id: str) -> int:
        return len([
            n for n in self.notifications_db.values()
            if n.get("recipient_id") == recipient_id and not n.get("read", False)
        ])
            