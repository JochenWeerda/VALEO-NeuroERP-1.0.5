from typing import Optional
import grpc
from mcp_python_sdk import MCPClient, MCPRequest, MCPResponse
from backend.app.core.config import settings

class MCPManager:
    _instance: Optional['MCPManager'] = None
    _client: Optional[MCPClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MCPManager, cls).__new__(cls)
        return cls._instance
    
    async def initialize(self):
        """Initialisiert die MCP-Verbindung"""
        if self._client is None:
            channel = grpc.aio.insecure_channel(
                f"{settings.MCP_HOST}:{settings.MCP_PORT}"
            )
            self._client = MCPClient(channel)
    
    async def predict_demand(self, product_id: int, historical_data: list) -> dict:
        """Prognostiziert die Nachfrage für ein Produkt"""
        request = MCPRequest(
            model="demand_forecast",
            inputs={
                "product_id": product_id,
                "historical_data": historical_data
            }
        )
        response: MCPResponse = await self._client.predict(request)
        return response.outputs
    
    async def optimize_inventory(self, product_id: int, current_stock: int) -> dict:
        """Optimiert die Lagerbestände"""
        request = MCPRequest(
            model="inventory_optimization",
            inputs={
                "product_id": product_id,
                "current_stock": current_stock
            }
        )
        response: MCPResponse = await self._client.predict(request)
        return response.outputs
    
    async def analyze_customer_behavior(self, customer_id: int) -> dict:
        """Analysiert das Kundenverhalten"""
        request = MCPRequest(
            model="customer_analysis",
            inputs={"customer_id": customer_id}
        )
        response: MCPResponse = await self._client.predict(request)
        return response.outputs

async def setup_mcp_client():
    """Initialisiert den MCP-Client beim Start der Anwendung"""
    manager = MCPManager()
    await manager.initialize()
    return manager

# Singleton-Instanz für die Anwendung
mcp_manager = MCPManager() 