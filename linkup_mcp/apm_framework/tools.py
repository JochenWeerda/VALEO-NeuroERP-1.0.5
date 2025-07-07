"""
Tools für APM Workflow
"""
from typing import Any, Callable, Dict, Optional
import asyncio

class Tool:
    """Repräsentiert ein Tool für den APM Workflow"""
    def __init__(
        self,
        name: str,
        func: Callable,
        description: str,
        return_direct: bool = False
    ):
        self.name = name
        self.func = func
        self.description = description
        self.return_direct = return_direct
        
    async def __call__(self, *args: Any, **kwargs: Any) -> Any:
        """Führt das Tool aus"""
        if asyncio.iscoroutinefunction(self.func):
            return await self.func(*args, **kwargs)
        return self.func(*args, **kwargs)
        
    def __repr__(self) -> str:
        return f"Tool(name='{self.name}', description='{self.description}')" 