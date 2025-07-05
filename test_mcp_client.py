from mcp import Client

# MCP-Client für den lokalen Server erstellen
client = Client(
    name="test-client",
    transport="http",
    host="localhost",
    port=8000
)

try:
    # Verbindung herstellen
    print("Verbinde mit MCP-Server...")
    client.connect()
    
    # Web-Suche durchführen
    print("Führe Web-Suche durch...")
    response = client.call("web_search", query="Was ist der aktuelle Bitcoin-Kurs?")
    print(f"Web-Suchergebnis: {response}")
    
finally:
    # Verbindung trennen
    print("Trenne Verbindung...")
    client.disconnect() 