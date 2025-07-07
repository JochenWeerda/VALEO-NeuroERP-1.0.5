from typing import Any, Dict, Protocol
from abc import ABC, abstractmethod

class StepHandler(ABC):
    @abstractmethod
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Führt einen Workflow-Schritt aus"""
        pass

class PythonStepHandler(StepHandler):
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Führt Python-Code aus"""
        code = config.get("code")
        if not code:
            raise ValueError("No code provided")
            
        # Create context with dependencies
        context = {**dependencies}
        
        # Execute code
        exec(code, context)
        
        # Get result
        return context.get("result")

class HTTPStepHandler(StepHandler):
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Führt einen HTTP-Request aus"""
        import aiohttp
        
        url = config.get("url")
        method = config.get("method", "GET")
        headers = config.get("headers", {})
        data = config.get("data")
        
        if not url:
            raise ValueError("No URL provided")
            
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method,
                url,
                headers=headers,
                json=data
            ) as response:
                return await response.json()

class RAGStepHandler(StepHandler):
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Führt eine RAG-Operation aus"""
        from core.services.rag_service import RAGService
        
        operation = config.get("operation")
        if not operation:
            raise ValueError("No operation specified")
            
        rag = RAGService()
        
        if operation == "query":
            query = config.get("query")
            return await rag.query(query)
        elif operation == "index":
            documents = config.get("documents")
            return await rag.index(documents)
        else:
            raise ValueError(f"Unknown operation: {operation}")

class LangGraphStepHandler(StepHandler):
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Führt eine LangGraph-Operation aus"""
        from core.services.langgraph_service import LangGraphService
        
        graph_id = config.get("graph_id")
        input_data = config.get("input")
        
        if not graph_id:
            raise ValueError("No graph_id specified")
            
        langgraph = LangGraphService()
        return await langgraph.execute_graph(graph_id, input_data)

class LLMSuggestionStepHandler(StepHandler):
    async def execute(
        self,
        config: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Any:
        """Erzeugt einen KI-Vorschlag für den Workflow-Kontext"""
        from backend.app.core.llm.service import LLMService, LLMConfig
        prompt = config.get("prompt")
        system_prompt = config.get("system_prompt")
        llm_config = LLMConfig(**config.get("llm_config", {}))
        llm = LLMService(llm_config)
        result = await llm.generate(prompt, system_prompt)
        return result

def get_step_handler(step_type: str) -> StepHandler:
    """Gibt den Handler für einen Schritt-Typ zurück"""
    handlers = {
        "python": PythonStepHandler(),
        "http": HTTPStepHandler(),
        "rag": RAGStepHandler(),
        "langgraph": LangGraphStepHandler(),
        "llm_suggestion": LLMSuggestionStepHandler()
    }
    
    handler = handlers.get(step_type)
    if not handler:
        raise ValueError(f"Unknown step type: {step_type}")
        
    return handler 