import os
import asyncio
import logging
from datetime import datetime
from dotenv import load_dotenv
from fastmcp import FastMCP
from linkup.client import LinkupClient
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# MongoDB-Integration
from backend.mongodb_connector import MongoDBConnector
from backend.models.search_history import SearchQuery, SearchResult, SearchHistoryItem
from backend.models.search_history import RAGQueryHistoryItem, DocumentProcessingHistoryItem

# Logging konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Umgebungsvariablen laden
load_dotenv()

# API-Schlüssel und MongoDB-URI aus Umgebungsvariablen laden
LINKUP_API_KEY = os.environ.get("LINKUP_API_KEY", "aca0b877-88dd-4423-a35b-97de39012db9")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "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")
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

# Linkup Client initialisieren
linkup_client = LinkupClient(api_key=LINKUP_API_KEY)

# MongoDB-Connector initialisieren
mongodb = MongoDBConnector(connection_string=MONGODB_URI)

# RAG-Workflow-Klasse mit MongoDB-Integration
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
        
        # Collection-Namen für MongoDB
        self.rag_query_collection = "rag_query_history"
        self.document_processing_collection = "document_processing_history"
    
    async def ingest_documents(self, data_dir):
        """Dokumente aus dem Verzeichnis laden und indexieren"""
        try:
            # Prüfen, ob das Verzeichnis existiert
            if not os.path.exists(data_dir):
                logger.error(f"Verzeichnis {data_dir} existiert nicht.")
                return
            
            documents = []
            processed_documents = []
            
            # Alle .txt Dateien im Verzeichnis laden
            for filename in os.listdir(data_dir):
                if filename.endswith('.txt'):
                    file_path = os.path.join(data_dir, filename)
                    logger.info(f"Lade Dokument: {file_path}")
                    
                    # Startzeit für die Leistungsmessung
                    start_time = datetime.now()
                    
                    try:
                        loader = TextLoader(file_path)
                        docs = loader.load()
                        documents.extend(docs)
                        
                        # Verarbeitungszeit berechnen
                        processing_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                        
                        # Dokumentenverarbeitungshistorie speichern
                        doc_item = DocumentProcessingHistoryItem(
                            document_path=file_path,
                            document_type="text",
                            status="success",
                            processing_time_ms=processing_time_ms
                        )
                        
                        mongodb.insert_one(
                            self.document_processing_collection,
                            doc_item.to_mongo()
                        )
                        
                        processed_documents.append(file_path)
                        
                    except Exception as e:
                        # Fehler bei der Dokumentenverarbeitung
                        error_message = str(e)
                        logger.error(f"Fehler beim Laden von {file_path}: {error_message}")
                        
                        # Fehler in MongoDB speichern
                        processing_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                        doc_item = DocumentProcessingHistoryItem(
                            document_path=file_path,
                            document_type="text",
                            status="error",
                            error_message=error_message,
                            processing_time_ms=processing_time_ms
                        )
                        
                        mongodb.insert_one(
                            self.document_processing_collection,
                            doc_item.to_mongo()
                        )
            
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
            
            return processed_documents
            
        except Exception as e:
            logger.error(f"Fehler beim Laden der Dokumente: {str(e)}")
            return []
    
    async def query(self, question, user_id=None):
        """Eine Frage an das RAG-System stellen und in MongoDB speichern"""
        if not self.vectorstore:
            return "Keine Dokumente geladen. Bitte zuerst Dokumente indexieren."
        
        try:
            # Startzeit für die Leistungsmessung
            start_time = datetime.now()
            
            # Retrieval-Chain erstellen
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(),
                chain_type_kwargs={"prompt": self.prompt}
            )
            
            # Frage beantworten
            result = qa_chain.invoke({"query": question})
            answer = result["result"]
            
            # Antwortzeit berechnen
            response_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # RAG-Abfragehistorie in MongoDB speichern
            rag_item = RAGQueryHistoryItem(
                user_id=user_id,
                query=question,
                document_paths=[],  # Hier könnten wir die relevanten Dokumente speichern
                answer=answer,
                response_time_ms=response_time_ms
            )
            
            mongodb.insert_one(
                self.rag_query_collection,
                rag_item.to_mongo()
            )
            
            return answer
            
        except Exception as e:
            logger.error(f"Fehler bei der Abfrage: {str(e)}")
            return f"Fehler bei der Abfrage: {str(e)}"

# RAG-Workflow initialisieren
rag_workflow = RAGWorkflow()

# FastMCP-Server erstellen
app = FastMCP(name="valeo-neuroerp-mcp")

# Web-Suche-Tool mit MongoDB-Integration definieren
@app.tool("web_search")
async def web_search(call):
    """Searches the web for information using Linkup API and stores results in MongoDB"""
    query = call.parameters.get("query")
    user_id = call.parameters.get("user_id")
    search_type = call.parameters.get("search_type", "sourcedAnswer")
    language = call.parameters.get("language")
    region = call.parameters.get("region")
    time_period = call.parameters.get("time_period")
    
    if not query:
        return {"error": "Query parameter is required"}
    
    try:
        # Startzeit für die Leistungsmessung
        start_time = datetime.now()
        
        logger.info(f"Web-Suche nach: {query}")
        search_response = linkup_client.search(
            query=query,
            depth="standard",
            output_type=search_type,
            structured_output_schema=None,
        )
        
        # Antwortzeit berechnen
        response_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Suchanfrage und Ergebnisse für MongoDB aufbereiten
        search_query = SearchQuery(
            query=query,
            search_type=search_type,
            region=region,
            language=language,
            time_period=time_period
        )
        
        # Suchergebnisse extrahieren
        search_results = []
        
        if search_type == "sourcedAnswer" and "answer" in search_response:
            # Für sourcedAnswer-Typ
            answer = search_response["answer"]
            for source in search_response.get("sources", []):
                search_results.append(SearchResult(
                    title=source.get("title"),
                    snippet=source.get("snippet"),
                    url=source.get("url"),
                    source="linkup"
                ))
        elif "results" in search_response:
            # Für search-Typ
            for result in search_response["results"]:
                search_results.append(SearchResult(
                    title=result.get("title"),
                    snippet=result.get("snippet"),
                    url=result.get("url"),
                    source="linkup"
                ))
        
        # Suchhistorie-Eintrag erstellen
        search_history_item = SearchHistoryItem(
            user_id=user_id,
            query=search_query,
            results=search_results,
            response_time_ms=response_time_ms
        )
        
        # In MongoDB speichern
        mongodb.insert_one(
            "search_history",
            search_history_item.to_mongo()
        )
        
        logger.info("Web-Suche erfolgreich")
        return {"result": search_response}
    except Exception as e:
        error_msg = f"Fehler bei der Web-Suche: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# RAG-Query-Tool mit MongoDB-Integration definieren
@app.tool("rag_query")
async def rag_query(call):
    """Queries local documents using RAG (Retrieval-Augmented Generation) and stores results in MongoDB"""
    question = call.parameters.get("question")
    user_id = call.parameters.get("user_id")
    
    if not question:
        return {"error": "Question parameter is required"}
    
    try:
        # Wenn noch keine Dokumente geladen sind, laden wir sie
        if not rag_workflow.vectorstore:
            logger.info("Lade Dokumente für RAG...")
            await rag_workflow.ingest_documents("data")
        
        # Frage beantworten
        logger.info(f"RAG-Abfrage: {question}")
        response = await rag_workflow.query(question, user_id)
        logger.info("RAG-Abfrage erfolgreich")
        return {"result": response}
    except Exception as e:
        error_msg = f"Fehler bei der RAG-Abfrage: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# Tool für das Abrufen der Suchhistorie
@app.tool("get_search_history")
async def get_search_history(call):
    """Retrieves search history from MongoDB"""
    user_id = call.parameters.get("user_id")
    limit = call.parameters.get("limit", 10)
    
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        # Nach Zeitstempel absteigend sortieren
        results = mongodb.find_many(
            "search_history",
            query,
            limit=limit
        )
        
        return {"items": results, "count": len(results)}
    except Exception as e:
        error_msg = f"Fehler beim Abrufen der Suchhistorie: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# Tool für das Abrufen der RAG-Abfragehistorie
@app.tool("get_rag_history")
async def get_rag_history(call):
    """Retrieves RAG query history from MongoDB"""
    user_id = call.parameters.get("user_id")
    limit = call.parameters.get("limit", 10)
    
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        # Nach Zeitstempel absteigend sortieren
        results = mongodb.find_many(
            "rag_query_history",
            query,
            limit=limit
        )
        
        return {"items": results, "count": len(results)}
    except Exception as e:
        error_msg = f"Fehler beim Abrufen der RAG-Abfragehistorie: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# Tool für das Abrufen der Dokumentenverarbeitungshistorie
@app.tool("get_document_history")
async def get_document_history(call):
    """Retrieves document processing history from MongoDB"""
    user_id = call.parameters.get("user_id")
    status = call.parameters.get("status")
    limit = call.parameters.get("limit", 10)
    
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status
        
        # Nach Zeitstempel absteigend sortieren
        results = mongodb.find_many(
            "document_processing_history",
            query,
            limit=limit
        )
        
        return {"items": results, "count": len(results)}
    except Exception as e:
        error_msg = f"Fehler beim Abrufen der Dokumentenverarbeitungshistorie: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

# Server starten
if __name__ == "__main__":
    try:
        # Prüfen, ob MongoDB erreichbar ist
        logger.info("Prüfe MongoDB-Verbindung...")
        mongodb.get_collection("test").find_one({})
        logger.info("MongoDB-Verbindung erfolgreich")
        
        # Dokumente für RAG laden
        logger.info("Lade Dokumente für RAG...")
        asyncio.run(rag_workflow.ingest_documents("data"))
        
        # Server starten
        logger.info("Starte MCP-Server mit MongoDB-Integration auf Port 8001...")
        app.run(transport="http", host="localhost", port=8001)
    except Exception as e:
        logger.error(f"Fehler beim Starten des Servers: {str(e)}")
        if "MongoDB" in str(e):
            logger.error("Bitte stellen Sie sicher, dass MongoDB läuft und erreichbar ist.")
        raise 