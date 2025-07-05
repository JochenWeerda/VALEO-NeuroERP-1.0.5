import logging
from fastmcp import FastMCP

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# FastMCP-Server erstellen
app = FastMCP(name="test-server")

@app.tool("hello_world")
async def hello_world(call):
    """Returns a greeting message"""
    name = call.parameters.get("name", "World")
    return {"result": f"Hello, {name}!"}

if __name__ == "__main__":
    # Server starten
    logger.info("Starte Test-MCP-Server auf Port 8001...")
    app.run(transport="http", host="localhost", port=8001) 