"""
AI Service für VALERO-NeuroERP
"""
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
import logging
import openai
from transformers import pipeline
import numpy as np
from datetime import datetime, timedelta

from backend.db.session import get_session
from backend.cache_manager import cache_manager
from backend.core.config import settings

# Logger
logger = logging.getLogger("ai-service")

# FastAPI App
app = FastAPI(
    title="AI Service",
    description="AI Service für VALERO-NeuroERP",
    version="1.0.0"
)

class AIService:
    """AI Service Implementation"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.cache = cache_manager
        
        # OpenAI Setup
        openai.api_key = settings.OPENAI_API_KEY
        
        # Lokale Modelle laden
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="oliverguhr/german-sentiment-bert"
        )
        
        self.ner_model = pipeline(
            "ner",
            model="bert-base-german-cased"
        )
        
    async def analyze_text(
        self,
        text: str,
        analysis_type: str = "sentiment"
    ) -> Dict[str, Any]:
        """Text analysieren"""
        try:
            # Cache-Key erstellen
            cache_key = f"text_analysis:{analysis_type}:{hash(text)}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Analyse durchführen
            if analysis_type == "sentiment":
                result = self.sentiment_analyzer(text)[0]
            elif analysis_type == "ner":
                result = self.ner_model(text)
            else:
                raise ValueError(f"Unbekannter Analysetyp: {analysis_type}")
                
            # In Cache schreiben
            await self.cache.set(cache_key, result, ttl=3600)
            
            return result
            
        except Exception as e:
            logger.error(f"Fehler bei der Textanalyse: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def generate_text(
        self,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 0.7
    ) -> str:
        """Text generieren"""
        try:
            # Cache-Key erstellen
            cache_key = f"text_generation:{hash(prompt)}:{max_tokens}:{temperature}"
            
            # Aus Cache lesen
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
                
            # Text generieren
            response = await openai.Completion.acreate(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            result = response.choices[0].text.strip()
            
            # In Cache schreiben
            await self.cache.set(cache_key, result, ttl=3600)
            
            return result
            
        except Exception as e:
            logger.error(f"Fehler bei der Textgenerierung: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    async def analyze_transactions(
        self,
        transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Transaktionen analysieren"""
        try:
            # Anomalien erkennen
            anomalies = []
            
            for tx in transactions:
                # Statistische Analyse
                amount = tx.get("amount", 0)
                if abs(amount) > 10000:  # Große Beträge
                    anomalies.append({
                        "type": "large_amount",
                        "transaction": tx
                    })
                    
                # Zeitliche Analyse
                tx_time = datetime.fromisoformat(tx.get("timestamp"))
                if tx_time.hour < 6 or tx_time.hour > 22:  # Ungewöhnliche Zeit
                    anomalies.append({
                        "type": "unusual_time",
                        "transaction": tx
                    })
                    
            # Muster erkennen
            patterns = self._detect_patterns(transactions)
            
            return {
                "anomalies": anomalies,
                "patterns": patterns,
                "total_transactions": len(transactions),
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Fehler bei der Transaktionsanalyse: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Interner Serverfehler"
            )
            
    def _detect_patterns(
        self,
        transactions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Muster in Transaktionen erkennen"""
        patterns = []
        
        # Zeitliche Muster
        time_groups = {}
        for tx in transactions:
            tx_time = datetime.fromisoformat(tx.get("timestamp"))
            hour = tx_time.hour
            
            if hour not in time_groups:
                time_groups[hour] = []
            time_groups[hour].append(tx)
            
        # Häufige Zeiten identifizieren
        for hour, txs in time_groups.items():
            if len(txs) > len(transactions) * 0.2:  # >20% der Transaktionen
                patterns.append({
                    "type": "time_pattern",
                    "hour": hour,
                    "count": len(txs)
                })
                
        # Betrags-Muster
        amounts = [tx.get("amount", 0) for tx in transactions]
        mean = np.mean(amounts)
        std = np.std(amounts)
        
        # Cluster um den Mittelwert
        clusters = []
        current_cluster = []
        
        for amount in sorted(amounts):
            if not current_cluster:
                current_cluster.append(amount)
            elif abs(amount - np.mean(current_cluster)) < std:
                current_cluster.append(amount)
            else:
                if len(current_cluster) > 2:
                    clusters.append(current_cluster)
                current_cluster = [amount]
                
        # Cluster analysieren
        for cluster in clusters:
            patterns.append({
                "type": "amount_cluster",
                "mean": np.mean(cluster),
                "count": len(cluster)
            })
            
        return patterns
        
# Service Instance
async def get_ai_service(
    session: AsyncSession = Depends(get_session)
) -> AIService:
    return AIService(session)
    
# Routes
@app.post("/analyze/text", response_model=Dict[str, Any])
async def analyze_text(
    text: str,
    analysis_type: str = "sentiment",
    service: AIService = Depends(get_ai_service)
):
    """Text analysieren"""
    return await service.analyze_text(text, analysis_type)
    
@app.post("/generate/text", response_model=Dict[str, Any])
async def generate_text(
    prompt: str,
    max_tokens: int = 100,
    temperature: float = 0.7,
    service: AIService = Depends(get_ai_service)
):
    """Text generieren"""
    return {
        "text": await service.generate_text(
            prompt,
            max_tokens,
            temperature
        )
    }
    
@app.post("/analyze/transactions", response_model=Dict[str, Any])
async def analyze_transactions(
    transactions: List[Dict[str, Any]],
    service: AIService = Depends(get_ai_service)
):
    """Transaktionen analysieren"""
    return await service.analyze_transactions(transactions) 