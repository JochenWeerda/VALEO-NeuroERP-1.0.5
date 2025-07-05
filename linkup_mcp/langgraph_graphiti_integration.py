"""
Integration von LangGraph mit Graphiti für den GENXAIS-Zyklus.
"""

import os
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from langchain_community.graphs import Neo4jGraph
from langchain.chains import GraphCypherQAChain
from graphiti_core import Graphiti
from graphiti_core.llm_client.openai_client import OpenAIClient
from graphiti_core.llm_client.config import LLMConfig
from graphiti_core.config import GraphitiConfig as GConfig
from dotenv import load_dotenv

from .config.genxais_cycle_config import GenXAISConfig, PhaseType
from .mongodb_connector import MongoDBConnector

# Lade Umgebungsvariablen
load_dotenv()

@dataclass
class WorkflowState:
    phase: PhaseType
    context: Dict[str, Any]
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class LangGraphGraphitiIntegration:
    def __init__(self, config: GenXAISConfig):
        self.config = config
        
        # Setze API-Keys und Zugangsdaten aus Umgebungsvariablen
        os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "your-api-key-here")
        
        self.mongodb = MongoDBConnector(
            uri=os.getenv("MONGODB_URI", config.mongodb.uri),
            db_name=config.mongodb.database
        )
        
        # Initialisiere Graphiti mit korrekter Konfiguration
        graphiti_config = GConfig(
            graph_uri=os.getenv("NEO4J_URI", config.graphiti.neo4j_uri),
            graph_user=os.getenv("NEO4J_USER", config.graphiti.neo4j_user),
            graph_password=os.getenv("NEO4J_PASSWORD", config.graphiti.neo4j_password),
            embedding_model=config.graphiti.embedding_model
        )
        
        self.graphiti = Graphiti(
            config=graphiti_config,
            llm_client=OpenAIClient(
                config=LLMConfig(
                    model=config.langgraph.model,
                    temperature=config.langgraph.temperature,
                    max_tokens=config.langgraph.max_tokens,
                    api_key=os.getenv("OPENAI_API_KEY", "your-api-key-here")
                )
            )
        )
        
        # Initialisiere Neo4j Graph für LangChain
        self.graph = Neo4jGraph(
            url=os.getenv("NEO4J_URI", config.graphiti.neo4j_uri),
            username=os.getenv("NEO4J_USER", config.graphiti.neo4j_user),
            password=os.getenv("NEO4J_PASSWORD", config.graphiti.neo4j_password)
        )
        
        self.qa_chain = GraphCypherQAChain.from_llm(
            llm=self.graphiti.llm_client,
            graph=self.graph,
            verbose=True
        )

    async def detect_last_phase(self) -> Optional[WorkflowState]:
        """Findet die letzte abgeschlossene Phase in MongoDB."""
        collection = self.mongodb.get_collection(self.config.mongodb.collections["phases"])
        last_phase = await collection.find_one(
            sort=[("timestamp", -1)]
        )
        
        if last_phase:
            return WorkflowState(
                phase=PhaseType(last_phase["phase"]),
                context=last_phase["context"],
                timestamp=last_phase["timestamp"]
            )
        return None

    async def extract_review(self, phase: PhaseType) -> str:
        """Holt den Review-Text für eine bestimmte Phase."""
        collection = self.mongodb.get_collection(self.config.mongodb.collections["reviews"])
        review = await collection.find_one({"phase": phase.value})
        return review["summary"] if review else ""

    async def generate_next_prompt(self, review_context: str, current_phase: PhaseType) -> str:
        """Generiert den Prompt für die nächste Phase."""
        # Nutze Graphiti für Kontext-Anreicherung
        query_result = await self.graphiti.query(
            f"Generiere einen Prompt für die Phase {current_phase.value} "
            f"basierend auf folgendem Review: {review_context}"
        )
        
        # Kombiniere Graphiti-Ergebnisse mit Neo4j-Wissen
        qa_result = await self.qa_chain.arun(
            question=f"Was sind die wichtigsten Aspekte für die Phase {current_phase.value}?"
        )
        
        # Generiere finalen Prompt
        prompt = f"""
        Phase: {current_phase.value}
        Kontext aus vorheriger Review: {review_context}
        
        Graphiti-Kontext: {query_result.generated_answer}
        Neo4j-Wissen: {qa_result}
        
        Aufgabe: Implementiere die nächsten Schritte für die {current_phase.value}-Phase.
        """
        
        return prompt

    async def store_prompt(self, phase: PhaseType, prompt: str):
        """Speichert den generierten Prompt in MongoDB."""
        collection = self.mongodb.get_collection(self.config.mongodb.collections["prompts"])
        await collection.insert_one({
            "phase": phase.value,
            "prompt": prompt,
            "status": "pending",
            "timestamp": datetime.now()
        })

    async def trigger_execution(self, phase: PhaseType):
        """Startet die LangGraph-Ausführung für eine Phase."""
        # TODO: Implementiere die tatsächliche LangGraph-Ausführung
        pass

    async def update_status(self, phase: PhaseType, status: str, message: str):
        """Aktualisiert den Status in der Logs-Collection."""
        collection = self.mongodb.get_collection(self.config.mongodb.collections["logs"])
        await collection.insert_one({
            "phase": phase.value,
            "status": status,
            "message": message,
            "timestamp": datetime.now()
        }) 