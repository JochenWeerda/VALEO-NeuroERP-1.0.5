"""
🧠 VALEO NeuroERP - Database Mapping Layer
==========================================
Mapping-Layer für bestehende PostgreSQL-Datenbankfelder
Erstellt: 2025-07-23
Status: NeuroFlow-Integration
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# ENUMS UND DATACLASSES
# =====================================================

class DatabaseSchema(str, Enum):
    """Verfügbare Datenbank-Schemas"""
    CRM = "crm"
    EINKAUF = "einkauf"
    QUALITAET = "qualitaet"
    CHARGEN = "chargen"
    PERSONAL = "personal"
    PRODUKTION = "produktion"
    LAGER = "lager"
    VERKAUF = "verkauf"
    FINANZEN = "finanzen"
    ASSETS = "assets"
    PROJEKTE = "projekte"
    DOKUMENTE = "dokumente"
    REPORTING = "reporting"

class FieldMappingType(str, Enum):
    """Mapping-Typen für Datenbankfelder"""
    DIRECT = "direct"           # Direkte 1:1 Zuordnung
    TRANSFORM = "transform"     # Transformation erforderlich
    CALCULATED = "calculated"   # Berechnetes Feld
    AGGREGATED = "aggregated"   # Aggregiertes Feld
    VIRTUAL = "virtual"         # Virtuelles Feld (nicht in DB)

@dataclass
class FieldMapping:
    """Einzelnes Feld-Mapping"""
    neuroflow_field: str
    database_field: str
    database_schema: DatabaseSchema
    database_table: str
    mapping_type: FieldMappingType
    transform_function: Optional[str] = None
    default_value: Any = None
    description: str = ""

@dataclass
class TableMapping:
    """Tabellen-Mapping"""
    neuroflow_table: str
    database_schema: DatabaseSchema
    database_table: str
    field_mappings: List[FieldMapping]
    description: str = ""

# =====================================================
# FELD-MAPPINGS DEFINIEREN
# =====================================================

class DatabaseFieldMapper:
    """Hauptklasse für Datenbankfeld-Mapping"""
    
    def __init__(self):
        self.mappings: Dict[str, TableMapping] = {}
        self._initialize_mappings()
    
    def _initialize_mappings(self):
        """Initialisiert alle Feld-Mappings basierend auf der Analyse-Matrix"""
        
        # =====================================================
        # 1. LIEFERANTENSTAMMDATEN MAPPING
        # =====================================================
        
        supplier_mappings = [
            # Grunddaten - Direkte Zuordnung
            FieldMapping(
                neuroflow_field="supplier_number",
                database_field="lieferant_nr",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Lieferantennummer"
            ),
            FieldMapping(
                neuroflow_field="company_name",
                database_field="firmenname",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Firmenname"
            ),
            FieldMapping(
                neuroflow_field="contact_person",
                database_field="ansprechpartner",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Ansprechpartner"
            ),
            FieldMapping(
                neuroflow_field="phone",
                database_field="telefon",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Telefonnummer"
            ),
            FieldMapping(
                neuroflow_field="email",
                database_field="email",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="E-Mail-Adresse"
            ),
            FieldMapping(
                neuroflow_field="website",
                database_field="webseite",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Website"
            ),
            FieldMapping(
                neuroflow_field="tax_number",
                database_field="steuernummer",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Steuernummer"
            ),
            FieldMapping(
                neuroflow_field="vat_number",
                database_field="ust_id",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="USt-ID"
            ),
            
            # Neue Felder (nach Migration verfügbar)
            FieldMapping(
                neuroflow_field="legal_form",
                database_field="rechtsform",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Rechtsform"
            ),
            FieldMapping(
                neuroflow_field="commercial_register",
                database_field="handelsregister",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Handelsregister"
            ),
            FieldMapping(
                neuroflow_field="credit_limit",
                database_field="kreditlimit",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Kreditlimit"
            ),
            
            # Geschäftsdaten - Transformation erforderlich
            FieldMapping(
                neuroflow_field="industry",
                database_field="kategorie",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.TRANSFORM,
                transform_function="transform_industry_category",
                description="Branche (transformiert von Kategorie)"
            ),
            FieldMapping(
                neuroflow_field="payment_terms",
                database_field="zahlungsziel",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Zahlungsziel in Tagen"
            ),
            FieldMapping(
                neuroflow_field="discount_percentage",
                database_field="skonto_prozent",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Skonto-Prozentsatz"
            ),
            FieldMapping(
                neuroflow_field="rating",
                database_field="bewertung",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Bewertung (1-5)"
            ),
            
            # Neue Bewertungsfelder
            FieldMapping(
                neuroflow_field="reliability_score",
                database_field="zuverlaessigkeits_score",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Zuverlässigkeits-Score"
            ),
            FieldMapping(
                neuroflow_field="quality_score",
                database_field="qualitaets_score",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Qualitäts-Score"
            ),
            FieldMapping(
                neuroflow_field="delivery_score",
                database_field="liefer_score",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Liefer-Score"
            ),
            
            # Status - Transformation erforderlich
            FieldMapping(
                neuroflow_field="status",
                database_field="status",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.TRANSFORM,
                transform_function="transform_supplier_status",
                description="Status (transformiert)"
            ),
            
            # Neue Felder
            FieldMapping(
                neuroflow_field="average_delivery_time",
                database_field="durchschnittliche_lieferzeit",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Durchschnittliche Lieferzeit"
            ),
            FieldMapping(
                neuroflow_field="minimum_order_value",
                database_field="mindestbestellwert",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Mindestbestellwert"
            ),
            FieldMapping(
                neuroflow_field="free_shipping_threshold",
                database_field="kostenlose_lieferung_ab",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Kostenlose Lieferung ab"
            ),
            
            # Zertifizierungen
            FieldMapping(
                neuroflow_field="iso_9001",
                database_field="iso_9001",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="ISO 9001 Zertifizierung"
            ),
            FieldMapping(
                neuroflow_field="iso_14001",
                database_field="iso_14001",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="ISO 14001 Zertifizierung"
            ),
            FieldMapping(
                neuroflow_field="other_certifications",
                database_field="weitere_zertifizierungen",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Weitere Zertifizierungen"
            ),
            
            # Flags
            FieldMapping(
                neuroflow_field="is_preferred",
                database_field="ist_bevorzugt",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Bevorzugter Lieferant"
            ),
            FieldMapping(
                neuroflow_field="is_certified",
                database_field="ist_zertifiziert",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Zertifizierter Lieferant"
            ),
            FieldMapping(
                neuroflow_field="is_local",
                database_field="ist_lokal",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Lokaler Lieferant"
            ),
            
            # ERP-Felder
            FieldMapping(
                neuroflow_field="sales_rep",
                database_field="vertriebsmitarbeiter",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Vertriebsmitarbeiter"
            ),
            FieldMapping(
                neuroflow_field="cost_center",
                database_field="kostenstelle",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Kostenstelle"
            ),
            FieldMapping(
                neuroflow_field="notes",
                database_field="notizen",
                database_schema=DatabaseSchema.EINKAUF,
                database_table="lieferanten",
                mapping_type=FieldMappingType.DIRECT,
                description="Notizen"
            ),
        ]
        
        self.mappings["suppliers"] = TableMapping(
            neuroflow_table="suppliers",
            database_schema=DatabaseSchema.EINKAUF,
            database_table="lieferanten",
            field_mappings=supplier_mappings,
            description="Lieferantenstammdaten Mapping"
        )
        
        # =====================================================
        # 2. KUNDENSTAMMDATEN MAPPING
        # =====================================================
        
        customer_mappings = [
            FieldMapping(
                neuroflow_field="customer_number",
                database_field="kunden_nr",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Kundennummer"
            ),
            FieldMapping(
                neuroflow_field="company_name",
                database_field="firmenname",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Firmenname"
            ),
            FieldMapping(
                neuroflow_field="customer_type",
                database_field="kundentyp",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.TRANSFORM,
                transform_function="transform_customer_type",
                description="Kundentyp"
            ),
            FieldMapping(
                neuroflow_field="industry",
                database_field="branche",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Branche"
            ),
            FieldMapping(
                neuroflow_field="revenue_class",
                database_field="umsatzklasse",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Umsatzklasse"
            ),
            FieldMapping(
                neuroflow_field="status",
                database_field="kundenstatus",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.TRANSFORM,
                transform_function="transform_customer_status",
                description="Kundenstatus"
            ),
            FieldMapping(
                neuroflow_field="rating",
                database_field="kundenbewertung",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Kundenbewertung"
            ),
            FieldMapping(
                neuroflow_field="customer_segment",
                database_field="kundenseit",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Kundensegment"
            ),
            FieldMapping(
                neuroflow_field="payment_terms",
                database_field="zahlungsziel",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Zahlungsziel"
            ),
            FieldMapping(
                neuroflow_field="discount_percentage",
                database_field="skonto_prozent",
                database_schema=DatabaseSchema.CRM,
                database_table="kunden",
                mapping_type=FieldMappingType.DIRECT,
                description="Skonto-Prozentsatz"
            ),
        ]
        
        self.mappings["customers"] = TableMapping(
            neuroflow_table="customers",
            database_schema=DatabaseSchema.CRM,
            database_table="kunden",
            field_mappings=customer_mappings,
            description="Kundenstammdaten Mapping"
        )
        
        # =====================================================
        # 3. ARTIKELSTAMMDATEN MAPPING
        # =====================================================
        
        article_mappings = [
            FieldMapping(
                neuroflow_field="article_number",
                database_field="artikel_id",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Artikelnummer"
            ),
            FieldMapping(
                neuroflow_field="article_name",
                database_field="bezeichnung",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Artikelbezeichnung"
            ),
            FieldMapping(
                neuroflow_field="description",
                database_field="beschreibung",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Artikelbeschreibung"
            ),
            FieldMapping(
                neuroflow_field="unit",
                database_field="einheit",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Einheit"
            ),
            FieldMapping(
                neuroflow_field="category",
                database_field="kategorie",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Kategorie"
            ),
            FieldMapping(
                neuroflow_field="price",
                database_field="preis",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Preis"
            ),
            FieldMapping(
                neuroflow_field="currency",
                database_field="waehrung",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Währung"
            ),
            FieldMapping(
                neuroflow_field="stock",
                database_field="stock_quantity",
                database_schema=DatabaseSchema.PRODUKTION,
                database_table="artikel",
                mapping_type=FieldMappingType.DIRECT,
                description="Lagerbestand"
            ),
        ]
        
        self.mappings["articles"] = TableMapping(
            neuroflow_table="articles",
            database_schema=DatabaseSchema.PRODUKTION,
            database_table="artikel",
            field_mappings=article_mappings,
            description="Artikelstammdaten Mapping"
        )
        
        # =====================================================
        # 4. PERSONALSTAMMDATEN MAPPING
        # =====================================================
        
        personnel_mappings = [
            FieldMapping(
                neuroflow_field="employee_number",
                database_field="mitarbeiter_id",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Mitarbeiternummer"
            ),
            FieldMapping(
                neuroflow_field="first_name",
                database_field="vorname",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Vorname"
            ),
            FieldMapping(
                neuroflow_field="last_name",
                database_field="nachname",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Nachname"
            ),
            FieldMapping(
                neuroflow_field="email",
                database_field="email",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="E-Mail"
            ),
            FieldMapping(
                neuroflow_field="department",
                database_field="abteilung",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Abteilung"
            ),
            FieldMapping(
                neuroflow_field="position",
                database_field="position",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Position"
            ),
            FieldMapping(
                neuroflow_field="phone",
                database_field="telefon",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Telefon"
            ),
            FieldMapping(
                neuroflow_field="mobile",
                database_field="mobil",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Mobil"
            ),
            FieldMapping(
                neuroflow_field="status",
                database_field="status",
                database_schema=DatabaseSchema.PERSONAL,
                database_table="mitarbeiter",
                mapping_type=FieldMappingType.DIRECT,
                description="Status"
            ),
        ]
        
        self.mappings["personnel"] = TableMapping(
            neuroflow_table="personnel",
            database_schema=DatabaseSchema.PERSONAL,
            database_table="mitarbeiter",
            field_mappings=personnel_mappings,
            description="Personalstammdaten Mapping"
        )
        
        # =====================================================
        # 5. CHARGENVERWALTUNG MAPPING
        # =====================================================
        
        charge_mappings = [
            FieldMapping(
                neuroflow_field="charge_number",
                database_field="charge_nr",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Chargennummer"
            ),
            FieldMapping(
                neuroflow_field="article_number",
                database_field="artikel_nr",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Artikelnummer"
            ),
            FieldMapping(
                neuroflow_field="article_name",
                database_field="artikel_name",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Artikelname"
            ),
            FieldMapping(
                neuroflow_field="supplier_number",
                database_field="lieferant_nr",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Lieferantennummer"
            ),
            FieldMapping(
                neuroflow_field="supplier_name",
                database_field="lieferant_name",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Lieferantenname"
            ),
            FieldMapping(
                neuroflow_field="production_date",
                database_field="produktionsdatum",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Produktionsdatum"
            ),
            FieldMapping(
                neuroflow_field="expiry_date",
                database_field="verfallsdatum",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Verfallsdatum"
            ),
            FieldMapping(
                neuroflow_field="batch_size",
                database_field="charge_groesse",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Chargegröße"
            ),
            FieldMapping(
                neuroflow_field="unit",
                database_field="einheit",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Einheit"
            ),
            FieldMapping(
                neuroflow_field="quality_status",
                database_field="qualitaets_status",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.TRANSFORM,
                transform_function="transform_quality_status",
                description="Qualitätsstatus"
            ),
            FieldMapping(
                neuroflow_field="vlog_gmo_status",
                database_field="vlog_gmo_status",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="VLOG/GMO Status"
            ),
            FieldMapping(
                neuroflow_field="risk_score",
                database_field="risiko_score",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Risiko-Score"
            ),
            FieldMapping(
                neuroflow_field="quality_score",
                database_field="qualitaets_score",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Qualitäts-Score"
            ),
            FieldMapping(
                neuroflow_field="ki_risk_assessment",
                database_field="ki_risiko_bewertung",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="KI-Risiko-Bewertung"
            ),
            FieldMapping(
                neuroflow_field="quality_prediction",
                database_field="qualitaets_vorhersage",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Qualitäts-Vorhersage"
            ),
            FieldMapping(
                neuroflow_field="anomaly_detection",
                database_field="anomalie_erkennung",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Anomalie-Erkennung"
            ),
            FieldMapping(
                neuroflow_field="recommendations",
                database_field="ki_empfehlungen",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="KI-Empfehlungen"
            ),
            FieldMapping(
                neuroflow_field="workflow_status",
                database_field="workflow_status",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="Workflow-Status"
            ),
            FieldMapping(
                neuroflow_field="n8n_integration",
                database_field="n8n_integration",
                database_schema=DatabaseSchema.CHARGEN,
                database_table="chargen",
                mapping_type=FieldMappingType.DIRECT,
                description="n8n-Integration"
            ),
        ]
        
        self.mappings["charges"] = TableMapping(
            neuroflow_table="charges",
            database_schema=DatabaseSchema.CHARGEN,
            database_table="chargen",
            field_mappings=charge_mappings,
            description="Chargenverwaltung Mapping"
        )
    
    # =====================================================
    # TRANSFORMATIONS-FUNKTIONEN
    # =====================================================
    
    def transform_industry_category(self, category: str) -> str:
        """Transformiert Lieferanten-Kategorie zu Branche"""
        category_mapping = {
            'A': 'Elektronik',
            'B': 'Bürobedarf',
            'C': 'Werkzeuge',
            'DÜNGER': 'Landwirtschaft',
            'FUTTERMITTEL': 'Tiernahrung',
            'PSM': 'Pflanzenschutz',
            'MASCHINEN': 'Maschinenbau',
            'DIENSTLEISTUNG': 'Dienstleistungen'
        }
        return category_mapping.get(category, category)
    
    def transform_supplier_status(self, status: str) -> str:
        """Transformiert Lieferanten-Status"""
        status_mapping = {
            'AKTIV': 'active',
            'INAKTIV': 'inactive',
            'GESPERRT': 'blocked'
        }
        return status_mapping.get(status, status.lower())
    
    def transform_customer_type(self, customer_type: str) -> str:
        """Transformiert Kundentyp"""
        type_mapping = {
            'GESCHAEFTSKUNDE': 'business',
            'PRIVATKUNDE': 'individual',
            'GROSSKUNDE': 'enterprise',
            'TESTKUNDE': 'test'
        }
        return type_mapping.get(customer_type, customer_type.lower())
    
    def transform_customer_status(self, status: str) -> str:
        """Transformiert Kundenstatus"""
        status_mapping = {
            'AKTIV': 'active',
            'INAKTIV': 'inactive',
            'GESPERRT': 'blocked',
            'GELOESCHT': 'deleted'
        }
        return status_mapping.get(status, status.lower())
    
    def transform_quality_status(self, status: str) -> str:
        """Transformiert Qualitätsstatus"""
        status_mapping = {
            'OFFEN': 'open',
            'GEPRUEFT': 'checked',
            'FREIGEGEBEN': 'released',
            'ABGELEHNT': 'rejected',
            'QUARANTAENE': 'quarantine'
        }
        return status_mapping.get(status, status.lower())
    
    # =====================================================
    # MAPPING-METHODEN
    # =====================================================
    
    def get_table_mapping(self, neuroflow_table: str) -> Optional[TableMapping]:
        """Gibt das Mapping für eine NeuroFlow-Tabelle zurück"""
        return self.mappings.get(neuroflow_table)
    
    def get_field_mapping(self, neuroflow_table: str, neuroflow_field: str) -> Optional[FieldMapping]:
        """Gibt das Mapping für ein spezifisches Feld zurück"""
        table_mapping = self.get_table_mapping(neuroflow_table)
        if not table_mapping:
            return None
        
        for field_mapping in table_mapping.field_mappings:
            if field_mapping.neuroflow_field == neuroflow_field:
                return field_mapping
        return None
    
    def map_neuroflow_to_database(self, neuroflow_table: str, neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mappt NeuroFlow-Daten zu Datenbankfeldern"""
        table_mapping = self.get_table_mapping(neuroflow_table)
        if not table_mapping:
            logger.warning(f"Kein Mapping für Tabelle {neuroflow_table} gefunden")
            return neuroflow_data
        
        database_data = {}
        
        for field_mapping in table_mapping.field_mappings:
            neuroflow_value = neuroflow_data.get(field_mapping.neuroflow_field)
            
            if neuroflow_value is not None:
                if field_mapping.mapping_type == FieldMappingType.TRANSFORM and field_mapping.transform_function:
                    # Transformation anwenden
                    transform_func = getattr(self, field_mapping.transform_function, None)
                    if transform_func:
                        database_value = transform_func(neuroflow_value)
                    else:
                        database_value = neuroflow_value
                else:
                    database_value = neuroflow_value
                
                database_data[field_mapping.database_field] = database_value
            elif field_mapping.default_value is not None:
                database_data[field_mapping.database_field] = field_mapping.default_value
        
        return database_data
    
    def map_database_to_neuroflow(self, neuroflow_table: str, database_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mappt Datenbankdaten zu NeuroFlow-Feldern"""
        table_mapping = self.get_table_mapping(neuroflow_table)
        if not table_mapping:
            logger.warning(f"Kein Mapping für Tabelle {neuroflow_table} gefunden")
            return database_data
        
        neuroflow_data = {}
        
        for field_mapping in table_mapping.field_mappings:
            database_value = database_data.get(field_mapping.database_field)
            
            if database_value is not None:
                if field_mapping.mapping_type == FieldMappingType.TRANSFORM and field_mapping.transform_function:
                    # Rücktransformation anwenden (falls implementiert)
                    # Für jetzt verwenden wir den ursprünglichen Wert
                    neuroflow_value = database_value
                else:
                    neuroflow_value = database_value
                
                neuroflow_data[field_mapping.neuroflow_field] = neuroflow_value
        
        return neuroflow_data
    
    def get_available_tables(self) -> List[str]:
        """Gibt alle verfügbaren NeuroFlow-Tabellen zurück"""
        return list(self.mappings.keys())
    
    def get_table_info(self, neuroflow_table: str) -> Optional[Dict[str, Any]]:
        """Gibt Informationen über eine Tabelle zurück"""
        table_mapping = self.get_table_mapping(neuroflow_table)
        if not table_mapping:
            return None
        
        return {
            "neuroflow_table": table_mapping.neuroflow_table,
            "database_schema": table_mapping.database_schema.value,
            "database_table": table_mapping.database_table,
            "description": table_mapping.description,
            "field_count": len(table_mapping.field_mappings),
            "fields": [
                {
                    "neuroflow_field": fm.neuroflow_field,
                    "database_field": fm.database_field,
                    "mapping_type": fm.mapping_type.value,
                    "description": fm.description
                }
                for fm in table_mapping.field_mappings
            ]
        }

# =====================================================
# GLOBALE INSTANZ
# =====================================================

# Globale Instanz des Mappers
field_mapper = DatabaseFieldMapper()

# =====================================================
# HILFS-FUNKTIONEN
# =====================================================

def get_field_mapper() -> DatabaseFieldMapper:
    """Gibt die globale Mapper-Instanz zurück"""
    return field_mapper

def map_supplier_data(neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kurzhilfe für Lieferanten-Mapping"""
    return field_mapper.map_neuroflow_to_database("suppliers", neuroflow_data)

def map_customer_data(neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kurzhilfe für Kunden-Mapping"""
    return field_mapper.map_neuroflow_to_database("customers", neuroflow_data)

def map_article_data(neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kurzhilfe für Artikel-Mapping"""
    return field_mapper.map_neuroflow_to_database("articles", neuroflow_data)

def map_personnel_data(neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kurzhilfe für Personal-Mapping"""
    return field_mapper.map_neuroflow_to_database("personnel", neuroflow_data)

def map_charge_data(neuroflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kurzhilfe für Chargen-Mapping"""
    return field_mapper.map_neuroflow_to_database("charges", neuroflow_data)

# =====================================================
# TEST-FUNKTIONEN
# =====================================================

def test_mapping():
    """Testet das Mapping-System"""
    print("🧠 Teste Database Mapping Layer...")
    
    # Test Lieferanten-Mapping
    test_supplier = {
        "supplier_number": "L202507-001",
        "company_name": "Test GmbH",
        "contact_person": "Max Mustermann",
        "phone": "+49 123 456789",
        "email": "test@example.com",
        "industry": "Elektronik",
        "payment_terms": 30,
        "rating": 4,
        "status": "active"
    }
    
    mapped_supplier = map_supplier_data(test_supplier)
    print(f"✅ Lieferanten-Mapping erfolgreich: {len(mapped_supplier)} Felder gemappt")
    
    # Test Kunden-Mapping
    test_customer = {
        "customer_number": "K202507-001",
        "company_name": "Kunde AG",
        "customer_type": "business",
        "industry": "Technologie",
        "status": "active",
        "rating": 5
    }
    
    mapped_customer = map_customer_data(test_customer)
    print(f"✅ Kunden-Mapping erfolgreich: {len(mapped_customer)} Felder gemappt")
    
    # Verfügbare Tabellen anzeigen
    tables = field_mapper.get_available_tables()
    print(f"✅ Verfügbare Tabellen: {', '.join(tables)}")
    
    print("🎉 Database Mapping Layer Test erfolgreich!")

if __name__ == "__main__":
    test_mapping() 