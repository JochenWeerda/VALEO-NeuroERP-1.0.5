# Test file

"""
Unit-Tests für den Bulk-Processor
"""
import pytest
import asyncio
from datetime import datetime
from unittest.mock import Mock, patch
from backend.services.bulk_processor import BulkProcessor
from backend.models.transaction import Transaction
from backend.schemas.transaction import TransactionBulkCreate

@pytest.fixture
def bulk_processor():
    """Erstellt Test-Bulk-Processor"""
    processor = BulkProcessor(
        batch_size=100,
        max_wait_seconds=5
    )
    return processor

@pytest.mark.asyncio
async def test_batch_processing():
    """Test: Batch-Verarbeitung von Items"""
    processor = BulkProcessor(batch_size=3, max_wait_seconds=1)
    
    processed_items = []
    async def process_batch(items):
        processed_items.extend(items)
        return len(items)
    
    processor.set_batch_processor(process_batch)
    
    # Items zum Verarbeiten hinzufügen
    items = [f"item_{i}" for i in range(5)]
    for item in items:
        await processor.add_item(item)
    
    # Warten bis alle Items verarbeitet wurden
    await processor.wait_for_processing()
    
    assert len(processed_items) == 5
    assert processed_items == items

@pytest.mark.asyncio
async def test_batch_size():
    """Test: Batch-Größe wird eingehalten"""
    processor = BulkProcessor(batch_size=2, max_wait_seconds=5)
    
    batches = []
    async def process_batch(items):
        batches.append(items)
        return len(items)
    
    processor.set_batch_processor(process_batch)
    
    # 5 Items hinzufügen
    items = [f"item_{i}" for i in range(5)]
    for item in items:
        await processor.add_item(item)
    
    await processor.wait_for_processing()
    
    # Sollte 3 Batches geben: [2, 2, 1]
    assert len(batches) == 3
    assert len(batches[0]) == 2
    assert len(batches[1]) == 2
    assert len(batches[2]) == 1

@pytest.mark.asyncio
async def test_wait_timeout():
    """Test: Timeout bei max_wait_seconds"""
    processor = BulkProcessor(batch_size=5, max_wait_seconds=1)
    
    processed = []
    async def process_batch(items):
        processed.extend(items)
        return len(items)
    
    processor.set_batch_processor(process_batch)
    
    # 3 Items hinzufügen (weniger als batch_size)
    items = [f"item_{i}" for i in range(3)]
    for item in items:
        await processor.add_item(item)
    
    # Warten bis max_wait_seconds abgelaufen ist
    await asyncio.sleep(1.5)
    
    assert len(processed) == 3
    assert processed == items

@pytest.mark.asyncio
async def test_error_handling():
    """Test: Fehlerbehandlung"""
    processor = BulkProcessor(batch_size=2, max_wait_seconds=1)
    
    async def process_batch(items):
        raise Exception("Test error")
    
    processor.set_batch_processor(process_batch)
    
    # Items hinzufügen
    with pytest.raises(Exception) as exc:
        await processor.add_item("test_item")
        await processor.wait_for_processing()
    
    assert str(exc.value) == "Test error"

@pytest.mark.asyncio
async def test_concurrent_processing():
    """Test: Nebenläufige Verarbeitung"""
    processor = BulkProcessor(batch_size=2, max_wait_seconds=1)
    
    processed = []
    async def process_batch(items):
        await asyncio.sleep(0.1)  # Simuliere Verarbeitung
        processed.extend(items)
        return len(items)
    
    processor.set_batch_processor(process_batch)
    
    # Items parallel hinzufügen
    async def add_items(start, count):
        for i in range(start, start + count):
            await processor.add_item(f"item_{i}")
    
    # 2 Tasks erstellen die parallel Items hinzufügen
    tasks = [
        add_items(0, 3),
        add_items(3, 3)
    ]
    await asyncio.gather(*tasks)
    await processor.wait_for_processing()
    
    assert len(processed) == 6
    assert sorted(processed) == [f"item_{i}" for i in range(6)]