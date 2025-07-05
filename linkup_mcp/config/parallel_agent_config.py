"""
Configuration for the Parallel Agent Framework.
Defines the APM phases, agent specializations, and handover protocols.
"""

from enum import Enum
from typing import Dict, List, Optional

# APM Framework Phases
class APMPhase(str, Enum):
    """The five phases of the APM framework."""
    COLLECT = "collect"
    DETECT = "detect"
    DIAGNOSE = "diagnose"
    RESOLVE = "resolve"
    MONITOR = "monitor"

# Agent Phases (VAN-PLAN-CREATE-IMPLEMENT-REVIEW)
class AgentPhase(str, Enum):
    """The five agent phases in the parallel pipeline."""
    VAN = "validate_analyze_think"
    PLAN = "plan"
    CREATE = "create"
    IMPLEMENT = "implement"
    REVIEW = "review"

# Mapping between APM Phases and Agent Phases
APM_AGENT_PHASE_MAPPING = {
    APMPhase.COLLECT: AgentPhase.VAN,
    APMPhase.DETECT: AgentPhase.VAN,
    APMPhase.DIAGNOSE: AgentPhase.PLAN,
    APMPhase.RESOLVE: [AgentPhase.CREATE, AgentPhase.IMPLEMENT],
    APMPhase.MONITOR: AgentPhase.REVIEW
}

# Agent Specializations
class AgentSpecialization(str, Enum):
    """Specializations for different agent types."""
    # VAN Specializations
    ERP_DATA_ANALYSIS = "erp_data_analysis"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    SECURITY_ANALYSIS = "security_analysis"
    BUSINESS_ANALYSIS = "business_analysis"
    
    # PLAN Specializations
    OPTIMIZATION_PLANNING = "optimization_planning"
    INTEGRATION_PLANNING = "integration_planning"
    ARCHITECTURE_PLANNING = "architecture_planning"
    
    # CREATE Specializations
    CODE_DESIGN = "code_design"
    UI_DESIGN = "ui_design"
    DATABASE_DESIGN = "database_design"
    
    # IMPLEMENT Specializations
    CODE_IMPLEMENTATION = "code_implementation"
    SYSTEM_CONFIGURATION = "system_configuration"
    DEPLOYMENT = "deployment"
    
    # REVIEW Specializations
    QUALITY_ASSURANCE = "quality_assurance"
    PERFORMANCE_TESTING = "performance_testing"
    SECURITY_TESTING = "security_testing"

# Handover Protocol Configuration
HANDOVER_TEMPLATE = """
# [{phase}] Handover: {task_name}

## Summary
{summary}

## Context
{context}

## Recommendations
{recommendations}

## Metrics
{metrics}
"""

# Memory Bank Configuration
MEMORY_BANK_CONFIG = {
    "collections": [
        "handovers",
        "context",
        "tasks",
        "metrics"
    ],
    "vector_dimensions": 1536,  # OpenAI embedding dimensions
    "index_fields": [
        "summary",
        "context",
        "recommendations"
    ],
    "retention_period_days": 30
}

# Agent Configuration
AGENT_CONFIG = {
    AgentPhase.VAN: {
        "max_instances": 3,
        "specializations": [
            AgentSpecialization.ERP_DATA_ANALYSIS,
            AgentSpecialization.PERFORMANCE_ANALYSIS,
            AgentSpecialization.SECURITY_ANALYSIS,
            AgentSpecialization.BUSINESS_ANALYSIS
        ],
        "task_timeout_seconds": 300,
        "apm_phases": [APMPhase.COLLECT, APMPhase.DETECT]
    },
    AgentPhase.PLAN: {
        "max_instances": 2,
        "specializations": [
            AgentSpecialization.OPTIMIZATION_PLANNING,
            AgentSpecialization.INTEGRATION_PLANNING,
            AgentSpecialization.ARCHITECTURE_PLANNING
        ],
        "task_timeout_seconds": 300,
        "apm_phases": [APMPhase.DIAGNOSE]
    },
    AgentPhase.CREATE: {
        "max_instances": 3,
        "specializations": [
            AgentSpecialization.CODE_DESIGN,
            AgentSpecialization.UI_DESIGN,
            AgentSpecialization.DATABASE_DESIGN
        ],
        "task_timeout_seconds": 600,
        "apm_phases": [APMPhase.RESOLVE]
    },
    AgentPhase.IMPLEMENT: {
        "max_instances": 3,
        "specializations": [
            AgentSpecialization.CODE_IMPLEMENTATION,
            AgentSpecialization.SYSTEM_CONFIGURATION,
            AgentSpecialization.DEPLOYMENT
        ],
        "task_timeout_seconds": 900,
        "apm_phases": [APMPhase.RESOLVE]
    },
    AgentPhase.REVIEW: {
        "max_instances": 2,
        "specializations": [
            AgentSpecialization.QUALITY_ASSURANCE,
            AgentSpecialization.PERFORMANCE_TESTING,
            AgentSpecialization.SECURITY_TESTING
        ],
        "task_timeout_seconds": 300,
        "apm_phases": [APMPhase.MONITOR]
    }
}

# APM Phase Configuration
APM_PHASE_CONFIG = {
    APMPhase.COLLECT: {
        "description": "Data gathering and metrics collection phase",
        "required_metrics": [
            "response_times",
            "error_rates",
            "resource_usage",
            "transaction_volumes"
        ],
        "handover_requirements": [
            "standardized_metrics_format",
            "data_quality_validation",
            "sampling_rates",
            "threshold_definitions"
        ]
    },
    APMPhase.DETECT: {
        "description": "Anomaly detection and pattern recognition phase",
        "required_metrics": [
            "anomaly_count",
            "pattern_confidence",
            "detection_latency"
        ],
        "handover_requirements": [
            "anomaly_classification",
            "priority_levels",
            "context_information",
            "initial_impact_assessment"
        ]
    },
    APMPhase.DIAGNOSE: {
        "description": "Root cause analysis and impact assessment phase",
        "required_metrics": [
            "diagnosis_confidence",
            "impact_severity",
            "affected_components"
        ],
        "handover_requirements": [
            "detailed_problem_analysis",
            "action_recommendations",
            "prioritized_measures",
            "impact_assessment"
        ]
    },
    APMPhase.RESOLVE: {
        "description": "Solution development and implementation phase",
        "required_metrics": [
            "implementation_time",
            "code_quality",
            "test_coverage",
            "deployment_success"
        ],
        "handover_requirements": [
            "documented_changes",
            "success_metrics",
            "lessons_learned",
            "rollback_plan"
        ]
    },
    APMPhase.MONITOR: {
        "description": "Performance monitoring and validation phase",
        "required_metrics": [
            "system_health",
            "performance_baseline",
            "user_experience",
            "business_kpis"
        ],
        "handover_requirements": [
            "validation_results",
            "performance_comparison",
            "improvement_suggestions",
            "next_iteration_focus"
        ]
    }
} 