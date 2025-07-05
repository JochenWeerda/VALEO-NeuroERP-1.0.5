import os
import asyncio
import logging
import json
from dotenv import load_dotenv
from fastmcp import FastMCP
from linkup.client import LinkupClient
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Umgebungsvariablen laden
load_dotenv()

# API-Schlüssel aus lokaler Datei laden
try:
    with open('api_keys.local.json', 'r') as f:
        api_keys = json.load(f)
        LINKUP_API_KEY = api_keys["API_KEYS"].get("LINKUP_API_KEY", os.environ.get("LINKUP_API_KEY", ""))
        OPENAI_API_KEY = api_keys["API_KEYS"].get("OPENAI_API_KEY", os.environ.get("OPENAI_API_KEY", ""))
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
except Exception as e:
    logger.error(f"Fehler beim Laden der API-Keys: {e}")
    logger.warning("Verwende Umgebungsvariablen für API-Keys")
    LINKUP_API_KEY = os.environ.get("LINKUP_API_KEY", "")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

if not LINKUP_API_KEY or not OPENAI_API_KEY:
    logger.warning("API-Keys fehlen. Bitte stelle sicher, dass die Datei api_keys.local.json existiert oder die Umgebungsvariablen gesetzt sind.")

# Linkup Client initialisieren
linkup_client = LinkupClient(api_key=LINKUP_API_KEY)

# RAG-Workflow-Klasse
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
                logger.error(f"Verzeichnis {data_dir} existiert nicht.")
                return
            
            documents = []
            # Alle .txt Dateien im Verzeichnis laden
            for filename in os.listdir(data_dir):
                if filename.endswith('.txt'):
                    file_path = os.path.join(data_dir, filename)
                    logger.info(f"Lade Dokument: {file_path}")
                    loader = TextLoader(file_path)
                    documents.extend(loader.load())
            
            if not documents:
                logger.warning("Keine Dokumente gefunden.")
                return
            
            # Text in kleinere Chunks aufteilen
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            chunks = text_splitter.split_documents(documents)
            logger.info(f"{len(chunks)} Chunks erstellt.")
            
            # Vektorindex erstellen
            self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
            logger.info("Vektorindex erstellt.")
            
        except Exception as e:
            logger.error(f"Fehler beim Laden der Dokumente: {str(e)}")
    
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
            logger.error(f"Fehler bei der Abfrage: {str(e)}")
            return f"Fehler bei der Abfrage: {str(e)}"

# RAG-Workflow initialisieren
rag_workflow = RAGWorkflow()

# FastMCP-Server erstellen
app = FastMCP(name="valeo-neuroerp-mcp")

# Web-Suche-Tool definieren
@app.tool("web_search")
async def web_search(call):
    """Searches the web for information using Linkup API"""
    query = call.parameters.get("query")
    if not query:
        return {"error": "Query parameter is required"}
    
    try:
        logger.info(f"Web-Suche nach: {query}")
        search_response = linkup_client.search(
            query=query,
            depth="standard",
            output_type="sourcedAnswer",
            structured_output_schema=None,
        )
        logger.info("Web-Suche erfolgreich")
        return {"result": search_response}
    except Exception as e:
        error_msg = f"Fehler bei der Web-Suche: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# RAG-Query-Tool definieren
@app.tool("rag_query")
async def rag_query(call):
    """Queries local documents using RAG (Retrieval-Augmented Generation)"""
    question = call.parameters.get("question")
    if not question:
        return {"error": "Question parameter is required"}
    
    try:
        # Wenn noch keine Dokumente geladen sind, laden wir sie
        if not rag_workflow.vectorstore:
            logger.info("Lade Dokumente für RAG...")
            await rag_workflow.ingest_documents("data")
        
        # Frage beantworten
        logger.info(f"RAG-Abfrage: {question}")
        response = await rag_workflow.query(question)
        logger.info("RAG-Abfrage erfolgreich")
        return {"result": response}
    except Exception as e:
        error_msg = f"Fehler bei der RAG-Abfrage: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# Server starten
if __name__ == "__main__":
    # Dokumente für RAG laden
    asyncio.run(rag_workflow.ingest_documents("data"))
    
    # Server starten
    logger.info("Starte MCP-Server auf Port 8001...")
    app.run(transport="http", host="localhost", port=8001) 