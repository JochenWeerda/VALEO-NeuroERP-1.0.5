"""
VALEO NeuroERP - Thermal Printer Service
Web USB Direct Printing für POS-System
Adaptiert von Lakasir's Printer Management
"""
import logging
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import json
import asyncio
from decimal import Decimal

logger = logging.getLogger(__name__)

class PrinterType(Enum):
    """Thermal Printer Typen"""
    USB = "usb"
    NETWORK = "network"
    BLUETOOTH = "bluetooth"
    SERIAL = "serial"

class PrinterStatus(Enum):
    """Printer Status"""
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
    BUSY = "busy"

@dataclass
class PrinterConfig:
    """Printer Konfiguration"""
    id: str
    name: str
    type: PrinterType
    vendor_id: Optional[str] = None
    product_id: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    baud_rate: Optional[int] = None
    paper_width: int = 80  # mm
    auto_cut: bool = True
    auto_open_drawer: bool = True
    encoding: str = "cp437"  # ESC/POS encoding

@dataclass
class PrintJob:
    """Print Job"""
    id: str
    printer_id: str
    content: str
    job_type: str  # receipt, label, report
    status: str  # pending, printing, completed, failed
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ThermalPrinterService:
    """Thermal Printer Service für Web USB Direct Printing"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.printers: Dict[str, PrinterConfig] = {}
        self.active_jobs: Dict[str, PrintJob] = {}
        self._initialize_database()
        self._load_printers()
    
    def _initialize_database(self):
        """Datenbank-Tabellen für Printer Management erstellen"""
        try:
            # Printers Tabelle
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS thermal_printers (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    vendor_id VARCHAR(50),
                    product_id VARCHAR(50),
                    ip_address VARCHAR(45),
                    port INTEGER,
                    baud_rate INTEGER,
                    paper_width INTEGER DEFAULT 80,
                    auto_cut BOOLEAN DEFAULT TRUE,
                    auto_open_drawer BOOLEAN DEFAULT TRUE,
                    encoding VARCHAR(20) DEFAULT 'cp437',
                    status VARCHAR(20) DEFAULT 'offline',
                    last_seen TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Print Jobs Tabelle
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS print_jobs (
                    id VARCHAR(50) PRIMARY KEY,
                    printer_id VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    job_type VARCHAR(20) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    error_message TEXT,
                    FOREIGN KEY (printer_id) REFERENCES thermal_printers(id) ON DELETE CASCADE
                )
            """)
            
            # Printer Logs Tabelle
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS printer_logs (
                    id SERIAL PRIMARY KEY,
                    printer_id VARCHAR(50) NOT NULL,
                    action VARCHAR(50) NOT NULL,
                    message TEXT,
                    status VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (printer_id) REFERENCES thermal_printers(id) ON DELETE CASCADE
                )
            """)
            
            self.db.commit()
            logger.info("Thermal Printer Datenbank-Tabellen erstellt")
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Printer-Tabellen: {e}")
            self.db.rollback()
    
    def _load_printers(self):
        """Gespeicherte Printer aus Datenbank laden"""
        try:
            cursor = self.db.execute("SELECT * FROM thermal_printers")
            for row in cursor.fetchall():
                printer = PrinterConfig(
                    id=row[0],
                    name=row[1],
                    type=PrinterType(row[2]),
                    vendor_id=row[3],
                    product_id=row[4],
                    ip_address=row[5],
                    port=row[6],
                    baud_rate=row[7],
                    paper_width=row[8],
                    auto_cut=row[9],
                    auto_open_drawer=row[10],
                    encoding=row[11]
                )
                self.printers[printer.id] = printer
            logger.info(f"{len(self.printers)} Printer aus Datenbank geladen")
        except Exception as e:
            logger.error(f"Fehler beim Laden der Printer: {e}")
    
    def register_printer(self, config: PrinterConfig) -> Dict[str, Any]:
        """Neuen Printer registrieren"""
        try:
            # Printer in Datenbank speichern
            self.db.execute("""
                INSERT INTO thermal_printers 
                (id, name, type, vendor_id, product_id, ip_address, port, baud_rate, 
                 paper_width, auto_cut, auto_open_drawer, encoding)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                config.id, config.name, config.type.value, config.vendor_id,
                config.product_id, config.ip_address, config.port, config.baud_rate,
                config.paper_width, config.auto_cut, config.auto_open_drawer, config.encoding
            ))
            
            self.db.commit()
            self.printers[config.id] = config
            
            # Log erstellen
            self._log_printer_action(config.id, "register", f"Printer {config.name} registriert")
            
            logger.info(f"Printer {config.name} erfolgreich registriert")
            return {
                "success": True,
                "message": f"Printer {config.name} erfolgreich registriert",
                "printer_id": config.id
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Registrieren des Printers: {e}")
            self.db.rollback()
            return {
                "success": False,
                "message": f"Fehler beim Registrieren: {str(e)}"
            }
    
    def update_printer(self, printer_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Printer-Konfiguration aktualisieren"""
        try:
            # Erlaubte Felder für Updates
            allowed_fields = {
                'name', 'ip_address', 'port', 'baud_rate', 'paper_width',
                'auto_cut', 'auto_open_drawer', 'encoding'
            }
            
            update_fields = []
            update_values = []
            
            for field, value in updates.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    update_values.append(value)
            
            if not update_fields:
                return {
                    "success": False,
                    "message": "Keine gültigen Felder zum Aktualisieren"
                }
            
            update_values.append(printer_id)
            
            self.db.execute(f"""
                UPDATE thermal_printers 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, update_values)
            
            self.db.commit()
            
            # Lokale Konfiguration aktualisieren
            if printer_id in self.printers:
                for field, value in updates.items():
                    if hasattr(self.printers[printer_id], field):
                        setattr(self.printers[printer_id], field, value)
            
            self._log_printer_action(printer_id, "update", "Printer-Konfiguration aktualisiert")
            
            return {
                "success": True,
                "message": "Printer erfolgreich aktualisiert"
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren des Printers: {e}")
            self.db.rollback()
            return {
                "success": False,
                "message": f"Fehler beim Aktualisieren: {str(e)}"
            }
    
    def delete_printer(self, printer_id: str) -> Dict[str, Any]:
        """Printer löschen"""
        try:
            # Prüfen ob Printer existiert
            cursor = self.db.execute("SELECT name FROM thermal_printers WHERE id = ?", (printer_id,))
            printer = cursor.fetchone()
            
            if not printer:
                return {
                    "success": False,
                    "message": "Printer nicht gefunden"
                }
            
            # Printer löschen (CASCADE löscht auch Jobs und Logs)
            self.db.execute("DELETE FROM thermal_printers WHERE id = ?", (printer_id,))
            self.db.commit()
            
            # Aus lokalem Cache entfernen
            if printer_id in self.printers:
                del self.printers[printer_id]
            
            self._log_printer_action(printer_id, "delete", f"Printer {printer[0]} gelöscht")
            
            return {
                "success": True,
                "message": f"Printer {printer[0]} erfolgreich gelöscht"
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Löschen des Printers: {e}")
            self.db.rollback()
            return {
                "success": False,
                "message": f"Fehler beim Löschen: {str(e)}"
            }
    
    def get_printer(self, printer_id: str) -> Optional[PrinterConfig]:
        """Printer-Konfiguration abrufen"""
        return self.printers.get(printer_id)
    
    def get_all_printers(self) -> List[PrinterConfig]:
        """Alle Printer abrufen"""
        return list(self.printers.values())
    
    def get_printer_status(self, printer_id: str) -> Dict[str, Any]:
        """Printer-Status abrufen"""
        try:
            cursor = self.db.execute("""
                SELECT status, last_seen, 
                       (SELECT COUNT(*) FROM print_jobs WHERE printer_id = ? AND status = 'pending') as pending_jobs
                FROM thermal_printers WHERE id = ?
            """, (printer_id, printer_id))
            
            result = cursor.fetchone()
            if result:
                return {
                    "printer_id": printer_id,
                    "status": result[0],
                    "last_seen": result[1],
                    "pending_jobs": result[2]
                }
            else:
                return {
                    "printer_id": printer_id,
                    "status": "not_found",
                    "last_seen": None,
                    "pending_jobs": 0
                }
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Printer-Status: {e}")
            return {
                "printer_id": printer_id,
                "status": "error",
                "last_seen": None,
                "pending_jobs": 0,
                "error": str(e)
            }
    
    def create_print_job(self, printer_id: str, content: str, job_type: str = "receipt") -> Dict[str, Any]:
        """Print Job erstellen"""
        try:
            import uuid
            job_id = str(uuid.uuid4())
            
            # Job in Datenbank speichern
            self.db.execute("""
                INSERT INTO print_jobs (id, printer_id, content, job_type, status)
                VALUES (?, ?, ?, ?, 'pending')
            """, (job_id, printer_id, content, job_type))
            
            self.db.commit()
            
            # Job-Objekt erstellen
            job = PrintJob(
                id=job_id,
                printer_id=printer_id,
                content=content,
                job_type=job_type,
                status="pending",
                created_at=datetime.now()
            )
            
            self.active_jobs[job_id] = job
            
            logger.info(f"Print Job {job_id} für Printer {printer_id} erstellt")
            return {
                "success": True,
                "job_id": job_id,
                "message": "Print Job erfolgreich erstellt"
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Print Jobs: {e}")
            self.db.rollback()
            return {
                "success": False,
                "message": f"Fehler beim Erstellen des Print Jobs: {str(e)}"
            }
    
    def get_print_jobs(self, printer_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Print Jobs abrufen"""
        try:
            query = "SELECT * FROM print_jobs WHERE 1=1"
            params = []
            
            if printer_id:
                query += " AND printer_id = ?"
                params.append(printer_id)
            
            if status:
                query += " AND status = ?"
                params.append(status)
            
            query += " ORDER BY created_at DESC"
            
            cursor = self.db.execute(query, params)
            jobs = []
            
            for row in cursor.fetchall():
                jobs.append({
                    "id": row[0],
                    "printer_id": row[1],
                    "content": row[2],
                    "job_type": row[3],
                    "status": row[4],
                    "created_at": row[5],
                    "completed_at": row[6],
                    "error_message": row[7]
                })
            
            return jobs
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Print Jobs: {e}")
            return []
    
    def update_job_status(self, job_id: str, status: str, error_message: Optional[str] = None) -> Dict[str, Any]:
        """Print Job Status aktualisieren"""
        try:
            update_fields = ["status = ?"]
            params = [status]
            
            if status in ["completed", "failed"]:
                update_fields.append("completed_at = CURRENT_TIMESTAMP")
            
            if error_message:
                update_fields.append("error_message = ?")
                params.append(error_message)
            
            params.append(job_id)
            
            self.db.execute(f"""
                UPDATE print_jobs 
                SET {', '.join(update_fields)}
                WHERE id = ?
            """, params)
            
            self.db.commit()
            
            # Lokalen Job-Status aktualisieren
            if job_id in self.active_jobs:
                self.active_jobs[job_id].status = status
                if status in ["completed", "failed"]:
                    self.active_jobs[job_id].completed_at = datetime.now()
                if error_message:
                    self.active_jobs[job_id].error_message = error_message
            
            return {
                "success": True,
                "message": f"Job Status auf {status} aktualisiert"
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren des Job-Status: {e}")
            self.db.rollback()
            return {
                "success": False,
                "message": f"Fehler beim Aktualisieren: {str(e)}"
            }
    
    def generate_receipt_content(self, transaction_data: Dict[str, Any]) -> str:
        """Beleg-Inhalt für Thermal Printer generieren"""
        try:
            # ESC/POS Befehle für Thermal Printer
            ESC = "\x1B"
            GS = "\x1D"
            
            content = []
            
            # Header
            content.append(f"{ESC}@")  # Initialize printer
            content.append(f"{ESC}!{chr(0)}")  # Normal text size
            content.append(f"{ESC}a{chr(1)}")  # Center alignment
            
            # Firmen-Header
            content.append("VALEO NeuroERP\n")
            content.append("Kassensystem\n")
            content.append("=" * 32 + "\n")
            
            # Transaktions-Details
            content.append(f"{ESC}a{chr(0)}")  # Left alignment
            content.append(f"Beleg-Nr: {transaction_data.get('receipt_number', 'N/A')}\n")
            content.append(f"Datum: {transaction_data.get('date', 'N/A')}\n")
            content.append(f"Zeit: {transaction_data.get('time', 'N/A')}\n")
            content.append(f"Kasse: {transaction_data.get('register_id', 'N/A')}\n")
            content.append(f"Kassierer: {transaction_data.get('cashier_name', 'N/A')}\n")
            content.append("-" * 32 + "\n")
            
            # Artikel-Liste
            content.append("ARTIKEL\n")
            content.append("-" * 32 + "\n")
            
            items = transaction_data.get('items', [])
            total = Decimal('0.00')
            
            for item in items:
                name = item.get('name', 'Unbekannt')[:20]  # Max 20 Zeichen
                quantity = item.get('quantity', 0)
                unit_price = Decimal(str(item.get('unit_price', '0.00')))
                item_total = unit_price * quantity
                total += item_total
                
                content.append(f"{name}\n")
                content.append(f"  {quantity} x {unit_price:.2f}€ = {item_total:.2f}€\n")
            
            content.append("-" * 32 + "\n")
            
            # Summen
            subtotal = total
            tax_rate = Decimal(str(transaction_data.get('tax_rate', '0.19')))
            tax_amount = subtotal * tax_rate
            discount = Decimal(str(transaction_data.get('discount', '0.00')))
            final_total = subtotal + tax_amount - discount
            
            content.append(f"Zwischensumme: {subtotal:.2f}€\n")
            content.append(f"MwSt ({tax_rate*100:.0f}%): {tax_amount:.2f}€\n")
            if discount > 0:
                content.append(f"Rabatt: -{discount:.2f}€\n")
            content.append(f"{ESC}!{chr(17)}")  # Bold text
            content.append(f"GESAMT: {final_total:.2f}€\n")
            content.append(f"{ESC}!{chr(0)}")  # Normal text
            
            # Zahlungsmethode
            payment_method = transaction_data.get('payment_method', 'Unbekannt')
            content.append(f"Zahlung: {payment_method}\n")
            
            # Footer
            content.append("-" * 32 + "\n")
            content.append(f"{ESC}a{chr(1)}")  # Center alignment
            content.append("Vielen Dank für Ihren Einkauf!\n")
            content.append("TSE-Nr: " + transaction_data.get('tse_number', 'N/A') + "\n")
            content.append("TSE-Signatur: " + transaction_data.get('tse_signature', 'N/A')[:20] + "...\n")
            content.append("=" * 32 + "\n")
            
            # Cut paper
            if self.printers.get(transaction_data.get('printer_id')).auto_cut:
                content.append(f"{GS}V{chr(1)}")  # Full cut
            
            return "".join(content)
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Beleg-Inhalts: {e}")
            return f"Fehler beim Generieren des Belegs: {str(e)}"
    
    def _log_printer_action(self, printer_id: str, action: str, message: str, status: str = "info"):
        """Printer-Aktion loggen"""
        try:
            self.db.execute("""
                INSERT INTO printer_logs (printer_id, action, message, status)
                VALUES (?, ?, ?, ?)
            """, (printer_id, action, message, status))
            self.db.commit()
        except Exception as e:
            logger.error(f"Fehler beim Loggen der Printer-Aktion: {e}")
    
    def get_printer_logs(self, printer_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Printer-Logs abrufen"""
        try:
            query = "SELECT * FROM printer_logs"
            params = []
            
            if printer_id:
                query += " WHERE printer_id = ?"
                params.append(printer_id)
            
            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)
            
            cursor = self.db.execute(query, params)
            logs = []
            
            for row in cursor.fetchall():
                logs.append({
                    "id": row[0],
                    "printer_id": row[1],
                    "action": row[2],
                    "message": row[3],
                    "status": row[4],
                    "created_at": row[5]
                })
            
            return logs
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Printer-Logs: {e}")
            return [] 