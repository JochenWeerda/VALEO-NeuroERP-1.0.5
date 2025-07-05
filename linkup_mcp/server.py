import asyncio
import os
from dotenv import load_dotenv
from linkup import LinkupClient
from rag import RAGWorkflow
from mcp.server.fastmcp import FastMCP
from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict, Any, Optional

load_dotenv()

mcp = FastMCP('linkup-server')
client = LinkupClient()
rag_workflow = RAGWorkflow()

# MongoDB-Verbindung herstellen
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "valeo_neuroerp")

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[MONGODB_DB_NAME]
search_history_collection = db["search_history"]
rag_history_collection = db["rag_history"]

@mcp.tool()
def web_search(query: str, user_id: Optional[str] = None) -> str:
    """
    Sucht im Web nach Informationen und speichert die Ergebnisse in MongoDB.
    
    Args:
        query: Die Suchanfrage
        user_id: Optional. Die Benutzer-ID für die Nachverfolgung der Suchhistorie
    """
    start_time = datetime.now()
    
    # Suchanfrage ausführen
    search_response = client.search(
        query=query,
        depth="standard",  # "standard" oder "deep"
        output_type="sourcedAnswer",  # "searchResults" oder "sourcedAnswer" oder "structured"
        structured_output_schema=None,  # muss ausgefüllt sein, wenn output_type "structured" ist
    )
    
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)
    
    # Ergebnisse in MongoDB speichern
    search_history_item = {
        "user_id": user_id,
        "query": query,
        "response": search_response,
        "response_time_ms": response_time_ms,
        "timestamp": datetime.now()
    }
    
    search_history_collection.insert_one(search_history_item)
    
    return search_response

@mcp.tool()
async def rag_query(question: str, user_id: Optional[str] = None) -> str:
    """
    Stellt Fragen an lokale Dokumente mit RAG (Retrieval-Augmented Generation) und speichert die Ergebnisse in MongoDB.
    
    Args:
        question: Die Frage zu den Dokumenten
        user_id: Optional. Die Benutzer-ID für die Nachverfolgung der RAG-Abfragehistorie
    """
    start_time = datetime.now()
    
    # RAG-Abfrage ausführen
    response = await rag_workflow.query(question)
    
    end_time = datetime.now()
    response_time_ms = int((end_time - start_time).total_seconds() * 1000)
    
    # Ergebnisse in MongoDB speichern
    rag_history_item = {
        "user_id": user_id,
        "question": question,
        "response": str(response),
        "response_time_ms": response_time_ms,
        "timestamp": datetime.now()
    }
    
    rag_history_collection.insert_one(rag_history_item)
    
    return str(response)

@mcp.tool()
def get_search_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Ruft die Suchhistorie aus MongoDB ab.
    
    Args:
        user_id: Optional. Die Benutzer-ID zur Filterung der Suchhistorie
        limit: Die maximale Anzahl der zurückzugebenden Historieneinträge
    """
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    history = list(search_history_collection.find(
        query, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    
    return history

@mcp.tool()
def get_rag_history(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Ruft die RAG-Abfragehistorie aus MongoDB ab.
    
    Args:
        user_id: Optional. Die Benutzer-ID zur Filterung der RAG-Abfragehistorie
        limit: Die maximale Anzahl der zurückzugebenden Historieneinträge
    """
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    history = list(rag_history_collection.find(
        query, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    
    return history

if __name__ == "__main__":
    # Dokumente für RAG laden
    asyncio.run(rag_workflow.ingest_documents("data"))
    mcp.run(transport="stdio")










