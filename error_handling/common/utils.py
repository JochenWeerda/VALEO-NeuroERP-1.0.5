"""
Sammlung häufig verwendeter Funktionen und Hilfsmittel
"""

import os
import json
import logging
import time
from typing import Any, Dict, List, Optional, Callable, Union
from pathlib import Path
import hashlib
from datetime import datetime, timezone
import yaml

logger = logging.getLogger(__name__)

class FileUtils:
    """Hilfsfunktionen für Dateioperationen"""
    
    @staticmethod
    def ensure_dir(path: Union[str, Path]) -> None:
        """Stellt sicher, dass ein Verzeichnis existiert"""
        os.makedirs(str(path), exist_ok=True)
    
    @staticmethod
    def safe_write(path: Union[str, Path], content: str, mode: str = 'w') -> None:
        """Schreibt Inhalt sicher in eine Datei"""
        path = Path(path)
        FileUtils.ensure_dir(path.parent)
        
        temp_path = path.with_suffix('.tmp')
        try:
            with open(temp_path, mode) as f:
                f.write(content)
            temp_path.replace(path)
        except Exception as e:
            if temp_path.exists():
                temp_path.unlink()
            raise e
    
    @staticmethod
    def safe_read(path: Union[str, Path], default: Any = None) -> Optional[str]:
        """Liest sicher aus einer Datei"""
        try:
            with open(path, 'r') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Fehler beim Lesen von {path}: {e}")
            return default
    
    @staticmethod
    def get_file_hash(path: Union[str, Path]) -> str:
        """Berechnet den Hash einer Datei"""
        hash_md5 = hashlib.md5()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

class ConfigUtils:
    """Hilfsfunktionen für Konfigurationen"""
    
    @staticmethod
    def load_yaml(path: Union[str, Path]) -> Dict:
        """Lädt eine YAML-Datei"""
        with open(path, 'r') as f:
            return yaml.safe_load(f)
    
    @staticmethod
    def save_yaml(path: Union[str, Path], data: Dict) -> None:
        """Speichert eine YAML-Datei"""
        with open(path, 'w') as f:
            yaml.safe_dump(data, f, default_flow_style=False)
    
    @staticmethod
    def load_json(path: Union[str, Path]) -> Dict:
        """Lädt eine JSON-Datei"""
        with open(path, 'r') as f:
            return json.load(f)
    
    @staticmethod
    def save_json(path: Union[str, Path], data: Dict) -> None:
        """Speichert eine JSON-Datei"""
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    @staticmethod
    def merge_configs(*configs: Dict) -> Dict:
        """Führt mehrere Konfigurationen zusammen"""
        result = {}
        for config in configs:
            result.update(config)
        return result

class TimeUtils:
    """Hilfsfunktionen für Zeitoperationen"""
    
    @staticmethod
    def get_timestamp() -> str:
        """Gibt einen formatierten Zeitstempel zurück"""
        return datetime.now(timezone.utc).isoformat()
    
    @staticmethod
    def format_duration(seconds: float) -> str:
        """Formatiert eine Zeitdauer"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = int(seconds % 60)
        
        parts = []
        if hours > 0:
            parts.append(f"{hours}h")
        if minutes > 0 or hours > 0:
            parts.append(f"{minutes}m")
        parts.append(f"{seconds}s")
        
        return " ".join(parts)
    
    @staticmethod
    def parse_duration(duration: str) -> int:
        """Parst eine Zeitdauer-Zeichenkette"""
        units = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400
        }
        
        total = 0
        number = ''
        
        for char in duration:
            if char.isdigit():
                number += char
            elif char in units:
                if number:
                    total += int(number) * units[char]
                    number = ''
        
        if number:  # Keine Einheit = Sekunden
            total += int(number)
        
        return total

class ValidationUtils:
    """Hilfsfunktionen für Validierung"""
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Validiert eine E-Mail-Adresse"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Validiert eine URL"""
        import re
        pattern = r'^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$'
        return bool(re.match(pattern, url))
    
    @staticmethod
    def validate_type(value: Any, expected_type: type) -> bool:
        """Validiert einen Typ"""
        return isinstance(value, expected_type)
    
    @staticmethod
    def validate_range(value: Union[int, float], min_val: Optional[Union[int, float]] = None,
                      max_val: Optional[Union[int, float]] = None) -> bool:
        """Validiert einen Wertebereich"""
        if min_val is not None and value < min_val:
            return False
        if max_val is not None and value > max_val:
            return False
        return True

class LoggingUtils:
    """Hilfsfunktionen für Logging"""
    
    @staticmethod
    def setup_logging(
        level: int = logging.INFO,
        log_file: Optional[str] = None,
        format_string: Optional[str] = None
    ) -> None:
        """Richtet Logging ein"""
        if format_string is None:
            format_string = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        
        logging.basicConfig(
            level=level,
            format=format_string,
            handlers=[
                logging.StreamHandler(),
                *([] if log_file is None else [logging.FileHandler(log_file)])
            ]
        )
    
    @staticmethod
    def log_exception(logger: logging.Logger, e: Exception, context: Optional[Dict] = None) -> None:
        """Protokolliert eine Exception mit Kontext"""
        message = f"Exception: {type(e).__name__}: {str(e)}"
        if context:
            message += f"\nContext: {json.dumps(context, indent=2)}"
        logger.exception(message)

class CacheUtils:
    """Hilfsfunktionen für Caching"""
    
    @staticmethod
    def memoize(func: Callable) -> Callable:
        """Dekorator für Funktions-Memoization"""
        cache = {}
        
        def wrapper(*args, **kwargs):
            key = str((args, sorted(kwargs.items())))
            if key not in cache:
                cache[key] = func(*args, **kwargs)
            return cache[key]
        
        return wrapper
    
    @staticmethod
    def timed_cache(seconds: int) -> Callable:
        """Dekorator für zeitbasiertes Caching"""
        def decorator(func: Callable) -> Callable:
            cache = {}
            timestamps = {}
            
            def wrapper(*args, **kwargs):
                key = str((args, sorted(kwargs.items())))
                now = time.time()
                
                if key in cache and now - timestamps[key] < seconds:
                    return cache[key]
                
                result = func(*args, **kwargs)
                cache[key] = result
                timestamps[key] = now
                return result
            
            return wrapper
        return decorator

class SecurityUtils:
    """Hilfsfunktionen für Sicherheit"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hasht ein Passwort"""
        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                     salt, 100000)
        return salt.decode('ascii') + ':' + pwdhash.hex()
    
    @staticmethod
    def verify_password(stored_password: str, provided_password: str) -> bool:
        """Verifiziert ein Passwort"""
        salt, stored_hash = stored_password.split(':')
        pwdhash = hashlib.pbkdf2_hmac('sha512',
                                     provided_password.encode('utf-8'),
                                     salt.encode('ascii'),
                                     100000)
        return pwdhash.hex() == stored_hash
    
    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generiert einen sicheren Token"""
        return hashlib.sha256(os.urandom(length)).hexdigest()

class ConversionUtils:
    """Hilfsfunktionen für Konvertierungen"""
    
    @staticmethod
    def to_bool(value: Any) -> bool:
        """Konvertiert einen Wert zu bool"""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'y', 'on')
        if isinstance(value, (int, float)):
            return bool(value)
        return False
    
    @staticmethod
    def to_int(value: Any, default: Optional[int] = None) -> Optional[int]:
        """Konvertiert einen Wert zu int"""
        try:
            return int(value)
        except (ValueError, TypeError):
            return default
    
    @staticmethod
    def to_float(value: Any, default: Optional[float] = None) -> Optional[float]:
        """Konvertiert einen Wert zu float"""
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    
    @staticmethod
    def to_list(value: Any, separator: str = ',') -> List:
        """Konvertiert einen Wert zu einer Liste"""
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            return [x.strip() for x in value.split(separator)]
        if value is None:
            return []
        return [value] 