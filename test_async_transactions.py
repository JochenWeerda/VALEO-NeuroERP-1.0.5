import pytest
from datetime import datetime
from backend.schemas.transaction import AsyncBatchResponse, BatchStatusResponse

def test_async_batch_submission():
    response = AsyncBatchResponse(
        batch_id='BATCH123',
        status='pending',
        total=100,
        message='Batch submitted successfully'
    )
    assert response.batch_id == 'BATCH123'
    assert response.status == 'pending'
    assert response.total == 100

@pytest.mark.parametrize('status', [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
])
def test_batch_status_transitions(status):
    now = datetime.now()
    response = BatchStatusResponse(
        batch_id='BATCH123',
        status=status,
        total=100,
        submitted_at=now,
        started_at=now if status != 'pending' else None,
        completed_at=now if status in ['completed', 'failed', 'cancelled'] else None,
        result={'processed': 100} if status == 'completed' else None,
        error='Processing failed' if status == 'failed' else None
    )
    assert response.status == status
    
    if status == 'pending':
        assert response.started_at is None
        assert response.completed_at is None
    elif status == 'processing':
        assert response.started_at is not None
        assert response.completed_at is None
    else:
        assert response.completed_at is not None

def test_batch_completion_with_results():
    now = datetime.now()
    response = BatchStatusResponse(
        batch_id='BATCH123',
        status='completed',
        total=100,
        submitted_at=now,
        started_at=now,
        completed_at=now,
        result={
            'processed': 100,
            'successful': 95,
            'failed': 5,
            'processing_time': 10.5
        },
        error=None
    )
    assert response.status == 'completed'
    assert response.result is not None
    assert response.result['processed'] == 100
    assert response.result['successful'] == 95
    assert response.error is None

def test_batch_failure_with_error():
    now = datetime.now()
    response = BatchStatusResponse(
        batch_id='BATCH123',
        status='failed',
        total=100,
        submitted_at=now,
        started_at=now,
        completed_at=now,
        result=None,
        error='Critical system error occurred'
    )
    assert response.status == 'failed'
    assert response.error == 'Critical system error occurred'
    assert response.result is None
