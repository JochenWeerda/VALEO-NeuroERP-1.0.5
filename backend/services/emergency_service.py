import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func

from ..models.emergency import (
    EmergencyCase,
    EmergencyUpdate,
    EmergencyAction,
    EmergencyResource,
    EmergencyContact,
    EmergencyPlan,
    EmergencyDrillRecord,
    EmergencyType,
    EmergencyStatus,
    EmergencySeverity,
    EmergencyEscalation,
    EscalationLevel
)
from .notification_service import NotificationService

# Logger einrichten
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("emergency_service")

class EmergencyService:
    """Service für das Notfall- und Krisenmanagement"""
    
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)
    
    # --- Notfälle verwalten ---
    
    def create_emergency(self, data: Dict[str, Any]) -> EmergencyCase:
        """Erstellt einen neuen Notfall"""
        try:
            # Verarbeite Ressourcen und Kontakte, falls vorhanden
            resource_ids = data.pop('resource_ids', [])
            contact_ids = data.pop('contact_ids', [])
            
            # Erstelle den Notfall
            emergency = EmergencyCase(**data)
            self.db.add(emergency)
            self.db.flush()  # Generiere die ID
            
            # Füge Ressourcen hinzu, falls vorhanden
            if resource_ids:
                resources = self.db.query(EmergencyResource).filter(EmergencyResource.id.in_(resource_ids)).all()
                emergency.resources = resources
            
            # Füge Kontakte hinzu, falls vorhanden
            if contact_ids:
                contacts = self.db.query(EmergencyContact).filter(EmergencyContact.id.in_(contact_ids)).all()
                emergency.contacts = contacts
            
            # Wende einen Notfallplan an, falls vorhanden
            plan_id = data.get('plan_id')
            if plan_id:
                self.apply_emergency_plan(emergency.id, plan_id)
            
            self.db.commit()
            
            # Sende Benachrichtigungen
            self.notification_service.send_emergency_notification(emergency, "creation")
            
            return emergency
        except Exception as e:
            self.db.rollback()
            raise e
    
    def get_emergency_by_id(self, emergency_id: int) -> Optional[EmergencyCase]:
        """Gibt einen Notfall anhand seiner ID zurück"""
        return self.db.query(EmergencyCase).filter(EmergencyCase.id == emergency_id).first()
    
    def get_emergencies(self, 
                       status: Optional[EmergencyStatus] = None,
                       emergency_type: Optional[EmergencyType] = None,
                       severity: Optional[EmergencySeverity] = None,
                       active_only: bool = True) -> List[EmergencyCase]:
        """Gibt Notfälle basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyCase)
        
        if status:
            query = query.filter(EmergencyCase.status == status)
        
        if emergency_type:
            query = query.filter(EmergencyCase.emergency_type == emergency_type)
        
        if severity:
            query = query.filter(EmergencyCase.severity == severity)
        
        if active_only:
            query = query.filter(EmergencyCase.status.in_([
                EmergencyStatus.NEW,
                EmergencyStatus.IN_PROGRESS,
                EmergencyStatus.CONTAINED
            ]))
        
        # Nach Erstellungsdatum sortieren (neueste zuerst)
        query = query.order_by(desc(EmergencyCase.created_at))
        
        return query.all()
    
    def update_emergency(self, emergency_id: int, data: Dict[str, Any]) -> Optional[EmergencyCase]:
        """Aktualisiert einen bestehenden Notfall"""
        try:
            emergency = self.get_emergency_by_id(emergency_id)
            if not emergency:
                return None
            
            # Aktualisiere die Ressourcen, falls vorhanden
            resource_ids = data.pop('resource_ids', None)
            if resource_ids is not None:
                resources = self.db.query(EmergencyResource).filter(EmergencyResource.id.in_(resource_ids)).all()
                emergency.resources = resources
            
            # Aktualisiere die Kontakte, falls vorhanden
            contact_ids = data.pop('contact_ids', None)
            if contact_ids is not None:
                contacts = self.db.query(EmergencyContact).filter(EmergencyContact.id.in_(contact_ids)).all()
                emergency.contacts = contacts
            
            # Aktualisiere die restlichen Felder
            for key, value in data.items():
                if hasattr(emergency, key):
                    setattr(emergency, key, value)
            
            self.db.commit()
            
            # Sende Benachrichtigungen
            self.notification_service.send_emergency_notification(emergency, "update")
            
            return emergency
        except Exception as e:
            self.db.rollback()
            raise e
    
    def add_emergency_update(self, emergency_id: int, update_text: str, user_id: int) -> Optional[EmergencyUpdate]:
        """Fügt ein Update zu einem Notfall hinzu"""
        emergency = self.get_emergency_by_id(emergency_id)
        if not emergency:
            logger.warning(f"Notfall mit ID {emergency_id} nicht gefunden")
            return None
        
        update = EmergencyUpdate(
            emergency_id=emergency_id,
            update_text=update_text,
            created_by_id=user_id
        )
        
        self.db.add(update)
        self.db.commit()
        self.db.refresh(update)
        
        logger.info(f"Update zu Notfall {emergency_id} hinzugefügt")
        return update
    
    def add_emergency_action(self, emergency_id: int, data: Dict[str, Any]) -> Optional[EmergencyAction]:
        """Fügt eine Aktion zu einem Notfall hinzu"""
        emergency = self.get_emergency_by_id(emergency_id)
        if not emergency:
            logger.warning(f"Notfall mit ID {emergency_id} nicht gefunden")
            return None
        
        action = EmergencyAction(
            emergency_id=emergency_id,
            description=data.get('description'),
            due_date=data.get('due_date'),
            assigned_to_id=data.get('assigned_to_id')
        )
        
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        
        logger.info(f"Aktion zu Notfall {emergency_id} hinzugefügt")
        return action
    
    def mark_action_complete(self, action_id: int) -> Optional[EmergencyAction]:
        """Markiert eine Aktion als abgeschlossen"""
        action = self.db.query(EmergencyAction).filter(EmergencyAction.id == action_id).first()
        if not action:
            logger.warning(f"Aktion mit ID {action_id} nicht gefunden")
            return None
        
        action.is_completed = True
        action.completed_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(action)
        
        logger.info(f"Aktion {action_id} als abgeschlossen markiert")
        return action
    
    def close_emergency(self, emergency_id: int, resolution_notes: str = None) -> Optional[EmergencyCase]:
        """Schließt einen Notfall ab"""
        try:
            emergency = self.get_emergency_by_id(emergency_id)
            if not emergency:
                return None
            
            # Prüfe, ob der Notfall bereits abgeschlossen ist
            if emergency.status == EmergencyStatus.CLOSED:
                return emergency
            
            # Setze den Status auf CLOSED
            emergency.status = EmergencyStatus.CLOSED
            
            # Füge Auflösungsnotizen hinzu, falls vorhanden
            if resolution_notes:
                update = EmergencyUpdate(
                    emergency_id=emergency_id,
                    update_text=f"Notfall abgeschlossen: {resolution_notes}",
                    created_by_id=None  # Hier könnte die ID des aktuellen Benutzers stehen
                )
                self.db.add(update)
            
            self.db.commit()
            
            # Sende Benachrichtigungen
            self.notification_service.send_emergency_notification(emergency, "resolution")
            
            return emergency
        except Exception as e:
            self.db.rollback()
            raise e
    
    # --- Ressourcenverwaltung ---
    
    def create_resource(self, data: Dict[str, Any]) -> EmergencyResource:
        """Erstellt eine neue Notfallressource"""
        resource = EmergencyResource(
            name=data.get('name'),
            type=data.get('type'),
            location=data.get('location'),
            quantity=data.get('quantity', 1),
            last_checked=data.get('last_checked'),
            next_check_due=data.get('next_check_due'),
            is_available=data.get('is_available', True),
            notes=data.get('notes')
        )
        
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        
        logger.info(f"Notfallressource erstellt: {resource.name} (ID: {resource.id})")
        return resource
    
    def get_resource_by_id(self, resource_id: int) -> Optional[EmergencyResource]:
        """Gibt eine Ressource anhand ihrer ID zurück"""
        return self.db.query(EmergencyResource).filter(EmergencyResource.id == resource_id).first()
    
    def get_resources(self, available_only: bool = False, resource_type: str = None) -> List[EmergencyResource]:
        """Gibt Ressourcen basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyResource)
        
        if available_only:
            query = query.filter(EmergencyResource.is_available == True)
        
        if resource_type:
            query = query.filter(EmergencyResource.type == resource_type)
        
        return query.all()
    
    def update_resource(self, resource_id: int, data: Dict[str, Any]) -> Optional[EmergencyResource]:
        """Aktualisiert eine bestehende Ressource"""
        resource = self.get_resource_by_id(resource_id)
        if not resource:
            logger.warning(f"Ressource mit ID {resource_id} nicht gefunden")
            return None
        
        for key, value in data.items():
            if hasattr(resource, key):
                setattr(resource, key, value)
        
        self.db.commit()
        self.db.refresh(resource)
        
        logger.info(f"Ressource aktualisiert: {resource.name} (ID: {resource.id})")
        return resource
    
    # --- Kontaktverwaltung ---
    
    def create_contact(self, data: Dict[str, Any]) -> EmergencyContact:
        """Erstellt einen neuen Notfallkontakt"""
        contact = EmergencyContact(
            name=data.get('name'),
            role=data.get('role'),
            organization=data.get('organization'),
            is_external=data.get('is_external', False),
            phone_primary=data.get('phone_primary'),
            phone_secondary=data.get('phone_secondary'),
            email=data.get('email'),
            area_of_expertise=data.get('area_of_expertise'),
            notes=data.get('notes')
        )
        
        self.db.add(contact)
        self.db.commit()
        self.db.refresh(contact)
        
        logger.info(f"Notfallkontakt erstellt: {contact.name} (ID: {contact.id})")
        return contact
    
    def get_contact_by_id(self, contact_id: int) -> Optional[EmergencyContact]:
        """Gibt einen Kontakt anhand seiner ID zurück"""
        return self.db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
    
    def get_contacts(self, is_external: Optional[bool] = None, area_of_expertise: str = None) -> List[EmergencyContact]:
        """Gibt Kontakte basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyContact)
        
        if is_external is not None:
            query = query.filter(EmergencyContact.is_external == is_external)
        
        if area_of_expertise:
            query = query.filter(EmergencyContact.area_of_expertise.ilike(f"%{area_of_expertise}%"))
        
        return query.order_by(EmergencyContact.name).all()
    
    def update_contact(self, contact_id: int, data: Dict[str, Any]) -> Optional[EmergencyContact]:
        """Aktualisiert einen bestehenden Kontakt"""
        contact = self.get_contact_by_id(contact_id)
        if not contact:
            logger.warning(f"Kontakt mit ID {contact_id} nicht gefunden")
            return None
        
        for key, value in data.items():
            if hasattr(contact, key):
                setattr(contact, key, value)
        
        self.db.commit()
        self.db.refresh(contact)
        
        logger.info(f"Kontakt aktualisiert: {contact.name} (ID: {contact.id})")
        return contact
    
    # --- Notfallpläne ---
    
    def create_emergency_plan(self, data: Dict[str, Any]) -> EmergencyPlan:
        """Erstellt einen neuen Notfallplan"""
        plan = EmergencyPlan(
            name=data.get('name'),
            emergency_type=data.get('emergency_type'),
            description=data.get('description'),
            is_active=data.get('is_active', True)
        )
        
        if 'steps' in data:
            plan.set_steps(data['steps'])
        
        if 'required_resources' in data:
            plan.required_resources = json.dumps(data['required_resources'])
        
        if 'required_contacts' in data:
            plan.required_contacts = json.dumps(data['required_contacts'])
        
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        
        logger.info(f"Notfallplan erstellt: {plan.name} (ID: {plan.id})")
        return plan
    
    def get_plan_by_id(self, plan_id: int) -> Optional[EmergencyPlan]:
        """Gibt einen Notfallplan anhand seiner ID zurück"""
        return self.db.query(EmergencyPlan).filter(EmergencyPlan.id == plan_id).first()
    
    def get_plans(self, emergency_type: Optional[EmergencyType] = None, active_only: bool = True) -> List[EmergencyPlan]:
        """Gibt Notfallpläne basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyPlan)
        
        if emergency_type:
            query = query.filter(EmergencyPlan.emergency_type == emergency_type)
        
        if active_only:
            query = query.filter(EmergencyPlan.is_active == True)
        
        return query.order_by(EmergencyPlan.name).all()
    
    def update_plan(self, plan_id: int, data: Dict[str, Any]) -> Optional[EmergencyPlan]:
        """Aktualisiert einen bestehenden Notfallplan"""
        plan = self.get_plan_by_id(plan_id)
        if not plan:
            logger.warning(f"Notfallplan mit ID {plan_id} nicht gefunden")
            return None
        
        for key, value in data.items():
            if key == 'steps':
                plan.set_steps(value)
            elif key == 'required_resources':
                plan.required_resources = json.dumps(value)
            elif key == 'required_contacts':
                plan.required_contacts = json.dumps(value)
            elif hasattr(plan, key):
                setattr(plan, key, value)
        
        plan.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(plan)
        
        logger.info(f"Notfallplan aktualisiert: {plan.name} (ID: {plan.id})")
        return plan
    
    def apply_emergency_plan(self, emergency_id: int, plan_id: int) -> bool:
        """
        Wendet einen Notfallplan auf einen bestehenden Notfall an:
        - Fügt erforderliche Ressourcen hinzu
        - Fügt erforderliche Kontakte hinzu
        - Erstellt Aktionen aus den Schritten des Plans
        """
        emergency = self.get_emergency_by_id(emergency_id)
        plan = self.get_plan_by_id(plan_id)
        
        if not emergency or not plan:
            logger.warning(f"Notfall {emergency_id} oder Plan {plan_id} nicht gefunden")
            return False
        
        # Response-Plan aus dem Notfallplan übernehmen
        if not emergency.response_plan:
            plan_data = {
                "plan_name": plan.name,
                "plan_id": plan.id,
                "emergency_type": plan.emergency_type.name,
                "applied_at": datetime.utcnow().isoformat()
            }
            emergency.set_response_plan(plan_data)
        
        # Ressourcen hinzufügen
        resource_ids = plan.get_required_resources()
        if resource_ids:
            resources = self.db.query(EmergencyResource).filter(
                EmergencyResource.id.in_(resource_ids)
            ).all()
            for resource in resources:
                if resource not in emergency.resources:
                    emergency.resources.append(resource)
        
        # Kontakte hinzufügen
        contact_ids = plan.get_required_contacts()
        if contact_ids:
            contacts = self.db.query(EmergencyContact).filter(
                EmergencyContact.id.in_(contact_ids)
            ).all()
            for contact in contacts:
                if contact not in emergency.contacts:
                    emergency.contacts.append(contact)
        
        # Aktionen aus Schritten erstellen
        steps = plan.get_steps()
        for i, step in enumerate(steps):
            # Prüfen, ob diese Aktion bereits existiert
            existing_action = self.db.query(EmergencyAction).filter(
                and_(
                    EmergencyAction.emergency_id == emergency_id,
                    EmergencyAction.description == step.get('description')
                )
            ).first()
            
            if not existing_action:
                # Aktion mit Fälligkeitsdatum erstellen (falls im Schritt angegeben)
                due_date = None
                if 'timeframe_hours' in step:
                    due_date = datetime.utcnow() + timedelta(hours=step['timeframe_hours'])
                
                action = EmergencyAction(
                    emergency_id=emergency_id,
                    description=step.get('description'),
                    due_date=due_date,
                    assigned_to_id=step.get('assigned_to_id')
                )
                self.db.add(action)
        
        # Status auf "In Bearbeitung" setzen, falls der Notfall neu ist
        if emergency.status == EmergencyStatus.NEW:
            emergency.status = EmergencyStatus.IN_PROGRESS
        
        self.db.commit()
        
        # Update hinzufügen
        self.add_emergency_update(
            emergency_id=emergency_id,
            update_text=f"Notfallplan '{plan.name}' angewendet.",
            user_id=emergency.assigned_to_id or emergency.reported_by_id
        )
        
        logger.info(f"Notfallplan {plan.id} auf Notfall {emergency_id} angewendet")
        return True
    
    # --- Notfallübungen ---
    
    def record_emergency_drill(self, data: Dict[str, Any]) -> EmergencyDrillRecord:
        """Erfasst eine durchgeführte Notfallübung"""
        drill = EmergencyDrillRecord(
            plan_id=data.get('plan_id'),
            date_conducted=data.get('date_conducted', datetime.utcnow()),
            duration_minutes=data.get('duration_minutes'),
            outcome=data.get('outcome'),
            notes=data.get('notes'),
            issues_identified=data.get('issues_identified')
        )
        
        if 'participants' in data:
            drill.participants = json.dumps(data['participants'])
        
        self.db.add(drill)
        self.db.commit()
        self.db.refresh(drill)
        
        logger.info(f"Notfallübung für Plan {data.get('plan_id')} erfasst (ID: {drill.id})")
        return drill
    
    def get_drill_records(self, plan_id: Optional[int] = None, limit: int = 20) -> List[EmergencyDrillRecord]:
        """Gibt Aufzeichnungen über Notfallübungen zurück"""
        query = self.db.query(EmergencyDrillRecord)
        
        if plan_id:
            query = query.filter(EmergencyDrillRecord.plan_id == plan_id)
        
        return query.order_by(desc(EmergencyDrillRecord.date_conducted)).limit(limit).all()
    
    # --- Berichte und Analysen ---
    
    def get_emergency_stats(self, days: int = 30) -> Dict[str, Any]:
        """Gibt Statistiken über Notfälle zurück"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Gesamtzahl der Notfälle nach Status
        status_counts = {}
        for status in EmergencyStatus:
            count = self.db.query(func.count(EmergencyCase.id)).filter(
                EmergencyCase.status == status,
                EmergencyCase.created_at >= cutoff_date
            ).scalar()
            status_counts[status.name] = count
        
        # Verteilung nach Typ
        type_counts = {}
        for em_type in EmergencyType:
            count = self.db.query(func.count(EmergencyCase.id)).filter(
                EmergencyCase.emergency_type == em_type,
                EmergencyCase.created_at >= cutoff_date
            ).scalar()
            type_counts[em_type.name] = count
        
        # Durchschnittliche Lösungszeit (in Stunden)
        avg_resolution_time = self.db.query(
            func.avg(
                func.extract('epoch', EmergencyCase.updated_at - EmergencyCase.created_at) / 3600
            )
        ).filter(
            EmergencyCase.status == EmergencyStatus.CLOSED,
            EmergencyCase.created_at >= cutoff_date
        ).scalar() or 0
        
        # Anzahl der offenen Notfälle mit hoher Priorität
        high_priority_open = self.db.query(func.count(EmergencyCase.id)).filter(
            EmergencyCase.severity.in_([EmergencySeverity.HIGH, EmergencySeverity.CRITICAL]),
            EmergencyCase.status.in_([EmergencyStatus.NEW, EmergencyStatus.IN_PROGRESS]),
            EmergencyCase.created_at >= cutoff_date
        ).scalar()
        
        return {
            "total_emergencies": sum(status_counts.values()),
            "status_distribution": status_counts,
            "type_distribution": type_counts,
            "avg_resolution_time_hours": round(avg_resolution_time, 1),
            "high_priority_open": high_priority_open,
            "time_period_days": days
        }
    
    # --- Eskalationsmanagement ---
    
    def create_escalation(self, emergency_id: int, data: Dict[str, Any]) -> Optional[EmergencyEscalation]:
        """Erstellt eine neue Eskalation für einen Notfall"""
        try:
            # Prüfe, ob der Notfall existiert
            emergency = self.get_emergency_by_id(emergency_id)
            if not emergency:
                return None
            
            # Erstelle die Eskalation
            escalation_data = {
                'emergency_id': emergency_id,
                'escalation_level': data.get('escalation_level'),
                'reason': data.get('reason'),
                'escalated_by_id': data.get('escalated_by_id'),
                'acknowledgement_required': data.get('acknowledgement_required', True)
            }
            
            # Setze die Empfänger, falls vorhanden
            recipients = data.get('escalation_recipients', [])
            
            escalation = EmergencyEscalation(**escalation_data)
            if recipients:
                escalation.set_recipients(recipients)
            
            self.db.add(escalation)
            self.db.commit()
            
            # Lade die Eskalation neu, um alle Beziehungen zu haben
            escalation = self.get_escalation_by_id(escalation.id)
            
            # Sende Benachrichtigungen
            self.notification_service.send_escalation_notification(escalation)
            
            return escalation
        except Exception as e:
            self.db.rollback()
            raise e
    
    def get_escalation_by_id(self, escalation_id: int) -> Optional[EmergencyEscalation]:
        """Gibt eine Eskalation anhand ihrer ID zurück"""
        return self.db.query(EmergencyEscalation).filter(EmergencyEscalation.id == escalation_id).first()
    
    def get_escalations(self, emergency_id: Optional[int] = None, level: Optional[EscalationLevel] = None, resolved: bool = False) -> List[EmergencyEscalation]:
        """Gibt Eskalationen basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyEscalation)
        
        if emergency_id:
            query = query.filter(EmergencyEscalation.emergency_id == emergency_id)
        
        if level:
            query = query.filter(EmergencyEscalation.escalation_level == level)
        
        if not resolved:
            query = query.filter(EmergencyEscalation.resolved_at.is_(None))
        
        # Nach Erstellungsdatum sortieren (neueste zuerst)
        query = query.order_by(desc(EmergencyEscalation.escalated_at))
        
        return query.all()
    
    def acknowledge_escalation(self, escalation_id: int, acknowledged_by_id: Optional[int] = None) -> Optional[EmergencyEscalation]:
        """Bestätigt eine Eskalation"""
        try:
            escalation = self.get_escalation_by_id(escalation_id)
            if not escalation:
                return None
            
            # Prüfe, ob die Eskalation bereits bestätigt ist
            if escalation.acknowledgement_time is not None:
                return escalation
            
            # Setze die Bestätigungszeit und den Bestätiger
            escalation.acknowledgement_time = datetime.utcnow()
            if acknowledged_by_id:
                escalation.acknowledged_by_id = acknowledged_by_id
            
            # Erstelle ein Update für den zugehörigen Notfall
            emergency = self.get_emergency_by_id(escalation.emergency_id)
            if emergency:
                level_text = escalation.escalation_level.value
                update = EmergencyUpdate(
                    emergency_id=escalation.emergency_id,
                    update_text=f"Eskalation ({level_text}) wurde bestätigt",
                    created_by_id=acknowledged_by_id
                )
                self.db.add(update)
            
            self.db.commit()
            
            # Sende Benachrichtigung für das Update
            if emergency:
                self.notification_service.send_emergency_notification(emergency, "update")
            
            return escalation
        except Exception as e:
            self.db.rollback()
            raise e
    
    def resolve_escalation(self, escalation_id: int, resolution_notes: str, resolved_by_id: Optional[int] = None) -> Optional[EmergencyEscalation]:
        """Löst eine Eskalation auf"""
        try:
            escalation = self.get_escalation_by_id(escalation_id)
            if not escalation:
                return None
            
            # Prüfe, ob die Eskalation bereits aufgelöst ist
            if escalation.resolved_at is not None:
                return escalation
            
            # Setze die Auflösungszeit und Notizen
            escalation.resolved_at = datetime.utcnow()
            escalation.resolution_notes = resolution_notes
            
            # Erstelle ein Update für den zugehörigen Notfall
            emergency = self.get_emergency_by_id(escalation.emergency_id)
            if emergency:
                level_text = escalation.escalation_level.value
                update = EmergencyUpdate(
                    emergency_id=escalation.emergency_id,
                    update_text=f"Eskalation ({level_text}) wurde aufgelöst: {resolution_notes}",
                    created_by_id=resolved_by_id
                )
                self.db.add(update)
            
            self.db.commit()
            
            # Sende Benachrichtigung für das Update
            if emergency:
                self.notification_service.send_emergency_notification(emergency, "update")
            
            return escalation
        except Exception as e:
            self.db.rollback()
            raise e
    
    # --- Statistik ---
    
    def get_emergency_statistics(self, days: int = 30) -> Dict[str, Any]:
        """Gibt Statistiken zu Notfällen zurück"""
        # Zeitraum definieren
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Gesamtanzahl der Notfälle im Zeitraum
        total_emergencies = self.db.query(func.count(EmergencyCase.id)).filter(
            EmergencyCase.created_at >= start_date
        ).scalar()
        
        # Verteilung nach Status
        status_distribution = {}
        for status in EmergencyStatus:
            count = self.db.query(func.count(EmergencyCase.id)).filter(
                EmergencyCase.created_at >= start_date,
                EmergencyCase.status == status
            ).scalar()
            status_distribution[status.value] = count
        
        # Verteilung nach Typ
        type_distribution = {}
        for etype in EmergencyType:
            count = self.db.query(func.count(EmergencyCase.id)).filter(
                EmergencyCase.created_at >= start_date,
                EmergencyCase.emergency_type == etype
            ).scalar()
            type_distribution[etype.value] = count
        
        # Durchschnittliche Lösungszeit in Stunden
        resolved_cases = self.db.query(EmergencyCase).filter(
            EmergencyCase.created_at >= start_date,
            EmergencyCase.status.in_([EmergencyStatus.RESOLVED, EmergencyStatus.CLOSED])
        ).all()
        
        total_hours = 0
        if resolved_cases:
            for case in resolved_cases:
                # Wenn der Fall gelöst oder geschlossen ist, berechne die Zeit von der Erstellung bis zur letzten Aktualisierung
                resolution_time = (case.updated_at - case.created_at).total_seconds() / 3600  # in Stunden
                total_hours += resolution_time
            
            avg_resolution_time = total_hours / len(resolved_cases)
        else:
            avg_resolution_time = 0
        
        # Anzahl der offenen Notfälle mit hoher Priorität
        high_priority_open = self.db.query(func.count(EmergencyCase.id)).filter(
            EmergencyCase.created_at >= start_date,
            EmergencyCase.status.in_([EmergencyStatus.NEW, EmergencyStatus.IN_PROGRESS]),
            EmergencyCase.severity.in_([EmergencySeverity.HIGH, EmergencySeverity.CRITICAL])
        ).scalar()
        
        return {
            "total_emergencies": total_emergencies,
            "status_distribution": status_distribution,
            "type_distribution": type_distribution,
            "avg_resolution_time_hours": avg_resolution_time,
            "high_priority_open": high_priority_open,
            "time_period_days": days
        }
    
    # --- Übungen ---
    
    def create_drill(self, data: Dict[str, Any]) -> EmergencyDrillRecord:
        """Zeichnet eine neue Notfallübung auf"""
        drill = EmergencyDrillRecord(
            plan_id=data.get('plan_id'),
            date_conducted=data.get('date_conducted', datetime.utcnow()),
            duration_minutes=data.get('duration_minutes'),
            outcome=data.get('outcome'),
            notes=data.get('notes'),
            issues_identified=data.get('issues_identified')
        )
        
        # Teilnehmer hinzufügen, falls vorhanden
        if 'participants' in data and data['participants']:
            drill.participants = json.dumps(data['participants'])
        
        self.db.add(drill)
        self.db.commit()
        self.db.refresh(drill)
        
        logger.info(f"Notfallübung aufgezeichnet: Plan ID {drill.plan_id}")
        return drill
    
    def get_drill_by_id(self, drill_id: int) -> Optional[EmergencyDrillRecord]:
        """Gibt eine Notfallübung anhand ihrer ID zurück"""
        return self.db.query(EmergencyDrillRecord).filter(EmergencyDrillRecord.id == drill_id).first()
    
    def get_drills(self, plan_id: Optional[int] = None) -> List[EmergencyDrillRecord]:
        """Gibt Notfallübungen basierend auf Filterkriterien zurück"""
        query = self.db.query(EmergencyDrillRecord)
        
        if plan_id:
            query = query.filter(EmergencyDrillRecord.plan_id == plan_id)
        
        # Nach Durchführungsdatum sortieren (neueste zuerst)
        query = query.order_by(desc(EmergencyDrillRecord.date_conducted))
        
        return query.all()

# Globale Instanz erstellen (mit None für DB-Session, muss später gesetzt werden)
emergency_service = None 