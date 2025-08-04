#!/bin/bash
# VALEO NeuroERP 2.0 - Dependency Installation Script
# Serena Quality: Complete dependency management with error handling

set -e  # Exit on error

echo "🚀 VALEO NeuroERP 2.0 - Installing Dependencies"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root!"
   exit 1
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    print_error "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Update package managers
echo "📦 Updating package managers..."
if [[ "$OS" == "linux" ]]; then
    sudo apt-get update -qq
    print_status "APT updated"
elif [[ "$OS" == "macos" ]]; then
    brew update
    print_status "Homebrew updated"
fi

# Install system dependencies
echo ""
echo "🔧 Installing system dependencies..."

# PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    if [[ "$OS" == "linux" ]]; then
        sudo apt-get install -y postgresql postgresql-contrib
    else
        brew install postgresql
        brew services start postgresql
    fi
    print_status "PostgreSQL installed"
else
    print_status "PostgreSQL already installed"
fi

# Redis
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    if [[ "$OS" == "linux" ]]; then
        sudo apt-get install -y redis-server
    else
        brew install redis
        brew services start redis
    fi
    print_status "Redis installed"
else
    print_status "Redis already installed"
fi

# Node.js and npm
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    if [[ "$OS" == "linux" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        brew install node
    fi
    print_status "Node.js installed"
else
    print_status "Node.js already installed ($(node --version))"
fi

# Python 3.9+
if ! command -v python3 &> /dev/null; then
    echo "Installing Python 3..."
    if [[ "$OS" == "linux" ]]; then
        sudo apt-get install -y python3 python3-pip python3-venv
    else
        brew install python@3.9
    fi
    print_status "Python 3 installed"
else
    print_status "Python already installed ($(python3 --version))"
fi

# Docker (optional)
if ! command -v docker &> /dev/null; then
    print_warning "Docker not installed. Install manually if needed for deployment."
else
    print_status "Docker already installed"
fi

echo ""
echo "📚 Installing Backend Dependencies..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install Python dependencies
cat > requirements.txt << EOF
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
asyncpg==0.29.0

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
cryptography==41.0.7

# Redis & Caching
redis==5.0.1
hiredis==2.2.3

# Data Processing
pandas==2.1.3
openpyxl==3.1.2
xlsxwriter==3.1.9
python-dateutil==2.8.2

# Monitoring & Logging
prometheus-client==0.19.0
python-json-logger==2.0.7
sentry-sdk==1.38.0

# Task Queue
celery==5.3.4
flower==2.0.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Development
black==23.11.0
flake8==6.1.0
mypy==1.7.1
pre-commit==3.5.0

# Additional
email-validator==2.1.0
python-dotenv==1.0.0
pytz==2023.3
EOF

pip install -r requirements.txt
print_status "Backend dependencies installed"

# Install additional ML/AI dependencies (optional)
print_warning "Installing AI/ML dependencies (optional)..."
cat > requirements-ml.txt << EOF
# AI/ML Dependencies
numpy==1.26.2
scikit-learn==1.3.2
tensorflow==2.15.0
torch==2.1.1
transformers==4.36.0
langchain==0.0.348
openai==1.3.7
EOF

# Ask user if they want ML dependencies
read -p "Install AI/ML dependencies? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install -r requirements-ml.txt
    print_status "AI/ML dependencies installed"
fi

deactivate

echo ""
echo "📱 Installing Frontend Dependencies..."
cd ../frontend

# Create package.json if not exists
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "valeo-neuroerp-frontend",
  "version": "2.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@mui/x-data-grid": "^6.18.3",
    "@mui/x-date-pickers": "^6.18.3",
    "@reduxjs/toolkit": "^2.0.1",
    "@tanstack/react-query": "^5.13.4",
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "formik": "^2.4.5",
    "papaparse": "^5.4.1",
    "quagga": "^0.12.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-error-boundary": "^4.0.11",
    "react-hotkeys-hook": "^4.4.1",
    "react-router-dom": "^6.20.1",
    "react-toastify": "^9.1.3",
    "react-virtual": "^2.10.4",
    "recharts": "^2.10.3",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "xlsx": "^0.18.5",
    "yup": "^1.3.3",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14",
    "@types/quagga": "^0.12.5",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write 'src/**/*.{ts,tsx,css}'",
    "type-check": "tsc --noEmit"
  }
}
EOF
fi

# Install npm packages
npm install
print_status "Frontend dependencies installed"

# Install global tools
echo ""
echo "🌐 Installing global tools..."
npm install -g typescript ts-node nodemon pm2
print_status "Global Node.js tools installed"

# Setup pre-commit hooks
echo ""
echo "🪝 Setting up pre-commit hooks..."
cd ..
if [ -f ".pre-commit-config.yaml" ]; then
    pre-commit install
    print_status "Pre-commit hooks installed"
fi

# Create .env files
echo ""
echo "📝 Creating environment files..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://valeo_user:valeo_pass@localhost:5432/valeo_neuroerp
ASYNC_DATABASE_URL=postgresql+asyncpg://valeo_user:valeo_pass@localhost:5432/valeo_neuroerp

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA=30

# API
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Features
ENABLE_MONITORING=true
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true

# AI/ML (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOF
    print_status ".env file created"
else
    print_warning ".env file already exists"
fi

# Run database migrations
echo ""
echo "🗄️ Setting up database..."
cd backend

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw valeo_neuroerp; then
    print_warning "Database already exists"
else
    # Create database and user
    sudo -u postgres psql << EOF
CREATE USER valeo_user WITH PASSWORD 'valeo_pass';
CREATE DATABASE valeo_neuroerp OWNER valeo_user;
GRANT ALL PRIVILEGES ON DATABASE valeo_neuroerp TO valeo_user;
EOF
    print_status "Database created"
fi

# Run migrations
source venv/bin/activate
alembic upgrade head
print_status "Database migrations completed"
deactivate

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env file with your configuration"
echo "  2. Run 'cd backend && source venv/bin/activate && uvicorn app.main:app --reload' to start backend"
echo "  3. Run 'cd frontend && npm run dev' to start frontend"
echo "  4. Access the application at http://localhost:3000"
echo ""
echo "🔒 Security reminder:"
echo "  - Change default database passwords"
echo "  - Update JWT secret key in production"
echo "  - Configure CORS settings appropriately"
echo "  - Enable HTTPS in production"
echo ""

# Create startup script
cat > start_dev.sh << 'EOF'
#!/bin/bash
# Start all services for development

# Start Redis
redis-server --daemonize yes

# Start PostgreSQL (if not running)
if ! pg_isready; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    else
        sudo service postgresql start
    fi
fi

# Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Start Celery Worker (optional)
cd ../backend
celery -A app.tasks worker --loglevel=info &
CELERY_PID=$!

echo "Services started:"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo "  Celery PID: $CELERY_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID $CELERY_PID; exit" INT
wait
EOF

chmod +x start_dev.sh
print_status "Development startup script created (./start_dev.sh)"

echo "🎉 All done! Happy coding!"