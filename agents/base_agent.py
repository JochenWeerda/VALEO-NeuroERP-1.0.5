"""
Base Agent Module for GENXAIS Framework.

This module provides the foundational agent classes that define the core functionality
and restrictions for different agent types in the GENXAIS framework.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class AgentMode(str, Enum):
    """Defines the different operational modes for agents."""
    VAN = "van"
    PLAN = "plan"
    CREATE = "create"
    IMPLEMENT = "implement"
    REVIEW = "review"

class AgentRestrictions(BaseModel):
    """Defines the restrictions and permissions for an agent."""
    allowed_actions: List[str]
    forbidden_actions: List[str]
    required_outputs: List[str]
    quality_thresholds: Dict[str, float]

class BaseAgent(ABC):
    """
    Abstract base class for all agents in the GENXAIS framework.
    
    This class defines the core interface and shared functionality that all
    agents must implement, including mode-specific restrictions and validations.
    """
    
    def __init__(self, mode: AgentMode):
        self.mode = mode
        self.restrictions = self._get_mode_restrictions()
        
    @abstractmethod
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task within the agent's current mode restrictions."""
        pass
        
    def _get_mode_restrictions(self) -> AgentRestrictions:
        """Get the restrictions for the current mode."""
        if self.mode == AgentMode.VAN:
            return AgentRestrictions(
                allowed_actions=[
                    "read_system_data",
                    "analyze_metrics",
                    "validate_requirements",
                    "generate_reports"
                ],
                forbidden_actions=[
                    "modify_code",
                    "create_designs",
                    "make_implementation_decisions",
                    "deploy_code"
                ],
                required_outputs=[
                    "analysis_report",
                    "validation_results",
                    "metric_dashboard"
                ],
                quality_thresholds={
                    "analysis_coverage": 0.8,
                    "validation_accuracy": 0.9,
                    "report_quality": 0.85
                }
            )
        elif self.mode == AgentMode.PLAN:
            return AgentRestrictions(
                allowed_actions=[
                    "create_plans",
                    "define_requirements",
                    "allocate_resources",
                    "set_milestones"
                ],
                forbidden_actions=[
                    "modify_code",
                    "execute_plans",
                    "modify_systems",
                    "deploy_changes"
                ],
                required_outputs=[
                    "project_plan",
                    "resource_allocation",
                    "technical_requirements"
                ],
                quality_thresholds={
                    "plan_completeness": 0.9,
                    "requirement_clarity": 0.85,
                    "resource_efficiency": 0.8
                }
            )
        elif self.mode == AgentMode.CREATE:
            return AgentRestrictions(
                allowed_actions=[
                    "generate_code",
                    "design_architecture",
                    "create_specifications",
                    "develop_schemas"
                ],
                forbidden_actions=[
                    "deploy_code",
                    "modify_production",
                    "change_requirements",
                    "execute_code"
                ],
                required_outputs=[
                    "source_code",
                    "technical_specs",
                    "architecture_design"
                ],
                quality_thresholds={
                    "code_quality": 0.85,
                    "design_completeness": 0.9,
                    "spec_clarity": 0.8
                }
            )
        elif self.mode == AgentMode.IMPLEMENT:
            return AgentRestrictions(
                allowed_actions=[
                    "deploy_code",
                    "integrate_components",
                    "configure_systems",
                    "run_tests"
                ],
                forbidden_actions=[
                    "modify_requirements",
                    "change_architecture",
                    "create_designs",
                    "exceed_scope"
                ],
                required_outputs=[
                    "deployment_report",
                    "test_results",
                    "integration_status"
                ],
                quality_thresholds={
                    "deployment_success": 0.95,
                    "test_coverage": 0.9,
                    "integration_quality": 0.85
                }
            )
        elif self.mode == AgentMode.REVIEW:
            return AgentRestrictions(
                allowed_actions=[
                    "review_code",
                    "assess_quality",
                    "identify_issues",
                    "provide_feedback"
                ],
                forbidden_actions=[
                    "modify_code",
                    "implement_fixes",
                    "change_designs",
                    "deploy_changes"
                ],
                required_outputs=[
                    "review_report",
                    "quality_assessment",
                    "improvement_suggestions"
                ],
                quality_thresholds={
                    "review_coverage": 0.9,
                    "assessment_accuracy": 0.85,
                    "feedback_quality": 0.8
                }
            )
        else:
            raise ValueError(f"Unknown mode: {self.mode}")
            
    def validate_action(self, action: str) -> bool:
        """Validate if an action is allowed in the current mode."""
        return (action in self.restrictions.allowed_actions and 
                action not in self.restrictions.forbidden_actions)
                
    def validate_output_quality(self, output_metrics: Dict[str, float]) -> bool:
        """Validate if the output meets quality thresholds."""
        return all(
            output_metrics.get(metric, 0) >= threshold 
            for metric, threshold in self.restrictions.quality_thresholds.items()
        ) 