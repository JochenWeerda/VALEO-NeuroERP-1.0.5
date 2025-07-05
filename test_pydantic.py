from pydantic import BaseModel

class SimpleModel(BaseModel):
    name: str
    value: int

def test_pydantic_model():
    model = SimpleModel(name='test', value=42)
    assert model.name == 'test'
    assert model.value == 42
