from linkup.client import LinkupClient

# API-Schlüssel direkt setzen
API_KEY = "aca0b877-88dd-4423-a35b-97de39012db9"

# Linkup Client initialisieren
client = LinkupClient(api_key=API_KEY)

try:
    # Web-Suche durchführen
    print("Führe Web-Suche durch...")
    search_response = client.search(
        query="Was ist der aktuelle Bitcoin-Kurs?",
        depth="standard",  # "standard" or "deep"
        output_type="sourcedAnswer",  # "searchResults" or "sourcedAnswer" or "structured"
        structured_output_schema=None,  # must be filled if output_type is "structured"
    )
    
    print(f"Web-Suchergebnis: {search_response}")
    
except Exception as e:
    print(f"Fehler bei der Web-Suche: {str(e)}") 