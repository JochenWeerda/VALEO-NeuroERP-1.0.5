"""
🧠 MCP Charge Management Resource
KI-first Chargenverwaltung für Landhandel-ERP-Systeme
Integration mit n8n Workflows für Automatisierung
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import aiohttp
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel,
)

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ChargeData:
    """Chargendaten-Struktur"""
    charge_number: str
    article_number: str
    article_name: str
    supplier_number: str
    supplier_name: str
    production_date: str
    expiry_date: str
    batch_size: float
    unit: str
    quality_status: str
    qs_milk_relevant: bool
    vlog_gmo_status: str
    eudr_compliant: bool
    sustainability_rapeseed: bool
    protein_content: Optional[float] = None
    fat_content: Optional[float] = None
    moisture_content: Optional[float] = None
    ash_content: Optional[float] = None
    purchase_price: float = 0.0
    currency: str = "EUR"
    warehouse_location: str = ""
    storage_conditions: str = "ambient"
    workflow_status: str = "draft"
    created_by: str = "System"
    created_at: str = ""
    notes: Optional[str] = None

class ChargeManagementResource:
    """MCP Resource für Chargenverwaltung"""
    
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_auth = ("admin", "valeo2024")
        self.api_url = "http://localhost:8000"
        self.charges: Dict[str, ChargeData] = {}
        
    async def initialize(self) -> None:
        """Initialisierung der Charge Management Resource"""
        logger.info("🧠 Initialisiere Charge Management Resource")
        
        # Teste n8n-Verbindung
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.n8n_url}/healthz") as response:
                    if response.status == 200:
                        logger.info("✅ n8n-Verbindung erfolgreich")
                    else:
                        logger.warning("⚠️ n8n-Verbindung problematisch")
        except Exception as e:
            logger.error(f"❌ n8n-Verbindung fehlgeschlagen: {e}")
    
    async def create_charge(self, charge_data: Dict[str, Any]) -> ChargeData:
        """Neue Charge erstellen"""
        try:
            # Chargennummer generieren falls nicht vorhanden
            if not charge_data.get("charge_number"):
                charge_data["charge_number"] = self._generate_charge_number()
            
            # Erstellungsdatum setzen
            charge_data["created_at"] = datetime.now().isoformat()
            
            # Charge erstellen
            charge = ChargeData(**charge_data)
            self.charges[charge.charge_number] = charge
            
            # n8n Workflow auslösen
            await self._trigger_n8n_workflow("charge-processing", charge_data)
            
            logger.info(f"✅ Charge {charge.charge_number} erstellt")
            return charge
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Erstellen der Charge: {e}")
            raise
    
    async def update_charge(self, charge_number: str, updates: Dict[str, Any]) -> ChargeData:
        """Charge aktualisieren"""
        if charge_number not in self.charges:
            raise ValueError(f"Charge {charge_number} nicht gefunden")
        
        charge = self.charges[charge_number]
        
        # Updates anwenden
        for key, value in updates.items():
            if hasattr(charge, key):
                setattr(charge, key, value)
        
        charge.updated_at = datetime.now().isoformat()
        
        # n8n Workflow für Update auslösen
        await self._trigger_n8n_workflow("charge-update", {
            "charge_number": charge_number,
            "updates": updates
        })
        
        logger.info(f"✅ Charge {charge_number} aktualisiert")
        return charge
    
    async def get_charge(self, charge_number: str) -> Optional[ChargeData]:
        """Charge abrufen"""
        return self.charges.get(charge_number)
    
    async def list_charges(self, filters: Optional[Dict[str, Any]] = None) -> List[ChargeData]:
        """Chargen auflisten"""
        charges = list(self.charges.values())
        
        if filters:
            # Filter anwenden
            for key, value in filters.items():
                charges = [c for c in charges if getattr(c, key, None) == value]
        
        return charges
    
    async def delete_charge(self, charge_number: str) -> bool:
        """Charge löschen"""
        if charge_number in self.charges:
            del self.charges[charge_number]
            
            # n8n Workflow für Löschung auslösen
            await self._trigger_n8n_workflow("charge-delete", {
                "charge_number": charge_number
            })
            
            logger.info(f"✅ Charge {charge_number} gelöscht")
            return True
        return False
    
    async def perform_ki_analysis(self, charge_number: str) -> Dict[str, Any]:
        """KI-Analyse für Charge durchführen"""
        charge = await self.get_charge(charge_number)
        if not charge:
            raise ValueError(f"Charge {charge_number} nicht gefunden")
        
        # KI-Analyse-Logik
        risk_score = self._calculate_risk_score(charge)
        quality_prediction = self._predict_quality(risk_score)
        shelf_life_prediction = self._predict_shelf_life(charge)
        anomaly_detection = self._detect_anomalies(charge)
        
        ki_analysis = {
            "risk_score": risk_score,
            "quality_prediction": quality_prediction,
            "shelf_life_prediction": shelf_life_prediction,
            "anomaly_detection": anomaly_detection,
            "trend_analysis": f"Risiko-Score: {risk_score}/100, Qualität: {quality_prediction}",
            "recommendations": self._generate_recommendations(charge, risk_score)
        }
        
        # n8n Workflow für KI-Analyse auslösen
        await self._trigger_n8n_workflow("ki-analysis", {
            "charge_number": charge_number,
            "ki_analysis": ki_analysis
        })
        
        return ki_analysis
    
    async def _trigger_n8n_workflow(self, workflow_name: str, data: Dict[str, Any]) -> bool:
        """n8n Workflow auslösen"""
        try:
            async with aiohttp.ClientSession() as session:
                # Workflow über Webhook auslösen
                webhook_url = f"{self.n8n_url}/webhook/{workflow_name}"
                
                async with session.post(
                    webhook_url,
                    json=data,
                    auth=aiohttp.BasicAuth(*self.n8n_auth),
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        logger.info(f"✅ n8n Workflow {workflow_name} erfolgreich ausgelöst")
                        return True
                    else:
                        logger.warning(f"⚠️ n8n Workflow {workflow_name} fehlgeschlagen: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"❌ Fehler beim Auslösen des n8n Workflows {workflow_name}: {e}")
            return False
    
    def _generate_charge_number(self) -> str:
        """Chargennummer generieren"""
        date = datetime.now()
        year = date.year
        month = f"{date.month:02d}"
        day = f"{date.day:02d}"
        random_suffix = f"{hash(datetime.now()) % 1000:03d}"
        return f"CH{year}{month}{day}-{random_suffix}"
    
    def _calculate_risk_score(self, charge: ChargeData) -> int:
        """Risiko-Score berechnen"""
        risk_score = 50  # Basis-Score
        
        # Qualitätsfaktoren bewerten
        if charge.quality_status == "approved":
            risk_score -= 20
        elif charge.quality_status == "rejected":
            risk_score += 30
        elif charge.quality_status == "quarantine":
            risk_score += 40
        
        # VLOG/GMO Status bewerten
        if charge.vlog_gmo_status == "VLOG":
            risk_score -= 10
        elif charge.vlog_gmo_status == "GMO":
            risk_score += 25
        
        # Analysedaten bewerten
        if charge.protein_content and charge.protein_content > 20:
            risk_score -= 5
        
        if charge.moisture_content and charge.moisture_content > 15:
            risk_score += 10
        
        # Haltbarkeit bewerten
        if charge.expiry_date:
            expiry = datetime.fromisoformat(charge.expiry_date)
            days_until_expiry = (expiry - datetime.now()).days
            if days_until_expiry < 30:
                risk_score += 20
            elif days_until_expiry < 90:
                risk_score += 10
        
        return max(0, min(100, risk_score))
    
    def _predict_quality(self, risk_score: int) -> str:
        """Qualitätsvorhersage basierend auf Risiko-Score"""
        if risk_score < 30:
            return "excellent"
        elif risk_score < 60:
            return "good"
        elif risk_score < 80:
            return "average"
        else:
            return "poor"
    
    def _predict_shelf_life(self, charge: ChargeData) -> int:
        """Haltbarkeitsvorhersage"""
        if charge.production_date and charge.expiry_date:
            production = datetime.fromisoformat(charge.production_date)
            expiry = datetime.fromisoformat(charge.expiry_date)
            return (expiry - production).days
        return 365  # Standard-Haltbarkeit
    
    def _detect_anomalies(self, charge: ChargeData) -> bool:
        """Anomalien erkennen"""
        anomalies = []
        
        # Preis-Anomalie
        if charge.purchase_price > 1000:
            anomalies.append("Hoher Einkaufspreis")
        
        # Chargengröße-Anomalie
        if charge.batch_size > 10000:
            anomalies.append("Sehr große Charge")
        
        # Qualitäts-Anomalie
        if charge.quality_status == "rejected":
            anomalies.append("Qualität abgelehnt")
        
        # VLOG/GMO-Anomalie
        if charge.vlog_gmo_status == "GMO":
            anomalies.append("GVO-haltig")
        
        return len(anomalies) > 0
    
    def _generate_recommendations(self, charge: ChargeData, risk_score: int) -> List[str]:
        """Empfehlungen generieren"""
        recommendations = []
        
        if risk_score > 70:
            recommendations.append("Dringende Qualitätsprüfung erforderlich")
            recommendations.append("Quarantäne-Lagerung empfehlenswert")
        
        if charge.vlog_gmo_status == "unknown":
            recommendations.append("VLOG/GMO-Status klären")
        
        if charge.protein_content and charge.protein_content < 15:
            recommendations.append("Proteingehalt unter Standard")
        
        if charge.moisture_content and charge.moisture_content > 15:
            recommendations.append("Feuchtigkeitsgehalt zu hoch")
        
        if not charge.eudr_compliant:
            recommendations.append("EUDR-Compliance prüfen")
        
        return recommendations

# Globale Instanz
charge_management = ChargeManagementResource()

async def initialize() -> None:
    """MCP Resource initialisieren"""
    await charge_management.initialize()

async def list_resources() -> List[Resource]:
    """Ressourcen auflisten"""
    resources = []
    
    # Chargen als Ressourcen
    charges = await charge_management.list_charges()
    for charge in charges:
        resource = Resource(
            uri=f"charge://{charge.charge_number}",
            name=f"Charge {charge.charge_number}",
            description=f"Charge {charge.charge_number} - {charge.article_name}",
            mimeType="application/json"
        )
        resources.append(resource)
    
    return resources

async def read_resource(uri: str) -> List[TextContent | ImageContent | EmbeddedResource]:
    """Ressource lesen"""
    if uri.startswith("charge://"):
        charge_number = uri.replace("charge://", "")
        charge = await charge_management.get_charge(charge_number)
        
        if charge:
            # KI-Analyse durchführen
            ki_analysis = await charge_management.perform_ki_analysis(charge_number)
            
            # Vollständige Chargendaten mit KI-Analyse
            full_data = {
                **charge.__dict__,
                "ki_analysis": ki_analysis,
                "last_updated": datetime.now().isoformat()
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(full_data, indent=2, ensure_ascii=False)
            )]
    
    return [TextContent(
        type="text",
        text="Ressource nicht gefunden"
    )]

# MCP Server konfigurieren
async def main():
    """Hauptfunktion"""
    # Server initialisieren
    server = stdio_server()
    
    # Resource registrieren
    @server.list_resources()
    async def handle_list_resources() -> List[Resource]:
        return await list_resources()
    
    @server.read_resource()
    async def handle_read_resource(uri: str) -> List[TextContent | ImageContent | EmbeddedResource]:
        return await read_resource(uri)
    
    # Initialisierung
    await initialize()
    
    # Server starten
    async with server.run_session() as session:
        await session.run()

if __name__ == "__main__":
    asyncio.run(main()) 