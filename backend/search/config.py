"""
VALEO-NeuroERP Search Module Configuration
"""
from typing import Dict, Any
from pydantic_settings import BaseSettings
from functools import lru_cache

class SearchSettings(BaseSettings):
    """Search Module Settings"""
    # MongoDB Atlas Configuration
    MONGODB_URI: str = "mongodb+srv://your-cluster.mongodb.net"
    MONGODB_DB: str = "valeo_search"
    MONGODB_COLLECTION: str = "documents"
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = None
    
    # FAISS Configuration
    FAISS_INDEX_PATH: str = "data/faiss_index"
    FAISS_DIMENSION: int = 384  # BERT embedding dimension
    FAISS_METRIC: str = "cosine"
    
    # Search Configuration
    MAX_RESULTS: int = 100
    DEFAULT_PAGE_SIZE: int = 20
    MIN_SCORE: float = 0.5
    CACHE_TTL: int = 3600  # 1 hour
    
    # Performance Settings
    BATCH_SIZE: int = 32
    NUM_WORKERS: int = 4
    TIMEOUT: int = 30
    
    # Monitoring Configuration
    PROMETHEUS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"
    TRACE_SAMPLE_RATE: float = 0.1
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> SearchSettings:
    """Returns cached settings instance"""
    return SearchSettings()

class SearchConfig:
    """Search Configuration Management"""
    def __init__(self):
        self.settings = get_settings()
        self.search_weights = {
            "text": 0.7,
            "vector": 0.3
        }
        
    def get_mongodb_config(self) -> Dict[str, Any]:
        """Returns MongoDB configuration"""
        return {
            "uri": self.settings.MONGODB_URI,
            "db": self.settings.MONGODB_DB,
            "collection": self.settings.MONGODB_COLLECTION
        }
    
    def get_redis_config(self) -> Dict[str, Any]:
        """Returns Redis configuration"""
        return {
            "host": self.settings.REDIS_HOST,
            "port": self.settings.REDIS_PORT,
            "db": self.settings.REDIS_DB,
            "password": self.settings.REDIS_PASSWORD,
            "encoding": "utf-8",
            "decode_responses": True
        }
    
    def get_faiss_config(self) -> Dict[str, Any]:
        """Returns FAISS configuration"""
        return {
            "index_path": self.settings.FAISS_INDEX_PATH,
            "dimension": self.settings.FAISS_DIMENSION,
            "metric": self.settings.FAISS_METRIC
        }
    
    def get_search_config(self) -> Dict[str, Any]:
        """Returns search configuration"""
        return {
            "max_results": self.settings.MAX_RESULTS,
            "default_page_size": self.settings.DEFAULT_PAGE_SIZE,
            "min_score": self.settings.MIN_SCORE,
            "cache_ttl": self.settings.CACHE_TTL,
            "weights": self.search_weights
        }
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        """Returns monitoring configuration"""
        return {
            "prometheus_port": self.settings.PROMETHEUS_PORT,
            "log_level": self.settings.LOG_LEVEL,
            "trace_sample_rate": self.settings.TRACE_SAMPLE_RATE
        }

# Global configuration instance
config = SearchConfig() 