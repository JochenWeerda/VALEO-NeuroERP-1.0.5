"""
RAG-Service für das APM-Framework.
Implementiert Retrieval-Augmented Generation für die Unterstützung des CREATE-Modus.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime

from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG-Service für das APM-Framework.
    
    Implementiert Retrieval-Augmented Generation für:
    - Codegenerierung
    - Testfallgenerierung
    - Dokumentationsgenerierung
    - Entwurfsmusteranwendung
    """
    
    def __init__(self, mongodb_connector: APMMongoDBConnector, project_id: str):
        """
        Initialisiert den RAG-Service.
        
        Args:
            mongodb_connector: MongoDB-Connector für die Datenbankoperationen
            project_id: ID des Projekts
        """
        self.mongodb = mongodb_connector
        self.project_id = project_id
        
        # Collections für den RAG-Service
        self.rag_history_collection = "rag_history"
        self.rag_documents_collection = "rag_documents"
        self.rag_embeddings_collection = "rag_embeddings"
        
        logger.info(f"RAG-Service initialisiert für Projekt {project_id}")
    
    async def index_documents(self, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Indiziert Dokumente für den RAG-Service.
        
        Args:
            documents: Liste von Dokumenten mit den Feldern 'title', 'content' und optionalen Metadaten
            
        Returns:
            Liste der IDs der indizierten Dokumente
        """
        try:
            logger.info(f"Indiziere {len(documents)} Dokumente")
            
            # Dokumente in die RAG-Dokumente-Collection einfügen
            document_ids = await self.mongodb.insert_many(self.rag_documents_collection, documents)
            
            # Hier würde in einer vollständigen Implementierung die Berechnung von Embeddings erfolgen
            # und die Embeddings in die RAG-Embeddings-Collection eingefügt werden
            
            logger.info(f"{len(document_ids)} Dokumente indiziert")
            return document_ids
        except Exception as e:
            logger.error(f"Fehler beim Indizieren von Dokumenten: {str(e)}")
            raise
    
    async def search_similar_documents(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Sucht nach ähnlichen Dokumenten basierend auf einer Abfrage.
        
        Args:
            query: Abfragetext
            top_k: Anzahl der zurückzugebenden Dokumente
            
        Returns:
            Liste der ähnlichsten Dokumente
        """
        try:
            logger.info(f"Suche nach ähnlichen Dokumenten für Abfrage: {query}")
            
            # In einer vollständigen Implementierung würde hier eine semantische Suche erfolgen
            # Für diese Demo verwenden wir eine einfache Textsuche
            
            # Abfrage in Schlüsselwörter aufteilen
            keywords = query.lower().split()
            
            # Aggregation-Pipeline für die Textsuche
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"title": {"$regex": "|".join(keywords), "$options": "i"}},
                            {"content": {"$regex": "|".join(keywords), "$options": "i"}}
                        ]
                    }
                },
                {"$limit": top_k}
            ]
            
            # Ähnliche Dokumente finden
            documents = await self.mongodb.aggregate(self.rag_documents_collection, pipeline)
            
            logger.info(f"{len(documents)} ähnliche Dokumente gefunden")
            return documents
        except Exception as e:
            logger.error(f"Fehler bei der Suche nach ähnlichen Dokumenten: {str(e)}")
            return []
    
    async def rag_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Führt eine RAG-Abfrage durch.
        
        Args:
            query: Abfragetext
            context: Zusätzlicher Kontext für die Abfrage (optional)
            
        Returns:
            Ergebnis der RAG-Abfrage mit den Feldern 'response' und 'documents'
        """
        try:
            logger.info(f"RAG-Abfrage: {query}")
            
            # Ähnliche Dokumente suchen
            documents = await self.search_similar_documents(query)
            
            # In einer vollständigen Implementierung würde hier ein LLM verwendet werden,
            # um eine Antwort basierend auf den gefundenen Dokumenten zu generieren
            # Für diese Demo generieren wir eine einfache Antwort
            
            response = self._generate_mock_response(query, documents)
            
            # Abfrage in der RAG-History speichern
            history_entry = {
                "project_id": self.project_id,
                "query": query,
                "context": context,
                "documents": [doc["_id"] for doc in documents],
                "response": response,
                "timestamp": datetime.now()
            }
            
            await self.mongodb.insert_one(self.rag_history_collection, history_entry)
            
            result = {
                "response": response,
                "documents": documents
            }
            
            logger.info(f"RAG-Abfrage abgeschlossen")
            return result
        except Exception as e:
            logger.error(f"Fehler bei der RAG-Abfrage: {str(e)}")
            raise
    
    def _generate_mock_response(self, query: str, documents: List[Dict[str, Any]]) -> str:
        """
        Generiert eine Mock-Antwort für eine RAG-Abfrage.
        
        Args:
            query: Abfragetext
            documents: Liste der gefundenen Dokumente
            
        Returns:
            Generierte Antwort
        """
        # Einfache Mock-Antwort basierend auf der Abfrage und den gefundenen Dokumenten
        if "code" in query.lower() or "generiere" in query.lower():
            return """
            class ExampleComponent {
                constructor(props) {
                    this.state = {
                        data: props.initialData || []
                    };
                }
                
                getData() {
                    return this.state.data;
                }
                
                setData(newData) {
                    this.state.data = newData;
                    return this;
                }
                
                render() {
                    return `<div class="example-component">
                        <h2>Example Component</h2>
                        <ul>
                            ${this.state.data.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>`;
                }
            }
            """
        elif "test" in query.lower():
            return """
            describe('ExampleComponent', () => {
                let component;
                
                beforeEach(() => {
                    component = new ExampleComponent({
                        initialData: ['Item 1', 'Item 2']
                    });
                });
                
                it('should initialize correctly', () => {
                    expect(component).toBeDefined();
                    expect(component.getData()).toEqual(['Item 1', 'Item 2']);
                });
                
                it('should set data correctly', () => {
                    component.setData(['New Item']);
                    expect(component.getData()).toEqual(['New Item']);
                });
                
                it('should render correctly', () => {
                    const rendered = component.render();
                    expect(rendered).toContain('<h2>Example Component</h2>');
                    expect(rendered).toContain('<li>Item 1</li>');
                    expect(rendered).toContain('<li>Item 2</li>');
                });
            });
            """
        elif "muster" in query.lower() or "pattern" in query.lower():
            return """
            // Singleton-Muster
            class Singleton {
                constructor() {
                    if (Singleton.instance) {
                        return Singleton.instance;
                    }
                    
                    Singleton.instance = this;
                    this.data = {};
                }
                
                static getInstance() {
                    if (!Singleton.instance) {
                        Singleton.instance = new Singleton();
                    }
                    return Singleton.instance;
                }
                
                getData(key) {
                    return this.data[key];
                }
                
                setData(key, value) {
                    this.data[key] = value;
                }
            }
            """
        else:
            # Standardantwort
            return f"""
            Basierend auf Ihrer Anfrage "{query}" und den verfügbaren Informationen kann ich Folgendes vorschlagen:
            
            1. Analysieren Sie die Anforderungen sorgfältig
            2. Erstellen Sie einen modularen Entwurf
            3. Implementieren Sie testbare Komponenten
            4. Dokumentieren Sie die Implementierung
            5. Führen Sie Tests durch
            
            Für weitere Details konsultieren Sie die Projektdokumentation.
            """
    
    async def get_rag_history(self, limit: int = 10, skip: int = 0) -> List[Dict[str, Any]]:
        """
        Ruft die RAG-Abfragehistorie ab.
        
        Args:
            limit: Maximale Anzahl der zurückzugebenden Einträge
            skip: Anzahl der zu überspringenden Einträge
            
        Returns:
            Liste der RAG-Abfragehistorieneinträge
        """
        try:
            logger.info("Rufe RAG-Abfragehistorie ab")
            
            # RAG-Abfragehistorie abrufen
            history = await self.mongodb.find_many(
                self.rag_history_collection,
                {"project_id": self.project_id},
                sort_field="timestamp",
                sort_order=-1,
                limit=limit,
                skip=skip
            )
            
            logger.info(f"{len(history)} RAG-Abfragehistorieneinträge abgerufen")
            return history
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der RAG-Abfragehistorie: {str(e)}")
            return [] 