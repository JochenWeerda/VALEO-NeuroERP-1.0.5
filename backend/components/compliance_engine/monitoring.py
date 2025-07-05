"""
Monitoring-System für die Compliance-Engine
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import asyncio
import logging
from uuid import uuid4
from collections import deque

from .models import (
    MonitoringStatus,
    MonitoringParameter,
    Measurement,
    Alert,
    AlertSettings,
    AlertSubscription,
    AlertStatistics,
    ComplianceParameter,
    ComplianceAlert
)

logger = logging.getLogger(__name__)

class ComplianceMonitor:
    """Echtzeit-Monitoring System für Compliance-Parameter"""
    
    def __init__(self, max_history: int = 1000):
        self.parameter_history: Dict[str, deque] = {}
        self.alert_history: deque = deque(maxlen=max_history)
        self.active_alerts: Dict[str, ComplianceAlert] = {}
        self.monitoring_tasks: List[asyncio.Task] = []
        
    async def monitor_parameter(self, parameter: ComplianceParameter) -> None:
        """Überwacht einen einzelnen Parameter"""
        if parameter.name not in self.parameter_history:
            self.parameter_history[parameter.name] = deque(maxlen=1000)
            
        self.parameter_history[parameter.name].append({
            'wert': parameter.wert,
            'timestamp': parameter.timestamp
        })
        
        # Prüfe Grenzwerte
        if parameter.grenzwert_min is not None and parameter.wert < parameter.grenzwert_min:
            alert = ComplianceAlert(
                alert_typ="GRENZWERT",
                beschreibung=f"Parameter {parameter.name} unter Minimum: {parameter.wert} {parameter.einheit}",
                schweregrad=3,
                parameter=parameter
            )
            await self.add_alert(alert)
            
        elif parameter.grenzwert_max is not None and parameter.wert > parameter.grenzwert_max:
            alert = ComplianceAlert(
                alert_typ="GRENZWERT",
                beschreibung=f"Parameter {parameter.name} über Maximum: {parameter.wert} {parameter.einheit}",
                schweregrad=3,
                parameter=parameter
            )
            await self.add_alert(alert)
    
    async def add_alert(self, alert: ComplianceAlert) -> None:
        """Fügt einen neuen Alert hinzu"""
        alert_key = f"{alert.alert_typ}_{alert.parameter.name if alert.parameter else 'system'}"
        self.active_alerts[alert_key] = alert
        self.alert_history.append(alert)
        
    async def clear_alert(self, alert_key: str) -> None:
        """Entfernt einen aktiven Alert"""
        if alert_key in self.active_alerts:
            del self.active_alerts[alert_key]
    
    def get_parameter_statistics(self, parameter_name: str) -> Dict[str, Any]:
        """Berechnet Statistiken für einen Parameter"""
        if parameter_name not in self.parameter_history or not self.parameter_history[parameter_name]:
            return {}
            
        values = [entry['wert'] for entry in self.parameter_history[parameter_name]]
        return {
            'min': min(values),
            'max': max(values),
            'avg': sum(values) / len(values),
            'count': len(values),
            'last_update': self.parameter_history[parameter_name][-1]['timestamp']
        }
    
    def get_active_alerts(self) -> List[ComplianceAlert]:
        """Gibt alle aktiven Alerts zurück"""
        return list(self.active_alerts.values())
    
    def get_alert_history(self) -> List[ComplianceAlert]:
        """Gibt die Alert-Historie zurück"""
        return list(self.alert_history)
    
    async def start_monitoring(self, parameter: ComplianceParameter, interval: float = 1.0) -> None:
        """Startet das Monitoring für einen Parameter"""
        async def monitor():
            while True:
                await self.monitor_parameter(parameter)
                await asyncio.sleep(interval)
                
        task = asyncio.create_task(monitor())
        self.monitoring_tasks.append(task)
    
    async def stop_monitoring(self) -> None:
        """Stoppt alle Monitoring-Tasks"""
        for task in self.monitoring_tasks:
            task.cancel()
        self.monitoring_tasks.clear()
        
    def get_monitoring_status(self) -> Dict[str, Any]:
        """Gibt den aktuellen Monitoring-Status zurück"""
        return {
            'active_parameters': list(self.parameter_history.keys()),
            'active_alerts_count': len(self.active_alerts),
            'total_alerts': len(self.alert_history),
            'monitoring_tasks': len(self.monitoring_tasks)
        }

class ComplianceMonitoring:
    """Monitoring-System für die Compliance-Engine"""
    
    def __init__(self):
        """Initialisiert das Monitoring-System"""
        self.active_monitoring: Dict[str, MonitoringStatus] = {}
        self.alert_settings: Dict[str, AlertSettings] = {}
        self.alert_subscriptions: Dict[str, List[AlertSubscription]] = {}
        self.active_alerts: Dict[str, List[Alert]] = {}
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
        
    async def start_monitoring(
        self,
        batch_id: str,
        parameters: Dict[str, MonitoringParameter]
    ) -> MonitoringStatus:
        """
        Startet das Monitoring für eine Charge
        
        Args:
            batch_id: ID der zu überwachenden Charge
            parameters: Zu überwachende Parameter mit Grenzwerten
            
        Returns:
            MonitoringStatus-Objekt
        """
        if batch_id in self.active_monitoring:
            raise ValueError(f"Monitoring für Charge {batch_id} bereits aktiv")
            
        status = MonitoringStatus(
            batch_id=batch_id,
            status="active",
            start_time=datetime.now(),
            parameters=parameters
        )
        self.active_monitoring[batch_id] = status
        
        # Starte Monitoring-Task
        task = asyncio.create_task(self._monitor_batch(batch_id))
        self.monitoring_tasks[batch_id] = task
        
        logger.info(f"Monitoring für Charge {batch_id} gestartet")
        return status
    
    async def stop_monitoring(self, batch_id: str) -> None:
        """
        Beendet das Monitoring für eine Charge
        
        Args:
            batch_id: ID der Charge
        """
        if batch_id not in self.active_monitoring:
            raise ValueError(f"Kein aktives Monitoring für Charge {batch_id}")
            
        # Beende Monitoring-Task
        task = self.monitoring_tasks.pop(batch_id)
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
            
        # Aktualisiere Status
        status = self.active_monitoring[batch_id]
        status.status = "completed"
        status.end_time = datetime.now()
        
        logger.info(f"Monitoring für Charge {batch_id} beendet")
    
    async def get_status(self, batch_id: str) -> MonitoringStatus:
        """
        Ruft den aktuellen Monitoring-Status ab
        
        Args:
            batch_id: ID der Charge
            
        Returns:
            MonitoringStatus-Objekt
        """
        if batch_id not in self.active_monitoring:
            raise ValueError(f"Kein Monitoring-Status für Charge {batch_id}")
            
        return self.active_monitoring[batch_id]
    
    async def add_measurement(
        self,
        batch_id: str,
        parameter: str,
        value: float
    ) -> Measurement:
        """
        Fügt eine neue Messung hinzu
        
        Args:
            batch_id: ID der Charge
            parameter: Name des Parameters
            value: Messwert
            
        Returns:
            Measurement-Objekt
        """
        if batch_id not in self.active_monitoring:
            raise ValueError(f"Kein aktives Monitoring für Charge {batch_id}")
            
        status = self.active_monitoring[batch_id]
        if parameter not in status.parameters:
            raise ValueError(f"Parameter {parameter} nicht konfiguriert")
            
        # Erstelle Messung
        measurement = Measurement(
            parameter=parameter,
            value=value,
            timestamp=datetime.now()
        )
        
        # Prüfe Grenzwerte
        param_config = status.parameters[parameter]
        if value < param_config.min or value > param_config.max:
            measurement.status = "alert"
            await self._create_alert(batch_id, parameter, value, param_config)
        
        # Aktualisiere Status
        status.latest_measurements.append(measurement)
        if len(status.latest_measurements) > 100:  # Behalte nur die letzten 100 Messungen
            status.latest_measurements.pop(0)
            
        logger.debug(f"Neue Messung für Charge {batch_id}: {parameter}={value}")
        return measurement
    
    async def configure_alerts(
        self,
        batch_id: str,
        settings: AlertSettings
    ) -> None:
        """
        Konfiguriert die Alert-Einstellungen
        
        Args:
            batch_id: ID der Charge
            settings: Alert-Einstellungen
        """
        self.alert_settings[batch_id] = settings
        logger.info(f"Alert-Einstellungen für Charge {batch_id} konfiguriert")
    
    async def subscribe_to_alerts(
        self,
        batch_id: str,
        subscription: AlertSubscription
    ) -> None:
        """
        Registriert eine neue Alert-Subscription
        
        Args:
            batch_id: ID der Charge
            subscription: Subscription-Daten
        """
        if batch_id not in self.alert_subscriptions:
            self.alert_subscriptions[batch_id] = []
            
        self.alert_subscriptions[batch_id].append(subscription)
        logger.info(f"Neue Alert-Subscription für Charge {batch_id} registriert")
    
    async def get_active_alerts(self, batch_id: str) -> List[Alert]:
        """
        Ruft alle aktiven Alerts ab
        
        Args:
            batch_id: ID der Charge
            
        Returns:
            Liste von aktiven Alerts
        """
        return self.active_alerts.get(batch_id, [])
    
    async def resolve_alert(
        self,
        batch_id: str,
        alert_id: str,
        resolved_by: str
    ) -> None:
        """
        Markiert einen Alert als aufgelöst
        
        Args:
            batch_id: ID der Charge
            alert_id: ID des Alerts
            resolved_by: Name der auflösenden Person
        """
        if batch_id not in self.active_alerts:
            raise ValueError(f"Keine aktiven Alerts für Charge {batch_id}")
            
        alerts = self.active_alerts[batch_id]
        for alert in alerts:
            if alert.id == alert_id:
                alert.resolved_at = datetime.now()
                alert.resolved_by = resolved_by
                alerts.remove(alert)
                logger.info(f"Alert {alert_id} für Charge {batch_id} aufgelöst")
                return
                
        raise ValueError(f"Alert {alert_id} nicht gefunden")
    
    async def get_alert_statistics(self, batch_id: str) -> AlertStatistics:
        """
        Erstellt Statistiken über Alerts
        
        Args:
            batch_id: ID der Charge
            
        Returns:
            AlertStatistics-Objekt
        """
        # Sammle alle Alerts (aktiv und aufgelöst)
        all_alerts = []
        if batch_id in self.active_alerts:
            all_alerts.extend(self.active_alerts[batch_id])
            
        # Zähle nach Schweregrad
        severity_counts: Dict[str, int] = {}
        parameter_counts: Dict[str, int] = {}
        batch_counts: Dict[str, int] = {}
        resolved_count = 0
        total_resolution_time = 0
        
        for alert in all_alerts:
            # Zähle nach Schweregrad
            severity_counts[alert.severity] = severity_counts.get(alert.severity, 0) + 1
            
            # Zähle nach Parameter
            parameter_counts[alert.parameter] = parameter_counts.get(alert.parameter, 0) + 1
            
            # Zähle nach Charge
            batch_counts[alert.batch_id] = batch_counts.get(alert.batch_id, 0) + 1
            
            # Zähle aufgelöste Alerts
            if alert.resolved_at:
                resolved_count += 1
                resolution_time = (alert.resolved_at - alert.created_at).total_seconds()
                total_resolution_time += resolution_time
                
        # Berechne durchschnittliche Auflösungszeit
        avg_resolution_time = (
            total_resolution_time / resolved_count if resolved_count > 0 else 0
        )
        
        # Sortiere Chargen nach Häufigkeit
        most_affected = [
            {"batch_id": b, "count": c}
            for b, c in sorted(
                batch_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]  # Top 5
        ]
        
        return AlertStatistics(
            total_alerts=len(all_alerts),
            resolved_alerts=resolved_count,
            active_alerts=len(all_alerts) - resolved_count,
            average_resolution_time=avg_resolution_time,
            alerts_by_severity=severity_counts,
            alerts_by_parameter=parameter_counts,
            most_affected_batches=most_affected
        )
    
    async def _monitor_batch(self, batch_id: str) -> None:
        """
        Monitoring-Task für eine Charge
        
        Args:
            batch_id: ID der Charge
        """
        try:
            while True:
                # Prüfe aktive Alerts
                await self._check_alerts(batch_id)
                
                # Warte kurz
                await asyncio.sleep(30)  # Alle 30 Sekunden
                
        except asyncio.CancelledError:
            logger.info(f"Monitoring-Task für Charge {batch_id} beendet")
            raise
        except Exception as e:
            logger.error(f"Fehler im Monitoring-Task für Charge {batch_id}: {e}")
            raise
    
    async def _check_alerts(self, batch_id: str) -> None:
        """
        Prüft und aktualisiert Alerts
        
        Args:
            batch_id: ID der Charge
        """
        status = self.active_monitoring[batch_id]
        
        # Prüfe letzte Messungen
        for measurement in status.latest_measurements[-10:]:  # Letzte 10 Messungen
            if measurement.status == "alert":
                param_config = status.parameters[measurement.parameter]
                await self._create_alert(
                    batch_id,
                    measurement.parameter,
                    measurement.value,
                    param_config
                )
    
    async def _create_alert(
        self,
        batch_id: str,
        parameter: str,
        value: float,
        param_config: MonitoringParameter
    ) -> None:
        """
        Erstellt einen neuen Alert
        
        Args:
            batch_id: ID der Charge
            parameter: Name des Parameters
            value: Messwert
            param_config: Parameter-Konfiguration
        """
        # Bestimme Schweregrad
        if value < param_config.min:
            severity = "low" if value > param_config.min * 0.9 else "high"
            message = f"Messwert {value} unter Minimum {param_config.min}"
        else:
            severity = "low" if value < param_config.max * 1.1 else "high"
            message = f"Messwert {value} über Maximum {param_config.max}"
            
        # Erstelle Alert
        alert = Alert(
            id=str(uuid4()),
            batch_id=batch_id,
            parameter=parameter,
            severity=severity,
            message=message,
            created_at=datetime.now()
        )
        
        # Speichere Alert
        if batch_id not in self.active_alerts:
            self.active_alerts[batch_id] = []
        self.active_alerts[batch_id].append(alert)
        
        # Benachrichtige Subscriber
        await self._notify_subscribers(batch_id, alert)
        
        logger.warning(f"Neuer Alert für Charge {batch_id}: {message}")
    
    async def _notify_subscribers(self, batch_id: str, alert: Alert) -> None:
        """
        Benachrichtigt alle Subscriber über einen neuen Alert
        
        Args:
            batch_id: ID der Charge
            alert: Neuer Alert
        """
        if batch_id not in self.alert_subscriptions:
            return
            
        for subscription in self.alert_subscriptions[batch_id]:
            if not subscription.active:
                continue
                
            if alert.severity not in subscription.notification_types:
                continue
                
            # Hier würde die eigentliche Benachrichtigung erfolgen
            # (E-Mail, SMS, etc.)
            logger.info(
                f"Benachrichtigung an {subscription.user_id} "
                f"über Alert {alert.id} gesendet"
            ) 