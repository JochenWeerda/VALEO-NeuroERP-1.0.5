import pytest
from pydantic import ValidationError
from backend.schemas.transaction import TransactionCreate

def test_transaction_type_validation():
    with pytest.raises(ValidationError):
        TransactionCreate(
            type='invalid_type',
            amount=100.0,
            direction='in',
            account_id='ACC123'
        )
