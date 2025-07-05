import pytest
from pydantic import ValidationError
from backend.schemas.transaction import TransactionCreate

def test_valid_inventory_transaction():
    transaction = TransactionCreate(
        type='inventory',
        amount=50.0,
        direction='in',
        article_id='ART123',
        description='Wareneingang Artikel XYZ'
    )
    assert transaction.type == 'inventory'
    assert transaction.amount == 50.0
    assert transaction.article_id == 'ART123'

def test_inventory_requires_article_id():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='inventory',
            amount=50.0,
            direction='in'
        )
    assert 'Artikel-ID ist' in str(exc_info.value)

@pytest.mark.parametrize('direction', ['in', 'out'])
def test_inventory_directions(direction):
    transaction = TransactionCreate(
        type='inventory',
        amount=50.0,
        direction=direction,
        article_id='ART123'
    )
    assert transaction.direction == direction

def test_invalid_inventory_direction():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='inventory',
            amount=50.0,
            direction='invalid',
            article_id='ART123'
        )
    assert 'Richtung muss eine von' in str(exc_info.value)

def test_negative_amount_rejected():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='inventory',
            amount=-50.0,
            direction='in',
            article_id='ART123'
        )
    assert 'greater than' in str(exc_info.value)

def test_zero_amount_rejected():
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            type='inventory',
            amount=0.0,
            direction='in',
            article_id='ART123'
        )
    assert 'greater than' in str(exc_info.value)
