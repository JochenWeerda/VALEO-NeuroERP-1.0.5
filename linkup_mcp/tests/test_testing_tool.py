# -*- coding: utf-8 -*-
"""
Tests für das Testing-Tool.
"""

import pytest
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ..tools.testing_tool import TestingTool
import os

@pytest.fixture
async def testing_tool():
    """Fixture für das Testing-Tool."""
    tool = TestingTool()
    await tool.initialize()
    yield tool
    # Cleanup
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.valeo_neuro_erp
    await db.test_results.delete_many({})
    await db.coverage_data.delete_many({})
    
@pytest.mark.asyncio
async def test_run_tests(testing_tool):
    """Test der Testausführung."""
    # Erstelle Test-Datei
    test_content = """
def test_example():
    assert True
    """
    os.makedirs("test_files", exist_ok=True)
    with open("test_files/test_example.py", "w") as f:
        f.write(test_content)
        
    input_data = {
        "action": "run_tests",
        "test_run_id": "test-run-1",
        "test_paths": ["test_files/test_example.py"],
        "options": {
            "verbose": True
        }
    }
    
    result = await testing_tool.execute(input_data)
    assert result["status"] == "success"
    assert result["test_result"]["results"]["passed"]
    
    # Cleanup
    os.remove("test_files/test_example.py")
    os.rmdir("test_files")
    
@pytest.mark.asyncio
async def test_get_test_results(testing_tool):
    """Test des Abrufs von Testergebnissen."""
    # Führe erst Tests aus
    await test_run_tests(testing_tool)
    
    input_data = {
        "action": "get_test_results",
        "test_run_id": "test-run-1"
    }
    
    result = await testing_tool.execute(input_data)
    assert result["status"] == "success"
    assert "results" in result
    
@pytest.mark.asyncio
async def test_analyze_coverage(testing_tool):
    """Test der Coverage-Analyse."""
    # Führe erst Tests aus
    await test_run_tests(testing_tool)
    
    input_data = {
        "action": "analyze_coverage",
        "test_run_id": "test-run-1"
    }
    
    result = await testing_tool.execute(input_data)
    assert result["status"] == "success"
    assert "coverage_analysis" in result
    
@pytest.mark.asyncio
async def test_generate_report(testing_tool):
    """Test der Berichtgenerierung."""
    # Führe erst Tests aus
    await test_run_tests(testing_tool)
    
    input_data = {
        "action": "generate_report",
        "test_run_id": "test-run-1",
        "report_format": "html"
    }
    
    result = await testing_tool.execute(input_data)
    assert result["status"] == "success"
    assert "report" in result
    assert "report_path" in result["report"]
