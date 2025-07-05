from backend.schemas.transaction import TransactionCreate

try:
    TransactionCreate(
        type='financial',
        amount=100.0,
        direction='in'
    )
except Exception as e:
    print(str(e))
