"""
Beispiel für die Verwendung der VALEO-NeuroERP Vektorsuche
"""

import numpy as np
from datetime import datetime
import requests
import json
from typing import List, Dict, Any

def generate_sample_embedding(dim: int = 1536) -> List[float]:
    """Generiert ein Beispiel-Embedding für Testzwecke."""
    return list(np.random.randn(dim).astype(float))

def create_test_document(
    title: str,
    content: str,
    doc_type: str = "technical",
    metadata: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Erstellt ein Testdokument mit Embedding.
    
    Args:
        title: Titel des Dokuments
        content: Inhalt des Dokuments
        doc_type: Dokumententyp
        metadata: Zusätzliche Metadaten
    
    Returns:
        Dict mit Dokumentendaten
    """
    return {
        "title": title,
        "content": content,
        "doc_type": doc_type,
        "embedding": generate_sample_embedding(),
        "metadata": metadata or {}
    }

def main():
    """Hauptfunktion für das Beispiel."""
    # API-Basis-URL
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Erstelle einige Testdokumente
    test_docs = [
        create_test_document(
            title="Technische Spezifikation",
            content="Dies ist eine technische Spezifikation für...",
            metadata={"author": "Max Mustermann", "department": "Engineering"}
        ),
        create_test_document(
            title="Architektur-Dokument",
            content="Die Systemarchitektur besteht aus...",
            metadata={"author": "Anna Schmidt", "department": "Architecture"}
        ),
        create_test_document(
            title="API-Dokumentation",
            content="Die REST-API unterstützt folgende Endpunkte...",
            metadata={"author": "Tom Weber", "department": "Development"}
        )
    ]
    
    print("1. Dokumente erstellen:")
    created_docs = []
    for doc in test_docs:
        try:
            response = requests.post(f"{base_url}/documents/", json=doc)
            response.raise_for_status()
            created_doc = response.json()
            created_docs.append(created_doc)
            print(f"✓ Dokument '{created_doc['title']}' erstellt (ID: {created_doc['id']})")
        except Exception as e:
            print(f"✗ Fehler beim Erstellen des Dokuments: {str(e)}")
    
    print("\n2. Ähnlichkeitssuche durchführen:")
    # Verwende das Embedding des ersten Dokuments als Beispiel-Query
    search_query = {
        "query_embedding": test_docs[0]["embedding"],
        "filter_criteria": {"doc_type": "technical"},
        "limit": 5
    }
    
    try:
        response = requests.post(f"{base_url}/documents/search/", json=search_query)
        response.raise_for_status()
        results = response.json()
        
        print("\nSuchergebnisse:")
        for idx, doc in enumerate(results, 1):
            print(f"\n{idx}. Treffer:")
            print(f"   Titel: {doc['title']}")
            print(f"   Ähnlichkeit: {doc.get('similarity_score', 'N/A'):.3f}")
            print(f"   Autor: {doc.get('metadata', {}).get('author', 'Unbekannt')}")
            
    except Exception as e:
        print(f"✗ Fehler bei der Suche: {str(e)}")
    
    print("\n3. Index neu aufbauen:")
    try:
        response = requests.post(f"{base_url}/documents/rebuild-index/")
        response.raise_for_status()
        print("✓ Index erfolgreich neu aufgebaut")
    except Exception as e:
        print(f"✗ Fehler beim Neuaufbau des Index: {str(e)}")

if __name__ == "__main__":
    main() 