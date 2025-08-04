#!/bin/bash

# VALEO NeuroERP 2.0 - Dependencies Installation Script
# Serena Quality: Complete dependency management for all modules

set -e  # Exit on any error

echo "🚀 VALEO NeuroERP 2.0 - Dependencies Installation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Python version
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
if [[ $(echo "$python_version >= 3.8" | bc -l) -eq 1 ]]; then
    print_success "Python $python_version detected"
else
    print_error "Python 3.8+ required, found $python_version"
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2)
    if [[ $(echo "$node_version >= 16.0" | bc -l) -eq 1 ]]; then
        print_success "Node.js $node_version detected"
    else
        print_error "Node.js 16+ required, found $node_version"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    print_success "PostgreSQL detected"
else
    print_warning "PostgreSQL not found. Please install PostgreSQL 12+"
fi

# Check if Redis is installed
if command -v redis-server &> /dev/null; then
    print_success "Redis detected"
else
    print_warning "Redis not found. Please install Redis 6+"
fi

echo ""
print_status "Installing Python dependencies..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
print_status "Installing Python packages..."

# Core dependencies
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install sqlalchemy==2.0.23
pip install alembic==1.12.1
pip install psycopg2-binary==2.9.9
pip install redis==5.0.1
pip install pydantic==2.5.0
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-multipart==0.0.6

# AI and ML dependencies
pip install openai==1.3.7
pip install langchain==0.0.350
pip install faiss-cpu==1.7.4
pip install sentence-transformers==2.2.2

# Monitoring and metrics
pip install prometheus-client==0.19.0
pip install structlog==23.2.0

# Data processing
pip install pandas==2.1.4
pip install numpy==1.25.2
pip install xlsxwriter==3.1.9
pip install openpyxl==3.1.2

# Workflow and automation
pip install croniter==2.0.1
pip install celery==5.3.4
pip install flower==2.0.1

# Testing
pip install pytest==7.4.3
pip install pytest-asyncio==0.21.1
pip install httpx==0.25.2

# Development tools
pip install black==23.11.0
pip install isort==5.12.0
pip install flake8==6.1.0
pip install mypy==1.7.1

print_success "Python dependencies installed successfully"

echo ""
print_status "Installing Node.js dependencies..."

# Check if package.json exists
if [ ! -f "frontend/package.json" ]; then
    print_error "package.json not found in frontend directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
print_status "Installing npm packages..."

# Core React dependencies
npm install react@18.2.0
npm install react-dom@18.2.0
npm install react-router-dom@6.20.1
npm install typescript@5.3.3
npm install @types/react@18.2.45
npm install @types/react-dom@18.2.18

# UI Libraries
npm install @mui/material@5.15.1
npm install @mui/icons-material@5.15.1
npm install @emotion/react@11.11.1
npm install @emotion/styled@11.11.0
npm install antd@5.12.8
npm install tailwindcss@3.3.6
npm install @tailwindcss/forms@0.5.7

# State Management
npm install zustand@4.4.7
npm install @tanstack/react-query@5.8.4

# Form handling
npm install react-hook-form@7.48.2
npm install @hookform/resolvers@3.3.2
npm install yup@1.3.3
npm install formik@2.4.5

# HTTP client
npm install axios@1.6.2

# Notifications
npm install react-toastify@9.1.3

# Charts and visualization
npm install recharts@2.8.0
npm install chart.js@4.4.0
npm install react-chartjs-2@5.2.0

# File handling
npm install xlsx@0.18.5
npm install papaparse@5.4.1

# Barcode scanning
npm install quagga@0.12.1
npm install @zxing/library@0.20.0

# Keyboard shortcuts
npm install react-hotkeys-hook@4.4.1

# Performance optimization
npm install react-virtual@2.10.4
npm install react-window@1.8.8

# Development tools
npm install --save-dev @types/node@20.10.4
npm install --save-dev @vitejs/plugin-react@4.2.1
npm install --save-dev vite@5.0.8
npm install --save-dev eslint@8.55.0
npm install --save-dev @typescript-eslint/eslint-plugin@6.13.2
npm install --save-dev @typescript-eslint/parser@6.13.2
npm install --save-dev prettier@3.1.0

print_success "Node.js dependencies installed successfully"

# Return to root directory
cd ..

echo ""
print_status "Setting up environment files..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# VALEO NeuroERP 2.0 Environment Configuration

# Database
DATABASE_URL=postgresql://valeo_user:valeo_password@localhost:5432/valeo_erp
DATABASE_TEST_URL=postgresql://valeo_user:valeo_password@localhost:5432/valeo_erp_test

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Configuration
OPENAI_API_KEY=your-openai-api-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Monitoring
PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus_multiproc
LOG_LEVEL=INFO

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Development
DEBUG=true
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Production (uncomment for production)
# DEBUG=false
# ENVIRONMENT=production
# CORS_ORIGINS=["https://your-domain.com"]
EOF
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_status "Creating .env.production file..."
    cat > .env.production << EOF
# VALEO NeuroERP 2.0 Production Environment

# Database
DATABASE_URL=postgresql://valeo_user:valeo_password@localhost:5432/valeo_erp_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=change-this-in-production
JWT_SECRET_KEY=change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Configuration
OPENAI_API_KEY=your-openai-api-key

# Monitoring
LOG_LEVEL=WARNING

# Production Settings
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=["https://your-domain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30
RATE_LIMIT_PER_HOUR=500
EOF
    print_success ".env.production file created"
else
    print_warning ".env.production file already exists"
fi

echo ""
print_status "Setting up database..."

# Create database setup script
cat > scripts/setup_database.sh << 'EOF'
#!/bin/bash

# Database setup script for VALEO NeuroERP 2.0

echo "Setting up VALEO NeuroERP database..."

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE valeo_erp;
CREATE DATABASE valeo_erp_test;
CREATE USER valeo_user WITH PASSWORD 'valeo_password';
GRANT ALL PRIVILEGES ON DATABASE valeo_erp TO valeo_user;
GRANT ALL PRIVILEGES ON DATABASE valeo_erp_test TO valeo_user;
\q
EOF

echo "Database setup completed!"
EOF

chmod +x scripts/setup_database.sh

echo ""
print_status "Setting up development tools..."

# Create pre-commit hook
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# VALEO NeuroERP 2.0 Pre-commit Hook

echo "Running pre-commit checks..."

# Python formatting
black backend/
isort backend/

# Type checking
mypy backend/

# Linting
flake8 backend/

# TypeScript formatting
cd frontend
npm run format
npm run lint

echo "Pre-commit checks completed!"
EOF

chmod +x .git/hooks/pre-commit

# Create development scripts
cat > scripts/dev.sh << 'EOF'
#!/bin/bash

# Development script for VALEO NeuroERP 2.0

echo "Starting VALEO NeuroERP development environment..."

# Start backend
cd backend
source ../venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Development servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"

# Wait for user to stop
echo "Press Ctrl+C to stop servers"
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x scripts/dev.sh

# Create production build script
cat > scripts/build.sh << 'EOF'
#!/bin/bash

# Production build script for VALEO NeuroERP 2.0

echo "Building VALEO NeuroERP for production..."

# Build frontend
cd frontend
npm run build

# Copy frontend build to backend
cd ..
cp -r frontend/dist backend/app/static

echo "Production build completed!"
EOF

chmod +x scripts/build.sh

echo ""
print_status "Creating Docker configuration..."

# Create Docker Compose for development
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: valeo_erp
      POSTGRES_USER: valeo_user
      POSTGRES_PASSWORD: valeo_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://valeo_user:valeo_password@postgres:5432/valeo_erp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000

volumes:
  postgres_data:
  redis_data:
EOF

echo ""
print_status "Setting up monitoring..."

# Create monitoring configuration
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'valeo-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
EOF

echo ""
print_status "Running database migrations..."

# Activate virtual environment and run migrations
source venv/bin/activate
cd backend

# Run Alembic migrations
if command -v alembic &> /dev/null; then
    print_status "Running database migrations..."
    alembic upgrade head
    print_success "Database migrations completed"
else
    print_warning "Alembic not found, migrations will be run manually"
fi

cd ..

echo ""
print_status "Running tests..."

# Run backend tests
cd backend
python -m pytest tests/ -v
cd ..

# Run frontend tests
cd frontend
npm test -- --watchAll=false
cd ..

echo ""
print_success "🎉 VALEO NeuroERP 2.0 Dependencies Installation Completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your .env file with proper values"
echo "2. Set up your database: ./scripts/setup_database.sh"
echo "3. Start development: ./scripts/dev.sh"
echo "4. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Documentation: http://localhost:8000/docs"
echo ""
echo "🔧 Available Scripts:"
echo "   - Development: ./scripts/dev.sh"
echo "   - Build: ./scripts/build.sh"
echo "   - Database setup: ./scripts/setup_database.sh"
echo ""
echo "📚 Documentation:"
echo "   - VALEO Repository: https://github.com/JochenWeerda/VALEO-NeuroERP-1.0.5"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
print_success "Installation completed successfully! 🚀" 