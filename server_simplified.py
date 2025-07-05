import os
from dotenv import load_dotenv
from linkup.client import LinkupClient

load_dotenv()

# API-Schlüssel direkt setzen, falls er nicht in der Umgebung gefunden wird
API_KEY = os.environ.get("LINKUP_API_KEY", "aca0b877-88dd-4423-a35b-97de39012db9")

# Linkup Client initialisieren
client = LinkupClient(api_key=API_KEY)

def web_search(query: str) -> str:
    """Search the web for the given query."""
    try:
        print(f"Suche nach: {query}")
        search_response = client.search(
            query=query,
            depth="standard",  # "standard" or "deep"
            output_type="sourcedAnswer",  # "searchResults" or "sourcedAnswer" or "structured"
            structured_output_schema=None,  # must be filled if output_type is "structured"
        )
        print("Suche erfolgreich")
        return search_response
    except Exception as e:
        print(f"Fehler bei der Web-Suche: {str(e)}")
        return f"Fehler bei der Web-Suche: {str(e)}"

if __name__ == "__main__":
    # Beispiel-Abfrage
    query = input("Bitte geben Sie eine Suchanfrage ein: ")
    result = web_search(query)
    print("\nErgebnis:")
    print(result) 