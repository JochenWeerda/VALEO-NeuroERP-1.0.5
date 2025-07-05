"""
Konfigurationsdatei für den automatisierten GENXAIS-Zyklus v1.2
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict
from enum import Enum

class PhaseType(str, Enum):
    VAN = "VAN"
    PLAN = "PLAN"
    CREATE = "CREATE"
    IMPLEMENTATION = "IMPLEMENTATION"
    REFLEKTION = "REFLEKTION"

class TriggerType(str, Enum):
    MANUAL = "manual"
    CRON = "cron"
    WEBHOOK = "webhook"

@dataclass
class MongoDBConfig:
    uri: str = "mongodb://localhost:27017"
    database: str = "genxais"
    collections: Dict[str, str] = field(default_factory=lambda: {
        "phases": "phases",
        "prompts": "prompts",
        "reviews": "reviews",
        "logs": "logs"
    })

@dataclass
class LangGraphConfig:
    endpoint: str = "http://localhost:8000"
    model: str = "gpt-4"
    temperature: float = 0.4
    max_tokens: int = 1200

@dataclass
class GraphitiConfig:
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    embedding_model: str = "text-embedding-3-small"

@dataclass
class StreamlitConfig:
    port: int = 8501
    title: str = "GENXAIS Cycle Manager"
    theme: Dict[str, str] = field(default_factory=lambda: {
        "primaryColor": "#FF4B4B",
        "backgroundColor": "#0E1117",
        "secondaryBackgroundColor": "#262730",
        "textColor": "#FAFAFA",
        "font": "sans serif"
    })

@dataclass
class CronConfig:
    enabled: bool = False
    interval: str = "*/15 * * * *"  # Alle 15 Minuten

@dataclass
class GenXAISConfig:
    mongodb: MongoDBConfig = field(default_factory=MongoDBConfig)
    langgraph: LangGraphConfig = field(default_factory=LangGraphConfig)
    graphiti: GraphitiConfig = field(default_factory=GraphitiConfig)
    streamlit: StreamlitConfig = field(default_factory=StreamlitConfig)
    cron: CronConfig = field(default_factory=CronConfig)
    phases: List[PhaseType] = field(default_factory=lambda: [
        PhaseType.VAN,
        PhaseType.PLAN,
        PhaseType.CREATE,
        PhaseType.IMPLEMENTATION,
        PhaseType.REFLEKTION
    ])
    current_phase: Optional[PhaseType] = None 