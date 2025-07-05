# -*- coding: utf-8 -*-
"""
Tests für die verbesserte LangGraph-Integration.
"""

import pytest
import asyncio
from linkup_mcp.langgraph_controller import LangGraphController

@pytest.mark.asyncio
async def test_langgraph_controller_initialization():
    """Test für die Initialisierung des LangGraph-Controllers"""
    config = {
        "workflow_name": "test_workflow",
        "enable_checkpoints": True,
        "save_state": True
    }
    
    controller = LangGraphController(config)
    
    assert controller.workflow_name == "test_workflow"
    assert controller.enable_checkpoints == True
    assert controller.save_state == True
    assert controller.current_phase is None
    assert controller.phase_states == {}

@pytest.mark.asyncio
async def test_langgraph_phase_lifecycle():
    """Test für den Lebenszyklus einer LangGraph-Phase"""
    controller = LangGraphController()
    
    # Phase starten
    start_result = await controller.start_phase("TEST_PHASE")
    assert start_result["status"] == "started"
    assert start_result["phase"] == "TEST_PHASE"
    assert controller.current_phase == "TEST_PHASE"
    
    # Checkpoint erstellen
    checkpoint_result = await controller.create_checkpoint("test_checkpoint", {"test_data": 123})
    assert checkpoint_result["status"] == "success"
    assert checkpoint_result["checkpoint"] == "test_checkpoint"
    
    # Phase abschließen
    complete_result = await controller.complete_phase()
    assert complete_result["status"] == "completed"
    assert complete_result["phase"] == "TEST_PHASE"
    assert controller.current_phase is None
    
    # Phasenzustand abrufen
    phase_state = await controller.get_phase_state("TEST_PHASE")
    assert phase_state["status"] == "completed"
    assert len(phase_state["checkpoints"]) == 1
    assert phase_state["checkpoints"][0]["name"] == "test_checkpoint"
    assert phase_state["checkpoints"][0]["data"]["test_data"] == 123
