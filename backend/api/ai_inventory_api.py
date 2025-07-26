"""
VALEO NeuroERP - KI-basierte Inventur API
API-Endpunkte für automatische Inventur-Vorschläge
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.ai_inventory_suggestions import AIInventorySuggestions

logger = logging.getLogger(__name__)

ai_inventory_bp = Blueprint('ai_inventory', __name__, url_prefix='/api/ai/inventory')

# Globaler AI Inventory Service
ai_inventory_service: Optional[AIInventorySuggestions] = None

def init_ai_inventory_service(db_connection):
    """AI Inventory Service initialisieren"""
    global ai_inventory_service
    ai_inventory_service = AIInventorySuggestions(db_connection)
    logger.info("AI Inventory Service initialisiert")

@ai_inventory_bp.route('/suggest', methods=['GET', 'POST'])
def suggest_inventory_optimization():
    """Generiere intelligente Inventur-Vorschläge"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Hole Produkt-ID falls angegeben
        product_id = None
        if request.method == 'POST':
            data = request.get_json()
            product_id = data.get('product_id')
        else:
            product_id = request.args.get('product_id')
        
        # Generiere Vorschläge
        suggestions = ai_inventory_service.suggest_inventory_optimization(product_id)
        
        # Konvertiere zu JSON-serialisierbar
        suggestions_data = []
        for suggestion in suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'product_id': suggestion.product_id,
                'product_name': suggestion.product_name,
                'suggested_quantity': suggestion.suggested_quantity,
                'confidence_score': suggestion.confidence_score,
                'reasoning': suggestion.reasoning,
                'urgency_level': suggestion.urgency_level,
                'predicted_shortage_date': suggestion.predicted_shortage_date.isoformat() if suggestion.predicted_shortage_date else None,
                'seasonal_factor': suggestion.seasonal_factor,
                'demand_forecast': suggestion.demand_forecast,
                'cost_impact': suggestion.cost_impact,
                'created_at': suggestion.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': suggestions_data,
            'message': f'{len(suggestions_data)} Inventur-Vorschläge generiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Inventur-Vorschlägen: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/optimize-parameters', methods=['GET'])
def optimize_parameters():
    """Optimiere Inventur-Parameter mit KI"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Optimiere Parameter
        optimization_results = ai_inventory_service.optimize_inventory_parameters()
        
        return jsonify({
            'success': True,
            'data': optimization_results,
            'message': 'Inventur-Parameter-Optimierung abgeschlossen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Parameter-Optimierung: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Hole Inventur-Analytics"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Hole Analytics
        analytics = ai_inventory_service.get_inventory_analytics()
        
        return jsonify({
            'success': True,
            'data': analytics,
            'message': 'Inventur-Analytics abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Analytics: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/retrain', methods=['POST'])
def retrain_models():
    """Trainiere ML-Modelle neu"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Trainiere Modelle neu
        result = ai_inventory_service.retrain_models()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'ML-Modelle neu trainiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Neu-Training: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/product/<product_id>/suggestions', methods=['GET'])
def get_product_suggestions(product_id):
    """Hole Inventur-Vorschläge für ein spezifisches Produkt"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Generiere Vorschläge für spezifisches Produkt
        suggestions = ai_inventory_service.suggest_inventory_optimization(product_id)
        
        # Konvertiere zu JSON-serialisierbar
        suggestions_data = []
        for suggestion in suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'product_id': suggestion.product_id,
                'product_name': suggestion.product_name,
                'suggested_quantity': suggestion.suggested_quantity,
                'confidence_score': suggestion.confidence_score,
                'reasoning': suggestion.reasoning,
                'urgency_level': suggestion.urgency_level,
                'predicted_shortage_date': suggestion.predicted_shortage_date.isoformat() if suggestion.predicted_shortage_date else None,
                'seasonal_factor': suggestion.seasonal_factor,
                'demand_forecast': suggestion.demand_forecast,
                'cost_impact': suggestion.cost_impact,
                'created_at': suggestion.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': suggestions_data,
            'message': f'Inventur-Vorschläge für Produkt {product_id}'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Produkt-Vorschlägen: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/urgency/<urgency_level>', methods=['GET'])
def get_urgency_suggestions(urgency_level):
    """Hole Vorschläge nach Dringlichkeit"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Validiere Dringlichkeits-Level
        valid_levels = ['hoch', 'mittel', 'niedrig']
        if urgency_level not in valid_levels:
            return jsonify({'error': f'Ungültiges Dringlichkeits-Level. Erlaubt: {valid_levels}'}), 400
        
        # Generiere alle Vorschläge
        all_suggestions = ai_inventory_service.suggest_inventory_optimization()
        
        # Filtere nach Dringlichkeit
        filtered_suggestions = [s for s in all_suggestions if s.urgency_level == urgency_level]
        
        # Konvertiere zu JSON-serialisierbar
        suggestions_data = []
        for suggestion in filtered_suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'product_id': suggestion.product_id,
                'product_name': suggestion.product_name,
                'suggested_quantity': suggestion.suggested_quantity,
                'confidence_score': suggestion.confidence_score,
                'reasoning': suggestion.reasoning,
                'urgency_level': suggestion.urgency_level,
                'predicted_shortage_date': suggestion.predicted_shortage_date.isoformat() if suggestion.predicted_shortage_date else None,
                'seasonal_factor': suggestion.seasonal_factor,
                'demand_forecast': suggestion.demand_forecast,
                'cost_impact': suggestion.cost_impact,
                'created_at': suggestion.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': suggestions_data,
            'message': f'{len(suggestions_data)} Vorschläge mit {urgency_level}er Dringlichkeit'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Dringlichkeits-Vorschlägen: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/demand-forecast/<product_id>', methods=['GET'])
def get_demand_forecast(product_id):
    """Hole Nachfrage-Prognose für ein Produkt"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Generiere Vorschläge für Produkt
        suggestions = ai_inventory_service.suggest_inventory_optimization(product_id)
        
        if not suggestions:
            return jsonify({
                'success': False,
                'message': 'Keine Daten für Produkt gefunden'
            }), 404
        
        # Hole Nachfrage-Prognose aus erstem Vorschlag
        demand_forecast = suggestions[0].demand_forecast
        
        return jsonify({
            'success': True,
            'data': {
                'product_id': product_id,
                'product_name': suggestions[0].product_name,
                'demand_forecast': demand_forecast,
                'seasonal_factor': suggestions[0].seasonal_factor,
                'confidence_score': suggestions[0].confidence_score
            },
            'message': 'Nachfrage-Prognose abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Nachfrage-Prognose: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/cost-analysis/<product_id>', methods=['GET'])
def get_cost_analysis(product_id):
    """Hole Kosten-Analyse für ein Produkt"""
    try:
        if not ai_inventory_service:
            return jsonify({'error': 'AI Inventory Service nicht initialisiert'}), 500
        
        # Generiere Vorschläge für Produkt
        suggestions = ai_inventory_service.suggest_inventory_optimization(product_id)
        
        if not suggestions:
            return jsonify({
                'success': False,
                'message': 'Keine Daten für Produkt gefunden'
            }), 404
        
        # Hole Kosten-Impact aus erstem Vorschlag
        cost_impact = suggestions[0].cost_impact
        
        return jsonify({
            'success': True,
            'data': {
                'product_id': product_id,
                'product_name': suggestions[0].product_name,
                'cost_impact': cost_impact,
                'suggested_quantity': suggestions[0].suggested_quantity,
                'urgency_level': suggestions[0].urgency_level
            },
            'message': 'Kosten-Analyse abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Kosten-Analyse: {e}")
        return jsonify({'error': str(e)}), 500

@ai_inventory_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für AI Inventory Service"""
    try:
        if not ai_inventory_service:
            return jsonify({
                'status': 'error',
                'message': 'AI Inventory Service nicht initialisiert'
            }), 500
        
        # Prüfe Service-Status
        has_models = hasattr(ai_inventory_service.demand_forecaster, 'estimators_')
        
        return jsonify({
            'status': 'healthy',
            'service': 'AI Inventory Service',
            'models_trained': has_models,
            'suggestions_generated': len(ai_inventory_service.suggestions_history)
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 