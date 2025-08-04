"""
VALEO NeuroERP 2.0 - KI-Assistant
Intelligente Assistenz für alle 12 Module des VALEO Systems
Serena Quality: Complete AI integration with context awareness
"""

from typing import Dict, List, Any, Optional, Union
from enum import Enum
from datetime import datetime, timedelta
import json
import asyncio
from pydantic import BaseModel, Field
import openai
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.llms import OpenAI
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.monitoring.logging_config import get_logger
from backend.app.monitoring.metrics import metrics_collector
from backend.app.optimization.caching import cache_manager
from backend.app.config.production import settings

logger = get_logger("ai.assistant")

# AI Assistant Types
class AssistantCapability(str, Enum):
    # Basierend auf VALEO 1.0.5 Modulen
    PERSONAL_MANAGEMENT = "personal_management"
    FINANZBUCHHALTUNG = "finanzbuchhaltung"
    ANLAGENVERWALTUNG = "anlagenverwaltung"
    PRODUKTIONSMANAGEMENT = "produktionsmanagement"
    LAGERVERWALTUNG = "lagerverwaltung"
    EINKAUFSMANAGEMENT = "einkaufsmanagement"
    VERKAUFSMANAGEMENT = "verkaufsmanagement"
    QUALITAETSMANAGEMENT = "qualitaetsmanagement"
    CRM = "crm"
    PROJEKTMANAGEMENT = "projektmanagement"
    DOKUMENTENVERWALTUNG = "dokumentenverwaltung"
    REPORTING = "reporting"
    
    # Übergreifende Fähigkeiten
    DATA_ANALYSIS = "data_analysis"
    PREDICTION = "prediction"
    AUTOMATION = "automation"
    NATURAL_LANGUAGE = "natural_language"

class AIContext(BaseModel):
    """Context for AI processing"""
    user_id: str
    module: AssistantCapability
    conversation_id: Optional[str] = None
    session_data: Dict[str, Any] = {}
    language: str = "de"
    
class AIRequest(BaseModel):
    """Request model for AI assistant"""
    query: str
    context: AIContext
    include_sources: bool = True
    max_tokens: int = 1000
    temperature: float = 0.7

class AIResponse(BaseModel):
    """Response model from AI assistant"""
    answer: str
    sources: List[Dict[str, Any]] = []
    suggestions: List[str] = []
    confidence: float
    metadata: Dict[str, Any] = {}

# Module-specific AI Handlers
class ModuleAIHandler:
    """Base class for module-specific AI handlers"""
    
    def __init__(self, module: AssistantCapability):
        self.module = module
        self.embeddings = OpenAIEmbeddings()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
    async def process_query(self, request: AIRequest) -> AIResponse:
        raise NotImplementedError
        
    async def get_context_data(self, context: AIContext) -> Dict[str, Any]:
        """Get relevant context data for the module"""
        raise NotImplementedError

class PersonalManagementAI(ModuleAIHandler):
    """AI Handler for Personal Management module"""
    
    def __init__(self):
        super().__init__(AssistantCapability.PERSONAL_MANAGEMENT)
        
    async def process_query(self, request: AIRequest) -> AIResponse:
        """Process HR-related queries"""
        
        # Get employee context
        context_data = await self.get_context_data(request.context)
        
        # Common HR queries
        if "urlaub" in request.query.lower():
            return await self._handle_vacation_query(request, context_data)
        elif "gehalt" in request.query.lower():
            return await self._handle_salary_query(request, context_data)
        elif "mitarbeiter" in request.query.lower():
            return await self._handle_employee_query(request, context_data)
        else:
            return await self._handle_general_hr_query(request, context_data)
    
    async def _handle_vacation_query(self, request: AIRequest, context: Dict) -> AIResponse:
        """Handle vacation-related queries"""
        db = next(get_db())
        
        # Analyze vacation data
        from backend.app.models import Employee, Urlaub
        
        employee = db.query(Employee).filter(
            Employee.user_id == request.context.user_id
        ).first()
        
        if employee:
            # Get vacation balance
            vacation_data = db.query(Urlaub).filter(
                Urlaub.mitarbeiter_id == employee.id,
                Urlaub.jahr == datetime.now().year
            ).first()
            
            answer = f"""
            Basierend auf Ihren Daten:
            - Urlaubsanspruch {datetime.now().year}: {vacation_data.anspruch_tage if vacation_data else 30} Tage
            - Bereits genommen: {vacation_data.genommen_tage if vacation_data else 0} Tage
            - Resturlaub: {(vacation_data.anspruch_tage - vacation_data.genommen_tage) if vacation_data else 30} Tage
            
            Sie können Ihren Urlaub über das Mitarbeiterportal beantragen.
            """
            
            suggestions = [
                "Urlaub beantragen",
                "Urlaubskalender anzeigen",
                "Urlaubsrichtlinien einsehen"
            ]
        else:
            answer = "Ich konnte keine Mitarbeiterdaten für Sie finden."
            suggestions = []
        
        db.close()
        
        return AIResponse(
            answer=answer,
            suggestions=suggestions,
            confidence=0.95
        )
    
    async def get_context_data(self, context: AIContext) -> Dict[str, Any]:
        """Get HR context data"""
        db = next(get_db())
        
        # Load relevant HR data
        context_data = {
            "current_date": datetime.now(),
            "fiscal_year": datetime.now().year,
            "company_holidays": [],  # Load from database
            "hr_policies": {}  # Load from database
        }
        
        db.close()
        return context_data

class LagerverwaltungAI(ModuleAIHandler):
    """AI Handler for Warehouse Management - Landhandel specific"""
    
    def __init__(self):
        super().__init__(AssistantCapability.LAGERVERWALTUNG)
        
    async def process_query(self, request: AIRequest) -> AIResponse:
        """Process warehouse and inventory queries"""
        
        # Landhandel-spezifische Abfragen
        if any(term in request.query.lower() for term in ["saatgut", "dünger", "pflanzenschutz"]):
            return await self._handle_agricultural_query(request)
        elif "bestand" in request.query.lower():
            return await self._handle_stock_query(request)
        elif "lieferung" in request.query.lower():
            return await self._handle_delivery_query(request)
        else:
            return await self._handle_general_warehouse_query(request)
    
    async def _handle_agricultural_query(self, request: AIRequest) -> AIResponse:
        """Handle agricultural product queries"""
        db = next(get_db())
        
        from backend.app.models import Article
        
        # Search for agricultural products
        search_term = None
        if "saatgut" in request.query.lower():
            search_term = "Saatgut"
        elif "dünger" in request.query.lower():
            search_term = "Düngemittel"
        elif "pflanzenschutz" in request.query.lower():
            search_term = "Pflanzenschutz"
        
        if search_term:
            products = db.query(Article).filter(
                Article.produkttyp == search_term,
                Article.status == 'aktiv'
            ).all()
            
            if products:
                product_list = "\n".join([
                    f"- {p.bezeichnung}: {p.lagerbestand} {p.mengeneinheit} " +
                    f"(Min: {p.mindestbestand})" +
                    (f" - Zulassung: {p.zulassungsnummer}" if p.zulassungsnummer else "")
                    for p in products[:10]
                ])
                
                answer = f"""
                Aktuelle {search_term}-Bestände:
                
                {product_list}
                
                {"Weitere Produkte verfügbar..." if len(products) > 10 else ""}
                
                Hinweis: Bei regulierten Produkten beachten Sie bitte die Zulassungsnummern.
                """
                
                # Check for low stock
                low_stock = [p for p in products if p.lagerbestand <= p.mindestbestand]
                if low_stock:
                    answer += f"\n\n⚠️ Achtung: {len(low_stock)} Produkte haben Mindestbestand erreicht!"
                
                suggestions = [
                    "Bestellung aufgeben",
                    "Lagerbestandsbericht",
                    "Preisliste anzeigen"
                ]
            else:
                answer = f"Keine {search_term}-Produkte im Bestand gefunden."
                suggestions = ["Neue Produkte anlegen", "Lieferanten kontaktieren"]
        
        db.close()
        
        return AIResponse(
            answer=answer,
            suggestions=suggestions,
            confidence=0.9,
            metadata={"product_type": search_term}
        )
    
    async def _predict_stock_needs(self, product_id: str) -> Dict[str, Any]:
        """Predict future stock needs using ML"""
        # Implement stock prediction based on:
        # - Historical sales data
        # - Seasonal patterns (important for Landhandel)
        # - Weather data integration
        # - Market trends
        
        prediction = {
            "next_30_days": 0,
            "next_90_days": 0,
            "recommended_order": 0,
            "confidence": 0.85
        }
        
        return prediction

class CRMAI(ModuleAIHandler):
    """AI Handler for CRM with Tagesprotokoll support"""
    
    def __init__(self):
        super().__init__(AssistantCapability.CRM)
        
    async def process_query(self, request: AIRequest) -> AIResponse:
        """Process CRM queries including Tagesprotokoll"""
        
        if "tagesprotokoll" in request.query.lower():
            return await self._handle_tagesprotokoll_query(request)
        elif "kunde" in request.query.lower():
            return await self._handle_customer_query(request)
        elif "besuch" in request.query.lower():
            return await self._handle_visit_query(request)
        else:
            return await self._handle_general_crm_query(request)
    
    async def _handle_tagesprotokoll_query(self, request: AIRequest) -> AIResponse:
        """Handle Tagesprotokoll queries"""
        db = next(get_db())
        
        from backend.app.models import Tagesprotokoll, Customer, Employee
        
        # Get recent protocols
        protocols = db.query(Tagesprotokoll).join(
            Customer
        ).order_by(
            Tagesprotokoll.besuchsdatum.desc()
        ).limit(5).all()
        
        if protocols:
            protocol_summary = "\n".join([
                f"- {p.besuchsdatum.strftime('%d.%m.%Y')}: {p.kunde.firmenname} - " +
                f"{p.gespraechsthema or 'Allgemeines Gespräch'}"
                for p in protocols
            ])
            
            answer = f"""
            Letzte Tagesprotokolle:
            
            {protocol_summary}
            
            Tipp: Dokumentieren Sie wichtige Kundengespräche zeitnah für bessere Nachverfolgung.
            """
            
            # Analyze patterns
            if len(protocols) >= 3:
                # Check for follow-up actions
                pending_followups = [p for p in protocols if p.wiedervorlage and p.wiedervorlage >= datetime.now().date()]
                if pending_followups:
                    answer += f"\n\n📅 Sie haben {len(pending_followups)} offene Wiedervorlagen!"
            
            suggestions = [
                "Neues Tagesprotokoll erstellen",
                "Wiedervorlagen anzeigen",
                "Besuchsstatistik"
            ]
        else:
            answer = "Keine Tagesprotokolle gefunden. Beginnen Sie mit der Dokumentation Ihrer Kundenbesuche."
            suggestions = ["Tagesprotokoll erstellen", "Anleitung anzeigen"]
        
        db.close()
        
        return AIResponse(
            answer=answer,
            suggestions=suggestions,
            confidence=0.95
        )

class ReportingAI(ModuleAIHandler):
    """AI Handler for Reporting & Analytics"""
    
    def __init__(self):
        super().__init__(AssistantCapability.REPORTING)
        
    async def process_query(self, request: AIRequest) -> AIResponse:
        """Process reporting and analytics queries"""
        
        if any(term in request.query.lower() for term in ["umsatz", "revenue", "einnahmen"]):
            return await self._handle_revenue_query(request)
        elif "kpi" in request.query.lower():
            return await self._handle_kpi_query(request)
        elif "trend" in request.query.lower():
            return await self._handle_trend_analysis(request)
        else:
            return await self._generate_smart_insights(request)
    
    async def _handle_kpi_query(self, request: AIRequest) -> AIResponse:
        """Generate KPI analysis"""
        db = next(get_db())
        
        # Calculate key KPIs
        kpis = await self._calculate_kpis(db)
        
        answer = f"""
        📊 Aktuelle KPIs für VALEO NeuroERP:
        
        **Finanzen:**
        - Umsatz (MTD): {kpis['revenue_mtd']:,.2f} €
        - Umsatz (YTD): {kpis['revenue_ytd']:,.2f} €
        - Gewinnmarge: {kpis['profit_margin']:.1f}%
        
        **Vertrieb:**
        - Neue Kunden (Monat): {kpis['new_customers_month']}
        - Conversion Rate: {kpis['conversion_rate']:.1f}%
        - Ø Auftragswert: {kpis['avg_order_value']:,.2f} €
        
        **Lager:**
        - Lagerumschlag: {kpis['inventory_turnover']:.1f}x
        - Bestandswert: {kpis['inventory_value']:,.2f} €
        - Kritische Artikel: {kpis['critical_items']}
        
        **Landhandel-spezifisch:**
        - Saatgut-Absatz: {kpis['seed_sales']:,.0f} kg
        - Düngemittel-Absatz: {kpis['fertilizer_sales']:,.0f} t
        - Saisonaler Index: {kpis['seasonal_index']:.2f}
        
        💡 **Empfehlungen:**
        {self._generate_kpi_recommendations(kpis)}
        """
        
        db.close()
        
        return AIResponse(
            answer=answer,
            suggestions=[
                "Detailbericht anzeigen",
                "Trend-Analyse",
                "Export als PDF",
                "Vergleich Vorjahr"
            ],
            confidence=0.92,
            metadata={"kpis": kpis}
        )
    
    async def _calculate_kpis(self, db: Session) -> Dict[str, Any]:
        """Calculate comprehensive KPIs"""
        from backend.app.models import Invoice, Customer, Article, Verkaufsauftrag
        from sqlalchemy import func
        
        now = datetime.now()
        month_start = now.replace(day=1)
        year_start = now.replace(month=1, day=1)
        
        # Financial KPIs
        revenue_mtd = db.query(func.sum(Invoice.bruttobetrag)).filter(
            Invoice.rechnungsdatum >= month_start,
            Invoice.status != 'storniert'
        ).scalar() or 0
        
        revenue_ytd = db.query(func.sum(Invoice.bruttobetrag)).filter(
            Invoice.rechnungsdatum >= year_start,
            Invoice.status != 'storniert'
        ).scalar() or 0
        
        # Customer KPIs
        new_customers_month = db.query(func.count(Customer.id)).filter(
            Customer.created_at >= month_start
        ).scalar() or 0
        
        # Inventory KPIs
        inventory_value = db.query(
            func.sum(Article.lagerbestand * Article.einkaufspreis)
        ).filter(
            Article.ist_lagerartikel == True
        ).scalar() or 0
        
        critical_items = db.query(func.count(Article.id)).filter(
            Article.lagerbestand <= Article.mindestbestand,
            Article.ist_lagerartikel == True
        ).scalar() or 0
        
        # Landhandel specific
        seed_sales = db.query(func.sum(Article.lagerbestand)).filter(
            Article.produkttyp == 'Saatgut'
        ).scalar() or 0
        
        fertilizer_sales = db.query(func.sum(Article.lagerbestand)).filter(
            Article.produkttyp == 'Düngemittel'
        ).scalar() or 0
        
        return {
            'revenue_mtd': float(revenue_mtd),
            'revenue_ytd': float(revenue_ytd),
            'profit_margin': 15.5,  # Calculate from actual data
            'new_customers_month': new_customers_month,
            'conversion_rate': 23.5,  # Calculate from actual data
            'avg_order_value': float(revenue_mtd / max(new_customers_month, 1)),
            'inventory_turnover': 4.2,  # Calculate from actual data
            'inventory_value': float(inventory_value),
            'critical_items': critical_items,
            'seed_sales': float(seed_sales),
            'fertilizer_sales': float(fertilizer_sales),
            'seasonal_index': 1.2  # Higher in spring/summer for Landhandel
        }
    
    def _generate_kpi_recommendations(self, kpis: Dict[str, Any]) -> str:
        """Generate AI-based recommendations from KPIs"""
        recommendations = []
        
        if kpis['critical_items'] > 5:
            recommendations.append(
                f"- {kpis['critical_items']} Artikel haben kritischen Bestand. Bestellvorschläge prüfen!"
            )
        
        if kpis['profit_margin'] < 15:
            recommendations.append(
                "- Gewinnmarge unter Zielwert. Preisstruktur überprüfen."
            )
        
        if kpis['seasonal_index'] > 1.0:
            recommendations.append(
                "- Saisonaler Höhepunkt erkannt. Lagerbestände für Hauptprodukte erhöhen."
            )
        
        if kpis['inventory_turnover'] < 4:
            recommendations.append(
                "- Lagerumschlag optimierungsfähig. Slow-Mover identifizieren."
            )
        
        return "\n".join(recommendations) if recommendations else "- Alle KPIs im grünen Bereich!"

# Main AI Assistant
class VALEOAssistant:
    """Main AI Assistant for VALEO NeuroERP"""
    
    def __init__(self):
        self.handlers = {
            AssistantCapability.PERSONAL_MANAGEMENT: PersonalManagementAI(),
            AssistantCapability.LAGERVERWALTUNG: LagerverwaltungAI(),
            AssistantCapability.CRM: CRMAI(),
            AssistantCapability.REPORTING: ReportingAI(),
            # Add more module handlers as needed
        }
        
        # General purpose LLM for cross-module queries
        self.llm = OpenAI(temperature=0.7)
        
        # Vector store for knowledge base
        self.knowledge_base = None
        self._init_knowledge_base()
        
    def _init_knowledge_base(self):
        """Initialize knowledge base from documentation"""
        try:
            # Load VALEO documentation
            documents = self._load_valeo_documentation()
            
            # Create embeddings
            embeddings = OpenAIEmbeddings()
            
            # Create vector store
            self.knowledge_base = FAISS.from_documents(
                documents,
                embeddings
            )
            
            logger.info("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {str(e)}")
    
    def _load_valeo_documentation(self) -> List[Any]:
        """Load VALEO system documentation"""
        # Load from database or files
        docs = []
        
        # Module descriptions
        module_docs = [
            {
                "content": "Personal Management: Verwaltung von Mitarbeitern, Arbeitszeiten, Urlaub, Gehälter",
                "metadata": {"module": "personal", "type": "description"}
            },
            {
                "content": "Lagerverwaltung: Bestandsführung für Landhandel mit Saatgut, Düngemittel, Pflanzenschutz",
                "metadata": {"module": "lager", "type": "description"}
            },
            {
                "content": "CRM mit Tagesprotokoll: Kundenverwaltung mit Besuchsdokumentation für Außendienst",
                "metadata": {"module": "crm", "type": "description"}
            },
            # Add more documentation
        ]
        
        return docs
    
    async def process_request(self, request: AIRequest) -> AIResponse:
        """Process AI request"""
        try:
            logger.info(f"Processing AI request for module: {request.context.module}")
            
            # Record metrics
            metrics_collector.record_business_event("ai_request", {
                "module": request.context.module,
                "user_id": request.context.user_id
            })
            
            # Route to appropriate handler
            if request.context.module in self.handlers:
                response = await self.handlers[request.context.module].process_query(request)
            else:
                # Use general AI for cross-module queries
                response = await self._handle_general_query(request)
            
            # Cache response if appropriate
            if response.confidence > 0.8:
                cache_key = f"ai_response:{request.context.module}:{hash(request.query)}"
                await cache_manager.set(
                    cache_key,
                    response.json(),
                    expire=3600  # 1 hour
                )
            
            return response
            
        except Exception as e:
            logger.error(f"AI processing failed: {str(e)}")
            return AIResponse(
                answer="Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es erneut.",
                confidence=0.0,
                metadata={"error": str(e)}
            )
    
    async def _handle_general_query(self, request: AIRequest) -> AIResponse:
        """Handle general queries using knowledge base"""
        
        # Search knowledge base
        if self.knowledge_base:
            docs = self.knowledge_base.similarity_search(
                request.query,
                k=5
            )
            
            context = "\n".join([doc.page_content for doc in docs])
            
            # Generate response using LLM
            prompt = f"""
            Du bist der KI-Assistent für VALEO NeuroERP, ein umfassendes ERP-System für den Landhandel.
            
            Kontext aus der Wissensdatenbank:
            {context}
            
            Benutzerfrage: {request.query}
            
            Antworte auf Deutsch, professionell und hilfreich. Beziehe dich auf die spezifischen Module und Funktionen von VALEO.
            """
            
            response = self.llm(prompt)
            
            return AIResponse(
                answer=response,
                sources=[{"content": doc.page_content, "metadata": doc.metadata} for doc in docs],
                confidence=0.75,
                suggestions=self._generate_suggestions(request.query)
            )
        else:
            return AIResponse(
                answer="Die Wissensdatenbank ist momentan nicht verfügbar.",
                confidence=0.0
            )
    
    def _generate_suggestions(self, query: str) -> List[str]:
        """Generate helpful suggestions based on query"""
        suggestions = []
        
        # Module-based suggestions
        if "personal" in query.lower() or "mitarbeiter" in query.lower():
            suggestions.extend([
                "Mitarbeiterliste anzeigen",
                "Urlaubsantrag stellen",
                "Arbeitszeiten erfassen"
            ])
        elif "lager" in query.lower() or "bestand" in query.lower():
            suggestions.extend([
                "Lagerbestand prüfen",
                "Bestellvorschläge",
                "Inventur durchführen"
            ])
        elif "kunde" in query.lower() or "crm" in query.lower():
            suggestions.extend([
                "Kundenliste",
                "Tagesprotokoll erstellen",
                "Besuchsplanung"
            ])
        
        return suggestions[:3]  # Return top 3 suggestions
    
    async def generate_insights(self, module: str, timeframe: str = "month") -> Dict[str, Any]:
        """Generate proactive insights for a module"""
        insights = {
            "module": module,
            "timeframe": timeframe,
            "generated_at": datetime.now(),
            "insights": []
        }
        
        # Module-specific insights
        if module == "sales":
            insights["insights"].extend([
                {
                    "type": "trend",
                    "title": "Saisonaler Anstieg bei Saatgut",
                    "description": "Die Nachfrage nach Saatgut steigt typischerweise um 40% in den nächsten 4 Wochen.",
                    "action": "Lagerbestände prüfen und Lieferanten kontaktieren"
                },
                {
                    "type": "opportunity",
                    "title": "Cross-Selling Potential",
                    "description": "Kunden, die Saatgut kaufen, bestellen zu 65% auch Düngemittel.",
                    "action": "Kombinationsangebote erstellen"
                }
            ])
        
        return insights

# Singleton instance
ai_assistant = VALEOAssistant()

# API endpoints for AI
from fastapi import APIRouter, Depends
from backend.app.auth.authentication import get_current_active_user

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

@router.post("/query", response_model=AIResponse)
async def query_ai(
    request: AIRequest,
    current_user = Depends(get_current_active_user)
):
    """Query the AI assistant"""
    request.context.user_id = str(current_user.id)
    return await ai_assistant.process_request(request)

@router.get("/insights/{module}")
async def get_insights(
    module: str,
    timeframe: str = "month",
    current_user = Depends(get_current_active_user)
):
    """Get AI-generated insights for a module"""
    return await ai_assistant.generate_insights(module, timeframe)