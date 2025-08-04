"""
VALEO NeuroERP 2.0 - Workflow Engine
Serena Quality: Complete workflow automation with type safety and error handling
"""

from typing import Dict, List, Any, Optional, Callable, Union
from enum import Enum
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, validator
import asyncio
import json
from sqlalchemy.orm import Session
from celery import Task
import croniter

from backend.app.database.connection import get_db
from backend.app.models import Workflow, WorkflowAction, WorkflowCondition
from backend.app.monitoring.logging_config import get_logger
from backend.app.monitoring.metrics import metrics_collector
from backend.app.optimization.caching import cache_manager

logger = get_logger("workflow.engine")

# Workflow Types
class WorkflowTriggerType(str, Enum):
    EVENT = "event"
    SCHEDULE = "schedule"
    MANUAL = "manual"
    WEBHOOK = "webhook"
    CONDITION = "condition"

class WorkflowActionType(str, Enum):
    EMAIL = "email"
    WEBHOOK = "webhook"
    UPDATE = "update"
    CREATE = "create"
    DELETE = "delete"
    NOTIFICATION = "notification"
    APPROVAL = "approval"
    ASSIGN = "assign"
    CALCULATE = "calculate"
    TRANSFORM = "transform"

class WorkflowStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    ERROR = "error"
    TESTING = "testing"

# Workflow Models
class WorkflowTriggerConfig(BaseModel):
    """Configuration for workflow triggers"""
    type: WorkflowTriggerType
    event_name: Optional[str] = None
    schedule: Optional[str] = None  # Cron expression
    webhook_url: Optional[str] = None
    conditions: Optional[List[Dict[str, Any]]] = []
    
    @validator('schedule')
    def validate_cron(cls, v):
        if v:
            try:
                croniter.croniter(v)
            except Exception:
                raise ValueError("Invalid cron expression")
        return v

class WorkflowActionConfig(BaseModel):
    """Configuration for workflow actions"""
    type: WorkflowActionType
    name: str
    description: Optional[str] = None
    
    # Action-specific configs
    email_config: Optional[Dict[str, Any]] = None
    webhook_config: Optional[Dict[str, Any]] = None
    update_config: Optional[Dict[str, Any]] = None
    notification_config: Optional[Dict[str, Any]] = None
    
    # Execution settings
    retry_count: int = 3
    retry_delay: int = 60  # seconds
    timeout: int = 300  # seconds
    
    # Conditions
    conditions: Optional[List[Dict[str, Any]]] = []
    
class WorkflowExecutionContext(BaseModel):
    """Context for workflow execution"""
    workflow_id: str
    execution_id: str
    trigger_data: Dict[str, Any]
    variables: Dict[str, Any] = {}
    user_id: Optional[str] = None
    
    # Execution state
    current_action_index: int = 0
    completed_actions: List[str] = []
    failed_actions: List[str] = []
    
    # Timing
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Results
    results: Dict[str, Any] = {}
    errors: List[Dict[str, Any]] = []

# Action Handlers
class ActionHandler:
    """Base class for action handlers"""
    
    async def execute(self, context: WorkflowExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
    
    async def validate(self, config: Dict[str, Any]) -> bool:
        raise NotImplementedError

class EmailActionHandler(ActionHandler):
    """Handler for email actions"""
    
    async def execute(self, context: WorkflowExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Import email service
            from backend.app.services.email_service import EmailService
            email_service = EmailService()
            
            # Prepare email data
            recipients = self._resolve_recipients(config.get('recipients', []), context)
            subject = self._render_template(config.get('subject', ''), context)
            body = self._render_template(config.get('body', ''), context)
            
            # Send email
            result = await email_service.send_email(
                to=recipients,
                subject=subject,
                body=body,
                template=config.get('template'),
                attachments=config.get('attachments', [])
            )
            
            return {
                "status": "success",
                "message_id": result.get('message_id'),
                "recipients": recipients
            }
            
        except Exception as e:
            logger.error(f"Email action failed: {str(e)}")
            raise
    
    def _resolve_recipients(self, recipients: List[str], context: WorkflowExecutionContext) -> List[str]:
        """Resolve dynamic recipients"""
        resolved = []
        for recipient in recipients:
            if recipient.startswith('{{') and recipient.endswith('}}'):
                # Dynamic recipient from context
                key = recipient[2:-2].strip()
                value = context.variables.get(key)
                if value:
                    resolved.append(value)
            else:
                resolved.append(recipient)
        return resolved
    
    def _render_template(self, template: str, context: WorkflowExecutionContext) -> str:
        """Render template with context variables"""
        import re
        
        def replace_variable(match):
            key = match.group(1).strip()
            return str(context.variables.get(key, ''))
        
        return re.sub(r'\{\{(.+?)\}\}', replace_variable, template)
    
    async def validate(self, config: Dict[str, Any]) -> bool:
        required_fields = ['recipients', 'subject']
        return all(field in config for field in required_fields)

class WebhookActionHandler(ActionHandler):
    """Handler for webhook actions"""
    
    async def execute(self, context: WorkflowExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        import aiohttp
        
        try:
            url = config.get('url')
            method = config.get('method', 'POST').upper()
            headers = config.get('headers', {})
            
            # Prepare payload
            payload = config.get('payload', {})
            payload['workflow_context'] = {
                'workflow_id': context.workflow_id,
                'execution_id': context.execution_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Add authentication if configured
            auth_config = config.get('authentication')
            if auth_config:
                if auth_config['type'] == 'bearer':
                    headers['Authorization'] = f"Bearer {auth_config['token']}"
                elif auth_config['type'] == 'basic':
                    import base64
                    credentials = base64.b64encode(
                        f"{auth_config['username']}:{auth_config['password']}".encode()
                    ).decode()
                    headers['Authorization'] = f"Basic {credentials}"
            
            # Make request
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    json=payload if method in ['POST', 'PUT', 'PATCH'] else None,
                    params=payload if method == 'GET' else None,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=config.get('timeout', 30))
                ) as response:
                    response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                    
                    if response.status >= 400:
                        raise Exception(f"Webhook failed with status {response.status}: {response_data}")
                    
                    return {
                        "status": "success",
                        "response_status": response.status,
                        "response_data": response_data
                    }
                    
        except Exception as e:
            logger.error(f"Webhook action failed: {str(e)}")
            raise
    
    async def validate(self, config: Dict[str, Any]) -> bool:
        return 'url' in config

class UpdateActionHandler(ActionHandler):
    """Handler for database update actions"""
    
    async def execute(self, context: WorkflowExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        from backend.app.services.database_service import DatabaseService
        
        try:
            db = next(get_db())
            
            # Get model and filters
            model_name = config.get('model')
            model_class = self._get_model_class(model_name)
            filters = config.get('filters', {})
            updates = config.get('updates', {})
            
            # Resolve dynamic values
            resolved_filters = self._resolve_values(filters, context)
            resolved_updates = self._resolve_values(updates, context)
            
            # Perform update
            service = DatabaseService(db, model_class)
            query = db.query(model_class)
            
            for field, value in resolved_filters.items():
                query = query.filter(getattr(model_class, field) == value)
            
            records = query.all()
            updated_count = 0
            
            for record in records:
                for field, value in resolved_updates.items():
                    setattr(record, field, value)
                updated_count += 1
            
            db.commit()
            
            return {
                "status": "success",
                "updated_count": updated_count,
                "model": model_name
            }
            
        except Exception as e:
            logger.error(f"Update action failed: {str(e)}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def _get_model_class(self, model_name: str):
        """Get model class by name"""
        from backend.app import models
        return getattr(models, model_name)
    
    def _resolve_values(self, values: Dict[str, Any], context: WorkflowExecutionContext) -> Dict[str, Any]:
        """Resolve dynamic values from context"""
        resolved = {}
        for key, value in values.items():
            if isinstance(value, str) and value.startswith('{{') and value.endswith('}}'):
                var_name = value[2:-2].strip()
                resolved[key] = context.variables.get(var_name, value)
            else:
                resolved[key] = value
        return resolved
    
    async def validate(self, config: Dict[str, Any]) -> bool:
        return all(field in config for field in ['model', 'updates'])

# Workflow Engine
class WorkflowEngine:
    """Main workflow execution engine"""
    
    def __init__(self):
        self.action_handlers = {
            WorkflowActionType.EMAIL: EmailActionHandler(),
            WorkflowActionType.WEBHOOK: WebhookActionHandler(),
            WorkflowActionType.UPDATE: UpdateActionHandler(),
            # Add more handlers as needed
        }
        
        self.active_workflows: Dict[str, bool] = {}
        self._scheduler_task = None
    
    async def start(self):
        """Start the workflow engine"""
        logger.info("Starting workflow engine...")
        
        # Load active workflows
        await self._load_active_workflows()
        
        # Start scheduler for scheduled workflows
        self._scheduler_task = asyncio.create_task(self._run_scheduler())
        
        logger.info("Workflow engine started")
    
    async def stop(self):
        """Stop the workflow engine"""
        logger.info("Stopping workflow engine...")
        
        if self._scheduler_task:
            self._scheduler_task.cancel()
            
        logger.info("Workflow engine stopped")
    
    async def trigger_workflow(
        self,
        workflow_id: str,
        trigger_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> WorkflowExecutionContext:
        """Trigger a workflow execution"""
        
        # Check if workflow is active
        if not self.active_workflows.get(workflow_id, False):
            raise ValueError(f"Workflow {workflow_id} is not active")
        
        # Create execution context
        context = WorkflowExecutionContext(
            workflow_id=workflow_id,
            execution_id=self._generate_execution_id(),
            trigger_data=trigger_data,
            user_id=user_id
        )
        
        # Load workflow configuration
        workflow = await self._load_workflow(workflow_id)
        
        # Execute workflow
        try:
            logger.info(f"Executing workflow {workflow_id}")
            metrics_collector.record_business_event("workflow_started", {
                "workflow_id": workflow_id,
                "trigger_type": workflow.trigger.type
            })
            
            # Check conditions
            if workflow.conditions:
                if not await self._evaluate_conditions(workflow.conditions, context):
                    logger.info(f"Workflow {workflow_id} conditions not met")
                    return context
            
            # Execute actions
            for i, action in enumerate(workflow.actions):
                context.current_action_index = i
                
                try:
                    result = await self._execute_action(action, context)
                    context.completed_actions.append(action.id)
                    context.results[action.id] = result
                    
                except Exception as e:
                    context.failed_actions.append(action.id)
                    context.errors.append({
                        "action_id": action.id,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                    # Check if workflow should continue on error
                    if not action.config.get('continue_on_error', False):
                        raise
            
            context.completed_at = datetime.utcnow()
            
            metrics_collector.record_business_event("workflow_completed", {
                "workflow_id": workflow_id,
                "duration_seconds": (context.completed_at - context.started_at).total_seconds(),
                "actions_completed": len(context.completed_actions),
                "actions_failed": len(context.failed_actions)
            })
            
        except Exception as e:
            logger.error(f"Workflow {workflow_id} failed: {str(e)}")
            metrics_collector.record_business_event("workflow_failed", {
                "workflow_id": workflow_id,
                "error": str(e)
            })
            raise
        
        # Save execution result
        await self._save_execution_result(context)
        
        return context
    
    async def _execute_action(
        self,
        action: WorkflowAction,
        context: WorkflowExecutionContext
    ) -> Dict[str, Any]:
        """Execute a single workflow action"""
        
        logger.info(f"Executing action {action.type}: {action.config.get('name', 'Unnamed')}")
        
        # Get handler
        handler = self.action_handlers.get(action.type)
        if not handler:
            raise ValueError(f"No handler for action type {action.type}")
        
        # Validate action config
        if not await handler.validate(action.config):
            raise ValueError(f"Invalid configuration for action {action.id}")
        
        # Check action conditions
        if action.conditions:
            if not await self._evaluate_conditions(action.conditions, context):
                logger.info(f"Action {action.id} conditions not met, skipping")
                return {"status": "skipped", "reason": "conditions_not_met"}
        
        # Execute with retry
        retry_count = action.config.get('retry_count', 3)
        retry_delay = action.config.get('retry_delay', 60)
        
        for attempt in range(retry_count):
            try:
                result = await handler.execute(context, action.config)
                return result
                
            except Exception as e:
                if attempt < retry_count - 1:
                    logger.warning(f"Action {action.id} failed (attempt {attempt + 1}/{retry_count}): {str(e)}")
                    await asyncio.sleep(retry_delay)
                else:
                    raise
    
    async def _evaluate_conditions(
        self,
        conditions: List[WorkflowCondition],
        context: WorkflowExecutionContext
    ) -> bool:
        """Evaluate workflow conditions"""
        
        for condition in conditions:
            field_value = context.variables.get(condition.field)
            
            # Evaluate based on operator
            if condition.operator == 'eq':
                result = field_value == condition.value
            elif condition.operator == 'ne':
                result = field_value != condition.value
            elif condition.operator == 'gt':
                result = field_value > condition.value
            elif condition.operator == 'gte':
                result = field_value >= condition.value
            elif condition.operator == 'lt':
                result = field_value < condition.value
            elif condition.operator == 'lte':
                result = field_value <= condition.value
            elif condition.operator == 'in':
                result = field_value in condition.value
            elif condition.operator == 'contains':
                result = condition.value in str(field_value)
            else:
                result = False
            
            # Handle combinators
            if hasattr(condition, 'combinator'):
                if condition.combinator == 'or' and result:
                    return True
                elif condition.combinator == 'and' and not result:
                    return False
            elif not result:
                return False
        
        return True
    
    async def _run_scheduler(self):
        """Run scheduler for scheduled workflows"""
        while True:
            try:
                # Check scheduled workflows every minute
                await asyncio.sleep(60)
                
                db = next(get_db())
                workflows = db.query(Workflow).filter(
                    Workflow.trigger['type'] == 'schedule',
                    Workflow.is_active == True
                ).all()
                
                for workflow in workflows:
                    schedule = workflow.trigger.get('schedule')
                    if schedule:
                        cron = croniter.croniter(schedule, datetime.utcnow())
                        next_run = cron.get_next(datetime)
                        
                        # Check if should run now
                        if next_run <= datetime.utcnow() + timedelta(seconds=30):
                            asyncio.create_task(
                                self.trigger_workflow(
                                    workflow.id,
                                    {"trigger": "scheduled", "schedule": schedule}
                                )
                            )
                
                db.close()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
    
    async def _load_active_workflows(self):
        """Load active workflows into memory"""
        db = next(get_db())
        workflows = db.query(Workflow).filter(Workflow.is_active == True).all()
        
        for workflow in workflows:
            self.active_workflows[workflow.id] = True
            
        db.close()
        logger.info(f"Loaded {len(self.active_workflows)} active workflows")
    
    async def _load_workflow(self, workflow_id: str) -> Workflow:
        """Load workflow configuration"""
        # Try cache first
        cache_key = f"workflow:{workflow_id}"
        cached = await cache_manager.get(cache_key)
        if cached:
            return Workflow(**json.loads(cached))
        
        # Load from database
        db = next(get_db())
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        db.close()
        
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Cache for future use
        await cache_manager.set(cache_key, workflow.json(), expire=300)
        
        return workflow
    
    async def _save_execution_result(self, context: WorkflowExecutionContext):
        """Save workflow execution result"""
        # Save to database or message queue for persistence
        pass
    
    def _generate_execution_id(self) -> str:
        """Generate unique execution ID"""
        import uuid
        return str(uuid.uuid4())

# Singleton instance
workflow_engine = WorkflowEngine()

# Celery tasks for async workflow execution
@app.task
def execute_workflow_async(workflow_id: str, trigger_data: Dict[str, Any], user_id: Optional[str] = None):
    """Execute workflow asynchronously via Celery"""
    asyncio.run(
        workflow_engine.trigger_workflow(workflow_id, trigger_data, user_id)
    )