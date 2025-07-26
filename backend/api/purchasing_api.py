"""
VALEO NeuroERP - Purchasing Management API
API-Endpunkte für Einkaufsmodul und Bestellungen
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.purchasing_system import PurchasingSystem

logger = logging.getLogger(__name__)

purchasing_bp = Blueprint('purchasing', __name__, url_prefix='/api/purchasing')

# Globaler Purchasing System
purchasing_system: Optional[PurchasingSystem] = None

def init_purchasing_system(db_connection):
    """Purchasing System initialisieren"""
    global purchasing_system
    purchasing_system = PurchasingSystem(db_connection)
    logger.info("Purchasing System initialisiert")

# ============================================================================
# SUPPLIER MANAGEMENT ENDPOINTS
# ============================================================================

@purchasing_bp.route('/suppliers', methods=['GET'])
def get_suppliers():
    """Alle Lieferanten abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        suppliers = purchasing_system.get_all_suppliers(active_only)
        
        return jsonify({
            "success": True,
            "data": suppliers,
            "message": f"{len(suppliers)} Lieferanten gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Lieferanten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Lieferanten: {str(e)}"
        }), 500

@purchasing_bp.route('/suppliers/<supplier_id>', methods=['GET'])
def get_supplier(supplier_id: str):
    """Spezifischen Lieferanten abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        supplier = purchasing_system.get_supplier(supplier_id)
        if not supplier:
            return jsonify({
                "success": False,
                "message": "Lieferant nicht gefunden"
            }), 404
        
        return jsonify({
            "success": True,
            "data": supplier,
            "message": "Lieferant erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Lieferanten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen des Lieferanten: {str(e)}"
        }), 500

@purchasing_bp.route('/suppliers', methods=['POST'])
def create_supplier():
    """Neuen Lieferanten erstellen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        if 'name' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'name' ist erforderlich"
            }), 400
        
        result = purchasing_system.create_supplier(data)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Lieferanten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen des Lieferanten: {str(e)}"
        }), 500

@purchasing_bp.route('/suppliers/<supplier_id>', methods=['PUT'])
def update_supplier(supplier_id: str):
    """Lieferant aktualisieren"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        result = purchasing_system.update_supplier(supplier_id, data)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Lieferanten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Aktualisieren des Lieferanten: {str(e)}"
        }), 500

@purchasing_bp.route('/suppliers/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id: str):
    """Lieferant löschen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        result = purchasing_system.delete_supplier(supplier_id)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Lieferanten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Löschen des Lieferanten: {str(e)}"
        }), 500

# ============================================================================
# PURCHASE ORDER MANAGEMENT ENDPOINTS
# ============================================================================

@purchasing_bp.route('/orders', methods=['GET'])
def get_purchase_orders():
    """Alle Bestellungen abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        status = request.args.get('status')
        supplier_id = request.args.get('supplier_id')
        
        orders = purchasing_system.get_all_purchase_orders(status, supplier_id)
        
        return jsonify({
            "success": True,
            "data": orders,
            "message": f"{len(orders)} Bestellungen gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Bestellungen: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Bestellungen: {str(e)}"
        }), 500

@purchasing_bp.route('/orders/<order_id>', methods=['GET'])
def get_purchase_order(order_id: str):
    """Spezifische Bestellung abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        order = purchasing_system.get_purchase_order(order_id)
        if not order:
            return jsonify({
                "success": False,
                "message": "Bestellung nicht gefunden"
            }), 404
        
        return jsonify({
            "success": True,
            "data": order,
            "message": "Bestellung erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Bestellung: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Bestellung: {str(e)}"
        }), 500

@purchasing_bp.route('/orders', methods=['POST'])
def create_purchase_order():
    """Neue Bestellung erstellen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        required_fields = ['supplier_id', 'supplier_name', 'order_date', 'expected_delivery_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Feld '{field}' ist erforderlich"
                }), 400
        
        result = purchasing_system.create_purchase_order(data)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Bestellung: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen der Bestellung: {str(e)}"
        }), 500

@purchasing_bp.route('/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id: str):
    """Bestellstatus aktualisieren"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'status' ist erforderlich"
            }), 400
        
        updated_by = data.get('updated_by', 'system')
        result = purchasing_system.update_purchase_order_status(order_id, data['status'], updated_by)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Bestellstatus: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Aktualisieren des Bestellstatus: {str(e)}"
        }), 500

@purchasing_bp.route('/orders/<order_id>/receive', methods=['POST'])
def receive_items(order_id: str):
    """Artikel empfangen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data or 'items' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'items' ist erforderlich"
            }), 400
        
        updated_by = data.get('updated_by', 'system')
        result = purchasing_system.receive_items(order_id, data['items'], updated_by)
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Empfangen der Artikel: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Empfangen der Artikel: {str(e)}"
        }), 500

# ============================================================================
# PURCHASE RECEIPT MANAGEMENT ENDPOINTS
# ============================================================================

@purchasing_bp.route('/receipts', methods=['GET'])
def get_purchase_receipts():
    """Eingangsrechnungen abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        purchase_order_id = request.args.get('purchase_order_id')
        receipts = purchasing_system.get_purchase_receipts(purchase_order_id)
        
        return jsonify({
            "success": True,
            "data": receipts,
            "message": f"{len(receipts)} Eingangsrechnungen gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Eingangsrechnungen: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Eingangsrechnungen: {str(e)}"
        }), 500

@purchasing_bp.route('/receipts', methods=['POST'])
def create_purchase_receipt():
    """Eingangsrechnung erstellen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        required_fields = ['purchase_order_id', 'receipt_date', 'supplier_id', 'supplier_name', 
                          'subtotal', 'tax_amount', 'total_amount', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Feld '{field}' ist erforderlich"
                }), 400
        
        result = purchasing_system.create_purchase_receipt(data)
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Eingangsrechnung: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen der Eingangsrechnung: {str(e)}"
        }), 500

# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@purchasing_bp.route('/statistics', methods=['GET'])
def get_purchasing_statistics():
    """Purchasing-Statistiken abrufen"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        stats = purchasing_system.get_purchasing_statistics()
        
        return jsonify({
            "success": True,
            "data": stats,
            "message": "Purchasing-Statistiken erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Purchasing-Statistiken: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Statistiken: {str(e)}"
        }), 500

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@purchasing_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für Purchasing System"""
    try:
        if not purchasing_system:
            return jsonify({
                "success": False,
                "message": "Purchasing System nicht initialisiert"
            }), 500
        
        # Einfache Statistik als Health-Check
        stats = purchasing_system.get_purchasing_statistics()
        
        return jsonify({
            "success": True,
            "service": "purchasing",
            "status": "healthy",
            "data": {
                "open_orders": stats.get("open_orders", 0),
                "overdue_orders": stats.get("overdue_orders", 0),
                "open_receipts": stats.get("open_receipts", 0),
                "overdue_receipts": stats.get("overdue_receipts", 0)
            },
            "message": "Purchasing System läuft normal"
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            "success": False,
            "service": "purchasing",
            "status": "unhealthy",
            "message": f"Service-Fehler: {str(e)}"
        }), 500 