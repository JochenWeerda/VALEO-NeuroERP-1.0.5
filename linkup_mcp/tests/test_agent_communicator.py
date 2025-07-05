# -*- coding: utf-8 -*-
"""
Tests für das Agent-Kommunikations-Tool.
"""

import pytest
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ..tools.agent_communicator import AgentCommunicator

@pytest.fixture
async def agent_communicator():
    """Fixture für das Kommunikations-Tool."""
    communicator = AgentCommunicator()
    await communicator.initialize()
    yield communicator
    # Cleanup
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.valeo_neuro_erp
    await db.agent_messages.delete_many({})
    await db.agents.delete_many({})
    
@pytest.mark.asyncio
async def test_register_agent(agent_communicator):
    """Test der Agenten-Registrierung."""
    input_data = {
        "action": "register_agent",
        "agent_id": "test-agent-1",
        "agent_type": "worker",
        "capabilities": ["python", "testing"]
    }
    
    result = await agent_communicator.execute(input_data)
    assert result["status"] == "success"
    assert result["agent"]["agent_id"] == "test-agent-1"
    assert result["agent"]["status"] == "active"
    
@pytest.mark.asyncio
async def test_send_and_receive_message(agent_communicator):
    """Test des Nachrichtenaustauschs."""
    # Registriere Agenten
    await agent_communicator.execute({
        "action": "register_agent",
        "agent_id": "sender",
        "agent_type": "worker",
        "capabilities": ["testing"]
    })
    
    await agent_communicator.execute({
        "action": "register_agent",
        "agent_id": "receiver",
        "agent_type": "worker",
        "capabilities": ["testing"]
    })
    
    # Sende Nachricht
    send_data = {
        "action": "send_message",
        "sender_id": "sender",
        "receiver_id": "receiver",
        "message_data": {
            "type": "command",
            "content": "run_tests"
        }
    }
    
    result = await agent_communicator.execute(send_data)
    assert result["status"] == "success"
    
    # Empfange Nachricht
    receive_data = {
        "action": "get_messages",
        "receiver_id": "receiver"
    }
    
    result = await agent_communicator.execute(receive_data)
    assert result["status"] == "success"
    assert len(result["messages"]) == 1
    assert result["messages"][0]["sender_id"] == "sender"
    
@pytest.mark.asyncio
async def test_broadcast_message(agent_communicator):
    """Test des Nachricht-Broadcasts."""
    # Registriere mehrere Agenten
    agents = ["agent1", "agent2", "agent3"]
    for agent_id in agents:
        await agent_communicator.execute({
            "action": "register_agent",
            "agent_id": agent_id,
            "agent_type": "worker",
            "capabilities": ["testing"]
        })
        
    # Sende Broadcast
    message_data = {
        "type": "status",
        "content": "system_update"
    }
    
    result = await agent_communicator.broadcast_message(
        sender_id="agent1",
        message_data=message_data
    )
    
    assert result["status"] == "success"
    assert result["broadcast_count"] == 2  # Sender erhält keine Nachricht
