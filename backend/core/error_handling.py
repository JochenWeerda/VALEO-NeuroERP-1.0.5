from enum import Enum
from typing import Dict, Any, Optional

class ErrorCode(str, Enum):
    """Enum für Error Codes."""
    SYSTEM_ERROR = "SYSTEM_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    BUSINESS_ERROR = "BUSINESS_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"

class ErrorHandler:
    """Zentrale Fehlerbehandlung."""

    ERROR_MESSAGES = {
        "de": {
            "task_execution_failed": "Ausführung des Tasks fehlgeschlagen",
            "validation_error": "Validierungsfehler aufgetreten",
            "business_error": "Geschäftslogik-Fehler aufgetreten",
            "not_found": "Ressource nicht gefunden",
            "unauthorized": "Nicht autorisiert",
            "forbidden": "Zugriff verweigert"
        },
        "en": {
            "task_execution_failed": "Task execution failed",
            "validation_error": "Validation error occurred",
            "business_error": "Business logic error occurred",
            "not_found": "Resource not found",
            "unauthorized": "Unauthorized",
            "forbidden": "Access denied"
        }
    }

    @classmethod
    def create_error(
        cls,
        code: ErrorCode,
        message_key: str,
        detail: Optional[str] = None,
        language: str = "de"
    ) -> Dict[str, Any]:
        """Erstellt eine Fehlermeldung."""
        error = {
            "code": code,
            "message": cls.ERROR_MESSAGES[language][message_key],
            "message_key": message_key
        }

        if detail:
            error["detail"] = detail

        return error

    @classmethod
    def is_error(cls, obj: Dict[str, Any]) -> bool:
        """Prüft, ob ein Dictionary ein Fehler-Objekt ist."""
        return isinstance(obj, dict) and "code" in obj and "message" in obj 