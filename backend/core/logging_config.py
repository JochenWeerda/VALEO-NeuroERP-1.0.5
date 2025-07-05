import logging
import logging.handlers
import os
from pathlib import Path

def setup_logging():
    """
    Konfiguriert das Logging-System
    """
    # Logs-Verzeichnis erstellen
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Logging-Format
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Root Logger konfigurieren
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_format)
    root_logger.addHandler(console_handler)
    
    # File Handler für server.log
    server_handler = logging.handlers.RotatingFileHandler(
        "logs/server.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    server_handler.setFormatter(log_format)
    root_logger.addHandler(server_handler)
    
    # File Handler für api.log
    api_handler = logging.handlers.RotatingFileHandler(
        "logs/api.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    api_handler.setFormatter(log_format)
    api_logger = logging.getLogger("api")
    api_logger.addHandler(api_handler)
    
    # File Handler für service.log
    service_handler = logging.handlers.RotatingFileHandler(
        "logs/service.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    service_handler.setFormatter(log_format)
    service_logger = logging.getLogger("service")
    service_logger.addHandler(service_handler)
    
    # File Handler für genxais.log
    genxais_handler = logging.handlers.RotatingFileHandler(
        "logs/genxais.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    genxais_handler.setFormatter(log_format)
    genxais_logger = logging.getLogger("genxais")
    genxais_logger.addHandler(genxais_handler)
    
    # File Handler für mongodb.log
    mongodb_handler = logging.handlers.RotatingFileHandler(
        "logs/mongodb.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    mongodb_handler.setFormatter(log_format)
    mongodb_logger = logging.getLogger("mongodb")
    mongodb_logger.addHandler(mongodb_handler) 