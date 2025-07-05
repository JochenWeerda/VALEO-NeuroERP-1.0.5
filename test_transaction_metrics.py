import pytest
from backend.schemas.transaction import BatchMetricsResponse

def test_batch_metrics():
    metrics = BatchMetricsResponse(
        total_batches=1000,
        status_distribution={
            'pending': 100,
            'processing': 50,
            'completed': 800,
            'failed': 50
        },
        total_transactions=5000,
        completed_transactions=4000,
        failed_transactions=1000,
        completion_rate=80.0
    )
    assert metrics.total_batches == 1000
    assert sum(metrics.status_distribution.values()) == metrics.total_batches
    assert metrics.completion_rate == 80.0

def test_metrics_calculations():
    metrics = BatchMetricsResponse(
        total_batches=100,
        status_distribution={
            'completed': 80,
            'failed': 20
        },
        total_transactions=1000,
        completed_transactions=800,
        failed_transactions=200,
        completion_rate=80.0
    )
    assert metrics.total_batches == sum(metrics.status_distribution.values())
    assert metrics.total_transactions == metrics.completed_transactions + metrics.failed_transactions
    assert metrics.completion_rate == (metrics.completed_transactions / metrics.total_transactions) * 100

def test_empty_metrics():
    metrics = BatchMetricsResponse(
        total_batches=0,
        status_distribution={},
        total_transactions=0,
        completed_transactions=0,
        failed_transactions=0,
        completion_rate=0.0
    )
    assert metrics.total_batches == 0
    assert metrics.total_transactions == 0
    assert metrics.completion_rate == 0.0

def test_full_completion_metrics():
    metrics = BatchMetricsResponse(
        total_batches=100,
        status_distribution={
            'completed': 100
        },
        total_transactions=1000,
        completed_transactions=1000,
        failed_transactions=0,
        completion_rate=100.0
    )
    assert metrics.completion_rate == 100.0
    assert metrics.failed_transactions == 0
    assert metrics.total_transactions == metrics.completed_transactions
