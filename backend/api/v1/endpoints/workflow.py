"""
VALEO-NeuroERP Workflow API
"""
from typing import List, Any
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from pydantic import BaseModel
import structlog
from ....core.workflow_manager import workflow_manager, WorkflowState
from ....core.workflow.steps import get_step_handler
from datetime import datetime
from ....core.services.workflow_service import WorkflowService
from ....app.core.llm.service import LLMService
import json
from ....core.db.mongodb import get_database

router = APIRouter(prefix="/api/v1/workflow")
logger = structlog.get_logger(__name__)

class StartPipelineRequest(BaseModel):
    """Request zum Starten einer Pipeline"""
    cycle_id: str
    mode: str

class StartPipelineResponse(BaseModel):
    """Response zum Starten einer Pipeline"""
    pipeline_id: str
    state: WorkflowState

class KISuggestionRequest(BaseModel):
    prompt: str
    system_prompt: str = None
    llm_config: dict = {}
    dependencies: dict = {}

class KISuggestionResponse(BaseModel):
    result: Any

class KIFeedbackRequest(BaseModel):
    pipeline_id: str
    phase: str
    prompt: str
    suggestion: Any
    feedback: str  # 'helpful' oder 'not_helpful'

class KIFeedbackResponse(BaseModel):
    status: str

class KIFeedbackStatsResponse(BaseModel):
    total: int
    helpful: int
    not_helpful: int
    helpful_ratio: float = None
    feedback_over_time: list = []
    feedback_by_phase: list = []
    improvement_examples: list = []

class AutomationSuggestionsRequest(BaseModel):
    workflow_context: dict
    feedback_stats: dict = None

class AutomationSuggestionsResponse(BaseModel):
    suggestions: Any

class LangGraphExecuteRequest(BaseModel):
    graph_id: str
    steps: list
    config: dict = {}
    name: str = ''
    description: str = ''
    input_data: dict = {}

class LangGraphExecuteResponse(BaseModel):
    result: dict

class WorkflowAssistantRequest(BaseModel):
    messages: list

class WorkflowAssistantResponse(BaseModel):
    reply: str

class OptimizationSuggestion(BaseModel):
    suggestion: str
    reason: str
    metric: dict = None

class OptimizationSuggestionsResponse(BaseModel):
    suggestions: list

class OptimizationFeedbackRequest(BaseModel):
    suggestion: str
    rating: str  # 'helpful' oder 'not_helpful'
    comment: str = None

class OptimizationFeedbackResponse(BaseModel):
    status: str

@router.post("/pipelines", response_model=StartPipelineResponse)
async def start_pipeline(request: StartPipelineRequest):
    """Startet eine neue Pipeline"""
    try:
        pipeline_id = await workflow_manager.start_pipeline(
            request.cycle_id,
            request.mode
        )
        
        state = await workflow_manager.get_pipeline_status(pipeline_id)
        
        return StartPipelineResponse(
            pipeline_id=pipeline_id,
            state=state
        )
        
    except Exception as e:
        logger.error("Failed to start pipeline", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/pipelines/{pipeline_id}", response_model=WorkflowState)
async def get_pipeline_status(pipeline_id: str):
    """Gibt den Status einer Pipeline zurück"""
    try:
        return await workflow_manager.get_pipeline_status(pipeline_id)
        
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
        
    except Exception as e:
        logger.error("Failed to get pipeline status", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/pipelines", response_model=List[WorkflowState])
async def list_pipelines():
    """Listet alle aktiven Pipelines auf"""
    try:
        return await workflow_manager.list_active_pipelines()
        
    except Exception as e:
        logger.error("Failed to list pipelines", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/ki-suggestion", response_model=KISuggestionResponse)
async def ki_suggestion(request: KISuggestionRequest):
    """Liefert einen KI-Vorschlag für den Workflow-Kontext"""
    handler = get_step_handler("llm_suggestion")
    result = await handler.execute(
        config={
            "prompt": request.prompt,
            "system_prompt": request.system_prompt,
            "llm_config": request.llm_config
        },
        dependencies=request.dependencies
    )
    return KISuggestionResponse(result=result)

@router.post("/ki-feedback", response_model=KIFeedbackResponse)
async def ki_feedback(request: KIFeedbackRequest):
    """Speichert Feedback zu einem KI-Vorschlag für spätere Auswertung."""
    db = await get_database()
    await db.ki_feedback.insert_one({
        "pipeline_id": request.pipeline_id,
        "phase": request.phase,
        "prompt": request.prompt,
        "suggestion": request.suggestion,
        "feedback": request.feedback,
        "timestamp": datetime.datetime.utcnow()
    })
    return KIFeedbackResponse(status="ok")

@router.get("/ki-feedback-stats", response_model=KIFeedbackStatsResponse)
async def ki_feedback_stats(
    pipeline_id: str = Query(None),
    phase: str = Query(None),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None)
):
    """Aggregierte Feedback-Statistiken für KI-Vorschläge abrufen inkl. Zeitverlauf und Verbesserungspotenzial."""
    stats = await WorkflowService.get_ki_feedback_stats(
        pipeline_id=pipeline_id,
        phase=phase,
        start_date=start_date,
        end_date=end_date
    )
    return KIFeedbackStatsResponse(**stats)

@router.post("/automation-suggestions", response_model=AutomationSuggestionsResponse)
async def automation_suggestions(request: AutomationSuggestionsRequest):
    """Liefert Automatisierungsvorschläge für einen Workflow-Kontext."""
    llm = LLMService()
    suggestions = await llm.generate_automation_suggestions(
        workflow_context=request.workflow_context,
        feedback_stats=request.feedback_stats
    )
    return AutomationSuggestionsResponse(suggestions=suggestions)

@router.post("/langgraph-execute", response_model=LangGraphExecuteResponse)
async def langgraph_execute(request: LangGraphExecuteRequest):
    """Lädt und führt einen LangGraph-Workflow aus."""
    service = LangGraphService()
    graph_definition = {
        "steps": request.steps,
        "config": request.config,
        "name": request.name,
        "description": request.description
    }
    service.load_graph(request.graph_id, graph_definition)
    result = await service.execute_graph(request.graph_id, request.input_data)
    return LangGraphExecuteResponse(result=result)

@router.post("/llm/workflow-assistant", response_model=WorkflowAssistantResponse)
async def workflow_assistant(request: WorkflowAssistantRequest):
    """Dialogbasierter KI-Workflow-Assistent: Erzeugt auf Basis der Chat-Historie einen Workflow-Vorschlag als JSON."""
    try:
        llm = LLMService()
        user_messages = [m['content'] for m in request.messages if m['role'] == 'user']
        prompt = (
            "Du bist ein Experte für Geschäftsprozessautomatisierung. "
            "Erstelle eine LangGraph-Workflow-Definition (JSON) für folgende Anforderung. "
            "Stelle gezielte Rückfragen, falls Informationen fehlen. "
            "Wenn du genug Informationen hast, antworte ausschließlich mit einem gültigen JSON-Block (keine Kommentare, keine Erklärung, nur das JSON).\n\n"
            + "\n\n".join(user_messages)
        )
        result = await llm.generate(prompt)
        reply = result.get('choices', [{}])[0].get('message', {}).get('content', '') or str(result)
        # Versuche, JSON zu extrahieren und zu validieren
        json_start = reply.find('{')
        json_str = reply[json_start:] if json_start != -1 else ''
        try:
            parsed = json.loads(json_str)
            # Gültiges JSON gefunden
            return WorkflowAssistantResponse(reply=json.dumps(parsed, indent=2, ensure_ascii=False))
        except Exception:
            # Kein valides JSON, Rückfrage an die KI
            correction_prompt = (
                "Bitte liefere das JSON im korrekten Format (ohne Kommentare, ohne Erklärung, nur der JSON-Block). "
                "Hier ist deine letzte Antwort:\n" + reply
            )
            correction_result = await llm.generate(correction_prompt)
            correction_reply = correction_result.get('choices', [{}])[0].get('message', {}).get('content', '') or str(correction_result)
            # Nochmals versuchen zu parsen
            json_start2 = correction_reply.find('{')
            json_str2 = correction_reply[json_start2:] if json_start2 != -1 else ''
            try:
                parsed2 = json.loads(json_str2)
                return WorkflowAssistantResponse(reply=json.dumps(parsed2, indent=2, ensure_ascii=False))
            except Exception:
                # Immer noch kein valides JSON, Rückfrage an den Nutzer
                return WorkflowAssistantResponse(reply="Die KI konnte kein valides JSON liefern. Bitte formuliere deine Anforderung präziser oder versuche es erneut.\n\nLetzte KI-Antwort:\n" + reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimization-suggestions", response_model=OptimizationSuggestionsResponse)
async def optimization_suggestions(
    graph_id: str = Query(None),
    since: datetime.datetime = Query(None)
):
    """Analysiert die letzten Workflow-Runs und gibt Optimierungsvorschläge zurück."""
    db = await get_database()
    query = {}
    if graph_id:
        query["graph_id"] = graph_id
    if since:
        query["timestamp"] = {"$gte": since}
    runs = await db.workflow_runs.find(query).to_list(200)
    if not runs:
        return OptimizationSuggestionsResponse(suggestions=[])
    # Fehleranalyse
    error_steps = {}
    durations = {}
    counts = {}
    for run in runs:
        path = run.get("execution_path", [])
        by_step = {}
        for step in path:
            name = step["step"]
            typ = step.get("type", "operation")
            status = step["status"]
            ts = step["timestamp"]
            if name not in by_step:
                by_step[name] = {"started": None, "completed": None, "errors": 0, "type": typ, "durations": []}
            if status == "started":
                by_step[name]["started"] = ts
            if status == "completed":
                by_step[name]["completed"] = ts
            if status == "error":
                by_step[name]["errors"] += 1
        for name, info in by_step.items():
            if info["started"] and info["completed"]:
                info["durations"].append(info["completed"] - info["started"])
            # Fehler sammeln
            if info["errors"] > 0:
                error_steps.setdefault(name, 0)
                error_steps[name] += info["errors"]
            # Dauer sammeln
            if name not in durations:
                durations[name] = []
            durations[name].extend(info["durations"])
            # Zählen
            counts[name] = counts.get(name, 0) + 1
    suggestions = []
    # Fehler-Vorschläge
    for name, count in error_steps.items():
        if count > 1:
            suggestions.append(OptimizationSuggestion(
                suggestion=f"Schritt '{name}' verursacht häufig Fehler.",
                reason=f"{count} Fehler in den letzten Runs.",
                metric={"errors": count}
            ))
    # Bottleneck-Vorschläge
    avg_durations = {k: (sum(v)/len(v) if v else 0) for k, v in durations.items()}
    if avg_durations:
        max_step = max(avg_durations, key=avg_durations.get)
        max_val = avg_durations[max_step]
        mean = sum(avg_durations.values()) / len(avg_durations)
        if max_val > mean * 2 and max_val > 0.5:
            suggestions.append(OptimizationSuggestion(
                suggestion=f"Schritt '{max_step}' ist ein Bottleneck (lange Ausführungszeit).",
                reason=f"Durchschnittliche Dauer: {max_val:.2f}s (Mittelwert aller Schritte: {mean:.2f}s)",
                metric={"avg_duration": max_val, "mean": mean}
            ))
    # Abbruch-Vorschläge
    aborted = [r for r in runs if r["status"] == "error"]
    if len(aborted) > len(runs) * 0.2:
        suggestions.append(OptimizationSuggestion(
            suggestion="Viele Workflows werden mit Fehler abgebrochen.",
            reason=f"{len(aborted)} von {len(runs)} Runs endeten mit Fehler.",
            metric={"aborted": len(aborted), "total": len(runs)}
        ))
    return OptimizationSuggestionsResponse(suggestions=[s.dict() for s in suggestions])

@router.post("/optimization-feedback", response_model=OptimizationFeedbackResponse)
async def optimization_feedback(request: OptimizationFeedbackRequest):
    """Speichert Feedback zu einem Optimierungsvorschlag."""
    db = await get_database()
    doc = {
        "suggestion": request.suggestion,
        "rating": request.rating,
        "comment": request.comment,
        "timestamp": datetime.datetime.utcnow()
    }
    await db.optimization_feedback.insert_one(doc)
    return OptimizationFeedbackResponse(status="ok") 