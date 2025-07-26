"""
VALEO NeuroERP - KI-basierte Barcode API
API-Endpunkte für intelligente Barcode-Vorschläge
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.ai_barcode_suggestions import AIBarcodeSuggestions

logger = logging.getLogger(__name__)

ai_barcode_bp = Blueprint('ai_barcode', __name__, url_prefix='/api/ai/barcode')

# Globaler AI Barcode Service
ai_barcode_service: Optional[AIBarcodeSuggestions] = None

def init_ai_barcode_service(db_connection):
    """AI Barcode Service initialisieren"""
    global ai_barcode_service
    ai_barcode_service = AIBarcodeSuggestions(db_connection)
    logger.info("AI Barcode Service initialisiert")

@ai_barcode_bp.route('/suggest', methods=['POST'])
def suggest_barcode():
    """Generiere intelligente Barcode-Vorschläge"""
    try:
        if not ai_barcode_service:
            return jsonify({'error': 'AI Barcode Service nicht initialisiert'}), 500
        
        data = request.get_json()
        product_name = data.get('product_name')
        category = data.get('category')
        
        if not product_name:
            return jsonify({'error': 'product_name ist erforderlich'}), 400
        
        # Generiere Vorschläge
        suggestions = ai_barcode_service.suggest_barcode(product_name, category)
        
        # Konvertiere zu JSON-serialisierbar
        suggestions_data = []
        for suggestion in suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'product_name': suggestion.product_name,
                'suggested_barcode': suggestion.suggested_barcode,
                'confidence_score': suggestion.confidence_score,
                'reasoning': suggestion.reasoning,
                'category': suggestion.category,
                'similar_products': suggestion.similar_products,
                'market_trends': suggestion.market_trends,
                'created_at': suggestion.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': suggestions_data,
            'message': f'{len(suggestions_data)} Barcode-Vorschläge generiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Barcode-Vorschlägen: {e}")
        return jsonify({'error': str(e)}), 500

@ai_barcode_bp.route('/optimize', methods=['GET'])
def optimize_barcodes():
    """Optimiere bestehende Barcodes mit KI"""
    try:
        if not ai_barcode_service:
            return jsonify({'error': 'AI Barcode Service nicht initialisiert'}), 500
        
        # Optimiere Barcodes
        optimization_results = ai_barcode_service.optimize_existing_barcodes()
        
        return jsonify({
            'success': True,
            'data': optimization_results,
            'message': 'Barcode-Optimierung abgeschlossen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Barcode-Optimierung: {e}")
        return jsonify({'error': str(e)}), 500

@ai_barcode_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Hole Barcode-Vorschlag-Statistiken"""
    try:
        if not ai_barcode_service:
            return jsonify({'error': 'AI Barcode Service nicht initialisiert'}), 500
        
        # Hole Statistiken
        stats = ai_barcode_service.get_suggestion_statistics()
        
        return jsonify({
            'success': True,
            'data': stats,
            'message': 'Statistiken abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Statistiken: {e}")
        return jsonify({'error': str(e)}), 500

@ai_barcode_bp.route('/retrain', methods=['POST'])
def retrain_models():
    """Trainiere ML-Modelle neu"""
    try:
        if not ai_barcode_service:
            return jsonify({'error': 'AI Barcode Service nicht initialisiert'}), 500
        
        # Trainiere Modelle neu
        result = ai_barcode_service.retrain_models()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'ML-Modelle neu trainiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Neu-Training: {e}")
        return jsonify({'error': str(e)}), 500

@ai_barcode_bp.route('/patterns', methods=['GET'])
def get_patterns():
    """Hole Barcode-Muster"""
    try:
        if not ai_barcode_service:
            return jsonify({'error': 'AI Barcode Service nicht initialisiert'}), 500
        
        # Extrahiere Muster
        patterns = ai_barcode_service._extract_barcode_patterns()
        
        # Konvertiere zu JSON-serialisierbar
        patterns_data = []
        for pattern in patterns:
            patterns_data.append({
                'pattern': pattern.pattern,
                'frequency': pattern.frequency,
                'category': pattern.category,
                'success_rate': pattern.success_rate,
                'avg_length': pattern.avg_length,
                'common_prefixes': pattern.common_prefixes,
                'common_suffixes': pattern.common_suffixes
            })
        
        return jsonify({
            'success': True,
            'data': patterns_data,
            'message': f'{len(patterns_data)} Barcode-Muster gefunden'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Barcode-Mustern: {e}")
        return jsonify({'error': str(e)}), 500

@ai_barcode_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für AI Barcode Service"""
    try:
        if not ai_barcode_service:
            return jsonify({
                'status': 'error',
                'message': 'AI Barcode Service nicht initialisiert'
            }), 500
        
        # Prüfe Service-Status
        has_models = hasattr(ai_barcode_service.classifier, 'classes_')
        
        return jsonify({
            'status': 'healthy',
            'service': 'AI Barcode Service',
            'models_trained': has_models,
            'suggestions_generated': len(ai_barcode_service.suggestions_history)
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 