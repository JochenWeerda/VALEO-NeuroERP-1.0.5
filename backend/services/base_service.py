"""
Base service class for VALEO-NeuroERP services.
"""

from typing import Any, Dict, List, Optional, TypeVar, Generic
from datetime import datetime
import logging
from pydantic import BaseModel
from redis import Redis
from motor.motor_asyncio import AsyncIOMotorClient
from backend.core.exceptions import ServiceException
from backend.core.config import settings

T = TypeVar('T', bound=BaseModel)

class BaseService(Generic[T]):
    """Base service class with common functionality for all services"""
    
    def __init__(
        self,
        mongo_client: AsyncIOMotorClient,
        redis_client: Redis,
        collection_name: str,
        model_class: type[T]
    ):
        self.mongo = mongo_client
        self.redis = redis_client
        self.collection_name = collection_name
        self.model_class = model_class
        self.logger = logging.getLogger(self.__class__.__name__)
        self.db = self.mongo[settings.MONGODB_DATABASE]
        self.collection = self.db[collection_name]
        
    async def get(self, id: str, use_cache: bool = True) -> Optional[T]:
        """Get a single document by ID"""
        try:
            # Check cache first if enabled
            if use_cache and settings.get_feature_flag("use_cache"):
                cached = await self._get_from_cache(id)
                if cached:
                    return self.model_class.parse_raw(cached)
                    
            # Get from DB
            doc = await self.collection.find_one({"_id": id})
            if not doc:
                return None
                
            # Update cache if enabled
            if use_cache and settings.get_feature_flag("use_cache"):
                await self._set_in_cache(id, doc)
                
            return self.model_class.parse_obj(doc)
            
        except Exception as e:
            self.logger.error(f"Error getting document {id}: {str(e)}")
            raise ServiceException(f"Failed to get document: {str(e)}")
            
    async def create(self, data: T) -> T:
        """Create a new document"""
        try:
            doc = data.dict()
            doc["created_at"] = datetime.utcnow()
            doc["updated_at"] = doc["created_at"]
            
            result = await self.collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            
            # Update cache if enabled
            if settings.get_feature_flag("use_cache"):
                await self._set_in_cache(str(result.inserted_id), doc)
                
            return self.model_class.parse_obj(doc)
            
        except Exception as e:
            self.logger.error(f"Error creating document: {str(e)}")
            raise ServiceException(f"Failed to create document: {str(e)}")
            
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[T]:
        """Update a document"""
        try:
            data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.find_one_and_update(
                {"_id": id},
                {"$set": data},
                return_document=True
            )
            
            if not result:
                return None
                
            # Update cache if enabled
            if settings.get_feature_flag("use_cache"):
                await self._set_in_cache(id, result)
                
            return self.model_class.parse_obj(result)
            
        except Exception as e:
            self.logger.error(f"Error updating document {id}: {str(e)}")
            raise ServiceException(f"Failed to update document: {str(e)}")
            
    async def delete(self, id: str) -> bool:
        """Delete a document"""
        try:
            result = await self.collection.delete_one({"_id": id})
            
            # Remove from cache if enabled
            if settings.get_feature_flag("use_cache"):
                await self._delete_from_cache(id)
                
            return result.deleted_count > 0
            
        except Exception as e:
            self.logger.error(f"Error deleting document {id}: {str(e)}")
            raise ServiceException(f"Failed to delete document: {str(e)}")
            
    async def list(
        self,
        filter_query: Dict[str, Any] = None,
        skip: int = 0,
        limit: int = settings.BATCH_CHUNK_SIZE,
        sort: List[tuple] = None
    ) -> List[T]:
        """List documents with filtering, pagination and sorting"""
        try:
            filter_query = filter_query or {}
            cursor = self.collection.find(filter_query)
            
            if sort:
                cursor = cursor.sort(sort)
                
            cursor = cursor.skip(skip).limit(limit)
            
            docs = await cursor.to_list(length=limit)
            return [self.model_class.parse_obj(doc) for doc in docs]
            
        except Exception as e:
            self.logger.error(f"Error listing documents: {str(e)}")
            raise ServiceException(f"Failed to list documents: {str(e)}")
            
    async def count(self, filter_query: Dict[str, Any] = None) -> int:
        """Count documents matching a filter"""
        try:
            filter_query = filter_query or {}
            return await self.collection.count_documents(filter_query)
            
        except Exception as e:
            self.logger.error(f"Error counting documents: {str(e)}")
            raise ServiceException(f"Failed to count documents: {str(e)}")
            
    async def _get_from_cache(self, id: str) -> Optional[str]:
        """Get document from cache"""
        try:
            key = f"{self.collection_name}:{id}"
            return await self.redis.get(key)
        except Exception as e:
            self.logger.warning(f"Cache get failed for {id}: {str(e)}")
            return None
            
    async def _set_in_cache(self, id: str, data: Dict[str, Any], expire: int = settings.CACHE_TTL):
        """Set document in cache"""
        try:
            key = f"{self.collection_name}:{id}"
            await self.redis.setex(key, expire, self.model_class.parse_obj(data).json())
        except Exception as e:
            self.logger.warning(f"Cache set failed for {id}: {str(e)}")
            
    async def _delete_from_cache(self, id: str):
        """Delete document from cache"""
        try:
            key = f"{self.collection_name}:{id}"
            await self.redis.delete(key)
        except Exception as e:
            self.logger.warning(f"Cache delete failed for {id}: {str(e)}")
            
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(collection={self.collection_name})" 