import logging
import os
from datetime import datetime
from core.config import settings

def setup_logging():
    """Richtet das Logging-System ein"""
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(settings.LOG_FILE)
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(settings.LOG_FILE),
            logging.StreamHandler()
        ]
    )
    
    # Set levels for specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    
    # Log startup
    logging.info(
        f"Starting application in {settings.ENVIRONMENT} mode"
    )

def log_error(error: Exception, context: dict = None):
    """Protokolliert einen Fehler"""
    logger = logging.getLogger(__name__)
    
    error_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context or {}
    }
    
    logger.error(
        "Error occurred",
        extra={"error_data": error_data}
    )

class RequestIdFilter(logging.Filter):
    """Filter zum Hinzufügen einer Request-ID zu Log-Einträgen"""
    def __init__(self, request_id: str):
        super().__init__()
        self.request_id = request_id
        
    def filter(self, record):
        record.request_id = self.request_id
        return True 