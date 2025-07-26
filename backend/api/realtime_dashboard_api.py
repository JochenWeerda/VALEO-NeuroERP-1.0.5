"""
VALEO NeuroERP - Real-time Dashboard API
API-Endpunkte für Echtzeit-Monitoring und Live-Updates
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging
from ..modules.realtime_dashboard import RealTimeDashboard, AlertLevel

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

# Globaler Real-time Dashboard
realtime_dashboard: Optional[RealTimeDashboard] = None

def init_realtime_dashboard(db_connection):
    """Real-time Dashboard initialisieren"""
    global realtime_dashboard
    realtime_dashboard = RealTimeDashboard(db_connection)
    realtime_dashboard.start_monitoring()
    logger.info("Real-time Dashboard initialisiert und Monitoring gestartet")

# ============================================================================
# DASHBOARD DATA ENDPOINTS
# ============================================================================

@dashboard_bp.route('/data', methods=['GET'])
def get_dashboard_data():
    """Vollständige Dashboard-Daten abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = realtime_dashboard.get_dashboard_data()
        
        return jsonify({
            "success": True,
            "data": data,
            "message": "Dashboard-Daten erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Dashboard-Daten: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Dashboard-Daten: {str(e)}"
        }), 500

@dashboard_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Alle Metriken abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        metrics = {mid: {
            "id": metric.id,
            "type": metric.type.value,
            "name": metric.name,
            "value": metric.value,
            "unit": metric.unit,
            "trend": metric.trend,
            "change_percent": metric.change_percent,
            "timestamp": metric.timestamp.isoformat() if metric.timestamp else None
        } for mid, metric in realtime_dashboard.metrics.items()}
        
        return jsonify({
            "success": True,
            "data": metrics,
            "message": f"{len(metrics)} Metriken gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Metriken: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Metriken: {str(e)}"
        }), 500

@dashboard_bp.route('/metrics/<metric_id>', methods=['GET'])
def get_metric(metric_id: str):
    """Spezifische Metrik abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        if metric_id not in realtime_dashboard.metrics:
            return jsonify({
                "success": False,
                "message": "Metrik nicht gefunden"
            }), 404
        
        metric = realtime_dashboard.metrics[metric_id]
        
        return jsonify({
            "success": True,
            "data": {
                "id": metric.id,
                "type": metric.type.value,
                "name": metric.name,
                "value": metric.value,
                "unit": metric.unit,
                "trend": metric.trend,
                "change_percent": metric.change_percent,
                "timestamp": metric.timestamp.isoformat() if metric.timestamp else None
            },
            "message": "Metrik erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Metrik: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Metrik: {str(e)}"
        }), 500

@dashboard_bp.route('/metrics/<metric_id>/history', methods=['GET'])
def get_metric_history(metric_id: str):
    """Metrik-Historie abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        hours = request.args.get('hours', 24, type=int)
        history = realtime_dashboard.get_metric_history(metric_id, hours)
        
        return jsonify({
            "success": True,
            "data": history,
            "message": f"Historie für Metrik {metric_id} abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Metrik-Historie: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Metrik-Historie: {str(e)}"
        }), 500

# ============================================================================
# ALERTS ENDPOINTS
# ============================================================================

@dashboard_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Alle aktiven Alerts abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        category = request.args.get('category')
        
        if category:
            alerts = realtime_dashboard.get_alerts_by_category(category)
        else:
            alerts = [
                {
                    "id": alert.id,
                    "level": alert.level.value,
                    "title": alert.title,
                    "message": alert.message,
                    "category": alert.category,
                    "timestamp": alert.timestamp.isoformat(),
                    "is_active": alert.is_active,
                    "acknowledged_by": alert.acknowledged_by,
                    "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None
                }
                for alert in realtime_dashboard.alerts.values()
                if alert.is_active
            ]
        
        return jsonify({
            "success": True,
            "data": alerts,
            "message": f"{len(alerts)} aktive Alerts gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Alerts: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Alerts: {str(e)}"
        }), 500

@dashboard_bp.route('/alerts', methods=['POST'])
def create_alert():
    """Neuen Alert erstellen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        required_fields = ['level', 'title', 'message', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Feld '{field}' ist erforderlich"
                }), 400
        
        # Alert-Level validieren
        try:
            level = AlertLevel(data['level'])
        except ValueError:
            return jsonify({
                "success": False,
                "message": f"Ungültiger Alert-Level: {data['level']}"
            }), 400
        
        realtime_dashboard.create_alert(
            level=level,
            title=data['title'],
            message=data['message'],
            category=data['category'],
            metadata=data.get('metadata')
        )
        
        return jsonify({
            "success": True,
            "message": "Alert erfolgreich erstellt"
        }), 201
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Alerts: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen des Alerts: {str(e)}"
        }), 500

@dashboard_bp.route('/alerts/<alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id: str):
    """Alert bestätigen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = request.get_json() or {}
        acknowledged_by = data.get('acknowledged_by', 'system')
        
        realtime_dashboard.acknowledge_alert(alert_id, acknowledged_by)
        
        return jsonify({
            "success": True,
            "message": "Alert erfolgreich bestätigt"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Bestätigen des Alerts: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Bestätigen des Alerts: {str(e)}"
        }), 500

# ============================================================================
# EVENTS ENDPOINTS
# ============================================================================

@dashboard_bp.route('/events', methods=['GET'])
def get_recent_events():
    """Letzte Events abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        limit = request.args.get('limit', 50, type=int)
        event_type = request.args.get('type')
        
        events = []
        for event in list(realtime_dashboard.event_history)[-limit:]:
            if event_type and event.event_type != event_type:
                continue
                
            events.append({
                "event_type": event.event_type,
                "data": event.data,
                "timestamp": event.timestamp.isoformat(),
                "source": event.source,
                "priority": event.priority
            })
        
        return jsonify({
            "success": True,
            "data": events,
            "message": f"{len(events)} Events gefunden"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Events: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen der Events: {str(e)}"
        }), 500

@dashboard_bp.route('/events', methods=['POST'])
def create_event():
    """Event erstellen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Keine Daten bereitgestellt"
            }), 400
        
        # Validierung der erforderlichen Felder
        required_fields = ['event_type', 'data', 'source']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Feld '{field}' ist erforderlich"
                }), 400
        
        realtime_dashboard.create_event(
            event_type=data['event_type'],
            data=data['data'],
            source=data['source'],
            priority=data.get('priority', 1)
        )
        
        return jsonify({
            "success": True,
            "message": "Event erfolgreich erstellt"
        }), 201
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Events: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Erstellen des Events: {str(e)}"
        }), 500

# ============================================================================
# METRIC UPDATE ENDPOINTS
# ============================================================================

@dashboard_bp.route('/metrics/<metric_id>/update', methods=['PUT'])
def update_metric(metric_id: str):
    """Metrik manuell aktualisieren"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = request.get_json()
        if not data or 'value' not in data:
            return jsonify({
                "success": False,
                "message": "Feld 'value' ist erforderlich"
            }), 400
        
        value = data['value']
        trend = data.get('trend', 'neutral')
        change_percent = data.get('change_percent', 0.0)
        
        realtime_dashboard.update_metric(metric_id, value, trend, change_percent)
        
        return jsonify({
            "success": True,
            "message": f"Metrik {metric_id} erfolgreich aktualisiert"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Metrik: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Aktualisieren der Metrik: {str(e)}"
        }), 500

# ============================================================================
# MONITORING CONTROL ENDPOINTS
# ============================================================================

@dashboard_bp.route('/monitoring/start', methods=['POST'])
def start_monitoring():
    """Dashboard-Monitoring starten"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        realtime_dashboard.start_monitoring()
        
        return jsonify({
            "success": True,
            "message": "Dashboard-Monitoring gestartet"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Starten des Monitorings: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Starten des Monitorings: {str(e)}"
        }), 500

@dashboard_bp.route('/monitoring/stop', methods=['POST'])
def stop_monitoring():
    """Dashboard-Monitoring stoppen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        realtime_dashboard.stop_monitoring()
        
        return jsonify({
            "success": True,
            "message": "Dashboard-Monitoring gestoppt"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Stoppen des Monitorings: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Stoppen des Monitorings: {str(e)}"
        }), 500

@dashboard_bp.route('/monitoring/status', methods=['GET'])
def get_monitoring_status():
    """Monitoring-Status abrufen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        return jsonify({
            "success": True,
            "data": {
                "monitoring_active": realtime_dashboard.monitoring_active,
                "total_metrics": len(realtime_dashboard.metrics),
                "active_alerts": len([a for a in realtime_dashboard.alerts.values() if a.is_active]),
                "total_events": len(realtime_dashboard.event_history)
            },
            "message": "Monitoring-Status erfolgreich abgerufen"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Monitoring-Status: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Abrufen des Monitoring-Status: {str(e)}"
        }), 500

# ============================================================================
# MAINTENANCE ENDPOINTS
# ============================================================================

@dashboard_bp.route('/maintenance/clear-events', methods=['POST'])
def clear_old_events():
    """Alte Events löschen"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        data = request.get_json() or {}
        days = data.get('days', 7)
        
        realtime_dashboard.clear_old_events(days)
        
        return jsonify({
            "success": True,
            "message": f"Events älter als {days} Tage gelöscht"
        })
        
    except Exception as e:
        logger.error(f"Fehler beim Löschen alter Events: {e}")
        return jsonify({
            "success": False,
            "message": f"Fehler beim Löschen alter Events: {str(e)}"
        }), 500

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@dashboard_bp.route('/health', methods=['GET'])
def health_check():
    """Health Check für Real-time Dashboard"""
    try:
        if not realtime_dashboard:
            return jsonify({
                "success": False,
                "message": "Real-time Dashboard nicht initialisiert"
            }), 500
        
        dashboard_data = realtime_dashboard.get_dashboard_data()
        
        return jsonify({
            "success": True,
            "service": "realtime_dashboard",
            "status": "healthy",
            "data": {
                "monitoring_active": realtime_dashboard.monitoring_active,
                "total_metrics": len(realtime_dashboard.metrics),
                "active_alerts": len([a for a in realtime_dashboard.alerts.values() if a.is_active]),
                "total_events": len(realtime_dashboard.event_history),
                "last_updated": dashboard_data.get("last_updated")
            },
            "message": "Real-time Dashboard läuft normal"
        })
        
    except Exception as e:
        logger.error(f"Health Check Fehler: {e}")
        return jsonify({
            "success": False,
            "service": "realtime_dashboard",
            "status": "unhealthy",
            "message": f"Service-Fehler: {str(e)}"
        }), 500 