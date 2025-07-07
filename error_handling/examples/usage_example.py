"""
Beispiel für die Verwendung der Klassenbibliothek
"""

import logging
from typing import Dict, Any
from error_handling.common.base import (
    BaseHandler, BaseStrategy, BaseProcessor,
    ExecutionContext, BaseObserver, BaseSubject
)
from error_handling.common.utils import (
    FileUtils, LoggingUtils, TimeUtils,
    ValidationUtils, CacheUtils
)
from error_handling.common.factory import (
    registry, register_handler, register_strategy,
    register_processor
)

# Logger einrichten
LoggingUtils.setup_logging(
    level=logging.INFO,
    log_file="logs/example.log"
)

logger = logging.getLogger(__name__)

class DataValidationStrategy(BaseStrategy):
    """Beispiel-Strategie für Datenvalidierung"""
    
    def __init__(self, name: str):
        super().__init__(name)
        self.validators = {
            "email": ValidationUtils.is_valid_email,
            "url": ValidationUtils.is_valid_url
        }
    
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        data = context.metadata.get("data", {})
        results = {}
        
        for field, value in data.items():
            validator = self.validators.get(field)
            if validator:
                results[field] = validator(value)
        
        return {"validation_results": results}

class DataProcessor(BaseProcessor):
    """Beispiel-Prozessor für Datenverarbeitung"""
    
    def __init__(self, name: str):
        super().__init__(name)
        
        # Validatoren hinzufügen
        self.add_validator(
            lambda data: isinstance(data, dict)
        )
        
        # Transformer hinzufügen
        self.add_transformer(
            lambda data: {k.lower(): v for k, v in data.items()}
        )
    
    def process(self, data: Any) -> Any:
        if not self.validate(data):
            raise ValueError("Ungültige Daten")
        
        processed_data = self.transform(data)
        return processed_data

class ProcessingHandler(BaseHandler):
    """Beispiel-Handler für die Verarbeitung"""
    
    def __init__(self, name: str):
        super().__init__(name)
        self.processor = registry.get_or_create(
            "processors", "data_processor"
        )
        self.validator = registry.get_or_create(
            "strategies", "data_validator"
        )
    
    @CacheUtils.timed_cache(seconds=60)
    def handle(self, context: ExecutionContext) -> Dict[str, Any]:
        # Daten validieren
        validation_results = self.validator.execute(context)
        if not all(validation_results.get("validation_results", {}).values()):
            raise ValueError("Validierung fehlgeschlagen")
        
        # Daten verarbeiten
        data = context.metadata.get("data", {})
        processed_data = self.processor.process(data)
        
        return {
            "status": "success",
            "processed_data": processed_data
        }

class ProcessingObserver(BaseObserver):
    """Beispiel-Observer für die Verarbeitung"""
    
    def update(self, subject: Any, *args, **kwargs) -> None:
        logger.info(
            f"Verarbeitung aktualisiert: {kwargs.get('status', 'unknown')}"
        )

class ProcessingSubject(BaseSubject):
    """Beispiel-Subject für die Verarbeitung"""
    
    def process_data(self, data: Dict[str, Any]) -> None:
        """Verarbeitet Daten und benachrichtigt Observer"""
        try:
            # Verarbeitung simulieren
            processed = {
                k: v.upper() if isinstance(v, str) else v
                for k, v in data.items()
            }
            
            self.notify(status="success", data=processed)
        except Exception as e:
            self.notify(status="error", error=str(e))

def main():
    """Hauptfunktion für das Beispiel"""
    
    # Komponenten registrieren
    register_strategy("data_validator", DataValidationStrategy)
    register_processor("data_processor", DataProcessor)
    register_handler("processing_handler", ProcessingHandler)
    
    # Kontext erstellen
    context = ExecutionContext()
    context.add_metadata("data", {
        "email": "test@example.com",
        "url": "https://example.com",
        "name": "Test User"
    })
    
    # Observer-Pattern demonstrieren
    subject = ProcessingSubject()
    observer = ProcessingObserver()
    subject.attach(observer)
    
    try:
        # Handler ausführen
        handler = registry.get_or_create(
            "handlers", "processing_handler"
        )
        result = handler.execute(context)
        logger.info(f"Verarbeitung erfolgreich: {result}")
        
        # Subject aktualisieren
        subject.process_data(context.metadata["data"])
        
    except Exception as e:
        logger.error(f"Fehler bei der Verarbeitung: {e}")
    finally:
        # Aufräumen
        registry.clear_instances()

if __name__ == "__main__":
    main() 