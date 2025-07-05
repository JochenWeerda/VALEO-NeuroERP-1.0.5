# -*- coding: utf-8 -*-
"""
Optimierter PLAN-Modus mit Token-sparender Agent-Delegation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
from .base_mode import BaseMode

class OptimizedPlanMode(BaseMode):
    """
    Optimierter PLAN Modus mit intelligenter Agent-Delegation.
    
    Token-Einsparung durch:
    - Math-Agents für Berechnungen (100% Einsparung)
    - Template-Agents für Standard-Planungsdokumente (100% Einsparung)
    - Rule-based Agents für Ressourcenzuweisung (100% Einsparung)
    - LLM nur für strategische Entscheidungen (90% weniger Aufrufe)
    """
    
    def __init__(self):
        super().__init__("plan_optimized")
        
        # Spezialisierte Agenten
        self.math_agent = MathAgent()
        self.template_agent = PlanningTemplateAgent()
        self.resource_agent = ResourceAgent()
        self.risk_agent = RiskAgent()
        
        # Token-Tracking
        self.token_savings = 0
        self.agent_delegations = 0
        self.llm_calls = 0
        
    async def _initialize_mode(self):
        """Initialisiert PLAN-spezifische Komponenten."""
        self.logger.info("Initialisiere optimierte PLAN-Komponenten...")
        # Keine besonderen Initialisierungen nötig
        
    async def complete(self) -> Dict[str, Any]:
        """Schließt den PLAN Modus ab."""
        current_state = await self.get_current_state()
        
        completion_data = {
            "mode": "plan_optimized",
            "status": "completed",
            "total_token_savings": self.token_savings,
            "total_agent_delegations": self.agent_delegations,
            "total_llm_calls": self.llm_calls,
            "final_state": current_state,
            "completion_timestamp": datetime.utcnow().isoformat()
        }
        
        # In RAG speichern für nächsten Modus
        await self.store_in_rag(completion_data, "plan_completion")
        
        return completion_data
        
    async def start(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Startet optimierten PLAN Modus."""
        self.logger.info("Starte optimierten PLAN Modus...")
        
        # Automatische Workpackage-Generierung ohne LLM (0 Tokens)
        workpackages = await self.template_agent.generate_workpackages(
            input_data.get("vision", {}).get("requirements", [])
        )
        self.agent_delegations += 1
        self.token_savings += 800  # Erspart große LLM-Analyse
        
        # Effort-Schätzung ohne LLM (0 Tokens)
        effort_estimates = await self.math_agent.estimate_efforts(workpackages)
        self.agent_delegations += 1
        self.token_savings += 400
        
        await self.update_state("started", {
            "project_id": input_data["project_id"],
            "workpackages": workpackages,
            "effort_estimates": effort_estimates,
            "phase": "workpackage_creation"
        })
        
        return {
            "status": "started",
            "workpackage_count": len(workpackages),
            "total_effort_hours": sum(effort_estimates.values()),
            "token_savings": self.token_savings,
            "optimizations": ["template_workpackages", "math_estimates"]
        }
        
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Verarbeitet PLAN-Phasen mit optimaler Agent-Delegation."""
        phase = data.get("phase", "workpackage_creation")
        phase_data = data.get("phase_data", {})
        
        phase_handlers = {
            "workpackage_creation": self._process_workpackages_optimized,
            "resource_allocation": self._process_resources_optimized,
            "risk_assessment": self._process_risks_optimized,
            "timeline_planning": self._process_timeline_optimized
        }
        
        if phase not in phase_handlers:
            raise ValueError(f"Ungueltige Phase: {phase}")
            
        result = await phase_handlers[phase](phase_data)
        
        await self.update_state("processing", {
            "phase": phase,
            "result": result,
            "total_token_savings": self.token_savings
        })
        
        return result
        
    async def _process_workpackages_optimized(self, workpackage_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Workpackage-Verarbeitung."""
        current_state = await self.get_current_state()
        workpackages = current_state["data"]["workpackages"]
        
        # Dependency-Analyse ohne LLM (0 Tokens)
        dependencies = await self.math_agent.analyze_dependencies(workpackages)
        self.agent_delegations += 1
        self.token_savings += 600
        
        # Komplexitäts-Bewertung ohne LLM (0 Tokens)
        complexity_scores = await self.math_agent.calculate_complexity_scores(workpackages)
        self.agent_delegations += 1
        self.token_savings += 300
        
        # Template-basierte Verfeinerung (0 Tokens)
        refined_workpackages = await self.template_agent.refine_workpackages(
            workpackages, dependencies, complexity_scores
        )
        self.agent_delegations += 1
        self.token_savings += 500
        
        return {
            "status": "workpackages_optimized",
            "refined_workpackages": refined_workpackages,
            "dependencies": dependencies,
            "complexity_scores": complexity_scores,
            "token_savings": self.token_savings,
            "agent_delegations": self.agent_delegations
        }
        
    async def _process_resources_optimized(self, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Ressourcenzuweisung."""
        current_state = await self.get_current_state()
        workpackages = current_state["data"]["workpackages"]
        
        # Automatische Ressourcenzuweisung ohne LLM (0 Tokens)
        resource_allocation = await self.resource_agent.allocate_resources(
            workpackages, 
            resource_data.get("available_resources", {})
        )
        self.agent_delegations += 1
        self.token_savings += 700
        
        # Kapazitäts-Berechnung ohne LLM (0 Tokens)
        capacity_analysis = await self.math_agent.analyze_capacity(
            resource_allocation
        )
        self.agent_delegations += 1
        self.token_savings += 300
        
        # Optimierungsvorschläge ohne LLM (0 Tokens)
        optimization_suggestions = await self.resource_agent.suggest_optimizations(
            resource_allocation, capacity_analysis
        )
        self.agent_delegations += 1
        self.token_savings += 400
        
        return {
            "status": "resources_allocated",
            "resource_allocation": resource_allocation,
            "capacity_analysis": capacity_analysis,
            "optimization_suggestions": optimization_suggestions,
            "token_savings": self.token_savings
        }
        
    async def _process_risks_optimized(self, risk_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Risikobewertung."""
        
        # Automatische Risiko-Identifikation ohne LLM (0 Tokens)
        identified_risks = await self.risk_agent.identify_standard_risks(
            risk_data.get("project_context", {})
        )
        self.agent_delegations += 1
        self.token_savings += 600
        
        # Risiko-Scoring ohne LLM (0 Tokens)
        risk_scores = await self.math_agent.calculate_risk_scores(
            identified_risks + risk_data.get("custom_risks", [])
        )
        self.agent_delegations += 1
        self.token_savings += 400
        
        # Mitigation-Templates ohne LLM (0 Tokens)
        mitigation_strategies = await self.template_agent.generate_mitigation_strategies(
            risk_scores
        )
        self.agent_delegations += 1
        self.token_savings += 500
        
        return {
            "status": "risks_assessed",
            "identified_risks": identified_risks,
            "risk_scores": risk_scores,
            "mitigation_strategies": mitigation_strategies,
            "total_token_savings": self.token_savings
        }
        
    async def _process_timeline_optimized(self, timeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimierte Zeitplanung."""
        current_state = await self.get_current_state()
        workpackages = current_state["data"]["workpackages"]
        
        # Automatische Timeline-Berechnung ohne LLM (0 Tokens)
        timeline_calculation = await self.math_agent.calculate_project_timeline(
            workpackages,
            timeline_data.get("constraints", {})
        )
        self.agent_delegations += 1
        self.token_savings += 500
        
        # Critical Path Analysis ohne LLM (0 Tokens)
        critical_path = await self.math_agent.find_critical_path(
            workpackages, timeline_calculation
        )
        self.agent_delegations += 1
        self.token_savings += 400
        
        # Milestone-Generierung ohne LLM (0 Tokens)
        milestones = await self.template_agent.generate_milestones(
            timeline_calculation, critical_path
        )
        self.agent_delegations += 1
        self.token_savings += 300
        
        return {
            "status": "timeline_created",
            "timeline": timeline_calculation,
            "critical_path": critical_path,
            "milestones": milestones,
            "final_token_savings": self.token_savings,
            "total_agent_delegations": self.agent_delegations
        }

class MathAgent:
    """Agent für mathematische Berechnungen ohne LLM."""
    
    async def estimate_efforts(self, workpackages: List[Dict[str, Any]]) -> Dict[str, int]:
        """Schätzt Aufwände basierend auf Regeln."""
        efforts = {}
        
        for wp in workpackages:
            description = wp.get("description", "").lower()
            category = wp.get("category", "general")
            
            # Regel-basierte Aufwandsschätzung
            base_effort = {
                "frontend": 16,
                "backend": 20,
                "database": 12,
                "testing": 8,
                "documentation": 4,
                "general": 12
            }.get(category, 12)
            
            # Komplexitätsfaktoren
            complexity_factor = 1.0
            if any(word in description for word in ["complex", "advanced", "integration"]):
                complexity_factor = 1.5
            elif any(word in description for word in ["simple", "basic", "standard"]):
                complexity_factor = 0.8
                
            efforts[wp.get("id", "")] = int(base_effort * complexity_factor)
            
        return efforts
        
    async def analyze_dependencies(self, workpackages: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Analysiert Abhängigkeiten zwischen Workpackages."""
        dependencies = {}
        
        for wp in workpackages:
            wp_id = wp.get("id", "")
            wp_category = wp.get("category", "")
            dependencies[wp_id] = []
            
            # Regel-basierte Abhängigkeiten
            if wp_category == "frontend":
                # Frontend braucht Backend APIs
                backend_wps = [w.get("id", "") for w in workpackages if w.get("category") == "backend"]
                dependencies[wp_id].extend(backend_wps)
                
            elif wp_category == "testing":
                # Testing braucht Implementation
                impl_wps = [w.get("id", "") for w in workpackages if w.get("category") in ["frontend", "backend"]]
                dependencies[wp_id].extend(impl_wps)
                
        return dependencies
        
    async def calculate_complexity_scores(self, workpackages: List[Dict[str, Any]]) -> Dict[str, int]:
        """Berechnet Komplexitäts-Scores."""
        scores = {}
        
        for wp in workpackages:
            description = wp.get("description", "").lower()
            score = 5  # Basis-Score
            
            # Komplexitätsindikatoren
            if any(word in description for word in ["ai", "machine learning", "algorithm"]):
                score += 3
            if any(word in description for word in ["integration", "api", "microservice"]):
                score += 2
            if any(word in description for word in ["security", "authentication", "encryption"]):
                score += 2
            if any(word in description for word in ["performance", "optimization", "scaling"]):
                score += 2
                
            scores[wp.get("id", "")] = min(score, 10)  # Max 10
            
        return scores
        
    async def analyze_capacity(self, resource_allocation: Dict[str, Any]) -> Dict[str, Any]:
        """Analysiert Kapazitäten."""
        analysis = {
            "utilization_by_resource": {},
            "overallocated_resources": [],
            "underutilized_resources": [],
            "total_capacity": 0,
            "total_demand": 0
        }
        
        for resource, allocation in resource_allocation.items():
            if isinstance(allocation, dict):
                capacity = allocation.get("capacity", 100)
                demand = allocation.get("demand", 0)
                utilization = (demand / capacity * 100) if capacity > 0 else 0
                
                analysis["utilization_by_resource"][resource] = utilization
                analysis["total_capacity"] += capacity
                analysis["total_demand"] += demand
                
                if utilization > 100:
                    analysis["overallocated_resources"].append(resource)
                elif utilization < 50:
                    analysis["underutilized_resources"].append(resource)
                    
        return analysis
        
    async def calculate_risk_scores(self, risks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Berechnet Risiko-Scores."""
        scored_risks = []
        
        for risk in risks:
            probability = risk.get("probability", 5)
            impact = risk.get("impact", 5)
            
            # Risiko-Score = Wahrscheinlichkeit  Impact
            risk_score = probability * impact
            
            # Kategorisierung
            if risk_score >= 20:
                severity = "critical"
            elif risk_score >= 12:
                severity = "high"
            elif risk_score >= 6:
                severity = "medium"
            else:
                severity = "low"
                
            scored_risks.append({
                **risk,
                "risk_score": risk_score,
                "severity": severity,
                "priority": "immediate" if risk_score >= 20 else "high" if risk_score >= 12 else "normal"
            })
            
        return sorted(scored_risks, key=lambda x: x["risk_score"], reverse=True)
        
    async def calculate_project_timeline(
        self, 
        workpackages: List[Dict[str, Any]], 
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Berechnet Projekt-Timeline."""
        
        total_effort = sum(wp.get("estimated_hours", 16) for wp in workpackages)
        team_size = constraints.get("team_size", 5)
        working_hours_per_day = constraints.get("working_hours_per_day", 8)
        buffer_factor = constraints.get("buffer_factor", 1.3)
        
        # Berechnung
        total_person_days = (total_effort * buffer_factor) / working_hours_per_day
        project_days = total_person_days / team_size
        
        # Start-/Enddatum
        start_date = datetime.now()
        end_date = start_date + timedelta(days=project_days)
        
        return {
            "total_effort_hours": total_effort,
            "total_person_days": round(total_person_days, 1),
            "project_duration_days": round(project_days, 1),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "team_size": team_size,
            "buffer_included": f"{int((buffer_factor-1)*100)}%"
        }
        
    async def find_critical_path(
        self, 
        workpackages: List[Dict[str, Any]], 
        timeline: Dict[str, Any]
    ) -> List[str]:
        """Findet kritischen Pfad."""
        # Vereinfachte Critical Path Analyse
        critical_wps = []
        
        for wp in workpackages:
            # Workpackages mit hohem Aufwand sind kritisch
            effort = wp.get("estimated_hours", 16)
            if effort >= 20:
                critical_wps.append(wp.get("id", ""))
                
        return critical_wps

class PlanningTemplateAgent:
    """Agent für Planungs-Templates ohne LLM."""
    
    async def generate_workpackages(self, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generiert Workpackages aus Requirements."""
        workpackages = []
        
        for i, req in enumerate(requirements):
            description = req.get("description", "")
            
            # Automatische Kategorisierung
            category = self._categorize_requirement(description)
            
            wp = {
                "id": f"wp_{i+1:03d}",
                "name": f"Workpackage {i+1}",
                "description": description,
                "category": category,
                "status": "planned",
                "estimated_hours": self._estimate_hours_by_category(category),
                "priority": req.get("priority", "medium"),
                "acceptance_criteria": self._generate_acceptance_criteria(category),
                "template_used": f"{category}_workpackage"
            }
            
            workpackages.append(wp)
            
        return workpackages
        
    def _categorize_requirement(self, description: str) -> str:
        """Kategorisiert Requirement automatisch."""
        desc_lower = description.lower()
        
        if any(word in desc_lower for word in ["ui", "interface", "frontend", "user"]):
            return "frontend"
        elif any(word in desc_lower for word in ["api", "backend", "server", "database"]):
            return "backend"
        elif any(word in desc_lower for word in ["test", "quality", "validation"]):
            return "testing"
        elif any(word in desc_lower for word in ["doc", "documentation", "manual"]):
            return "documentation"
        else:
            return "general"
            
    def _estimate_hours_by_category(self, category: str) -> int:
        """Schätzt Stunden nach Kategorie."""
        return {
            "frontend": 16,
            "backend": 20,
            "testing": 8,
            "documentation": 4,
            "general": 12
        }.get(category, 12)
        
    def _generate_acceptance_criteria(self, category: str) -> List[str]:
        """Generiert Acceptance Criteria nach Kategorie."""
        criteria_templates = {
            "frontend": [
                "UI is responsive on all devices",
                "All user interactions work correctly",
                "Design matches specifications"
            ],
            "backend": [
                "API endpoints return correct responses",
                "Data validation works properly",
                "Performance meets requirements"
            ],
            "testing": [
                "All test cases pass",
                "Code coverage >= 80%",
                "No critical bugs found"
            ],
            "documentation": [
                "Documentation is complete",
                "All examples work",
                "Formatting is consistent"
            ]
        }
        
        return criteria_templates.get(category, ["Requirements are met", "Quality standards achieved"])
        
    async def refine_workpackages(
        self, 
        workpackages: List[Dict[str, Any]], 
        dependencies: Dict[str, List[str]], 
        complexity_scores: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """Verfeinert Workpackages mit zusätzlichen Informationen."""
        
        for wp in workpackages:
            wp_id = wp.get("id", "")
            
            # Abhängigkeiten hinzufügen
            wp["dependencies"] = dependencies.get(wp_id, [])
            
            # Komplexitäts-Score hinzufügen
            wp["complexity_score"] = complexity_scores.get(wp_id, 5)
            
            # Risiko-Level basierend auf Komplexität
            complexity = wp["complexity_score"]
            if complexity >= 8:
                wp["risk_level"] = "high"
            elif complexity >= 6:
                wp["risk_level"] = "medium"
            else:
                wp["risk_level"] = "low"
                
            # Template-basierte Verfeinerung
            wp["refinement_applied"] = True
            wp["last_updated"] = datetime.utcnow().isoformat()
            
        return workpackages
        
    async def generate_mitigation_strategies(self, risk_scores: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Generiert Mitigation-Strategien aus Templates."""
        strategies = {}
        
        strategy_templates = {
            "technical": [
                "Implement additional testing",
                "Add code reviews",
                "Create fallback solutions",
                "Increase monitoring"
            ],
            "resource": [
                "Cross-train team members",
                "Identify backup resources",
                "Adjust timeline if needed",
                "Prioritize critical tasks"
            ],
            "schedule": [
                "Add buffer time",
                "Parallelize tasks where possible",
                "Identify fast-track options",
                "Regular progress reviews"
            ]
        }
        
        for risk in risk_scores:
            risk_type = risk.get("type", "technical")
            risk_id = risk.get("id", "")
            
            # Wähle passende Template-Strategien
            if risk_type in strategy_templates:
                strategies[risk_id] = strategy_templates[risk_type][:2]  # Top 2 Strategien
            else:
                strategies[risk_id] = strategy_templates["technical"][:2]
                
        return strategies
        
    async def generate_milestones(
        self, 
        timeline: Dict[str, Any], 
        critical_path: List[str]
    ) -> List[Dict[str, Any]]:
        """Generiert Meilensteine basierend auf Timeline."""
        project_days = timeline.get("project_duration_days", 30)
        start_date = datetime.fromisoformat(timeline["start_date"])
        
        milestones = []
        
        # Template-basierte Meilensteine
        milestone_templates = [
            {"name": "Project Kickoff", "percentage": 0},
            {"name": "Requirements Finalized", "percentage": 15},
            {"name": "Architecture Complete", "percentage": 25},
            {"name": "Development 50% Complete", "percentage": 50},
            {"name": "Testing Phase Start", "percentage": 75},
            {"name": "Project Completion", "percentage": 100}
        ]
        
        for template in milestone_templates:
            milestone_date = start_date + timedelta(
                days=project_days * template["percentage"] / 100
            )
            
            milestone = {
                "name": template["name"],
                "date": milestone_date.isoformat(),
                "percentage": template["percentage"],
                "critical": template["percentage"] in [25, 50, 75],  # Kritische Meilensteine
                "template_generated": True
            }
            
            milestones.append(milestone)
            
        return milestones

class ResourceAgent:
    """Agent für Ressourcenverwaltung ohne LLM."""
    
    async def allocate_resources(
        self, 
        workpackages: List[Dict[str, Any]], 
        available_resources: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Automatische Ressourcenzuweisung."""
        allocation = {}
        
        # Kategorisiere Workpackages nach benötigten Skills
        skill_requirements = {
            "frontend_developer": [],
            "backend_developer": [],
            "tester": [],
            "project_manager": []
        }
        
        for wp in workpackages:
            category = wp.get("category", "general")
            
            if category == "frontend":
                skill_requirements["frontend_developer"].append(wp["id"])
            elif category == "backend":
                skill_requirements["backend_developer"].append(wp["id"])
            elif category == "testing":
                skill_requirements["tester"].append(wp["id"])
            else:
                skill_requirements["project_manager"].append(wp["id"])
                
        # Zuweisungslogik
        for skill, wp_ids in skill_requirements.items():
            available = available_resources.get(skill, {}).get("count", 1)
            required_hours = sum(
                next(wp.get("estimated_hours", 16) for wp in workpackages if wp["id"] == wp_id)
                for wp_id in wp_ids
            )
            
            allocation[skill] = {
                "workpackages": wp_ids,
                "available_resources": available,
                "required_hours": required_hours,
                "capacity": available * 40 * 4,  # 40h/week * 4 weeks
                "demand": required_hours,
                "utilization_percent": (required_hours / (available * 40 * 4) * 100) if available > 0 else 0
            }
            
        return allocation
        
    async def suggest_optimizations(
        self, 
        resource_allocation: Dict[str, Any], 
        capacity_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Schlägt Optimierungen vor."""
        suggestions = []
        
        overallocated = capacity_analysis.get("overallocated_resources", [])
        underutilized = capacity_analysis.get("underutilized_resources", [])
        
        # Optimierungsvorschläge für Überallokation
        for resource in overallocated:
            suggestions.append({
                "type": "overallocation",
                "resource": resource,
                "suggestion": f"Redistribute workload from {resource} or add additional resources",
                "priority": "high",
                "impact": "schedule_delay_prevention"
            })
            
        # Optimierungsvorschläge für Unterauslastung
        for resource in underutilized:
            suggestions.append({
                "type": "underutilization",
                "resource": resource,
                "suggestion": f"Assign additional tasks to {resource} or cross-train for other skills",
                "priority": "medium",
                "impact": "efficiency_improvement"
            })
            
        return suggestions

class RiskAgent:
    """Agent für Risikomanagement ohne LLM."""
    
    async def identify_standard_risks(self, project_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identifiziert Standard-Projektrisiken."""
        
        standard_risks = [
            {
                "id": "risk_001",
                "name": "Resource Availability",
                "description": "Key team members may become unavailable",
                "type": "resource",
                "probability": 6,
                "impact": 7,
                "category": "human_resources"
            },
            {
                "id": "risk_002", 
                "name": "Technical Complexity",
                "description": "Underestimation of technical challenges",
                "type": "technical",
                "probability": 7,
                "impact": 6,
                "category": "technical"
            },
            {
                "id": "risk_003",
                "name": "Scope Creep",
                "description": "Requirements may expand during development",
                "type": "scope",
                "probability": 8,
                "impact": 5,
                "category": "project_management"
            },
            {
                "id": "risk_004",
                "name": "Integration Issues",
                "description": "Problems with system integration",
                "type": "technical",
                "probability": 5,
                "impact": 7,
                "category": "technical"
            }
        ]
        
        # Kontextbasierte Risiko-Anpassung
        team_size = project_context.get("team_size", 5)
        project_duration = project_context.get("duration_weeks", 12)
        
        # Anpassung basierend auf Projektgröße
        if team_size < 3:
            standard_risks[0]["probability"] = 8  # Höheres Risiko bei kleinem Team
        
        if project_duration > 20:
            standard_risks[2]["probability"] = 9  # Höheres Scope Creep Risiko bei langen Projekten
            
        return standard_risks

# Export optimierter Modus
__all__ = ["OptimizedPlanMode"]
