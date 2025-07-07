from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class WorkflowStep(BaseModel):
    name: str
    type: str
    config: Dict[str, Any]
    dependencies: List[str] = []

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]
    config: Optional[Dict[str, Any]] = None

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[WorkflowStep]] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[str] = None

class Workflow(WorkflowBase):
    id: str
    user_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 