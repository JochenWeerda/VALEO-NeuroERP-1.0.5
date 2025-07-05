"""
Testfälle für den CREATE-Mode des APM-Frameworks.
Enthält Unit-Tests für die Codegenerierung, Ressourcenbereitstellung und Tests.
"""

import pytest
import asyncio
from unittest.mock import MagicMock, patch
from datetime import datetime
from typing import Dict, List, Any

from backend.apm_framework.create_mode import CREATEMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.rag_service import RAGService


@pytest.fixture
def mock_mongodb_connector():
    """Fixture für einen Mock des MongoDB-Connectors."""
    mock_connector = MagicMock(spec=APMMongoDBConnector)
    
    # Mock für find_one
    mock_connector.find_one.return_value = {
        "_id": "test_id",
        "name": "Test Plan",
        "solution_design_id": "test_solution_id"
    }
    
    # Mock für find_many
    mock_connector.find_many.return_value = [
        {"_id": "task_1", "name": "Task 1", "component": "TestComponent"},
        {"_id": "task_2", "name": "Task 2", "component": "TestComponent"}
    ]
    
    # Mock für insert_one
    mock_connector.insert_one.return_value = "test_result_id"
    
    return mock_connector


@pytest.fixture
def mock_rag_service():
    """Fixture für einen Mock des RAG-Service."""
    mock_service = MagicMock(spec=RAGService)
    
    async def mock_rag_query(query, *args, **kwargs):
        return {
            "response": "// Generated code\nclass TestClass {\n  constructor() {}\n}",
            "documents": [{"title": "Test Document", "score": 0.95}]
        }
    
    mock_service.rag_query = mock_rag_query
    return mock_service


@pytest.fixture
def create_mode(mock_mongodb_connector):
    """Fixture für den CREATE-Mode mit gemocktem MongoDB-Connector."""
    return CREATEMode(mock_mongodb_connector, "test_project_id")


@pytest.fixture
def solution_design():
    """Fixture für ein Testlösungsdesign."""
    return {
        "_id": "test_solution_id",
        "name": "Test Solution Design",
        "components": [
            {
                "name": "TestComponent",
                "type": "class",
                "description": "Eine Testkomponente",
                "language": "JavaScript",
                "dependencies": ["OtherComponent"]
            }
        ],
        "resources": [
            {
                "name": "TestDatabase",
                "type": "database",
                "description": "Eine Testdatenbank",
                "quantity": 1,
                "configuration": {"host": "localhost", "port": 27017}
            }
        ],
        "design_patterns": [
            {
                "name": "Singleton",
                "category": "creational",
                "description": "Ein Singleton-Entwurfsmuster",
                "use_case": "Globaler Zugriffspunkt",
                "rationale": "Nur eine Instanz erlaubt",
                "artifact_ids": ["test_artifact_id"]
            }
        ]
    }


class TestCREATEMode:
    """Testfälle für den CREATE-Mode."""
    
    @pytest.mark.asyncio
    async def test_init(self, mock_mongodb_connector):
        """Test für die Initialisierung."""
        # Act
        create_mode = CREATEMode(mock_mongodb_connector, "test_project_id")
        
        # Assert
        assert create_mode.mongodb == mock_mongodb_connector
        assert create_mode.project_id == "test_project_id"
        assert create_mode.rag_service is None
    
    @pytest.mark.asyncio
    async def test_set_rag_service(self, create_mode, mock_rag_service):
        """Test für das Setzen des RAG-Service."""
        # Act
        create_mode.set_rag_service(mock_rag_service)
        
        # Assert
        assert create_mode.rag_service == mock_rag_service
    
    @pytest.mark.asyncio
    async def test_get_plan_result(self, create_mode, mock_mongodb_connector):
        """Test für das Abrufen des PLAN-Ergebnisses."""
        # Arrange
        plan_result_id = "test_plan_id"
        
        # Act
        result = await create_mode._get_plan_result(plan_result_id)
        
        # Assert
        assert result["_id"] == "test_id"
        assert result["name"] == "Test Plan"
        mock_mongodb_connector.find_one.assert_called_once_with(
            create_mode.project_plans_collection, {"_id": plan_result_id}
        )
    
    @pytest.mark.asyncio
    async def test_get_solution_design(self, create_mode, mock_mongodb_connector):
        """Test für das Abrufen des Lösungsdesigns."""
        # Arrange
        solution_design_id = "test_solution_id"
        
        # Act
        result = await create_mode._get_solution_design(solution_design_id)
        
        # Assert
        assert result["_id"] == "test_id"
        mock_mongodb_connector.find_one.assert_called_with(
            create_mode.solution_designs_collection, {"_id": solution_design_id}
        )
    
    @pytest.mark.asyncio
    async def test_get_tasks(self, create_mode, mock_mongodb_connector):
        """Test für das Abrufen der Aufgaben."""
        # Arrange
        plan_result_id = "test_plan_id"
        
        # Act
        result = await create_mode._get_tasks(plan_result_id)
        
        # Assert
        assert len(result) == 2
        assert result[0]["_id"] == "task_1"
        assert result[1]["_id"] == "task_2"
        mock_mongodb_connector.find_many.assert_called_once_with(
            create_mode.tasks_collection, {"plan_result_id": plan_result_id}
        )
    
    @pytest.mark.asyncio
    async def test_generate_code_artifacts_with_rag(self, create_mode, solution_design, mock_rag_service):
        """Test für die Generierung von Code-Artefakten mit RAG-Service."""
        # Arrange
        tasks = [
            {"_id": "task_1", "name": "Task 1", "component": "TestComponent"},
            {"_id": "task_2", "name": "Task 2", "component": "OtherComponent"}
        ]
        create_mode.set_rag_service(mock_rag_service)
        
        # Act
        result = await create_mode._generate_code_artifacts(solution_design, tasks)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "TestComponent"
        assert result[0]["type"] == "class"
        assert result[0]["language"] == "JavaScript"
        assert "code" in result[0]
        assert len(result[0]["task_ids"]) == 1
        assert result[0]["task_ids"][0] == "task_1"
    
    @pytest.mark.asyncio
    async def test_generate_code_artifacts_without_rag(self, create_mode, solution_design):
        """Test für die Generierung von Code-Artefakten ohne RAG-Service."""
        # Arrange
        tasks = [
            {"_id": "task_1", "name": "Task 1", "component": "TestComponent"},
            {"_id": "task_2", "name": "Task 2", "component": "OtherComponent"}
        ]
        
        # Act
        result = await create_mode._generate_code_artifacts(solution_design, tasks)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "TestComponent"
        assert result[0]["type"] == "class"
        assert result[0]["language"] == "JavaScript"
        assert "code" in result[0]
        assert "TestComponent" in result[0]["code"]
        assert len(result[0]["task_ids"]) == 1
        assert result[0]["task_ids"][0] == "task_1"
    
    @pytest.mark.asyncio
    async def test_generate_resource_requirements(self, create_mode, solution_design):
        """Test für die Generierung von Ressourcenanforderungen."""
        # Arrange
        tasks = [
            {"_id": "task_1", "name": "Task 1", "resource": "TestDatabase"},
            {"_id": "task_2", "name": "Task 2", "resource": "OtherResource"}
        ]
        
        # Act
        result = await create_mode._generate_resource_requirements(solution_design, tasks)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "TestDatabase"
        assert result[0]["type"] == "database"
        assert result[0]["quantity"] == 1
        assert result[0]["configuration"]["host"] == "localhost"
        assert result[0]["configuration"]["port"] == 27017
        assert len(result[0]["task_ids"]) == 1
        assert result[0]["task_ids"][0] == "task_1"
    
    @pytest.mark.asyncio
    async def test_apply_design_patterns(self, create_mode, solution_design):
        """Test für die Anwendung von Entwurfsmustern."""
        # Arrange
        code_artifacts = [
            {
                "_id": "test_artifact_id",
                "name": "TestComponent",
                "type": "class",
                "language": "JavaScript"
            }
        ]
        
        # Act
        result = await create_mode._apply_design_patterns(solution_design, code_artifacts)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "Singleton"
        assert result[0]["category"] == "creational"
        assert result[0]["use_case"] == "Globaler Zugriffspunkt"
        assert result[0]["rationale"] == "Nur eine Instanz erlaubt"
        assert len(result[0]["code_artifact_ids"]) == 1
        assert result[0]["code_artifact_ids"][0] == "test_artifact_id"
    
    @pytest.mark.asyncio
    async def test_generate_test_cases_with_rag(self, create_mode, solution_design, mock_rag_service):
        """Test für die Generierung von Testfällen mit RAG-Service."""
        # Arrange
        code_artifacts = [
            {
                "_id": "test_artifact_id",
                "name": "TestComponent",
                "type": "class",
                "language": "JavaScript"
            }
        ]
        create_mode.set_rag_service(mock_rag_service)
        
        # Act
        result = await create_mode._generate_test_cases(code_artifacts, solution_design)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "Test für TestComponent"
        assert result[0]["type"] == "unit_test"
        assert "test_code" in result[0]
        assert len(result[0]["code_artifact_ids"]) == 1
        assert result[0]["code_artifact_ids"][0] == "test_artifact_id"
    
    @pytest.mark.asyncio
    async def test_generate_test_cases_without_rag(self, create_mode, solution_design):
        """Test für die Generierung von Testfällen ohne RAG-Service."""
        # Arrange
        code_artifacts = [
            {
                "_id": "test_artifact_id",
                "name": "TestComponent",
                "type": "class",
                "language": "JavaScript"
            }
        ]
        
        # Act
        result = await create_mode._generate_test_cases(code_artifacts, solution_design)
        
        # Assert
        assert len(result) == 1
        assert result[0]["name"] == "Test für TestComponent"
        assert result[0]["type"] == "unit_test"
        assert "test_code" in result[0]
        assert "TestComponent" in result[0]["test_code"]
        assert len(result[0]["code_artifact_ids"]) == 1
        assert result[0]["code_artifact_ids"][0] == "test_artifact_id"
    
    @pytest.mark.asyncio
    async def test_save_result(self, create_mode, mock_mongodb_connector):
        """Test für das Speichern des Ergebnisses."""
        # Arrange
        result = {
            "project_id": "test_project_id",
            "plan_result_id": "test_plan_id",
            "timestamp": datetime.now(),
            "code_artifacts": [],
            "resource_requirements": [],
            "design_patterns": [],
            "test_cases": []
        }
        
        # Act
        result_id = await create_mode._save_result(result)
        
        # Assert
        assert result_id == "test_result_id"
        mock_mongodb_connector.insert_one.assert_called_once_with(
            create_mode.create_results_collection, result
        )
    
    @pytest.mark.asyncio
    async def test_run(self, create_mode, mock_mongodb_connector, solution_design, mock_rag_service):
        """Test für die Ausführung des CREATE-Mode."""
        # Arrange
        plan_result_id = "test_plan_id"
        create_mode.set_rag_service(mock_rag_service)
        
        # Mock für die internen Methoden
        async def mock_get_plan_result(plan_id):
            return {
                "_id": "test_plan_id",
                "name": "Test Plan",
                "solution_design_id": "test_solution_id"
            }
        
        async def mock_get_solution_design(design_id):
            return solution_design
        
        async def mock_get_tasks(plan_id):
            return [
                {"_id": "task_1", "name": "Task 1", "component": "TestComponent"},
                {"_id": "task_2", "name": "Task 2", "component": "OtherComponent"}
            ]
        
        code_artifacts = [{"name": "TestComponent", "_id": "test_artifact_id"}]
        resource_requirements = [{"name": "TestDatabase", "_id": "test_resource_id"}]
        design_patterns = [{"name": "Singleton", "_id": "test_pattern_id"}]
        test_cases = [{"name": "Test für TestComponent", "_id": "test_test_id"}]
        
        async def mock_generate_code_artifacts(*args, **kwargs):
            return code_artifacts
        
        async def mock_generate_resource_requirements(*args, **kwargs):
            return resource_requirements
        
        async def mock_apply_design_patterns(*args, **kwargs):
            return design_patterns
        
        async def mock_generate_test_cases(*args, **kwargs):
            return test_cases
        
        async def mock_save_result(*args, **kwargs):
            return "test_result_id"
        
        create_mode._get_plan_result = mock_get_plan_result
        create_mode._get_solution_design = mock_get_solution_design
        create_mode._get_tasks = mock_get_tasks
        create_mode._generate_code_artifacts = mock_generate_code_artifacts
        create_mode._generate_resource_requirements = mock_generate_resource_requirements
        create_mode._apply_design_patterns = mock_apply_design_patterns
        create_mode._generate_test_cases = mock_generate_test_cases
        create_mode._save_result = mock_save_result
        
        # Act
        result = await create_mode.run(plan_result_id)
        
        # Assert
        assert result["project_id"] == "test_project_id"
        assert result["plan_result_id"] == plan_result_id
        assert result["code_artifacts"] == code_artifacts
        assert result["resource_requirements"] == resource_requirements
        assert result["design_patterns"] == design_patterns
        assert result["test_cases"] == test_cases
        assert result["id"] == "test_result_id" 