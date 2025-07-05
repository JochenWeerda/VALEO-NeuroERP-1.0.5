from typing import List
from pydantic import BaseModel, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Driven ERP"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:3000",
        "http://localhost:8080",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///app.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # In Produktion durch sicheren Schlüssel ersetzen
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 Tage
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings() 