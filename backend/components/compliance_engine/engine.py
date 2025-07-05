"""
Hauptengine für die Compliance-Validierung
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

from .models import (
    ComplianceType,
    ValidationResult,
    ComplianceRecord,
    ValidationStatus,
    ChargenDaten,
    QualitaetsDaten,
    GMPDaten,
    EURegulatoryDaten,
    ComplianceReport,
    ComplianceAlert
)
from .validators import QSValidator, GMPValidator, EURegValidator

class ComplianceEngine:
    """Hauptklasse der Compliance-Engine"""
    
    def __init__(self):
        self.qs_validator = QSValidator()
        self.gmp_validator = GMPValidator()
        self.eu_validator = EURegValidator()
        
    def validate_charge(self, chargen_daten: ChargenDaten) -> ComplianceReport:
        """Führt eine vollständige Chargenvalidierung durch"""
        report = ComplianceReport(
            bericht_id=f"REP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            chargen_daten=chargen_daten
        )
        
        # Validiere alle Parameter
        for param in chargen_daten.parameter:
            if param.grenzwert_min is not None and param.wert < param.grenzwert_min:
                alert = ComplianceAlert(
                    alert_typ="PARAMETER",
                    beschreibung=f"Parameter {param.name} unterschreitet Minimum",
                    schweregrad=3,
                    parameter=param
                )
                report.alerts.append(alert)
                
            if param.grenzwert_max is not None and param.wert > param.grenzwert_max:
                alert = ComplianceAlert(
                    alert_typ="PARAMETER",
                    beschreibung=f"Parameter {param.name} überschreitet Maximum",
                    schweregrad=3,
                    parameter=param
                )
                report.alerts.append(alert)
        
        return report
    
    def validate_qualitaet(self, qs_daten: QualitaetsDaten) -> ComplianceReport:
        """Führt QS-Validierung durch"""
        report = ComplianceReport(
            bericht_id=f"QS-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            qualitaets_daten=qs_daten
        )
        
        self.qs_validator.validate_lieferant(qs_daten)
        self.qs_validator.validate_transport(qs_daten)
        self.qs_validator.validate_hygiene(qs_daten)
        
        report.alerts.extend(self.qs_validator.alerts)
        return report
    
    def validate_gmp(self, gmp_daten: GMPDaten) -> ComplianceReport:
        """Führt GMP-Validierung durch"""
        report = ComplianceReport(
            bericht_id=f"GMP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            gmp_daten=gmp_daten
        )
        
        self.gmp_validator.validate_haccp(gmp_daten)
        self.gmp_validator.validate_kontrollen(gmp_daten)
        self.gmp_validator.validate_monitoring(gmp_daten)
        
        report.alerts.extend(self.gmp_validator.alerts)
        return report
    
    def validate_eu_regulatory(self, eu_daten: EURegulatoryDaten) -> ComplianceReport:
        """Führt EU-Regulatorische Validierung durch"""
        report = ComplianceReport(
            bericht_id=f"EU-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            eu_daten=eu_daten
        )
        
        self.eu_validator.validate_dokumentation(eu_daten)
        self.eu_validator.validate_notfallverfahren(eu_daten)
        self.eu_validator.validate_informationskette(eu_daten)
        
        report.alerts.extend(self.eu_validator.alerts)
        return report
    
    def get_compliance_status(self, report: ComplianceReport) -> Dict[str, Any]:
        """Erstellt eine Zusammenfassung des Compliance-Status"""
        critical_alerts = len([a for a in report.alerts if a.schweregrad >= 3])
        warning_alerts = len([a for a in report.alerts if a.schweregrad == 2])
        info_alerts = len([a for a in report.alerts if a.schweregrad == 1])
        
        return {
            "status": "NOK" if critical_alerts > 0 else "OK",
            "critical_alerts": critical_alerts,
            "warning_alerts": warning_alerts,
            "info_alerts": info_alerts,
            "timestamp": datetime.now().isoformat(),
            "report_id": report.bericht_id
        }

    async def validate_batch(
        self,
        batch_id: str,
        batch_data: Dict[str, Any],
        compliance_types: Optional[List[ComplianceType]] = None,
        responsible_person: str = "",
        digital_signature: str = ""
    ) -> List[ComplianceRecord]:
        """
        Führt die Compliance-Validierung für eine Charge durch
        
        Args:
            batch_id: ID der zu prüfenden Charge
            batch_data: Daten der Charge
            compliance_types: Liste der zu prüfenden Standards (optional)
            responsible_person: Name der verantwortlichen Person
            digital_signature: Digitale Signatur
            
        Returns:
            Liste von ComplianceRecord-Objekten
        """
        if not compliance_types:
            compliance_types = list(ComplianceType)
            
        # Füge Batch-ID zu den Daten hinzu
        batch_data['batch_id'] = batch_id
        batch_data['responsible_person'] = responsible_person
        batch_data['digital_signature'] = digital_signature
        
        results = []
        for compliance_type in compliance_types:
            validator = self.validators[compliance_type]
            validation_result = await validator.validate(batch_data)
            
            record = ComplianceRecord(
                batch_id=batch_id,
                compliance_type=compliance_type,
                validation_result=validation_result,
                created_at=datetime.now()
            )
            results.append(record)
            
        return results
    
    def get_overall_status(self, records: List[ComplianceRecord]) -> ValidationStatus:
        """
        Ermittelt den Gesamtstatus aus mehreren Compliance-Prüfungen
        
        Args:
            records: Liste von ComplianceRecord-Objekten
            
        Returns:
            Gesamtstatus der Validierung
        """
        if not records:
            return ValidationStatus.NON_COMPLIANT
            
        if any(record.validation_result.status == ValidationStatus.NON_COMPLIANT 
               for record in records):
            return ValidationStatus.NON_COMPLIANT
            
        if any(record.validation_result.status == ValidationStatus.PARTIALLY_COMPLIANT 
               for record in records):
            return ValidationStatus.PARTIALLY_COMPLIANT
            
        return ValidationStatus.COMPLIANT
    
    def get_validation_summary(self, records: List[ComplianceRecord]) -> Dict[str, Any]:
        """
        Erstellt eine Zusammenfassung der Validierungsergebnisse
        
        Args:
            records: Liste von ComplianceRecord-Objekten
            
        Returns:
            Dictionary mit der Zusammenfassung
        """
        if not records:
            return {
                'status': ValidationStatus.NON_COMPLIANT,
                'message': 'Keine Validierungsergebnisse vorhanden',
                'timestamp': datetime.now(),
                'details': {}
            }
            
        overall_status = self.get_overall_status(records)
        
        # Sammle Details pro Standard
        details = {}
        for record in records:
            standard = record.compliance_type.value
            result = record.validation_result
            
            details[standard] = {
                'status': result.status,
                'checks_total': len(result.checks),
                'checks_failed': len([c for c in result.checks 
                                    if c.status != ValidationStatus.COMPLIANT]),
                'timestamp': result.timestamp
            }
            
        return {
            'status': overall_status,
            'message': self._generate_summary_message(overall_status, details),
            'timestamp': max(r.created_at for r in records),
            'details': details
        }
    
    def _generate_summary_message(
        self,
        status: ValidationStatus,
        details: Dict[str, Dict[str, Any]]
    ) -> str:
        """
        Generiert eine aussagekräftige Zusammenfassungsnachricht
        
        Args:
            status: Gesamtstatus der Validierung
            details: Details pro Standard
            
        Returns:
            Formatierte Nachricht
        """
        if status == ValidationStatus.COMPLIANT:
            return "Alle Compliance-Prüfungen erfolgreich bestanden"
            
        failed_standards = [
            standard for standard, detail in details.items()
            if detail['status'] != ValidationStatus.COMPLIANT
        ]
        
        if status == ValidationStatus.PARTIALLY_COMPLIANT:
            return f"Teilweise Compliance-Mängel in: {', '.join(failed_standards)}"
            
        return f"Schwerwiegende Compliance-Mängel in: {', '.join(failed_standards)}" 