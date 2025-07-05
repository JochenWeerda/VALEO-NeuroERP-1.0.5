from pydantic import BaseModel, Field

class TestTransactionBase(BaseModel):
    type: str = Field(...)
    amount: float = Field(...)
    direction: str = Field(...)

def test_transaction_base():
    transaction = TestTransactionBase(
        type='financial',
        amount=100.0,
        direction='in'
    )
    assert transaction.type == 'financial'
    assert transaction.amount == 100.0
    assert transaction.direction == 'in'
