"""
Workflow-Engine - Datenbank-Modelle
VALEO NeuroERP 2.0
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ...database import Base
from .enums import WorkflowStatus


class WorkflowDefinition(Base):
    """Workflow-Definitionen"""
    __tablename__ = "workflow_definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(20), nullable=False)
    status = Column(WorkflowStatus, default=WorkflowStatus.DRAFT, nullable=False)
    trigger_type = Column(String(50), nullable=False)
    trigger_config = Column(JSON)
    steps = Column(JSON, nullable=False)  # Array von Workflow-Schritten
    conditions = Column(JSON)  # Bedingungen für Workflow-Ausführung
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    executions = relationship("WorkflowExecution", back_populates="definition")


class WorkflowExecution(Base):
    """Workflow-Ausführungen"""
    __tablename__ = "workflow_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflow_definitions.id"), nullable=False)
    status = Column(WorkflowStatus, default=WorkflowStatus.DRAFT, nullable=False)
    current_step = Column(Integer, default=0)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    triggered_by = Column(UUID(as_uuid=True), ForeignKey("benutzer.id"))
    
    # Beziehungen
    definition = relationship("WorkflowDefinition", back_populates="executions")
    steps = relationship("WorkflowExecutionStep", back_populates="execution")


class WorkflowExecutionStep(Base):
    """Einzelne Schritte einer Workflow-Ausführung"""
    __tablename__ = "workflow_execution_steps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    status = Column(WorkflowStatus, default=WorkflowStatus.DRAFT, nullable=False)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Beziehungen
    execution = relationship("WorkflowExecution", back_populates="steps") 