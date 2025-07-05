import os
import asyncio
import json
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.settings import Settings

class RAGWorkflow:
    def __init__(self):
        # API-Schlüssel aus lokaler Datei laden
        try:
            with open('../api_keys.local.json', 'r') as f:
                api_keys = json.load(f)
                os.environ["OPENAI_API_KEY"] = api_keys["API_KEYS"]["OPENAI_API_KEY"]
        except Exception as e:
            print(f"Fehler beim Laden der API-Keys: {e}")
            print("Bitte stelle sicher, dass die Datei api_keys.local.json existiert und einen gültigen OPENAI_API_KEY enthält.")
            return
        
        # LLM und Embedding-Modell initialisieren
        self.llm = OpenAI(model="gpt-3.5-turbo")
        self.embed_model = OpenAIEmbedding()
        
        # Globale Einstellungen konfigurieren
        Settings.llm = self.llm
        Settings.embed_model = self.embed_model
        
        self.index = None

    async def ingest_documents(self, directory):
        """Dokumente aus einem Verzeichnis laden und indexieren."""
        documents = SimpleDirectoryReader(directory).load_data()
        self.index = VectorStoreIndex.from_documents(documents=documents)
        return self.index

    async def query(self, query_text):
        """Eine Abfrage an den Index stellen."""
        if self.index is None:
            raise ValueError("Keine Dokumente wurden indexiert. Rufen Sie zuerst ingest_documents auf.")
        
        query_engine = self.index.as_query_engine()
        response = query_engine.query(query_text)
        return response

async def main():
    # RAG-Workflow initialisieren
    workflow = RAGWorkflow()
    
    # Dokumente laden
    await workflow.ingest_documents("data")
    
    # Abfrage durchführen
    result = await workflow.query("Was ist der empfohlene Ansatz für die Transaktionsverarbeitung?")
    
    # Antwort ausgeben
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
