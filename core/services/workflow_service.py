from typing import List, Optional, Any
from datetime import datetime
from core.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from core.db.mongodb import get_database
from core.workflow.engine import WorkflowEngine

class WorkflowService:
    @staticmethod
    async def get_workflow(workflow_id: str) -> Optional[Workflow]:
        """Workflow anhand ID abrufen"""
        db = await get_database()
        workflow_dict = await db.workflows.find_one({"_id": workflow_id})
        if workflow_dict:
            return Workflow(**workflow_dict)
        return None

    @staticmethod
    async def get_workflows(
        user_id: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Workflow]:
        """Liste von Workflows abrufen"""
        db = await get_database()
        workflows = []
        cursor = db.workflows.find({"user_id": user_id}).skip(skip).limit(limit)
        async for workflow_dict in cursor:
            workflows.append(Workflow(**workflow_dict))
        return workflows

    @staticmethod
    async def create_workflow(
        workflow: WorkflowCreate,
        user_id: str
    ) -> Workflow:
        """Neuen Workflow erstellen"""
        db = await get_database()
        
        # Create workflow dict
        workflow_dict = workflow.dict()
        workflow_dict["user_id"] = user_id
        workflow_dict["created_at"] = datetime.utcnow()
        workflow_dict["updated_at"] = datetime.utcnow()
        workflow_dict["status"] = "created"
        
        # Insert into database
        result = await db.workflows.insert_one(workflow_dict)
        workflow_dict["id"] = str(result.inserted_id)
        
        return Workflow(**workflow_dict)

    @staticmethod
    async def update_workflow(
        workflow_id: str,
        workflow_update: WorkflowUpdate
    ) -> Optional[Workflow]:
        """Workflow aktualisieren"""
        db = await get_database()
        
        # Get update data
        update_data = workflow_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in database
        await db.workflows.update_one(
            {"_id": workflow_id},
            {"$set": update_data}
        )
        
        return await WorkflowService.get_workflow(workflow_id)

    @staticmethod
    async def delete_workflow(workflow_id: str) -> bool:
        """Workflow löschen"""
        db = await get_database()
        result = await db.workflows.delete_one({"_id": workflow_id})
        return result.deleted_count > 0

    @staticmethod
    async def execute_workflow(workflow_id: str) -> Any:
        """Workflow ausführen"""
        # Get workflow
        workflow = await WorkflowService.get_workflow(workflow_id)
        if not workflow:
            raise ValueError("Workflow nicht gefunden")
            
        try:
            # Update status
            await WorkflowService.update_workflow(
                workflow_id,
                WorkflowUpdate(status="running")
            )
            
            # Execute workflow
            engine = WorkflowEngine()
            result = await engine.execute(workflow)
            
            # Update status
            await WorkflowService.update_workflow(
                workflow_id,
                WorkflowUpdate(
                    status="completed",
                    result=result
                )
            )
            
            return result
            
        except Exception as e:
            # Update status on error
            await WorkflowService.update_workflow(
                workflow_id,
                WorkflowUpdate(
                    status="failed",
                    error=str(e)
                )
            )
            raise 

    @staticmethod
    async def get_ki_feedback_stats(
        pipeline_id: str = None,
        phase: str = None,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> dict:
        """Aggregiert Feedback-Statistiken aus der ki_feedback-Collection inkl. Zeitverlauf und Verbesserungspotenzial."""
        db = await get_database()
        query = {}
        if pipeline_id:
            query["pipeline_id"] = pipeline_id
        if phase:
            query["phase"] = phase
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date

        total = await db.ki_feedback.count_documents(query)
        helpful = await db.ki_feedback.count_documents({**query, "feedback": "helpful"})
        not_helpful = await db.ki_feedback.count_documents({**query, "feedback": "not_helpful"})
        ratio = (helpful / total) if total > 0 else None

        # Zeitliche Entwicklung (Feedback pro Tag)
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "total": {"$sum": 1},
                "helpful": {"$sum": {"$cond": [ {"$eq": ["$feedback", "helpful"]}, 1, 0 ]}},
                "not_helpful": {"$sum": {"$cond": [ {"$eq": ["$feedback", "not_helpful"]}, 1, 0 ]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        feedback_over_time = []
        async for doc in db.ki_feedback.aggregate(pipeline):
            feedback_over_time.append({
                "date": doc["_id"],
                "total": doc["total"],
                "helpful": doc["helpful"],
                "not_helpful": doc["not_helpful"]
            })

        # Auswertung nach Phase
        pipeline_phase = [
            {"$match": query},
            {"$group": {
                "_id": "$phase",
                "total": {"$sum": 1},
                "helpful": {"$sum": {"$cond": [ {"$eq": ["$feedback", "helpful"]}, 1, 0 ]}},
                "not_helpful": {"$sum": {"$cond": [ {"$eq": ["$feedback", "not_helpful"]}, 1, 0 ]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        feedback_by_phase = []
        async for doc in db.ki_feedback.aggregate(pipeline_phase):
            feedback_by_phase.append({
                "phase": doc["_id"],
                "total": doc["total"],
                "helpful": doc["helpful"],
                "not_helpful": doc["not_helpful"]
            })

        # Verbesserungspotenzial: Beispiele für häufige negative Feedbacks
        pipeline_neg = [
            {"$match": {**query, "feedback": "not_helpful"}},
            {"$group": {
                "_id": {"prompt": "$prompt", "suggestion": "$suggestion", "phase": "$phase"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        improvement_examples = []
        async for doc in db.ki_feedback.aggregate(pipeline_neg):
            improvement_examples.append({
                "prompt": doc["_id"]["prompt"],
                "suggestion": doc["_id"]["suggestion"],
                "phase": doc["_id"]["phase"],
                "count": doc["count"]
            })

        return {
            "total": total,
            "helpful": helpful,
            "not_helpful": not_helpful,
            "helpful_ratio": ratio,
            "feedback_over_time": feedback_over_time,
            "feedback_by_phase": feedback_by_phase,
            "improvement_examples": improvement_examples
        } 