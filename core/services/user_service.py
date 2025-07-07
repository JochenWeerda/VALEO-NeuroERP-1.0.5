from typing import List, Optional
from passlib.context import CryptContext
from core.models.user import User, UserCreate, UserUpdate, UserInDB
from core.db.mongodb import get_database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    @staticmethod
    async def get_user(user_id: str) -> Optional[User]:
        """Benutzer anhand ID abrufen"""
        db = await get_database()
        user_dict = await db.users.find_one({"_id": user_id})
        if user_dict:
            return User(**user_dict)
        return None

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Benutzer anhand Email abrufen"""
        db = await get_database()
        user_dict = await db.users.find_one({"email": email})
        if user_dict:
            return User(**user_dict)
        return None

    @staticmethod
    async def get_users(skip: int = 0, limit: int = 10) -> List[User]:
        """Liste von Benutzern abrufen"""
        db = await get_database()
        users = []
        cursor = db.users.find().skip(skip).limit(limit)
        async for user_dict in cursor:
            users.append(User(**user_dict))
        return users

    @staticmethod
    async def create_user(user: UserCreate) -> User:
        """Neuen Benutzer erstellen"""
        db = await get_database()
        
        # Hash password
        hashed_password = pwd_context.hash(user.password)
        
        # Create user dict
        user_dict = user.dict()
        user_dict["hashed_password"] = hashed_password
        del user_dict["password"]
        
        # Insert into database
        result = await db.users.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        
        return User(**user_dict)

    @staticmethod
    async def update_user(user_id: str, user_update: UserUpdate) -> Optional[User]:
        """Benutzer aktualisieren"""
        db = await get_database()
        
        # Get update data
        update_data = user_update.dict(exclude_unset=True)
        
        # Hash new password if provided
        if "password" in update_data:
            update_data["hashed_password"] = pwd_context.hash(update_data["password"])
            del update_data["password"]
            
        # Update in database
        await db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        return await UserService.get_user(user_id)

    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """Benutzer löschen"""
        db = await get_database()
        result = await db.users.delete_one({"_id": user_id})
        return result.deleted_count > 0

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """Benutzer authentifizieren"""
        user = await UserService.get_user_by_email(email)
        if not user:
            return None
        if not pwd_context.verify(password, user.hashed_password):
            return None
        return user 