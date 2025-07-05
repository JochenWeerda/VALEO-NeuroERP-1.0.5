import pytest
from pydantic import ValidationError
from backend.schemas.transaction import TransactionCreate

def test_valid_transfer_transaction():
    transaction = TransactionCreate(
        type='transfer',
        amount=1000.0,
        direction='out',
        account_id='ACC123',
        target_account_id='ACC456',
        description='Interne Umbuchung'
    )
    assert transaction.type == 'transfer'
    assert transaction.amount == 1000.0
    assert transaction.account_id == 'ACC123'
    assert transaction.target_account_id == 'ACC456'

def test_transfer_requires_target_account():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='transfer',
            amount=1000.0,
            direction='out',
            account_id='ACC123'
        )
    assert 'Zielkonto-ID ist' in str(exc_info.value)

def test_transfer_same_account_rejected():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='transfer',
            amount=1000.0,
            direction='out',
            account_id='ACC123',
            target_account_id='ACC123'
        )
    assert 'Quell- und Zielkonto müssen unterschiedlich sein' in str(exc_info.value)

@pytest.mark.parametrize('direction', ['in', 'out'])
def test_transfer_directions(direction):
    transaction = TransactionCreate(
        type='transfer',
        amount=1000.0,
        direction=direction,
        account_id='ACC123',
        target_account_id='ACC456'
    )
    assert transaction.direction == direction

def test_invalid_transfer_direction():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='transfer',
            amount=1000.0,
            direction='invalid',
            account_id='ACC123',
            target_account_id='ACC456'
        )
    assert 'Richtung muss eine von' in str(exc_info.value)

def test_negative_amount_rejected():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='transfer',
            amount=-1000.0,
            direction='out',
            account_id='ACC123',
            target_account_id='ACC456'
        )
    assert 'greater than' in str(exc_info.value)
