# GENXAIS Framework Integration with MongoDB

This documentation describes the integration of the GENXAIS Framework with MongoDB in the system.

## Overview

The GENXAIS Framework uses MongoDB integration to store and retrieve project management data. The integration enables a structured approach to the development of components through different modes.

## Architecture

The integration consists of the following components:

1. **GENXAIS Framework**: Implements the workflow for the development of components
2. **MongoDB Integration**: Establishes the connection to the MongoDB database and provides CRUD operations
3. **RAG Service**: Provides answers to queries based on documents and context information

```
+------------------+      +------------------+      +------------------+
|                  |      |                  |      |                  |
| GENXAIS Framework+----->+ MongoDB-Connector+----->+     MongoDB      |
|                  |      |                  |      |                  |
+--------+---------+      +------------------+      +------------------+
         |
         v
+------------------+      +------------------+
|                  |      |                  |
|   RAG-Service    +----->+  Document Base   |
|                  |      |                  |
+------------------+      +------------------+
```

## Data Models

The GENXAIS Framework uses the following data models that are stored in MongoDB:

### VAN Mode
- `ClarificationItem`: Clarification questions and answers
- `RequirementAnalysis`: Requirement analyses

### PLAN Mode
- `ProjectPlan`: Project plans with milestones and scheduling
- `SolutionDesign`: Solution designs with design decisions and alternatives
- `Task`: Tasks with dependencies and priorities
- `PlanResult`: Results of the planning phase

### CREATE Mode
- `CodeArtifact`: Code artifacts
- `ResourceRequirement`: Resource requirements
- `DesignPattern`: Design patterns
- `TestCase`: Test cases
- `CreateResult`: Results of the creation phase

### IMPLEMENTATION Mode
- `IntegrationResult`: Integration results
- `TestResult`: Test results
- `DeploymentConfig`: Deployment configurations
- `EvaluationMetric`: Evaluation metrics
- `Improvement`: Improvements
- `ImplementationResult`: Results of the implementation phase

### Workflow Result
- `WorkflowResult`: Overall result of the workflow

## Using the MongoDB Integration in the GENXAIS Framework

The GENXAIS Framework uses the `MongoDBConnector`, which provides functions for the framework:

```python
# MongoDB connector methods for the GENXAIS Framework
def track_task(self, task_data: Dict[str, Any]) -> str:
    """Tracks a task in MongoDB."""
    return self.insert_one("task_history", task_data)

def get_related_knowledge(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieves related knowledge for a task."""
    # Implementation of a semantic search in the stored data
    # ...
```

## Integration with the RAG Service

The GENXAIS Framework uses the RAG Service for various tasks:

1. **VAN Mode**:
   - Analysis of requirements
   - Generation of clarification questions

2. **PLAN Mode**:
   - Generation of project plans
   - Generation of solution designs
   - Generation of tasks

The integration with the RAG Service is done via the `set_rag_service` method:

```python
# Set RAG service for all modes
workflow = WorkflowController(mongodb_uri="mongodb://localhost:27017/", db_name="genxais_framework")
workflow.set_rag_service(rag_service)
```

## Benefits of the Integration

The integration of the GENXAIS Framework with MongoDB offers the following benefits:

1. **Persistent Storage**: All project management data is persisted and can be retrieved later.
2. **Traceability**: Decisions and analyses are documented and traceable.
3. **Knowledge Reuse**: Knowledge from previous projects can be reused for new projects.
4. **Structured Approach**: The GENXAIS Framework provides a structured approach to component development.
5. **Scalability**: MongoDB offers a scalable solution for storing large amounts of data.

## Example: Complete Workflow

```python
import asyncio
from genxais_framework.workflow import WorkflowController
from genxais_framework.rag_system.rag_service import RAGService

async def main():
    # Initialize workflow
    workflow = WorkflowController(mongodb_uri="mongodb://localhost:27017/", db_name="genxais_framework")
    
    # Initialize and set RAG service
    rag_service = RAGService()
    workflow.set_rag_service(rag_service)
    
    # Define requirement
    requirement_text = """
    Implementation of a module for token optimization in the system.
    The module should optimize token usage, track consumption, and generate reports.
    """
    
    # Execute workflow
    result = await workflow.run_workflow(requirement_text)
    
    # Process result
    print(f"Workflow ID: {result.get('id')}")
    print(f"VAN Analysis ID: {result.get('van_result', {}).get('id')}")
    print(f"PLAN Result ID: {result.get('plan_result', {}).get('id')}")
    
    # Close connections
    workflow.close()

# Execute
asyncio.run(main())
```

## Conclusion

The integration of the GENXAIS Framework with MongoDB provides a powerful solution for component development. The structured approach and persistent storage of project management data enable efficient and traceable development. 