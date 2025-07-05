#!/usr/bin/env python3
"""
Run script for the VALEO-NeuroERP Parallel Agent Framework.
This script initializes all agents and starts the parallel execution pipeline.
"""

import asyncio
import logging
import os
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
import json

from .parallel_agent_framework import (
    ParallelAgentFramework, 
    AgentPhase, 
    AgentTask,
    HandoverDocument
)
from .agents.base_agents import AnalyzerAgent, PlannerAgent, ExecutorAgent
from .agents.specialized_agents import ERPDataAnalyzer
from .agents.analyzer_agents import PerformanceAnalyzer, SecurityAnalyzer
from .agents.planner_agents import OptimizationPlanner, IntegrationPlanner
from .agents.executor_agents import CodeExecutor, ConfigurationExecutor
from .config.parallel_agent_config import APMPhase
from .mcp_integration import MCPIntegration, MCPAgentRole, PHASE_ROLE_MAPPING

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"logs/parallel_agents_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

async def initialize_framework():
    """Initialize the parallel agent framework with all necessary agents."""
    logger.info("Initializing Parallel Agent Framework")
    
    # Create framework instance
    framework = ParallelAgentFramework(MONGODB_URI)
    
    # Register VAN (Validate, Analyze, Think) agents
    framework.register_agent(
        AgentPhase.VAN,
        ERPDataAnalyzer("van-erp-analyzer", "erp_data_analysis")
    )
    framework.register_agent(
        AgentPhase.VAN,
        PerformanceAnalyzer("van-perf-analyzer", "performance_analysis")
    )
    framework.register_agent(
        AgentPhase.VAN,
        SecurityAnalyzer("van-sec-analyzer", "security_analysis")
    )
    
    # Register PLAN agents
    framework.register_agent(
        AgentPhase.PLAN,
        OptimizationPlanner("plan-opt-planner", "optimization_planning")
    )
    framework.register_agent(
        AgentPhase.PLAN,
        IntegrationPlanner("plan-int-planner", "integration_planning")
    )
    
    # Register CREATE agents
    framework.register_agent(
        AgentPhase.CREATE,
        PlannerAgent("create-code-designer", "code_design")
    )
    framework.register_agent(
        AgentPhase.CREATE,
        PlannerAgent("create-ui-designer", "ui_design")
    )
    
    # Register IMPLEMENT agents
    framework.register_agent(
        AgentPhase.IMPLEMENT,
        CodeExecutor("impl-code-executor", "code_implementation")
    )
    framework.register_agent(
        AgentPhase.IMPLEMENT,
        ConfigurationExecutor("impl-config-executor", "system_configuration")
    )
    
    # Register REVIEW agents
    framework.register_agent(
        AgentPhase.REVIEW,
        AnalyzerAgent("review-quality-analyst", "quality_assurance")
    )
    framework.register_agent(
        AgentPhase.REVIEW,
        AnalyzerAgent("review-perf-tester", "performance_testing")
    )
    
    return framework

async def create_initial_tasks(framework):
    """Create initial tasks to start the agent pipeline."""
    logger.info("Creating initial tasks")
    
    # Create system analysis task
    system_analysis_task = AgentTask(
        phase=AgentPhase.VAN,
        task_name="Initial System Analysis",
        priority=1,
        input_data={
            "system_state": "initial",
            "components": [
                "core_erp", "financial_module", "inventory_module",
                "sales_module", "analytics_module"
            ],
            "analysis_type": "comprehensive"
        }
    )
    await framework.add_task(system_analysis_task)
    
    # Create performance analysis task
    performance_analysis_task = AgentTask(
        phase=AgentPhase.VAN,
        task_name="Performance Baseline Analysis",
        priority=2,
        input_data={
            "system_state": "initial",
            "components": [
                "database", "api_endpoints", "frontend_rendering"
            ],
            "analysis_type": "performance"
        }
    )
    await framework.add_task(performance_analysis_task)
    
    # Create security analysis task
    security_analysis_task = AgentTask(
        phase=AgentPhase.VAN,
        task_name="Security Audit",
        priority=3,
        input_data={
            "system_state": "initial",
            "components": [
                "authentication", "authorization", "data_encryption",
                "api_security", "input_validation"
            ],
            "analysis_type": "security"
        }
    )
    await framework.add_task(security_analysis_task)
    
    logger.info("Initial tasks created")

class ParallelAgentRunner:
    """
    Runner for parallel agents in the VALEO-NeuroERP multi-agent framework.
    """
    
    def __init__(self, 
                 framework: ParallelAgentFramework,
                 mcp_integration: Optional[MCPIntegration] = None,
                 memory_path: str = "./memory-bank"):
        """Initialize the parallel agent runner."""
        self.framework = framework
        self.mcp_integration = mcp_integration or MCPIntegration()
        self.memory_path = memory_path
        
        # Create memory path if it doesn't exist
        os.makedirs(memory_path, exist_ok=True)
        
    async def run_task(self, task: AgentTask) -> Dict[str, Any]:
        """Run a task through all agent phases."""
        results = {}
        
        # Create initial handover document
        handover = HandoverDocument(
            phase=AgentPhase.VAN,
            task_name=task.name,
            summary=task.description,
            context=task.context,
            recommendations=[],
            metrics={},
            source_agent_id="system",
            target_agent_id="van-agent"
        )
        
        # Store the initial handover
        self._store_handover(handover)
        
        # Process through each phase
        current_phase = AgentPhase.VAN
        phase_count = len(AgentPhase)
        for _ in range(phase_count):
            logger.info(f"Processing phase: {current_phase.value}")
            
            # Process the handover using MCP integration
            if self.mcp_integration:
                handover = await self.mcp_integration.process_handover(handover)
            else:
                # Fallback to regular framework processing
                handover = await self.framework.process_handover(handover)
            
            # Store the handover
            self._store_handover(handover)
            
            # Store results for this phase
            results[current_phase.value] = {
                "summary": handover.summary,
                "recommendations": handover.recommendations,
                "metrics": handover.metrics
            }
            
            # Move to the next phase
            current_phase = handover.phase
        
        return results
    
    def _store_handover(self, handover: HandoverDocument) -> None:
        """Store a handover document to the memory bank."""
        # Create a filename based on the phase and timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{handover.phase.value}_{timestamp}.json"
        filepath = os.path.join(self.memory_path, "handover", filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Write the handover document to a file
        with open(filepath, "w") as f:
            f.write(handover.json(indent=2))
        
        logger.info(f"Stored handover document: {filepath}")

async def run_parallel_agents(task_name: str, task_description: str, 
                             context: Dict[str, Any] = None,
                             use_mcp: bool = True) -> Dict[str, Any]:
    """
    Run parallel agents on a task.
    
    Args:
        task_name: The name of the task
        task_description: The description of the task
        context: Additional context for the task
        use_mcp: Whether to use MCP integration
        
    Returns:
        The results of the task execution
    """
    # Create the framework
    framework = ParallelAgentFramework()
    
    # Create the MCP integration if requested
    mcp_integration = None
    if use_mcp:
        mcp_integration = MCPIntegration()
    
    # Create the runner
    runner = ParallelAgentRunner(framework, mcp_integration)
    
    # Create the task
    task = AgentTask(
        name=task_name,
        description=task_description,
        context=context or {}
    )
    
    # Run the task
    results = await runner.run_task(task)
    
    return results

def run_task(task_name: str, task_description: str, 
            context: Dict[str, Any] = None,
            use_mcp: bool = True) -> Dict[str, Any]:
    """
    Synchronous wrapper for running parallel agents on a task.
    """
    return asyncio.run(run_parallel_agents(
        task_name=task_name,
        task_description=task_description,
        context=context,
        use_mcp=use_mcp
    ))

async def main():
    """Main function to run the parallel agent framework."""
    try:
        # Initialize framework
        framework = await initialize_framework()
        
        # Create initial tasks
        await create_initial_tasks(framework)
        
        # Start the framework
        logger.info("Starting Parallel Agent Framework")
        await framework.start()
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down")
        framework.stop()
    except Exception as e:
        logger.error(f"Error in main function: {str(e)}")
    finally:
        logger.info("Parallel Agent Framework shutdown complete")

if __name__ == "__main__":
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Run the main function
    asyncio.run(main()) 