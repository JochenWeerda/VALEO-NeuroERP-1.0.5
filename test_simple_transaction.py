from backend.schemas.transaction import TransactionBase

def test_transaction_base_creation():
    transaction = TransactionBase(
        type='financial',
        amount=100.0,
        direction='in',
        account_id='ACC123'
    )
    assert transaction.type == 'financial'
    assert transaction.amount == 100.0
