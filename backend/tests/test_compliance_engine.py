"""
Unit-Tests für die Compliance-Engine-Komponenten
"""

import pytest
from datetime import datetime
from typing import Dict, Any

from backend.components.compliance_engine.models import (
    ValidationStatus,
    ComplianceType,
    ValidationResult,
    CheckResult,
    ComplianceRecord
)
from backend.components.compliance_engine.validators import (
    QSValidator,
    GMPValidator,
    EURegValidator
)
from backend.components.compliance_engine.engine import ComplianceEngine
from backend.components.compliance_engine.monitoring import QualityMonitoring, AlertManager

# Test-Daten
@pytest.fixture
def valid_batch_data() -> Dict[str, Any]:
    """Erzeugt gültige Test-Chargendaten"""
    return {
        'batch_id': 'TEST-001',
        'supplier_id': 'SUPP-001',
        'delivery_date': datetime.now(),
        'transport_conditions': {
            'temperature': 20.5,
            'humidity': 65
        },
        'supplier_batch_refs': ['REF-001', 'REF-002'],
        'quality_checks': {
            'moisture': 12.5,
            'temperature': 20.5,
            'contamination': 0.01
        },
        'hygiene_protocol': {
            'cleaning_date': datetime.now(),
            'responsible': 'Max Mustermann',
            'measures': ['Desinfektion', 'Reinigung']
        },
        'haccp_documentation': {
            'version': '1.0',
            'last_update': datetime.now(),
            'critical_points': ['CP-001', 'CP-002']
        },
        'hazard_analysis': {
            'biological': ['B-001', 'B-002'],
            'chemical': ['C-001'],
            'physical': ['P-001']
        },
        'control_measures': [
            {'id': 'CM-001', 'type': 'temperature_control'},
            {'id': 'CM-002', 'type': 'moisture_control'}
        ],
        'process_monitoring': {
            'measurements': [
                {'parameter': 'temp', 'value': 20.5},
                {'parameter': 'humidity', 'value': 65}
            ]
        },
        'customer_id': 'CUST-001',
        'transport_docs': ['DOC-001', 'DOC-002'],
        'eu_documentation': {
            'declaration': 'DOC-EU-001',
            'certificates': ['CERT-001']
        },
        'emergency_procedures': {
            'contact': 'emergency@example.com',
            'procedures': ['PROC-001']
        },
        'information_chain': {
            'supplier_info': 'SUPP-INFO-001',
            'transport_info': 'TRANS-INFO-001',
            'customer_info': 'CUST-INFO-001'
        }
    }

@pytest.fixture
def invalid_batch_data() -> Dict[str, Any]:
    """Erzeugt unvollständige Test-Chargendaten"""
    return {
        'batch_id': 'TEST-002',
        'supplier_id': 'SUPP-001',
        # Fehlende Pflichtfelder
    }

# Tests für QS-Validator
class TestQSValidator:
    
    @pytest.mark.asyncio
    async def test_valid_batch(self, valid_batch_data):
        validator = QSValidator()
        result = await validator.validate(valid_batch_data)
        
        assert result.status == ValidationStatus.COMPLIANT
        assert len(result.checks) == 4  # Dokumentation, Rückverfolgbarkeit, QS, Hygiene
        assert all(check.status == ValidationStatus.COMPLIANT for check in result.checks)
        
    @pytest.mark.asyncio
    async def test_invalid_batch(self, invalid_batch_data):
        validator = QSValidator()
        result = await validator.validate(invalid_batch_data)
        
        assert result.status == ValidationStatus.NON_COMPLIANT
        assert any(check.status == ValidationStatus.NON_COMPLIANT for check in result.checks)

# Tests für GMP-Validator
class TestGMPValidator:
    
    @pytest.mark.asyncio
    async def test_valid_batch(self, valid_batch_data):
        validator = GMPValidator()
        result = await validator.validate(valid_batch_data)
        
        assert result.status == ValidationStatus.COMPLIANT
        assert len(result.checks) == 4  # HACCP, Gefahrenanalyse, Kontrollmaßnahmen, Monitoring
        assert all(check.status == ValidationStatus.COMPLIANT for check in result.checks)
        
    @pytest.mark.asyncio
    async def test_invalid_batch(self, invalid_batch_data):
        validator = GMPValidator()
        result = await validator.validate(invalid_batch_data)
        
        assert result.status == ValidationStatus.NON_COMPLIANT
        assert any(check.status == ValidationStatus.NON_COMPLIANT for check in result.checks)

# Tests für EU-Validator
class TestEURegValidator:
    
    @pytest.mark.asyncio
    async def test_valid_batch(self, valid_batch_data):
        validator = EURegValidator()
        result = await validator.validate(valid_batch_data)
        
        assert result.status == ValidationStatus.COMPLIANT
        assert len(result.checks) == 4  # Rückverfolgbarkeit, Dokumentation, Reaktion, Information
        assert all(check.status == ValidationStatus.COMPLIANT for check in result.checks)
        
    @pytest.mark.asyncio
    async def test_invalid_batch(self, invalid_batch_data):
        validator = EURegValidator()
        result = await validator.validate(invalid_batch_data)
        
        assert result.status == ValidationStatus.NON_COMPLIANT
        assert any(check.status == ValidationStatus.NON_COMPLIANT for check in result.checks)

# Tests für Compliance-Engine
class TestComplianceEngine:
    
    @pytest.mark.asyncio
    async def test_validate_batch_all_compliant(self, valid_batch_data):
        engine = ComplianceEngine()
        result = await engine.validate_batch(
            valid_batch_data,
            responsible_person="Test Person",
            digital_signature="TEST-SIG-001"
        )
        
        assert result.status == ValidationStatus.COMPLIANT
        assert len(result.checks) == 12  # 4 Checks pro Validator
        assert all(check.status == ValidationStatus.COMPLIANT for check in result.checks)
        
    @pytest.mark.asyncio
    async def test_validate_batch_partial_compliance(self, valid_batch_data):
        engine = ComplianceEngine()
        # Teste nur QS und GMP+
        result = await engine.validate_batch(
            valid_batch_data,
            compliance_types=[ComplianceType.QS, ComplianceType.GMP],
            responsible_person="Test Person",
            digital_signature="TEST-SIG-001"
        )
        
        assert result.status == ValidationStatus.COMPLIANT
        assert len(result.checks) == 8  # 4 Checks pro Validator
        
    @pytest.mark.asyncio
    async def test_batch_history(self, valid_batch_data):
        engine = ComplianceEngine()
        await engine.validate_batch(
            valid_batch_data,
            responsible_person="Test Person",
            digital_signature="TEST-SIG-001"
        )
        
        history = await engine.get_batch_history(valid_batch_data['batch_id'])
        assert len(history) == 3  # Ein Eintrag pro Validator
        
        # Teste Filterung nach Compliance-Typ
        qs_history = await engine.get_batch_history(
            valid_batch_data['batch_id'],
            compliance_type=ComplianceType.QS
        )
        assert len(qs_history) == 1

# Tests für Quality-Monitoring
class TestQualityMonitoring:
    
    @pytest.mark.asyncio
    async def test_start_monitoring(self):
        monitoring = QualityMonitoring()
        batch_id = "TEST-001"
        parameters = {
            'temperature': {'min': 15, 'max': 25},
            'humidity': {'min': 40, 'max': 70}
        }
        
        await monitoring.start_monitoring(batch_id, parameters)
        status = await monitoring.get_status(batch_id)
        
        assert status['status'] == 'active'
        assert status['parameters'] == parameters
        
    @pytest.mark.asyncio
    async def test_add_measurement_within_limits(self):
        monitoring = QualityMonitoring()
        batch_id = "TEST-001"
        parameters = {
            'temperature': {'min': 15, 'max': 25}
        }
        
        await monitoring.start_monitoring(batch_id, parameters)
        await monitoring.add_measurement(batch_id, 'temperature', 20.0)
        
        status = await monitoring.get_status(batch_id)
        assert len(status['latest_measurements']) == 1
        assert len(status['active_alerts']) == 0
        
    @pytest.mark.asyncio
    async def test_add_measurement_exceeds_limits(self):
        monitoring = QualityMonitoring()
        batch_id = "TEST-001"
        parameters = {
            'temperature': {'min': 15, 'max': 25}
        }
        
        await monitoring.start_monitoring(batch_id, parameters)
        await monitoring.add_measurement(batch_id, 'temperature', 30.0)
        
        status = await monitoring.get_status(batch_id)
        assert len(status['active_alerts']) == 1
        
    @pytest.mark.asyncio
    async def test_stop_monitoring(self):
        monitoring = QualityMonitoring()
        batch_id = "TEST-001"
        parameters = {
            'temperature': {'min': 15, 'max': 25}
        }
        
        await monitoring.start_monitoring(batch_id, parameters)
        await monitoring.stop_monitoring(batch_id)
        
        status = await monitoring.get_status(batch_id)
        assert status['status'] == 'completed'
        assert 'end_time' in status

# Tests für Alert-Manager
class TestAlertManager:
    
    def test_create_alert(self):
        manager = AlertManager()
        alert_id = manager.create_alert(
            batch_id="TEST-001",
            parameter="temperature",
            severity="warning",
            message="Test Alert"
        )
        
        alerts = manager.get_active_alerts()
        assert len(alerts) == 1
        assert alerts[0]['status'] == 'active'
        
    def test_resolve_alert(self):
        manager = AlertManager()
        alert_id = manager.create_alert(
            batch_id="TEST-001",
            parameter="temperature",
            severity="warning",
            message="Test Alert"
        )
        
        manager.resolve_alert(alert_id)
        alerts = manager.get_active_alerts()
        assert len(alerts) == 0 