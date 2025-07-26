from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import uuid
import bcrypt
import json
from datetime import datetime

from models.user import User, UserRole, UserStatus

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: Dict[str, Any], created_by: str) -> User:
        """Erstellt einen neuen Benutzer"""
        # Prüfe ob Benutzer bereits existiert
        existing_user = self.db.query(User).filter(
            or_(User.username == user_data["username"], User.email == user_data["email"])
        ).first()
        
        if existing_user:
            raise ValueError("Benutzer mit diesem Benutzernamen oder E-Mail existiert bereits")

        # Hash das Passwort
        hashed_password = bcrypt.hashpw(
            user_data["password"].encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')

        # Erstelle neuen Benutzer
        user = User(
            id=str(uuid.uuid4()),
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=UserRole(user_data.get("role", "user")),
            status=UserStatus.ACTIVE,
            hashed_password=hashed_password,
            department=user_data.get("department"),
            position=user_data.get("position"),
            phone=user_data.get("phone"),
            avatar_url=user_data.get("avatar_url"),
            preferences=json.dumps(user_data.get("preferences", {})),
            created_by=created_by,
            notes=user_data.get("notes")
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Holt einen Benutzer anhand der ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Holt einen Benutzer anhand des Benutzernamens"""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Holt einen Benutzer anhand der E-Mail"""
        return self.db.query(User).filter(User.email == email).first()

    def get_all_users(self, skip: int = 0, limit: int = 100, 
                     role_filter: Optional[str] = None,
                     status_filter: Optional[str] = None,
                     department_filter: Optional[str] = None) -> List[User]:
        """Holt alle Benutzer mit optionalen Filtern"""
        query = self.db.query(User)

        if role_filter:
            query = query.filter(User.role == UserRole(role_filter))
        
        if status_filter:
            query = query.filter(User.status == UserStatus(status_filter))
        
        if department_filter:
            query = query.filter(User.department == department_filter)

        return query.offset(skip).limit(limit).all()

    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """Aktualisiert einen Benutzer"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # Aktualisiere erlaubte Felder
        allowed_fields = [
            "full_name", "email", "department", "position", "phone", 
            "avatar_url", "preferences", "notes", "role", "status"
        ]

        for field in allowed_fields:
            if field in update_data:
                if field == "preferences" and isinstance(update_data[field], dict):
                    setattr(user, field, json.dumps(update_data[field]))
                elif field in ["role", "status"]:
                    enum_class = UserRole if field == "role" else UserStatus
                    setattr(user, field, enum_class(update_data[field]))
                else:
                    setattr(user, field, update_data[field])

        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user_id: str, new_password: str) -> bool:
        """Aktualisiert das Passwort eines Benutzers"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        hashed_password = bcrypt.hashpw(
            new_password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')

        user.hashed_password = hashed_password
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def delete_user(self, user_id: str) -> bool:
        """Löscht einen Benutzer (soft delete durch Status-Änderung)"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.status = UserStatus.INACTIVE
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authentifiziert einen Benutzer"""
        user = self.get_user_by_username(username)
        if not user or not user.is_active:
            return None

        if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
            return None

        # Aktualisiere last_login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return user

    def get_users_by_role(self, role: UserRole) -> List[User]:
        """Holt alle Benutzer mit einer bestimmten Rolle"""
        return self.db.query(User).filter(
            and_(User.role == role, User.status == UserStatus.ACTIVE)
        ).all()

    def get_users_by_department(self, department: str) -> List[User]:
        """Holt alle Benutzer einer Abteilung"""
        return self.db.query(User).filter(
            and_(User.department == department, User.status == UserStatus.ACTIVE)
        ).all()

    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Aktualisiert die Benutzereinstellungen"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        # Merge mit bestehenden Einstellungen
        current_prefs = json.loads(user.preferences) if user.preferences else {}
        current_prefs.update(preferences)
        
        user.preferences = json.dumps(current_prefs)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def get_user_statistics(self) -> Dict[str, Any]:
        """Gibt Statistiken über Benutzer zurück"""
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.status == UserStatus.ACTIVE).count()
        
        role_counts = {}
        for role in UserRole:
            count = self.db.query(User).filter(
                and_(User.role == role, User.status == UserStatus.ACTIVE)
            ).count()
            role_counts[role.value] = count

        department_counts = {}
        departments = self.db.query(User.department).filter(
            User.status == UserStatus.ACTIVE
        ).distinct().all()
        
        for dept in departments:
            if dept[0]:  # department kann None sein
                count = self.db.query(User).filter(
                    and_(User.department == dept[0], User.status == UserStatus.ACTIVE)
                ).count()
                department_counts[dept[0]] = count

        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "role_distribution": role_counts,
            "department_distribution": department_counts
        } 