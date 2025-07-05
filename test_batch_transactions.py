import pytest
from datetime import datetime
from backend.schemas.transaction import (
    TransactionBatchRequest,
    TransactionCreate,
    TransactionBatchResponse,
    BatchStatusResponse
)

def test_valid_batch_request():
    transactions = [
        TransactionCreate(
            type='financial',
            amount=100.0,
            direction='in',
            account_id='ACC123'
        ),
        TransactionCreate(
            type='inventory',
            amount=50.0,
            direction='out',
            article_id='ART456'
        )
    ]
    batch = TransactionBatchRequest(transactions=transactions)
    assert len(batch.transactions) == 2

def test_batch_response():
    response = TransactionBatchResponse(
        total=10,
        successful=8,
        failed=2,
        failed_transactions=[
            {'id': 'TX1', 'error': 'Insufficient funds'},
            {'id': 'TX2', 'error': 'Invalid account'}
        ],
        processing_time=1.5,
        success_rate=80.0
    )
    assert response.total == 10
    assert response.successful == 8
    assert response.failed == 2
    assert len(response.failed_transactions) == 2
    assert response.processing_time == 1.5
    assert response.success_rate == 80.0

def test_batch_status():
    now = datetime.now()
    status = BatchStatusResponse(
        batch_id='BATCH123',
        status='processing',
        total=100,
        submitted_at=now,
        started_at=now,
        completed_at=None,
        result=None,
        error=None
    )
    assert status.batch_id == 'BATCH123'
    assert status.status == 'processing'
    assert status.total == 100
    assert status.submitted_at == now
    assert status.started_at == now
    assert status.completed_at is None
    assert status.result is None
    assert status.error is None

def test_empty_batch_rejected():
    with pytest.raises(ValueError):
        TransactionBatchRequest(transactions=[])
