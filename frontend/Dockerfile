FROM node:18-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Entwicklungsumgebung sicherstellen (devDependencies verfügbar)
ENV NODE_ENV=development

# Package-Dateien kopieren
COPY package*.json ./

# Abhängigkeiten installieren (inkl. dev)
RUN npm ci --include=dev

# Anwendungscode kopieren
COPY . .

# Port freigeben
EXPOSE 3000

# Anwendung starten
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"] 