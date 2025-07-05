# -*- coding: utf-8 -*-
"""
Tests für das Workflow-Management-Tool.
"""

import pytest
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ..tools.workflow_manager import WorkflowManager

@pytest.fixture
async def workflow_manager():
    """Fixture für das Workflow-Management-Tool."""
    manager = WorkflowManager()
    await manager.initialize()
    yield manager
    # Cleanup
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await client.valeo_neuro_erp.workflows.delete_many({})
    
@pytest.mark.asyncio
async def test_create_workflow(workflow_manager):
    """Test der Workflow-Erstellung."""
    input_data = {
        "workflow_id": "test-workflow-1",
        "action": "create",
        "parameters": {
            "type": "implementation",
            "description": "Test Workflow"
        }
    }
    
    result = await workflow_manager.execute(input_data)
    assert result["status"] == "success"
    assert result["workflow"]["workflow_id"] == "test-workflow-1"
    assert result["workflow"]["status"] == "created"
    
@pytest.mark.asyncio
async def test_workflow_lifecycle(workflow_manager):
    """Test des Workflow-Lebenszyklus."""
    # Erstelle Workflow
    create_data = {
        "workflow_id": "lifecycle-test",
        "action": "create",
        "parameters": {"type": "testing"}
    }
    await workflow_manager.execute(create_data)
    
    # Update Workflow
    update_data = {
        "workflow_id": "lifecycle-test",
        "action": "update",
        "parameters": {
            "step": "running_tests"
        }
    }
    result = await workflow_manager.execute(update_data)
    assert result["status"] == "success"
    
    # Pausiere Workflow
    pause_data = {
        "workflow_id": "lifecycle-test",
        "action": "pause",
        "parameters": {
            "reason": "Manual pause"
        }
    }
    result = await workflow_manager.execute(pause_data)
    assert result["status"] == "success"
    assert result["workflow_status"] == "paused"
    
    # Setze Workflow fort
    resume_data = {
        "workflow_id": "lifecycle-test",
        "action": "resume"
    }
    result = await workflow_manager.execute(resume_data)
    assert result["status"] == "success"
    assert result["workflow_status"] == "running"
    
    # Schließe Workflow ab
    complete_data = {
        "workflow_id": "lifecycle-test",
        "action": "complete",
        "parameters": {
            "completion_data": {
                "status": "success",
                "results": {"tests_passed": 10}
            }
        }
    }
    result = await workflow_manager.execute(complete_data)
    assert result["status"] == "success"
    assert result["workflow_status"] == "completed"
