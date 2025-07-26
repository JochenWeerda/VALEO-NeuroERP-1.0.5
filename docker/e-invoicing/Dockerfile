FROM openjdk:17-jdk-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# System-Pakete aktualisieren und notwendige Tools installieren
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Mustangproject herunterladen und installieren
RUN wget https://github.com/ZUGFeRD/mustangproject/releases/latest/download/mustangproject.jar -O /app/mustangproject.jar

# Spring Boot JAR herunterladen (falls verfügbar) oder eigene API erstellen
COPY target/e-invoicing-api.jar /app/e-invoicing-api.jar

# Ports exponieren
EXPOSE 8080 8081

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start-Kommando
CMD ["java", "-jar", "/app/e-invoicing-api.jar"] 