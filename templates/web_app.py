# -*- coding: utf-8 -*-
"""
🌐 GENXAIS Web App Template
"Build the Future from the Beginning"

Modern Web Application template with FastAPI backend and React frontend,
optimized for Cursor.AI development and GENXAIS APM Framework.
"""

from typing import Dict, Any, List, Optional
import os
import json
from datetime import datetime

class WebAppTemplate:
    """Web Application template for GENXAIS projects."""
    
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.config = self._get_default_config()
        
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default web app configuration."""
        
        return {
            "project": {
                "name": self.project_name,
                "type": "web_app",
                "description": f"Modern web application built with GENXAIS Framework",
                "version": "1.0.0"
            },
            "backend": {
                "framework": "fastapi",
                "python_version": "3.9+",
                "database": "postgresql",
                "orm": "sqlalchemy",
                "async": True
            },
            "frontend": {
                "framework": "react",
                "typescript": True,
                "ui_library": "tailwindcss",
                "state_management": "zustand"
            },
            "deployment": {
                "containerization": "docker",
                "orchestration": "docker-compose",
                "hosting": "cloud_ready",
                "ci_cd": True
            },
            "features": [
                "authentication",
                "api_documentation",
                "testing_suite",
                "monitoring",
                "logging"
            ]
        }
        
    def generate_project_structure(self) -> Dict[str, Any]:
        """Generate complete project structure."""
        
        structure = {
            # Backend structure
            "backend/": {
                "app/": {
                    "__init__.py": self._generate_backend_init(),
                    "main.py": self._generate_main_py(),
                    "core/": {
                        "__init__.py": "",
                        "config.py": self._generate_config_py(),
                        "security.py": self._generate_security_py(),
                        "database.py": self._generate_database_py()
                    },
                    "api/": {
                        "__init__.py": "",
                        "v1/": {
                            "__init__.py": "",
                            "endpoints/": {
                                "__init__.py": "",
                                "auth.py": self._generate_auth_endpoints(),
                                "users.py": self._generate_user_endpoints(),
                                "health.py": self._generate_health_endpoints()
                            }
                        }
                    },
                    "models/": {
                        "__init__.py": "",
                        "user.py": self._generate_user_model(),
                        "base.py": self._generate_base_model()
                    },
                    "schemas/": {
                        "__init__.py": "",
                        "user.py": self._generate_user_schema(),
                        "auth.py": self._generate_auth_schema()
                    },
                    "crud/": {
                        "__init__.py": "",
                        "user.py": self._generate_user_crud(),
                        "base.py": self._generate_base_crud()
                    },
                    "tests/": {
                        "__init__.py": "",
                        "test_auth.py": self._generate_auth_tests(),
                        "test_users.py": self._generate_user_tests(),
                        "conftest.py": self._generate_test_config()
                    }
                },
                "requirements.txt": self._generate_backend_requirements(),
                "Dockerfile": self._generate_backend_dockerfile(),
                ".env.example": self._generate_env_example()
            },
            
            # Frontend structure
            "frontend/": {
                "src/": {
                    "App.tsx": self._generate_app_tsx(),
                    "main.tsx": self._generate_main_tsx(),
                    "components/": {
                        "Auth/": {
                            "Login.tsx": self._generate_login_component(),
                            "Register.tsx": self._generate_register_component()
                        },
                        "Dashboard/": {
                            "Dashboard.tsx": self._generate_dashboard_component()
                        },
                        "UI/": {
                            "Button.tsx": self._generate_button_component(),
                            "Input.tsx": self._generate_input_component()
                        }
                    },
                    "hooks/": {
                        "useAuth.ts": self._generate_auth_hook(),
                        "useApi.ts": self._generate_api_hook()
                    },
                    "store/": {
                        "authStore.ts": self._generate_auth_store(),
                        "appStore.ts": self._generate_app_store()
                    },
                    "utils/": {
                        "api.ts": self._generate_api_utils(),
                        "constants.ts": self._generate_constants()
                    },
                    "styles/": {
                        "globals.css": self._generate_global_styles(),
                        "components.css": self._generate_component_styles()
                    }
                },
                "package.json": self._generate_package_json(),
                "vite.config.ts": self._generate_vite_config(),
                "tailwind.config.js": self._generate_tailwind_config(),
                "tsconfig.json": self._generate_tsconfig(),
                "Dockerfile": self._generate_frontend_dockerfile()
            },
            
            # Root files
            "docker-compose.yml": self._generate_docker_compose(),
            "README.md": self._generate_readme(),
            ".gitignore": self._generate_gitignore(),
            ".env.example": self._generate_env_example(),
            "genxais_config.json": self._generate_genxais_config()
        }
        
        return structure
        
    def _generate_backend_init(self) -> str:
        """Generate backend __init__.py."""
        
        return '''# -*- coding: utf-8 -*-
"""
🚀 GENXAIS Web App Backend
Built with FastAPI and GENXAIS Framework
"""

__version__ = "1.0.0"
__author__ = "GENXAIS Framework"
'''

    def _generate_main_py(self) -> str:
        """Generate FastAPI main.py."""
        
        return f'''# -*- coding: utf-8 -*-
"""
🚀 {self.project_name} - FastAPI Backend
Built with GENXAIS Framework
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api.v1.endpoints import auth, users, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await create_tables()
    yield
    # Shutdown
    pass


# Create FastAPI app with GENXAIS optimization
app = FastAPI(
    title="{self.project_name} API",
    description="Modern web application built with GENXAIS Framework",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {{
        "message": "🚀 {self.project_name} API powered by GENXAIS Framework",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "ready"
    }}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
'''

    def _generate_config_py(self) -> str:
        """Generate configuration file."""
        
        return '''# -*- coding: utf-8 -*-
"""
Configuration settings for GENXAIS Web App
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Project info
    PROJECT_NAME: str = "GENXAIS Web App"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Built with GENXAIS Framework"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://user:password@localhost/dbname"
    )
    
    # Security
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # External services
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
'''

    def _generate_security_py(self) -> str:
        """Generate security utilities."""
        
        return '''# -*- coding: utf-8 -*-
"""
Security utilities for GENXAIS Web App
"""

from datetime import datetime, timedelta
from typing import Optional, Union
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handler
security = HTTPBearer()


def create_access_token(
    subject: Union[str, int], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token."""
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm="HS256"
    )
    
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password."""
    return pwd_context.hash(password)


def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return subject."""
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256"]
        )
        return payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
'''

    def _generate_database_py(self) -> str:
        """Generate database configuration."""
        
        return '''# -*- coding: utf-8 -*-
"""
Database configuration for GENXAIS Web App
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from app.core.config import settings

# Sync database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async database setup  
async_engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
AsyncSessionLocal = sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db():
    """Get async database session."""
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    """Create database tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
'''

    def _generate_backend_requirements(self) -> str:
        """Generate backend requirements.txt."""
        
        return '''# GENXAIS Web App Backend Requirements
# Core framework
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.5.0
pydantic-settings>=2.0.0

# Database
sqlalchemy>=2.0.0
asyncpg>=0.29.0
alembic>=1.12.0

# Authentication & Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6

# HTTP client
httpx>=0.25.0
aiofiles>=23.2.1

# Development
pytest>=7.4.0
pytest-asyncio>=0.21.0
black>=23.11.0
flake8>=6.1.0
mypy>=1.7.0

# Monitoring
prometheus-client>=0.19.0
sentry-sdk[fastapi]>=1.38.0

# Utils
python-dotenv>=1.0.0
'''

    def _generate_package_json(self) -> str:
        """Generate frontend package.json."""
        
        return f'''{{
  "name": "{self.project_name.lower().replace(' ', '-')}-frontend",
  "version": "1.0.0",
  "description": "Frontend for {self.project_name} built with GENXAIS Framework",
  "type": "module",
  "scripts": {{
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }},
  "dependencies": {{
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "react-query": "^3.39.0",
    "lucide-react": "^0.294.0"
  }},
  "devDependencies": {{
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vitest": "^0.34.6"
  }}
}}
'''

    def _generate_docker_compose(self) -> str:
        """Generate docker-compose.yml."""
        
        return f'''version: '3.8'

services:
  # Backend service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/{self.project_name.lower().replace(' ', '_')}_db
      - SECRET_KEY=your-secret-key-change-in-production
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Frontend service  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB={self.project_name.lower().replace(' ', '_')}_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Monitoring (optional)
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

volumes:
  postgres_data:
  redis_data:
'''

    def _generate_readme(self) -> str:
        """Generate project README."""
        
        return f'''# 🚀 {self.project_name}

> Built with **GENXAIS Framework** - "Build the Future from the Beginning"

Modern, scalable web application featuring FastAPI backend and React frontend, optimized for AI-driven development with Cursor.AI.

## ✨ Features

- 🏗️ **APM Framework Integration**: Systematic VAN → PLAN → CREATE → IMPLEMENT → REFLECT cycles
- 🔐 **Authentication & Authorization**: JWT-based security
- 📱 **Responsive UI**: Modern React with TypeScript and Tailwind CSS
- 🗃️ **Database**: PostgreSQL with SQLAlchemy ORM
- 🐳 **Containerized**: Docker and Docker Compose ready
- 🧪 **Testing**: Comprehensive test suites
- 📊 **Monitoring**: Built-in performance tracking
- 🔄 **CI/CD Ready**: GitHub Actions integration

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- GENXAIS Framework

### Installation

1. **Initialize with GENXAIS**:
```bash
python genxais_sdk.py init --project {self.project_name.lower().replace(' ', '-')} --template web_app
cd {self.project_name.lower().replace(' ', '-')}
```

2. **Start with Docker**:
```bash
docker-compose up -d
```

3. **Or start manually**:

**Backend**:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your settings
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ GENXAIS APM Development

### Start APM Cycle
```bash
python genxais_sdk.py start --project {self.project_name.lower().replace(' ', '-')}
```

### Develop Module
```bash
python genxais_sdk.py module --project {self.project_name.lower().replace(' ', '-')}
```

### Optimize Project
```bash
python genxais_sdk.py optimize
```

### Monitor Performance
```bash
python genxais_sdk.py monitor
```

## 📁 Project Structure

```
{self.project_name.lower().replace(' ', '-')}/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core configuration
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── tests/       # Backend tests
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── store/       # State management
│   │   └── utils/       # Utilities
│   └── package.json
├── docker-compose.yml   # Container orchestration
└── genxais_config.json # GENXAIS configuration
```

## 🎯 API Endpoints

- `GET /` - API status
- `GET /docs` - Interactive API documentation
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users/me` - Current user profile
- `GET /health` - Health check

## 🧪 Testing

**Backend**:
```bash
cd backend
pytest -v
```

**Frontend**:
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `SECRET_KEY`: JWT secret key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

## 📊 Monitoring

Access monitoring dashboards:
- Prometheus: http://localhost:9090
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

## 🤝 Contributing

Built with GENXAIS Framework methodology:

1. **VAN Phase**: Vision alignment and navigation
2. **PLAN Phase**: Systematic project planning
3. **CREATE Phase**: Prototype and design creation
4. **IMPLEMENT Phase**: Feature implementation
5. **REFLECT Phase**: Analysis and optimization

## 📝 License

MIT License - Built with 💚 using GENXAIS Framework

---

> 🚀 **GENXAIS Framework**: "Build the Future from the Beginning"
> 
> Accelerate your development with systematic APM cycles, intelligent error handling, and Cursor.AI optimization.
'''

    def _generate_genxais_config(self) -> str:
        """Generate GENXAIS configuration."""
        
        config = self.config.copy()
        config["template"] = "web_app"
        config["created"] = datetime.now().isoformat()
        config["genxais"] = {
            "framework_version": "1.0.0",
            "apm_enabled": True,
            "cursor_ai_optimized": True,
            "error_handling": "robust"
        }
        
        return json.dumps(config, indent=2)

    def _generate_gitignore(self) -> str:
        """Generate .gitignore file."""
        
        return '''# GENXAIS Web App .gitignore

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite3

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Docker
.dockerignore

# Coverage
.coverage
htmlcov/
.nyc_output/
coverage/

# Pytest
.pytest_cache/

# MyPy
.mypy_cache/
.dmypy.json
dmypy.json
'''

    # Weitere Template-Methoden werden hier implementiert...
    def _generate_auth_endpoints(self) -> str:
        """Generate authentication endpoints."""
        return '''# Auth endpoints implementation...'''
        
    def _generate_user_endpoints(self) -> str:
        """Generate user endpoints."""
        return '''# User endpoints implementation...'''
        
    def _generate_health_endpoints(self) -> str:
        """Generate health check endpoints."""
        return '''# Health endpoints implementation...'''

    # Weitere Methoden für alle anderen Template-Komponenten...
    # (Diese würden in einer vollständigen Implementierung alle ausgearbeitet)

# Export template
web_app_template = WebAppTemplate 