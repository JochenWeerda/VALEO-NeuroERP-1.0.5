# VALEO NeuroERP 2.0 - Multi-Stage Dockerfile

# ===========================
# Stage 1: Frontend Builder
# ===========================
FROM node:20-alpine AS frontend-builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ ./

# Build arguments für Environment
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build frontend
RUN npm run build

# ===========================
# Stage 2: Backend Builder
# ===========================
FROM python:3.11-slim AS backend-builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ===========================
# Stage 3: Production Image
# ===========================
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r app && useradd -r -g app app

# Create necessary directories
RUN mkdir -p /app /var/log/supervisor /var/log/nginx /var/cache/nginx \
    && chown -R app:app /app /var/log/nginx /var/cache/nginx

WORKDIR /app

# Copy virtual environment from builder
COPY --from=backend-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy backend code
COPY --chown=app:app backend/ ./backend/

# Copy frontend build
COPY --from=frontend-builder --chown=app:app /app/frontend/build ./frontend/build

# Copy configuration files
COPY --chown=app:app nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=app:app supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy startup script
COPY --chown=app:app docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose ports
EXPOSE 80 8000

# Switch to non-root user
USER app

# Entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 