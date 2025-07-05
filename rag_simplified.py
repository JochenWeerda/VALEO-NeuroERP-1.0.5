import os
import asyncio
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()

# OpenAI API-Schlüssel aus lokaler Datei laden
try:
    with open('api_keys.local.json', 'r') as f:
        api_keys = json.load(f)
        OPENAI_API_KEY = api_keys["API_KEYS"]["OPENAI_API_KEY"]
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
except Exception as e:
    print(f"Fehler beim Laden der API-Keys: {e}")
    print("Bitte stelle sicher, dass die Datei api_keys.local.json existiert und einen gültigen OPENAI_API_KEY enthält.")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    if not OPENAI_API_KEY:
        print("Kein API-Schlüssel gefunden. Bitte setze den OPENAI_API_KEY in der Umgebung oder in api_keys.local.json.")

class RAGWorkflow:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = None
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        
        # Angepasstes Template für bessere Antworten
        self.template = """
        Du bist ein hilfreicher Assistent, der Fragen basierend auf den gegebenen Kontext beantwortet.
        
        Kontext: {context}
        
        Frage: {question}
        
        Bitte antworte nur basierend auf dem gegebenen Kontext. Wenn die Antwort nicht im Kontext enthalten ist, 
        sage "Ich kann diese Frage nicht basierend auf dem verfügbaren Kontext beantworten."
        
        Antwort:
        """
        
        self.prompt = PromptTemplate(
            template=self.template,
            input_variables=["context", "question"]
        )
    
    async def ingest_documents(self, data_dir):
        """Dokumente aus dem Verzeichnis laden und indexieren"""
        try:
            # Prüfen, ob das Verzeichnis existiert
            if not os.path.exists(data_dir):
                print(f"Verzeichnis {data_dir} existiert nicht.")
                return
            
            documents = []
            # Alle .txt Dateien im Verzeichnis laden
            for filename in os.listdir(data_dir):
                if filename.endswith('.txt'):
                    file_path = os.path.join(data_dir, filename)
                    print(f"Lade Dokument: {file_path}")
                    loader = TextLoader(file_path)
                    documents.extend(loader.load())
            
            if not documents:
                print("Keine Dokumente gefunden.")
                return
            
            # Text in kleinere Chunks aufteilen
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            chunks = text_splitter.split_documents(documents)
            print(f"{len(chunks)} Chunks erstellt.")
            
            # Vektorindex erstellen
            self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
            print("Vektorindex erstellt.")
            
        except Exception as e:
            print(f"Fehler beim Laden der Dokumente: {str(e)}")
    
    async def query(self, question):
        """Eine Frage an das RAG-System stellen"""
        if not self.vectorstore:
            return "Keine Dokumente geladen. Bitte zuerst Dokumente indexieren."
        
        try:
            # Retrieval-Chain erstellen
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(),
                chain_type_kwargs={"prompt": self.prompt}
            )
            
            # Frage beantworten
            result = qa_chain.invoke({"query": question})
            return result["result"]
            
        except Exception as e:
            return f"Fehler bei der Abfrage: {str(e)}"

async def main():
    # RAG-Workflow initialisieren
    rag = RAGWorkflow()
    
    # Dokumente laden
    print("Lade Dokumente...")
    await rag.ingest_documents("data")
    
    # Interaktive Abfrage
    while True:
        query = input("\nBitte geben Sie eine Frage ein (oder 'exit' zum Beenden): ")
        if query.lower() == 'exit':
            break
        
        print("Bearbeite Anfrage...")
        response = await rag.query(query)
        print("\nAntwort:")
        print(response)

if __name__ == "__main__":
    asyncio.run(main()) 