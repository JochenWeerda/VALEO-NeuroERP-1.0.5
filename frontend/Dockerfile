FROM node:18-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm ci --only=production

# Anwendungscode kopieren
COPY . .

# Port freigeben
EXPOSE 3000

# Anwendung starten
CMD ["npm", "start"] 