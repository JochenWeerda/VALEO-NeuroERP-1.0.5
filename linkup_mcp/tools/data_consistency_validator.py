"""
Data Consistency Validator für Edge-System-Tests

Diese Klasse validiert die Datenkonsistenz nach der Synchronisation zwischen
Edge-Knoten und dem zentralen System.
"""

import asyncio
import logging
import random
import time
from typing import Dict, List, Any, Optional, Set, Tuple

logger = logging.getLogger(__name__)

class DataConsistencyValidator:
    """
    Validiert die Datenkonsistenz nach der Synchronisation.
    """
    
    def __init__(self):
        """
        Initialisiert den DataConsistencyValidator.
        """
        self.validation_history = []
        self.entity_types = [
            "invoice", "customer", "order", "product", "inventory", 
            "payment", "shipment", "employee", "supplier"
        ]
        self.constraint_types = [
            "primary_key", "foreign_key", "unique", "check", "not_null"
        ]
    
    async def validate_consistency(self, scenario: Dict[str, Any], sync_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validiert die Datenkonsistenz nach der Synchronisation.
        
        Args:
            scenario: Das Netzwerkszenario, das simuliert wurde
            sync_result: Das Ergebnis der Synchronisation
            
        Returns:
            Dictionary mit Validierungsergebnissen
        """
        logger.info(f"Validiere Datenkonsistenz nach Szenario '{scenario['name']}'")
        
        # Extrahiere relevante Informationen aus dem Synchronisationsergebnis
        synced_items = sync_result.get("items_synced", 0)
        conflicts = sync_result.get("conflicts", 0)
        conflicts_resolved = sync_result.get("conflicts_resolved", 0)
        
        # Berechne die Wahrscheinlichkeit von Inkonsistenzen basierend auf dem Szenario und den Synchronisationsergebnissen
        inconsistency_probability = self._calculate_inconsistency_probability(scenario, sync_result)
        
        # Simuliere Konsistenzprüfungen für verschiedene Entitätstypen
        validation_results = {}
        total_inconsistencies = 0
        critical_inconsistencies = 0
        affected_entities = set()
        
        for entity_type in self.entity_types:
            # Simuliere Konsistenzprüfung für diesen Entitätstyp
            entity_result = await self._validate_entity_type(
                entity_type=entity_type,
                scenario=scenario,
                sync_result=sync_result,
                inconsistency_probability=inconsistency_probability
            )
            
            validation_results[entity_type] = entity_result
            total_inconsistencies += entity_result["inconsistencies"]
            critical_inconsistencies += entity_result["critical_inconsistencies"]
            
            if entity_result["inconsistencies"] > 0:
                affected_entities.add(entity_type)
        
        # Berechne den Integritätswert (0-100)
        integrity_score = self._calculate_integrity_score(
            total_inconsistencies=total_inconsistencies,
            critical_inconsistencies=critical_inconsistencies,
            synced_items=synced_items
        )
        
        # Erstelle das Validierungsergebnis
        result = {
            "scenario": scenario["name"],
            "consistent": total_inconsistencies == 0,
            "inconsistencies": total_inconsistencies,
            "critical_inconsistencies": critical_inconsistencies,
            "affected_entities": list(affected_entities),
            "integrity_score": integrity_score,
            "entity_results": validation_results,
            "constraints_violated": self._collect_violated_constraints(validation_results),
            "referential_integrity_issues": self._collect_referential_integrity_issues(validation_results),
            "business_rule_violations": self._collect_business_rule_violations(validation_results)
        }
        
        # Generiere Empfehlungen basierend auf den Ergebnissen
        result["recommendations"] = self._generate_recommendations(result)
        
        # Speichere das Ergebnis im Verlauf
        self.validation_history.append({
            "timestamp": time.time(),
            "scenario": scenario["name"],
            "result": result
        })
        
        logger.info(f"Konsistenzvalidierung abgeschlossen: {total_inconsistencies} Inkonsistenzen gefunden, "
                   f"{critical_inconsistencies} kritische Inkonsistenzen, Integritätswert: {integrity_score:.2f}")
        
        return result
    
    def get_validation_history(self) -> List[Dict[str, Any]]:
        """
        Gibt den Validierungsverlauf zurück.
        
        Returns:
            Liste von Validierungsergebnissen
        """
        return self.validation_history
    
    async def validate_entity_relationships(self, entity_types: List[str]) -> Dict[str, Any]:
        """
        Validiert die Beziehungen zwischen verschiedenen Entitätstypen.
        
        Args:
            entity_types: Liste der zu validierenden Entitätstypen
            
        Returns:
            Dictionary mit Validierungsergebnissen
        """
        logger.info(f"Validiere Entitätsbeziehungen für {len(entity_types)} Entitätstypen")
        
        relationships = []
        issues = []
        
        # Definiere einige typische Beziehungen zwischen Entitäten
        relationship_definitions = [
            {"from": "order", "to": "customer", "type": "many_to_one", "mandatory": True},
            {"from": "order", "to": "product", "type": "many_to_many", "mandatory": True},
            {"from": "invoice", "to": "order", "type": "many_to_one", "mandatory": True},
            {"from": "payment", "to": "invoice", "type": "many_to_one", "mandatory": True},
            {"from": "shipment", "to": "order", "type": "many_to_one", "mandatory": True},
            {"from": "inventory", "to": "product", "type": "one_to_one", "mandatory": True},
            {"from": "product", "to": "supplier", "type": "many_to_one", "mandatory": False}
        ]
        
        # Filtere Beziehungen basierend auf den angegebenen Entitätstypen
        filtered_relationships = [
            r for r in relationship_definitions
            if r["from"] in entity_types and r["to"] in entity_types
        ]
        
        # Validiere jede Beziehung
        for rel in filtered_relationships:
            # Simuliere die Validierung
            is_valid = random.random() > 0.1  # 90% Wahrscheinlichkeit für gültige Beziehung
            
            relationship = {
                "from_entity": rel["from"],
                "to_entity": rel["to"],
                "relationship_type": rel["type"],
                "mandatory": rel["mandatory"],
                "valid": is_valid
            }
            
            relationships.append(relationship)
            
            if not is_valid:
                issues.append({
                    "from_entity": rel["from"],
                    "to_entity": rel["to"],
                    "issue_type": "missing_reference" if random.random() > 0.5 else "invalid_reference",
                    "severity": "critical" if rel["mandatory"] else "warning",
                    "description": f"Ungültige Beziehung zwischen {rel['from']} und {rel['to']}"
                })
        
        return {
            "relationships": relationships,
            "issues": issues,
            "valid": len(issues) == 0
        }
    
    async def _validate_entity_type(self, entity_type: str, scenario: Dict[str, Any], 
                                   sync_result: Dict[str, Any], inconsistency_probability: float) -> Dict[str, Any]:
        """
        Validiert die Konsistenz für einen bestimmten Entitätstyp.
        
        Args:
            entity_type: Der zu validierende Entitätstyp
            scenario: Das Netzwerkszenario
            sync_result: Das Synchronisationsergebnis
            inconsistency_probability: Die Wahrscheinlichkeit von Inkonsistenzen
            
        Returns:
            Dictionary mit Validierungsergebnissen für diesen Entitätstyp
        """
        # Simuliere die Anzahl der Entitäten dieses Typs
        entity_count = random.randint(10, 100)
        
        # Simuliere Inkonsistenzen basierend auf der Wahrscheinlichkeit
        inconsistency_count = int(entity_count * inconsistency_probability * random.uniform(0.5, 1.5))
        inconsistency_count = min(inconsistency_count, entity_count)  # Nicht mehr Inkonsistenzen als Entitäten
        
        # Simuliere kritische Inkonsistenzen (etwa 20% der Inkonsistenzen sind kritisch)
        critical_inconsistency_count = int(inconsistency_count * 0.2)
        
        # Simuliere verletzte Constraints
        violated_constraints = []
        for _ in range(inconsistency_count):
            constraint_type = random.choice(self.constraint_types)
            is_critical = random.random() < 0.2  # 20% Wahrscheinlichkeit für kritische Verletzung
            
            violated_constraints.append({
                "constraint_type": constraint_type,
                "entity_type": entity_type,
                "field": f"field_{random.randint(1, 5)}",
                "description": f"Verletzung der {constraint_type}-Einschränkung für {entity_type}",
                "severity": "critical" if is_critical else "warning"
            })
        
        # Simuliere referentielle Integritätsprobleme
        referential_integrity_issues = []
        for _ in range(int(inconsistency_count * 0.3)):  # 30% der Inkonsistenzen betreffen referentielle Integrität
            related_entity = random.choice([e for e in self.entity_types if e != entity_type])
            is_critical = random.random() < 0.3  # 30% Wahrscheinlichkeit für kritische Verletzung
            
            referential_integrity_issues.append({
                "entity_type": entity_type,
                "related_entity": related_entity,
                "description": f"Referentielle Integritätsverletzung zwischen {entity_type} und {related_entity}",
                "severity": "critical" if is_critical else "warning"
            })
        
        # Simuliere Geschäftsregelverletzungen
        business_rule_violations = []
        for _ in range(int(inconsistency_count * 0.2)):  # 20% der Inkonsistenzen betreffen Geschäftsregeln
            is_critical = random.random() < 0.1  # 10% Wahrscheinlichkeit für kritische Verletzung
            
            business_rule_violations.append({
                "rule_name": f"rule_{random.randint(1, 10)}",
                "entity_type": entity_type,
                "description": f"Verletzung der Geschäftsregel für {entity_type}",
                "severity": "critical" if is_critical else "warning"
            })
        
        return {
            "entity_type": entity_type,
            "entity_count": entity_count,
            "inconsistencies": inconsistency_count,
            "critical_inconsistencies": critical_inconsistency_count,
            "violated_constraints": violated_constraints,
            "referential_integrity_issues": referential_integrity_issues,
            "business_rule_violations": business_rule_violations
        }
    
    def _calculate_inconsistency_probability(self, scenario: Dict[str, Any], sync_result: Dict[str, Any]) -> float:
        """
        Berechnet die Wahrscheinlichkeit von Inkonsistenzen basierend auf dem Szenario und den Synchronisationsergebnissen.
        
        Args:
            scenario: Das Netzwerkszenario
            sync_result: Das Synchronisationsergebnis
            
        Returns:
            Inkonsistenzwahrscheinlichkeit als Float zwischen 0 und 1
        """
        # Basis-Inkonsistenzwahrscheinlichkeit
        base_probability = 0.01  # 1% Basiswahrscheinlichkeit
        
        # Faktoren, die die Inkonsistenzwahrscheinlichkeit erhöhen
        factors = {
            "packet_loss": 0.001 * scenario.get("packet_loss", 0),  # Höherer Paketverlust = mehr Inkonsistenzen
            "latency": 0.0002 * scenario.get("latency", 0),  # Höhere Latenz = mehr Inkonsistenzen
            "duration": 0.0005 * scenario.get("duration", 0),  # Längere Dauer = mehr Inkonsistenzen
            "conflicts": 0.05 * sync_result.get("conflicts", 0) / max(1, sync_result.get("items_synced", 1)),  # Mehr Konflikte = mehr Inkonsistenzen
            "unresolved_conflicts": 0.1 * (sync_result.get("conflicts", 0) - sync_result.get("conflicts_resolved", 0)) / max(1, sync_result.get("conflicts", 1))  # Ungelöste Konflikte = mehr Inkonsistenzen
        }
        
        # Gesamtwahrscheinlichkeit berechnen (begrenzt auf 0.3 oder 30%)
        probability = min(0.3, base_probability + sum(factors.values()))
        
        return probability
    
    def _calculate_integrity_score(self, total_inconsistencies: int, critical_inconsistencies: int, synced_items: int) -> float:
        """
        Berechnet einen Integritätswert basierend auf den gefundenen Inkonsistenzen.
        
        Args:
            total_inconsistencies: Gesamtanzahl der Inkonsistenzen
            critical_inconsistencies: Anzahl der kritischen Inkonsistenzen
            synced_items: Anzahl der synchronisierten Elemente
            
        Returns:
            Integritätswert zwischen 0 und 100
        """
        # Basiswert
        base_score = 100.0
        
        # Abzug für Inkonsistenzen
        if synced_items > 0:
            inconsistency_ratio = total_inconsistencies / synced_items
            inconsistency_penalty = min(50, 100 * inconsistency_ratio)  # Maximal 50 Punkte Abzug
            base_score -= inconsistency_penalty
        
        # Zusätzlicher Abzug für kritische Inkonsistenzen
        critical_penalty = min(40, critical_inconsistencies * 5)  # 5 Punkte pro kritische Inkonsistenz, maximal 40 Punkte
        base_score -= critical_penalty
        
        # Stellen Sie sicher, dass der Wert zwischen 0 und 100 liegt
        return max(0, min(100, base_score))
    
    def _collect_violated_constraints(self, validation_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Sammelt alle verletzten Constraints aus den Validierungsergebnissen.
        
        Args:
            validation_results: Die Validierungsergebnisse nach Entitätstyp
            
        Returns:
            Liste aller verletzten Constraints
        """
        violated_constraints = []
        
        for entity_type, result in validation_results.items():
            violated_constraints.extend(result.get("violated_constraints", []))
        
        return violated_constraints
    
    def _collect_referential_integrity_issues(self, validation_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Sammelt alle referentiellen Integritätsprobleme aus den Validierungsergebnissen.
        
        Args:
            validation_results: Die Validierungsergebnisse nach Entitätstyp
            
        Returns:
            Liste aller referentiellen Integritätsprobleme
        """
        referential_integrity_issues = []
        
        for entity_type, result in validation_results.items():
            referential_integrity_issues.extend(result.get("referential_integrity_issues", []))
        
        return referential_integrity_issues
    
    def _collect_business_rule_violations(self, validation_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Sammelt alle Geschäftsregelverletzungen aus den Validierungsergebnissen.
        
        Args:
            validation_results: Die Validierungsergebnisse nach Entitätstyp
            
        Returns:
            Liste aller Geschäftsregelverletzungen
        """
        business_rule_violations = []
        
        for entity_type, result in validation_results.items():
            business_rule_violations.extend(result.get("business_rule_violations", []))
        
        return business_rule_violations
    
    def _generate_recommendations(self, result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generiert Empfehlungen basierend auf den Validierungsergebnissen.
        
        Args:
            result: Das Validierungsergebnis
            
        Returns:
            Liste von Empfehlungen
        """
        recommendations = []
        
        # Empfehlungen für kritische Inkonsistenzen
        if result["critical_inconsistencies"] > 0:
            recommendations.append({
                "priority": "high",
                "description": f"Beheben Sie die {result['critical_inconsistencies']} kritischen Inkonsistenzen sofort"
            })
        
        # Empfehlungen für referentielle Integritätsprobleme
        ref_integrity_issues = [i for i in result["referential_integrity_issues"] if i["severity"] == "critical"]
        if ref_integrity_issues:
            recommendations.append({
                "priority": "high",
                "description": f"Überprüfen Sie die referentiellen Beziehungen zwischen {', '.join(set(i['entity_type'] for i in ref_integrity_issues))} und zugehörigen Entitäten"
            })
        
        # Empfehlungen für Geschäftsregelverletzungen
        if result["business_rule_violations"]:
            recommendations.append({
                "priority": "medium",
                "description": f"Überprüfen Sie die Geschäftsregeln für {', '.join(set(v['entity_type'] for v in result['business_rule_violations']))}"
            })
        
        # Allgemeine Empfehlung bei niedrigem Integritätswert
        if result["integrity_score"] < 70:
            recommendations.append({
                "priority": "high",
                "description": "Verbessern Sie die Konfliktlösungsstrategie, um die Datenintegrität zu erhöhen"
            })
        elif result["integrity_score"] < 90:
            recommendations.append({
                "priority": "medium",
                "description": "Optimieren Sie die Synchronisationsprozesse für eine bessere Datenintegrität"
            })
        
        return recommendations