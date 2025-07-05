# -*- coding: utf-8 -*-
"""
Token-Optimierung und Agent-Delegation für APM Framework.
"""

import asyncio
import json
import hashlib
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import re

class TaskComplexity(Enum):
    """Klassifizierung der Aufgaben-Komplexität."""
    SIMPLE = "simple"           # Regel-basiert, keine LLM nötig
    MEDIUM = "medium"           # Leichte LLM-Unterstützung
    COMPLEX = "complex"         # Vollständige LLM-Verarbeitung

class AgentType(Enum):
    """Verschiedene Agent-Typen für spezielle Aufgaben."""
    RULE_BASED = "rule_based"           # Regel-basierte Logik
    TEMPLATE = "template"               # Template-Verarbeitung
    VALIDATOR = "validator"             # Datenvalidierung
    FORMATTER = "formatter"             # Formatierung
    CLASSIFIER = "classifier"           # Klassifizierung
    SUMMARIZER = "summarizer"           # Zusammenfassung
    LLM_ASSISTANT = "llm_assistant"     # LLM-unterstützt

@dataclass
class TokenUsage:
    """Token-Verbrauch Tracking."""
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_estimate: float
    optimization_potential: int = 0

class TokenOptimizer:
    """Optimiert Token-Verbrauch durch intelligente Delegation."""
    
    def __init__(self):
        # Token-Kosten pro 1K Tokens (Beispielwerte)
        self.token_costs = {
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
            "claude": {"input": 0.008, "output": 0.024}
        }
        
        # Agent-Fähigkeiten
        self.agent_capabilities = {
            AgentType.RULE_BASED: {
                "capabilities": [
                    "Datenvalidierung",
                    "Einfache Berechnungen", 
                    "Status-Updates",
                    "Filterung",
                    "Sortierung"
                ],
                "max_complexity": TaskComplexity.SIMPLE,
                "token_cost": 0  # Kein LLM-Aufruf
            },
            AgentType.TEMPLATE: {
                "capabilities": [
                    "Template-Befüllung",
                    "Dokumentgenerierung",
                    "Report-Erstellung",
                    "Code-Generierung aus Templates"
                ],
                "max_complexity": TaskComplexity.SIMPLE,
                "token_cost": 0
            },
            AgentType.VALIDATOR: {
                "capabilities": [
                    "Schema-Validierung",
                    "Datentyp-Prüfung",
                    "Constraint-Validierung",
                    "Format-Prüfung"
                ],
                "max_complexity": TaskComplexity.SIMPLE,
                "token_cost": 0
            },
            AgentType.FORMATTER: {
                "capabilities": [
                    "JSON-Formatierung",
                    "XML-Transformation",
                    "CSV-Verarbeitung",
                    "Datenstruktur-Umwandlung"
                ],
                "max_complexity": TaskComplexity.SIMPLE,
                "token_cost": 0
            },
            AgentType.CLASSIFIER: {
                "capabilities": [
                    "Kategorie-Zuordnung",
                    "Prioritäts-Bewertung",
                    "Status-Klassifizierung",
                    "Typ-Erkennung"
                ],
                "max_complexity": TaskComplexity.MEDIUM,
                "token_cost": 50  # Kleine LLM-Aufrufe
            },
            AgentType.SUMMARIZER: {
                "capabilities": [
                    "Kurzzusammenfassungen",
                    "Bullet-Point Listen",
                    "Status-Reports",
                    "Key-Metrics Extraktion"
                ],
                "max_complexity": TaskComplexity.MEDIUM,
                "token_cost": 100
            }
        }
        
        # Task-Pattern für automatische Klassifizierung
        self.task_patterns = {
            TaskComplexity.SIMPLE: [
                r"validiere?\s+\w+",
                r"prüfe?\s+ob",
                r"formatiere?\s+\w+",
                r"sortiere?\s+nach",
                r"filtere?\s+\w+",
                r"berechne?\s+\w+",
                r"update\s+status",
                r"erstelle?\s+liste"
            ],
            TaskComplexity.MEDIUM: [
                r"klassifiziere?\s+\w+",
                r"bewerte?\s+\w+",
                r"fasse?\s+zusammen",
                r"analysiere?\s+\w+",
                r"vergleiche?\s+\w+",
                r"kategorisiere?\s+\w+"
            ],
            TaskComplexity.COMPLEX: [
                r"entwickle?\s+konzept",
                r"entwerfe?\s+architektur",
                r"erstelle?\s+strategie",
                r"plane?\s+projekt",
                r"löse?\s+problem",
                r"optimiere?\s+prozess"
            ]
        }
        
        # Template-Cache für häufige Aufgaben
        self.template_cache = {}
        
        # Token-Statistiken
        self.token_stats = {
            "total_saved": 0,
            "total_used": 0,
            "agent_delegations": 0,
            "llm_calls": 0
        }

    def classify_task_complexity(self, task_description: str) -> TaskComplexity:
        """Klassifiziert Aufgaben-Komplexität basierend auf Beschreibung."""
        task_lower = task_description.lower()
        
        # Prüfe Patterns für jede Komplexitätsstufe
        for complexity, patterns in self.task_patterns.items():
            for pattern in patterns:
                if re.search(pattern, task_lower):
                    return complexity
                    
        # Default: Complex (sicherheitshalber LLM verwenden)
        return TaskComplexity.COMPLEX

    def select_optimal_agent(self, task: Dict[str, Any]) -> AgentType:
        """Wählt den optimalen Agent für eine Aufgabe aus."""
        task_description = task.get("description", "")
        complexity = self.classify_task_complexity(task_description)
        task_type = task.get("type", "")
        
        # Direkte Zuordnung basierend auf Task-Typ
        type_mappings = {
            "validation": AgentType.VALIDATOR,
            "formatting": AgentType.FORMATTER,
            "template": AgentType.TEMPLATE,
            "classification": AgentType.CLASSIFIER,
            "summary": AgentType.SUMMARIZER,
            "calculation": AgentType.RULE_BASED
        }
        
        if task_type in type_mappings:
            return type_mappings[task_type]
            
        # Komplexitäts-basierte Auswahl
        if complexity == TaskComplexity.SIMPLE:
            return AgentType.RULE_BASED
        elif complexity == TaskComplexity.MEDIUM:
            return AgentType.CLASSIFIER  # oder SUMMARIZER je nach Kontext
        else:
            return AgentType.LLM_ASSISTANT

    async def optimize_task_delegation(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimiert Task-Delegation für minimalen Token-Verbrauch."""
        
        delegation_plan = {
            "agent_tasks": {},
            "llm_tasks": [],
            "estimated_savings": 0,
            "optimization_strategy": []
        }
        
        for task in tasks:
            optimal_agent = self.select_optimal_agent(task)
            
            if optimal_agent == AgentType.LLM_ASSISTANT:
                # Prüfe ob Task weiter optimiert werden kann
                optimized_task = await self.optimize_llm_task(task)
                delegation_plan["llm_tasks"].append(optimized_task)
            else:
                # Delegiere an spezialisierten Agent
                if optimal_agent not in delegation_plan["agent_tasks"]:
                    delegation_plan["agent_tasks"][optimal_agent] = []
                delegation_plan["agent_tasks"][optimal_agent].append(task)
                
                # Berechne Token-Einsparung
                estimated_llm_tokens = self.estimate_llm_tokens(task)
                agent_tokens = self.agent_capabilities[optimal_agent]["token_cost"]
                savings = estimated_llm_tokens - agent_tokens
                delegation_plan["estimated_savings"] += savings
                
        return delegation_plan

    async def optimize_llm_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Optimiert LLM-Tasks für minimalen Token-Verbrauch."""
        optimizations = []
        optimized_task = task.copy()
        
        # 1. Template-basierte Optimierung
        template_key = self.generate_template_key(task)
        if template_key in self.template_cache:
            optimized_task["template"] = self.template_cache[template_key]
            optimized_task["use_template"] = True
            optimizations.append("template_reuse")
            
        # 2. Context-Komprimierung
        if "context" in task and len(task["context"]) > 1000:
            compressed_context = await self.compress_context(task["context"])
            optimized_task["context"] = compressed_context
            optimizations.append("context_compression")
            
        # 3. Ausgabe-Format-Optimierung
        if "output_format" not in task:
            optimized_task["output_format"] = "structured_json"
            optimizations.append("structured_output")
            
        # 4. Few-Shot Examples reduzieren
        if "examples" in task and len(task["examples"]) > 3:
            optimized_task["examples"] = task["examples"][:2]  # Nur die besten 2
            optimizations.append("example_reduction")
            
        optimized_task["optimizations"] = optimizations
        return optimized_task

    def estimate_llm_tokens(self, task: Dict[str, Any]) -> int:
        """Schätzt Token-Verbrauch für LLM-Task."""
        base_tokens = 100  # Basis-Prompt
        
        # Aufgaben-Beschreibung
        description_tokens = len(task.get("description", "").split()) * 1.3
        
        # Context
        context_tokens = len(task.get("context", "").split()) * 1.3
        
        # Examples
        examples = task.get("examples", [])
        example_tokens = sum(len(str(ex).split()) for ex in examples) * 1.3
        
        # Output (geschätzt)
        output_tokens = task.get("expected_output_length", 200)
        
        total_input = base_tokens + description_tokens + context_tokens + example_tokens
        total_output = output_tokens
        
        return int(total_input + total_output)

    def generate_template_key(self, task: Dict[str, Any]) -> str:
        """Generiert Cache-Key für Task-Templates."""
        key_components = [
            task.get("type", ""),
            task.get("category", ""),
            str(len(task.get("description", "")))
        ]
        return hashlib.md5("|".join(key_components).encode()).hexdigest()

    async def compress_context(self, context: str) -> str:
        """Komprimiert Context für Token-Einsparung."""
        # Entferne Redundanzen
        lines = context.split('\n')
        unique_lines = list(dict.fromkeys(lines))  # Entferne Duplikate
        
        # Kürze sehr lange Zeilen
        compressed_lines = []
        for line in unique_lines:
            if len(line) > 200:
                # Behalte Anfang und Ende
                compressed_line = line[:100] + "..." + line[-50:]
                compressed_lines.append(compressed_line)
            else:
                compressed_lines.append(line)
                
        return '\n'.join(compressed_lines)

class RuleBasedAgent:
    """Agent für regel-basierte Aufgaben ohne LLM."""
    
    def __init__(self):
        self.validation_rules = {
            "email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            "phone": r"^\+?1?-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$",
            "url": r"^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$"
        }
        
    async def validate_data(self, data: Dict[str, Any], rules: Dict[str, str]) -> Dict[str, Any]:
        """Validiert Daten basierend auf Regeln."""
        results = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        for field, rule in rules.items():
            if field in data:
                value = str(data[field])
                if rule in self.validation_rules:
                    pattern = self.validation_rules[rule]
                    if not re.match(pattern, value):
                        results["valid"] = False
                        results["errors"].append(f"Invalid {field}: {value}")
                        
        return results
        
    async def calculate_metrics(self, data: List[Dict[str, Any]], metric_type: str) -> Dict[str, Any]:
        """Berechnet einfache Metriken."""
        if not data:
            return {"error": "No data provided"}
            
        if metric_type == "count":
            return {"result": len(data)}
        elif metric_type == "sum":
            total = sum(item.get("value", 0) for item in data)
            return {"result": total}
        elif metric_type == "average":
            values = [item.get("value", 0) for item in data]
            avg = sum(values) / len(values) if values else 0
            return {"result": avg}
        else:
            return {"error": f"Unknown metric type: {metric_type}"}

class TemplateAgent:
    """Agent für Template-basierte Aufgaben."""
    
    def __init__(self):
        self.templates = {
            "status_report": """
# Status Report - {date}

## Projekt: {project_name}
- Status: {status}
- Fortschritt: {progress}%
- Nächste Schritte: {next_steps}

## Metriken:
{metrics}
            """,
            "task_summary": """
Aufgabe: {task_name}
Priorität: {priority}
Status: {status}
Deadline: {deadline}
Beschreibung: {description}
            """,
            "error_report": """
[ERROR] {timestamp}
Component: {component}
Error: {error_message}
Impact: {impact}
Resolution: {resolution}
            """
        }
        
    async def generate_from_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """Generiert Text aus Template."""
        if template_name not in self.templates:
            return f"Template '{template_name}' not found"
            
        template = self.templates[template_name]
        try:
            return template.format(**data)
        except KeyError as e:
            return f"Missing template variable: {e}"

class OptimizedAPMController:
    """APM Controller mit Token-Optimierung."""
    
    def __init__(self):
        self.token_optimizer = TokenOptimizer()
        self.rule_agent = RuleBasedAgent()
        self.template_agent = TemplateAgent()
        
        # Token-Tracking
        self.session_tokens = TokenUsage(0, 0, 0, 0.0)
        
    async def process_tasks_optimized(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verarbeitet Tasks mit optimaler Token-Nutzung."""
        
        # 1. Delegationsplan erstellen
        delegation_plan = await self.token_optimizer.optimize_task_delegation(tasks)
        
        results = {
            "agent_results": {},
            "llm_results": [],
            "token_savings": delegation_plan["estimated_savings"],
            "delegation_summary": {}
        }
        
        # 2. Agent-Tasks ausführen (ohne LLM)
        for agent_type, agent_tasks in delegation_plan["agent_tasks"].items():
            agent_results = await self.execute_agent_tasks(agent_type, agent_tasks)
            results["agent_results"][agent_type.value] = agent_results
            
        # 3. Optimierte LLM-Tasks ausführen
        for llm_task in delegation_plan["llm_tasks"]:
            # Hier würde der tatsächliche LLM-Aufruf stehen
            llm_result = await self.execute_optimized_llm_task(llm_task)
            results["llm_results"].append(llm_result)
            
        # 4. Statistiken aktualisieren
        self.update_token_statistics(delegation_plan)
        
        return results
        
    async def execute_agent_tasks(self, agent_type: AgentType, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Führt Agent-spezifische Tasks aus."""
        results = []
        
        for task in tasks:
            if agent_type == AgentType.RULE_BASED:
                if task.get("type") == "validation":
                    result = await self.rule_agent.validate_data(
                        task.get("data", {}),
                        task.get("rules", {})
                    )
                elif task.get("type") == "calculation":
                    result = await self.rule_agent.calculate_metrics(
                        task.get("data", []),
                        task.get("metric_type", "count")
                    )
                else:
                    result = {"error": "Unsupported rule-based task"}
                    
            elif agent_type == AgentType.TEMPLATE:
                result = await self.template_agent.generate_from_template(
                    task.get("template_name", ""),
                    task.get("data", {})
                )
                
            # Weitere Agent-Typen hier implementieren...
            else:
                result = {"error": f"Agent type {agent_type} not implemented"}
                
            results.append({
                "task_id": task.get("id"),
                "result": result,
                "agent_type": agent_type.value
            })
            
        return results
        
    async def execute_optimized_llm_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Führt optimierten LLM-Task aus (Mock-Implementation)."""
        # Hier würde der tatsächliche LLM-Aufruf stehen
        estimated_tokens = self.token_optimizer.estimate_llm_tokens(task)
        
        # Simuliere Token-Verbrauch
        self.session_tokens.input_tokens += int(estimated_tokens * 0.7)
        self.session_tokens.output_tokens += int(estimated_tokens * 0.3)
        self.session_tokens.total_tokens = self.session_tokens.input_tokens + self.session_tokens.output_tokens
        
        return {
            "task_id": task.get("id"),
            "result": f"LLM result for task {task.get('id')}",
            "tokens_used": estimated_tokens,
            "optimizations": task.get("optimizations", [])
        }
        
    def update_token_statistics(self, delegation_plan: Dict[str, Any]):
        """Aktualisiert Token-Statistiken."""
        self.token_optimizer.token_stats["total_saved"] += delegation_plan["estimated_savings"]
        self.token_optimizer.token_stats["agent_delegations"] += sum(
            len(tasks) for tasks in delegation_plan["agent_tasks"].values()
        )
        self.token_optimizer.token_stats["llm_calls"] += len(delegation_plan["llm_tasks"])
        
    def get_optimization_report(self) -> Dict[str, Any]:
        """Erstellt Optimierungsbericht."""
        stats = self.token_optimizer.token_stats
        
        if stats["llm_calls"] > 0:
            avg_tokens_per_call = stats["total_used"] / stats["llm_calls"]
        else:
            avg_tokens_per_call = 0
            
        savings_percentage = 0
        if stats["total_used"] > 0:
            potential_usage = stats["total_used"] + stats["total_saved"]
            savings_percentage = (stats["total_saved"] / potential_usage) * 100
            
        return {
            "total_token_savings": stats["total_saved"],
            "savings_percentage": round(savings_percentage, 2),
            "agent_delegations": stats["agent_delegations"],
            "llm_calls": stats["llm_calls"],
            "average_tokens_per_llm_call": round(avg_tokens_per_call, 2),
            "optimization_efficiency": "high" if savings_percentage > 30 else "medium" if savings_percentage > 15 else "low"
        }

# Beispiel für die Verwendung
async def demo_token_optimization():
    """Demonstriert Token-Optimierung."""
    controller = OptimizedAPMController()
    
    # Beispiel-Tasks
    tasks = [
        {
            "id": "task_1",
            "type": "validation",
            "description": "Validiere E-Mail Adressen",
            "data": {"email": "test@example.com"},
            "rules": {"email": "email"}
        },
        {
            "id": "task_2", 
            "type": "template",
            "description": "Erstelle Status Report",
            "template_name": "status_report",
            "data": {
                "date": "2025-06-26",
                "project_name": "VALEO ERP",
                "status": "In Progress",
                "progress": 75,
                "next_steps": "Testing Phase",
                "metrics": "All KPIs green"
            }
        },
        {
            "id": "task_3",
            "type": "calculation",
            "description": "Berechne Durchschnitt",
            "data": [{"value": 10}, {"value": 20}, {"value": 30}],
            "metric_type": "average"
        },
        {
            "id": "task_4",
            "description": "Entwickle komplexe Strategie für Skalierung",
            "context": "Sehr langer Context..." * 100,  # Simuliert langen Context
            "expected_output_length": 500
        }
    ]
    
    # Verarbeite Tasks optimiert
    results = await controller.process_tasks_optimized(tasks)
    
    # Zeige Optimierungsbericht
    report = controller.get_optimization_report()
    
    print("=== TOKEN-OPTIMIERUNG DEMO ===")
    print(f"Agent-Delegationen: {report['agent_delegations']}")
    print(f"LLM-Aufrufe: {report['llm_calls']}")
    print(f"Token-Einsparung: {report['savings_percentage']}%")
    print(f"Optimierungseffizienz: {report['optimization_efficiency']}")
    
    return results, report

if __name__ == "__main__":
    results, report = asyncio.run(demo_token_optimization())
    print("\nDemo abgeschlossen!")
    print(json.dumps(report, indent=2))
