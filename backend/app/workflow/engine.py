"""
VALEO NeuroERP 2.0 - Workflow Engine
Automatisierung für alle 12 Module des VALEO Systems
Serena Quality: Complete workflow automation with error handling
"""

from typing import Dict, List, Any, Optional, Union, Callable
from enum import Enum
from datetime import datetime, timedelta
import json
import asyncio
from pydantic import BaseModel, Field
from dataclasses import dataclass
from sqlalchemy.orm import Session
import croniter

from backend.app.database.connection import get_db
from backend.app.monitoring.logging_config import get_logger
from backend.app.monitoring.metrics import metrics_collector
from backend.app.optimization.caching import cache_manager
from backend.app.config.production import settings

logger = get_logger("workflow.engine")

# Workflow Types
class WorkflowType(str, Enum):
    # Basierend auf VALEO 1.0.5 Modulen
    PERSONAL_MANAGEMENT = "personal_management"
    FINANZBUCHHALTUNG = "finanzbuchhaltung"
    ANLAGENVERWALTUNG = "anlagenverwaltung"
    PRODUKTIONSMANAGEMENT = "produktionsmanagement"
    LAGERVERWALTUNG = "lagerverwaltung"
    EINKAUFSMANAGEMENT = "einkaufsmanagement"
    VERKAUFSMANAGEMENT = "verkaufsmanagement"
    QUALITAETSMANAGEMENT = "qualitaetsmanagement"
    CRM = "crm"
    PROJEKTMANAGEMENT = "projektmanagement"
    DOKUMENTENVERWALTUNG = "dokumentenverwaltung"
    REPORTING = "reporting"
    
    # Übergreifende Workflows
    CROSS_MODULE = "cross_module"
    SYSTEM_MAINTENANCE = "system_maintenance"
    DATA_SYNC = "data_sync"

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class WorkflowPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

# Workflow Models
class WorkflowStep(BaseModel):
    """Single step in a workflow"""
    id: str
    name: str
    action: str
    parameters: Dict[str, Any] = {}
    conditions: List[str] = []
    timeout: int = 300  # seconds
    retry_count: int = 3
    retry_delay: int = 60  # seconds

class WorkflowDefinition(BaseModel):
    """Complete workflow definition"""
    id: str
    name: str
    description: str
    module: WorkflowType
    steps: List[WorkflowStep]
    triggers: List[str] = []  # cron expressions or event names
    priority: WorkflowPriority = WorkflowPriority.NORMAL
    timeout: int = 3600  # 1 hour default
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class WorkflowInstance(BaseModel):
    """Running workflow instance"""
    id: str
    workflow_id: str
    status: WorkflowStatus
    current_step: Optional[str] = None
    progress: float = 0.0
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result_data: Dict[str, Any] = {}
    context: Dict[str, Any] = {}

# Workflow Actions
class WorkflowAction:
    """Base class for workflow actions"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = get_logger(f"workflow.action.{name}")
    
    async def execute(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the action"""
        raise NotImplementedError
    
    def validate_parameters(self, parameters: Dict[str, Any]) -> bool:
        """Validate action parameters"""
        return True

# Landhandel-spezifische Workflow Actions
class LagerverwaltungActions:
    """Warehouse management actions for agricultural business"""
    
    @staticmethod
    class CheckLowStock(WorkflowAction):
        def __init__(self):
            super().__init__("check_low_stock")
        
        async def execute(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
            db = next(get_db())
            
            try:
                from backend.app.models import Article
                
                # Find articles with low stock
                low_stock_items = db.query(Article).filter(
                    Article.lagerbestand <= Article.mindestbestand,
                    Article.ist_lagerartikel == True,
                    Article.status == 'aktiv'
                ).all()
                
                result = {
                    "low_stock_count": len(low_stock_items),
                    "items": [
                        {
                            "id": item.id,
                            "name": item.bezeichnung,
                            "current_stock": item.lagerbestand,
                            "min_stock": item.mindestbestand,
                            "product_type": item.produkttyp
                        }
                        for item in low_stock_items
                    ]
                }
                
                # Generate order suggestions for agricultural products
                if low_stock_items:
                    suggestions = []
                    for item in low_stock_items:
                        if item.produkttyp in ['Saatgut', 'Düngemittel', 'Pflanzenschutz']:
                            suggested_order = max(
                                item.mindestbestand * 2 - item.lagerbestand,
                                item.mindestbestand
                            )
                            suggestions.append({
                                "article_id": item.id,
                                "suggested_quantity": suggested_order,
                                "reason": "Landhandel saisonaler Bedarf"
                            })
                    
                    result["order_suggestions"] = suggestions
                
                return result
                
            finally:
                db.close()
    
    @staticmethod
    class GenerateOrderSuggestions(WorkflowAction):
        def __init__(self):
            super().__init__("generate_order_suggestions")
        
        async def execute(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
            db = next(get_db())
            
            try:
                from backend.app.models import Article, Verkaufsauftrag
                from sqlalchemy import func
                
                # Analyze seasonal patterns for agricultural products
                current_month = datetime.now().month
                
                # Spring (March-May): High demand for seeds and fertilizers
                if current_month in [3, 4, 5]:
                    seasonal_factor = 1.5
                    priority_products = ['Saatgut', 'Düngemittel']
                # Summer (June-August): High demand for plant protection
                elif current_month in [6, 7, 8]:
                    seasonal_factor = 1.3
                    priority_products = ['Pflanzenschutz']
                # Autumn (September-November): Harvest preparation
                elif current_month in [9, 10, 11]:
                    seasonal_factor = 1.2
                    priority_products = ['Düngemittel']
                else:
                    seasonal_factor = 1.0
                    priority_products = []
                
                # Get sales data for the last 3 months
                three_months_ago = datetime.now() - timedelta(days=90)
                
                sales_data = db.query(
                    Verkaufsauftrag.artikel_id,
                    func.sum(Verkaufsauftrag.menge).label('total_sales')
                ).filter(
                    Verkaufsauftrag.erstellungsdatum >= three_months_ago
                ).group_by(Verkaufsauftrag.artikel_id).all()
                
                # Calculate suggested orders
                suggestions = []
                for article_id, total_sales in sales_data:
                    article = db.query(Article).filter(Article.id == article_id).first()
                    if article and article.ist_lagerartikel:
                        # Calculate average monthly sales
                        avg_monthly_sales = total_sales / 3
                        
                        # Apply seasonal factor
                        seasonal_demand = avg_monthly_sales * seasonal_factor
                        
                        # Calculate suggested order quantity
                        current_stock = article.lagerbestand
                        safety_stock = article.mindestbestand
                        suggested_order = max(
                            seasonal_demand * 2 - current_stock + safety_stock,
                            safety_stock
                        )
                        
                        # Prioritize seasonal products
                        priority = "high" if article.produkttyp in priority_products else "normal"
                        
                        suggestions.append({
                            "article_id": article.id,
                            "article_name": article.bezeichnung,
                            "product_type": article.produkttyp,
                            "current_stock": current_stock,
                            "suggested_order": suggested_order,
                            "priority": priority,
                            "reason": f"Saisonale Nachfrage ({seasonal_factor}x)"
                        })
                
                return {
                    "suggestions": suggestions,
                    "seasonal_factor": seasonal_factor,
                    "priority_products": priority_products
                }
                
            finally:
                db.close()

class CRMActions:
    """CRM workflow actions"""
    
    @staticmethod
    class GenerateFollowUpReminders(WorkflowAction):
        def __init__(self):
            super().__init__("generate_follow_up_reminders")
        
        async def execute(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
            db = next(get_db())
            
            try:
                from backend.app.models import Tagesprotokoll, Customer, Employee
                
                # Find protocols with pending follow-ups
                today = datetime.now().date()
                pending_followups = db.query(Tagesprotokoll).filter(
                    Tagesprotokoll.wiedervorlage <= today,
                    Tagesprotokoll.wiedervorlage_erledigt == False
                ).all()
                
                reminders = []
                for protocol in pending_followups:
                    reminders.append({
                        "protocol_id": protocol.id,
                        "customer_name": protocol.kunde.firmenname,
                        "follow_up_date": protocol.wiedervorlage.strftime('%d.%m.%Y'),
                        "topic": protocol.gespraechsthema or "Allgemeines Gespräch",
                        "employee": protocol.mitarbeiter.name if protocol.mitarbeiter else "Unbekannt"
                    })
                
                return {
                    "pending_followups": len(reminders),
                    "reminders": reminders
                }
                
            finally:
                db.close()

class ReportingActions:
    """Reporting and analytics actions"""
    
    @staticmethod
    class GenerateKPIReport(WorkflowAction):
        def __init__(self):
            super().__init__("generate_kpi_report")
        
        async def execute(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
            db = next(get_db())
            
            try:
                from backend.app.models import Invoice, Customer, Article
                from sqlalchemy import func
                
                # Calculate KPIs
                now = datetime.now()
                month_start = now.replace(day=1)
                year_start = now.replace(month=1, day=1)
                
                # Financial KPIs
                revenue_mtd = db.query(func.sum(Invoice.bruttobetrag)).filter(
                    Invoice.rechnungsdatum >= month_start,
                    Invoice.status != 'storniert'
                ).scalar() or 0
                
                revenue_ytd = db.query(func.sum(Invoice.bruttobetrag)).filter(
                    Invoice.rechnungsdatum >= year_start,
                    Invoice.status != 'storniert'
                ).scalar() or 0
                
                # Customer KPIs
                new_customers_month = db.query(func.count(Customer.id)).filter(
                    Customer.created_at >= month_start
                ).scalar() or 0
                
                # Inventory KPIs
                critical_items = db.query(func.count(Article.id)).filter(
                    Article.lagerbestand <= Article.mindestbestand,
                    Article.ist_lagerartikel == True
                ).scalar() or 0
                
                # Landhandel specific
                seed_sales = db.query(func.sum(Article.lagerbestand)).filter(
                    Article.produkttyp == 'Saatgut'
                ).scalar() or 0
                
                fertilizer_sales = db.query(func.sum(Article.lagerbestand)).filter(
                    Article.produkttyp == 'Düngemittel'
                ).scalar() or 0
                
                kpis = {
                    'revenue_mtd': float(revenue_mtd),
                    'revenue_ytd': float(revenue_ytd),
                    'new_customers_month': new_customers_month,
                    'critical_items': critical_items,
                    'seed_sales': float(seed_sales),
                    'fertilizer_sales': float(fertilizer_sales)
                }
                
                # Generate insights
                insights = []
                if critical_items > 5:
                    insights.append({
                        "type": "warning",
                        "message": f"{critical_items} Artikel haben kritischen Bestand",
                        "action": "Bestellvorschläge prüfen"
                    })
                
                if new_customers_month < 5:
                    insights.append({
                        "type": "info",
                        "message": "Wenige neue Kunden im Monat",
                        "action": "Vertriebsaktivitäten verstärken"
                    })
                
                return {
                    "kpis": kpis,
                    "insights": insights,
                    "generated_at": datetime.now().isoformat()
                }
                
            finally:
                db.close()

# Workflow Engine
class WorkflowEngine:
    """Main workflow engine for VALEO NeuroERP"""
    
    def __init__(self):
        self.workflows: Dict[str, WorkflowDefinition] = {}
        self.instances: Dict[str, WorkflowInstance] = {}
        self.actions: Dict[str, WorkflowAction] = {}
        
        # Register actions
        self._register_actions()
        
        # Register default workflows
        self._register_default_workflows()
        
        logger.info("Workflow engine initialized")
    
    def _register_actions(self):
        """Register all available workflow actions"""
        # Lagerverwaltung actions
        self.actions["check_low_stock"] = LagerverwaltungActions.CheckLowStock()
        self.actions["generate_order_suggestions"] = LagerverwaltungActions.GenerateOrderSuggestions()
        
        # CRM actions
        self.actions["generate_follow_up_reminders"] = CRMActions.GenerateFollowUpReminders()
        
        # Reporting actions
        self.actions["generate_kpi_report"] = ReportingActions.GenerateKPIReport()
        
        logger.info(f"Registered {len(self.actions)} workflow actions")
    
    def _register_default_workflows(self):
        """Register default workflows for VALEO modules"""
        
        # Daily warehouse check
        daily_warehouse_check = WorkflowDefinition(
            id="daily_warehouse_check",
            name="Tägliche Lagerprüfung",
            description="Prüft Lagerbestände und generiert Bestellvorschläge",
            module=WorkflowType.LAGERVERWALTUNG,
            steps=[
                WorkflowStep(
                    id="check_stock",
                    name="Lagerbestand prüfen",
                    action="check_low_stock",
                    parameters={}
                ),
                WorkflowStep(
                    id="generate_suggestions",
                    name="Bestellvorschläge generieren",
                    action="generate_order_suggestions",
                    parameters={}
                )
            ],
            triggers=["0 8 * * *"],  # Daily at 8 AM
            priority=WorkflowPriority.HIGH
        )
        
        # Weekly CRM follow-up
        weekly_crm_followup = WorkflowDefinition(
            id="weekly_crm_followup",
            name="Wöchentliche CRM-Nachverfolgung",
            description="Generiert Erinnerungen für offene Wiedervorlagen",
            module=WorkflowType.CRM,
            steps=[
                WorkflowStep(
                    id="check_followups",
                    name="Wiedervorlagen prüfen",
                    action="generate_follow_up_reminders",
                    parameters={}
                )
            ],
            triggers=["0 9 * * 1"],  # Monday at 9 AM
            priority=WorkflowPriority.NORMAL
        )
        
        # Monthly KPI report
        monthly_kpi_report = WorkflowDefinition(
            id="monthly_kpi_report",
            name="Monatlicher KPI-Bericht",
            description="Generiert monatliche KPI-Berichte",
            module=WorkflowType.REPORTING,
            steps=[
                WorkflowStep(
                    id="generate_report",
                    name="KPI-Bericht generieren",
                    action="generate_kpi_report",
                    parameters={}
                )
            ],
            triggers=["0 10 1 * *"],  # 1st of month at 10 AM
            priority=WorkflowPriority.NORMAL
        )
        
        # Register workflows
        self.workflows[daily_warehouse_check.id] = daily_warehouse_check
        self.workflows[weekly_crm_followup.id] = weekly_crm_followup
        self.workflows[monthly_kpi_report.id] = monthly_kpi_report
        
        logger.info(f"Registered {len(self.workflows)} default workflows")
    
    async def execute_workflow(self, workflow_id: str, context: Dict[str, Any] = None) -> WorkflowInstance:
        """Execute a workflow"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        instance = WorkflowInstance(
            id=f"{workflow_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            workflow_id=workflow_id,
            status=WorkflowStatus.RUNNING,
            context=context or {}
        )
        
        self.instances[instance.id] = instance
        
        try:
            logger.info(f"Starting workflow {workflow.name} (ID: {instance.id})")
            
            # Record metrics
            metrics_collector.record_business_event("workflow_started", {
                "workflow_id": workflow_id,
                "module": workflow.module
            })
            
            # Execute steps
            for i, step in enumerate(workflow.steps):
                instance.current_step = step.id
                instance.progress = (i / len(workflow.steps)) * 100
                
                logger.info(f"Executing step {step.name} in workflow {workflow.name}")
                
                # Execute action
                if step.action in self.actions:
                    action = self.actions[step.action]
                    
                    # Validate parameters
                    if not action.validate_parameters(step.parameters):
                        raise ValueError(f"Invalid parameters for action {step.action}")
                    
                    # Execute with timeout
                    try:
                        result = await asyncio.wait_for(
                            action.execute(step.parameters, instance.context),
                            timeout=step.timeout
                        )
                        
                        # Store result in context
                        instance.context[f"step_{step.id}_result"] = result
                        
                        logger.info(f"Step {step.name} completed successfully")
                        
                    except asyncio.TimeoutError:
                        raise Exception(f"Step {step.name} timed out after {step.timeout} seconds")
                    
                else:
                    raise ValueError(f"Action {step.action} not found")
            
            # Workflow completed
            instance.status = WorkflowStatus.COMPLETED
            instance.progress = 100.0
            instance.completed_at = datetime.now()
            
            logger.info(f"Workflow {workflow.name} completed successfully")
            
            # Record metrics
            metrics_collector.record_business_event("workflow_completed", {
                "workflow_id": workflow_id,
                "module": workflow.module,
                "duration": (instance.completed_at - instance.started_at).total_seconds()
            })
            
        except Exception as e:
            instance.status = WorkflowStatus.FAILED
            instance.error_message = str(e)
            instance.completed_at = datetime.now()
            
            logger.error(f"Workflow {workflow.name} failed: {str(e)}")
            
            # Record metrics
            metrics_collector.record_business_event("workflow_failed", {
                "workflow_id": workflow_id,
                "module": workflow.module,
                "error": str(e)
            })
        
        return instance
    
    async def schedule_workflow(self, workflow_id: str, cron_expression: str) -> bool:
        """Schedule a workflow to run based on cron expression"""
        try:
            # Validate cron expression
            croniter.croniter(cron_expression)
            
            # Store schedule in database or cache
            schedule_key = f"workflow_schedule:{workflow_id}"
            await cache_manager.set(
                schedule_key,
                {
                    "workflow_id": workflow_id,
                    "cron_expression": cron_expression,
                    "next_run": self._get_next_run(cron_expression)
                },
                expire=0  # No expiration
            )
            
            logger.info(f"Scheduled workflow {workflow_id} with cron {cron_expression}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to schedule workflow {workflow_id}: {str(e)}")
            return False
    
    def _get_next_run(self, cron_expression: str) -> datetime:
        """Get next run time for cron expression"""
        cron = croniter.croniter(cron_expression, datetime.now())
        return cron.get_next(datetime)
    
    async def check_scheduled_workflows(self):
        """Check and execute scheduled workflows"""
        try:
            # Get all scheduled workflows
            schedules = await cache_manager.get_pattern("workflow_schedule:*")
            
            for schedule_key, schedule_data in schedules.items():
                workflow_id = schedule_data["workflow_id"]
                cron_expression = schedule_data["cron_expression"]
                next_run = datetime.fromisoformat(schedule_data["next_run"])
                
                # Check if it's time to run
                if datetime.now() >= next_run:
                    # Execute workflow
                    await self.execute_workflow(workflow_id)
                    
                    # Update next run time
                    new_next_run = self._get_next_run(cron_expression)
                    schedule_data["next_run"] = new_next_run.isoformat()
                    
                    await cache_manager.set(schedule_key, schedule_data, expire=0)
                    
                    logger.info(f"Executed scheduled workflow {workflow_id}")
        
        except Exception as e:
            logger.error(f"Error checking scheduled workflows: {str(e)}")
    
    def get_workflow_status(self, instance_id: str) -> Optional[WorkflowInstance]:
        """Get status of a workflow instance"""
        return self.instances.get(instance_id)
    
    def get_workflow_history(self, workflow_id: str, limit: int = 10) -> List[WorkflowInstance]:
        """Get history of workflow executions"""
        instances = [
            instance for instance in self.instances.values()
            if instance.workflow_id == workflow_id
        ]
        
        # Sort by start time (newest first)
        instances.sort(key=lambda x: x.started_at, reverse=True)
        
        return instances[:limit]

# Singleton instance
workflow_engine = WorkflowEngine()

# API endpoints for workflow management
from fastapi import APIRouter, Depends, BackgroundTasks
from backend.app.auth.authentication import get_current_active_user

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])

@router.post("/execute/{workflow_id}")
async def execute_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks,
    context: Dict[str, Any] = {},
    current_user = Depends(get_current_active_user)
):
    """Execute a workflow"""
    try:
        instance = await workflow_engine.execute_workflow(workflow_id, context)
        return {
            "instance_id": instance.id,
            "status": instance.status,
            "message": "Workflow execution started"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/schedule/{workflow_id}")
async def schedule_workflow(
    workflow_id: str,
    cron_expression: str,
    current_user = Depends(get_current_active_user)
):
    """Schedule a workflow"""
    success = await workflow_engine.schedule_workflow(workflow_id, cron_expression)
    if success:
        return {"message": f"Workflow {workflow_id} scheduled successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to schedule workflow")

@router.get("/status/{instance_id}")
async def get_workflow_status(
    instance_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get workflow execution status"""
    instance = workflow_engine.get_workflow_status(instance_id)
    if instance:
        return instance
    else:
        raise HTTPException(status_code=404, detail="Workflow instance not found")

@router.get("/history/{workflow_id}")
async def get_workflow_history(
    workflow_id: str,
    limit: int = 10,
    current_user = Depends(get_current_active_user)
):
    """Get workflow execution history"""
    history = workflow_engine.get_workflow_history(workflow_id, limit)
    return {"history": history}

@router.get("/available")
async def get_available_workflows(
    current_user = Depends(get_current_active_user)
):
    """Get list of available workflows"""
    workflows = []
    for workflow_id, workflow in workflow_engine.workflows.items():
        workflows.append({
            "id": workflow.id,
            "name": workflow.name,
            "description": workflow.description,
            "module": workflow.module,
            "enabled": workflow.enabled
        })
    return {"workflows": workflows} 