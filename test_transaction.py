import pytest
from datetime import datetime
from backend.schemas.transaction import TransactionCreate

def test_transaction_create():
    transaction = TransactionCreate(
        type='financial',
        amount=100.0,
        direction='in',
        description='Test transaction',
        account_id='ACC123'
    )
    assert transaction.type == 'financial'
    assert transaction.amount == 100.0
    assert transaction.direction == 'in'
    assert transaction.description == 'Test transaction'
    assert transaction.account_id == 'ACC123'
