# GENXAIS Framework - Agent System

## Overview

The GENXAIS Framework Agent System implements a sophisticated multi-agent architecture with strict mode-based restrictions and responsibilities. Each agent operates in one of five distinct modes (VAN, PLAN, CREATE, IMPLEMENT, REVIEW), with clearly defined permissions and limitations.

## Agent Modes

### VAN Mode (Validation, Analysis, Navigation)

**Allowed Actions:**
- Read system data and logs
- Analyze performance metrics
- Validate requirements
- Generate analytical reports

**Forbidden Actions:**
- Write or modify code
- Create design documents
- Make implementation decisions
- Deploy or execute code

### PLAN Mode

**Allowed Actions:**
- Create project plans
- Define resource requirements
- Establish success criteria
- Set milestones and timelines

**Forbidden Actions:**
- Write or modify code
- Execute plans
- Modify existing systems
- Deploy changes

### CREATE Mode

**Allowed Actions:**
- Generate code
- Design architecture
- Create specifications
- Develop schemas

**Forbidden Actions:**
- Deploy code to production
- Modify production systems
- Change requirements
- Execute code

### IMPLEMENT Mode

**Allowed Actions:**
- Deploy code
- Integrate components
- Configure systems
- Run tests

**Forbidden Actions:**
- Modify requirements
- Change architecture
- Create new designs
- Exceed defined scope

### REVIEW Mode

**Allowed Actions:**
- Review code
- Assess quality
- Identify issues
- Provide feedback

**Forbidden Actions:**
- Modify code
- Implement fixes
- Change designs
- Deploy changes

## Quality Thresholds

Each mode has specific quality thresholds that must be met:

| Mode      | Metric              | Threshold |
|-----------|---------------------|-----------|
| VAN       | Analysis Coverage   | 80%       |
| VAN       | Validation Accuracy | 90%       |
| PLAN      | Plan Completeness   | 90%       |
| CREATE    | Code Quality        | 85%       |
| IMPLEMENT | Deployment Success  | 95%       |
| REVIEW    | Review Coverage     | 90%       |

## Implementation

The agent system is implemented through the following key components:

- `base_agent.py`: Core agent classes and mode restrictions
- `agent_framework.py`: Framework for managing agent interactions
- `mode_manager.py`: Handles mode transitions and validations

## Usage

Agents are instantiated with a specific mode and automatically inherit the corresponding restrictions:

```python
from genxais.agents import BaseAgent, AgentMode

# Create an agent in VAN mode
agent = BaseAgent(mode=AgentMode.VAN)

# Actions are automatically validated against mode restrictions
if agent.validate_action("read_system_data"):
    # Proceed with action
    pass
```

## Extension

To create new agent types:

1. Inherit from `BaseAgent`
2. Implement required abstract methods
3. Respect mode restrictions
4. Add any specialized functionality

Example:

```python
class CustomAgent(BaseAgent):
    async def execute_task(self, task):
        if not self.validate_action(task["action"]):
            raise ValueError("Action not allowed in current mode")
        # Implement task execution
        return result
```

## Security

The agent system enforces strict security through:

- Mode-based action validation
- Quality threshold enforcement
- Clear separation of responsibilities
- Explicit forbidden actions

## Integration

The agent system integrates with the broader GENXAIS framework through:

- Mode transition management
- Quality validation
- Action logging
- Performance monitoring 