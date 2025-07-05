"""
Validator-Klassen für die Compliance-Engine
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from .models import (
    ValidationStatus,
    CheckResult,
    ValidationResult,
    ChargenDaten,
    QualitaetsDaten,
    GMPDaten,
    EURegulatoryDaten,
    ComplianceAlert
)

class BaseValidator(ABC):
    """Basis-Klasse für Compliance-Validatoren"""
    
    def __init__(self):
        self.alerts: List[ComplianceAlert] = []
    
    @abstractmethod
    async def validate(self, batch_data: Dict[str, Any]) -> ValidationResult:
        """Führt die Compliance-Validierung durch"""
        pass
    
    def _create_check_result(
        self,
        name: str,
        status: ValidationStatus,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> CheckResult:
        """Erstellt ein CheckResult-Objekt"""
        return CheckResult(
            name=name,
            status=status,
            message=message,
            details=details
        )

    def add_alert(self, typ: str, beschreibung: str, schweregrad: int) -> None:
        """Fügt einen neuen Alert hinzu"""
        alert = ComplianceAlert(
            alert_typ=typ,
            beschreibung=beschreibung,
            schweregrad=schweregrad
        )
        self.alerts.append(alert)

class QSValidator(BaseValidator):
    """Validator für QS-Standard"""
    
    async def validate(self, batch_data: Dict[str, Any]) -> ValidationResult:
        checks: List[CheckResult] = []
        
        # Prüfe Lieferantendaten
        supplier_check = self._check_supplier_data(batch_data)
        checks.append(supplier_check)
        
        # Prüfe Transportbedingungen
        transport_check = self._check_transport_conditions(batch_data)
        checks.append(transport_check)
        
        # Prüfe Qualitätskontrollen
        quality_check = self._check_quality_controls(batch_data)
        checks.append(quality_check)
        
        # Prüfe Hygiene-Protokoll
        hygiene_check = self._check_hygiene_protocol(batch_data)
        checks.append(hygiene_check)
        
        # Bestimme Gesamtstatus
        overall_status = self._determine_overall_status(checks)
        
        return ValidationResult(
            status=overall_status,
            checks=checks,
            responsible_person=batch_data.get("responsible_person", ""),
            digital_signature=batch_data.get("digital_signature", "")
        )
    
    def _check_supplier_data(self, batch_data: Dict[str, Any]) -> CheckResult:
        supplier_data = batch_data.get("supplier_data", {})
        
        if not supplier_data:
            return self._create_check_result(
                name="Lieferantendaten",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Lieferantendaten vorhanden"
            )
        
        required_fields = ["supplier_id", "supplier_batch_refs"]
        missing_fields = [f for f in required_fields if f not in supplier_data]
        
        if missing_fields:
            return self._create_check_result(
                name="Lieferantendaten",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Fehlende Felder: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        return self._create_check_result(
            name="Lieferantendaten",
            status=ValidationStatus.COMPLIANT,
            message="Alle Lieferantendaten vollständig"
        )
    
    def _check_transport_conditions(self, batch_data: Dict[str, Any]) -> CheckResult:
        conditions = batch_data.get("transport_conditions", {})
        
        if not conditions:
            return self._create_check_result(
                name="Transportbedingungen",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Transportbedingungen dokumentiert"
            )
        
        temperature = conditions.get("temperature")
        humidity = conditions.get("humidity")
        
        if temperature is None or humidity is None:
            return self._create_check_result(
                name="Transportbedingungen",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message="Temperatur oder Luftfeuchtigkeit nicht dokumentiert",
                details={"temperature": temperature, "humidity": humidity}
            )
        
        # Prüfe Grenzwerte
        temp_ok = 15 <= temperature <= 25
        humidity_ok = 40 <= humidity <= 60
        
        if not (temp_ok and humidity_ok):
            return self._create_check_result(
                name="Transportbedingungen",
                status=ValidationStatus.NON_COMPLIANT,
                message="Transportbedingungen außerhalb der Grenzwerte",
                details={
                    "temperature": {"value": temperature, "ok": temp_ok},
                    "humidity": {"value": humidity, "ok": humidity_ok}
                }
            )
        
        return self._create_check_result(
            name="Transportbedingungen",
            status=ValidationStatus.COMPLIANT,
            message="Transportbedingungen eingehalten"
        )
    
    def _check_quality_controls(self, batch_data: Dict[str, Any]) -> CheckResult:
        controls = batch_data.get("quality_checks", {})
        
        if not controls:
            return self._create_check_result(
                name="Qualitätskontrollen",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Qualitätskontrollen durchgeführt"
            )
        
        required_checks = ["moisture", "temperature", "contamination"]
        missing_checks = [c for c in required_checks if c not in controls]
        
        if missing_checks:
            return self._create_check_result(
                name="Qualitätskontrollen",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Fehlende Kontrollen: {', '.join(missing_checks)}",
                details={"missing_checks": missing_checks}
            )
        
        # Prüfe Grenzwerte
        moisture = controls["moisture"]
        temperature = controls["temperature"]
        contamination = controls["contamination"]
        
        checks_ok = {
            "moisture": 8 <= moisture <= 12,
            "temperature": 18 <= temperature <= 22,
            "contamination": contamination <= 0.1
        }
        
        failed_checks = [k for k, v in checks_ok.items() if not v]
        
        if failed_checks:
            return self._create_check_result(
                name="Qualitätskontrollen",
                status=ValidationStatus.NON_COMPLIANT,
                message=f"Grenzwerte überschritten: {', '.join(failed_checks)}",
                details={
                    "values": controls,
                    "failed_checks": failed_checks
                }
            )
        
        return self._create_check_result(
            name="Qualitätskontrollen",
            status=ValidationStatus.COMPLIANT,
            message="Alle Qualitätskontrollen bestanden"
        )
    
    def _check_hygiene_protocol(self, batch_data: Dict[str, Any]) -> CheckResult:
        protocol = batch_data.get("hygiene_protocol", {})
        
        if not protocol:
            return self._create_check_result(
                name="Hygiene-Protokoll",
                status=ValidationStatus.NON_COMPLIANT,
                message="Kein Hygiene-Protokoll vorhanden"
            )
        
        required_fields = ["cleaning_date", "responsible", "measures"]
        missing_fields = [f for f in required_fields if f not in protocol]
        
        if missing_fields:
            return self._create_check_result(
                name="Hygiene-Protokoll",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständiges Protokoll: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        # Prüfe Aktualität der Reinigung
        cleaning_date = datetime.fromisoformat(protocol["cleaning_date"])
        days_since_cleaning = (datetime.now() - cleaning_date).days
        
        if days_since_cleaning > 7:
            return self._create_check_result(
                name="Hygiene-Protokoll",
                status=ValidationStatus.NON_COMPLIANT,
                message=f"Letzte Reinigung vor {days_since_cleaning} Tagen",
                details={"days_since_cleaning": days_since_cleaning}
            )
        
        return self._create_check_result(
            name="Hygiene-Protokoll",
            status=ValidationStatus.COMPLIANT,
            message="Hygiene-Protokoll vollständig und aktuell"
        )
    
    def _determine_overall_status(self, checks: List[CheckResult]) -> ValidationStatus:
        """Bestimmt den Gesamtstatus basierend auf den Einzelprüfungen"""
        statuses = [check.status for check in checks]
        
        if ValidationStatus.NON_COMPLIANT in statuses:
            return ValidationStatus.NON_COMPLIANT
        
        if ValidationStatus.PARTIALLY_COMPLIANT in statuses:
            return ValidationStatus.PARTIALLY_COMPLIANT
        
        return ValidationStatus.COMPLIANT

class GMPValidator(BaseValidator):
    """Validator für GMP+-Standard"""
    
    async def validate(self, batch_data: Dict[str, Any]) -> ValidationResult:
        checks: List[CheckResult] = []
        
        # Prüfe HACCP-Dokumentation
        haccp_check = self._check_haccp_documentation(batch_data)
        checks.append(haccp_check)
        
        # Prüfe Gefahrenanalyse
        hazard_check = self._check_hazard_analysis(batch_data)
        checks.append(hazard_check)
        
        # Prüfe Kontrollmaßnahmen
        control_check = self._check_control_measures(batch_data)
        checks.append(control_check)
        
        # Prüfe Prozessüberwachung
        monitoring_check = self._check_process_monitoring(batch_data)
        checks.append(monitoring_check)
        
        # Bestimme Gesamtstatus
        overall_status = self._determine_overall_status(checks)
        
        return ValidationResult(
            status=overall_status,
            checks=checks,
            responsible_person=batch_data.get("responsible_person", ""),
            digital_signature=batch_data.get("digital_signature", "")
        )
    
    def _check_haccp_documentation(self, batch_data: Dict[str, Any]) -> CheckResult:
        haccp = batch_data.get("haccp_documentation", {})
        
        if not haccp:
            return self._create_check_result(
                name="HACCP-Dokumentation",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine HACCP-Dokumentation vorhanden"
            )
        
        required_fields = ["version", "last_update", "critical_points"]
        missing_fields = [f for f in required_fields if f not in haccp]
        
        if missing_fields:
            return self._create_check_result(
                name="HACCP-Dokumentation",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Dokumentation: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        # Prüfe Aktualität
        last_update = datetime.fromisoformat(haccp["last_update"])
        months_since_update = (datetime.now() - last_update).days / 30
        
        if months_since_update > 12:
            return self._create_check_result(
                name="HACCP-Dokumentation",
                status=ValidationStatus.NON_COMPLIANT,
                message=f"HACCP-Dokumentation veraltet ({int(months_since_update)} Monate)",
                details={"months_since_update": months_since_update}
            )
        
        return self._create_check_result(
            name="HACCP-Dokumentation",
            status=ValidationStatus.COMPLIANT,
            message="HACCP-Dokumentation vollständig und aktuell"
        )
    
    def _check_hazard_analysis(self, batch_data: Dict[str, Any]) -> CheckResult:
        analysis = batch_data.get("hazard_analysis", {})
        
        if not analysis:
            return self._create_check_result(
                name="Gefahrenanalyse",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Gefahrenanalyse vorhanden"
            )
        
        required_categories = ["biological", "chemical", "physical"]
        missing_categories = [c for c in required_categories if c not in analysis]
        
        if missing_categories:
            return self._create_check_result(
                name="Gefahrenanalyse",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Fehlende Kategorien: {', '.join(missing_categories)}",
                details={"missing_categories": missing_categories}
            )
        
        # Prüfe ob Gefahren identifiziert wurden
        empty_categories = [c for c in required_categories if not analysis[c]]
        
        if empty_categories:
            return self._create_check_result(
                name="Gefahrenanalyse",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Keine Gefahren identifiziert in: {', '.join(empty_categories)}",
                details={"empty_categories": empty_categories}
            )
        
        return self._create_check_result(
            name="Gefahrenanalyse",
            status=ValidationStatus.COMPLIANT,
            message="Gefahrenanalyse vollständig durchgeführt"
        )
    
    def _check_control_measures(self, batch_data: Dict[str, Any]) -> CheckResult:
        measures = batch_data.get("control_measures", [])
        
        if not measures:
            return self._create_check_result(
                name="Kontrollmaßnahmen",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Kontrollmaßnahmen definiert"
            )
        
        # Prüfe Vollständigkeit der Maßnahmen
        incomplete_measures = []
        for measure in measures:
            if not all(k in measure for k in ["id", "type", "description"]):
                incomplete_measures.append(measure.get("id", "unknown"))
        
        if incomplete_measures:
            return self._create_check_result(
                name="Kontrollmaßnahmen",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Maßnahmen: {', '.join(incomplete_measures)}",
                details={"incomplete_measures": incomplete_measures}
            )
        
        return self._create_check_result(
            name="Kontrollmaßnahmen",
            status=ValidationStatus.COMPLIANT,
            message=f"{len(measures)} Kontrollmaßnahmen definiert"
        )
    
    def _check_process_monitoring(self, batch_data: Dict[str, Any]) -> CheckResult:
        monitoring = batch_data.get("process_monitoring", {})
        
        if not monitoring:
            return self._create_check_result(
                name="Prozessüberwachung",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Prozessüberwachung dokumentiert"
            )
        
        measurements = monitoring.get("measurements", [])
        
        if not measurements:
            return self._create_check_result(
                name="Prozessüberwachung",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message="Keine Messwerte vorhanden"
            )
        
        # Prüfe Vollständigkeit der Messungen
        incomplete_measurements = []
        for measurement in measurements:
            if not all(k in measurement for k in ["parameter", "value"]):
                incomplete_measurements.append(measurement.get("parameter", "unknown"))
        
        if incomplete_measurements:
            return self._create_check_result(
                name="Prozessüberwachung",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Messungen: {', '.join(incomplete_measurements)}",
                details={"incomplete_measurements": incomplete_measurements}
            )
        
        return self._create_check_result(
            name="Prozessüberwachung",
            status=ValidationStatus.COMPLIANT,
            message=f"{len(measurements)} Messungen dokumentiert"
        )
    
    def _determine_overall_status(self, checks: List[CheckResult]) -> ValidationStatus:
        """Bestimmt den Gesamtstatus basierend auf den Einzelprüfungen"""
        statuses = [check.status for check in checks]
        
        if ValidationStatus.NON_COMPLIANT in statuses:
            return ValidationStatus.NON_COMPLIANT
        
        if ValidationStatus.PARTIALLY_COMPLIANT in statuses:
            return ValidationStatus.PARTIALLY_COMPLIANT
        
        return ValidationStatus.COMPLIANT

class EURegValidator(BaseValidator):
    """Validator für EU-Verordnung 178/2002"""
    
    async def validate(self, batch_data: Dict[str, Any]) -> ValidationResult:
        checks: List[CheckResult] = []
        
        # Prüfe EU-Dokumentation
        documentation_check = self._check_eu_documentation(batch_data)
        checks.append(documentation_check)
        
        # Prüfe Notfallverfahren
        emergency_check = self._check_emergency_procedures(batch_data)
        checks.append(emergency_check)
        
        # Prüfe Informationskette
        information_check = self._check_information_chain(batch_data)
        checks.append(information_check)
        
        # Bestimme Gesamtstatus
        overall_status = self._determine_overall_status(checks)
        
        return ValidationResult(
            status=overall_status,
            checks=checks,
            responsible_person=batch_data.get("responsible_person", ""),
            digital_signature=batch_data.get("digital_signature", "")
        )
    
    def _check_eu_documentation(self, batch_data: Dict[str, Any]) -> CheckResult:
        documentation = batch_data.get("eu_documentation", {})
        
        if not documentation:
            return self._create_check_result(
                name="EU-Dokumentation",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine EU-Dokumentation vorhanden"
            )
        
        required_fields = ["declaration", "certificates"]
        missing_fields = [f for f in required_fields if f not in documentation]
        
        if missing_fields:
            return self._create_check_result(
                name="EU-Dokumentation",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Dokumentation: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        # Prüfe Zertifikate
        if not documentation["certificates"]:
            return self._create_check_result(
                name="EU-Dokumentation",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message="Keine Zertifikate hinterlegt"
            )
        
        return self._create_check_result(
            name="EU-Dokumentation",
            status=ValidationStatus.COMPLIANT,
            message="EU-Dokumentation vollständig"
        )
    
    def _check_emergency_procedures(self, batch_data: Dict[str, Any]) -> CheckResult:
        procedures = batch_data.get("emergency_procedures", {})
        
        if not procedures:
            return self._create_check_result(
                name="Notfallverfahren",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Notfallverfahren dokumentiert"
            )
        
        required_fields = ["contact", "procedures"]
        missing_fields = [f for f in required_fields if f not in procedures]
        
        if missing_fields:
            return self._create_check_result(
                name="Notfallverfahren",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Verfahren: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        # Prüfe Kontaktdaten
        if not procedures["contact"]:
            return self._create_check_result(
                name="Notfallverfahren",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message="Keine Notfallkontakte hinterlegt"
            )
        
        # Prüfe Verfahren
        if not procedures["procedures"]:
            return self._create_check_result(
                name="Notfallverfahren",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message="Keine Notfallprozeduren definiert"
            )
        
        return self._create_check_result(
            name="Notfallverfahren",
            status=ValidationStatus.COMPLIANT,
            message="Notfallverfahren vollständig dokumentiert"
        )
    
    def _check_information_chain(self, batch_data: Dict[str, Any]) -> CheckResult:
        chain = batch_data.get("information_chain", {})
        
        if not chain:
            return self._create_check_result(
                name="Informationskette",
                status=ValidationStatus.NON_COMPLIANT,
                message="Keine Informationskette dokumentiert"
            )
        
        required_fields = ["supplier_info", "transport_info", "customer_info"]
        missing_fields = [f for f in required_fields if f not in chain]
        
        if missing_fields:
            return self._create_check_result(
                name="Informationskette",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Unvollständige Informationen: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            )
        
        # Prüfe Vollständigkeit der Informationen
        empty_fields = [f for f in required_fields if not chain[f]]
        
        if empty_fields:
            return self._create_check_result(
                name="Informationskette",
                status=ValidationStatus.PARTIALLY_COMPLIANT,
                message=f"Fehlende Informationen: {', '.join(empty_fields)}",
                details={"empty_fields": empty_fields}
            )
        
        return self._create_check_result(
            name="Informationskette",
            status=ValidationStatus.COMPLIANT,
            message="Informationskette vollständig dokumentiert"
        )
    
    def _determine_overall_status(self, checks: List[CheckResult]) -> ValidationStatus:
        """Bestimmt den Gesamtstatus basierend auf den Einzelprüfungen"""
        statuses = [check.status for check in checks]
        
        if ValidationStatus.NON_COMPLIANT in statuses:
            return ValidationStatus.NON_COMPLIANT
        
        if ValidationStatus.PARTIALLY_COMPLIANT in statuses:
            return ValidationStatus.PARTIALLY_COMPLIANT
        
        return ValidationStatus.COMPLIANT 