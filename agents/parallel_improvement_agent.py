"""
Langgraph-Agent für die parallele Ausführung von Verbesserungen
"""

import os
from typing import Dict, List, Any
from langchain.agents import Tool, AgentExecutor
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parser import ReActSingleInputOutputParser
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class ParallelImprovementAgent(BaseModel):
    """Agent für die parallele Ausführung von Verbesserungen"""
    
    name: str = Field(description="Name des Agents")
    task: Dict[str, Any] = Field(description="Zu bearbeitende Aufgabe")
    artifacts: List[str] = Field(description="Zu erstellende Artefakte")
    
    class Config:
        arbitrary_types_allowed = True
    
    def execute(self) -> Dict[str, Any]:
        """Führt die zugewiesene Aufgabe aus"""
        
        # Erstelle benötigte Verzeichnisse
        for artifact in self.artifacts:
            os.makedirs(os.path.dirname(artifact), exist_ok=True)
            
        # Implementiere die Aufgabe
        result = self._implement_task()
        
        return {
            "status": "success",
            "task": self.task["name"],
            "artifacts": self.artifacts,
            "result": result
        }
    
    def _implement_task(self) -> Dict[str, Any]:
        """Implementiert die spezifische Aufgabe"""
        
        task_name = self.task["name"]
        
        if task_name == "feature_toggle_dashboard":
            return self._implement_feature_dashboard()
        elif task_name == "automated_feature_tests":
            return self._implement_feature_tests()
        elif task_name == "feature_documentation":
            return self._implement_documentation()
        elif task_name == "feature_metrics":
            return self._implement_feature_metrics()
        elif task_name == "service_layer":
            return self._implement_service_layer()
        elif task_name == "api_versioning":
            return self._implement_api_versioning()
        elif task_name == "api_documentation":
            return self._implement_api_docs()
        elif task_name == "module_refactoring":
            return self._implement_refactoring()
        elif task_name == "circular_dependencies":
            return self._implement_dependency_resolver()
        elif task_name == "coupling_reduction":
            return self._implement_coupling_analyzer()
        elif task_name == "di_framework":
            return self._implement_di_framework()
        elif task_name == "import_handler_integration":
            return self._implement_import_handler()
        elif task_name == "import_optimization":
            return self._implement_import_optimization()
        elif task_name == "cycle_detection":
            return self._implement_cycle_detection()
        elif task_name == "import_handler_monitoring":
            return self._implement_import_monitoring()
        elif task_name == "module_health_checks":
            return self._implement_health_checks()
        elif task_name == "dependency_visualization":
            return self._implement_graph_visualizer()
        elif task_name == "monitoring":
            return self._implement_monitoring()
        else:
            raise ValueError(f"Unbekannte Aufgabe: {task_name}")
    
    def _implement_feature_dashboard(self) -> Dict[str, Any]:
        """Implementiert das Feature-Toggle-Dashboard"""
        
        # Frontend-Komponente erstellen
        dashboard_component = """
import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Switch, 
    Table, 
    Tag, 
    Space, 
    Button,
    notification 
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Feature {
    name: string;
    description: string;
    enabled: boolean;
    category: string;
    lastModified: string;
}

export const FeatureToggleDashboard: React.FC = () => {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/features');
            const data = await response.json();
            setFeatures(data);
        } catch (error) {
            notification.error({
                message: 'Fehler',
                description: 'Features konnten nicht geladen werden.'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleToggle = async (name: string, enabled: boolean) => {
        try {
            await fetch(`/api/features/${name}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled }),
            });
            
            setFeatures(prev => 
                prev.map(f => 
                    f.name === name ? { ...f, enabled } : f
                )
            );
            
            notification.success({
                message: 'Erfolg',
                description: `Feature "${name}" wurde ${enabled ? 'aktiviert' : 'deaktiviert'}.`
            });
        } catch (error) {
            notification.error({
                message: 'Fehler',
                description: 'Status konnte nicht geändert werden.'
            });
        }
    };

    const columns = [
        {
            title: 'Feature',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Feature, b: Feature) => a.name.localeCompare(b.name),
        },
        {
            title: 'Beschreibung',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Kategorie',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="blue">{category}</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean, record: Feature) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => handleToggle(record.name, checked)}
                />
            ),
        },
        {
            title: 'Letzte Änderung',
            dataIndex: 'lastModified',
            key: 'lastModified',
            sorter: (a: Feature, b: Feature) => 
                new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime(),
        },
    ];

    return (
        <Card 
            title="Feature Management"
            extra={
                <Button 
                    icon={<ReloadOutlined />}
                    onClick={fetchFeatures}
                    loading={loading}
                >
                    Aktualisieren
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={features}
                rowKey="name"
                loading={loading}
            />
        </Card>
    );
};
"""
        
        # Backend-API erstellen
        api_implementation = """
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.core.config import Config

router = APIRouter()

class FeatureUpdate(BaseModel):
    enabled: bool

class Feature(BaseModel):
    name: str
    description: str
    enabled: bool
    category: str
    lastModified: str

@router.get("/features", response_model=List[Feature])
async def get_features():
    """Gibt alle verfügbaren Features zurück"""
    config = Config()
    features = []
    
    for name, enabled in config.FEATURES.items():
        features.append(
            Feature(
                name=name,
                description=config.get_feature_description(name),
                enabled=enabled,
                category=config.get_feature_category(name),
                lastModified=config.get_feature_last_modified(name)
            )
        )
    
    return features

@router.patch("/features/{feature_name}", response_model=Feature)
async def update_feature(feature_name: str, update: FeatureUpdate):
    """Aktualisiert den Status eines Features"""
    config = Config()
    
    if feature_name not in config.FEATURES:
        raise HTTPException(status_code=404, detail="Feature nicht gefunden")
    
    config.update_feature_flag(feature_name, update.enabled)
    
    return Feature(
        name=feature_name,
        description=config.get_feature_description(feature_name),
        enabled=update.enabled,
        category=config.get_feature_category(feature_name),
        lastModified=datetime.now().isoformat()
    )
"""

        # Speichere die Implementierungen
        with open("frontend/src/components/FeatureToggleDashboard/index.tsx", "w") as f:
            f.write(dashboard_component)
            
        with open("backend/api/feature_management.py", "w") as f:
            f.write(api_implementation)
            
        return {
            "status": "success",
            "message": "Feature-Toggle-Dashboard erfolgreich implementiert",
            "files_created": [
                "frontend/src/components/FeatureToggleDashboard/index.tsx",
                "backend/api/feature_management.py"
            ]
        }
    
    def _implement_feature_tests(self) -> Dict[str, Any]:
        """Implementiert automatisierte Feature-Tests"""
        
        test_runner = """
import pytest
import asyncio
from typing import List, Dict, Any
from backend.core.config import Config
from backend.tests.conftest import app, client, test_db

class TestFeatureManagement:
    """Tests für das Feature-Management-System"""
    
    async def test_feature_listing(self, client):
        """Test: Abrufen aller Features"""
        response = await client.get("/api/features")
        assert response.status_code == 200
        features = response.json()
        assert isinstance(features, list)
        assert all(isinstance(f, dict) for f in features)
        
    async def test_feature_toggle(self, client):
        """Test: Feature-Status ändern"""
        # Hole erstes Feature
        response = await client.get("/api/features")
        features = response.json()
        test_feature = features[0]["name"]
        
        # Toggle Feature
        new_state = not features[0]["enabled"]
        response = await client.patch(
            f"/api/features/{test_feature}",
            json={"enabled": new_state}
        )
        assert response.status_code == 200
        assert response.json()["enabled"] == new_state
        
    async def test_invalid_feature(self, client):
        """Test: Nicht existierendes Feature"""
        response = await client.patch(
            "/api/features/non_existent",
            json={"enabled": True}
        )
        assert response.status_code == 404

class TestFeatureImplementation:
    """Tests für Feature-Implementierungen"""
    
    def test_feature_registration(self):
        """Test: Feature-Registrierung"""
        config = Config()
        test_feature = "test_feature"
        
        # Feature registrieren
        config.register_feature(
            name=test_feature,
            enabled=False,
            description="Test Feature",
            category="test"
        )
        
        assert test_feature in config.FEATURES
        assert not config.get_feature_flag(test_feature)
        
    def test_feature_dependencies(self):
        """Test: Feature-Abhängigkeiten"""
        config = Config()
        
        # Features mit Abhängigkeiten registrieren
        config.register_feature(
            name="parent_feature",
            enabled=True,
            description="Parent Feature",
            category="test"
        )
        
        config.register_feature(
            name="child_feature",
            enabled=True,
            description="Child Feature",
            category="test",
            dependencies=["parent_feature"]
        )
        
        # Parent deaktivieren sollte Child deaktivieren
        config.update_feature_flag("parent_feature", False)
        assert not config.get_feature_flag("child_feature")

def run_tests():
    """Führt alle Tests aus"""
    pytest.main(["-v", "backend/tests/feature_tests/"])

if __name__ == "__main__":
    run_tests()
"""
        
        test_utils = """
from typing import List, Dict, Any
from backend.core.config import Config

def verify_feature_config(feature_name: str) -> Dict[str, Any]:
    """Überprüft die Feature-Konfiguration"""
    config = Config()
    
    if feature_name not in config.FEATURES:
        raise ValueError(f"Feature {feature_name} nicht gefunden")
        
    return {
        "name": feature_name,
        "enabled": config.get_feature_flag(feature_name),
        "description": config.get_feature_description(feature_name),
        "category": config.get_feature_category(feature_name),
        "dependencies": config.get_feature_dependencies(feature_name)
    }

def verify_feature_implementation(feature_name: str) -> Dict[str, bool]:
    """Überprüft die Feature-Implementierung"""
    config = Config()
    
    # Prüfe Komponenten
    has_api = False
    has_frontend = False
    has_tests = False
    
    try:
        # API-Endpunkt prüfen
        import importlib
        api_module = importlib.import_module(f"backend.api.{feature_name}")
        has_api = hasattr(api_module, "router")
    except ImportError:
        pass
        
    try:
        # Frontend-Komponente prüfen
        from pathlib import Path
        frontend_path = Path(f"frontend/src/components/{feature_name}")
        has_frontend = frontend_path.exists()
    except Exception:
        pass
        
    try:
        # Tests prüfen
        test_path = Path(f"backend/tests/feature_tests/test_{feature_name}.py")
        has_tests = test_path.exists()
    except Exception:
        pass
        
    return {
        "has_api": has_api,
        "has_frontend": has_frontend,
        "has_tests": has_tests,
        "is_complete": all([has_api, has_frontend, has_tests])
    }
"""

        # Speichere die Implementierungen
        with open("backend/tests/feature_tests/test_feature_management.py", "w") as f:
            f.write(test_runner)
            
        with open("backend/tests/feature_tests/test_utils.py", "w") as f:
            f.write(test_utils)
            
        # Erstelle Test-Runner-Skript
        runner_script = """
#!/usr/bin/env python
import pytest
import sys
from pathlib import Path

def main():
    """Führt Feature-Tests aus"""
    test_path = Path("backend/tests/feature_tests")
    sys.exit(pytest.main(["-v", str(test_path)]))

if __name__ == "__main__":
    main()
"""
        
        with open("scripts/run_feature_tests.py", "w") as f:
            f.write(runner_script)
        
        # Mache Skript ausführbar
        import os
        os.chmod("scripts/run_feature_tests.py", 0o755)
        
        return {
            "status": "success",
            "message": "Feature-Tests erfolgreich implementiert",
            "files_created": [
                "backend/tests/feature_tests/test_feature_management.py",
                "backend/tests/feature_tests/test_utils.py",
                "scripts/run_feature_tests.py"
            ]
        }
    
    def _implement_documentation(self) -> Dict[str, Any]:
        """Implementiert die Dokumentationsgenerierung"""
        
        doc_generator = """
from typing import Dict, List, Optional
import ast
from pathlib import Path
import json
import re
from jinja2 import Environment, FileSystemLoader
import markdown2
import networkx as nx
import matplotlib.pyplot as plt

class DocumentationGenerator:
    """Generator für Projektdokumentation"""
    
    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.modules: Dict[str, Dict] = {}
        self.classes: Dict[str, Dict] = {}
        self.functions: Dict[str, Dict] = {}
        self.dependencies: nx.DiGraph = nx.DiGraph()
        
    def analyze_project(self):
        """Analysiert das gesamte Projekt"""
        # Sammle Python-Dateien
        for file in self.root.rglob("*.py"):
            self._analyze_file(file)
            
    def _analyze_file(self, file: Path):
        """Analysiert eine Python-Datei"""
        with open(file, "r", encoding="utf-8") as f:
            try:
                tree = ast.parse(f.read())
            except:
                return
                
        module_name = self._get_module_name(file)
        
        # Sammle Modul-Info
        self.modules[module_name] = {
            "path": str(file),
            "classes": [],
            "functions": [],
            "docstring": ast.get_docstring(tree) or ""
        }
        
        # Analysiere Knoten
        for node in ast.walk(tree):
            # Klassen
            if isinstance(node, ast.ClassDef):
                class_info = self._analyze_class(node)
                self.classes[f"{module_name}.{node.name}"] = class_info
                self.modules[module_name]["classes"].append(node.name)
                
            # Funktionen
            elif isinstance(node, ast.FunctionDef):
                func_info = self._analyze_function(node)
                self.functions[f"{module_name}.{node.name}"] = func_info
                self.modules[module_name]["functions"].append(node.name)
                
            # Imports
            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                self._analyze_import(module_name, node)
                
    def _analyze_class(self, node: ast.ClassDef) -> Dict:
        """Analysiert eine Klasse"""
        methods = []
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                methods.append(self._analyze_function(item))
                
        return {
            "name": node.name,
            "docstring": ast.get_docstring(node) or "",
            "methods": methods,
            "bases": [base.id for base in node.bases if isinstance(base, ast.Name)]
        }
        
    def _analyze_function(self, node: ast.FunctionDef) -> Dict:
        """Analysiert eine Funktion"""
        return {
            "name": node.name,
            "docstring": ast.get_docstring(node) or "",
            "args": self._get_function_args(node),
            "returns": self._get_return_annotation(node)
        }
        
    def _analyze_import(self, module_name: str, node: ast.AST):
        """Analysiert einen Import"""
        if isinstance(node, ast.Import):
            for name in node.names:
                self.dependencies.add_edge(module_name, name.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                self.dependencies.add_edge(module_name, node.module.split(".")[0])
                
    def _get_module_name(self, file: Path) -> str:
        """Ermittelt den Modulnamen"""
        rel_path = file.relative_to(self.root)
        parts = list(rel_path.parts)
        parts[-1] = parts[-1][:-3]  # Entferne .py
        return ".".join(parts)
        
    def _get_function_args(self, node: ast.FunctionDef) -> List[Dict]:
        """Analysiert Funktionsargumente"""
        args = []
        
        for arg in node.args.args:
            annotation = ""
            if arg.annotation:
                if isinstance(arg.annotation, ast.Name):
                    annotation = arg.annotation.id
                elif isinstance(arg.annotation, ast.Constant):
                    annotation = arg.annotation.value
                    
            args.append({
                "name": arg.arg,
                "type": annotation
            })
            
        return args
        
    def _get_return_annotation(self, node: ast.FunctionDef) -> str:
        """Holt Return-Type-Annotation"""
        if node.returns:
            if isinstance(node.returns, ast.Name):
                return node.returns.id
            elif isinstance(node.returns, ast.Constant):
                return node.returns.value
        return ""
        
    def generate_documentation(self, output_dir: str):
        """Generiert die Dokumentation"""
        output = Path(output_dir)
        output.mkdir(parents=True, exist_ok=True)
        
        # Lade Templates
        env = Environment(
            loader=FileSystemLoader(self.root / "docs" / "templates")
        )
        
        # Erstelle Basis-Templates
        self._create_templates()
        
        # Generiere Modul-Dokumentation
        for module_name, info in self.modules.items():
            template = env.get_template("module.md.j2")
            content = template.render(
                module_name=module_name,
                info=info,
                classes={
                    name: self.classes[f"{module_name}.{name}"]
                    for name in info["classes"]
                },
                functions={
                    name: self.functions[f"{module_name}.{name}"]
                    for name in info["functions"]
                }
            )
            
            # Speichere als Markdown
            module_file = output / f"{module_name}.md"
            module_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(module_file, "w") as f:
                f.write(content)
                
        # Generiere Abhängigkeitsgraph
        self._generate_dependency_graph(output / "dependencies.png")
        
        # Generiere Index
        self._generate_index(output)
        
    def _create_templates(self):
        """Erstellt Dokumentations-Templates"""
        templates_dir = self.root / "docs" / "templates"
        templates_dir.mkdir(parents=True, exist_ok=True)
        
        # Module Template
        module_template = """
# {{ module_name }}

{{ info.docstring }}

## Klassen

{% for name, cls in classes.items() %}
### {{ name }}

{{ cls.docstring }}

{% if cls.bases %}
Erbt von: {{ cls.bases|join(', ') }}
{% endif %}

#### Methoden

{% for method in cls.methods %}
##### {{ method.name }}

{{ method.docstring }}

{% if method.args %}
Argumente:
{% for arg in method.args %}
- {{ arg.name }}{% if arg.type %}: {{ arg.type }}{% endif %}
{% endfor %}
{% endif %}

{% if method.returns %}
Returns: {{ method.returns }}
{% endif %}

{% endfor %}
{% endfor %}

## Funktionen

{% for name, func in functions.items() %}
### {{ name }}

{{ func.docstring }}

{% if func.args %}
Argumente:
{% for arg in func.args %}
- {{ arg.name }}{% if arg.type %}: {{ arg.type }}{% endif %}
{% endfor %}
{% endif %}

{% if func.returns %}
Returns: {{ func.returns }}
{% endif %}

{% endfor %}
"""
        
        with open(templates_dir / "module.md.j2", "w") as f:
            f.write(module_template)
            
    def _generate_dependency_graph(self, output_file: str):
        """Generiert Abhängigkeitsgraph"""
        plt.figure(figsize=(12, 8))
        
        pos = nx.spring_layout(self.dependencies)
        nx.draw(
            self.dependencies,
            pos,
            with_labels=True,
            node_color='lightblue',
            node_size=2000,
            font_size=8,
            font_weight='bold',
            arrows=True,
            edge_color='gray'
        )
        
        plt.savefig(output_file)
        plt.close()
        
    def _generate_index(self, output_dir: Path):
        """Generiert Index-Seite"""
        index_content = """
# Projektdokumentation

## Module

{% for module_name, info in modules.items() %}
### [{{ module_name }}]({{ module_name }}.md)

{{ info.docstring }}

{% endfor %}

## Abhängigkeiten

![Abhängigkeitsgraph](dependencies.png)
"""
        
        env = Environment(loader=FileSystemLoader(self.root / "docs" / "templates"))
        template = env.from_string(index_content)
        
        content = template.render(modules=self.modules)
        
        with open(output_dir / "index.md", "w") as f:
            f.write(content)
"""

        example_usage = """
from pathlib import Path
from .documentation_generator import DocumentationGenerator

def main():
    # Projektroot
    root = Path(__file__).parent.parent
    
    # Erstelle Generator
    generator = DocumentationGenerator(str(root))
    
    # Analysiere Projekt
    generator.analyze_project()
    
    # Generiere Dokumentation
    generator.generate_documentation("docs/api")

if __name__ == "__main__":
    main()
"""

        # Speichere Dokumentationsgenerator
        os.makedirs("tools/documentation", exist_ok=True)
        
        with open("tools/documentation/generator.py", "w") as f:
            f.write(doc_generator)
            
        with open("tools/documentation/example.py", "w") as f:
            f.write(example_usage)
            
        return {
            "status": "success",
            "message": "Dokumentationsgenerierung erfolgreich implementiert",
            "files_created": [
                "tools/documentation/generator.py",
                "tools/documentation/example.py"
            ]
        }
    
    def _implement_feature_metrics(self) -> Dict[str, Any]:
        """Implementiert die Feature-Metriken"""
        
        metrics_code = """
from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path
from prometheus_client import Counter, Gauge, Histogram

class FeatureMetrics:
    """Sammelt Metriken für Features"""
    
    def __init__(self):
        # Prometheus Metriken
        self.feature_usage = Counter(
            'feature_usage_total',
            'Feature usage count',
            ['feature_name', 'version']
        )
        
        self.feature_errors = Counter(
            'feature_errors_total',
            'Feature error count',
            ['feature_name', 'error_type']
        )
        
        self.feature_duration = Histogram(
            'feature_duration_seconds',
            'Feature execution duration',
            ['feature_name']
        )
        
        self.feature_status = Gauge(
            'feature_status',
            'Feature status (1=active, 0=inactive)',
            ['feature_name']
        )
        
        # Interne Speicherung
        self.metrics: Dict[str, Dict] = {}
        self.history: List[Dict] = []
        
    def track_usage(self, feature_name: str, version: str = "1.0"):
        """Trackt Feature-Nutzung"""
        self.feature_usage.labels(
            feature_name=feature_name,
            version=version
        ).inc()
        
        if feature_name not in self.metrics:
            self.metrics[feature_name] = {
                "usage_count": 0,
                "error_count": 0,
                "avg_duration": 0.0,
                "last_used": None
            }
            
        self.metrics[feature_name]["usage_count"] += 1
        self.metrics[feature_name]["last_used"] = datetime.now()
        
    def track_error(self, feature_name: str, error_type: str):
        """Trackt Feature-Fehler"""
        self.feature_errors.labels(
            feature_name=feature_name,
            error_type=error_type
        ).inc()
        
        if feature_name in self.metrics:
            self.metrics[feature_name]["error_count"] += 1
            
    def track_duration(self, feature_name: str, duration: float):
        """Trackt Feature-Ausführungszeit"""
        self.feature_duration.labels(
            feature_name=feature_name
        ).observe(duration)
        
        if feature_name in self.metrics:
            current_avg = self.metrics[feature_name]["avg_duration"]
            count = self.metrics[feature_name]["usage_count"]
            
            # Berechne neuen Durchschnitt
            new_avg = (current_avg * (count - 1) + duration) / count
            self.metrics[feature_name]["avg_duration"] = new_avg
            
    def set_status(self, feature_name: str, active: bool):
        """Setzt Feature-Status"""
        self.feature_status.labels(
            feature_name=feature_name
        ).set(1 if active else 0)
        
    def get_metrics(self, feature_name: str) -> Optional[Dict]:
        """Holt Metriken für ein Feature"""
        return self.metrics.get(feature_name)
        
    def get_all_metrics(self) -> Dict[str, Dict]:
        """Holt alle Feature-Metriken"""
        return self.metrics
        
    def save_snapshot(self, file_path: str):
        """Speichert einen Snapshot der Metriken"""
        snapshot = {
            "timestamp": datetime.now().isoformat(),
            "metrics": self.metrics
        }
        
        self.history.append(snapshot)
        
        # Speichere als JSON
        with open(file_path, "w") as f:
            json.dump(
                {
                    "history": self.history,
                    "current": self.metrics
                },
                f,
                indent=2
            )
            
    def load_snapshot(self, file_path: str):
        """Lädt einen Metrik-Snapshot"""
        if Path(file_path).exists():
            with open(file_path, "r") as f:
                data = json.load(f)
                self.history = data["history"]
                self.metrics = data["current"]
"""

        example_metrics = """
from datetime import datetime
from .feature_metrics import FeatureMetrics

# Erstelle Metrics-Instanz
metrics = FeatureMetrics()

def track_feature_usage(func):
    """Decorator für Feature-Tracking"""
    def wrapper(*args, **kwargs):
        feature_name = func.__name__
        start_time = datetime.now()
        
        try:
            result = func(*args, **kwargs)
            duration = (datetime.now() - start_time).total_seconds()
            
            # Tracke Nutzung und Dauer
            metrics.track_usage(feature_name)
            metrics.track_duration(feature_name, duration)
            
            return result
            
        except Exception as e:
            # Tracke Fehler
            metrics.track_error(feature_name, type(e).__name__)
            raise
            
    return wrapper

# Beispiel-Verwendung
@track_feature_usage
def process_order(order_id: str):
    # ... Feature-Logik ...
    pass

# Feature-Status setzen
metrics.set_status("process_order", True)

# Metriken speichern
metrics.save_snapshot("feature_metrics.json")
"""

        # Speichere Feature-Metriken
        os.makedirs("backend/monitoring/features", exist_ok=True)
        
        with open("backend/monitoring/features/metrics.py", "w") as f:
            f.write(metrics_code)
            
        with open("backend/monitoring/features/example.py", "w") as f:
            f.write(example_metrics)
            
        return {
            "status": "success",
            "message": "Feature-Metriken erfolgreich implementiert",
            "files_created": [
                "backend/monitoring/features/metrics.py",
                "backend/monitoring/features/example.py"
            ]
        }
    
    def _implement_service_layer(self) -> Dict[str, Any]:
        """Implementiert die Service-Layer"""
        
        base_service = """
from typing import Any, Dict, List, Optional, TypeVar, Generic
from pydantic import BaseModel
from backend.core.db import Database
from backend.core.cache import Cache
from backend.core.config import Config

T = TypeVar('T', bound=BaseModel)

class BaseService(Generic[T]):
    """Basis-Service für die Business-Logic"""
    
    def __init__(self):
        self.db = Database()
        self.cache = Cache()
        self.config = Config()
        
    async def get(self, id: str) -> Optional[T]:
        """Holt eine Entität nach ID"""
        # Prüfe Cache
        cached = await self.cache.get(f"{self.model.__name__}:{id}")
        if cached:
            return self.model.parse_raw(cached)
            
        # Hole aus DB
        result = await self.db.find_one(
            self.collection,
            {"_id": id}
        )
        
        if result:
            # Cache aktualisieren
            entity = self.model.parse_obj(result)
            await self.cache.set(
                f"{self.model.__name__}:{id}",
                entity.json()
            )
            return entity
            
        return None
        
    async def list(self, filter: Dict[str, Any] = None) -> List[T]:
        """Listet Entitäten auf"""
        results = await self.db.find(
            self.collection,
            filter or {}
        )
        return [self.model.parse_obj(r) for r in results]
        
    async def create(self, entity: T) -> T:
        """Erstellt eine neue Entität"""
        result = await self.db.insert_one(
            self.collection,
            entity.dict()
        )
        entity.id = str(result.inserted_id)
        
        # Cache aktualisieren
        await self.cache.set(
            f"{self.model.__name__}:{entity.id}",
            entity.json()
        )
        
        return entity
        
    async def update(self, id: str, entity: T) -> Optional[T]:
        """Aktualisiert eine Entität"""
        result = await self.db.update_one(
            self.collection,
            {"_id": id},
            {"$set": entity.dict()}
        )
        
        if result.modified_count:
            # Cache aktualisieren
            await self.cache.delete(f"{self.model.__name__}:{id}")
            return await self.get(id)
            
        return None
        
    async def delete(self, id: str) -> bool:
        """Löscht eine Entität"""
        result = await self.db.delete_one(
            self.collection,
            {"_id": id}
        )
        
        if result.deleted_count:
            # Cache löschen
            await self.cache.delete(f"{self.model.__name__}:{id}")
            return True
            
        return False
"""

        example_service = """
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from .base_service import BaseService

class Customer(BaseModel):
    """Beispiel-Entität: Kunde"""
    id: Optional[str]
    name: str
    email: str
    created_at: datetime = datetime.now()
    
class CustomerService(BaseService[Customer]):
    """Beispiel-Service für Kunden"""
    
    model = Customer
    collection = "customers"
    
    async def find_by_email(self, email: str) -> Optional[Customer]:
        """Findet einen Kunden per E-Mail"""
        result = await self.db.find_one(
            self.collection,
            {"email": email}
        )
        return Customer.parse_obj(result) if result else None
        
    async def list_active(self) -> List[Customer]:
        """Listet aktive Kunden auf"""
        return await self.list({"active": True})
"""

        # Speichere Service-Layer
        os.makedirs("backend/services", exist_ok=True)
        
        with open("backend/services/base_service.py", "w") as f:
            f.write(base_service)
            
        with open("backend/services/customer_service.py", "w") as f:
            f.write(example_service)
            
        service_result = {
            "status": "success",
            "message": "Service-Layer erfolgreich implementiert",
            "files_created": [
                "backend/services/base_service.py",
                "backend/services/customer_service.py"
            ]
        }

        # API-Versionierung implementieren
        versioning_code = """
from typing import Dict, Any, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from pydantic import BaseModel

class VersionManager:
    """Manager für API-Versionierung"""
    
    def __init__(self):
        self.versions: Dict[str, APIRouter] = {}
        self.deprecated: Dict[str, str] = {}
        self.latest_version = "1.0"
        
    def register_version(self, version: str, router: APIRouter):
        """Registriert eine API-Version"""
        self.versions[version] = router
        
        # Aktualisiere latest_version wenn nötig
        if self._compare_versions(version, self.latest_version) > 0:
            self.latest_version = version
            
    def deprecate_version(self, version: str, message: str):
        """Markiert eine Version als deprecated"""
        if version not in self.versions:
            raise ValueError(f"Version {version} nicht gefunden")
            
        self.deprecated[version] = message
        
    def get_router(self, version: Optional[str] = None) -> APIRouter:
        """Holt Router für eine Version"""
        version = version or self.latest_version
        
        if version not in self.versions:
            raise HTTPException(
                status_code=404,
                detail=f"Version {version} nicht gefunden"
            )
            
        return self.versions[version]
        
    def _compare_versions(self, v1: str, v2: str) -> int:
        """Vergleicht zwei Versionsnummern"""
        v1_parts = [int(x) for x in v1.split(".")]
        v2_parts = [int(x) for x in v2.split(".")]
        
        for i in range(max(len(v1_parts), len(v2_parts))):
            v1_part = v1_parts[i] if i < len(v1_parts) else 0
            v2_part = v2_parts[i] if i < len(v2_parts) else 0
            
            if v1_part > v2_part:
                return 1
            elif v1_part < v2_part:
                return -1
                
        return 0

class VersionedAPI:
    """Wrapper für versionierte API-Endpunkte"""
    
    def __init__(self, app: FastAPI):
        self.app = app
        self.version_manager = VersionManager()
        
    def version(self, version: str):
        """Decorator für versionierte Endpunkte"""
        def decorator(router: APIRouter):
            self.version_manager.register_version(version, router)
            
            # Registriere Router unter /api/v{version}
            self.app.include_router(
                router,
                prefix=f"/api/v{version}"
            )
            
            return router
        return decorator
        
    def latest(self):
        """Decorator für die neueste Version"""
        def decorator(router: APIRouter):
            # Registriere unter /api/latest
            self.app.include_router(
                router,
                prefix="/api/latest"
            )
            return router
        return decorator
        
    def deprecate(self, version: str, message: str):
        """Markiert eine Version als deprecated"""
        self.version_manager.deprecate_version(version, message)
"""

        example_versioned_api = """
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel

# V1 API
router_v1 = APIRouter()

class CustomerV1(BaseModel):
    name: str
    email: str

@router_v1.get("/customers", response_model=List[CustomerV1])
async def list_customers_v1():
    """V1: Liste alle Kunden"""
    return [
        {"name": "Test", "email": "test@example.com"}
    ]

# V2 API mit mehr Feldern
router_v2 = APIRouter()

class CustomerV2(BaseModel):
    name: str
    email: str
    phone: str
    address: str

@router_v2.get("/customers", response_model=List[CustomerV2])
async def list_customers_v2():
    """V2: Liste alle Kunden mit erweiterten Infos"""
    return [
        {
            "name": "Test",
            "email": "test@example.com",
            "phone": "+49123456789",
            "address": "Teststraße 1"
        }
    ]

# Registriere Versionen
from .versioning import VersionedAPI
from .main import app

api = VersionedAPI(app)

@api.version("1.0")
class V1:
    router = router_v1

@api.version("2.0")
class V2:
    router = router_v2

# Markiere V1 als deprecated
api.deprecate(
    "1.0",
    "Diese Version wird mit V3.0 entfernt. Bitte auf V2.0 upgraden."
)
"""

        # Speichere API-Versionierung
        os.makedirs("backend/core/versioning", exist_ok=True)
        os.makedirs("backend/api/v1", exist_ok=True)
        os.makedirs("backend/api/v2", exist_ok=True)
        
        with open("backend/core/versioning.py", "w") as f:
            f.write(versioning_code)
            
        with open("backend/api/example_versioned.py", "w") as f:
            f.write(example_versioned_api)
            
        versioning_result = {
            "status": "success",
            "message": "API-Versionierung erfolgreich implementiert",
            "files_created": [
                "backend/core/versioning.py",
                "backend/api/example_versioned.py"
            ]
        }
        
        return {
            "status": "success",
            "message": "Service-Layer und API-Versionierung implementiert",
            "results": [service_result, versioning_result]
        }
    
    def _implement_api_versioning(self) -> Dict[str, Any]:
        """Implementiert API-Versionierung"""
        # Implementation hier
        pass
    
    def _implement_api_docs(self) -> Dict[str, Any]:
        """Implementiert API-Dokumentation"""
        # Implementation hier
        pass
    
    def _implement_refactoring(self) -> Dict[str, Any]:
        """Implementiert Modul-Refactoring"""
        # Implementation hier
        pass
    
    def _implement_dependency_resolver(self) -> Dict[str, Any]:
        """Implementiert Dependency-Resolver"""
        # Implementation hier
        pass
    
    def _implement_coupling_analyzer(self) -> Dict[str, Any]:
        """Implementiert Coupling-Analyzer"""
        # Implementation hier
        pass
    
    def _implement_di_framework(self) -> Dict[str, Any]:
        """Implementiert das DI-Framework"""
        
        di_framework = """
from typing import Any, Dict, Type, TypeVar, get_type_hints
from inspect import Parameter, signature
from functools import wraps

T = TypeVar('T')

class Container:
    """DI-Container für Dependency Injection"""
    
    def __init__(self):
        self._services: Dict[Type, Any] = {}
        self._factories: Dict[Type, Any] = {}
        
    def register(self, interface: Type[T], implementation: Type[T]):
        """Registriert eine Implementierung für ein Interface"""
        self._services[interface] = implementation
        
    def register_instance(self, interface: Type[T], instance: T):
        """Registriert eine existierende Instanz"""
        self._services[interface] = instance
        
    def register_factory(self, interface: Type[T], factory: callable):
        """Registriert eine Factory-Funktion"""
        self._factories[interface] = factory
        
    def resolve(self, interface: Type[T]) -> T:
        """Löst eine Dependency auf"""
        # Prüfe auf Factory
        if interface in self._factories:
            return self._factories[interface]()
            
        # Prüfe auf registrierte Instanz
        if interface in self._services:
            service = self._services[interface]
            if not isinstance(service, type):
                return service
                
            # Erstelle neue Instanz mit Dependencies
            return self._create_instance(service)
            
        raise ValueError(f"Keine Implementierung für {interface} gefunden")
        
    def _create_instance(self, cls: Type[T]) -> T:
        """Erstellt eine Instanz mit aufgelösten Dependencies"""
        if not hasattr(cls, '__init__'):
            return cls()
            
        # Hole Constructor-Parameter
        sig = signature(cls.__init__)
        params = {}
        
        for name, param in sig.parameters.items():
            if name == 'self':
                continue
                
            # Hole Typ-Annotation
            annotation = param.annotation
            if annotation == Parameter.empty:
                raise ValueError(f"Parameter {name} hat keine Typ-Annotation")
                
            # Löse Dependency auf
            params[name] = self.resolve(annotation)
            
        return cls(**params)

def inject(container: Container):
    """Decorator für Dependency Injection"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Hole Typ-Annotationen
            hints = get_type_hints(func)
            
            # Löse Dependencies auf
            for name, type_hint in hints.items():
                if name not in kwargs:
                    kwargs[name] = container.resolve(type_hint)
                    
            return func(*args, **kwargs)
        return wrapper
    return decorator
"""

        example_di = """
from typing import Protocol
from .di_framework import Container, inject

# Interfaces
class Logger(Protocol):
    def log(self, message: str): ...

class Database(Protocol):
    def query(self, sql: str): ...

# Implementierungen
class ConsoleLogger:
    def log(self, message: str):
        print(f"[LOG] {message}")

class SQLiteDatabase:
    def query(self, sql: str):
        print(f"[DB] Executing: {sql}")

# Service mit Dependencies
class UserService:
    def __init__(self, logger: Logger, db: Database):
        self.logger = logger
        self.db = db
        
    def create_user(self, username: str):
        self.logger.log(f"Creating user: {username}")
        self.db.query(f"INSERT INTO users (name) VALUES ('{username}')")

# Container konfigurieren
container = Container()
container.register(Logger, ConsoleLogger)
container.register(Database, SQLiteDatabase)

# Verwendung mit Decorator
@inject(container)
def process_user(username: str, logger: Logger):
    logger.log(f"Processing user: {username}")

# Verwendung mit direkter Auflösung
user_service = container.resolve(UserService)
user_service.create_user("test")
"""

        # Speichere DI-Framework
        os.makedirs("backend/core/di", exist_ok=True)
        
        with open("backend/core/di/framework.py", "w") as f:
            f.write(di_framework)
            
        with open("backend/core/di/example.py", "w") as f:
            f.write(example_di)
            
        di_result = {
            "status": "success",
            "message": "DI-Framework erfolgreich implementiert",
            "files_created": [
                "backend/core/di/framework.py",
                "backend/core/di/example.py"
            ]
        }

        # Implementiere Dependency-Resolver
        resolver_code = """
from typing import Dict, List, Set, Tuple
import networkx as nx
from pathlib import Path
import ast
import importlib
import sys

class DependencyResolver:
    """Resolver für Modul-Abhängigkeiten"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.modules: Dict[str, Set[str]] = {}
        
    def analyze_project(self, root_dir: str):
        """Analysiert ein Projekt auf Abhängigkeiten"""
        root = Path(root_dir)
        
        # Sammle Python-Dateien
        for file in root.rglob("*.py"):
            module_name = self._get_module_name(file, root)
            imports = self._analyze_imports(file)
            
            self.modules[module_name] = imports
            
            # Füge Knoten und Kanten hinzu
            self.graph.add_node(module_name)
            for imp in imports:
                self.graph.add_edge(module_name, imp)
                
    def find_cycles(self) -> List[List[str]]:
        """Findet zirkuläre Abhängigkeiten"""
        return list(nx.simple_cycles(self.graph))
        
    def get_dependencies(self, module: str) -> Set[str]:
        """Holt alle Abhängigkeiten eines Moduls"""
        if module not in self.modules:
            return set()
            
        return self.modules[module]
        
    def get_dependents(self, module: str) -> Set[str]:
        """Holt alle Module, die von diesem abhängen"""
        dependents = set()
        
        for m, deps in self.modules.items():
            if module in deps:
                dependents.add(m)
                
        return dependents
        
    def resolve_order(self) -> List[str]:
        """Bestimmt die optimale Ladereihenfolge"""
        try:
            return list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            raise ValueError("Zirkuläre Abhängigkeiten gefunden")
            
    def _get_module_name(self, file: Path, root: Path) -> str:
        """Ermittelt den Modulnamen einer Datei"""
        rel_path = file.relative_to(root)
        parts = list(rel_path.parts)
        
        # Entferne .py Endung
        parts[-1] = parts[-1][:-3]
        
        return ".".join(parts)
        
    def _analyze_imports(self, file: Path) -> Set[str]:
        """Analysiert Imports in einer Datei"""
        imports = set()
        
        with open(file, "r", encoding="utf-8") as f:
            try:
                tree = ast.parse(f.read())
            except:
                return imports
                
        for node in ast.walk(tree):
            # Import-Statement
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.add(name.name.split(".")[0])
                    
            # From-Import-Statement
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.add(node.module.split(".")[0])
                    
        return imports

def resolve_project_dependencies(root_dir: str) -> Dict[str, Any]:
    """Analysiert und löst Projektabhängigkeiten auf"""
    resolver = DependencyResolver()
    resolver.analyze_project(root_dir)
    
    # Finde Zyklen
    cycles = resolver.find_cycles()
    
    # Bestimme Ladereihenfolge
    try:
        load_order = resolver.resolve_order()
    except ValueError:
        load_order = []
    
    return {
        "cycles": cycles,
        "load_order": load_order,
        "modules": {
            module: {
                "dependencies": list(resolver.get_dependencies(module)),
                "dependents": list(resolver.get_dependents(module))
            }
            for module in resolver.modules
        }
    }
"""

        example_resolver = """
from pathlib import Path
from .dependency_resolver import resolve_project_dependencies

def main():
    # Analysiere Projekt
    root_dir = Path(__file__).parent.parent
    results = resolve_project_dependencies(str(root_dir))
    
    # Zeige Ergebnisse
    print("=== Abhängigkeitsanalyse ===\\n")
    
    if results["cycles"]:
        print("Zirkuläre Abhängigkeiten gefunden:")
        for cycle in results["cycles"]:
            print(f"  {' -> '.join(cycle)} -> {cycle[0]}")
    else:
        print("Keine zirkulären Abhängigkeiten gefunden.")
        
    print("\\nLadereihenfolge:")
    for module in results["load_order"]:
        print(f"  {module}")
        
    print("\\nModulübersicht:")
    for module, info in results["modules"].items():
        print(f"\\n{module}")
        print("  Abhängigkeiten:")
        for dep in info["dependencies"]:
            print(f"    - {dep}")
        print("  Wird verwendet von:")
        for dep in info["dependents"]:
            print(f"    - {dep}")

if __name__ == "__main__":
    main()
"""

        # Speichere Dependency-Resolver
        os.makedirs("tools", exist_ok=True)
        
        with open("tools/dependency_resolver.py", "w") as f:
            f.write(resolver_code)
            
        with open("tools/example_resolver.py", "w") as f:
            f.write(example_resolver)
            
        resolver_result = {
            "status": "success",
            "message": "Dependency-Resolver erfolgreich implementiert",
            "files_created": [
                "tools/dependency_resolver.py",
                "tools/example_resolver.py"
            ]
        }
        
        return {
            "status": "success",
            "message": "DI-Framework und Dependency-Resolver implementiert",
            "results": [di_result, resolver_result]
        }
    
    def _implement_import_handler(self) -> Dict[str, Any]:
        """Implementiert Import-Handler-Integration"""
        # Implementation hier
        pass
    
    def _implement_import_optimization(self) -> Dict[str, Any]:
        """Implementiert die Import-Optimierung"""
        
        optimizer_code = """
import ast
from typing import Dict, List, Set, Tuple
from pathlib import Path
import importlib
import sys

class ImportOptimizer:
    """Optimierer für Python-Imports"""
    
    def __init__(self):
        self.used_names: Set[str] = set()
        self.imports: Dict[str, Set[str]] = {}
        self.from_imports: Dict[str, Dict[str, Set[str]]] = {}
        
    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Analysiert und optimiert Imports in einer Datei"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        tree = ast.parse(content)
        
        # Reset für neue Analyse
        self.used_names.clear()
        self.imports.clear()
        self.from_imports.clear()
        
        # Analysiere Imports
        self._collect_imports(tree)
        
        # Sammle verwendete Namen
        self._collect_used_names(tree)
        
        # Optimiere Imports
        unused_imports = self._find_unused_imports()
        import_order = self._optimize_import_order()
        
        return {
            "unused_imports": unused_imports,
            "optimized_order": import_order,
            "import_stats": {
                "total_imports": len(self.imports) + sum(len(names) for names in self.from_imports.values()),
                "unused_count": len(unused_imports),
                "import_groups": len(import_order)
            }
        }
        
    def optimize_project(self, root_dir: str) -> Dict[str, Any]:
        """Optimiert Imports in einem ganzen Projekt"""
        results = {}
        root = Path(root_dir)
        
        for file in root.rglob("*.py"):
            try:
                results[str(file)] = self.analyze_file(str(file))
            except Exception as e:
                results[str(file)] = {"error": str(e)}
                
        return results
        
    def _collect_imports(self, tree: ast.AST):
        """Sammelt alle Imports"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    asname = name.asname or name.name
                    if name.name not in self.imports:
                        self.imports[name.name] = set()
                    self.imports[name.name].add(asname)
                    
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                if module not in self.from_imports:
                    self.from_imports[module] = {}
                    
                for name in node.names:
                    asname = name.asname or name.name
                    if name.name not in self.from_imports[module]:
                        self.from_imports[module][name.name] = set()
                    self.from_imports[module][name.name].add(asname)
                    
    def _collect_used_names(self, tree: ast.AST):
        """Sammelt verwendete Namen"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                self.used_names.add(node.id)
                
    def _find_unused_imports(self) -> List[Tuple[str, str]]:
        """Findet ungenutzte Imports"""
        unused = []
        
        # Prüfe direkte Imports
        for module, aliases in self.imports.items():
            for alias in aliases:
                if alias not in self.used_names:
                    unused.append((module, alias))
                    
        # Prüfe From-Imports
        for module, names in self.from_imports.items():
            for name, aliases in names.items():
                for alias in aliases:
                    if alias not in self.used_names:
                        unused.append((f"{module}.{name}", alias))
                        
        return unused
        
    def _optimize_import_order(self) -> List[List[str]]:
        """Optimiert die Import-Reihenfolge"""
        # Gruppiere Imports
        stdlib = []
        third_party = []
        local = []
        
        # Sortiere direkte Imports
        for module in sorted(self.imports):
            if self._is_stdlib_module(module):
                stdlib.append(f"import {module}")
            elif self._is_local_module(module):
                local.append(f"import {module}")
            else:
                third_party.append(f"import {module}")
                
        # Sortiere From-Imports
        for module in sorted(self.from_imports):
            names = sorted(self.from_imports[module].keys())
            import_str = f"from {module} import {', '.join(names)}"
            
            if self._is_stdlib_module(module):
                stdlib.append(import_str)
            elif self._is_local_module(module):
                local.append(import_str)
            else:
                third_party.append(import_str)
                
        return [stdlib, third_party, local]
        
    def _is_stdlib_module(self, module: str) -> bool:
        """Prüft ob ein Modul zur Standardbibliothek gehört"""
        try:
            spec = importlib.util.find_spec(module.split(".")[0])
            return spec is not None and spec.origin is not None and "site-packages" not in spec.origin
        except:
            return False
            
    def _is_local_module(self, module: str) -> bool:
        """Prüft ob ein Modul lokal ist"""
        return module.startswith((".", "backend", "frontend", "tools"))
"""

        example_optimizer = """
from pathlib import Path
from .import_optimizer import ImportOptimizer

def main():
    # Optimiere Projekt
    optimizer = ImportOptimizer()
    root_dir = Path(__file__).parent.parent
    results = optimizer.optimize_project(str(root_dir))
    
    # Zeige Ergebnisse
    print("=== Import-Optimierung ===\\n")
    
    total_unused = 0
    total_imports = 0
    
    for file, result in results.items():
        if "error" in result:
            print(f"{file}: FEHLER - {result['error']}")
            continue
            
        stats = result["import_stats"]
        unused = len(result["unused_imports"])
        total_unused += unused
        total_imports += stats["total_imports"]
        
        if unused > 0:
            print(f"\\n{file}")
            print(f"  Ungenutzte Imports: {unused}")
            for imp, alias in result["unused_imports"]:
                print(f"    - {imp} as {alias}")
                
    print(f"\\nZusammenfassung:")
    print(f"  Analysierte Dateien: {len(results)}")
    print(f"  Gesamte Imports: {total_imports}")
    print(f"  Ungenutzte Imports: {total_unused}")
    print(f"  Optimierungspotential: {total_unused/total_imports*100:.1f}%")

if __name__ == "__main__":
    main()
"""

        # Speichere Import-Optimierung
        os.makedirs("tools", exist_ok=True)
        
        with open("tools/import_optimizer.py", "w") as f:
            f.write(optimizer_code)
            
        with open("tools/example_optimizer.py", "w") as f:
            f.write(example_optimizer)
            
        optimizer_result = {
            "status": "success",
            "message": "Import-Optimierung erfolgreich implementiert",
            "files_created": [
                "tools/import_optimizer.py",
                "tools/example_optimizer.py"
            ]
        }

        # Implementiere Zyklus-Detektion
        cycle_detector_code = """
import ast
from typing import Dict, List, Set, Tuple
from pathlib import Path
import networkx as nx
import matplotlib.pyplot as plt

class ImportCycleDetector:
    """Detektor für Import-Zyklen"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.modules: Dict[str, Set[str]] = {}
        
    def analyze_file(self, file_path: str):
        """Analysiert Import-Abhängigkeiten einer Datei"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        tree = ast.parse(content)
        
        # Hole Modulnamen
        module_name = self._get_module_name(file_path)
        self.modules[module_name] = set()
        
        # Analysiere Imports
        self._analyze_imports(tree, module_name)
        
    def analyze_project(self, root_dir: str):
        """Analysiert ein ganzes Projekt"""
        root = Path(root_dir)
        
        for file in root.rglob("*.py"):
            try:
                self.analyze_file(str(file))
            except Exception as e:
                print(f"Fehler bei {file}: {e}")
                
    def find_cycles(self) -> List[List[str]]:
        """Findet Import-Zyklen"""
        return list(nx.simple_cycles(self.graph))
        
    def visualize(self, output_file: str):
        """Visualisiert den Import-Graphen"""
        plt.figure(figsize=(12, 8))
        
        # Zeichne Graphen
        pos = nx.spring_layout(self.graph)
        nx.draw(
            self.graph,
            pos,
            with_labels=True,
            node_color='lightblue',
            node_size=2000,
            font_size=8,
            font_weight='bold',
            arrows=True,
            edge_color='gray'
        )
        
        # Speichere Graph
        plt.savefig(output_file)
        plt.close()
        
    def _get_module_name(self, file_path: str) -> str:
        """Ermittelt den Modulnamen einer Datei"""
        path = Path(file_path)
        parts = list(path.parts)
        
        # Finde Projektroot
        try:
            root_idx = parts.index("backend")
        except ValueError:
            try:
                root_idx = parts.index("frontend")
            except ValueError:
                root_idx = len(parts) - 2
                
        # Baue Modulnamen
        module_parts = parts[root_idx:-1]
        module_name = ".".join(module_parts)
        
        if not module_name:
            module_name = path.stem
            
        return module_name
        
    def _analyze_imports(self, tree: ast.AST, module_name: str):
        """Analysiert Imports in einem AST"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imported = name.name.split(".")[0]
                    self._add_dependency(module_name, imported)
                    
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imported = node.module.split(".")[0]
                    self._add_dependency(module_name, imported)
                    
    def _add_dependency(self, from_module: str, to_module: str):
        """Fügt eine Abhängigkeit zum Graphen hinzu"""
        if from_module != to_module:
            self.modules[from_module].add(to_module)
            self.graph.add_edge(from_module, to_module)
"""

        example_detector = """
from pathlib import Path
from .import_cycle_detector import ImportCycleDetector

def main():
    # Analysiere Projekt
    detector = ImportCycleDetector()
    root_dir = Path(__file__).parent.parent
    detector.analyze_project(str(root_dir))
    
    # Finde Zyklen
    cycles = detector.find_cycles()
    
    print("=== Import-Zyklus-Analyse ===\\n")
    
    if cycles:
        print(f"Gefundene Zyklen: {len(cycles)}")
        for i, cycle in enumerate(cycles, 1):
            print(f"\\nZyklus {i}:")
            print(" -> ".join(cycle + [cycle[0]]))
    else:
        print("Keine Import-Zyklen gefunden!")
        
    # Visualisiere Abhängigkeiten
    output_file = "import_graph.png"
    detector.visualize(output_file)
    print(f"\\nAbhängigkeitsgraph gespeichert als: {output_file}")

if __name__ == "__main__":
    main()
"""

        # Speichere Zyklus-Detektion
        with open("tools/import_cycle_detector.py", "w") as f:
            f.write(cycle_detector_code)
            
        with open("tools/example_detector.py", "w") as f:
            f.write(example_detector)
            
        detector_result = {
            "status": "success",
            "message": "Import-Zyklus-Detektion erfolgreich implementiert",
            "files_created": [
                "tools/import_cycle_detector.py",
                "tools/example_detector.py"
            ]
        }
        
        return {
            "status": "success",
            "message": "Import-Optimierung und Zyklus-Detektion implementiert",
            "results": [optimizer_result, detector_result]
        }
    
    def _implement_import_monitoring(self) -> Dict[str, Any]:
        """Implementiert Import-Monitoring"""
        # Implementation hier
        pass
    
    def _implement_health_checks(self) -> Dict[str, Any]:
        """Implementiert Gesundheitschecks"""
        # Implementation hier
        pass
    
    def _implement_graph_visualizer(self) -> Dict[str, Any]:
        """Implementiert Graph-Visualisierung"""
        # Implementation hier
        pass
    
    def _implement_monitoring(self) -> Dict[str, Any]:
        """Implementiert das Monitoring-System"""
        
        monitoring_code = """
from typing import Any, Dict, List, Optional
from datetime import datetime
import time
import psutil
import logging
from prometheus_client import Counter, Gauge, Histogram, start_http_server
from functools import wraps

class Metrics:
    """Zentrale Metrik-Sammlung"""
    
    # Counter
    http_requests = Counter(
        'http_requests_total',
        'Total HTTP requests',
        ['method', 'endpoint', 'status']
    )
    
    db_operations = Counter(
        'db_operations_total',
        'Database operations',
        ['operation', 'table']
    )
    
    errors = Counter(
        'errors_total',
        'Total errors',
        ['type', 'location']
    )
    
    # Gauges
    active_users = Gauge(
        'active_users',
        'Number of active users'
    )
    
    cpu_usage = Gauge(
        'cpu_usage_percent',
        'CPU usage in percent'
    )
    
    memory_usage = Gauge(
        'memory_usage_bytes',
        'Memory usage in bytes'
    )
    
    # Histograms
    request_duration = Histogram(
        'request_duration_seconds',
        'Request duration in seconds',
        ['endpoint']
    )
    
    db_query_duration = Histogram(
        'db_query_duration_seconds',
        'Database query duration in seconds',
        ['query_type']
    )

class MonitoringSystem:
    """Monitoring-System für die Anwendung"""
    
    def __init__(self, app_name: str, metrics_port: int = 8000):
        self.app_name = app_name
        self.start_time = datetime.now()
        
        # Starte Prometheus Metrics Server
        start_http_server(metrics_port)
        
        # Konfiguriere Logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s'
        )
        self.logger = logging.getLogger(app_name)
        
        # Starte System-Monitoring
        self._start_system_monitoring()
        
    def _start_system_monitoring(self):
        """Startet System-Monitoring im Hintergrund"""
        import threading
        
        def monitor():
            while True:
                # CPU-Auslastung
                Metrics.cpu_usage.set(psutil.cpu_percent())
                
                # Speicher-Auslastung
                mem = psutil.Process().memory_info()
                Metrics.memory_usage.set(mem.rss)
                
                time.sleep(5)
                
        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()
        
    def track_request(self, method: str, endpoint: str, status: int):
        """Trackt einen HTTP-Request"""
        Metrics.http_requests.labels(
            method=method,
            endpoint=endpoint,
            status=status
        ).inc()
        
    def track_db_operation(self, operation: str, table: str):
        """Trackt eine Datenbankoperation"""
        Metrics.db_operations.labels(
            operation=operation,
            table=table
        ).inc()
        
    def track_error(self, error_type: str, location: str):
        """Trackt einen Fehler"""
        Metrics.errors.labels(
            type=error_type,
            location=location
        ).inc()
        
        self.logger.error(f"{error_type} in {location}")
        
    def track_active_users(self, count: int):
        """Aktualisiert aktive Nutzer"""
        Metrics.active_users.set(count)
        
    def get_uptime(self) -> float:
        """Gibt die Uptime in Sekunden zurück"""
        return (datetime.now() - self.start_time).total_seconds()
        
    @staticmethod
    def time_request(endpoint: str):
        """Decorator für Request-Timing"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                with Metrics.request_duration.labels(endpoint).time():
                    return func(*args, **kwargs)
            return wrapper
        return decorator
        
    @staticmethod
    def time_db_query(query_type: str):
        """Decorator für DB-Query-Timing"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                with Metrics.db_query_duration.labels(query_type).time():
                    return func(*args, **kwargs)
            return wrapper
        return decorator

# Beispiel-Verwendung
monitoring = MonitoringSystem("valeo-erp")

@monitoring.time_request("/api/users")
async def get_users():
    # ... API-Logik ...
    monitoring.track_request("GET", "/api/users", 200)
    
@monitoring.time_db_query("select")
async def fetch_user(user_id: str):
    # ... DB-Logik ...
    monitoring.track_db_operation("select", "users")
"""

        grafana_dashboard = """
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 20,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "smooth",
            "lineWidth": 2,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unit": "short"
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "expr": "rate(http_requests_total[5m])",
          "refId": "A"
        }
      ],
      "title": "HTTP Request Rate",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "id": 2,
      "options": {
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "showThresholdLabels": false,
        "showThresholdMarkers": true
      },
      "pluginVersion": "10.0.3",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "expr": "cpu_usage_percent",
          "refId": "A"
        }
      ],
      "title": "CPU Usage",
      "type": "gauge"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "VALEO ERP Dashboard",
  "version": 0,
  "weekStart": ""
}
"""

        prometheus_config = """
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'valeo-erp'
    static_configs:
      - targets: ['localhost:8000']
"""

        # Speichere Monitoring-System
        os.makedirs("backend/monitoring", exist_ok=True)
        os.makedirs("config/grafana/dashboards", exist_ok=True)
        os.makedirs("config/prometheus", exist_ok=True)
        
        with open("backend/monitoring/metrics.py", "w") as f:
            f.write(monitoring_code)
            
        with open("config/grafana/dashboards/main.json", "w") as f:
            f.write(grafana_dashboard)
            
        with open("config/prometheus/prometheus.yml", "w") as f:
            f.write(prometheus_config)
            
        return {
            "status": "success",
            "message": "Monitoring-System erfolgreich implementiert",
            "files_created": [
                "backend/monitoring/metrics.py",
                "config/grafana/dashboards/main.json",
                "config/prometheus/prometheus.yml"
            ]
        } 