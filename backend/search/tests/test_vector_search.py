"""
VALEO-NeuroERP Vector Search Tests
"""
import pytest
import numpy as np
from ..vector_search import vector_search

@pytest.fixture
async def setup_vector_search():
    """Vektorsuche für Tests vorbereiten"""
    await vector_search.initialize()
    yield vector_search
    # Aufräumen nach den Tests
    vector_search.index = None
    vector_search.tokenizer = None
    vector_search.model = None

@pytest.mark.asyncio
async def test_initialization(setup_vector_search):
    """Test der Initialisierung"""
    assert setup_vector_search.index is not None
    assert setup_vector_search.tokenizer is not None
    assert setup_vector_search.model is not None
    assert setup_vector_search.get_index_size() == 0

@pytest.mark.asyncio
async def test_embedding_creation(setup_vector_search):
    """Test der Embedding-Erstellung"""
    text = "Dies ist ein Testtext für das Embedding"
    embedding = setup_vector_search._get_embedding(text)
    
    assert isinstance(embedding, np.ndarray)
    assert embedding.shape == (1, setup_vector_search.config["dimension"])
    assert np.isclose(np.linalg.norm(embedding), 1.0)

@pytest.mark.asyncio
async def test_document_operations(setup_vector_search):
    """Test der Dokument-Operationen"""
    # Dokument hinzufügen
    doc_id = "test_doc_1"
    text = "Dies ist ein Testdokument für die Vektorsuche"
    await setup_vector_search.add_document(doc_id, text)
    assert setup_vector_search.get_index_size() == 1
    
    # Dokument suchen
    query = "Testdokument Vektorsuche"
    results = await setup_vector_search.search(query, k=1)
    assert len(results) == 1
    assert isinstance(results[0], tuple)
    assert len(results[0]) == 2
    assert results[0][0] == 0  # Erster Index
    assert results[0][1] > 0  # Positiver Score
    
    # Dokument aktualisieren
    new_text = "Dies ist ein aktualisiertes Testdokument"
    await setup_vector_search.update_document(0, new_text)
    assert setup_vector_search.get_index_size() == 1
    
    # Dokument löschen
    await setup_vector_search.delete_document(0)
    assert setup_vector_search.get_index_size() == 0

@pytest.mark.asyncio
async def test_multiple_documents(setup_vector_search):
    """Test mit mehreren Dokumenten"""
    # Dokumente hinzufügen
    docs = [
        ("doc1", "Das erste Testdokument über Äpfel"),
        ("doc2", "Das zweite Testdokument über Birnen"),
        ("doc3", "Das dritte Testdokument über Orangen"),
        ("doc4", "Ein Dokument über verschiedene Obstsorten")
    ]
    
    for doc_id, text in docs:
        await setup_vector_search.add_document(doc_id, text)
    
    assert setup_vector_search.get_index_size() == 4
    
    # Suche durchführen
    query = "Dokument Obst"
    results = await setup_vector_search.search(query, k=2)
    assert len(results) == 2
    
    # Scores überprüfen
    assert all(score > 0 for _, score in results)
    assert results[0][1] >= results[1][1]  # Scores sind absteigend sortiert

@pytest.mark.asyncio
async def test_index_persistence(setup_vector_search):
    """Test der Index-Persistenz"""
    # Dokument hinzufügen
    doc_id = "test_doc"
    text = "Ein Testdokument für die Persistenz"
    await setup_vector_search.add_document(doc_id, text)
    
    # Index speichern
    await setup_vector_search.save_index()
    
    # Neuen Index laden
    await setup_vector_search.load_index()
    assert setup_vector_search.get_index_size() == 1
    
    # Suche mit geladenem Index
    query = "Testdokument Persistenz"
    results = await setup_vector_search.search(query, k=1)
    assert len(results) == 1

@pytest.mark.asyncio
async def test_error_handling(setup_vector_search):
    """Test der Fehlerbehandlung"""
    # Test mit ungültigem Index
    with pytest.raises(Exception):
        await setup_vector_search.delete_document(999)
    
    # Test mit leerem Text
    with pytest.raises(Exception):
        await setup_vector_search.add_document("doc", "")
    
    # Test mit zu langem Text
    long_text = "x" * 10000
    with pytest.raises(Exception):
        await setup_vector_search.add_document("doc", long_text) 