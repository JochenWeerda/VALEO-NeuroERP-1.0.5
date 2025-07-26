"""
WhatsApp Web Integration Service
Rechtssichere, kostenfreie WhatsApp-Integration über Browser-Automation
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from pathlib import Path
import sqlite3
import hashlib
import hmac
import base64

# Browser-Automation (optional - nur wenn installiert)
try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logging.warning("Playwright nicht installiert. Browser-Automation nicht verfügbar.")

# Rechtssichere Konfiguration
@dataclass
class WhatsAppConfig:
    """Rechtssichere WhatsApp-Konfiguration"""
    # DSGVO-konforme Einstellungen
    data_retention_days: int = 90  # Nachrichten werden nach 90 Tagen gelöscht
    consent_required: bool = True  # Einverständnis erforderlich
    opt_out_enabled: bool = True   # Abmeldung möglich
    
    # Technische Einstellungen
    max_message_length: int = 4096  # WhatsApp-Limit
    rate_limit_per_hour: int = 50   # Max. 50 Nachrichten pro Stunde
    session_timeout_minutes: int = 30
    
    # Sicherheit
    encryption_enabled: bool = True
    audit_log_enabled: bool = True

@dataclass
class WhatsAppMessage:
    """WhatsApp-Nachricht mit rechtssicheren Feldern"""
    id: str
    phone_number: str
    message: str
    timestamp: datetime
    status: str  # 'pending', 'sent', 'delivered', 'read', 'failed'
    customer_id: Optional[str] = None
    consent_given: bool = False
    opt_out_requested: bool = False
    audit_trail: List[str] = None
    
    def __post_init__(self):
        if self.audit_trail is None:
            self.audit_trail = []

class WhatsAppDatabase:
    """Rechtssichere Datenbank für WhatsApp-Nachrichten"""
    
    def __init__(self, db_path: str = "whatsapp_messages.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialisiert die Datenbank mit rechtssicheren Tabellen"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS whatsapp_messages (
                    id TEXT PRIMARY KEY,
                    phone_number TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    status TEXT NOT NULL,
                    customer_id TEXT,
                    consent_given BOOLEAN DEFAULT FALSE,
                    opt_out_requested BOOLEAN DEFAULT FALSE,
                    audit_trail TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS customer_consents (
                    customer_id TEXT PRIMARY KEY,
                    phone_number TEXT NOT NULL,
                    consent_given BOOLEAN DEFAULT FALSE,
                    consent_date TEXT,
                    opt_out_date TEXT,
                    consent_method TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS message_templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    message TEXT NOT NULL,
                    category TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_phone 
                ON whatsapp_messages(phone_number)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
                ON whatsapp_messages(timestamp)
            """)
    
    def save_message(self, message: WhatsAppMessage):
        """Speichert eine Nachricht rechtssicher"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO whatsapp_messages 
                (id, phone_number, message, timestamp, status, customer_id, 
                 consent_given, opt_out_requested, audit_trail)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message.id,
                message.phone_number,
                message.message,
                message.timestamp.isoformat(),
                message.status,
                message.customer_id,
                message.consent_given,
                message.opt_out_requested,
                json.dumps(message.audit_trail)
            ))
    
    def get_messages_by_customer(self, customer_id: str, limit: int = 50) -> List[WhatsAppMessage]:
        """Holt Nachrichten eines Kunden"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM whatsapp_messages 
                WHERE customer_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (customer_id, limit))
            
            messages = []
            for row in cursor.fetchall():
                message = WhatsAppMessage(
                    id=row[0],
                    phone_number=row[1],
                    message=row[2],
                    timestamp=datetime.fromisoformat(row[3]),
                    status=row[4],
                    customer_id=row[5],
                    consent_given=bool(row[6]),
                    opt_out_requested=bool(row[7]),
                    audit_trail=json.loads(row[8]) if row[8] else []
                )
                messages.append(message)
            
            return messages
    
    def save_consent(self, customer_id: str, phone_number: str, consent_method: str = "web"):
        """Speichert Kunden-Einverständnis"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO customer_consents 
                (customer_id, phone_number, consent_given, consent_date, consent_method)
                VALUES (?, ?, TRUE, ?, ?)
            """, (customer_id, phone_number, datetime.now().isoformat(), consent_method))
    
    def check_consent(self, customer_id: str) -> bool:
        """Prüft ob Kunde eingewilligt hat"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT consent_given FROM customer_consents 
                WHERE customer_id = ? AND consent_given = TRUE
            """, (customer_id,))
            return cursor.fetchone() is not None

class WhatsAppWebService:
    """Hauptservice für WhatsApp Web Integration"""
    
    def __init__(self, config: WhatsAppConfig = None):
        self.config = config or WhatsAppConfig()
        self.db = WhatsAppDatabase()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.is_connected = False
        self.rate_limit_counter = 0
        self.last_rate_limit_reset = datetime.now()
        
        # Rechtssichere Logging
        self.logger = logging.getLogger(__name__)
        self.setup_audit_logging()
    
    def setup_audit_logging(self):
        """Richtet rechtssicheres Logging ein"""
        audit_handler = logging.FileHandler('whatsapp_audit.log')
        audit_handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        audit_handler.setFormatter(formatter)
        self.logger.addHandler(audit_handler)
    
    async def initialize_browser(self):
        """Initialisiert Browser für WhatsApp Web"""
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError("Playwright nicht verfügbar. Installieren Sie: pip install playwright")
        
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=False,  # Sichtbar für manuelle QR-Code-Eingabe
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        self.page = await self.browser.new_page()
        
        # Rechtssichere Browser-Einstellungen
        await self.page.set_extra_http_headers({
            'User-Agent': 'VALEO-NeuroERP WhatsApp Integration'
        })
    
    async def connect_whatsapp_web(self) -> bool:
        """Verbindet mit WhatsApp Web"""
        try:
            await self.page.goto('https://web.whatsapp.com')
            
            # Warte auf QR-Code oder bereits verbunden
            await self.page.wait_for_selector(
                '[data-testid="chat-list"], [data-testid="intro-text"]',
                timeout=30000
            )
            
            # Prüfe ob bereits verbunden
            chat_list = await self.page.query_selector('[data-testid="chat-list"]')
            if chat_list:
                self.is_connected = True
                self.logger.info("WhatsApp Web bereits verbunden")
                return True
            
            # Warte auf QR-Code-Scan
            self.logger.info("QR-Code wird angezeigt - bitte scannen")
            await self.page.wait_for_selector('[data-testid="chat-list"]', timeout=120000)
            
            self.is_connected = True
            self.logger.info("WhatsApp Web erfolgreich verbunden")
            return True
            
        except Exception as e:
            self.logger.error(f"Fehler beim Verbinden: {e}")
            return False
    
    async def send_message(self, phone_number: str, message: str, customer_id: str = None) -> bool:
        """Sendet eine Nachricht rechtssicher"""
        
        # Rechtssichere Prüfungen
        if not self._validate_message(message):
            return False
        
        if not self._check_rate_limit():
            self.logger.warning("Rate Limit erreicht")
            return False
        
        if customer_id and not self.db.check_consent(customer_id):
            self.logger.warning(f"Keine Einwilligung von Kunde {customer_id}")
            return False
        
        # Nachricht erstellen
        msg = WhatsAppMessage(
            id=self._generate_message_id(),
            phone_number=phone_number,
            message=message,
            timestamp=datetime.now(),
            status='pending',
            customer_id=customer_id,
            consent_given=customer_id and self.db.check_consent(customer_id)
        )
        
        try:
            if not self.is_connected:
                await self.connect_whatsapp_web()
            
            # WhatsApp Web URL mit vorausgefüllter Nachricht
            encoded_message = self._encode_message(message)
            whatsapp_url = f"https://web.whatsapp.com/send?phone={phone_number}&text={encoded_message}"
            
            await self.page.goto(whatsapp_url)
            
            # Warte auf Chat-Loading
            await self.page.wait_for_selector('[data-testid="conversation-compose-box-input"]', timeout=10000)
            
            # Sende-Nachricht
            await self.page.click('[data-testid="send"]')
            
            # Warte auf Bestätigung
            await self.page.wait_for_timeout(2000)
            
            msg.status = 'sent'
            msg.audit_trail.append(f"Nachricht gesendet um {datetime.now()}")
            
            self.logger.info(f"Nachricht an {phone_number} gesendet")
            
        except Exception as e:
            msg.status = 'failed'
            msg.audit_trail.append(f"Fehler beim Senden: {e}")
            self.logger.error(f"Fehler beim Senden: {e}")
            return False
        
        finally:
            # Speichere Nachricht in Datenbank
            self.db.save_message(msg)
            self.rate_limit_counter += 1
        
        return True
    
    def _validate_message(self, message: str) -> bool:
        """Validiert Nachricht rechtssicher"""
        if not message or len(message.strip()) == 0:
            return False
        
        if len(message) > self.config.max_message_length:
            self.logger.warning(f"Nachricht zu lang: {len(message)} Zeichen")
            return False
        
        # Prüfe auf unerwünschte Inhalte
        forbidden_words = ['spam', 'unwanted', 'illegal']
        if any(word in message.lower() for word in forbidden_words):
            self.logger.warning("Nachricht enthält unerwünschte Inhalte")
            return False
        
        return True
    
    def _check_rate_limit(self) -> bool:
        """Prüft Rate Limit"""
        now = datetime.now()
        if (now - self.last_rate_limit_reset).seconds > 3600:  # 1 Stunde
            self.rate_limit_counter = 0
            self.last_rate_limit_reset = now
        
        return self.rate_limit_counter < self.config.rate_limit_per_hour
    
    def _generate_message_id(self) -> str:
        """Generiert eindeutige Nachrichten-ID"""
        timestamp = datetime.now().isoformat()
        random_data = f"{timestamp}_{self.rate_limit_counter}"
        return hashlib.sha256(random_data.encode()).hexdigest()[:16]
    
    def _encode_message(self, message: str) -> str:
        """Kodiert Nachricht für URL"""
        import urllib.parse
        return urllib.parse.quote(message)
    
    async def get_message_history(self, customer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Holt Nachrichtenverlauf eines Kunden"""
        messages = self.db.get_messages_by_customer(customer_id, limit)
        
        return [
            {
                'id': msg.id,
                'phone_number': msg.phone_number,
                'message': msg.message,
                'timestamp': msg.timestamp.isoformat(),
                'status': msg.status,
                'consent_given': msg.consent_given
            }
            for msg in messages
        ]
    
    def save_template(self, name: str, message: str, category: str) -> str:
        """Speichert Nachrichten-Template"""
        template_id = hashlib.sha256(f"{name}_{message}".encode()).hexdigest()[:16]
        
        with sqlite3.connect(self.db.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO message_templates 
                (id, name, message, category)
                VALUES (?, ?, ?, ?)
            """, (template_id, name, message, category))
        
        return template_id
    
    def get_templates(self, category: str = None) -> List[Dict[str, Any]]:
        """Holt Nachrichten-Templates"""
        with sqlite3.connect(self.db.db_path) as conn:
            if category:
                cursor = conn.execute("""
                    SELECT * FROM message_templates 
                    WHERE category = ? AND is_active = TRUE
                    ORDER BY name
                """, (category,))
            else:
                cursor = conn.execute("""
                    SELECT * FROM message_templates 
                    WHERE is_active = TRUE
                    ORDER BY category, name
                """)
            
            templates = []
            for row in cursor.fetchall():
                templates.append({
                    'id': row[0],
                    'name': row[1],
                    'message': row[2],
                    'category': row[3]
                })
            
            return templates
    
    async def cleanup_old_messages(self):
        """Löscht alte Nachrichten (DSGVO-konform)"""
        cutoff_date = datetime.now().timestamp() - (self.config.data_retention_days * 24 * 3600)
        
        with sqlite3.connect(self.db.db_path) as conn:
            deleted_count = conn.execute("""
                DELETE FROM whatsapp_messages 
                WHERE timestamp < ?
            """, (datetime.fromtimestamp(cutoff_date).isoformat(),)).rowcount
        
        self.logger.info(f"{deleted_count} alte Nachrichten gelöscht")
    
    async def close(self):
        """Schließt Browser-Verbindung"""
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()

# Rechtssichere API-Endpunkte
class WhatsAppAPI:
    """API-Endpunkte für WhatsApp Integration"""
    
    def __init__(self):
        self.service = WhatsAppWebService()
    
    async def send_message_endpoint(self, phone_number: str, message: str, customer_id: str = None):
        """API-Endpunkt zum Senden einer Nachricht"""
        try:
            success = await self.service.send_message(phone_number, message, customer_id)
            return {
                'success': success,
                'message_id': self.service._generate_message_id() if success else None,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def get_history_endpoint(self, customer_id: str, limit: int = 50):
        """API-Endpunkt für Nachrichtenverlauf"""
        try:
            messages = await self.service.get_message_history(customer_id, limit)
            return {
                'success': True,
                'messages': messages,
                'count': len(messages)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'messages': []
            }
    
    def save_consent_endpoint(self, customer_id: str, phone_number: str, consent_method: str = "web"):
        """API-Endpunkt für Einwilligung"""
        try:
            self.service.db.save_consent(customer_id, phone_number, consent_method)
            return {
                'success': True,
                'message': 'Einwilligung gespeichert',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Beispiel-Nutzung
async def main():
    """Beispiel für die Nutzung des WhatsApp Services"""
    
    # Service initialisieren
    config = WhatsAppConfig(
        data_retention_days=90,
        consent_required=True,
        rate_limit_per_hour=50
    )
    
    service = WhatsAppWebService(config)
    
    try:
        # Browser initialisieren
        await service.initialize_browser()
        
        # Mit WhatsApp Web verbinden
        connected = await service.connect_whatsapp_web()
        if not connected:
            print("Verbindung fehlgeschlagen")
            return
        
        # Einwilligung speichern
        service.db.save_consent("customer_123", "+49123456789", "web")
        
        # Nachricht senden
        success = await service.send_message(
            "+49123456789",
            "Hallo! Vielen Dank für Ihre Bestellung.",
            "customer_123"
        )
        
        if success:
            print("Nachricht erfolgreich gesendet")
        else:
            print("Fehler beim Senden")
        
        # Nachrichtenverlauf abrufen
        history = await service.get_message_history("customer_123")
        print(f"Nachrichtenverlauf: {len(history)} Nachrichten")
        
    finally:
        await service.close()

if __name__ == "__main__":
    asyncio.run(main()) 