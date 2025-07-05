import pytest
from pydantic import ValidationError
from backend.schemas.transaction import TransactionCreate

@pytest.mark.parametrize('test_input,expected_error', [
    # Invalid type
    ({
        'type': 'invalid_type',
        'amount': 100.0,
        'direction': 'in',
        'account_id': 'ACC123'
    }, 'Typ muss einer von'),
    # Invalid direction
    ({
        'type': 'financial',
        'amount': 100.0,
        'direction': 'invalid_direction',
        'account_id': 'ACC123'
    }, 'Richtung muss eine von')
])
def test_transaction_validations(test_input, expected_error):
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(**test_input)
    assert expected_error in str(exc_info.value)

def test_financial_transaction_requires_account_id():
    transaction = TransactionCreate(
        type='financial',
        amount=100.0,
        direction='in',
        account_id='ACC123'
    )
    assert transaction.account_id == 'ACC123'
    assert transaction.type == 'financial'
