"""
VALEO NeuroERP - Barcode API
API-Endpunkte für Barcode-Funktionalität
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.barcode_service import BarcodeService, BarcodeType

logger = logging.getLogger(__name__)

barcode_bp = Blueprint('barcode', __name__, url_prefix='/api/barcode')

# Globaler Barcode Service
barcode_service: Optional[BarcodeService] = None

def get_barcode_service():
    """Holt den globalen Barcode Service"""
    global barcode_service
    if barcode_service is None:
        from ..database.connection import get_db_connection
        db_conn = get_db_connection()
        barcode_service = BarcodeService(db_conn)
    return barcode_service

@barcode_bp.route('/lookup/<barcode>', methods=['GET'])
def lookup_product(barcode: str):
    """
    Sucht einen Artikel anhand des Barcodes
    
    Args:
        barcode: Der zu suchende Barcode
        
    Returns:
        JSON mit Artikel-Daten oder Fehlermeldung
    """
    try:
        service = get_barcode_service()
        product = service.lookup_product_by_barcode(barcode)
        
        if product:
            return jsonify({
                'success': True,
                'data': product,
                'message': 'Artikel gefunden'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Kein Artikel mit Barcode {barcode} gefunden'
            }), 404
    except Exception as e:
        logger.error(f"Fehler beim Barcode-Lookup: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/register', methods=['POST'])
def register_barcode():
    """
    Registriert einen neuen Barcode für einen Artikel
    
    Request Body:
        artikel_nr: Artikelnummer
        barcode: Barcode-String
        barcode_type: Typ des Barcodes (optional, default: EAN13)
        
    Returns:
        JSON mit Erfolgsmeldung oder Fehlermeldung
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Keine Daten übermittelt'
            }), 400
        
        artikel_nr = data.get('artikel_nr')
        barcode = data.get('barcode')
        barcode_type_str = data.get('barcode_type', 'EAN13')
        
        if not artikel_nr or not barcode:
            return jsonify({
                'success': False,
                'message': 'artikel_nr und barcode sind erforderlich'
            }), 400
        
        # Barcode-Typ validieren
        try:
            barcode_type = BarcodeType(barcode_type_str)
        except ValueError:
            return jsonify({
                'success': False,
                'message': f'Ungültiger Barcode-Typ: {barcode_type_str}'
            }), 400
        
        service = get_barcode_service()
        
        # Barcode validieren
        if not service.validate_barcode(barcode, barcode_type):
            return jsonify({
                'success': False,
                'message': f'Ungültiger Barcode: {barcode}'
            }), 400
        
        # Barcode registrieren
        if service.register_barcode(artikel_nr, barcode, barcode_type):
            return jsonify({
                'success': True,
                'message': f'Barcode {barcode} für Artikel {artikel_nr} registriert'
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Fehler beim Registrieren des Barcodes'
            }), 500
    except Exception as e:
        logger.error(f"Fehler beim Registrieren des Barcodes: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/deactivate/<barcode>', methods=['PUT'])
def deactivate_barcode(barcode: str):
    """
    Deaktiviert einen Barcode
    
    Args:
        barcode: Der zu deaktivierende Barcode
        
    Returns:
        JSON mit Erfolgsmeldung oder Fehlermeldung
    """
    try:
        service = get_barcode_service()
        
        if service.deactivate_barcode(barcode):
            return jsonify({
                'success': True,
                'message': f'Barcode {barcode} deaktiviert'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Fehler beim Deaktivieren des Barcodes'
            }), 500
    except Exception as e:
        logger.error(f"Fehler beim Deaktivieren des Barcodes: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/article/<artikel_nr>', methods=['GET'])
def get_barcodes_for_article(artikel_nr: str):
    """
    Holt alle Barcodes für einen Artikel
    
    Args:
        artikel_nr: Artikelnummer
        
    Returns:
        JSON mit Liste der Barcodes
    """
    try:
        service = get_barcode_service()
        barcodes = service.get_barcodes_for_article(artikel_nr)
        
        # Dataclass zu Dict konvertieren
        barcode_list = []
        for barcode in barcodes:
            barcode_list.append({
                'barcode': barcode.barcode,
                'barcode_type': barcode.barcode_type.value,
                'artikel_nr': barcode.artikel_nr,
                'bezeichnung': barcode.bezeichnung,
                'aktiv': barcode.aktiv,
                'erstellt_am': barcode.erstellt_am
            })
        
        return jsonify({
            'success': True,
            'data': barcode_list,
            'message': f'{len(barcode_list)} Barcodes für Artikel {artikel_nr} gefunden'
        }), 200
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Barcodes: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/validate', methods=['POST'])
def validate_barcode():
    """
    Validiert einen Barcode
    
    Request Body:
        barcode: Barcode-String
        barcode_type: Typ des Barcodes
        
    Returns:
        JSON mit Validierungsergebnis
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Keine Daten übermittelt'
            }), 400
        
        barcode = data.get('barcode')
        barcode_type_str = data.get('barcode_type', 'EAN13')
        
        if not barcode:
            return jsonify({
                'success': False,
                'message': 'barcode ist erforderlich'
            }), 400
        
        # Barcode-Typ validieren
        try:
            barcode_type = BarcodeType(barcode_type_str)
        except ValueError:
            return jsonify({
                'success': False,
                'message': f'Ungültiger Barcode-Typ: {barcode_type_str}'
            }), 400
        
        service = get_barcode_service()
        is_valid = service.validate_barcode(barcode, barcode_type)
        
        return jsonify({
            'success': True,
            'data': {
                'barcode': barcode,
                'barcode_type': barcode_type.value,
                'is_valid': is_valid
            },
            'message': 'Barcode ist gültig' if is_valid else 'Barcode ist ungültig'
        }), 200
    except Exception as e:
        logger.error(f"Fehler bei der Barcode-Validierung: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/suggestions/<artikel_nr>', methods=['GET'])
def get_barcode_suggestions(artikel_nr: str):
    """
    Generiert Barcode-Vorschläge für einen Artikel
    
    Args:
        artikel_nr: Artikelnummer
        
    Returns:
        JSON mit Barcode-Vorschlägen
    """
    try:
        service = get_barcode_service()
        suggestions = service.generate_barcode_suggestions(artikel_nr)
        
        return jsonify({
            'success': True,
            'data': {
                'artikel_nr': artikel_nr,
                'suggestions': suggestions
            },
            'message': f'{len(suggestions)} Barcode-Vorschläge generiert'
        }), 200
    except Exception as e:
        logger.error(f"Fehler beim Generieren der Barcode-Vorschläge: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

@barcode_bp.route('/types', methods=['GET'])
def get_barcode_types():
    """
    Holt alle verfügbaren Barcode-Typen
    
    Returns:
        JSON mit Liste der Barcode-Typen
    """
    try:
        types = [
            {
                'value': barcode_type.value,
                'name': barcode_type.name,
                'description': _get_barcode_type_description(barcode_type)
            }
            for barcode_type in BarcodeType
        ]
        
        return jsonify({
            'success': True,
            'data': types,
            'message': f'{len(types)} Barcode-Typen verfügbar'
        }), 200
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Barcode-Typen: {e}")
        return jsonify({
            'success': False,
            'message': 'Interner Server-Fehler'
        }), 500

def _get_barcode_type_description(barcode_type: BarcodeType) -> str:
    """Gibt eine Beschreibung für den Barcode-Typ zurück"""
    descriptions = {
        BarcodeType.EAN13: 'Europäische Artikelnummer (13 Stellen)',
        BarcodeType.EAN8: 'Europäische Artikelnummer (8 Stellen)',
        BarcodeType.CODE128: 'Code 128 (ASCII-Zeichen)',
        BarcodeType.CODE39: 'Code 39 (Zahlen und Großbuchstaben)',
        BarcodeType.UPC: 'Universal Product Code',
        BarcodeType.QR: 'QR Code (2D-Barcode)'
    }
    return descriptions.get(barcode_type, 'Unbekannter Barcode-Typ') 