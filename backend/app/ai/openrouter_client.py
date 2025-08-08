"""
VALEO NeuroERP 2.0 - OpenRouter Client für Horizon Beta
Integration mit dem Horizon Beta LLM über OpenRouter
Serena Quality: Complete OpenRouter integration with error handling
"""
import asyncio
import json
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
import logging
from openai import OpenAI

from backend.app.monitoring.logging_config import get_logger
from backend.app.monitoring.metrics import metrics_collector

logger = get_logger("ai.openrouter")

class OpenRouterConfig(BaseModel):
    api_key: str = "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"
    base_url: str = "https://openrouter.ai/api/v1"
    model: str = "openrouter/horizon-beta"
    max_tokens: int = 4000
    temperature: float = 0.7
    timeout: int = 30

class OpenRouterMessage(BaseModel):
    role: str
    content: str

class OpenRouterRequest(BaseModel):
    model: str
    messages: List[OpenRouterMessage]
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    stream: bool = False
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[str] = None

class OpenRouterResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

class OpenRouterClient:
    def __init__(self, config: OpenRouterConfig):
        self.config = config
        self.client = OpenAI(
            base_url=config.base_url,
            api_key=config.api_key
        )

    async def chat_completion(
        self,
        messages: List[OpenRouterMessage],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        stream: bool = False
    ) -> OpenRouterResponse:
        """Chat completion using OpenAI client format"""
        try:
            # Convert Pydantic messages to dict format
            messages_dict = [{"role": msg.role, "content": msg.content} for msg in messages]
            
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://valeo-neuroerp.com",
                    "X-Title": "VALEO NeuroERP 2.0"
                },
                extra_body={},
                model=self.config.model,
                messages=messages_dict,
                max_tokens=max_tokens or self.config.max_tokens,
                temperature=temperature or self.config.temperature,
                stream=stream
            )
            
            if stream:
                return completion
            else:
                # Convert to our response format
                return OpenRouterResponse(
                    id=completion.id,
                    object=completion.object,
                    created=int(completion.created),
                    model=completion.model,
                    choices=[{
                        "index": choice.index,
                        "message": {
                            "role": choice.message.role,
                            "content": choice.message.content
                        },
                        "finish_reason": choice.finish_reason
                    } for choice in completion.choices],
                    usage={
                        "prompt_tokens": completion.usage.prompt_tokens,
                        "completion_tokens": completion.usage.completion_tokens,
                        "total_tokens": completion.usage.total_tokens
                    }
                )
                
        except Exception as e:
            logger.error(f"OpenRouter chat completion error: {str(e)}")
            raise

    async def stream_chat_completion(
        self,
        messages: List[OpenRouterMessage],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ):
        """Streaming chat completion"""
        try:
            messages_dict = [{"role": msg.role, "content": msg.content} for msg in messages]
            
            stream = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://valeo-neuroerp.com",
                    "X-Title": "VALEO NeuroERP 2.0"
                },
                extra_body={},
                model=self.config.model,
                messages=messages_dict,
                max_tokens=max_tokens or self.config.max_tokens,
                temperature=temperature or self.config.temperature,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield {
                        "content": chunk.choices[0].delta.content,
                        "model": chunk.model,
                        "created": int(chunk.created)
                    }
                    
        except Exception as e:
            logger.error(f"OpenRouter streaming error: {str(e)}")
            raise

class HorizonBetaAssistant:
    def __init__(self):
        self.config = OpenRouterConfig()
        self.client = OpenRouterClient(self.config)
        self.system_prompts = {
            "valeo_general": """Du bist der KI-Assistent für VALEO NeuroERP, ein umfassendes ERP-System für den Landhandel.
            Du hilfst bei allen Fragen zu Personal, Lager, CRM, Finanzen und anderen Geschäftsprozessen.
            Antworte auf Deutsch, professionell und hilfreich.""",
            "valeo_warehouse": """Du bist der Lager-Experte für VALEO NeuroERP.
            Du kennst dich aus mit Saatgut, Düngemittel, Pflanzenschutz und Lagerverwaltung.
            Gib praktische Ratschläge für den Landhandel.""",
            "valeo_crm": """Du bist der CRM-Experte für VALEO NeuroERP.
            Du hilfst bei Kundenverwaltung, Tagesprotokollen und Außendienst.
            Fokussiere auf Landhandel-spezifische Kundenbeziehungen.""",
            "valeo_finance": """Du bist der Finanz-Experte für VALEO NeuroERP.
            Du kennst dich aus mit Buchhaltung, Rechnungen und Finanzplanung.
            Gib präzise finanzielle Ratschläge.""",
            "valeo_form_optimization": """Du bist der UIX-Experte für VALEO NeuroERP Formulare.
            Du optimierst Benutzeroberflächen für maximale Benutzerfreundlichkeit.
            Fokussiere auf:
            - Intuitive Navigation
            - Klare Validierung
            - Automatische Vervollständigung
            - Responsive Design
            - Accessibility
            - Performance-Optimierung
            Antworte mit konkreten Code-Beispielen und Best Practices."""
        }

    async def get_response(
        self,
        user_query: str,
        context: str = "valeo_general",
        max_tokens: int = 2000
    ) -> str:
        """Get response from Horizon Beta"""
        try:
            system_prompt = self.system_prompts.get(context, self.system_prompts["valeo_general"])
            
            messages = [
                OpenRouterMessage(role="system", content=system_prompt),
                OpenRouterMessage(role="user", content=user_query)
            ]
            
            response = await self.client.chat_completion(
                messages=messages,
                max_tokens=max_tokens
            )
            
            return response.choices[0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Horizon Beta response error: {str(e)}")
            return f"Entschuldigung, ein Fehler ist aufgetreten: {str(e)}"

    async def get_streaming_response(
        self,
        user_query: str,
        context: str = "valeo_general",
        max_tokens: int = 2000
    ):
        """Get streaming response from Horizon Beta"""
        try:
            system_prompt = self.system_prompts.get(context, self.system_prompts["valeo_general"])
            
            messages = [
                OpenRouterMessage(role="system", content=system_prompt),
                OpenRouterMessage(role="user", content=user_query)
            ]
            
            async for chunk in self.client.stream_chat_completion(
                messages=messages,
                max_tokens=max_tokens
            ):
                yield chunk
                
        except Exception as e:
            logger.error(f"Horizon Beta streaming error: {str(e)}")
            yield {"content": f"Fehler: {str(e)}", "model": "horizon-beta"}

    async def optimize_form_ui(
        self,
        form_type: str,
        current_code: str,
        requirements: str = ""
    ) -> Dict[str, Any]:
        """Optimize form UI using Horizon Beta"""
        try:
            prompt = f"""
            Optimiere das folgende React/TypeScript Formular für VALEO NeuroERP:
            
            Formular-Typ: {form_type}
            Aktueller Code: {current_code}
            Anforderungen: {requirements}
            
            Bitte optimiere für:
            1. Bessere UX/UI
            2. Accessibility
            3. Performance
            4. Responsive Design
            5. Validierung
            6. Keyboard Navigation
            7. Auto-Save
            8. Error Handling
            
            Gib den optimierten Code zurück.
            """
            
            optimized_code = await self.get_response(
                user_query=prompt,
                context="valeo_form_optimization",
                max_tokens=4000
            )
            
            return {
                "optimized_code": optimized_code,
                "form_type": form_type,
                "model": "horizon-beta",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Form optimization error: {str(e)}")
            return {
                "error": str(e),
                "form_type": form_type,
                "model": "horizon-beta"
            }

horizon_beta_assistant = HorizonBetaAssistant()

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from backend.app.auth.authentication import get_current_active_user

router = APIRouter(prefix="/api/v1/horizon", tags=["horizon-beta"])

@router.post("/chat")
async def horizon_chat(
    query: str,
    context: str = "valeo_general",
    max_tokens: int = 2000,
    current_user = Depends(get_current_active_user)
):
    """Chat with Horizon Beta"""
    try:
        response = await horizon_beta_assistant.get_response(
            user_query=query,
            context=context,
            max_tokens=max_tokens
        )
        
        return {
            "response": response,
            "model": "horizon-beta",
            "context": context,
            "user_id": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def horizon_chat_stream(
    query: str,
    context: str = "valeo_general",
    max_tokens: int = 2000,
    current_user = Depends(get_current_active_user)
):
    """Streaming chat with Horizon Beta"""
    try:
        async def generate():
            async for chunk in horizon_beta_assistant.get_streaming_response(
                user_query=query,
                context=context,
                max_tokens=max_tokens
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-form")
async def optimize_form_ui(
    form_type: str,
    current_code: str,
    requirements: str = "",
    current_user = Depends(get_current_active_user)
):
    """Optimize form UI using Horizon Beta"""
    try:
        result = await horizon_beta_assistant.optimize_form_ui(
            form_type=form_type,
            current_code=current_code,
            requirements=requirements
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 