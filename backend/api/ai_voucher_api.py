"""
VALEO NeuroERP - KI-basierte Voucher API
API-Endpunkte für intelligente Voucher-Optimierung
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.ai_voucher_optimization import AIVoucherOptimization

logger = logging.getLogger(__name__)

ai_voucher_bp = Blueprint('ai_voucher', __name__, url_prefix='/api/ai/voucher')

# Globaler AI Voucher Service
ai_voucher_service: Optional[AIVoucherOptimization] = None

def init_ai_voucher_service(db_connection):
    """AI Voucher Service initialisieren"""
    global ai_voucher_service
    ai_voucher_service = AIVoucherOptimization(db_connection)
    logger.info("AI Voucher Service initialisiert")

@ai_voucher_bp.route('/optimize', methods=['GET', 'POST'])
def optimize_voucher_strategy():
    """Generiere intelligente Voucher-Optimierungsvorschläge"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Hole Voucher-ID falls angegeben
        voucher_id = None
        if request.method == 'POST':
            data = request.get_json()
            voucher_id = data.get('voucher_id')
        else:
            voucher_id = request.args.get('voucher_id')
        
        # Generiere Optimierungen
        optimizations = ai_voucher_service.optimize_voucher_strategy(voucher_id)
        
        # Konvertiere zu JSON-serialisierbar
        optimizations_data = []
        for optimization in optimizations:
            optimizations_data.append({
                'id': optimization.id,
                'voucher_id': optimization.voucher_id,
                'voucher_name': optimization.voucher_name,
                'current_nominal': optimization.current_nominal,
                'suggested_nominal': optimization.suggested_nominal,
                'confidence_score': optimization.confidence_score,
                'reasoning': optimization.reasoning,
                'expected_revenue_increase': optimization.expected_revenue_increase,
                'target_customer_segments': optimization.target_customer_segments,
                'optimal_duration_days': optimization.optimal_duration_days,
                'seasonal_factors': optimization.seasonal_factors,
                'risk_assessment': optimization.risk_assessment,
                'created_at': optimization.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': optimizations_data,
            'message': f'{len(optimizations_data)} Voucher-Optimierungen generiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Voucher-Optimierung: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Hole Voucher-Analytics"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Hole Analytics
        analytics = ai_voucher_service.get_voucher_analytics()
        
        return jsonify({
            'success': True,
            'data': analytics,
            'message': 'Voucher-Analytics abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Analytics: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/retrain', methods=['POST'])
def retrain_models():
    """Trainiere ML-Modelle neu"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Trainiere Modelle neu
        result = ai_voucher_service.retrain_models()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'ML-Modelle neu trainiert'
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Neu-Training: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/voucher/<voucher_id>/optimization', methods=['GET'])
def get_voucher_optimization(voucher_id):
    """Hole Voucher-Optimierung für einen spezifischen Voucher"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Generiere Optimierung für spezifischen Voucher
        optimizations = ai_voucher_service.optimize_voucher_strategy(voucher_id)
        
        # Konvertiere zu JSON-serialisierbar
        optimizations_data = []
        for optimization in optimizations:
            optimizations_data.append({
                'id': optimization.id,
                'voucher_id': optimization.voucher_id,
                'voucher_name': optimization.voucher_name,
                'current_nominal': optimization.current_nominal,
                'suggested_nominal': optimization.suggested_nominal,
                'confidence_score': optimization.confidence_score,
                'reasoning': optimization.reasoning,
                'expected_revenue_increase': optimization.expected_revenue_increase,
                'target_customer_segments': optimization.target_customer_segments,
                'optimal_duration_days': optimization.optimal_duration_days,
                'seasonal_factors': optimization.seasonal_factors,
                'risk_assessment': optimization.risk_assessment,
                'created_at': optimization.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': optimizations_data,
            'message': f'Voucher-Optimierung für Voucher {voucher_id}'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Voucher-Optimierung: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/customer-segments', methods=['GET'])
def get_customer_segments():
    """Hole Kunden-Segmente"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Hole Kunden-Segmente
        segments = ai_voucher_service._get_customer_segments()
        
        # Konvertiere zu JSON-serialisierbar
        segments_data = []
        for segment in segments:
            segments_data.append({
                'segment_id': segment.segment_id,
                'segment_name': segment.segment_name,
                'avg_purchase_value': segment.avg_purchase_value,
                'purchase_frequency': segment.purchase_frequency,
                'voucher_usage_rate': segment.voucher_usage_rate,
                'price_sensitivity': segment.price_sensitivity,
                'customer_count': segment.customer_count,
                'total_revenue': segment.total_revenue
            })
        
        return jsonify({
            'success': True,
            'data': segments_data,
            'message': f'{len(segments_data)} Kunden-Segmente gefunden'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Kunden-Segmenten: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/revenue-prediction', methods=['POST'])
def predict_revenue():
    """Vorhersage Revenue-Steigerung für Voucher-Parameter"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        data = request.get_json()
        voucher_type = data.get('voucher_type')
        nominal = data.get('nominal')
        minimal_buying = data.get('minimal_buying')
        
        if not all([voucher_type, nominal, minimal_buying]):
            return jsonify({'error': 'voucher_type, nominal und minimal_buying sind erforderlich'}), 400
        
        # Hole Kunden-Segmente
        customer_segments = ai_voucher_service._get_customer_segments()
        
        # Berechne Revenue-Vorhersage
        revenue_increase = ai_voucher_service._predict_revenue_increase(
            voucher_type, nominal, minimal_buying, customer_segments
        )
        
        return jsonify({
            'success': True,
            'data': {
                'voucher_type': voucher_type,
                'nominal': nominal,
                'minimal_buying': minimal_buying,
                'expected_revenue_increase': revenue_increase,
                'customer_segments_count': len(customer_segments)
            },
            'message': 'Revenue-Vorhersage berechnet'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Revenue-Vorhersage: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/risk-assessment', methods=['POST'])
def assess_risk():
    """Bewerte Optimierungs-Risiko"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        data = request.get_json()
        nominal = data.get('nominal')
        minimal_buying = data.get('minimal_buying')
        expected_revenue = data.get('expected_revenue', 0)
        
        if not all([nominal, minimal_buying]):
            return jsonify({'error': 'nominal und minimal_buying sind erforderlich'}), 400
        
        # Hole Kunden-Segmente
        customer_segments = ai_voucher_service._get_customer_segments()
        
        # Bewerte Risiko
        risk_assessment = ai_voucher_service._assess_optimization_risk(
            nominal, minimal_buying, expected_revenue, customer_segments
        )
        
        return jsonify({
            'success': True,
            'data': risk_assessment,
            'message': 'Risiko-Bewertung abgeschlossen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Risiko-Bewertung: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/seasonal-factors/<voucher_type>', methods=['GET'])
def get_seasonal_factors(voucher_type):
    """Hole saisonale Faktoren für Voucher-Typ"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Validiere Voucher-Typ
        valid_types = ['prozent', 'betrag', 'versandkosten']
        if voucher_type not in valid_types:
            return jsonify({'error': f'Ungültiger Voucher-Typ. Erlaubt: {valid_types}'}), 400
        
        # Hole saisonale Faktoren
        seasonal_factors = ai_voucher_service._get_seasonal_factors(voucher_type)
        
        return jsonify({
            'success': True,
            'data': seasonal_factors,
            'message': f'Saisonale Faktoren für {voucher_type} Vouchers'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei saisonalen Faktoren: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/target-segments', methods=['POST'])
def identify_target_segments():
    """Identifiziere Ziel-Kundensegmente"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        data = request.get_json()
        voucher_type = data.get('voucher_type')
        nominal = data.get('nominal')
        
        if not all([voucher_type, nominal]):
            return jsonify({'error': 'voucher_type und nominal sind erforderlich'}), 400
        
        # Hole Kunden-Segmente
        customer_segments = ai_voucher_service._get_customer_segments()
        
        # Identifiziere Ziel-Segmente
        target_segments = ai_voucher_service._identify_target_segments(
            voucher_type, nominal, customer_segments
        )
        
        return jsonify({
            'success': True,
            'data': {
                'voucher_type': voucher_type,
                'nominal': nominal,
                'target_segments': target_segments,
                'total_segments': len(customer_segments)
            },
            'message': f'{len(target_segments)} Ziel-Segmente identifiziert'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Ziel-Segmenten: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/performance-history', methods=['GET'])
def get_performance_history():
    """Hole Performance-Historie der Optimierungen"""
    try:
        if not ai_voucher_service:
            return jsonify({'error': 'AI Voucher Service nicht initialisiert'}), 500
        
        # Hole Historie
        history = ai_voucher_service.optimization_history
        
        return jsonify({
            'success': True,
            'data': {
                'total_optimizations': len(history),
                'recent_optimizations': history[-10:] if len(history) > 10 else history,
                'avg_revenue_increase': sum(opt.get('expected_revenue_increase', 0) for opt in history) / len(history) if history else 0,
                'avg_confidence': sum(opt.get('confidence', 0) for opt in history) / len(history) if history else 0
            },
            'message': 'Performance-Historie abgerufen'
        })
        
    except Exception as e:
        logger.error(f"Fehler bei Performance-Historie: {e}")
        return jsonify({'error': str(e)}), 500

@ai_voucher_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für AI Voucher Service"""
    try:
        if not ai_voucher_service:
            return jsonify({
                'status': 'error',
                'message': 'AI Voucher Service nicht initialisiert'
            }), 500
        
        # Prüfe Service-Status
        has_models = hasattr(ai_voucher_service.revenue_predictor, 'estimators_')
        
        return jsonify({
            'status': 'healthy',
            'service': 'AI Voucher Service',
            'models_trained': has_models,
            'optimizations_generated': len(ai_voucher_service.optimization_history)
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 