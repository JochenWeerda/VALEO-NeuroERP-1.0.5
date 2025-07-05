# Modularized Handover System

## Overview

The modularized handover system is a component of the GENXAIS Framework. It enables the creation, management, and storage of handover documents between different phases of the development workflow.

The system was designed to improve knowledge transfer between different phases of the workflow and ensure consistent documentation of the development process.

## Architecture

The handover system consists of several components:

1. **HandoverManager**: The central class for managing handover documents
2. **MongoDBConnector**: A wrapper class for MongoDB connections
3. **WorkflowController**: The main class for the workflow that uses the HandoverManager
4. **Templates**: Markdown templates for different phases of the workflow
5. **Scripts**: Helper scripts for creating and managing handover documents

### Class Diagram

```
+-------------------+      +-------------------+      +-------------------+
| HandoverManager   |<-----| WorkflowController|----->| MongoDBConnector  |
+-------------------+      +-------------------+      +-------------------+
| - mongodb_connector|      | - mongodb_connector|      | - client         |
| - project_name    |      | - handover_manager |      | - db             |
| - templates_dir   |      | - current_mode    |      +-------------------+
| - output_dir      |      | - modes_dir       |      | + insert_one()    |
+-------------------+      +-------------------+      | + find_one()      |
| + create_handover_|      | + switch_mode()   |      | + update_one()    |
|   document()      |      | + execute_van_mode|      | + delete_one()    |
| + save_to_mongodb()|      | + execute_plan_mode|     | + close()        |
| + get_latest_     |      | + execute_create_ |      +-------------------+
|   handover()      |      |   mode()          |
+-------------------+      | + execute_implement_|
                           |   mode()          |
                           | + execute_reflect_|
                           |   mode()          |
                           +-------------------+
```

## Workflow

The typical workflow for the handover system is as follows:

1. The WorkflowController is initialized and configured with a HandoverManager and a MongoDBConnector
2. The user executes a phase of the workflow (e.g., VAN, PLAN, CREATE, IMPLEMENT, REFLECT)
3. When switching to the next phase, a handover document is automatically created
4. The handover document is stored in MongoDB and can be retrieved later

### Sequence Diagram

```
+--------+           +-------------+          +-----------+          +--------+
| Client |           | Workflow    |          | Handover  |          | MongoDB|
|        |           | Controller  |          | Manager   |          |        |
+---+----+           +------+------+          +-----+-----+          +---+----+
    |                       |                       |                    |
    | execute_van_mode()    |                       |                    |
    +---------------------->|                       |                    |
    |                       |                       |                    |
    |                       | switch_mode("VAN")    |                    |
    |                       +---------------------->|                    |
    |                       |                       |                    |
    |                       |                       | create_handover_   |
    |                       |                       | document()         |
    |                       |                       +------------------->|
    |                       |                       |                    |
    |                       |                       | save_to_mongodb()  |
    |                       |                       +------------------->|
    |                       |                       |                    |
    |                       |<----------------------+                    |
    |                       |                       |                    |
    |<----------------------+                       |                    |
    |                       |                       |                    |
```

## Configuration

The handover system can be configured using various parameters:

### HandoverManager

- `mongodb_uri`: MongoDB connection string (default: "mongodb://localhost:27017/")
- `db_name`: Database name (default: "genxais_framework")
- `project_name`: Project name (default: "GENXAIS-Framework")

### WorkflowController

- `mongodb_uri`: MongoDB connection string (default: "mongodb://localhost:27017/")
- `db_name`: Database name (default: "genxais_framework")
- `project_name`: Project name (default: "GENXAIS-Framework")

## API Reference

### HandoverManager

```python
class HandoverManager:
    """
    Manager for handover documents between different phases of the workflow.
    Supports different templates depending on the phase and manages storage in MongoDB.
    """
    
    # Workflow phases
    PHASE_VAN = "VAN"       # Vision, Analysis, Navigation
    PHASE_PLAN = "PLAN"     # Planning
    PHASE_CREATE = "CREATE"  # Creative phase
    PHASE_IMPLEMENT = "IMPLEMENT"  # Implementation
    PHASE_REFLECT = "REFLECT"  # Reflection and archiving
    
    def __init__(self, 
                mongodb_uri: str = "mongodb://localhost:27017/", 
                db_name: str = "genxais_framework",
                project_name: str = "GENXAIS-Framework"):
        """
        Initializes the HandoverManager.
        
        Args:
            mongodb_uri: MongoDB connection string
            db_name: Database name
            project_name: Project name
        """
        
    def create_handover_document(self, 
                               phase: str, 
                               content: Dict[str, Any]) -> str:
        """
        Creates a handover document based on the specified phase and content.
        
        Args:
            phase: Workflow phase (VAN, PLAN, CREATE, IMPLEMENT, REFLECT)
            content: Content of the handover document
            
        Returns:
            Path to the created handover document
        """
        
    async def save_to_mongodb(self, handover_path: str) -> str:
        """
        Saves the handover document to MongoDB.
        
        Args:
            handover_path: Path to the handover document
            
        Returns:
            ID of the saved handover document
        """
        
    def get_latest_handover(self) -> Optional[Dict[str, Any]]:
        """
        Returns the latest handover document.
        
        Returns:
            Latest handover document or None if none was found
        """
```

### WorkflowController

```python
class WorkflowController:
    """
    Workflow controller for the framework.
    Manages the workflow between different phases of the framework.
    """
    
    def __init__(self, 
                mongodb_uri: str = "mongodb://localhost:27017/", 
                db_name: str = "genxais_framework",
                project_name: str = "GENXAIS-Framework"):
        """
        Initializes the workflow controller.
        
        Args:
            mongodb_uri: MongoDB connection string
            db_name: Database name
            project_name: Project name
        """
        
    async def switch_mode(self, mode: str) -> bool:
        """
        Switches the mode and creates a handover document.
        
        Args:
            mode: New mode (VAN, PLAN, CREATE, IMPLEMENT, REFLECT)
            
        Returns:
            True if the mode switch was successful, False otherwise
        """
        
    async def execute_van_mode(self, requirement_text: str) -> Dict[str, Any]:
        """
        Executes the VAN mode.
        
        Args:
            requirement_text: Requirement text
            
        Returns:
            Result of the VAN analysis
        """
```

## Example Usage

```python
import asyncio
from genxais_framework.handover import HandoverManager
from genxais_framework.workflow import WorkflowController

async def main():
    # Initialize the workflow controller
    workflow = WorkflowController(
        mongodb_uri="mongodb://localhost:27017/",
        db_name="genxais_framework",
        project_name="My Project"
    )
    
    # Execute the VAN mode
    van_result = await workflow.execute_van_mode("Implement a token optimization system")
    
    # Switch to PLAN mode
    await workflow.switch_mode("PLAN")
    
    # Execute the PLAN mode
    plan_result = await workflow.execute_plan_mode(van_result)
    
    # Get the latest handover document
    handover = workflow.handover_manager.get_latest_handover()
    print(f"Latest handover: {handover}")
    
    # Close connections
    workflow.close()

# Run the example
asyncio.run(main())
```

## Benefits

The handover system provides several benefits:

1. **Knowledge Transfer**: Facilitates knowledge transfer between different phases of the workflow
2. **Documentation**: Ensures consistent documentation of the development process
3. **Traceability**: Provides traceability of decisions and changes
4. **Collaboration**: Enables collaboration between different teams and roles
5. **Efficiency**: Increases efficiency by reducing knowledge loss and duplication of effort

## Future Enhancements

Planned enhancements for the handover system include:

1. **Template Customization**: Allow users to customize templates for different phases
2. **Integration with Version Control**: Integrate with version control systems to track changes
3. **Notification System**: Notify users when new handover documents are created
4. **Analytics**: Provide analytics on handover documents and workflow efficiency
5. **Export/Import**: Support for exporting and importing handover documents 