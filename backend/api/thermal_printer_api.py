"""
VALEO NeuroERP - Thermal Printer API
API-Endpunkte für Thermal Printer Management und Web USB Direct Printing
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.thermal_printer_service import ThermalPrinterService, PrinterConfig, PrinterType

logger = logging.getLogger(__name__)

thermal_printer_bp = Blueprint('thermal_printer', __name__, url_prefix='/api/thermal-printer')

# Globaler Thermal Printer Service
thermal_printer_service: Optional[ThermalPrinterService] = None

def init_thermal_printer_service(db_connection):
    """Thermal Printer Service initialisieren"""
    global thermal_printer_service
    thermal_printer_service = ThermalPrinterService(db_connection)
    logger.info("Thermal Printer Service initialisiert")

# ============================================================================
# PRINTER MANAGEMENT ENDPOINTS
# ============================================================================

@thermal_printer_bp.route('/printers', methods=['GET'])
def get_printers():
    """Alle registrierten Printer abrufen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        printers = thermal_printer_service.get_all_printers()
        printer_list = []
        
        for printer in printers:
            status = thermal_printer_service.get_printer_status(printer.id)
            printer_list.append({
                "id": printer.id,
                "name": printer.name,
                "type": printer.type.value,
                "vendor_id": printer.vendor_id,
                "product_id": printer.product_id,
                "ip_address": printer.ip_address,
                "port": printer.port,
                "baud_rate": printer.baud_rate,
                "paper_width": printer.paper_width,
                "auto_cut": printer.auto_cut,
                "auto_open_drawer": printer.auto_open_drawer,
                "encoding": printer.encoding,
                "status": status.get("status", "unknown"),
                "last_seen": status.get("last_seen"),
                "pending_jobs": status.get("pending_jobs", 0)
            })
        
        return jsonify({
            "success": True,
            "data": printer_list,
            "message": f"{len(printer_list)} Printer gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Printer: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Printer: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers/<printer_id>', methods=['GET'])
def get_printer(printer_id: str):
    """Spezifischen Printer abrufen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        printer = thermal_printer_service.get_printer(printer_id)
        if not printer:
            return jsonify({
                "success": False,
                "message": "Printer nicht gefunden"
            }), 404
        
        status = thermal_printer_service.get_printer_status(printer_id)
        
        return jsonify({
            "success": True,
            "data": {
                "id": printer.id,
                "name": printer.name,
                "type": printer.type.value,
                "vendor_id": printer.vendor_id,
                "product_id": printer.product_id,
                "ip_address": printer.ip_address,
                "port": printer.port,
                "baud_rate": printer.baud_rate,
                "paper_width": printer.paper_width,
                "auto_cut": printer.auto_cut,
                "auto_open_drawer": printer.auto_open_drawer,
                "encoding": printer.encoding,
                "status": status.get("status", "unknown"),
                "last_seen": status.get("last_seen"),
                "pending_jobs": status.get("pending_jobs", 0)
            },
            "message": "Printer erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Printers: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen des Printers: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers', methods=['POST'])
def register_printer():
    """Neuen Printer registrieren"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        required_fields = ['name', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Feld '{field}' ist erforderlich"
                }), 400
        
        # Printer-Typ validieren
        try:
            printer_type = PrinterType(data['type'])
        except ValueError:
            return jsonify({
                "success": False,
                "message": f"Ungültiger Printer-Typ: {data['type']}"
            }), 400
        
        # Printer-Konfiguration erstellen
        config = PrinterConfig(
            id=data.get('id', f"printer_{len(thermal_printer_service.get_all_printers()) + 1}"),
            name=data['name'],
            type=printer_type,
            vendor_id=data.get('vendor_id'),
            product_id=data.get('product_id'),
            ip_address=data.get('ip_address'),
            port=data.get('port'),
            baud_rate=data.get('baud_rate'),
            paper_width=data.get('paper_width', 80),
            auto_cut=data.get('auto_cut', True),
            auto_open_drawer=data.get('auto_open_drawer', True),
            encoding=data.get('encoding', 'cp437')
        )
        
        result = thermal_printer_service.register_printer(config)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Registrieren des Printers: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Registrieren des Printers: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers/<printer_id>', methods=['PUT'])
def update_printer(printer_id: str):
    """Printer-Konfiguration aktualisieren"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Printer-Typ validieren falls vorhanden
        if 'type' in data:
            try:
                PrinterType(data['type'])
            except ValueError:
                return jsonify({
                    "success": False,
                    "message": f"Ungültiger Printer-Typ: {data['type']}"
                }), 400
        
        result = thermal_printer_service.update_printer(printer_id, data)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Printers: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Aktualisieren des Printers: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers/<printer_id>', methods=['DELETE'])
def delete_printer(printer_id: str):
    """Printer löschen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        result = thermal_printer_service.delete_printer(printer_id)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Printers: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Löschen des Printers: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers/<printer_id>/status', methods=['GET'])
def get_printer_status(printer_id: str):
    """Printer-Status abrufen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        status = thermal_printer_service.get_printer_status(printer_id)
        
        return jsonify({
            "success": True,
            "data": status,
            "message": "Printer-Status erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Printer-Status: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen des Printer-Status: {str(e)}"
        }), 500

# ============================================================================
# PRINT JOB ENDPOINTS
# ============================================================================

@thermal_printer_bp.route('/printers/<printer_id>/jobs', methods=['POST'])
def create_print_job(printer_id: str):
    """Print Job erstellen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        if 'content' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'content' ist erforderlich"
            }), 400
        
        content = data['content']
        job_type = data.get('job_type', 'receipt')
        
        result = thermal_printer_service.create_print_job(printer_id, content, job_type)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Print Jobs: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen des Print Jobs: {str(e)}"
        }), 500

@thermal_printer_bp.route('/printers/<printer_id>/jobs', methods=['GET'])
def get_print_jobs(printer_id: str):
    """Print Jobs für einen Printer abrufen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        status = request.args.get('status')
        jobs = thermal_printer_service.get_print_jobs(printer_id, status)
        
        return jsonify({
            "success": True,
            "data": jobs,
            "message": f"{len(jobs)} Print Jobs gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Print Jobs: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Print Jobs: {str(e)}"
        }), 500

@thermal_printer_bp.route('/jobs/<job_id>/status', methods=['PUT'])
def update_job_status(job_id: str):
    """Print Job Status aktualisieren"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        if 'status' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'status' ist erforderlich"
            }), 400
        
        status = data['status']
        error_message = data.get('error_message')
        
        result = thermal_printer_service.update_job_status(job_id, status, error_message)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Job-Status: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Aktualisieren des Job-Status: {str(e)}"
        }), 500

# ============================================================================
# RECEIPT GENERATION ENDPOINTS
# ============================================================================

@thermal_printer_bp.route('/printers/<printer_id>/receipt', methods=['POST'])
def print_receipt(printer_id: str):
    """Beleg drucken"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Transaktionsdaten bereitgestellt"
            }), 400
        
        # Beleg-Inhalt generieren
        receipt_content = thermal_printer_service.generate_receipt_content(data)
        
        # Print Job erstellen
        result = thermal_printer_service.create_print_job(printer_id, receipt_content, 'receipt')
        
        if result["success"]:
            return jsonify({
                "success": True,
                "job_id": result["job_id"],
                "message": "Beleg erfolgreich zum Drucken gesendet",
                "content_preview": receipt_content[:200] + "..." if len(receipt_content) > 200 else receipt_content
            }), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Drucken des Belegs: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Drucken des Belegs: {str(e)}"
        }), 500

# ============================================================================
# WEB USB INTEGRATION ENDPOINTS
# ============================================================================

@thermal_printer_bp.route('/usb/devices', methods=['GET'])
def get_usb_devices():
    """Verfügbare USB-Geräte abrufen (für Web USB Integration)"""
    try:
        # Diese Endpunkte dienen der Web USB Integration
        # Die eigentliche USB-Geräte-Erkennung erfolgt im Frontend
        
        return jsonify({
            "success": True,
            "message": "USB-Geräte-Erkennung erfolgt im Frontend über Web USB API",
            "data": {
                "supported_vendors": [
                    {"vendor_id": "0483", "name": "STMicroelectronics"},
                    {"vendor_id": "04b8", "name": "Epson"},
                    {"vendor_id": "0525", "name": "NetChip Technology"},
                    {"vendor_id": "1a86", "name": "QinHeng Electronics"}
                ],
                "supported_products": [
                    {"product_id": "5740", "name": "Thermal Printer"},
                    {"product_id": "5741", "name": "ESC/POS Printer"}
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der USB-Geräte: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der USB-Geräte: {str(e)}"
        }), 500

@thermal_printer_bp.route('/usb/connect', methods=['POST'])
def connect_usb_printer():
    """USB-Printer Verbindung herstellen"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine USB-Gerätedaten bereitgestellt"
            }), 400
        
        # USB-Gerätedaten validieren
        vendor_id = data.get('vendor_id')
        product_id = data.get('product_id')
        device_name = data.get('name', f"USB Printer {vendor_id}:{product_id}")
        
        if not vendor_id or not product_id:
            return jsonify({
                "success": False,
                "message": "vendor_id und product_id sind erforderlich"
            }), 400
        
        # Printer-Konfiguration erstellen
        config = PrinterConfig(
            id=f"usb_{vendor_id}_{product_id}",
            name=device_name,
            type=PrinterType.USB,
            vendor_id=vendor_id,
            product_id=product_id,
            paper_width=data.get('paper_width', 80),
            auto_cut=data.get('auto_cut', True),
            auto_open_drawer=data.get('auto_open_drawer', True),
            encoding=data.get('encoding', 'cp437')
        )
        
        result = thermal_printer_service.register_printer(config)
        
        if result["success"]:
            return jsonify({
                "success": True,
                "printer_id": config.id,
                "message": f"USB-Printer {device_name} erfolgreich verbunden"
            }), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Verbinden des USB-Printers: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Verbinden des USB-Printers: {str(e)}"
        }), 500

# ============================================================================
# LOGGING ENDPOINTS
# ============================================================================

@thermal_printer_bp.route('/printers/<printer_id>/logs', methods=['GET'])
def get_printer_logs(printer_id: str):
    """Printer-Logs abrufen"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        limit = request.args.get('limit', 100, type=int)
        logs = thermal_printer_service.get_printer_logs(printer_id, limit)
        
        return jsonify({
            "success": True,
            "data": logs,
            "message": f"{len(logs)} Log-Einträge gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Printer-Logs: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Printer-Logs: {str(e)}"
        }), 500

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@thermal_printer_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für Thermal Printer Service"""
    try:
        if not thermal_printer_service:
            return jsonify({
                "success": False,
                "message": "Thermal Printer Service nicht initialisiert"
            }), 500
        
        printers = thermal_printer_service.get_all_printers()
        total_jobs = len(thermal_printer_service.get_print_jobs())
        
        return jsonify({
            "success": True,
            "service": "thermal_printer",
            "status": "healthy",
            "data": {
                "registered_printers": len(printers),
                "total_print_jobs": total_jobs,
                "active_jobs": len(thermal_printer_service.active_jobs)
            },
            "message": "Thermal Printer Service läuft normal"
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            "success": False,
            "service": "thermal_printer",
            "status": "unhealthy",
            "message": f"Service-Fehler: {str(e)}"
        }), 500 