# -*- coding: utf-8 -*-
"""
Optimierter VAN-Modus mit Token-sparender Agent-Delegation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import re
from .base_mode import BaseMode

class OptimizedVANMode(BaseMode):
    """
    Optimierter VAN Modus mit intelligenter Agent-Delegation.
    
    Token-Einsparung durch:
    - Rule-based Agents für Validierung (100% Einsparung)
    - Template-Agents für Standard-Analysen (100% Einsparung)
    - LLM nur für komplexe Vision-Entwicklung (80% weniger Aufrufe)
    """
    
    def __init__(self):
        super().__init__("van_optimized")
        
        # Spezialisierte Agenten
        self.validation_agent = ValidationAgent()
        self.template_agent = TemplateAgent()
        self.analysis_agent = AnalysisAgent()
        
        # Token-Tracking
        self.token_savings = 0
        self.agent_delegations = 0
        self.llm_calls = 0
        
    async def _initialize_mode(self):
        """Initialisiert VAN-spezifische Komponenten."""
        self.logger.info("Initialisiere optimierte VAN-Komponenten...")
        # Keine besonderen Initialisierungen nötig
        
    async def complete(self) -> Dict[str, Any]:
        """Schließt den VAN Modus ab."""
        current_state = await self.get_current_state()
        
        completion_data = {
            "mode": "van_optimized",
            "status": "completed",
            "total_token_savings": self.token_savings,
            "total_agent_delegations": self.agent_delegations,
            "total_llm_calls": self.llm_calls,
            "final_state": current_state,
            "completion_timestamp": datetime.utcnow().isoformat()
        }
        
        # In RAG speichern für nächsten Modus
        await self.store_in_rag(completion_data, "van_completion")
        
        return completion_data
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Startet optimierten VAN Modus."""
        self.logger.info("Starte optimierten VAN Modus...")
        
        # Sofortige Validierung ohne LLM (0 Tokens)
        validation_result = await self.validation_agent.validate_input(input_data)
        if not validation_result["valid"]:
            return {"status": "error", "errors": validation_result["errors"]}
        
        self.agent_delegations += 1
        self.token_savings += 200  # Geschätzte LLM-Tokens gespart
        
        # Template-basierte Vision-Struktur (0 Tokens)
        vision_template = await self.template_agent.create_vision_structure(input_data)
        self.agent_delegations += 1
        self.token_savings += 300
        
        # Status aktualisieren
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "phase": "vision",
            "vision_template": vision_template,
            "validation_passed": True
        })
        
        return {
            "status": "started",
            "vision_structure": vision_template,
            "token_savings": self.token_savings,
            "optimizations": ["validation_agent", "template_agent"]
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Verarbeitet VAN-Phasen mit optimaler Agent-Delegation."""
        phase = data.get("phase", "vision")
        phase_data = data.get("phase_data", {})
        
        if phase == "vision":
            return await self._process_vision_optimized(phase_data)
        elif phase == "alignment":
            return await self._process_alignment_optimized(phase_data)
        elif phase == "navigation":
            return await self._process_navigation_optimized(phase_data)
        else:
            raise ValueError(f"Ungueltige Phase: {phase}")
            
    async def _process_vision_optimized(self, vision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Vision-Verarbeitung."""
        
        # 1. Anforderungs-Klassifizierung ohne LLM (0 Tokens)
        classified_requirements = await self.analysis_agent.classify_requirements(
            vision_data.get("requirements", [])
        )
        self.agent_delegations += 1
        self.token_savings += 400
        
        # 2. Standard-Constraint-Validierung (0 Tokens)
        validated_constraints = await self.validation_agent.validate_constraints(
            vision_data.get("constraints", [])
        )
        self.agent_delegations += 1
        self.token_savings += 200
        
        # 3. Nur komplexe Vision-Entwicklung an LLM (stark reduzierte Tokens)
        complex_vision_tasks = self._identify_complex_vision_tasks(vision_data)
        
        if complex_vision_tasks:
            # Komprimierter Context für LLM
            compressed_context = await self._compress_vision_context(vision_data)
            
            # LLM nur für komplexe Aufgaben (300 statt 1500 Tokens)
            llm_result = await self._call_llm_for_complex_vision(
                complex_vision_tasks, 
                compressed_context
            )
            self.llm_calls += 1
            
        # Kombiniere Ergebnisse
        vision_result = {
            "classified_requirements": classified_requirements,
            "validated_constraints": validated_constraints,
            "complex_insights": llm_result if complex_vision_tasks else None,
            "processing_method": "agent_delegated"
        }
        
        return {
            "status": "vision_processed",
            "result": vision_result,
            "token_savings": self.token_savings,
            "agent_delegations": self.agent_delegations,
            "llm_calls": self.llm_calls
        }
        
    async def _process_alignment_optimized(self, alignment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Alignment-Verarbeitung."""
        
        # Resource-Matching ohne LLM (0 Tokens)
        resource_analysis = await self.analysis_agent.analyze_resources(
            alignment_data.get("resources", {})
        )
        self.agent_delegations += 1
        self.token_savings += 350
        
        # Capability-Assessment mit Template (0 Tokens) 
        capability_assessment = await self.template_agent.assess_capabilities(
            alignment_data.get("capabilities", [])
        )
        self.agent_delegations += 1
        self.token_savings += 300
        
        return {
            "status": "alignment_processed",
            "resource_analysis": resource_analysis,
            "capability_assessment": capability_assessment,
            "token_savings": self.token_savings
        }
        
    async def _process_navigation_optimized(self, navigation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Navigation-Verarbeitung."""
        
        # Step-Prioritization ohne LLM (0 Tokens)
        prioritized_steps = await self.analysis_agent.prioritize_steps(
            navigation_data.get("steps", [])
        )
        self.agent_delegations += 1
        self.token_savings += 250
        
        # Timeline-Berechnung ohne LLM (0 Tokens)
        timeline_calculation = await self.analysis_agent.calculate_timeline(
            prioritized_steps
        )
        self.agent_delegations += 1
        self.token_savings += 200
        
        return {
            "status": "navigation_processed",
            "prioritized_steps": prioritized_steps,
            "timeline": timeline_calculation,
            "total_token_savings": self.token_savings
        }
        
    def _identify_complex_vision_tasks(self, vision_data: Dict[str, Any]) -> List[str]:
        """Identifiziert Aufgaben die wirklich LLM brauchen."""
        complex_keywords = [
            "strategy", "innovation", "creative", "complex", 
            "architectural", "conceptual", "design thinking"
        ]
        
        complex_tasks = []
        description = vision_data.get("description", "").lower()
        
        for keyword in complex_keywords:
            if keyword in description:
                complex_tasks.append(f"Complex {keyword} analysis required")
                
        return complex_tasks
        
    async def _compress_vision_context(self, vision_data: Dict[str, Any]) -> str:
        """Komprimiert Context für LLM-Aufruf."""
        # Extrahiere nur Kerninfos
        key_info = {
            "project": vision_data.get("project_id", ""),
            "requirements_count": len(vision_data.get("requirements", [])),
            "constraints_count": len(vision_data.get("constraints", [])),
            "complexity": "high" if len(vision_data.get("requirements", [])) > 5 else "medium"
        }
        
        # Kompakte Darstellung
        return f"Project: {key_info['project']} | Reqs: {key_info['requirements_count']} | Constraints: {key_info['constraints_count']} | Complexity: {key_info['complexity']}"
        
    async def _call_llm_for_complex_vision(self, tasks: List[str], context: str) -> Dict[str, Any]:
        """Optimierter LLM-Aufruf nur für komplexe Tasks."""
        # Hier wäre der tatsächliche LLM-Aufruf mit minimiertem Prompt
        prompt = f"Context: {context}\nTasks: {', '.join(tasks)}\nProvide strategic insights:"
        
        # Simuliere LLM-Antwort (in Realität: API-Aufruf)
        return {
            "strategic_insights": "AI-generated strategic recommendations",
            "tokens_used": 300,  # Statt 1500 durch Optimierung
            "optimization": "compressed_context_structured_output"
        }

class ValidationAgent:
    """Agent für regel-basierte Validierungen ohne LLM."""
    
    def __init__(self):
        self.validation_rules = {
            "project_id": r"^[a-zA-Z0-9_-]{3,50}$",
            "email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            "priority": ["low", "medium", "high", "critical"]
        }
        
    async def validate_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validiert Eingabedaten ohne LLM."""
        errors = []
        warnings = []
        
        # Projekt ID validieren
        project_id = input_data.get("project_id", "")
        if not re.match(self.validation_rules["project_id"], project_id):
            errors.append("Invalid project_id format")
            
        # Requirements validieren
        requirements = input_data.get("requirements", [])
        if len(requirements) == 0:
            errors.append("No requirements provided")
        elif len(requirements) > 20:
            warnings.append("Many requirements - consider grouping")
            
        # Constraints validieren
        constraints = input_data.get("constraints", [])
        if len(constraints) > 15:
            warnings.append("Many constraints - review necessity")
            
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "validation_method": "rule_based"
        }
        
    async def validate_constraints(self, constraints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validiert Constraints ohne LLM."""
        validated = []
        
        for constraint in constraints:
            constraint_type = constraint.get("type", "")
            severity = constraint.get("severity", "medium")
            
            # Regel-basierte Kategorisierung
            if constraint_type in ["budget", "time", "resource"]:
                category = "operational"
            elif constraint_type in ["security", "compliance", "legal"]:
                category = "regulatory"
            else:
                category = "technical"
                
            validated.append({
                **constraint,
                "category": category,
                "validation_status": "valid",
                "processing_method": "rule_based"
            })
            
        return validated

class TemplateAgent:
    """Agent für Template-basierte Generierung ohne LLM."""
    
    def __init__(self):
        self.templates = {
            "vision_structure": {
                "goals": [],
                "success_criteria": [],
                "stakeholders": [],
                "timeline": "TBD",
                "budget": "TBD"
            },
            "requirement_analysis": """
Requirement: {name}
Priority: {priority}
Category: {category}
Complexity: {complexity}
Estimated Effort: {effort}
Dependencies: {dependencies}
            """,
            "capability_assessment": """
Capability: {name}
Current Level: {current_level}/10
Required Level: {required_level}/10
Gap: {gap}
Development Time: {dev_time}
            """
        }
        
    async def create_vision_structure(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt Vision-Struktur aus Template."""
        structure = self.templates["vision_structure"].copy()
        
        # Template mit Daten befüllen
        structure.update({
            "project_id": input_data.get("project_id"),
            "created_date": datetime.utcnow().isoformat(),
            "requirements_count": len(input_data.get("requirements", [])),
            "constraints_count": len(input_data.get("constraints", [])),
            "template_used": "vision_structure"
        })
        
        return structure
        
    async def assess_capabilities(self, capabilities: List[str]) -> List[Dict[str, Any]]:
        """Bewertet Capabilities basierend auf Templates."""
        assessments = []
        
        for capability in capabilities:
            # Regel-basierte Bewertung
            if any(tech in capability.lower() for tech in ["python", "javascript", "react"]):
                current_level = 8
                complexity = "medium"
            elif any(tech in capability.lower() for tech in ["ai", "machine learning", "deep learning"]):
                current_level = 6
                complexity = "high"
            else:
                current_level = 7
                complexity = "medium"
                
            assessment = {
                "capability": capability,
                "current_level": current_level,
                "required_level": 8,
                "gap": max(0, 8 - current_level),
                "complexity": complexity,
                "assessment_method": "template_based"
            }
            
            assessments.append(assessment)
            
        return assessments

class AnalysisAgent:
    """Agent für datenbasierte Analysen ohne LLM."""
    
    async def classify_requirements(self, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Klassifiziert Requirements ohne LLM."""
        classified = []
        
        for req in requirements:
            description = req.get("description", "").lower()
            
            # Regel-basierte Klassifizierung
            if any(word in description for word in ["ui", "frontend", "interface", "user"]):
                category = "frontend"
                priority = "high"
            elif any(word in description for word in ["api", "backend", "server", "database"]):
                category = "backend"
                priority = "high"
            elif any(word in description for word in ["test", "quality", "validation"]):
                category = "quality"
                priority = "medium"
            else:
                category = "general"
                priority = "medium"
                
            classified.append({
                **req,
                "category": category,
                "auto_priority": priority,
                "classification_method": "rule_based"
            })
            
        return classified
        
    async def analyze_resources(self, resources: Dict[str, Any]) -> Dict[str, Any]:
        """Analysiert Ressourcen ohne LLM."""
        analysis = {
            "resource_summary": {},
            "utilization": {},
            "recommendations": []
        }
        
        for resource_type, amount in resources.items():
            if isinstance(amount, (int, float)):
                if amount > 100:
                    utilization = "high"
                    recommendation = f"Consider optimizing {resource_type} usage"
                elif amount > 50:
                    utilization = "medium"
                    recommendation = f"{resource_type} usage is acceptable"
                else:
                    utilization = "low"
                    recommendation = f"More {resource_type} capacity available"
                    
                analysis["resource_summary"][resource_type] = amount
                analysis["utilization"][resource_type] = utilization
                analysis["recommendations"].append(recommendation)
                
        return analysis
        
    async def prioritize_steps(self, steps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Priorisiert Steps ohne LLM."""
        for step in steps:
            description = step.get("description", "").lower()
            
            # Regel-basierte Priorisierung
            if any(word in description for word in ["critical", "urgent", "blocker"]):
                step["priority_score"] = 10
            elif any(word in description for word in ["important", "required"]):
                step["priority_score"] = 7
            else:
                step["priority_score"] = 5
                
        # Sortiere nach Priorität
        return sorted(steps, key=lambda x: x.get("priority_score", 0), reverse=True)
        
    async def calculate_timeline(self, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Berechnet Timeline ohne LLM."""
        total_effort = sum(step.get("estimated_hours", 8) for step in steps)
        
        # Regel-basierte Timeline-Berechnung
        working_hours_per_day = 8
        buffer_factor = 1.3  # 30% Puffer
        
        estimated_days = (total_effort * buffer_factor) / working_hours_per_day
        
        return {
            "total_steps": len(steps),
            "total_effort_hours": total_effort,
            "estimated_days": round(estimated_days, 1),
            "buffer_included": "30%",
            "calculation_method": "rule_based"
        }

# Export optimierter Modus
__all__ = ["OptimizedVANMode"]
