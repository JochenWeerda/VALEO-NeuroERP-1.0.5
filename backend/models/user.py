"""
Benutzermodell für das ERP-System.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department = Column(String(100))
    position = Column(String(100))
    phone = Column(String(20))
    avatar_url = Column(String(255))
    preferences = Column(Text)  # JSON string für Benutzereinstellungen
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(36))  # ID des erstellenden Benutzers
    notes = Column(Text)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"

    @property
    def is_active(self):
        return self.status == UserStatus.ACTIVE

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_manager(self):
        return self.role in [UserRole.ADMIN, UserRole.MANAGER]

    def has_permission(self, permission: str) -> bool:
        """Prüft ob der Benutzer eine bestimmte Berechtigung hat"""
        permissions = {
            UserRole.ADMIN: [
                "user_management", "crm_management", "product_management", 
                "order_management", "analytics", "system_settings"
            ],
            UserRole.MANAGER: [
                "crm_management", "product_management", "order_management", 
                "analytics", "user_view"
            ],
            UserRole.USER: [
                "crm_view", "product_view", "order_view", "order_create"
            ],
            UserRole.VIEWER: [
                "crm_view", "product_view", "order_view"
            ]
        }
        return permission in permissions.get(self.role, []) 