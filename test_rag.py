import os
import asyncio
from rag import RAGWorkflow

# API-Schlüssel setzen
os.environ["LINKUP_API_KEY"] = "aca0b877-88dd-4423-a35b-97de39012db9"

async def test_rag():
    # RAG-Workflow initialisieren
    rag_workflow = RAGWorkflow()
    
    # Dokumente aus dem data-Verzeichnis laden
    await rag_workflow.ingest_documents("data")
    
    # Abfrage durchführen
    query = "Was ist der empfohlene Ansatz für die Transaktionsverarbeitung?"
    response = await rag_workflow.query(query)
    
    print("Abfrage:", query)
    print("Antwort:", response)

if __name__ == "__main__":
    asyncio.run(test_rag()) 