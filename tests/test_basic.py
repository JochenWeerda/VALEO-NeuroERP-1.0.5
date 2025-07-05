# -*- coding: utf-8 -*-
"""
Basic tests for GENXAIS Framework modular components.
"""

import sys
import os
import pytest
import asyncio

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test that all core modules can be imported."""
    try:
        from core.framework import GENXAIS_Framework
        from core.config import Config
        from core.rag_system import RAGSystem
        from core.apm_phases import APMPhases
        from agents.base import BaseAgent
        from agents.coordinator import AgentCoordinator
        from agents import agent_registry
        from templates.base import BaseTemplate
        
        assert True, "All imports successful"
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")

def test_config_creation():
    """Test configuration creation and validation."""
    from core.config import Config
    
    config = Config("test-project")
    assert config.project_name == "test-project"
    assert config.validate() == True
    assert config.get("project.name") == "test-project"

def test_framework_initialization():
    """Test framework initialization."""
    from core.framework import GENXAIS_Framework
    
    framework = GENXAIS_Framework("test-framework")
    assert framework.project_name == "test-framework"
    assert framework.config is not None
    assert framework.rag_system is not None
    assert framework.apm_phases is not None

def test_agent_registry():
    """Test agent registry functionality."""
    from agents import agent_registry, DeveloperAgent, AnalystAgent
    
    # Test registry status
    status = agent_registry.get_registry_status()
    assert 'registered_agent_types' in status
    assert 'developer' in agent_registry.list_agent_types()
    assert 'analyst' in agent_registry.list_agent_types()
    
    # Test agent creation
    dev_agent = agent_registry.create_agent('developer', 'test-dev')
    assert dev_agent is not None
    assert dev_agent.agent_id == 'test-dev'
    assert 'code_generation' in dev_agent.get_capabilities()

def test_coordinator():
    """Test agent coordinator functionality."""
    from agents.coordinator import AgentCoordinator
    from agents import DeveloperAgent
    
    coordinator = AgentCoordinator("test-coordinator")
    agent = DeveloperAgent("test-agent")
    
    # Test agent registration
    success = coordinator.register_agent(agent)
    assert success == True
    assert "test-agent" in coordinator.agents
    
    # Test capabilities finding
    capable_agents = coordinator.find_capable_agents(['code_generation'])
    assert 'test-agent' in capable_agents

@pytest.mark.asyncio
async def test_async_framework_operations():
    """Test async framework operations."""
    from core.framework import GENXAIS_Framework
    
    framework = GENXAIS_Framework("async-test")
    
    # Test status retrieval
    status = await framework.get_project_status()
    assert isinstance(status, dict)
    assert 'project' in status
    
    # Test knowledge export
    knowledge = await framework.export_knowledge()
    assert isinstance(knowledge, dict)

def test_template_system():
    """Test template system functionality."""
    from templates import template_registry
    
    # Test template registry
    status = template_registry.get_registry_status()
    assert 'available_templates' in status
    assert len(template_registry.list_templates()) > 0

if __name__ == "__main__":
    # Run tests directly
    print("🧪 Running GENXAIS Framework Tests...")
    
    try:
        test_imports()
        print("✅ Import tests passed")
        
        test_config_creation()
        print("✅ Config tests passed")
        
        test_framework_initialization()
        print("✅ Framework tests passed")
        
        test_agent_registry()
        print("✅ Agent registry tests passed")
        
        test_coordinator()
        print("✅ Coordinator tests passed")
        
        # Run async test
        asyncio.run(test_async_framework_operations())
        print("✅ Async tests passed")
        
        test_template_system()
        print("✅ Template tests passed")
        
        print("\n🎉 All tests passed! GENXAIS Framework is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 