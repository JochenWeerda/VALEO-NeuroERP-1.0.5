# Multi-stage build für optimiertes Frontend
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package.json und package-lock.json kopieren
COPY package*.json ./

# Dependencies installieren (mit legacy-peer-deps für Kompatibilität)
RUN npm ci --legacy-peer-deps

# Source Code kopieren
COPY . .

# Build erstellen
RUN npm run build

# Production Stage
FROM nginx:alpine

# Nginx Konfiguration kopieren
COPY nginx.conf /etc/nginx/nginx.conf

# Build-Ergebnis kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Port exponieren
EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Nginx starten
CMD ["nginx", "-g", "daemon off;"] 